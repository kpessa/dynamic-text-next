import React, { useState, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import { FileUploadProps, FileUploadFile } from './FileUpload.types'

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      files: controlledFiles,
      onFilesChange,
      onFileRemove,
      onUpload,
      disabled = false,
      showPreview = true,
      showFileList = true,
      label,
      helperText,
      error = false,
      errorMessage,
      dragActiveText = 'Drop files here...',
      dropzoneText = 'Drag & drop files here, or click to select',
      buttonText = 'Choose Files',
      fullWidth = true,
      sx,
      className
    },
    ref
  ) => {
    const [internalFiles, setInternalFiles] = useState<FileUploadFile[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    
    const files = controlledFiles !== undefined ? controlledFiles : internalFiles

    const handleDrag = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    }, [])

    const validateFiles = (fileList: File[]): { valid: File[], errors: string[] } => {
      const valid: File[] = []
      const errors: string[] = []

      fileList.forEach(file => {
        if (maxSize && file.size > maxSize) {
          errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`)
        } else if (accept) {
          const acceptedTypes = accept.split(',').map(t => t.trim())
          const fileType = file.type || ''
          const fileExtension = '.' + file.name.split('.').pop()
          
          const isAccepted = acceptedTypes.some(type => {
            if (type.startsWith('.')) {
              return fileExtension.toLowerCase() === type.toLowerCase()
            }
            if (type.endsWith('/*')) {
              return fileType.startsWith(type.replace('/*', ''))
            }
            return fileType === type
          })
          
          if (!isAccepted) {
            errors.push(`${file.name} is not an accepted file type`)
          } else {
            valid.push(file)
          }
        } else {
          valid.push(file)
        }
      })

      if (maxFiles && files.length + valid.length > maxFiles) {
        const allowed = maxFiles - files.length
        valid.splice(allowed)
        errors.push(`Maximum ${maxFiles} files allowed`)
      }

      return { valid, errors }
    }

    const processFiles = async (fileList: File[]) => {
      const { valid, errors } = validateFiles(fileList)
      
      if (errors.length > 0) {
        setUploadError(errors.join(', '))
        setTimeout(() => setUploadError(null), 5000)
      }

      if (valid.length === 0) return

      const newFiles: FileUploadFile[] = valid.map(file => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }))

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles
      
      setInternalFiles(updatedFiles)
      if (onFilesChange) {
        onFilesChange(updatedFiles)
      }

      if (onUpload) {
        try {
          await onUpload(valid)
        } catch (err) {
          setUploadError('Upload failed')
        }
      }
    }

    const handleDrop = useCallback(async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      
      if (disabled) return
      
      const droppedFiles = Array.from(e.dataTransfer.files)
      await processFiles(droppedFiles)
    }, [disabled, files, multiple, maxSize, maxFiles, accept])

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files)
        await processFiles(selectedFiles)
      }
    }

    const handleRemove = (fileId: string) => {
      const updatedFiles = files.filter(f => f.id !== fileId)
      setInternalFiles(updatedFiles)
      
      if (onFilesChange) {
        onFilesChange(updatedFiles)
      }
      
      if (onFileRemove) {
        onFileRemove(fileId)
      }
      
      // Clean up preview URL
      const file = files.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
    }

    const handleButtonClick = () => {
      inputRef.current?.click()
    }

    return (
      <Box
        ref={ref}
        sx={{ width: fullWidth ? '100%' : 'auto', ...sx }}
        className={className}
      >
        {label && (
          <Typography variant="subtitle1" gutterBottom>
            {label}
          </Typography>
        )}
        
        <Paper
          variant="outlined"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            p: 3,
            textAlign: 'center',
            cursor: disabled ? 'default' : 'pointer',
            backgroundColor: dragActive ? 'action.hover' : 'background.paper',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: error ? 'error.main' : dragActive ? 'primary.main' : 'divider',
            transition: 'all 0.2s',
            '&:hover': !disabled ? {
              backgroundColor: 'action.hover',
              borderColor: 'primary.main'
            } : {}
          }}
          onClick={!disabled ? handleButtonClick : undefined}
        >
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />
          
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: disabled ? 'action.disabled' : 'action.active',
              mb: 2
            }}
          />
          
          <Typography variant="h6" gutterBottom>
            {dragActive ? dragActiveText : dropzoneText}
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={(e) => {
              e.stopPropagation()
              handleButtonClick()
            }}
            disabled={disabled}
            sx={{ mt: 2 }}
          >
            {buttonText}
          </Button>
          
          {helperText && (
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              {helperText}
            </Typography>
          )}
        </Paper>

        {(uploadError || errorMessage) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {uploadError || errorMessage}
          </Alert>
        )}

        {showFileList && files.length > 0 && (
          <List sx={{ mt: 2 }}>
            {files.map((file) => (
              <ListItem key={file.id}>
                <ListItemIcon>
                  {file.type.startsWith('image/') ? (
                    <ImageIcon />
                  ) : (
                    <InsertDriveFileIcon />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={file.name}
                  secondary={
                    <>
                      {formatFileSize(file.size)}
                      {file.error && (
                        <Typography component="span" color="error" sx={{ ml: 1 }}>
                          {file.error}
                        </Typography>
                      )}
                    </>
                  }
                />
                
                {file.progress !== undefined && file.progress < 100 && (
                  <Box sx={{ width: '100px', mr: 2 }}>
                    <LinearProgress variant="determinate" value={file.progress} />
                  </Box>
                )}
                
                {showPreview && file.preview && (
                  <Box
                    component="img"
                    src={file.preview}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mr: 2
                    }}
                  />
                )}
                
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemove(file.id)}
                    disabled={disabled}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    )
  }
)

FileUpload.displayName = 'FileUpload'