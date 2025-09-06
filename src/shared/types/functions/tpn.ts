import { ValidationResult } from './common'

export interface Ingredient {
  id: string
  name: string
  type: 'electrolyte' | 'vitamin' | 'amino-acid' | 'lipid' | 'dextrose' | 'other'
  concentration?: number
  unit: string
  volume?: number
  amount?: number
}

export interface TPNPatient {
  id?: string
  weight: number
  weightUnit: 'kg' | 'lb'
  age?: number
  ageUnit?: 'years' | 'months' | 'days'
  height?: number
  heightUnit?: 'cm' | 'in'
}

export interface TPNFormula {
  id?: string
  name: string
  description?: string
  ingredients: Ingredient[]
  totalVolume: number
  volumeUnit: 'mL' | 'L'
  infusionRate?: number
  infusionDuration?: number
  createdAt?: number
  updatedAt?: number
}

export interface TPNCalculationInput {
  formula: TPNFormula
  patient?: TPNPatient
  adjustments?: {
    factorType?: 'stress' | 'activity' | 'custom'
    factorValue?: number
  }
  calculationType?: 'standard' | 'pediatric' | 'neonatal'
}

export interface TPNNutrientValue {
  name: string
  value: number
  unit: string
  percentage?: number
  normalRange?: {
    min: number
    max: number
  }
  status?: 'low' | 'normal' | 'high'
}

export interface TPNCalculationResult {
  formula: TPNFormula
  patient?: TPNPatient
  nutrients: {
    calories: TPNNutrientValue
    protein: TPNNutrientValue
    carbohydrates: TPNNutrientValue
    lipids: TPNNutrientValue
    electrolytes: TPNNutrientValue[]
    vitamins: TPNNutrientValue[]
    trace: TPNNutrientValue[]
  }
  totals: {
    calories: number
    protein: number
    volume: number
    osmolarity: number
    caloriesPerKg?: number
    proteinPerKg?: number
  }
  warnings?: string[]
  recommendations?: string[]
  calculatedAt: number
}

export interface ValidateIngredientsInput {
  ingredients: Ingredient[]
  patient?: TPNPatient
  checkCompatibility?: boolean
  checkDoseLimits?: boolean
}

export interface IngredientValidationResult extends ValidationResult {
  compatibilityIssues?: Array<{
    ingredient1: string
    ingredient2: string
    issue: string
    severity: 'warning' | 'error'
  }>
  doseLimitExceeded?: Array<{
    ingredient: string
    currentDose: number
    maxDose: number
    unit: string
  }>
}

export interface TPNFunctionNames {
  calculateTPNValues: {
    input: TPNCalculationInput
    output: TPNCalculationResult
  }
  validateIngredients: {
    input: ValidateIngredientsInput
    output: IngredientValidationResult
  }
  optimizeFormula: {
    input: {
      targetNutrients: Partial<TPNCalculationResult['nutrients']>
      patient: TPNPatient
      constraints?: {
        maxVolume?: number
        maxOsmolarity?: number
        excludeIngredients?: string[]
      }
    }
    output: {
      optimizedFormula: TPNFormula
      achievedNutrients: TPNCalculationResult['nutrients']
      optimizationScore: number
    }
  }
  compareFormulas: {
    input: {
      formulas: TPNFormula[]
      patient?: TPNPatient
    }
    output: {
      comparison: Array<{
        formula: TPNFormula
        result: TPNCalculationResult
        score: number
        advantages: string[]
        disadvantages: string[]
      }>
      recommendation: string
    }
  }
}