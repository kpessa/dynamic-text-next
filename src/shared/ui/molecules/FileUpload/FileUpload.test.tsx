import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from './FileUpload'

describe('FileUpload', () => {
  describe('Basic Rendering', () => {
    it('should render upload area', () => {
      render(<FileUpload />)
      expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument()
    })

    it('should render with custom label', () => {
      render(<FileUpload label="Upload Documents" />)
      expect(screen.getByText('Upload Documents')).toBeInTheDocument()
    })

    it('should render choose files button', () => {
      render(<FileUpload buttonText="Select Files" />)
      expect(screen.getByRole('button', { name: /Select Files/i })).toBeInTheDocument()
    })

    it('should render helper text', () => {
      render(<FileUpload helperText="Max file size: 5MB" />)
      expect(screen.getByText('Max file size: 5MB')).toBeInTheDocument()
    })
  })

  describe('File Selection', () => {
    it('should handle file input change', async () => {
      const handleFilesChange = vi.fn()
      const { container } = render(<FileUpload onFilesChange={handleFilesChange} />)
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(input)
      
      await waitFor(() => {
        expect(handleFilesChange).toHaveBeenCalled()
      })
    })

    it('should handle multiple files when multiple is true', async () => {
      const handleFilesChange = vi.fn()
      const { container } = render(<FileUpload multiple onFilesChange={handleFilesChange} />)
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).toHaveAttribute('multiple')
    })

    it('should respect accept attribute', () => {
      const { container } = render(<FileUpload accept="image/*,.pdf" />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/*,.pdf')
    })
  })

  describe('Drag and Drop', () => {
    it('should show drag active state', () => {
      const { container } = render(<FileUpload dragActiveText="Release to upload" />)
      const dropzone = container.querySelector('.MuiPaper-root') as HTMLElement
      
      fireEvent.dragEnter(dropzone)
      expect(screen.getByText('Release to upload')).toBeInTheDocument()
    })

    it('should handle file drop', async () => {
      const handleFilesChange = vi.fn()
      const { container } = render(<FileUpload onFilesChange={handleFilesChange} />)
      const dropzone = container.querySelector('.MuiPaper-root') as HTMLElement
      
      const file = new File(['content'], 'dropped.txt', { type: 'text/plain' })
      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: 'text/plain', getAsFile: () => file }],
        types: ['Files']
      }
      
      fireEvent.drop(dropzone, { dataTransfer })
      
      await waitFor(() => {
        expect(handleFilesChange).toHaveBeenCalled()
      })
    })
  })

  describe('File List Display', () => {
    it('should display uploaded files', () => {
      const files = [
        {
          id: '1',
          file: new File([''], 'document.pdf'),
          name: 'document.pdf',
          size: 1024,
          type: 'application/pdf'
        }
      ]
      
      render(<FileUpload files={files} showFileList />)
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
      expect(screen.getByText(/1 KB/)).toBeInTheDocument()
    })

    it('should show image preview for image files', () => {
      const files = [
        {
          id: '1',
          file: new File([''], 'image.jpg'),
          name: 'image.jpg',
          size: 2048,
          type: 'image/jpeg',
          preview: 'data:image/jpeg;base64,test'
        }
      ]
      
      render(<FileUpload files={files} showPreview />)
      const preview = screen.getByRole('img')
      expect(preview).toHaveAttribute('src', 'data:image/jpeg;base64,test')
    })

    it('should show progress bar when upload in progress', () => {
      const files = [
        {
          id: '1',
          file: new File([''], 'uploading.txt'),
          name: 'uploading.txt',
          size: 1024,
          type: 'text/plain',
          progress: 50
        }
      ]
      
      const { container } = render(<FileUpload files={files} />)
      const progressBar = container.querySelector('.MuiLinearProgress-root')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('File Removal', () => {
    it('should handle file removal', async () => {
      const handleFileRemove = vi.fn()
      const files = [
        {
          id: '1',
          file: new File([''], 'removable.txt'),
          name: 'removable.txt',
          size: 1024,
          type: 'text/plain'
        }
      ]
      
      render(<FileUpload files={files} onFileRemove={handleFileRemove} />)
      const deleteButton = screen.getByLabelText('delete')
      
      fireEvent.click(deleteButton)
      expect(handleFileRemove).toHaveBeenCalledWith('1')
    })
  })

  describe('Validation', () => {
    it('should show error message', () => {
      render(<FileUpload error errorMessage="Upload failed" />)
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    })

    it('should validate file size', async () => {
      const { container } = render(
        <FileUpload 
          maxSize={1024} // 1KB
        />
      )
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const largeFile = new File(['x'.repeat(2048)], 'large.txt', { type: 'text/plain' })
      
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false
      })
      
      fireEvent.change(input)
      
      // Error message should be shown for oversized file
      await waitFor(() => {
        expect(screen.getByText(/exceeds maximum size/i)).toBeInTheDocument()
      })
    })
  })

  describe('Disabled State', () => {
    it('should disable input when disabled', () => {
      const { container } = render(<FileUpload disabled />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toBeDisabled()
    })

    it('should disable button when disabled', () => {
      render(<FileUpload disabled />)
      const button = screen.getByRole('button', { name: /Choose Files/i })
      expect(button).toBeDisabled()
    })

    it('should not respond to drag and drop when disabled', () => {
      const handleFilesChange = vi.fn()
      const { container } = render(<FileUpload disabled onFilesChange={handleFilesChange} />)
      const dropzone = container.querySelector('.MuiPaper-root') as HTMLElement
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const dataTransfer = {
        files: [file],
        items: [],
        types: ['Files']
      }
      
      fireEvent.drop(dropzone, { dataTransfer })
      expect(handleFilesChange).not.toHaveBeenCalled()
    })
  })
})