import { VariableResolver } from './variableResolver'
import { UnitConverter } from '../../../shared/lib/unitConverter'

export enum ValidationLevel {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface ValidationIssue {
  level: ValidationLevel
  message: string
  position?: {
    start: number
    end: number
  }
  suggestion?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

export interface ComplexityAnalysis {
  score: number
  operators: number
  functions: number
  variables: number
  depth: number
}

export class FormulaValidator {
  private variableResolver: VariableResolver
  private unitConverter: UnitConverter
  private allowedFunctions: Set<string>
  private dangerousPatterns: RegExp[]

  constructor() {
    this.variableResolver = new VariableResolver()
    this.unitConverter = new UnitConverter()
    
    this.allowedFunctions = new Set([
      'min', 'max', 'round', 'floor', 'ceil',
      'abs', 'sqrt', 'pow', 'exp', 'log',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'convert'
    ])

    this.dangerousPatterns = [
      /\beval\b/i,
      /\bprocess\b/i,
      /\brequire\b/i,
      /\b__proto__\b/i,
      /\bconstructor\b/i,
      /\bFunction\b/i,
      /\bimport\b/i,
      /\bexport\b/i
    ]
  }

  /**
   * Validate a single formula
   */
  validate(formula: string, context?: Record<string, any>): ValidationResult {
    const errors: ValidationIssue[] = []
    const warnings: ValidationIssue[] = []

    // Check for empty formula
    if (!formula || formula.trim().length === 0) {
      errors.push({
        level: ValidationLevel.ERROR,
        message: 'Formula cannot be empty'
      })
      return { isValid: false, errors, warnings }
    }

    // Security validation
    this.validateSecurity(formula, errors)

    // Syntax validation
    this.validateSyntax(formula, errors)

    // Function validation
    this.validateFunctions(formula, errors)

    // Variable validation if context provided
    if (context) {
      this.validateVariables(formula, context, errors, warnings)
    }

    // Unit conversion validation
    this.validateUnitConversions(formula, errors)

    // Complexity analysis
    const complexity = this.analyzeComplexity(formula)
    if (complexity.score > 50) {
      warnings.push({
        level: ValidationLevel.WARNING,
        message: `Formula has high complexity (score: ${complexity.score}). Consider simplifying.`
      })
    }

    // Performance warnings
    this.checkPerformance(formula, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate multiple formulas for circular dependencies
   */
  validateFormulas(formulas: Map<string, string>): ValidationResult {
    const errors: ValidationIssue[] = []
    const warnings: ValidationIssue[] = []

    // Build dependency graph
    const dependencies = new Map<string, Set<string>>()
    
    for (const [name, formula] of formulas) {
      const vars = this.variableResolver.extractVariables(formula)
      const deps = new Set<string>()
      
      for (const v of vars) {
        if (formulas.has(v)) {
          deps.add(v)
        }
      }
      
      dependencies.set(name, deps)
    }

    // Check for circular dependencies
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (node: string): boolean => {
      visited.add(node)
      recursionStack.add(node)

      const deps = dependencies.get(node) || new Set()
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) {
            return true
          }
        } else if (recursionStack.has(dep)) {
          errors.push({
            level: ValidationLevel.ERROR,
            message: `Circular dependency detected: ${node} → ${dep}`
          })
          return true
        }
      }

      recursionStack.delete(node)
      return false
    }

    for (const name of formulas.keys()) {
      if (!visited.has(name)) {
        if (hasCycle(name)) {
          break
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Analyze formula complexity
   */
  analyzeComplexity(formula: string): ComplexityAnalysis {
    const operators = (formula.match(/[+\-*/^]/g) || []).length
    const functions = (formula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g) || []).length
    const variables = this.variableResolver.extractVariables(formula).length
    const depth = this.calculateNestingDepth(formula)

    // Calculate complexity score
    const score = operators * 2 + functions * 5 + variables * 1 + depth * 10

    return {
      score,
      operators,
      functions,
      variables,
      depth
    }
  }

  /**
   * Validate security aspects
   */
  private validateSecurity(formula: string, errors: ValidationIssue[]): void {
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(formula)) {
        const match = formula.match(pattern)
        if (match) {
          errors.push({
            level: ValidationLevel.ERROR,
            message: `Formula contains potentially dangerous pattern: ${match[0]}`,
            position: {
              start: match.index || 0,
              end: (match.index || 0) + match[0].length
            },
            suggestion: 'Remove or replace the dangerous pattern'
          })
        }
      }
    }
  }

