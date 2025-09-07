export type PopulationType = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'

export type IngredientType = 
  | 'Macronutrient' 
  | 'Micronutrient'
  | 'Electrolyte' 
  | 'Mineral' 
  | 'Vitamin' 
  | 'Trace Element'
  | 'Additive'
  | 'Salt'
  | 'Diluent' 
  | 'Other'

export type EditMode = 'None' | 'Custom' | 'Standard' | 'ReadOnly'

export type ThresholdType = 
  | 'Feasible Low' 
  | 'Critical Low' 
  | 'Normal Low' 
  | 'Normal High' 
  | 'Critical High' 
  | 'Feasible High'

export interface NoteObject {
  TEXT: string
  TYPE?: string
}

export interface AltUOM {
  NAME: string
  UOM_DISP: string
  CONVERSION?: number
}

export interface ReferenceRange {
  THRESHOLD: ThresholdType
  VALUE: number
  POPULATION?: PopulationType
  AGE_MIN?: number
  AGE_MAX?: number
  AGE_UNIT?: string
}

export interface Lab {
  NAME: string
  CODE: string
  UOM: string
}

export interface Concentration {
  STRENGTH: number
  STRENGTH_UOM: string
  VOLUME: number
  VOLUME_UOM: string
}

export interface Exclude {
  KEYNAME: string
  REASON?: string
}

export interface Ingredient {
  KEYNAME: string
  DISPLAY: string
  MNEMONIC: string
  UOM_DISP: string
  TYPE: IngredientType
  OSMO_RATIO: number
  EDITMODE: EditMode
  PRECISION: number
  SPECIAL: string
  NOTE: NoteObject[]
  ALTUOM: AltUOM[]
  REFERENCE_RANGE: ReferenceRange[]
  LABS: Lab[]
  CONCENTRATION: Concentration
  EXCLUDES: Exclude[]
}

export interface AltValue {
  CHECKTYPE: string
  CHECKMATCH: string
  OVERRIDE_VALUE: string
}

export interface FlexConfig {
  NAME: string
  VALUE: string
  CONFIG_COMMENT?: string
  ALT_VALUE?: AltValue[]
}

export interface TPNConfiguration {
  INGREDIENT: Ingredient[]
  FLEX: FlexConfig[]
  populationType?: PopulationType
  healthSystem?: string
  version?: string
  name?: string
}

export interface IngredientsImport {
  version: string
  ingredients: Ingredient[]
}

export interface Section {
  title: string
  content: string
  subsections?: Section[]
}

export interface ReferenceImport {
  version: string
  reference: {
    name: string
    healthSystem?: string
    sections: Section[]
  }
}

export type ImportData = TPNConfiguration | IngredientsImport | ReferenceImport

// Type guards for runtime validation
export const isIngredientType = (value: unknown): value is IngredientType => {
  return typeof value === 'string' && [
    'Macronutrient',
    'Micronutrient',
    'Electrolyte',
    'Mineral',
    'Vitamin',
    'Trace Element',
    'Additive',
    'Salt',
    'Diluent',
    'Other'
  ].includes(value)
}

export const isEditMode = (value: unknown): value is EditMode => {
  return typeof value === 'string' && ['None', 'Custom', 'Standard', 'ReadOnly'].includes(value)
}

export const isThresholdType = (value: unknown): value is ThresholdType => {
  return typeof value === 'string' && [
    'Feasible Low',
    'Critical Low',
    'Normal Low',
    'Normal High',
    'Critical High',
    'Feasible High'
  ].includes(value)
}

export const isPopulationType = (value: unknown): value is PopulationType => {
  return typeof value === 'string' && ['NEO', 'CHILD', 'ADOLESCENT', 'ADULT'].includes(value)
}

export const isTPNConfiguration = (data: unknown): data is TPNConfiguration => {
  if (typeof data !== 'object' || data === null) return false
  const config = data as Record<string, unknown>
  
  return (
    Array.isArray(config.INGREDIENT) &&
    Array.isArray(config.FLEX) &&
    config.INGREDIENT.every(isValidIngredient) &&
    config.FLEX.every(isValidFlexConfig)
  )
}

export const isValidIngredient = (ingredient: unknown): ingredient is Ingredient => {
  if (typeof ingredient !== 'object' || ingredient === null) return false
  const ing = ingredient as Record<string, unknown>
  
  return (
    typeof ing.KEYNAME === 'string' &&
    typeof ing.DISPLAY === 'string' &&
    typeof ing.MNEMONIC === 'string' &&
    typeof ing.UOM_DISP === 'string' &&
    isIngredientType(ing.TYPE) &&
    typeof ing.OSMO_RATIO === 'number' &&
    isEditMode(ing.EDITMODE) &&
    typeof ing.PRECISION === 'number' &&
    typeof ing.SPECIAL === 'string' &&
    Array.isArray(ing.NOTE) &&
    Array.isArray(ing.ALTUOM) &&
    Array.isArray(ing.REFERENCE_RANGE) &&
    Array.isArray(ing.LABS) &&
    typeof ing.CONCENTRATION === 'object' &&
    Array.isArray(ing.EXCLUDES)
  )
}

export const isValidFlexConfig = (flex: unknown): flex is FlexConfig => {
  if (typeof flex !== 'object' || flex === null) return false
  const f = flex as Record<string, unknown>
  
  return (
    typeof f.NAME === 'string' &&
    typeof f.VALUE === 'string' &&
    (f.CONFIG_COMMENT === undefined || typeof f.CONFIG_COMMENT === 'string') &&
    (f.ALT_VALUE === undefined || Array.isArray(f.ALT_VALUE))
  )
}