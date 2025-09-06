import type { 
  TPNValues, 
  TPNAdvisorType, 
  ValidationResult, 
  ValidationWarning,
  ValidationError 
} from '@/entities/tpn'
import { getReferenceRangesForAdvisor, advisorConfigs } from '../config/advisors'

interface SafetyAlert {
  field: string
  value: number
  severity: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
}

interface ValidationSummary {
  overallValid: boolean
  totalWarnings: number
  totalErrors: number
  criticalAlerts: SafetyAlert[]
  recommendations: string
}

const criticalThresholds: Record<string, { min: number; max: number }> = {
  sodium: { min: 0.5, max: 8 },
  potassium: { min: 0.5, max: 8 },
  calcium: { min: 0.1, max: 5 },
  magnesium: { min: 0.05, max: 2 },
  phosphorus: { min: 0.1, max: 5 },
  calories: { min: 100, max: 5000 },
  protein: { min: 0.5, max: 200 }
}

export function validateTPNValues(
  values: TPNValues,
  advisorType: TPNAdvisorType
): ValidationResult {
  const warnings: ValidationWarning[] = []
  const errors: ValidationError[] = []
  let isValid = true

  for (const [key, value] of Object.entries(values)) {
    if (typeof value !== 'number') continue

    const ranges = getReferenceRangesForAdvisor(advisorType, key)
    
    if (ranges.length > 0) {
      const minRange = ranges.find(r => r.threshold === 'min')
      const maxRange = ranges.find(r => r.threshold === 'max')

      if (minRange && value < minRange.value) {
        isValid = false
        warnings.push({
          field: key,
          value,
          range: { min: minRange.value, max: maxRange?.value || minRange.value * 2 },
          message: `${key} (${value}) is below minimum recommended value of ${minRange.value}`,
          severity: value < minRange.value * 0.75 ? 'high' : 'medium'
        })
      }

      if (maxRange && value > maxRange.value) {
        isValid = false
        warnings.push({
          field: key,
          value,
          range: { min: minRange?.value || 0, max: maxRange.value },
          message: `${key} (${value}) exceeds maximum recommended value of ${maxRange.value}`,
          severity: value > maxRange.value * 1.2 ? 'high' : 'medium'
        })
      }
    }

    // Check against critical thresholds
    const critical = criticalThresholds[key]
    if (critical) {
      if (value < critical.min || value > critical.max) {
        isValid = false
        warnings.push({
          field: key,
          value,
          range: critical,
          message: `${key} (${value}) is at a critical level`,
          severity: 'high'
        })
      }
    }
  }

  return { isValid, warnings, errors }
}

export function validateInputParameters(
  params: Record<string, any>,
  advisorType: TPNAdvisorType
): ValidationResult {
  const warnings: ValidationWarning[] = []
  const errors: ValidationError[] = []
  let isValid = true

  // Validate weight
  if (params.weight !== undefined) {
    const weight = params.weight
    
    if (weight <= 0) {
      isValid = false
      errors.push({
        field: 'weight',
        message: 'Weight must be greater than zero',
        code: 'INVALID_WEIGHT'
      })
    }

    const config = advisorConfigs[advisorType]
    if (config && weight) {
      if (weight < config.weightRange.min || weight > config.weightRange.max) {
        isValid = false
        warnings.push({
          field: 'weight',
          value: weight,
          range: config.weightRange,
          message: `Weight ${weight}kg is outside typical range for ${advisorType} (${config.weightRange.min}-${config.weightRange.max}kg)`,
          severity: 'medium'
        })
      }
    }
  }

  // Validate height
  if (params.height !== undefined && params.height < 0) {
    isValid = false
    errors.push({
      field: 'height',
      message: 'Height must be non-negative',
      code: 'INVALID_HEIGHT'
    })
  }

  // Validate age
  if (params.age !== undefined && params.age < 0) {
    isValid = false
    errors.push({
      field: 'age',
      message: 'Age must be non-negative',
      code: 'INVALID_AGE'
    })
  }

  return { isValid, warnings, errors }
}