  /**
   * Validate formula syntax
   */
  private validateSyntax(formula: string, errors: ValidationIssue[]): void {
    // Check for unbalanced parentheses
    let parenCount = 0
    for (let i = 0; i < formula.length; i++) {
      if (formula[i] === '(') parenCount++
      if (formula[i] === ')') parenCount--
      if (parenCount < 0) {
        errors.push({
          level: ValidationLevel.ERROR,
          message: 'Unbalanced parentheses: too many closing parentheses',
          position: { start: i, end: i + 1 }
        })
        return
      }
    }
    if (parenCount > 0) {
      errors.push({
        level: ValidationLevel.ERROR,
        message: 'Unbalanced parentheses: missing closing parenthesis'
      })
    }

    // Check for invalid operator sequences
    const invalidPatterns = [
      { pattern: /\+\+/, message: 'Invalid operator sequence: ++' },
      { pattern: /\*\*/, message: 'Invalid operator sequence: **' },
      { pattern: /\/\//, message: 'Invalid operator sequence: //' },
      { pattern: /\(\)/, message: 'Empty parentheses are not allowed' },
      { pattern: /\+\s*\+/, message: 'Invalid operator sequence: + +' }
    ]

    for (const { pattern, message } of invalidPatterns) {
      const match = formula.match(pattern)
      if (match) {
        errors.push({
          level: ValidationLevel.ERROR,
          message,
          position: {
            start: match.index || 0,
            end: (match.index || 0) + match[0].length
          }
        })
      }
    }
  }

  /**
   * Validate function calls
   */
  private validateFunctions(formula: string, errors: ValidationIssue[]): void {
    const functionPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g
    let match

    while ((match = functionPattern.exec(formula)) !== null) {
      const funcName = match[1]
      
      if (!this.allowedFunctions.has(funcName)) {
        // Check for typos
        const suggestion = this.findSimilarFunction(funcName)
        errors.push({
          level: ValidationLevel.ERROR,
          message: `Unknown function: ${funcName}`,
          position: {
            start: match.index,
            end: match.index + funcName.length
          },
          suggestion: suggestion ? `Did you mean '${suggestion}'?` : undefined
        })
      } else {
        // Validate function arguments
        this.validateFunctionArguments(formula, funcName, match.index, errors)
      }
    }
  }

  /**
   * Validate function arguments
   */
  private validateFunctionArguments(
    formula: string,
    funcName: string,
    startPos: number,
    errors: ValidationIssue[]
  ): void {
    // Extract arguments
    const argsStart = formula.indexOf('(', startPos)
    const argsEnd = this.findMatchingParen(formula, argsStart)
    
    if (argsEnd === -1) return // Already caught by syntax validation

    const argsStr = formula.substring(argsStart + 1, argsEnd)
    const args = this.parseArguments(argsStr)

    // Check argument count based on function
    switch (funcName) {
      case 'pow':
        if (args.length !== 2) {
          errors.push({
            level: ValidationLevel.ERROR,
            message: `Function '${funcName}' requires exactly 2 arguments, got ${args.length}`,
            position: { start: startPos, end: argsEnd + 1 }
          })
        }
        break
      
      case 'min':
      case 'max':
        if (args.length < 1) {
          errors.push({
            level: ValidationLevel.ERROR,
            message: `Function '${funcName}' requires at least 1 argument`,
            position: { start: startPos, end: argsEnd + 1 }
          })
        }
        break
      
      case 'round':
      case 'floor':
      case 'ceil':
      case 'abs':
      case 'sqrt':
        if (args.length !== 1) {
          errors.push({
            level: ValidationLevel.ERROR,
            message: `Function '${funcName}' requires exactly 1 argument, got ${args.length}`,
            position: { start: startPos, end: argsEnd + 1 }
          })
        }
        break
    }
  }

  /**
   * Validate variables against context
   */
  private validateVariables(
    formula: string,
    context: Record<string, any>,
    errors: ValidationIssue[],
    warnings: ValidationIssue[]
  ): void {
    const variables = this.variableResolver.extractVariables(formula)
    
    for (const variable of variables) {
      const value = this.variableResolver.resolve(variable, context)
      
      if (value === undefined) {
        errors.push({
          level: ValidationLevel.ERROR,
          message: `Undefined variable: ${variable}`
        })
      } else if (value === null) {
        errors.push({
          level: ValidationLevel.ERROR,
          message: `Variable '${variable}' is null`
        })
      } else if (typeof value !== 'number' && !this.isConvertFunction(formula, variable)) {
        warnings.push({
          level: ValidationLevel.WARNING,
          message: `Variable '${variable}' contains non-numeric value: ${typeof value}`
        })
      }
    }
  }

  /**
   * Validate unit conversions
   */
  private validateUnitConversions(formula: string, errors: ValidationIssue[]): void {
    const conversions = this.unitConverter.extractConversions(formula)
    
    for (const conversion of conversions) {
      // Check if units are known
      const fromType = this.unitConverter.getUnitType(conversion.fromUnit)
      const toType = this.unitConverter.getUnitType(conversion.toUnit)
      
      if (!fromType) {
        errors.push({
          level: ValidationLevel.ERROR,
          message: `Unknown unit: ${conversion.fromUnit}`,
          suggestion: 'Check unit spelling or use a supported unit'
        })
      }
      
      if (!toType) {
        errors.push({
          level: ValidationLevel.ERROR,
          message: `Unknown unit: ${conversion.toUnit}`,
          suggestion: 'Check unit spelling or use a supported unit'
        })
      }
      
      // Check if units are compatible
      if (fromType && toType && fromType !== toType) {
        errors.push({
          level: ValidationLevel.ERROR,
          message: `Incompatible unit conversion: ${conversion.fromUnit} to ${conversion.toUnit}`,
          suggestion: 'Units must be of the same type (e.g., both weight units)'
        })
      }
    }
  }

  /**
   * Check for performance issues
   */
  private checkPerformance(formula: string, warnings: ValidationIssue[]): void {
    // Check for deeply nested operations
    const depth = this.calculateNestingDepth(formula)
    if (depth > 5) {
      warnings.push({
        level: ValidationLevel.WARNING,
        message: `Formula has deep nesting (depth: ${depth}). This may impact performance.`
      })
    }

    // Check for excessive pow operations
    const powCount = (formula.match(/\bpow\s*\(/g) || []).length
    if (powCount > 3) {
      warnings.push({
        level: ValidationLevel.WARNING,
        message: `Formula contains ${powCount} pow operations. Consider simplifying for better performance.`
      })
    }
  }

  /**
   * Helper functions
   */
  private calculateNestingDepth(formula: string): number {
    let maxDepth = 0
    let currentDepth = 0
    
    for (const char of formula) {
      if (char === '(') {
        currentDepth++
        maxDepth = Math.max(maxDepth, currentDepth)
      } else if (char === ')') {
        currentDepth--
      }
    }
    
    return maxDepth
  }

  private findMatchingParen(formula: string, startPos: number): number {
    let count = 1
    for (let i = startPos + 1; i < formula.length; i++) {
      if (formula[i] === '(') count++
      if (formula[i] === ')') {
        count--
        if (count === 0) return i
      }
    }
    return -1
  }

  private parseArguments(argsStr: string): string[] {
    if (!argsStr.trim()) return []
    
    const args: string[] = []
    let current = ''
    let depth = 0
    
    for (const char of argsStr) {
      if (char === ',' && depth === 0) {
        args.push(current.trim())
        current = ''
      } else {
        if (char === '(') depth++
        if (char === ')') depth--
        current += char
      }
    }
    
    if (current.trim()) {
      args.push(current.trim())
    }
    
    return args
  }

  private findSimilarFunction(name: string): string | undefined {
    // Simple Levenshtein distance for typo detection
    const maxDistance = 2
    let bestMatch: string | undefined
    let bestDistance = maxDistance + 1
    
    for (const func of this.allowedFunctions) {
      const distance = this.levenshteinDistance(name.toLowerCase(), func.toLowerCase())
      if (distance < bestDistance) {
        bestDistance = distance
        bestMatch = func
      }
    }
    
    return bestDistance <= maxDistance ? bestMatch : undefined
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[b.length][a.length]
  }

  private isConvertFunction(formula: string, variable: string): boolean {
    // Check if variable is used within a convert function
    const pattern = new RegExp(`convert\\s*\\(\\s*${variable}\\s*,`)
    return pattern.test(formula)
  }
}