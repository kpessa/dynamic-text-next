export interface FileUploadFile {
  file: File
  id: string
  name: string
  size: number
  type: string
  progress?: number
  error?: string
  preview?: string
}

export interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  maxFiles?: number
  files?: FileUploadFile[]
  onFilesChange?: (files: FileUploadFile[]) => void
  onFileRemove?: (fileId: string) => void
  onUpload?: (files: File[]) => Promise<void>
  disabled?: boolean
  showPreview?: boolean
  showFileList?: boolean
  label?: string
  helperText?: string
  error?: boolean
  errorMessage?: string
  dragActiveText?: string
  dropzoneText?: string
  buttonText?: string
  fullWidth?: boolean
  sx?: any
  className?: string
}