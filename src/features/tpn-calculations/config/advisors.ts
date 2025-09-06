import type { TPNAdvisorType, AdvisorConfig, ReferenceRange } from '@/entities/tpn'

export const advisorConfigs: Record<TPNAdvisorType, AdvisorConfig> = {
  NEO: {
    aliases: ['neonatal', 'infant', 'newborn', 'neonate', 'premature'],
    weightRange: { min: 0.5, max: 10 },
    calculations: {
      calories: 'weight * 100',
      protein: 'weight * 3.5',
      carbohydrates: 'weight * 12',
      lipids: 'weight * 3',
      sodium: 'weight * 3',
      potassium: 'weight * 2.5',
      calcium: 'weight * 2',
      magnesium: 'weight * 0.3',
      phosphorus: 'weight * 1.5'
    }
  },
  CHILD: {
    aliases: ['child', 'pediatric', 'paediatric', 'kid'],
    weightRange: { min: 10, max: 30 },
    calculations: {
      calories: '1000 + (weight * 50)',
      protein: 'weight * 2.5',
      carbohydrates: 'weight * 10',
      lipids: 'weight * 2.5',
      sodium: 'weight * 2.5',
      potassium: 'weight * 2',
      calcium: 'weight * 1.5',
      magnesium: 'weight * 0.25',
      phosphorus: 'weight * 1'
    }
  },
  ADOLESCENT: {
    aliases: ['teen', 'teenager', 'adolescent', 'youth'],
    weightRange: { min: 30, max: 60 },
    calculations: {
      calories: '(weight * 50) + 500',
      protein: 'weight * 2',
      carbohydrates: 'weight * 8',
      lipids: 'weight * 2',
      sodium: 'weight * 2',
      potassium: 'weight * 1.5',
      calcium: 'weight * 1',
      magnesium: 'weight * 0.2',
      phosphorus: 'weight * 0.8'
    }
  },
  ADULT: {
    aliases: ['adult', 'elderly', 'geriatric', 'senior'],
    weightRange: { min: 40, max: 200 },
    calculations: {
      calories: 'weight * 30',
      protein: 'weight * 1.2',
      carbohydrates: 'weight * 4',
      lipids: 'weight * 1',
      sodium: 'weight * 2',
      potassium: 'weight * 1',
      calcium: 'weight * 0.5',
      magnesium: 'weight * 0.15',
      phosphorus: 'weight * 0.5'
    }
  }
}

