import { DEFAULT_TIMEOUT, MAX_TIMEOUT } from '@/entities/section/types';
import { createKPTNamespace } from '@/features/kpt-functions/lib/kptNamespace';

export interface EvaluationResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export interface EvaluationContext {
  [key: string]: unknown;
}

/**
 * Safely evaluate JavaScript code in a sandboxed environment
 * Uses Function constructor to create an isolated scope
 */
export function evaluateDynamicSection(
  code: string,
  context: EvaluationContext = {},
  timeout: number = DEFAULT_TIMEOUT
): EvaluationResult {
  const startTime = performance.now();
  
  // Validate timeout
  const safeTimeout = Math.min(Math.max(timeout, 0), MAX_TIMEOUT);
  
  try {
    // Create KPT namespace
    const kpt = createKPTNamespace();
    
    // Merge KPT namespace with context
    const fullContext = {
      ...context,
      kpt
    };
    
    // Create a sandboxed function with limited scope
    // Prevent access to global objects like window, document, etc.
    const sandboxedCode = `
      'use strict';
      // Block dangerous globals
      const window = undefined;
      const document = undefined;
      const process = undefined;
      const require = undefined;
      const module = undefined;
      const exports = undefined;
      const global = undefined;
      const XMLHttpRequest = undefined;
      const fetch = undefined;
      
      // User code
      ${code}
    `;
    
    // Create the function with context variables as parameters
    const contextKeys = Object.keys(fullContext);
    const contextValues = Object.values(fullContext);
    
    // Use Function constructor to create isolated function
    const func = new Function(...contextKeys, sandboxedCode);
    
    // Execute with timeout protection
    let result: unknown;
    let timedOut = false;
    
    // Simple timeout mechanism (in production, consider using Web Workers)
    const timeoutId = setTimeout(() => {
      timedOut = true;
    }, safeTimeout);
    
    try {
      // Execute the function with context values
      result = func(...contextValues);
      clearTimeout(timeoutId);
      
      if (timedOut) {
        throw new Error(`Code execution exceeded timeout of ${safeTimeout}ms`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
    
    const executionTime = performance.now() - startTime;
    
    // Convert result to string for display
    const output = formatOutput(result);
    
    return {
      success: true,
      output,
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    };
  }
}

/**
 * Format output value for display
 */
function formatOutput(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  
  if (value === null) {
    return 'null';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (Array.isArray(value)) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Array]';
    }
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Object]';
    }
  }
  
  if (typeof value === 'function') {
    return '[Function]';
  }
  
  return String(value);
}

/**
 * Interpolate variables in a text string
 * Supports ${variable} syntax
 */
export function interpolateVariables(
  text: string,
  variables: EvaluationContext
): string {
  // Add KPT namespace to variables
  const kpt = createKPTNamespace();
  const fullVariables = {
    ...variables,
    kpt
  };
  
  return text.replace(/\$\{([^}]+)\}/g, (match, expression) => {
    try {
      // Trim whitespace
      const trimmedExpression = expression.trim();
      
      // Check if it's a simple variable reference
      if (fullVariables.hasOwnProperty(trimmedExpression)) {
        return formatOutput(fullVariables[trimmedExpression]);
      }
      
      // Check if it's a KPT function call
      if (trimmedExpression.startsWith('kpt.')) {
        // Evaluate the KPT function call
        const func = new Function(...Object.keys(fullVariables), `return ${trimmedExpression}`);
        const result = func(...Object.values(fullVariables));
        
        // If result is a string (HTML from KPT functions), return it directly
        if (typeof result === 'string') {
          return result;
        }
        return formatOutput(result);
      }
      
      // If variable doesn't exist, return the original placeholder
      // Only try to evaluate if all required variables are present
      const variablePattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
      const requiredVars = trimmedExpression.match(variablePattern) || [];
      
      // Check if all required variables exist (skip 'kpt' since it's always available)
      for (const varName of requiredVars) {
        if (!fullVariables.hasOwnProperty(varName) && 
            varName !== 'true' && 
            varName !== 'false' && 
            varName !== 'null' && 
            varName !== 'undefined' &&
            varName !== 'kpt') {
          return match; // Return original if variable is missing
        }
      }
      
      // Try to evaluate as a simple expression
      // Allow property access, basic operations, and function calls
      const safeExpression = trimmedExpression
        .replace(/[^a-zA-Z0-9_.\s+\-*/(),'"`]/g, ''); // Allow more characters for KPT functions
      
      if (safeExpression !== trimmedExpression) {
        // Expression contains unsafe characters
        return match;
      }
      
      // Create a function to evaluate the expression
      const func = new Function(...Object.keys(fullVariables), `return ${trimmedExpression}`);
      const result = func(...Object.values(fullVariables));
      
      // If result is a string (HTML from KPT functions), return it directly
      if (typeof result === 'string') {
        return result;
      }
      return formatOutput(result);
    } catch {
      // If evaluation fails, return the original placeholder
      return match;
    }
  });
}

/**
 * Match output against expected value based on match type
 */
export function matchOutput(
  actual: string,
  expected: string,
  matchType: 'exact' | 'contains' | 'regex' | 'styles'
): boolean {
  switch (matchType) {
    case 'exact':
      return actual.trim() === expected.trim();
      
    case 'contains':
      return actual.includes(expected);
      
    case 'regex':
      try {
        const regex = new RegExp(expected);
        return regex.test(actual);
      } catch {
        return false;
      }
      
    case 'styles':
      // For styles matching, we'd need to parse and compare CSS/styles
      // This is a placeholder for future implementation
      return actual === expected;
      
    default:
      return false;
  }
}

/**
 * Run a test case against a dynamic section
 */
export function runTestCase(
  code: string,
  testVariables: EvaluationContext,
  expected: string,
  matchType: 'exact' | 'contains' | 'regex' | 'styles',
  timeout?: number
): {
  passed: boolean;
  actual: string;
  expected: string;
  error?: string;
  executionTime: number;
} {
  // KPT namespace is automatically added in evaluateDynamicSection
  const result = evaluateDynamicSection(code, testVariables, timeout);
  
  if (!result.success) {
    return {
      passed: false,
      actual: '',
      expected,
      error: result.error,
      executionTime: result.executionTime,
    };
  }
  
  const passed = matchOutput(result.output, expected, matchType);
  
  return {
    passed,
    actual: result.output,
    expected,
    executionTime: result.executionTime,
  };
}

/**
 * Validate that code is safe to execute
 * Returns null if safe, or an error message if unsafe
 */
export function validateCode(code: string): string | null {
  // Check for obvious dangerous patterns
  const dangerousPatterns = [
    /import\s+/,
    /require\s*\(/,
    /eval\s*\(/,
    /new\s+Function/,
    /\.constructor\s*\(/,
    /__proto__/,
    /prototype\s*\[/,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return `Code contains potentially dangerous pattern: ${pattern.source}`;
    }
  }
  
  // Check for infinite loops (basic detection)
  const loopPatterns = [
    /while\s*\(\s*true\s*\)/,
    /for\s*\(\s*;\s*;\s*\)/,
  ];
  
  for (const pattern of loopPatterns) {
    if (pattern.test(code)) {
      return 'Code may contain an infinite loop';
    }
  }
  
  return null;
}