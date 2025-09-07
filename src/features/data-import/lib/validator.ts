import {
  isTPNConfiguration,
  isPopulationType,
  isIngredientType,
  isEditMode,
  isThresholdType,
  type TPNConfiguration,
  type PopulationType
} from '../types/schemas'

export interface ValidationResult {
  valid: boolean
  error?: string
  errors?: string[]
  dataType?: string
  itemCount?: number
  populationType?: PopulationType
}

export function detectDataType(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'unknown'
  }
  
  const obj = data as Record<string, unknown>
  
  // Check for new TPN configuration format
  if (obj.INGREDIENT && obj.FLEX) {
    return 'tpn-full'
  }
  
  // Check TPN before ingredients since TPN can also have ingredients
  if (obj.advisorType && obj.calculations) {
    return 'tpn'
  }
  
  if (obj.ingredients && Array.isArray(obj.ingredients)) {
    return 'ingredients'
  }
  
  if (obj.reference && typeof obj.reference === 'object' && obj.reference !== null) {
    const ref = obj.reference as Record<string, unknown>
    if (ref.sections) {
      return 'reference'
    }
  }
  
  return 'unknown'
}

export function validateImport(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: 'Invalid data: Expected a JSON object'
    }
  }
  
  const dataType = detectDataType(data)
  const obj = data as Record<string, unknown>
  
  switch (dataType) {
    case 'ingredients':
      return validateIngredients(obj)
    
    case 'tpn':
      return validateTPNConfig(obj)
    
    case 'tpn-full':
      return validateFullTPNConfig(obj)
    
    case 'reference':
      return validateReference(obj)
    
    default:
      return {
        valid: false,
        error: 'Unknown data format. Expected ingredients, reference, or TPN configuration.'
      }
  }
}

export function validateIngredients(data: Record<string, unknown>): ValidationResult {
  if (!data.ingredients) {
    return {
      valid: false,
      error: 'Missing ingredients field'
    }
  }
  
  if (!Array.isArray(data.ingredients)) {
    return {
      valid: false,
      error: 'Ingredients must be an array'
    }
  }
  
  const ingredients = data.ingredients as Array<Record<string, unknown>>
  
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i]
    
    if (!ingredient.keyname || !ingredient.name || !ingredient.type) {
      return {
        valid: false,
        error: `Invalid ingredient at index ${i}: Missing required fields (keyname, name, type)`
      }
    }
    
    if (typeof ingredient.keyname !== 'string' || 
        typeof ingredient.name !== 'string' || 
        typeof ingredient.type !== 'string') {
      return {
        valid: false,
        error: `Invalid ingredient at index ${i}: Fields must be strings`
      }
    }
  }
  
  return {
    valid: true,
    dataType: 'ingredients',
    itemCount: ingredients.length
  }
}

export function validateTPNConfig(data: Record<string, unknown>): ValidationResult {
  const requiredFields = ['advisorType', 'calculations']
  const missingFields = requiredFields.filter(field => !(field in data))
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    }
  }
  
  const validAdvisorTypes = ['NEO', 'CHILD', 'ADOLESCENT', 'ADULT']
  if (!validAdvisorTypes.includes(data.advisorType)) {
    return {
      valid: false,
      error: `Invalid advisor type: ${data.advisorType}. Must be one of: ${validAdvisorTypes.join(', ')}`
    }
  }
  
  if (typeof data.calculations !== 'object' || data.calculations === null) {
    return {
      valid: false,
      error: 'Calculations must be an object'
    }
  }
  
  return {
    valid: true,
    dataType: 'tpn',
    itemCount: 1
  }
}

export function validateReference(data: Record<string, unknown>): ValidationResult {
  if (!data.reference) {
    return {
      valid: false,
      error: 'Missing reference field'
    }
  }
  
  const ref = data.reference as Record<string, unknown>
  
  if (!ref.name) {
    return {
      valid: false,
      error: 'Reference must have a name'
    }
  }
  
  if (!ref.sections) {
    return {
      valid: false,
      error: 'Reference must have sections'
    }
  }
  
  if (!Array.isArray(ref.sections)) {
    return {
      valid: false,
      error: 'Sections must be an array'
    }
  }
  
  const sections = ref.sections as Array<Record<string, unknown>>
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    
    if (!section.title || !section.content) {
      return {
        valid: false,
        error: `Invalid section at index ${i}: Missing title or content`
      }
    }
  }
  
  return {
    valid: true,
    dataType: 'reference',
    itemCount: sections.length
  }
}

