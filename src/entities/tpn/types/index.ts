export type TPNAdvisorType = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'

export interface TPNValues {
  calories: number
  protein: number
  carbohydrates: number
  lipids: number
  sodium: number
  potassium: number
  calcium: number
  magnesium: number
  phosphorus: number
  [key: string]: number
}

export interface TPNInstance {
  id: string
  advisorType: TPNAdvisorType
  patientId: string
  values: Record<string, any>
  calculatedValues?: TPNValues
  createdAt: string
  updatedAt: string
}

export interface MockMeInterface {
  getValue: (key: string) => any
  maxP: (value: number, precision?: number) => string
  calculate: (expression: string) => any
  getAdvisorType: () => TPNAdvisorType
}

export type ThresholdType = 'min' | 'max' | 'target'

export interface ReferenceRange {
  threshold: ThresholdType
  value: number
  advisorType: TPNAdvisorType
  unit: string
  ingredient: string
}

export type ValidationSeverity = 'low' | 'medium' | 'high'

export interface ValidationWarning {
  field: string
  value: number
  range: { min: number; max: number }
  message: string
  severity: ValidationSeverity
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  warnings: ValidationWarning[]
  errors: ValidationError[]
}

export interface CalculationHistory {
  id: string
  instanceId: string
  timestamp: string
  inputValues: Record<string, any>
  calculatedValues: TPNValues
  advisorType: TPNAdvisorType
  userId: string
}

export interface AdvisorConfig {
  aliases: string[]
  weightRange: { min: number; max: number }
  calculations: Record<string, string>
  referenceRanges?: ReferenceRange[]
}