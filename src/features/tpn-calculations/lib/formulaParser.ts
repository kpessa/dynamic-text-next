import * as exprEval from 'expr-eval'

export interface FormulaValidationResult {
  isValid: boolean
  error?: string
}

export interface FormulaContext {
  [key: string]: any
}

export class FormulaParser {
  private parser: typeof exprEval.Parser
  private allowedFunctions: Set<string>

  constructor() {
    this.parser = exprEval.Parser
    
    // Define allowed math functions
    this.allowedFunctions = new Set([
      'min', 'max', 'round', 'floor', 'ceil',
      'abs', 'sqrt', 'pow', 'exp', 'log',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan'
    ])
  }

  /**
   * Evaluate a formula expression with optional context variables
   */
  evaluate(
    formula: string,
    context: FormulaContext = {},
    defaults: FormulaContext = {}
  ): number {
    try {
      // Merge context with defaults
      const fullContext = { ...defaults, ...context }
      
      // Parse the expression
      const expr = this.parser.parse(formula)
      
      // Get all variables used in the expression
      const variables = expr.variables()
      
      // Check for undefined variables
      for (const variable of variables) {
        if (!this.hasVariable(variable, fullContext)) {
          throw new Error(`Undefined variable: ${variable}`)
        }
      }
      
      // Create safe evaluation context
      const safeContext = this.createSafeContext(fullContext)
      
      // Evaluate the expression
      const result = expr.evaluate(safeContext)
      
      // Ensure result is a number
      if (typeof result !== 'number') {
        throw new Error(`Expression did not evaluate to a number: ${result}`)
      }
      
      return result
    } catch (error: any) {
      // Enhance error messages
      if (error.message.includes('undefined variable')) {
        throw new Error(`Variable not found: ${error.message}`)
      }
      throw new Error(`Formula evaluation failed: ${error.message}`)
    }
  }

  /**
   * Validate a formula without evaluating it
   */
  validate(formula: string): FormulaValidationResult {
    try {
      // Try to parse the formula
      const expr = this.parser.parse(formula)
      
      // Check for unknown functions
      const functions = this.extractFunctions(formula)
      for (const func of functions) {
        if (!this.allowedFunctions.has(func) && !this.isBuiltInOperator(func)) {
          return {
            isValid: false,
            error: `Unknown function: ${func}`
          }
        }
      }
      
      // Check for basic syntax errors
      if (this.hasUnbalancedParentheses(formula)) {
        return {
          isValid: false,
          error: 'Unbalanced parentheses'
        }
      }
      
      if (this.hasInvalidOperators(formula)) {
        return {
          isValid: false,
          error: 'Invalid operator sequence'
        }
      }
      
      return { isValid: true }
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message
      }
    }
  }

  /**
   * Create a safe evaluation context with only allowed functions
   */
  private createSafeContext(context: FormulaContext): FormulaContext {
    const safeContext: FormulaContext = {}
    
    // Copy all variables from context
    for (const [key, value] of Object.entries(context)) {
      // Filter out functions and potentially dangerous values
      if (typeof value !== 'function' && 
          value !== null && 
          value !== undefined) {
        safeContext[key] = value
      } else if (value === null || value === undefined) {
        throw new Error(`Variable '${key}' is null or undefined`)
      }
    }
    
    // Add safe math functions
    safeContext.min = Math.min
    safeContext.max = Math.max
    safeContext.round = Math.round
    safeContext.floor = Math.floor
    safeContext.ceil = Math.ceil
    safeContext.abs = Math.abs
    safeContext.sqrt = Math.sqrt
    safeContext.pow = Math.pow
    safeContext.exp = Math.exp
    safeContext.log = Math.log
    safeContext.sin = Math.sin
    safeContext.cos = Math.cos
    safeContext.tan = Math.tan
    safeContext.asin = Math.asin
    safeContext.acos = Math.acos
    safeContext.atan = Math.atan
    
    // Add convert function placeholder (should be handled by engine)
    safeContext.convert = (value: number, from: string, to: string) => {
      // This is a placeholder - actual conversion is handled by FormulaEngine
      return value
    }
    
    // Add constants
    safeContext.PI = Math.PI
    safeContext.E = Math.E
    
    return safeContext
  }

  /**
   * Check if a variable exists in the context (including nested properties)
   */
  private hasVariable(variable: string, context: FormulaContext): boolean {
    // Handle nested properties (e.g., patient.weight)
    const parts = variable.split('.')
    let current = context
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return false
      }
    }
    
    return true
  }

  /**
   * Extract function names from a formula
   */
  private extractFunctions(formula: string): string[] {
    const functionPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g
    const matches = formula.match(functionPattern) || []
    return matches.map(match => match.replace(/\s*\(/, ''))
  }

  /**
   * Check if a string is a built-in operator
   */
  private isBuiltInOperator(str: string): boolean {
    // expr-eval handles these as operators, not functions
    return false
  }

  /**
   * Check for unbalanced parentheses
   */
  private hasUnbalancedParentheses(formula: string): boolean {
    let count = 0
    for (const char of formula) {
      if (char === '(') count++
      if (char === ')') count--
      if (count < 0) return true
    }
    return count !== 0
  }

  /**
   * Check for invalid operator sequences
   */
  private hasInvalidOperators(formula: string): boolean {
    // Check for consecutive operators (except unary minus)
    const invalidPatterns = [
      /\+\+/, /\*\*/, /\/\//, /\+\*/, /\+\//, 
      /\*\+/, /\*\//, /\/\+/, /\/\*/,
      /\(\)/, // Empty parentheses
      /\+\s*\+/, /\*\s*\*/, /\/\s*\//, // With spaces
    ]
    
    return invalidPatterns.some(pattern => pattern.test(formula))
  }
}