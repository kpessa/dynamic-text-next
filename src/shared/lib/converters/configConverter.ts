import type { ConfigIngredient, ReferenceConfiguration } from '@/entities/config/types'
import type { Ingredient, IngredientCategory, PopulationType, ReferenceRange } from '@/entities/ingredient/types'
import type { Reference } from '@/entities/reference/types'

// Map config ingredient types to application categories
const mapIngredientType = (type: string): IngredientCategory => {
  const typeMap: Record<string, IngredientCategory> = {
    'Macronutrient': 'macro',
    'Micronutrient': 'micro',
    'Salt': 'electrolyte',
    'Additive': 'vitamin',
    'Diluent': 'other',
    'Other': 'other'
  }
  return typeMap[type] || 'other'
}

// Convert reference ranges from config format to application format
const convertReferenceRanges = (
  ranges: ConfigIngredient['REFERENCE_RANGE'],
  populationType: PopulationType
): ReferenceRange[] => {
  const rangeMap: ReferenceRange = {
    populationType,
    unit: '',
    normal: { low: 0, high: 0 },
    critical: { low: 0, high: 0 },
    feasible: { low: 0, high: 0 }
  }

  ranges.forEach(range => {
    const value = range.VALUE
    switch (range.THRESHOLD) {
      case 'Normal Low':
        if (rangeMap.normal) rangeMap.normal.low = value
        break
      case 'Normal High':
        if (rangeMap.normal) rangeMap.normal.high = value
        break
      case 'Critical Low':
        if (rangeMap.critical) rangeMap.critical.low = value
        break
      case 'Critical High':
        if (rangeMap.critical) rangeMap.critical.high = value
        break
      case 'Feasible Low':
        if (rangeMap.feasible) rangeMap.feasible.low = value
        break
      case 'Feasible High':
        if (rangeMap.feasible) rangeMap.feasible.high = value
        break
    }
  })

  return [rangeMap]
}

// Convert a config ingredient to application ingredient
export const convertConfigIngredient = (
  configIngredient: ConfigIngredient,
  populationType: PopulationType,
  healthSystem: string
): Ingredient => {
  const now = new Date().toISOString()
  
  return {
    id: `${healthSystem}-${populationType}-${configIngredient.KEYNAME}`.toLowerCase(),
    keyname: configIngredient.KEYNAME,
    displayName: configIngredient.DISPLAY,
    mnemonic: configIngredient.MNEMONIC,
    category: mapIngredientType(configIngredient.TYPE),
    unit: configIngredient.UOM_DISP,
    alternateUnits: configIngredient.ALTUOM.map(alt => ({
      name: alt.NAME,
      unit: alt.UOM_DISP
    })),
    referenceRanges: convertReferenceRanges(configIngredient.REFERENCE_RANGE, populationType),
    isShared: false,
    healthSystem,
    populationType,
    osmolalityRatio: configIngredient.OSMO_RATIO,
    precision: configIngredient.PRECISION,
    excludes: configIngredient.EXCLUDES.map(e => e.keyname),
    labs: configIngredient.LABS.map(lab => ({
      displayName: lab.DISPLAY,
      eventSetName: lab.EVENT_SET_NAME,
      shouldGraph: lab.GRAPH === 1
    })),
    notes: configIngredient.NOTE.map(n => n.TEXT),
    createdAt: now,
    updatedAt: now
  }
}

// Convert entire configuration to ingredients
export const convertConfigToIngredients = (
  config: ReferenceConfiguration,
  populationType: PopulationType,
  healthSystem: string
): Ingredient[] => {
  return config.INGREDIENT.map(configIngr => 
    convertConfigIngredient(configIngr, populationType, healthSystem)
  )
}

// Parse a config file name to extract metadata
export const parseConfigFileName = (fileName: string): {
  populationType: PopulationType
  buildStatus: 'build' | 'cert'
  healthSystem: string
} | null => {
  // Example: neo-cert-east-uhs.json or child-build-main-choc.json
  const parts = fileName.replace('.json', '').split('-')
  if (parts.length < 3) return null

  const populationMap: Record<string, PopulationType> = {
    'neo': 'NEO',
    'child': 'CHILD',
    'adolescent': 'ADOLESCENT',
    'adult': 'ADULT'
  }

  const populationType = populationMap[parts[0].toLowerCase()]
  const buildStatus = parts[1] === 'cert' ? 'cert' : 'build'
  const healthSystem = parts.slice(2).join('-')

  if (!populationType) return null

  return {
    populationType,
    buildStatus,
    healthSystem
  }
}

// Create a reference from a configuration file
export const createReferenceFromConfig = (
  config: ReferenceConfiguration,
  fileName: string
): Reference | null => {
  const metadata = parseConfigFileName(fileName)
  if (!metadata) return null

  const now = new Date().toISOString()
  
  return {
    id: fileName.replace('.json', ''),
    name: `${metadata.populationType} ${metadata.buildStatus} - ${metadata.healthSystem}`,
    fileName,
    healthSystem: metadata.healthSystem,
    populationType: metadata.populationType,
    buildStatus: metadata.buildStatus,
    validationStatus: 'draft',
    importedConfig: config,
    sections: [],
    createdAt: now,
    updatedAt: now
  }
}