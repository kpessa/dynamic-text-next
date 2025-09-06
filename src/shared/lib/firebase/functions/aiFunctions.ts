import { createFunctionCaller } from '../functionsService'
import {
  GenerateTestCasesInput,
  GenerateTestCasesOutput,
  GetRecommendationsInput,
  GetRecommendationsOutput,
  AnalyzeFormulaInput,
  FormulaAnalysis,
  PredictOutcomeInput,
  PredictedOutcome,
  SuggestIngredientsInput,
  SuggestedIngredients,
} from '@/shared/types/functions/ai'

export const generateTestCases = createFunctionCaller<
  GenerateTestCasesInput,
  GenerateTestCasesOutput
>('generateTestCases', {
  maxRetries: 2,
  initialDelayMs: 2000,
})

export const getRecommendations = createFunctionCaller<
  GetRecommendationsInput,
  GetRecommendationsOutput
>('getRecommendations', {
  maxRetries: 3,
  initialDelayMs: 1000,
})

export const analyzeFormula = createFunctionCaller<
  AnalyzeFormulaInput,
  FormulaAnalysis
>('analyzeFormula', {
  maxRetries: 2,
  initialDelayMs: 1500,
})

export const predictOutcome = createFunctionCaller<
  PredictOutcomeInput,
  PredictedOutcome
>('predictOutcome', {
  maxRetries: 2,
  initialDelayMs: 2500,
})

export const suggestIngredients = createFunctionCaller<
  SuggestIngredientsInput,
  SuggestedIngredients
>('suggestIngredients', {
  maxRetries: 3,
  initialDelayMs: 1000,
})

export const validateMedicalContent = createFunctionCaller<
  {
    content: string
    type: 'formula' | 'instruction' | 'warning' | 'general'
    checkAgainst?: string[]
  },
  {
    isValid: boolean
    issues: Array<{
      text: string
      issue: string
      suggestion: string
      severity: 'info' | 'warning' | 'error'
    }>
    score: number
  }
>('validateMedicalContent', {
  maxRetries: 2,
  initialDelayMs: 1000,
})