const referenceRanges: ReferenceRange[] = [
  // Sodium ranges (mEq/kg)
  { threshold: 'min', value: 2, advisorType: 'NEO', unit: 'mEq/kg', ingredient: 'sodium' },
  { threshold: 'max', value: 4, advisorType: 'NEO', unit: 'mEq/kg', ingredient: 'sodium' },
  { threshold: 'min', value: 2, advisorType: 'CHILD', unit: 'mEq/kg', ingredient: 'sodium' },
  { threshold: 'max', value: 3.5, advisorType: 'CHILD', unit: 'mEq/kg', ingredient: 'sodium' },
  { threshold: 'min', value: 1.5, advisorType: 'ADOLESCENT', unit: 'mEq/kg', ingredient: 'sodium' },
  { threshold: 'max', value: 3, advisorType: 'ADOLESCENT', unit: 'mEq/kg', ingredient: 'sodium' },
  { threshold: 'min', value: 2, advisorType: 'ADULT', unit: 'mEq/kg', ingredient: 'sodium' },
  { threshold: 'max', value: 3, advisorType: 'ADULT', unit: 'mEq/kg', ingredient: 'sodium' },
  
  // Potassium ranges (mEq/kg)
  { threshold: 'min', value: 2, advisorType: 'NEO', unit: 'mEq/kg', ingredient: 'potassium' },
  { threshold: 'max', value: 3, advisorType: 'NEO', unit: 'mEq/kg', ingredient: 'potassium' },
  { threshold: 'min', value: 1.5, advisorType: 'CHILD', unit: 'mEq/kg', ingredient: 'potassium' },
  { threshold: 'max', value: 2.5, advisorType: 'CHILD', unit: 'mEq/kg', ingredient: 'potassium' },
  { threshold: 'min', value: 1, advisorType: 'ADOLESCENT', unit: 'mEq/kg', ingredient: 'potassium' },
  { threshold: 'max', value: 2, advisorType: 'ADOLESCENT', unit: 'mEq/kg', ingredient: 'potassium' },
  { threshold: 'min', value: 1, advisorType: 'ADULT', unit: 'mEq/kg', ingredient: 'potassium' },
  { threshold: 'max', value: 2, advisorType: 'ADULT', unit: 'mEq/kg', ingredient: 'potassium' },
  
  // Calcium ranges (mEq/kg)
  { threshold: 'min', value: 1, advisorType: 'NEO', unit: 'mEq/kg', ingredient: 'calcium' },
  { threshold: 'max', value: 2.5, advisorType: 'NEO', unit: 'mEq/kg', ingredient: 'calcium' },
  { threshold: 'min', value: 0.5, advisorType: 'CHILD', unit: 'mEq/kg', ingredient: 'calcium' },
  { threshold: 'max', value: 2, advisorType: 'CHILD', unit: 'mEq/kg', ingredient: 'calcium' },
  { threshold: 'min', value: 0.5, advisorType: 'ADOLESCENT', unit: 'mEq/kg', ingredient: 'calcium' },
  { threshold: 'max', value: 1.5, advisorType: 'ADOLESCENT', unit: 'mEq/kg', ingredient: 'calcium' },
  { threshold: 'min', value: 0.2, advisorType: 'ADULT', unit: 'mEq/kg', ingredient: 'calcium' },
  { threshold: 'max', value: 1, advisorType: 'ADULT', unit: 'mEq/kg', ingredient: 'calcium' },
  
  // Magnesium ranges (mEq/kg)
  { threshold: 'min', value: 0.2, advisorType: 'NEO', unit: 'mEq/kg', ingredient: 'magnesium' },
  { threshold: 'max', value: 0.4, advisorType: 'NEO', unit: 'mEq/kg', ingredient: 'magnesium' },
  { threshold: 'min', value: 0.15, advisorType: 'CHILD', unit: 'mEq/kg', ingredient: 'magnesium' },
  { threshold: 'max', value: 0.35, advisorType: 'CHILD', unit: 'mEq/kg', ingredient: 'magnesium' },
  { threshold: 'min', value: 0.1, advisorType: 'ADOLESCENT', unit: 'mEq/kg', ingredient: 'magnesium' },
  { threshold: 'max', value: 0.3, advisorType: 'ADOLESCENT', unit: 'mEq/kg', ingredient: 'magnesium' },
  { threshold: 'min', value: 0.1, advisorType: 'ADULT', unit: 'mEq/kg', ingredient: 'magnesium' },
  { threshold: 'max', value: 0.2, advisorType: 'ADULT', unit: 'mEq/kg', ingredient: 'magnesium' },
  
  // Phosphorus ranges (mmol/kg)
  { threshold: 'min', value: 1, advisorType: 'NEO', unit: 'mmol/kg', ingredient: 'phosphorus' },
  { threshold: 'max', value: 2, advisorType: 'NEO', unit: 'mmol/kg', ingredient: 'phosphorus' },
  { threshold: 'min', value: 0.5, advisorType: 'CHILD', unit: 'mmol/kg', ingredient: 'phosphorus' },
  { threshold: 'max', value: 1.5, advisorType: 'CHILD', unit: 'mmol/kg', ingredient: 'phosphorus' },
  { threshold: 'min', value: 0.5, advisorType: 'ADOLESCENT', unit: 'mmol/kg', ingredient: 'phosphorus' },
  { threshold: 'max', value: 1, advisorType: 'ADOLESCENT', unit: 'mmol/kg', ingredient: 'phosphorus' },
  { threshold: 'min', value: 0.3, advisorType: 'ADULT', unit: 'mmol/kg', ingredient: 'phosphorus' },
  { threshold: 'max', value: 0.7, advisorType: 'ADULT', unit: 'mmol/kg', ingredient: 'phosphorus' }
]

export function getAdvisorConfig(advisorType: TPNAdvisorType): AdvisorConfig {
  return advisorConfigs[advisorType]
}

export function getAdvisorByAlias(alias: string): TPNAdvisorType | null {
  const lowerAlias = alias.toLowerCase()
  
  for (const [type, config] of Object.entries(advisorConfigs)) {
    if (config.aliases.some(a => a.toLowerCase() === lowerAlias)) {
      return type as TPNAdvisorType
    }
  }
  
  return null
}

export function getCalculationForAdvisor(
  advisorType: TPNAdvisorType, 
  field: string
): string | null {
  const config = advisorConfigs[advisorType]
  return config.calculations[field] || null
}

export function getReferenceRangesForAdvisor(
  advisorType: TPNAdvisorType,
  ingredient: string
): ReferenceRange[] {
  return referenceRanges.filter(
    range => range.advisorType === advisorType && range.ingredient === ingredient
  )
}

export function isValueInRange(
  value: number,
  advisorType: TPNAdvisorType,
  ingredient: string
): boolean {
  const ranges = getReferenceRangesForAdvisor(advisorType, ingredient)
  
  if (ranges.length === 0) {
    return true
  }
  
  const minRange = ranges.find(r => r.threshold === 'min')
  const maxRange = ranges.find(r => r.threshold === 'max')
  
  if (minRange && value < minRange.value) {
    return false
  }
  
  if (maxRange && value > maxRange.value) {
    return false
  }
  
  return true
}