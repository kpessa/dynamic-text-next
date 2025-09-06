export type TPNAdvisorType = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'

export interface PatientProfile {
  age?: number
  weight?: number
  height?: number
  diagnosis?: string
  additionalNotes?: string
}

export interface TestResult {
  passed: boolean
  message?: string
  expected?: any
  actual?: any
  severity?: 'error' | 'warning' | 'info'
}

export interface SectionTestResult {
  sectionId: string
  sectionName: string
  tests: Record<string, TestResult>
  passed: boolean
  totalTests: number
  passedTests: number
}

export interface TestSummary {
  totalTests: number
  passedTests: number
  failedTests: number
  sections: SectionTestResult[]
  overallStatus: 'passed' | 'failed' | 'partial'
  lastRunAt: string
}

export interface Section {
  id: string
  name: string
  content: string
  order: number
  testCases?: TestCase[]
}

export interface TestCase {
  id: string
  name: string
  description?: string
  input: Record<string, any>
  expectedOutput: Record<string, any>
  actualOutput?: Record<string, any>
  result?: TestResult
}

export interface TPNSimulation {
  id: string
  name: string
  advisorType: TPNAdvisorType
  patientProfile: PatientProfile
  sections: Section[]
  testSummary?: TestSummary
  createdAt: string
  updatedAt: string
  healthSystem?: string
  populationType?: string
}

export interface SimulationSection {
  id: string
  simulationId: string
  name: string
  content: string
  order: number
  testCases: TestCase[]
  createdAt: string
  updatedAt: string
}