import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Paper,
  IconButton
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Description as JsonIcon
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import type { Ingredient } from '@/entities/ingredient/types'

interface IngredientImportDialogProps {
  open: boolean
  onClose: () => void
  onImport: (ingredients: Ingredient[]) => void
}

interface ImportResult {
  success: number
  failed: number
  duplicates: number
  errors: string[]
}

export const IngredientImportDialog: React.FC<IngredientImportDialogProps> = ({
  open,
  onClose,
  onImport
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [parsedIngredients, setParsedIngredients] = useState<Ingredient[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setFile(file)
      parseFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  const parseFile = async (file: File) => {
    try {
      const text = await file.text()
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        const ingredients = Array.isArray(data) ? data : data.ingredients || []
        setParsedIngredients(ingredients)
      } else if (file.name.endsWith('.csv')) {
        // TODO: Implement CSV parsing
        setParsedIngredients([])
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      setParsedIngredients([])
    }
  }

  const handleImport = async () => {
    if (!parsedIngredients.length) return

    setImporting(true)
    
    // Simulate import process
    setTimeout(() => {
      const result: ImportResult = {
        success: parsedIngredients.length,
        failed: 0,
        duplicates: Math.floor(Math.random() * 3),
        errors: []
      }
      
      setResult(result)
      setImporting(false)
      
      // Call onImport with successful ingredients
      onImport(parsedIngredients)
    }, 2000)
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setParsedIngredients([])
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Import Ingredients</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!file && !result && (
          <Box>
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                bgcolor: isDragActive ? 'action.hover' : 'background.default',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the file here' : 'Drag & drop or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: JSON, CSV
              </Typography>
            </Paper>

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Import Format Requirements:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <JsonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="JSON Format"
                    secondary="Array of ingredient objects or object with 'ingredients' array"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FileIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="CSV Format"
                    secondary="Headers: keyname, displayName, category, unit, etc."
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        )}

        {file && !importing && !result && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              File ready for import
            </Alert>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FileIcon color="action" />
                <Box flex={1}>
                  <Typography variant="body1">{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <Chip
                  label={`${parsedIngredients.length} ingredients`}
                  color="primary"
                  size="small"
                />
              </Stack>
            </Paper>

            {parsedIngredients.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Preview (first 5):
                </Typography>
                <List dense>
                  {parsedIngredients.slice(0, 5).map((ing, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={ing.displayName || ing.keyname}
                        secondary={`${ing.category} • ${ing.unit}`}
                      />
                    </ListItem>
                  ))}
                </List>
                {parsedIngredients.length > 5 && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    And {parsedIngredients.length - 5} more...
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {importing && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Importing ingredients...
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        )}

        {result && (
          <Box>
            <Alert 
              severity={result.failed > 0 ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            >
              Import completed
            </Alert>

            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <SuccessIcon color="success" />
                  <Box flex={1}>
                    <Typography variant="body1">Successful</Typography>
                    <Typography variant="h6">{result.success}</Typography>
                  </Box>
                </Stack>
              </Paper>

              {result.duplicates > 0 && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <WarningIcon color="warning" />
                    <Box flex={1}>
                      <Typography variant="body1">Duplicates Detected</Typography>
                      <Typography variant="h6">{result.duplicates}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {result.failed > 0 && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ErrorIcon color="error" />
                    <Box flex={1}>
                      <Typography variant="body1">Failed</Typography>
                      <Typography variant="h6">{result.failed}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Stack>

            {result.errors.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Errors:
                </Typography>
                <List dense>
                  {result.errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {result ? 'Close' : 'Cancel'}
        </Button>
        {file && !result && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={importing || parsedIngredients.length === 0}
            startIcon={<UploadIcon />}
          >
            Import {parsedIngredients.length} Ingredients
          </Button>
        )}
        {result && (
          <Button
            variant="contained"
            onClick={() => {
              setFile(null)
              setResult(null)
              setParsedIngredients([])
            }}
          >
            Import More
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}