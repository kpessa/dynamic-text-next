'use client'

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Alert,
  Paper,
  CircularProgress,
  Stack,
  Chip
} from '@mui/material'
import { Upload, FileUpload, Check, FolderOpen } from '@mui/icons-material'
import {
  validateImport,
  detectPopulationTypeFromFilename,
  type ValidationResult
} from '@/features/data-import/lib/validator'
import type { TPNConfiguration, PopulationType } from '@/features/data-import/types/schemas'
import { getAvailableConfigs, loadConfig } from '@/shared/data/refs'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onImport: (config: TPNConfiguration, populationType: PopulationType) => void
}

export const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null)
  const [populationType, setPopulationType] = useState<PopulationType | ''>('')
  const [parsedData, setParsedData] = useState<TPNConfiguration | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRef, setSelectedRef] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const availableConfigs = getAvailableConfigs()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setSelectedRef('') // Clear reference selection
    setIsLoading(true)
    setValidation(null)

    // Try to detect population type from filename
    const detectedType = detectPopulationTypeFromFilename(selectedFile.name)
    if (detectedType && !populationType) {
      setPopulationType(detectedType)
    }

    try {
      const text = await selectedFile.text()

      const data = JSON.parse(text)
      const result = validateImport(data)
      setValidation(result)

      if (result.valid && result.dataType === 'tpn-full') {
        const tpnConfig = data as TPNConfiguration
        if (!tpnConfig.populationType && populationType) {
          tpnConfig.populationType = populationType
        }
        setParsedData(tpnConfig)
      }
    } catch (error) {
      setValidation({
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to parse JSON file'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReferenceLoad = async (configKey: string) => {
    if (!configKey) return
    
    setSelectedRef(configKey)
    setFile(null) // Clear file selection
    setIsLoading(true)
    setValidation(null)
    
    const [population, ...configParts] = configKey.split('/')
    const configName = configParts.join('/')
    
    // Set population type from config
    const popMap: Record<string, PopulationType> = {
      'neo': 'NEO',
      'child': 'CHILD',
      'adolescent': 'ADOLESCENT',
      'adult': 'ADULT'
    }
    
    if (popMap[population]) {
      setPopulationType(popMap[population])
    }
    
    try {
      const data = await loadConfig(population as any, configName as any)
      const result = validateImport(data)
      setValidation(result)
      
      if (result.valid && result.dataType === 'tpn-full') {
        const tpnConfig = data as TPNConfiguration
        if (!tpnConfig.populationType && popMap[population]) {
          tpnConfig.populationType = popMap[population]
        }
        setParsedData(tpnConfig)
      }
    } catch (error) {
      setValidation({
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to load reference config'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = () => {
    if (!parsedData || !populationType) return

    const configWithPopulation: TPNConfiguration = {
      ...parsedData,
      populationType
    }

    onImport(configWithPopulation, populationType)
    handleClose()
  }

  const handleClose = () => {
    setFile(null)
    setPopulationType('')
    setParsedData(null)
    setValidation(null)
    setIsLoading(false)
    setSelectedRef('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const renderPreview = () => {
    if (!parsedData) return null

    return (
      <Paper elevation={1} sx={{ p: 2, mt: 2, maxHeight: 300, overflow: 'auto' }}>
        <Typography variant="subtitle2" gutterBottom>
          Configuration Preview
        </Typography>
        
        <Stack spacing={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Ingredients: {parsedData.INGREDIENT.length}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {parsedData.INGREDIENT.slice(0, 5).map((ing) => (
                <Chip
                  key={ing.KEYNAME}
                  label={ing.DISPLAY}
                  size="small"
                  variant="outlined"
                />
              ))}
              {parsedData.INGREDIENT.length > 5 && (
                <Chip
                  label={`+${parsedData.INGREDIENT.length - 5} more`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              FLEX Configurations: {parsedData.FLEX.length}
            </Typography>
            {parsedData.FLEX.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {parsedData.FLEX.slice(0, 3).map((flex) => (
                  <Chip
                    key={flex.NAME}
                    label={`${flex.NAME}: ${flex.VALUE}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {parsedData.FLEX.length > 3 && (
                  <Chip
                    label={`+${parsedData.FLEX.length - 3} more`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
              </Box>
            )}
          </Box>

          {parsedData.healthSystem && (
            <Typography variant="caption" color="text.secondary">
              Health System: {parsedData.healthSystem}
            </Typography>
          )}
        </Stack>
      </Paper>
    )
  }

  const renderValidationErrors = () => {
    if (!validation || validation.valid) return null

    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Validation Failed
        </Typography>
        {validation.error && <Typography variant="body2">{validation.error}</Typography>}
        {validation.errors && validation.errors.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {validation.errors.slice(0, 5).map((error, index) => (
              <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                • {error}
              </Typography>
            ))}
            {validation.errors.length > 5 && (
              <Typography variant="body2" sx={{ ml: 2, fontStyle: 'italic' }}>
                ...and {validation.errors.length - 5} more errors
              </Typography>
            )}
          </Box>
        )}
      </Alert>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import TPN Configuration</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Quick Load Reference Configs */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Quick Load Reference Configuration
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Reference Configs</InputLabel>
              <Select
                value={selectedRef}
                onChange={(e) => handleReferenceLoad(e.target.value)}
                label="Reference Configs"
                startAdornment={<FolderOpen sx={{ ml: 1, mr: 0.5, color: 'action.active' }} />}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableConfigs.map((config) => (
                  <MenuItem key={config.key} value={config.key}>
                    {config.population.toUpperCase()} - {config.healthSystem.toUpperCase()} ({config.domain}-{config.subdomain})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              — OR —
            </Typography>
          </Box>

          {/* File Upload */}
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                fullWidth
                sx={{ py: 2 }}
              >
                {file ? file.name : 'Upload Configuration File'}
              </Button>
            </label>
          </Box>

          {/* Population Type Selector */}
          <FormControl fullWidth>
            <InputLabel>Population Type</InputLabel>
            <Select
              value={populationType}
              onChange={(e) => setPopulationType(e.target.value as PopulationType)}
              label="Population Type"
            >
              <MenuItem value="NEO">Neonatal (NEO)</MenuItem>
              <MenuItem value="CHILD">Child</MenuItem>
              <MenuItem value="ADOLESCENT">Adolescent</MenuItem>
              <MenuItem value="ADULT">Adult</MenuItem>
            </Select>
          </FormControl>

          {/* Loading Indicator */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Validation Status */}
          {validation && !isLoading && (
            <>
              {validation.valid ? (
                <Alert severity="success" icon={<Check />}>
                  <Typography variant="subtitle2">
                    Valid {validation.dataType === 'tpn-full' ? 'TPN Configuration' : validation.dataType}
                  </Typography>
                  {validation.itemCount !== undefined && (
                    <Typography variant="body2">
                      {validation.itemCount} ingredients loaded
                    </Typography>
                  )}
                </Alert>
              ) : (
                renderValidationErrors()
              )}
            </>
          )}

          {/* Configuration Preview */}
          {validation?.valid && parsedData && renderPreview()}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!validation?.valid || !populationType || !parsedData}
          startIcon={<FileUpload />}
        >
          Import Configuration
        </Button>
      </DialogActions>
    </Dialog>
  )
}