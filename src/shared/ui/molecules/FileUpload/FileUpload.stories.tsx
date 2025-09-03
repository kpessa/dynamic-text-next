import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FileUpload } from './FileUpload'
import { FileUploadFile } from './FileUpload.types'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const meta = {
  title: 'Molecules/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'FileUpload molecule provides drag & drop file upload with preview, validation, and progress tracking.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    accept: {
      control: 'text',
      description: 'Accepted file types'
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection'
    },
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes'
    },
    maxFiles: {
      control: 'number',
      description: 'Maximum number of files'
    },
    showPreview: {
      control: 'boolean',
      description: 'Show image previews'
    },
    showFileList: {
      control: 'boolean',
      description: 'Show uploaded files list'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable file upload'
    }
  }
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Upload Files',
    helperText: 'Drag and drop files here or click to browse'
  }
}

export const ImageUpload: Story = {
  args: {
    label: 'Upload Images',
    accept: 'image/*',
    helperText: 'Only image files are accepted',
    showPreview: true
  }
}

export const DocumentUpload: Story = {
  args: {
    label: 'Upload Documents',
    accept: '.pdf,.doc,.docx,.txt',
    helperText: 'PDF, Word, and text files only',
    multiple: true,
    maxFiles: 5
  }
}

export const WithSizeLimit: Story = {
  args: {
    label: 'Limited Size Upload',
    maxSize: 5 * 1024 * 1024, // 5MB
    helperText: 'Maximum file size: 5MB',
    multiple: true
  }
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Upload',
    disabled: true,
    helperText: 'Upload is currently disabled'
  }
}

export const WithError: Story = {
  args: {
    label: 'Upload with Error',
    error: true,
    errorMessage: 'Upload failed. Please try again.',
    helperText: 'Something went wrong'
  }
}

export const ControlledExample: Story = {
  render: () => {
    const [files, setFiles] = useState<FileUploadFile[]>([])
    const [uploading, setUploading] = useState(false)
    
    const handleUpload = async (newFiles: File[]) => {
      setUploading(true)
      
      // Simulate upload with progress
      const uploadPromises = newFiles.map((file, index) => {
        return new Promise<void>((resolve) => {
          const fileId = `${file.name}-${Date.now()}-${index}`
          let progress = 0
          
          const interval = setInterval(() => {
            progress += 20
            
            setFiles(prev => prev.map(f => 
              f.id === fileId 
                ? { ...f, progress: Math.min(progress, 100) }
                : f
            ))
            
            if (progress >= 100) {
              clearInterval(interval)
              resolve()
            }
          }, 500)
        })
      })
      
      await Promise.all(uploadPromises)
      setUploading(false)
    }
    
    return (
      <Stack spacing={3} sx={{ width: 500 }}>
        <FileUpload
          label="Upload with Progress"
          files={files}
          onFilesChange={setFiles}
          onUpload={handleUpload}
          multiple
          maxSize={10 * 1024 * 1024}
          disabled={uploading}
          helperText={uploading ? 'Uploading...' : 'Max 10MB per file'}
        />
        
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upload Status
          </Typography>
          <Typography variant="body2">
            {files.length} file(s) selected
          </Typography>
          {uploading && (
            <Typography variant="body2" color="primary">
              Upload in progress...
            </Typography>
          )}
        </Paper>
      </Stack>
    )
  }
}

export const ImageGallery: Story = {
  render: () => {
    const [files, setFiles] = useState<FileUploadFile[]>([])
    
    return (
      <Stack spacing={3} sx={{ width: 600 }}>
        <FileUpload
          label="Image Gallery Upload"
          accept="image/*"
          multiple
          files={files}
          onFilesChange={setFiles}
          showPreview
          helperText="Upload images to create a gallery"
        />
        
        {files.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Image Gallery ({files.length} images)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {files.map(file => (
                file.preview && (
                  <img
                    key={file.id}
                    src={file.preview}
                    alt={file.name}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 4
                    }}
                  />
                )
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    )
  }
}

export const FormIntegration: Story = {
  render: () => {
    const [files, setFiles] = useState<FileUploadFile[]>([])
    const [submitted, setSubmitted] = useState(false)
    
    const handleSubmit = () => {
      if (files.length > 0) {
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
      }
    }
    
    return (
      <Stack spacing={3} sx={{ width: 500 }}>
        <FileUpload
          label="Attachments"
          files={files}
          onFilesChange={setFiles}
          multiple
          maxFiles={3}
          accept=".pdf,.doc,.docx,.jpg,.png"
          helperText="Attach up to 3 files (PDF, Word, or images)"
        />
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={files.length === 0}
          fullWidth
        >
          Submit Form with {files.length} Attachment(s)
        </Button>
        
        {submitted && (
          <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
            <Typography color="success.dark">
              Form submitted successfully with {files.length} file(s)!
            </Typography>
          </Paper>
        )}
      </Stack>
    )
  }
}

export const InteractivePlayground: Story = {
  args: {
    label: 'Interactive File Upload',
    helperText: 'Try dragging files or clicking to browse',
    buttonText: 'Choose Files',
    dragActiveText: 'Drop files here...',
    dropzoneText: 'Drag & drop files here, or click to select',
    accept: '',
    multiple: true,
    maxSize: undefined,
    maxFiles: undefined,
    showPreview: true,
    showFileList: true,
    disabled: false,
    error: false,
    fullWidth: true
  }
}