import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  Stack,
  Chip,
  FormGroup,
  Checkbox,
  Divider
} from '@mui/material'
import {
  Download as DownloadIcon,
  Description as JsonIcon,
  TableChart as CsvIcon,
  Code as XmlIcon
} from '@mui/icons-material'
import type { Ingredient } from '@/entities/ingredient/types'

interface IngredientExportDialogProps {
  open: boolean
  ingredients: Ingredient[]
  onClose: () => void
}

type ExportFormat = 'json' | 'csv' | 'xml'

interface ExportOptions {
  includeMetadata: boolean
  includeReferenceRanges: boolean
  includeFormulas: boolean
  includeNotes: boolean
  includeDates: boolean
}

export const IngredientExportDialog: React.FC<IngredientExportDialogProps> = ({
  open,
  ingredients,
  onClose
}) => {
  const [format, setFormat] = useState<ExportFormat>('json')
  const [fileName, setFileName] = useState('ingredients-export')
  const [options, setOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeReferenceRanges: true,
    includeFormulas: true,
    includeNotes: true,
    includeDates: true
  })

  const handleExport = () => {
    let content = ''
    let mimeType = ''
    let extension = ''

    const filteredIngredients = ingredients.map(ing => {
      const filtered: any = {
        id: ing.id,
        keyname: ing.keyname,
        displayName: ing.displayName,
        category: ing.category,
        unit: ing.unit,
        isShared: ing.isShared
      }

      if (options.includeReferenceRanges && ing.referenceRanges) {
        filtered.referenceRanges = ing.referenceRanges
      }
      if (options.includeFormulas && ing.formula) {
        filtered.formula = ing.formula
      }
      if (options.includeNotes && ing.notes) {
        filtered.notes = ing.notes
      }
      if (options.includeDates) {
        filtered.createdAt = ing.createdAt
        filtered.updatedAt = ing.updatedAt
      }
      if (options.includeMetadata && ing.metadata) {
        filtered.metadata = ing.metadata
      }

      return filtered
    })

    switch (format) {
      case 'json':
        content = JSON.stringify({
          version: '1.0',
          exportDate: new Date().toISOString(),
          count: filteredIngredients.length,
          ingredients: filteredIngredients
        }, null, 2)
        mimeType = 'application/json'
        extension = 'json'
        break

      case 'csv':
        // Create CSV content
        const headers = [
          'ID',
          'Keyname',
          'Display Name',
          'Category',
          'Unit',
          'Shared',
          ...(options.includeFormulas ? ['Formula'] : []),
          ...(options.includeDates ? ['Created', 'Updated'] : [])
        ]
        
        const rows = filteredIngredients.map(ing => [
          ing.id,
          ing.keyname,
          ing.displayName,
          ing.category,
          ing.unit,
          ing.isShared ? 'Yes' : 'No',
          ...(options.includeFormulas ? [ing.formula || ''] : []),
          ...(options.includeDates ? [ing.createdAt, ing.updatedAt] : [])
        ])

        content = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        mimeType = 'text/csv'
        extension = 'csv'
        break

      case 'xml':
        // Create XML content
        const ingredientsXml = filteredIngredients.map(ing => `
    <ingredient>
      <id>${ing.id}</id>
      <keyname>${ing.keyname}</keyname>
      <displayName>${ing.displayName}</displayName>
      <category>${ing.category}</category>
      <unit>${ing.unit}</unit>
      <isShared>${ing.isShared}</isShared>
      ${options.includeFormulas && ing.formula ? `<formula>${ing.formula}</formula>` : ''}
      ${options.includeDates ? `
      <createdAt>${ing.createdAt}</createdAt>
      <updatedAt>${ing.updatedAt}</updatedAt>` : ''}
    </ingredient>`).join('')

        content = `<?xml version="1.0" encoding="UTF-8"?>
<ingredientExport>
  <version>1.0</version>
  <exportDate>${new Date().toISOString()}</exportDate>
  <count>${filteredIngredients.length}</count>
  <ingredients>${ingredientsXml}
  </ingredients>
</ingredientExport>`
        
        mimeType = 'application/xml'
        extension = 'xml'
        break
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.${extension}`
    a.click()
    URL.revokeObjectURL(url)

    onClose()
  }

  const handleOptionChange = (key: keyof ExportOptions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({
      ...options,
      [key]: event.target.checked
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Export Ingredients
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Exporting {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
        </Alert>

        {/* File Name */}
        <Box mb={3}>
          <TextField
            fullWidth
            label="File Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            helperText="Without extension"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Export Format */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Export Format
          </Typography>
          <RadioGroup
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
          >
            <FormControlLabel
              value="json"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <JsonIcon fontSize="small" />
                  <Typography>JSON</Typography>
                  <Chip label="Recommended" size="small" color="primary" />
                </Stack>
              }
            />
            <FormControlLabel
              value="csv"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <CsvIcon fontSize="small" />
                  <Typography>CSV</Typography>
                  <Chip label="Excel Compatible" size="small" variant="outlined" />
                </Stack>
              }
            />
            <FormControlLabel
              value="xml"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <XmlIcon fontSize="small" />
                  <Typography>XML</Typography>
                </Stack>
              }
            />
          </RadioGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Export Options */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Include in Export
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeReferenceRanges}
                  onChange={handleOptionChange('includeReferenceRanges')}
                />
              }
              label="Reference Ranges"
              disabled={format === 'csv'}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeFormulas}
                  onChange={handleOptionChange('includeFormulas')}
                />
              }
              label="Formulas"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeNotes}
                  onChange={handleOptionChange('includeNotes')}
                />
              }
              label="Notes"
              disabled={format === 'csv'}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeDates}
                  onChange={handleOptionChange('includeDates')}
                />
              }
              label="Created/Updated Dates"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeMetadata}
                  onChange={handleOptionChange('includeMetadata')}
                />
              }
              label="Metadata"
              disabled={format === 'csv' || format === 'xml'}
            />
          </FormGroup>
        </Box>

        {/* Format-specific notes */}
        {format === 'csv' && (
          <Alert severity="warning">
            CSV format has limited support for complex data structures. 
            Reference ranges and notes will not be included.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleExport}
          startIcon={<DownloadIcon />}
          disabled={!fileName || ingredients.length === 0}
        >
          Export {format.toUpperCase()}
        </Button>
      </DialogActions>
    </Dialog>
  )
}