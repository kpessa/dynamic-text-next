// Types that match the exact schema from refs/schema.json
// These are used for importing/exporting configuration files

export type IngredientType = 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other'
export type ThresholdType = 'Feasible Low' | 'Critical Low' | 'Normal Low' | 'Normal High' | 'Critical High' | 'Feasible High'
export type EditMode = 'None' | 'Custom'

export interface ConfigReferenceRange {
  THRESHOLD: ThresholdType
  VALUE: number
}

export interface ConfigAltUOM {
  NAME: string
  UOM_DISP: string
}

export interface ConfigLab {
  DISPLAY: string
  EVENT_SET_NAME: string
  GRAPH: 0 | 1
}

export interface ConfigConcentration {
  STRENGTH: number
  STRENGTH_UOM: string
  VOLUME: number
  VOLUME_UOM: string
}

export interface ConfigNote {
  TEXT: string
}

export interface ConfigExclude {
  keyname: string
}

// This matches the INGREDIENT array items in the config JSON
export interface ConfigIngredient {
  KEYNAME: string
  DISPLAY: string
  MNEMONIC: string
  UOM_DISP: string
  TYPE: IngredientType
  OSMO_RATIO: number
  EDITMODE: EditMode
  PRECISION: number
  SPECIAL: string
  NOTE: ConfigNote[]
  ALTUOM: ConfigAltUOM[]
  REFERENCE_RANGE: ConfigReferenceRange[]
  LABS: ConfigLab[]
  CONCENTRATION: ConfigConcentration
  EXCLUDES: ConfigExclude[]
}

export interface ConfigFlexAltValue {
  CHECKTYPE: 'Facility'
  CHECKMATCH: string
  OVERRIDE_VALUE: string
}

export interface ConfigFlexSetting {
  NAME: string
  VALUE: string
  CONFIG_COMMENT?: string
  ALT_VALUE: ConfigFlexAltValue[]
}

// This matches the complete configuration file structure
export interface ReferenceConfiguration {
  INGREDIENT: ConfigIngredient[]
  FLEX: ConfigFlexSetting[]
}