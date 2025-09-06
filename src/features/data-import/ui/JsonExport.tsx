import React, { useState } from 'react'
import {
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Alert,
  Box
} from '@mui/material'
import {
  Download as DownloadIcon,
  SaveAlt as SaveAltIcon
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store'

interface JsonExportProps {
  data?: unknown
  filename: string
  minified?: boolean
  exportState?: boolean
}

export const JsonExport: React.FC<JsonExportProps> = ({
  data,
  filename,
  minified = false,
  exportState = false
}) => {
  const [formatMode, setFormatMode] = useState<'formatted' | 'minified'>(
    minified ? 'minified' : 'formatted'
  )
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const state = useSelector((state: RootState) => {
    if (exportState) {
      return state
    }
    return null
  })
  
  const handleFormatChange = (_: React.MouseEvent<HTMLElement>, newFormat: 'formatted' | 'minified' | null) => {
    if (newFormat !== null) {
      setFormatMode(newFormat)
    }
  }
  
  const exportData = () => {
    try {
      const dataToExport = exportState ? state : data
      
      if (!dataToExport) {
        setErrorMessage('No data to export')
        return
      }
      
      const jsonString = formatMode === 'formatted' 
        ? JSON.stringify(dataToExport, null, 2)
        : JSON.stringify(dataToExport)
      
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${Date.now()}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      
      setSuccessMessage('Data exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      setErrorMessage('Failed to export data')
    }
  }
  
  const isDisabled = !exportState && !data
  const buttonText = exportState ? 'Export State' : 'Export JSON'
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <ToggleButtonGroup
        value={formatMode}
        exclusive
        onChange={handleFormatChange}
        size="small"
      >
        <ToggleButton value="formatted">
          Formatted
        </ToggleButton>
        <ToggleButton value="minified">
          Minified
        </ToggleButton>
      </ToggleButtonGroup>
      
      <Button
        variant="contained"
        startIcon={exportState ? <SaveAltIcon /> : <DownloadIcon />}
        onClick={exportData}
        disabled={isDisabled}
      >
        {buttonText}
      </Button>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}