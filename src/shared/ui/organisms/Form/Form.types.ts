import { ReactNode } from 'react'
import { FieldValues, UseFormReturn, SubmitHandler, DefaultValues, Mode } from 'react-hook-form'
import { AnyObjectSchema } from 'yup'
import { SxProps, Theme } from '@mui/material'

export interface FieldConfig {
  name: string
  label?: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local' | 
        'select' | 'multiselect' | 'checkbox' | 'radio' | 'switch' | 'textarea' | 'file' | 'custom'
  placeholder?: string
  defaultValue?: any
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  helperText?: string
  
  // Validation
  validation?: {
    required?: string | boolean
    min?: { value: number; message?: string }
    max?: { value: number; message?: string }
    minLength?: { value: number; message?: string }
    maxLength?: { value: number; message?: string }
    pattern?: { value: RegExp; message?: string }
    validate?: Record<string, (value: any) => boolean | string>
  }
  
  // Field-specific options
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  multiple?: boolean
  rows?: number
  accept?: string
  autoComplete?: string
  autoFocus?: boolean
  
  // Layout
  gridProps?: {
    xs?: number | 'auto' | boolean
    sm?: number | 'auto' | boolean
    md?: number | 'auto' | boolean
    lg?: number | 'auto' | boolean
    xl?: number | 'auto' | boolean
  }
  
  // Conditional rendering
  showWhen?: (values: any) => boolean
  
  // Custom component
  component?: (props: FieldRenderProps) => ReactNode
  
  // Formatting
  transform?: {
    input?: (value: any) => any
    output?: (value: any) => any
  }
}

export interface FieldRenderProps {
  field: any
  fieldState: any
  formState: any
  fieldConfig: FieldConfig
}

export interface FormSection {
  title?: string
  description?: string
  fields: FieldConfig[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface FormProps<T extends FieldValues = FieldValues> {
  // Form configuration
  fields?: FieldConfig[]
  sections?: FormSection[]
  defaultValues?: DefaultValues<T>
  
  // Validation
  validationSchema?: AnyObjectSchema
  validationMode?: Mode
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  
  // Submission
  onSubmit: SubmitHandler<T>
  onError?: (errors: any) => void
  
  // Form control
  form?: UseFormReturn<T>
  
  // UI Options
  submitLabel?: string
  resetLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  
  showReset?: boolean
  showCancel?: boolean
  submitOnEnter?: boolean
  
  loading?: boolean
  disabled?: boolean
  
  // Layout
  layout?: 'vertical' | 'horizontal' | 'inline'
  spacing?: number
  columns?: 1 | 2 | 3 | 4
  
  // Styling
  sx?: SxProps<Theme>
  formSx?: SxProps<Theme>
  buttonsSx?: SxProps<Theme>
  
  // Feedback
  successMessage?: string
  errorMessage?: string
  showValidationSummary?: boolean
  
  // Auto-save
  autoSave?: boolean
  autoSaveDelay?: number
  onAutoSave?: (data: T) => void
  
  // Custom components
  customButtons?: ReactNode
  header?: ReactNode
  footer?: ReactNode
}

export interface StepperFormStep<T extends FieldValues = FieldValues> {
  label: string
  description?: string
  fields?: FieldConfig[]
  sections?: FormSection[]
  validationSchema?: AnyObjectSchema
  optional?: boolean
  canSkip?: boolean
  onStepSubmit?: (data: Partial<T>) => void | Promise<void>
}

export interface StepperFormProps<T extends FieldValues = FieldValues> {
  steps: StepperFormStep<T>[]
  defaultValues?: DefaultValues<T>
  
  // Submission
  onSubmit: SubmitHandler<T>
  onError?: (errors: any) => void
  
  // Navigation
  onStepChange?: (step: number) => void
  defaultStep?: number
  
  // UI Options
  orientation?: 'horizontal' | 'vertical'
  alternativeLabel?: boolean
  nonLinear?: boolean
  
  showReviewStep?: boolean
  reviewStepLabel?: string
  
  nextLabel?: string
  backLabel?: string
  skipLabel?: string
  finishLabel?: string
  resetLabel?: string
  
  loading?: boolean
  disabled?: boolean
  
  // Validation
  validateOnStepChange?: boolean
  
  // Layout
  spacing?: number
  
  // Styling
  sx?: SxProps<Theme>
  stepperSx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
  buttonsSx?: SxProps<Theme>
  
  // Custom components
  customStepIcon?: (props: { active: boolean; completed: boolean; error: boolean }) => ReactNode
  header?: ReactNode
  footer?: ReactNode
}