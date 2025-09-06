import { createFunctionCaller } from '../functionsService'
import {
  GeneratePDFInput,
  GeneratePDFOutput,
  ExportDataInput,
  ExportDataOutput,
  GenerateReportInput,
  GenerateReportOutput,
} from '@/shared/types/functions/document'

export const generatePDF = createFunctionCaller<
  GeneratePDFInput,
  GeneratePDFOutput
>('generatePDF', {
  maxRetries: 2,
  initialDelayMs: 2000,
})

export const exportData = createFunctionCaller<
  ExportDataInput,
  ExportDataOutput
>('exportData', {
  maxRetries: 3,
  initialDelayMs: 1500,
})

export const generateReport = createFunctionCaller<
  GenerateReportInput,
  GenerateReportOutput
>('generateReport', {
  maxRetries: 2,
  initialDelayMs: 3000,
})

export const convertDocument = createFunctionCaller<
  {
    sourceUrl: string
    targetFormat: 'pdf' | 'word' | 'html' | 'markdown'
    options?: Record<string, unknown>
  },
  {
    url: string
    format: string
    fileName: string
  }
>('convertDocument', {
  maxRetries: 2,
  initialDelayMs: 2000,
})