export function checkCriticalValues(
  values: TPNValues,
  advisorType: TPNAdvisorType
): SafetyAlert[] {
  const alerts: SafetyAlert[] = []

  for (const [key, value] of Object.entries(values)) {
    if (typeof value !== 'number') continue

    const critical = criticalThresholds[key]
    if (critical) {
      if (value < critical.min) {
        alerts.push(createSafetyAlert(
          key,
          value,
          'critical',
          `${key} is critically low at ${value}`
        ))
      } else if (value > critical.max) {
        alerts.push(createSafetyAlert(
          key,
          value,
          'critical',
          `${key} is critically high at ${value}`
        ))
      }
    }
  }

  return alerts
}

export function createSafetyAlert(
  field: string,
  value: number,
  severity: 'critical' | 'warning' | 'info',
  message: string
): SafetyAlert {
  return {
    field,
    value,
    severity,
    message,
    timestamp: new Date().toISOString()
  }
}

export function validateEdgeCases(
  params: Record<string, any>,
  advisorType: TPNAdvisorType
): ValidationResult {
  const warnings: ValidationWarning[] = []
  const errors: ValidationError[] = []
  let isValid = true

  // Check for zero weight
  if (params.weight === 0) {
    isValid = false
    errors.push({
      field: 'weight',
      message: 'Weight must be greater than zero',
      code: 'ZERO_WEIGHT'
    })
  }

  // Check for extremely high values
  if (params.weight > 500) {
    isValid = false
    warnings.push({
      field: 'weight',
      value: params.weight,
      range: { min: 0, max: 500 },
      message: 'Weight exceeds maximum supported value',
      severity: 'high'
    })
  }

  if (params.age > 150) {
    isValid = false
    warnings.push({
      field: 'age',
      value: params.age,
      range: { min: 0, max: 150 },
      message: 'Age exceeds maximum supported value',
      severity: 'high'
    })
  }

  // Check advisor compatibility
  const config = advisorConfigs[advisorType]
  if (advisorType === 'NEO' && params.weight > 20) {
    isValid = false
    errors.push({
      field: 'weight',
      message: `Weight ${params.weight}kg is incompatible with NEO advisor type`,
      code: 'ADVISOR_MISMATCH'
    })
  }

  if (advisorType === 'CHILD' && params.age && params.age > 18) {
    warnings.push({
      field: 'age',
      value: params.age,
      range: { min: 1, max: 18 },
      message: 'Age suggests ADULT advisor type may be more appropriate',
      severity: 'medium'
    })
  }

  return { isValid, warnings, errors }
}

export function getValidationSummary(
  values: TPNValues,
  params: Record<string, any>,
  advisorType: TPNAdvisorType
): ValidationSummary {
  const valueValidation = validateTPNValues(values, advisorType)
  const paramValidation = validateInputParameters(params, advisorType)
  const edgeCaseValidation = validateEdgeCases(params, advisorType)
  const criticalAlerts = checkCriticalValues(values, advisorType)

  const totalWarnings = 
    valueValidation.warnings.length + 
    paramValidation.warnings.length + 
    edgeCaseValidation.warnings.length

  const totalErrors = 
    valueValidation.errors.length + 
    paramValidation.errors.length + 
    edgeCaseValidation.errors.length

  const overallValid = 
    valueValidation.isValid && 
    paramValidation.isValid && 
    edgeCaseValidation.isValid &&
    criticalAlerts.length === 0

  let recommendations = ''
  if (overallValid) {
    recommendations = 'All values are within acceptable ranges.'
  } else if (criticalAlerts.length > 0) {
    recommendations = 'CRITICAL: Review required immediately. Some values are at dangerous levels.'
  } else if (totalErrors > 0) {
    recommendations = 'Correct input errors before proceeding with calculations.'
  } else {
    recommendations = 'Review warnings and consider adjusting values or consulting clinical guidelines.'
  }

  return {
    overallValid,
    totalWarnings,
    totalErrors,
    criticalAlerts,
    recommendations
  }
}