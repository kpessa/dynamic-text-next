export interface Ingredient {
  keyname: string
  name: string
  type: string
  referenceRanges?: ReferenceRange[]
}

export interface ReferenceRange {
  min: number
  max: number
  unit: string
  ageGroup?: string
}

export interface TPNConfiguration {
  version: string
  name: string
  advisorType: 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'
  ingredients: Ingredient[]
  calculations: Record<string, unknown>
  settings: Record<string, unknown>
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