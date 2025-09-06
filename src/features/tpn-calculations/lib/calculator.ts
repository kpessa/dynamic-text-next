import type { MockMeInterface, TPNAdvisorType } from '@/entities/tpn'
import { evaluate } from 'mathjs'

export class MockMe implements MockMeInterface {
  private values: Record<string, any>
  private advisorType: TPNAdvisorType

  constructor(values: Record<string, any>, advisorType: TPNAdvisorType) {
    this.values = values
    this.advisorType = advisorType
  }

  getValue(key: string): any {
    return this.values[key] ?? 0
  }

  maxP(value: number, precision: number = 2): string {
    return value.toFixed(precision)
  }

  calculate(expression: string): any {
    return evaluateExpression(expression, this.values)
  }

  getAdvisorType(): TPNAdvisorType {
    return this.advisorType
  }
}

export function getValue(key: string, context: Record<string, any>): any {
  const value = context[key]
  if (value === null || value === undefined) {
    return 0
  }
  return value
}

export function maxP(value: number, precision: number = 2): string {
  return value.toFixed(precision)
}

export function calculate(expression: string, context: Record<string, any>): number {
  return evaluateExpression(expression, context)
}

export function evaluateExpression(expr: string, context: Record<string, any>): number {
  if (!expr || expr.trim() === '') {
    return 0
  }

  try {
    const safeContext: Record<string, any> = {}
    
    for (const key in context) {
      const value = context[key]
      safeContext[key] = value ?? 0
    }

    const dangerousPatterns = [
      /alert/i,
      /process/i,
      /require/i,
      /import/i,
      /eval/i,
      /function/i,
      /console/i,
      /window/i,
      /document/i
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expr)) {
        console.warn('Potentially dangerous expression blocked:', expr)
        return 0
      }
    }

    const missingVarRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g
    const exprWithDefaults = expr.replace(missingVarRegex, (match) => {
      if (match in safeContext) {
        return match
      }
      safeContext[match] = 0
      return match
    })

    const result = evaluate(exprWithDefaults, safeContext)
    
    if (typeof result === 'number') {
      return result
    }
    
    return Number(result) || 0
  } catch (error) {
    console.error('Expression evaluation failed:', expr, error)
    return 0
  }
}

interface UnitConversion {
  from: string
  to: string
  factor: number
}

const unitConversions: UnitConversion[] = [
  { from: 'kg', to: 'g', factor: 1000 },
  { from: 'g', to: 'kg', factor: 0.001 },
  { from: 'kg', to: 'lb', factor: 2.20462 },
  { from: 'lb', to: 'kg', factor: 0.453592 },
  { from: 'L', to: 'mL', factor: 1000 },
  { from: 'mL', to: 'L', factor: 0.001 },
  { from: 'L', to: 'dL', factor: 10 },
  { from: 'dL', to: 'L', factor: 0.1 },
  { from: 'g/L', to: 'mg/dL', factor: 100 },
  { from: 'mg/dL', to: 'g/L', factor: 0.01 },
  { from: 'mEq/L', to: 'mmol/L', factor: 1 },
  { from: 'mmol/L', to: 'mEq/L', factor: 1 },
]

export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) {
    return value
  }

  const conversion = unitConversions.find(
    c => c.from === fromUnit && c.to === toUnit
  )

  if (conversion) {
    return value * conversion.factor
  }

  console.warn(`Unit conversion not found: ${fromUnit} to ${toUnit}`)
  return value
}