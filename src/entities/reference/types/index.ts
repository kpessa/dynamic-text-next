// Application domain types for references
// These support sections, test cases, and other functionality

import type { ReferenceConfiguration } from '@/entities/config/types'

export type PopulationType = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'
export type ValidationStatus = 'draft' | 'validated' | 'archived'
export type BuildStatus = 'build' | 'cert'

export interface ReferenceSection {
  id: string
  name: string
  content: string
  order: number
  isActive: boolean
  testCases?: TestCase[]
}

export interface TestCase {
  id: string
  name: string
  description?: string
  input: Record<string, any>
  expectedOutput: Record<string, any>
  actualOutput?: Record<string, any>
  passed?: boolean
  message?: string
}

// Main reference document that can contain both imported config and sections
export interface Reference {
  id: string
  name: string
  fileName?: string
  healthSystem: string
  populationType: PopulationType
  buildStatus?: BuildStatus
  validationStatus: ValidationStatus
  
  // Can store imported configuration
  importedConfig?: ReferenceConfiguration
  
  // Application sections with content and test cases
  sections: ReferenceSection[]
  
  version?: number
  createdAt: string
  updatedAt: string
  validatedAt?: string
  validatedBy?: string
  notes?: string
}

export interface ReferenceDocument {
  id: string
  referenceId: string
  name: string
  content: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoadedReference {
  id: string
  name: string
  healthSystem: string
  populationType: PopulationType
  sections: ReferenceSection[]
  isLoaded: boolean
  loadedAt?: string
}