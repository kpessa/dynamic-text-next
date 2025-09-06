import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { TPNCalculator } from './TPNCalculator'
import tpnReducer from '../model/tpnSlice'

const mockStore = configureStore({
  reducer: {
    tpn: tpnReducer
  }
})

describe('TPNCalculator Component', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the TPN calculator', () => {
    renderWithProvider(<TPNCalculator />)
    
    expect(screen.getByText(/TPN Calculator/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Advisor Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument()
  })

  it('should display advisor type selector with all options', () => {
    renderWithProvider(<TPNCalculator />)
    
    const advisorSelect = screen.getByLabelText(/Advisor Type/i)
    expect(advisorSelect).toBeInTheDocument()
    
    fireEvent.mouseDown(advisorSelect)
    
    expect(screen.getByText('Neonatal/Infant (NEO)')).toBeInTheDocument()
    expect(screen.getByText('Child')).toBeInTheDocument()
    expect(screen.getByText('Adolescent')).toBeInTheDocument()
    expect(screen.getByText('Adult')).toBeInTheDocument()
  })

  it('should show patient parameter input fields', () => {
    renderWithProvider(<TPNCalculator />)
    
    expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Height/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument()
  })

  it('should display calculate button', () => {
    renderWithProvider(<TPNCalculator />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate TPN/i })
    expect(calculateButton).toBeInTheDocument()
  })

  it('should handle weight input', () => {
    renderWithProvider(<TPNCalculator />)
    
    const weightInput = screen.getByLabelText(/Weight/i) as HTMLInputElement
    fireEvent.change(weightInput, { target: { value: '70' } })
    
    expect(weightInput.value).toBe('70')
  })

  it('should handle advisor type change', () => {
    renderWithProvider(<TPNCalculator />)
    
    const advisorSelect = screen.getByLabelText(/Advisor Type/i)
    fireEvent.mouseDown(advisorSelect)
    fireEvent.click(screen.getByText('Neonatal/Infant (NEO)'))
    
    expect(screen.getByDisplayValue('NEO')).toBeInTheDocument()
  })

  it('should calculate TPN values when button clicked', async () => {
    renderWithProvider(<TPNCalculator />)
    
    const weightInput = screen.getByLabelText(/Weight/i)
    fireEvent.change(weightInput, { target: { value: '70' } })
    
    const calculateButton = screen.getByRole('button', { name: /Calculate TPN/i })
    fireEvent.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Results/i)).toBeInTheDocument()
    })
  })

  it('should display calculation results', async () => {
    renderWithProvider(<TPNCalculator />)
    
    const weightInput = screen.getByLabelText(/Weight/i)
    fireEvent.change(weightInput, { target: { value: '70' } })
    
    const calculateButton = screen.getByRole('button', { name: /Calculate TPN/i })
    fireEvent.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Calories/i)).toBeInTheDocument()
      expect(screen.getByText(/Protein/i)).toBeInTheDocument()
      expect(screen.getByText(/Carbohydrates/i)).toBeInTheDocument()
    })
  })

  it('should show validation warnings for out-of-range values', async () => {
    renderWithProvider(<TPNCalculator />)
    
    const weightInput = screen.getByLabelText(/Weight/i)
    fireEvent.change(weightInput, { target: { value: '500' } }) // Extremely high weight
    
    const calculateButton = screen.getByRole('button', { name: /Calculate TPN/i })
    fireEvent.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Warning/i)).toBeInTheDocument()
    })
  })

  it('should have export functionality', () => {
    renderWithProvider(<TPNCalculator />)
    
    const exportButton = screen.getByRole('button', { name: /Export/i })
    expect(exportButton).toBeInTheDocument()
  })

  it('should clear results when clear button clicked', async () => {
    renderWithProvider(<TPNCalculator />)
    
    // First calculate
    const weightInput = screen.getByLabelText(/Weight/i)
    fireEvent.change(weightInput, { target: { value: '70' } })
    
    const calculateButton = screen.getByRole('button', { name: /Calculate TPN/i })
    fireEvent.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Results/i)).toBeInTheDocument()
    })
    
    // Then clear
    const clearButton = screen.getByRole('button', { name: /Clear/i })
    fireEvent.click(clearButton)
    
    expect(screen.queryByText(/Results/i)).not.toBeInTheDocument()
  })
})