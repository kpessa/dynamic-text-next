export interface ValidationResult {
  valid: boolean
  error?: string
  dataType?: string
  itemCount?: number
}

export function detectDataType(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'unknown'
  }
  
  const obj = data as Record<string, unknown>
  
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