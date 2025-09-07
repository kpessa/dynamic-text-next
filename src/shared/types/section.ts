/**
 * Section and Test Types
 * Core types for document sections and test cases
 */

export interface TestCase {
  name: string
  variables: Record<string, any>
  expected: string
  matchType: 'exact' | 'contains' | 'regex' | 'styles'
  expectedStyles?: Record<string, any>
}

export interface Section {
  id: number
  type: 'static' | 'dynamic'
  name: string
  content: string
  testCases: TestCase[]
}

export interface TestResult {
  passed: boolean
  actual?: string
  expected?: string
  error?: string
  testCase: TestCase
}

export interface SectionTestResult {
  sectionId: number
  sectionName: string
  results: TestResult[]
}

export interface TestSummary {
  sections: SectionTestResult[]
  summary: {
    total: number
    passed: number
    failed: number
  }
}

export interface LoadedIngredient {
  id?: string
  name: string
  keyname?: string
  type?: 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other'
  referenceRanges?: any[]
}