export function validateFullTPNConfig(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = []
  
  // Validate basic structure - simplified check
  if (!data.INGREDIENT || !Array.isArray(data.INGREDIENT)) {
    return {
      valid: false,
      error: 'Invalid TPN configuration structure',
      errors: ['Configuration must have INGREDIENT array']
    }
  }
  
  if (!data.FLEX || !Array.isArray(data.FLEX)) {
    return {
      valid: false,
      error: 'Invalid TPN configuration structure',
      errors: ['Configuration must have FLEX array']
    }
  }
  
  const config = data as TPNConfiguration
  
  // Validate population type if provided
  if (config.populationType && !isPopulationType(config.populationType)) {
    errors.push(`Invalid population type: ${config.populationType}`)
  }
  
  // Validate each ingredient - relaxed validation for reference configs
  const ingredientKeys = new Set<string>()
  config.INGREDIENT.forEach((ingredient: any, index) => {
    // Check for duplicate KEYNAME
    if (ingredient.KEYNAME) {
      if (ingredientKeys.has(ingredient.KEYNAME)) {
        errors.push(`Duplicate KEYNAME at ingredient ${index}: ${ingredient.KEYNAME}`)
      }
      ingredientKeys.add(ingredient.KEYNAME)
    }
    
    // Only validate fields if they exist - configs may have optional fields
    if (ingredient.OSMO_RATIO !== undefined && ingredient.OSMO_RATIO !== null) {
      if (typeof ingredient.OSMO_RATIO !== 'number' || isNaN(ingredient.OSMO_RATIO)) {
        errors.push(`Invalid OSMO_RATIO at ingredient ${index}: must be a number`)
      }
    }
    
    if (ingredient.PRECISION !== undefined && ingredient.PRECISION !== null) {
      if (!Number.isInteger(ingredient.PRECISION) || ingredient.PRECISION < 0 || ingredient.PRECISION > 10) {
        errors.push(`Invalid PRECISION at ingredient ${index}: must be integer 0-10`)
      }
    }
    
    if (ingredient.TYPE && !isIngredientType(ingredient.TYPE)) {
      errors.push(`Invalid TYPE at ingredient ${index}: ${ingredient.TYPE}`)
    }
    
    if (ingredient.EDITMODE && !isEditMode(ingredient.EDITMODE)) {
      errors.push(`Invalid EDITMODE at ingredient ${index}: ${ingredient.EDITMODE}`)
    }
    
    // Only validate REFERENCE_RANGE if it exists
    if (ingredient.REFERENCE_RANGE && Array.isArray(ingredient.REFERENCE_RANGE)) {
      ingredient.REFERENCE_RANGE.forEach((range: any, rangeIndex: number) => {
        if (range.THRESHOLD && !isThresholdType(range.THRESHOLD)) {
          errors.push(`Invalid threshold type at ingredient ${index}, range ${rangeIndex}: ${range.THRESHOLD}`)
        }
      })
    }
    
    // Only validate CONCENTRATION if it exists
    if (ingredient.CONCENTRATION) {
      const conc = ingredient.CONCENTRATION
      // Allow both numbers and numeric strings, null is also valid
      if (conc.STRENGTH !== undefined && conc.STRENGTH !== null && conc.STRENGTH !== '') {
        if (typeof conc.STRENGTH === 'string' || typeof conc.STRENGTH === 'number') {
          const strengthNum = Number(conc.STRENGTH)
          if (isNaN(strengthNum)) {
            errors.push(`Invalid CONCENTRATION.STRENGTH at ingredient ${index}: must be a number`)
          }
        }
      }
      if (conc.VOLUME !== undefined && conc.VOLUME !== null && conc.VOLUME !== '') {
        if (typeof conc.VOLUME === 'string' || typeof conc.VOLUME === 'number') {
          const volumeNum = Number(conc.VOLUME)
          if (isNaN(volumeNum)) {
            errors.push(`Invalid CONCENTRATION.VOLUME at ingredient ${index}: must be a number`)
          }
        }
      }
    }
  })
  
  // Validate FLEX configurations - relaxed validation
  config.FLEX.forEach((flex: any, index) => {
    // Check if FLEX NAME references existing configuration
    if (!flex.NAME || typeof flex.NAME !== 'string') {
      errors.push(`Invalid FLEX NAME at index ${index}`)
    }
    
    // Validate ALT_VALUE if present
    if (flex.ALT_VALUE && Array.isArray(flex.ALT_VALUE)) {
      flex.ALT_VALUE.forEach((alt: any, altIndex: number) => {
        if (!alt.CHECKTYPE || !alt.CHECKMATCH || !alt.OVERRIDE_VALUE) {
          errors.push(`Invalid ALT_VALUE at FLEX ${index}, alt ${altIndex}: missing required fields`)
        }
      })
    }
  })
  
  if (errors.length > 0) {
    return {
      valid: false,
      error: 'Validation failed with multiple errors',
      errors,
      dataType: 'tpn-full'
    }
  }
  
  return {
    valid: true,
    dataType: 'tpn-full',
    itemCount: config.INGREDIENT.length,
    populationType: config.populationType
  }
}

export function validatePopulationType(populationType: unknown): ValidationResult {
  if (!isPopulationType(populationType)) {
    return {
      valid: false,
      error: `Invalid population type. Must be one of: NEO, CHILD, ADOLESCENT, ADULT`
    }
  }
  
  return {
    valid: true,
    populationType: populationType as PopulationType
  }
}

export function detectPopulationTypeFromFilename(filename: string): PopulationType | null {
  const lowerFilename = filename.toLowerCase()
  
  if (lowerFilename.includes('neo')) return 'NEO'
  if (lowerFilename.includes('child')) return 'CHILD'
  if (lowerFilename.includes('adolescent')) return 'ADOLESCENT'
  if (lowerFilename.includes('adult')) return 'ADULT'
  
  return null
}