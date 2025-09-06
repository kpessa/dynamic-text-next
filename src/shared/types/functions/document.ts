import { TPNFormula, TPNCalculationResult } from './tpn'

export interface DocumentTemplate {
  id: string
  name: string
  type: 'pdf' | 'word' | 'excel' | 'html'
  sections: DocumentSection[]
  styles?: DocumentStyles
  metadata?: Record<string, unknown>
}

export interface DocumentSection {
  id: string
  type: 'header' | 'content' | 'table' | 'chart' | 'footer'
  content: string | unknown
  formatting?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    fontSize?: number
    fontFamily?: string
    color?: string
    alignment?: 'left' | 'center' | 'right' | 'justify'
  }
}

export interface DocumentStyles {
  pageSize?: 'A4' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top: number
    bottom: number
    left: number
    right: number
  }
  headerHeight?: number
  footerHeight?: number
  fontFamily?: string
  fontSize?: number
}

export interface GeneratePDFInput {
  documentId?: string
  template?: DocumentTemplate
  data: {
    title?: string
    patient?: {
      name: string
      id: string
      dateOfBirth?: string
    }
    formula?: TPNFormula
    calculation?: TPNCalculationResult
    additionalData?: Record<string, unknown>
  }
  options?: {
    includeHeader?: boolean
    includeFooter?: boolean
    includePageNumbers?: boolean
    watermark?: string
    password?: string
  }
}

export interface GeneratePDFOutput {
  url: string
  fileName: string
  sizeBytes: number
  pageCount: number
  expiresAt: number
  documentId: string
}

export interface ExportDataInput {
  format: 'csv' | 'json' | 'excel' | 'xml'
  dataType: 'formulas' | 'calculations' | 'ingredients' | 'patients' | 'all'
  filters?: {
    dateFrom?: number
    dateTo?: number
    ids?: string[]
    tags?: string[]
  }
  options?: {
    includeMetadata?: boolean
    includeCalculations?: boolean
    flatten?: boolean
    customFields?: string[]
  }
}

export interface ExportDataOutput {
  url: string
  fileName: string
  format: string
  sizeBytes: number
  recordCount: number
  expiresAt: number
  exportId: string
}

export interface GenerateReportInput {
  reportType: 'summary' | 'detailed' | 'comparison' | 'trend' | 'audit'
  period?: {
    from: number
    to: number
  }
  entities?: {
    formulaIds?: string[]
    patientIds?: string[]
  }
  sections?: Array<'overview' | 'details' | 'charts' | 'recommendations' | 'appendix'>
  format?: 'pdf' | 'html' | 'word'
}

export interface GenerateReportOutput {
  reportId: string
  url: string
  fileName: string
  format: string
  generatedAt: number
  expiresAt: number
  metadata: {
    pageCount?: number
    chartCount?: number
    tableCount?: number
  }
}

export interface DocumentFunctionNames {
  generatePDF: {
    input: GeneratePDFInput
    output: GeneratePDFOutput
  }
  exportData: {
    input: ExportDataInput
    output: ExportDataOutput
  }
  generateReport: {
    input: GenerateReportInput
    output: GenerateReportOutput
  }
  convertDocument: {
    input: {
      sourceUrl: string
      targetFormat: 'pdf' | 'word' | 'html' | 'markdown'
      options?: Record<string, unknown>
    }
    output: {
      url: string
      format: string
      fileName: string
    }
  }
}