import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImportModal } from './ImportModal'
import type { TPNConfiguration } from '@/features/data-import/types/schemas'

describe('ImportModal', () => {
  const mockOnClose = vi.fn()
  const mockOnImport = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    render(<ImportModal open={true} onClose={mockOnClose} onImport={mockOnImport} />)
    expect(screen.getByText('Import TPN Configuration')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<ImportModal open={false} onClose={mockOnClose} onImport={mockOnImport} />)
    expect(screen.queryByText('Import TPN Configuration')).not.toBeInTheDocument()
  })

  it('should display file upload button', () => {
    render(<ImportModal open={true} onClose={mockOnClose} onImport={mockOnImport} />)
    expect(screen.getByText('Select Configuration File')).toBeInTheDocument()
  })

  it('should display population type selector', () => {
    render(<ImportModal open={true} onClose={mockOnClose} onImport={mockOnImport} />)
    // Check that the select field exists using role
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('should call onClose when Cancel is clicked', () => {
    render(<ImportModal open={true} onClose={mockOnClose} onImport={mockOnImport} />)
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should disable Import button initially', () => {
    render(<ImportModal open={true} onClose={mockOnClose} onImport={mockOnImport} />)
    const importButton = screen.getByText('Import Configuration')
    expect(importButton).toBeDisabled()
  })

  it('should handle valid file upload', async () => {
    const validConfig: TPNConfiguration = {
      INGREDIENT: [
        {
          KEYNAME: 'test',
          DISPLAY: 'Test',
          MNEMONIC: 'TST',
          UOM_DISP: 'unit',
          TYPE: 'Other',
          OSMO_RATIO: 1.0,
          EDITMODE: 'Custom',
          PRECISION: 1,
          SPECIAL: '',
          NOTE: [],
          ALTUOM: [],
          REFERENCE_RANGE: [],
          LABS: [],
          CONCENTRATION: { STRENGTH: 1, STRENGTH_UOM: 'g', VOLUME: 1, VOLUME_UOM: 'mL' },
          EXCLUDES: []
        }
      ],
      FLEX: []
    }

    const file = new File([JSON.stringify(validConfig)], 'neo-config.json', {
      type: 'application/json'
    })

    render(<ImportModal open={true} onClose={mockOnClose} onImport={mockOnImport} />)
    
    const input = document.getElementById('file-input') as HTMLInputElement
    
    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(screen.getByText(/Valid TPN Configuration/i)).toBeInTheDocument()
    })
  })

  it('should show error for invalid JSON', async () => {
    const file = new File(['invalid json'], 'config.json', {
      type: 'application/json'
    })

    render(<ImportModal open={true} onClose={mockOnClose} onImport={mockOnImport} />)
    
    const input = document.getElementById('file-input') as HTMLInputElement
    
    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(screen.getByText(/Validation Failed/i)).toBeInTheDocument()
    })
  })

  it('should detect population type from filename', async () => {
    const validConfig: TPNConfiguration = {
      INGREDIENT: [],
      FLEX: []
    }

    const file = new File([JSON.stringify(validConfig)], 'neo-cert-east.json', {
      type: 'application/json'
    })

    render(<ImportModal open={true} onClose={mockOnClose} onImport={mockOnImport} />)
    
    const input = document.getElementById('file-input') as HTMLInputElement
    
    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      // Check that the NEO option is displayed in the select
      expect(screen.getByText('Neonatal (NEO)')).toBeInTheDocument()
    })
  })
})