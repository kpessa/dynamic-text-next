import type { Ingredient } from '../types'
import type { TPNAdvisorType, ReferenceRange, ValidationResult, ValidationWarning } from '@/entities/tpn'
import { evaluateExpression } from '@/features/tpn-calculations/lib/calculator'

export function getIngredientByKeyname(
  keyname: string,
  ingredients: Ingredient[]
): Ingredient | undefined {
  const lowerKeyname = keyname.toLowerCase()
  return ingredients.find(ing => ing.keyname.toLowerCase() === lowerKeyname)
}

export function validateIngredientValue(
  value: number,
  ingredientKeyname: string,
  advisorType: TPNAdvisorType,
  ingredients: Ingredient[]
): ValidationResult {
  const ingredient = getIngredientByKeyname(ingredientKeyname, ingredients)
  
  if (!ingredient) {
    return { isValid: true, warnings: [], errors: [] }
  }

  const warnings: ValidationWarning[] = []
  let isValid = true

  const relevantRange = ingredient.referenceRanges.find(
    r => r.populationType === advisorType
  )

  if (relevantRange) {
    if (relevantRange.min !== undefined && value < relevantRange.min) {
      isValid = false
      warnings.push({
        field: ingredientKeyname,
        value,
        range: { 
          min: relevantRange.min, 
          max: relevantRange.max || relevantRange.min * 2 
        },
        message: `${ingredient.displayName} value ${value} ${ingredient.unit} is below minimum of ${relevantRange.min} ${relevantRange.unit || ingredient.unit}`,
        severity: value < relevantRange.min * 0.5 ? 'high' : 'medium'
      })
    }

    if (relevantRange.max !== undefined && value > relevantRange.max) {
      isValid = false
      warnings.push({
        field: ingredientKeyname,
        value,
        range: { 
          min: relevantRange.min || 0, 
          max: relevantRange.max 
        },
        message: `${ingredient.displayName} value ${value} ${ingredient.unit} is above maximum of ${relevantRange.max} ${relevantRange.unit || ingredient.unit}`,
        severity: value > relevantRange.max * 1.5 ? 'high' : 'medium'
      })
    }
  }

  return { isValid, warnings, errors: [] }
}

export function getIngredientReferenceRanges(
  ingredientKeyname: string,
  advisorType: TPNAdvisorType,
  ingredients: Ingredient[]
): ReferenceRange[] {
  const ingredient = getIngredientByKeyname(ingredientKeyname, ingredients)
  
  if (!ingredient) {
    return []
  }

  const relevantRange = ingredient.referenceRanges.find(
    r => r.populationType === advisorType
  )

  if (!relevantRange) {
    return []
  }

  const ranges: ReferenceRange[] = []

  if (relevantRange.min !== undefined) {
    ranges.push({
      threshold: 'min',
      value: relevantRange.min,
      advisorType,
      unit: relevantRange.unit || ingredient.unit,
      ingredient: ingredientKeyname
    })
  }

  if (relevantRange.max !== undefined) {
    ranges.push({
      threshold: 'max',
      value: relevantRange.max,
      advisorType,
      unit: relevantRange.unit || ingredient.unit,
      ingredient: ingredientKeyname
    })
  }

  return ranges
}

export function isIngredientShared(
  ingredientKeyname: string,
  ingredients: Ingredient[]
): boolean {
  const ingredient = getIngredientByKeyname(ingredientKeyname, ingredients)
  return ingredient?.isShared || false
}

export function calculateIngredientValue(
  ingredientKeyname: string,
  context: Record<string, any>,
  ingredients: Ingredient[]
): number {
  const ingredient = getIngredientByKeyname(ingredientKeyname, ingredients)
  
  if (!ingredient || !ingredient.formula) {
    return 0
  }

  return evaluateExpression(ingredient.formula, context)
}

export function getRequiredIngredients(advisorType: TPNAdvisorType): string[] {
  const baseIngredients = [
    'calories',
    'protein',
    'carbohydrates',
    'lipids',
    'sodium',
    'potassium',
    'calcium',
    'magnesium',
    'phosphorus'
  ]

  const pediatricVitamins = [
    'vitamin_a',
    'vitamin_d',
    'vitamin_e',
    'vitamin_k',
    'thiamine',
    'riboflavin',
    'niacin',
    'vitamin_b6',
    'vitamin_b12',
    'folic_acid',
    'vitamin_c'
  ]

  const traceElements = [
    'zinc',
    'copper',
    'manganese',
    'chromium',
    'selenium',
    'iron'
  ]

  switch (advisorType) {
    case 'NEO':
    case 'CHILD':
      return [...baseIngredients, ...pediatricVitamins, ...traceElements]
    case 'ADOLESCENT':
      return [...baseIngredients, ...traceElements]
    case 'ADULT':
    default:
      return baseIngredients
  }
}