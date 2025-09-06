import { createFunctionCaller } from '../functionsService'
import { 
  TPNCalculationInput, 
  TPNCalculationResult,
  ValidateIngredientsInput,
  IngredientValidationResult,
  TPNFormula,
  TPNPatient,
  TPNNutrientValue
} from '@/shared/types/functions/tpn'

export const calculateTPNValues = createFunctionCaller<
  TPNCalculationInput,
  TPNCalculationResult
>('calculateTPNValues', {
  maxRetries: 3,
  initialDelayMs: 1000,
})

export const validateIngredients = createFunctionCaller<
  ValidateIngredientsInput,
  IngredientValidationResult
>('validateIngredients', {
  maxRetries: 2,
  initialDelayMs: 500,
})

export const optimizeFormula = createFunctionCaller<
  {
    targetNutrients: Partial<{
      calories: TPNNutrientValue
      protein: TPNNutrientValue
      carbohydrates: TPNNutrientValue
      lipids: TPNNutrientValue
      electrolytes: TPNNutrientValue[]
      vitamins: TPNNutrientValue[]
      trace: TPNNutrientValue[]
    }>
    patient: TPNPatient
    constraints?: {
      maxVolume?: number
      maxOsmolarity?: number
      excludeIngredients?: string[]
    }
  },
  {
    optimizedFormula: TPNFormula
    achievedNutrients: {
      calories: TPNNutrientValue
      protein: TPNNutrientValue
      carbohydrates: TPNNutrientValue
      lipids: TPNNutrientValue
      electrolytes: TPNNutrientValue[]
      vitamins: TPNNutrientValue[]
      trace: TPNNutrientValue[]
    }
    optimizationScore: number
  }
>('optimizeFormula', {
  maxRetries: 2,
  initialDelayMs: 2000,
})

export const compareFormulas = createFunctionCaller<
  {
    formulas: TPNFormula[]
    patient?: TPNPatient
  },
  {
    comparison: Array<{
      formula: TPNFormula
      result: TPNCalculationResult
      score: number
      advantages: string[]
      disadvantages: string[]
    }>
    recommendation: string
  }
>('compareFormulas', {
  maxRetries: 2,
  initialDelayMs: 1500,
})