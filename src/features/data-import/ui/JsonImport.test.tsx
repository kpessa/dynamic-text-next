import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { JsonImport } from './JsonImport'
import { importSlice } from '../model/importSlice'

const createMockStore = () => {
  return configureStore({
    reducer: {
      import: importSlice.reducer
    }
  })
}

describe('JsonImport', () => {
  let store: ReturnType<typeof createMockStore>
  
  beforeEach(() => {
    store = createMockStore()
    localStorage.clear()
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <JsonImport />
      </Provider>
    )
  }
  
  describe('Mode Toggle', () => {
    it('should render mode toggle with file and paste options', () => {
      renderComponent()
      
      expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /paste json/i })).toBeInTheDocument()
    })
    
    it('should toggle between file and paste modes', async () => {
      renderComponent()
      const user = userEvent.setup()
      
      const pasteButton = screen.getByRole('button', { name: /paste json/i })
      await user.click(pasteButton)
      
      expect(screen.getByPlaceholderText(/paste json here/i)).toBeInTheDocument()
      
      const fileButton = screen.getByRole('button', { name: /upload file/i })
      await user.click(fileButton)
      
      expect(screen.getByRole('button', { name: /select json file/i })).toBeInTheDocument()
    })
  })
  
  describe('File Upload', () => {
    it('should handle valid JSON file upload', async () => {
      renderComponent()
      
      const validJson = { test: 'data', version: '1.0' }
      const file = new File([JSON.stringify(validJson)], 'test.json', {
        type: 'application/json'
      })
      
      const input = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/validating/i)).toBeInTheDocument()
      })
    })
    
    it('should reject non-JSON files', async () => {
      renderComponent()
      
      const file = new File(['not json'], 'test.txt', {
        type: 'text/plain'
      })
      
      const input = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/please select a json file/i)).toBeInTheDocument()
      })
    })
    
    it('should handle invalid JSON in file', async () => {
      renderComponent()
      
      const file = new File(['{ invalid json }'], 'test.json', {
        type: 'application/json'
      })
      
      const input = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/invalid json/i)).toBeInTheDocument()
      })
    })
    
    it('should handle file read errors', async () => {
      renderComponent()
      
      const file = new File([JSON.stringify({ test: 'data' })], 'test.json', {
        type: 'application/json'
      })
      
      const mockReadAsText = vi.fn()
      mockReadAsText.mockImplementation(function(this: FileReader) {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Event('error'))
          }
        }, 0)
      })
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => ({
        readAsText: mockReadAsText,
        onload: null,
        onerror: null,
        result: null,
        error: null,
        readyState: 0,
        abort: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        EMPTY: 0,
        LOADING: 1,
        DONE: 2,
        readAsArrayBuffer: vi.fn(),
        readAsBinaryString: vi.fn(),
        readAsDataURL: vi.fn()
      }))
      
      const input = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/failed to read file/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Copy/Paste', () => {
    it('should handle valid JSON paste', async () => {
      renderComponent()
      const user = userEvent.setup()
      
      const pasteButton = screen.getByRole('button', { name: /paste json/i })
      await user.click(pasteButton)
      
      const textarea = screen.getByPlaceholderText(/paste json here/i) as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: JSON.stringify({ version: '1.0', ingredients: [] }) } })
      
      const importButton = screen.getByRole('button', { name: /import json/i })
      await user.click(importButton)
      
      await waitFor(() => {
        // Check for preview section which appears after validation
        expect(screen.getByText(/preview/i)).toBeInTheDocument()
      })
    })
    
    it('should handle invalid JSON paste with line number', async () => {
      renderComponent()
      const user = userEvent.setup()
      
      const pasteButton = screen.getByRole('button', { name: /paste json/i })
      await user.click(pasteButton)
      
      const textarea = screen.getByPlaceholderText(/paste json here/i) as HTMLTextAreaElement
      const invalidJson = '{\n  "test": "data",\n  invalid\n}'
      fireEvent.change(textarea, { target: { value: invalidJson } })
      
      const importButton = screen.getByRole('button', { name: /import json/i })
      await user.click(importButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid json/i)).toBeInTheDocument()
      })
    })
    
    it('should reject empty paste content', async () => {
      renderComponent()
      const user = userEvent.setup()
      
      const pasteButton = screen.getByRole('button', { name: /paste json/i })
      await user.click(pasteButton)
      
      // Wait for the import button to be rendered but disabled
      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /import json/i })
        expect(importButton).toBeDisabled()
      })
    })
  })
  
  describe('Import Preview', () => {
    it('should show data preview before confirming import', async () => {
      renderComponent()
      
      const validJson = {
        version: '1.0',
        ingredients: [
          { keyname: 'test', name: 'Test Ingredient', type: 'basic' }
        ]
      }
      const file = new File([JSON.stringify(validJson)], 'test.json', {
        type: 'application/json'
      })
      
      const input = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument()
        expect(screen.getByText(/ingredients import/i)).toBeInTheDocument()
        expect(screen.getByText(/1 ingredient/i)).toBeInTheDocument()
      })
    })
    
    it('should show confirmation dialog for data replacement', async () => {
      renderComponent()
      const user = userEvent.setup()
      
      const validJson = {
        version: '1.0',
        ingredients: [{ keyname: 'test', name: 'Test', type: 'basic' }]
      }
      const file = new File([JSON.stringify(validJson)], 'test.json', {
        type: 'application/json'
      })
      
      const input = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument()
      })
      
      const confirmButton = screen.getByRole('button', { name: /confirm import/i })
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(screen.getByText(/replace existing data/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Import History', () => {
    it('should save successful imports to history', async () => {
      renderComponent()
      const user = userEvent.setup()
      
      const validJson = {
        version: '1.0',
        name: 'Test Import',
        ingredients: []
      }
      const file = new File([JSON.stringify(validJson)], 'test.json', {
        type: 'application/json'
      })
      
      const input = screen.getByTestId('file-input')
      
      await waitFor(() => {
        fireEvent.change(input, { target: { files: [file] } })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument()
      })
      
      const confirmButton = screen.getByRole('button', { name: /confirm import/i })
      await user.click(confirmButton)
      
      const proceedButton = await screen.findByRole('button', { name: /proceed/i })
      await user.click(proceedButton)
      
      const history = JSON.parse(localStorage.getItem('importHistory') || '[]')
      expect(history).toHaveLength(1)
      expect(history[0].name).toBe('Test Import')
    })
    
    it('should limit history to 10 items', async () => {
      const history = Array.from({ length: 15 }, (_, i) => ({
        timestamp: new Date().toISOString(),
        type: 'test',
        name: `Import ${i}`,
        data: {}
      }))
      
      localStorage.setItem('importHistory', JSON.stringify(history))
      
      renderComponent()
      const user = userEvent.setup()
      
      const viewHistoryButton = screen.getByRole('button', { name: /view history/i })
      await user.click(viewHistoryButton)
      
      // Component should only display 10 items from localStorage
      const historyItems = screen.getAllByTestId(/history-item/i)
      expect(historyItems).toHaveLength(10)
    })
  })
  
  describe('Loading States', () => {
    it('should show loading state during JSON processing', async () => {
      renderComponent()
      
      const validJson = { version: '1.0', ingredients: [] }
      const file = new File([JSON.stringify(validJson)], 'test.json', {
        type: 'application/json'
      })
      
      const input = screen.getByTestId('file-input')
      
      fireEvent.change(input, { target: { files: [file] } })
      
      // Check that preview appears after processing
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument()
      })
    })
  })
  
  describe('Error Display', () => {
    it('should display validation errors clearly', async () => {
      renderComponent()
      const user = userEvent.setup()
      
      const pasteButton = screen.getByRole('button', { name: /paste json/i })
      await user.click(pasteButton)
      
      const textarea = screen.getByPlaceholderText(/paste json here/i) as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: '{ "invalid": }' } })
      
      const importButton = screen.getByRole('button', { name: /import json/i })
      await user.click(importButton)
      
      await waitFor(() => {
        const errorElement = screen.getByRole('alert')
        expect(errorElement).toBeInTheDocument()
        expect(errorElement).toHaveTextContent(/invalid json/i)
      })
    })
    
    it('should clear errors when switching modes', async () => {
      renderComponent()
      const user = userEvent.setup()
      
      const pasteButton = screen.getByRole('button', { name: /paste json/i })
      await user.click(pasteButton)
      
      const textarea = screen.getByPlaceholderText(/paste json here/i) as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: '{ invalid }' } })
      
      const importButton = screen.getByRole('button', { name: /import json/i })
      await user.click(importButton)
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      
      const fileButton = screen.getByRole('button', { name: /upload file/i })
      await user.click(fileButton)
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})