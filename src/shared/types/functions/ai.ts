import { TPNFormula, Ingredient } from './tpn'

export interface TestCase {
  id: string
  name: string
  description: string
  type: 'unit' | 'integration' | 'e2e' | 'regression'
  priority: 'low' | 'medium' | 'high' | 'critical'
  steps: TestStep[]
  expectedResult: string
  actualResult?: string
  status?: 'pending' | 'passed' | 'failed' | 'skipped'
  generatedAt: number
}

export interface TestStep {
  order: number
  action: string
  expectedOutcome: string
  data?: unknown
}

export interface Section {
  id: string
  name: string
  type: string
  content?: string
  metadata?: Record<string, unknown>
}

export interface GenerateTestCasesInput {
  section: Section
  testTypes?: Array<'unit' | 'integration' | 'e2e' | 'regression'>
  coverage?: 'basic' | 'comprehensive' | 'exhaustive'
  focusAreas?: string[]
  existingTests?: TestCase[]
}

export interface GenerateTestCasesOutput {
  testCases: TestCase[]
  coverage: {
    estimated: number
    areas: Array<{
      name: string
      coverage: number
    }>
  }
  suggestions?: string[]
}

export interface Recommendation {
  id: string
  type: 'improvement' | 'warning' | 'optimization' | 'alternative'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  rationale?: string
  impact?: {
    area: string
    magnitude: 'minor' | 'moderate' | 'major'
  }
  implementation?: {
    effort: 'low' | 'medium' | 'high'
    steps?: string[]
  }
}

export interface GetRecommendationsInput {
  context: {
    formula?: TPNFormula
    patient?: unknown
    history?: unknown[]
    constraints?: Record<string, unknown>
  }
  types?: Recommendation['type'][]
  maxRecommendations?: number
}

export interface GetRecommendationsOutput {
  recommendations: Recommendation[]
  confidence: number
  basedOn: string[]
}

export interface AnalyzeFormulaInput {
  formula: TPNFormula
  analysisType?: Array<'nutritional' | 'compatibility' | 'stability' | 'cost' | 'all'>
  compareWith?: TPNFormula[]
  guidelines?: string[]
}

export interface FormulaAnalysis {
  formula: TPNFormula
  nutritionalScore: number
  compatibilityIssues: Array<{
    ingredients: string[]
    issue: string
    severity: 'low' | 'medium' | 'high'
    recommendation: string
  }>
  stabilityAssessment: {
    estimatedStability: number
    unit: 'hours' | 'days'
    factors: string[]
    recommendations: string[]
  }
  costAnalysis?: {
    estimatedCost: number
    currency: string
    breakdown: Array<{
      ingredient: string
      cost: number
      percentage: number
    }>
  }
  comparisonResults?: Array<{
    formula: TPNFormula
    differences: Record<string, unknown>
    advantages: string[]
    disadvantages: string[]
  }>
}

export interface PredictOutcomeInput {
  formula: TPNFormula
  patient: unknown
  duration: {
    value: number
    unit: 'hours' | 'days' | 'weeks'
  }
  factors?: string[]
}

export interface PredictedOutcome {
  predictions: Array<{
    parameter: string
    current: number
    predicted: number
    unit: string
    confidence: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  risks: Array<{
    type: string
    probability: 'low' | 'medium' | 'high'
    timeframe: string
    mitigation: string
  }>
  recommendations: string[]
  confidenceScore: number
  disclaimer: string
}

export interface SuggestIngredientsInput {
  targetNutrients: Record<string, { value: number; unit: string }>
  existingIngredients?: Ingredient[]
  constraints?: {
    exclude?: string[]
    maxNumber?: number
    preferredTypes?: string[]
  }
}

export interface SuggestedIngredients {
  suggestions: Array<{
    ingredient: Ingredient
    reason: string
    contribution: Record<string, { value: number; unit: string }>
    alternatives?: Ingredient[]
  }>
  achievedNutrients: Record<string, { value: number; unit: string; percentage: number }>
  unmetRequirements?: string[]
}

export interface AIFunctionNames {
  generateTestCases: {
    input: GenerateTestCasesInput
    output: GenerateTestCasesOutput
  }
  getRecommendations: {
    input: GetRecommendationsInput
    output: GetRecommendationsOutput
  }
  analyzeFormula: {
    input: AnalyzeFormulaInput
    output: FormulaAnalysis
  }
  predictOutcome: {
    input: PredictOutcomeInput
    output: PredictedOutcome
  }
  suggestIngredients: {
    input: SuggestIngredientsInput
    output: SuggestedIngredients
  }
  validateMedicalContent: {
    input: {
      content: string
      type: 'formula' | 'instruction' | 'warning' | 'general'
      checkAgainst?: string[]
    }
    output: {
      isValid: boolean
      issues: Array<{
        text: string
        issue: string
        suggestion: string
        severity: 'info' | 'warning' | 'error'
      }>
      score: number
    }
  }
}