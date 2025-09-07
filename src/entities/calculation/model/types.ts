export interface TPNCalculation {
  id: string
  patientId?: string
  patientName?: string
  date: Date | string
  populationType: 'NEO' | 'CHILD' | 'ADULT'
  status: 'draft' | 'completed'
}