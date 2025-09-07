/**
 * Export Modal Widget
 * Allows exporting sections to NOTE format with preview
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material'
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material'
import { 
  exportAsNoteFormat, 
  exportTextWithDynamicSections,
  downloadAsJson,
  copyToClipboard,
  generateFilename,
  validateExportData,
  type ExportOptions 
} from '@/features/data-import/lib/exportService'
import type { Section } from '@/entities/section/types'

export interface ExportModalProps {
  open: boolean
  onClose: () => void
  sections?: Section[]
  text?: string // For exporting raw text with [f( )] delimiters
  ingredientName?: string
  displayName?: string
  healthSystem?: string
  populationType?: 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  sections,
  text,
  ingredientName = '',
  displayName = '',
  healthSystem = '',
  populationType = 'ADULT'
}) => {
  const [format, setFormat] = useState<'note' | 'sections' | 'config'>('note')
  const [preview, setPreview] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [exportData, setExportData] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // Form fields
  const [ingredient, setIngredient] = useState(ingredientName)
  const [display, setDisplay] = useState(displayName || ingredientName)
  const [system, setSystem] = useState(healthSystem)
  const [population, setPopulation] = useState(populationType)
  
  useEffect(() => {
    if (!open) return
    
    const options: ExportOptions = {
      format,
      ingredient: ingredient || 'dynamic-text',
      display: display || ingredient || 'Dynamic Text',
      healthSystem: system,
      populationType: population,
      domain: 'prod',
      subdomain: 'main',
      version: population.toLowerCase()
    }
    
    let data: any
    
    if (text) {
      // Export raw text with dynamic sections
      data = exportTextWithDynamicSections(text, options)
    } else if (sections) {
      // Export sections array
      data = exportAsNoteFormat(sections, options)
    } else {
      data = null
    }
    
    setExportData(data)
    
    if (data) {
      setPreview(JSON.stringify(data, null, 2))
      const validation = validateExportData(data)
      setValidationErrors(validation.errors)
    } else {
      setPreview('No data to export')
      setValidationErrors(['No sections or text provided'])
    }
  }, [open, format, sections, text, ingredient, display, system, population])
  
  const handleFormatChange = (_: React.MouseEvent<HTMLElement>, newFormat: 'note' | 'sections' | 'config' | null) => {
    if (newFormat) {
      setFormat(newFormat)
    }
  }
  
  const handleCopy = async () => {
    if (exportData) {
      const success = await copyToClipboard(exportData)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }
  
  const handleDownload = () => {
    if (exportData) {
      const filename = generateFilename({
        format,
        ingredient,
        healthSystem: system,
        populationType: population
      })
      downloadAsJson(exportData, filename)
      onClose()
    }
  }
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Export Configuration</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Export Options */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Ingredient Key"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Display Name"
              value={display}
              onChange={(e) => setDisplay(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Health System"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              select
              label="Population"
              value={population}
              onChange={(e) => setPopulation(e.target.value as any)}
              size="small"
              sx={{ minWidth: 150 }}
              SelectProps={{
                native: true
              }}
            >
              <option value="NEO">Neonatal</option>
              <option value="CHILD">Pediatric</option>
              <option value="ADOLESCENT">Adolescent</option>
              <option value="ADULT">Adult</option>
            </TextField>
          </Box>
          
          {/* Format Selection */}
          <Box>
            <Typography variant="body2" gutterBottom>
              Export Format:
            </Typography>
            <ToggleButtonGroup
              value={format}
              exclusive
              onChange={handleFormatChange}
              size="small"
            >
              <ToggleButton value="note">
                NOTE Format (Single Ingredient)
              </ToggleButton>
              <ToggleButton value="config">
                Full Configuration
              </ToggleButton>
              <ToggleButton value="sections">
                Sections Only (Debug)
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert severity="warning">
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Validation Issues:
              </Typography>
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          {/* Preview */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              maxHeight: '400px',
              overflow: 'auto'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Preview:
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton size="small" onClick={handleCopy}>
                  {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <pre style={{ 
              margin: 0, 
              fontSize: '12px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {preview}
            </pre>
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={!exportData || validationErrors.length > 0}
          startIcon={<DownloadIcon />}
        >
          Download JSON
        </Button>
      </DialogActions>
    </Dialog>
  )
}