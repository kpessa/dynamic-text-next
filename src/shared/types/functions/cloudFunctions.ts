import { TPNFunctionNames } from './tpn'
import { DocumentFunctionNames } from './document'
import { AIFunctionNames } from './ai'

export interface CloudFunctions
  extends TPNFunctionNames,
    DocumentFunctionNames,
    AIFunctionNames {}

export type CloudFunctionName = keyof CloudFunctions

export type CloudFunctionInput<T extends CloudFunctionName> = CloudFunctions[T]['input']

export type CloudFunctionOutput<T extends CloudFunctionName> = CloudFunctions[T]['output']

export type CloudFunctionMap = {
  [K in CloudFunctionName]: {
    input: CloudFunctionInput<K>
    output: CloudFunctionOutput<K>
  }
}

export const CLOUD_FUNCTION_NAMES: Record<CloudFunctionName, CloudFunctionName> = {
  // TPN Functions
  calculateTPNValues: 'calculateTPNValues',
  validateIngredients: 'validateIngredients',
  optimizeFormula: 'optimizeFormula',
  compareFormulas: 'compareFormulas',
  
  // Document Functions
  generatePDF: 'generatePDF',
  exportData: 'exportData',
  generateReport: 'generateReport',
  convertDocument: 'convertDocument',
  
  // AI Functions
  generateTestCases: 'generateTestCases',
  getRecommendations: 'getRecommendations',
  analyzeFormula: 'analyzeFormula',
  predictOutcome: 'predictOutcome',
  suggestIngredients: 'suggestIngredients',
  validateMedicalContent: 'validateMedicalContent',
} as const

export function isCloudFunctionName(name: string): name is CloudFunctionName {
  return name in CLOUD_FUNCTION_NAMES
}