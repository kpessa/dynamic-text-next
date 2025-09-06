export interface VariableContext {
  [key: string]: any
}

export interface ValidationResult {
  isValid: boolean
  missing: string[]
}

export class VariableResolver {
  /**
   * Resolve a variable path from context
   */
  resolve(
    path: string,
    context: VariableContext,
    defaults: VariableContext = {}
  ): any {
    // Try to resolve from context first
    const value = this.resolvePath(path, context)
    if (value !== undefined) {
      return value
    }
    
    // Fall back to defaults
    return this.resolvePath(path, defaults)
  }

  /**
   * Extract all variable names from a formula
   */
  extractVariables(formula: string): string[] {
    const variables = new Set<string>()
    
    // Remove function calls to avoid matching function names
    const withoutFunctions = this.removeFunctionCalls(formula)
    
    // Match variable patterns including nested properties and array indexes
    // Matches: word, word.word, word[0], word[0].word, etc.
    const variablePattern = /\b([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*|\[\d+\])*(?:\.[a-zA-Z_][a-zA-Z0-9_]*|\[\d+\])*)/g
    
    let match
    while ((match = variablePattern.exec(withoutFunctions)) !== null) {
      const variable = match[1]
      // Filter out common keywords and operators
      if (!this.isKeyword(variable)) {
        variables.add(variable)
      }
    }
    
    return Array.from(variables)
  }

  /**
   * Validate that all variables exist in context
   */
  validateVariables(
    variables: string[],
    context: VariableContext,
    defaults: VariableContext = {}
  ): ValidationResult {
    const missing: string[] = []
    
    for (const variable of variables) {
      const value = this.resolve(variable, context, defaults)
      if (value === undefined) {
        missing.push(variable)
      }
    }
    
    return {
      isValid: missing.length === 0,
      missing
    }
  }

  /**
   * Merge multiple contexts (later contexts override earlier ones)
   */
  mergeContexts(...contexts: VariableContext[]): VariableContext {
    const result: VariableContext = {}
    
    for (const context of contexts) {
      this.deepMerge(result, context)
    }
    
    return result
  }

  /**
   * Resolve a path like "patient.weight" or "values[0]" from an object
   */
  private resolvePath(path: string, obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return undefined
    }
    
    // Parse the path to handle both dot notation and array indexes
    const segments = this.parsePath(path)
    let current = obj
    
    for (const segment of segments) {
      if (current === null || current === undefined) {
        return undefined
      }
      
      if (segment.type === 'property') {
        current = current[segment.key]
      } else if (segment.type === 'index') {
        const index = parseInt(segment.key, 10)
        if (Array.isArray(current)) {
          // Handle negative indexes (return undefined for out of bounds)
          if (index < 0 || index >= current.length) {
            return undefined
          }
          current = current[index]
        } else {
          return undefined
        }
      }
    }
    
    return current
  }

  /**
   * Parse a path into segments
   */
  private parsePath(path: string): Array<{ type: 'property' | 'index', key: string }> {
    const segments: Array<{ type: 'property' | 'index', key: string }> = []
    
    // Rebuild the path parsing
    let currentPath = path
    while (currentPath.length > 0) {
      if (currentPath[0] === '.') {
        currentPath = currentPath.substring(1)
        continue
      }
      
      // Check for array index (including negative numbers)
      const indexMatch = currentPath.match(/^\[(-?\d+)\]/)
      if (indexMatch) {
        segments.push({ type: 'index', key: indexMatch[1] })
        currentPath = currentPath.substring(indexMatch[0].length)
        continue
      }
      
      // Check for property
      const propMatch = currentPath.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/)
      if (propMatch) {
        segments.push({ type: 'property', key: propMatch[1] })
        currentPath = currentPath.substring(propMatch[0].length)
        continue
      }
      
      // Skip any other character
      currentPath = currentPath.substring(1)
    }
    
    return segments
  }

  /**
   * Remove function calls from formula to avoid matching function names as variables
   */
  private removeFunctionCalls(formula: string): string {
    // Common math functions to remove
    const functions = [
      'min', 'max', 'round', 'floor', 'ceil',
      'abs', 'sqrt', 'pow', 'exp', 'log',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan'
    ]
    
    let result = formula
    for (const func of functions) {
      // Replace function calls with spaces but keep the arguments
      const pattern = new RegExp(`\\b${func}\\s*\\(`, 'g')
      result = result.replace(pattern, ' (')
    }
    
    return result
  }

  /**
   * Check if a string is a keyword or operator
   */
  private isKeyword(str: string): boolean {
    const keywords = [
      'true', 'false', 'null', 'undefined',
      'PI', 'E', 'Infinity', 'NaN'
    ]
    return keywords.includes(str)
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): void {
    if (!source || typeof source !== 'object') {
      return
    }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key]
        const targetValue = target[key]
        
        if (Array.isArray(sourceValue)) {
          // Replace arrays entirely
          target[key] = [...sourceValue]
        } else if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
          // Recursively merge objects
          if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
            target[key] = {}
          }
          this.deepMerge(target[key], sourceValue)
        } else {
          // Replace primitive values
          target[key] = sourceValue
        }
      }
    }
  }
}