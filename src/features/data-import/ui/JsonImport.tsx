import React, { ChangeEvent, useState } from 'react'
import {
  Box,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar
} from '@mui/material'
import {
  UploadFile as UploadFileIcon,
  ContentPaste as ContentPasteIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/app/store'
import { 
  importStart, 
  importSuccess, 
  importError,
  clearError,
  setPreviewData,
  clearPreviewData
} from '../model/importSlice'
import { validateImport, detectDataType } from '../lib/validator'
import { ImportPreview } from './ImportPreview'

type ImportMode = 'file' | 'paste'

export const JsonImport: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { importing, error, previewData } = useSelector((state: RootState) => state.import)
  
  const [mode, setMode] = useState<ImportMode>('file')
  const [pasteContent, setPasteContent] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  interface HistoryItem {
    timestamp: string
    type: string
    name: string
    data: unknown
  }
  
  const [importHistory, setImportHistory] = useState<HistoryItem[]>([])
  
  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ImportMode | null) => {
    if (newMode !== null) {
      setMode(newMode)
      setPasteContent('')
      dispatch(clearError())
      dispatch(clearPreviewData())
    }
  }
  
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (file.type !== 'application/json') {
      dispatch(importError('Please select a JSON file'))
      return
    }
    
    dispatch(importStart())
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const json = JSON.parse(text)
        validateAndPreview(json)
      } catch (err) {
        dispatch(importError(`Invalid JSON file: ${err instanceof Error ? err.message : 'Unknown error'}`))
      }
    }
    reader.onerror = () => {
      dispatch(importError('Failed to read file'))
    }
    reader.readAsText(file)
  }
  
  const handlePasteImport = () => {
    if (!pasteContent.trim()) {
      dispatch(importError('Please paste valid JSON'))
      return
    }
    
    dispatch(importStart())
    
    try {
      const json = JSON.parse(pasteContent)
      validateAndPreview(json)
    } catch (err) {
      const error = err as Error
      const match = error.message.match(/position (\d+)/)
      if (match) {
        const position = parseInt(match[1])
        const lines = pasteContent.substring(0, position).split('\n')
        dispatch(importError(`Invalid JSON at line ${lines.length}: ${error.message}`))
      } else {
        dispatch(importError(`Invalid JSON format: ${error.message}`))
      }
    }
  }
  
  const validateAndPreview = (data: unknown) => {
    const validation = validateImport(data)
    
    if (validation.valid) {
      dispatch(setPreviewData({
        data,
        type: validation.dataType || 'unknown',
        itemCount: validation.itemCount || 0
      }))
    } else {
      dispatch(importError(validation.error || 'Invalid data format'))
    }
  }
  
  const handleConfirmImport = () => {
    setShowConfirmDialog(true)
  }
  
  const handleProceedImport = () => {
    if (!previewData) return
    
    setShowConfirmDialog(false)
    
    saveToHistory(previewData.data)
    
    dispatch(importSuccess({
      type: previewData.type,
      count: previewData.itemCount
    }))
    
    setSuccessMessage(`Successfully imported ${previewData.itemCount} ${previewData.type} item(s)`)
    dispatch(clearPreviewData())
  }
  
  const saveToHistory = (importData: unknown) => {
    const history = JSON.parse(localStorage.getItem('importHistory') || '[]')
    const newEntry = {
      timestamp: new Date().toISOString(),
      type: detectDataType(importData),
      name: importData.name || 'Unnamed import',
      data: importData
    }
    
    history.unshift(newEntry)
    history.splice(10)
    localStorage.setItem('importHistory', JSON.stringify(history))
    setImportHistory(history)
  }
  
  const loadHistory = () => {
    const history = JSON.parse(localStorage.getItem('importHistory') || '[]')
    // Ensure only 10 items are displayed
    setImportHistory(history.slice(0, 10))
    setShowHistory(true)
  }
  
  const deleteHistoryItem = (index: number) => {
    const history = [...importHistory]
    history.splice(index, 1)
    localStorage.setItem('importHistory', JSON.stringify(history))
    setImportHistory(history)
  }
  
  const loadFromHistory = (item: HistoryItem) => {
    setShowHistory(false)
    validateAndPreview(item.data)
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="file">
            <UploadFileIcon sx={{ mr: 1 }} />
            Upload File
          </ToggleButton>
          <ToggleButton value="paste">
            <ContentPasteIcon sx={{ mr: 1 }} />
            Paste JSON
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={loadHistory}
          sx={{ ml: 2 }}
        >
          View History
        </Button>
      </Box>
      
      {mode === 'file' ? (
        <Box>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            disabled={importing}
          >
            Select JSON File
            <input
              type="file"
              accept=".json,application/json"
              hidden
              onChange={handleFileUpload}
              data-testid="file-input"
            />
          </Button>
        </Box>
      ) : (
        <Box>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="Paste JSON here..."
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            disabled={importing}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handlePasteImport}
            disabled={importing || !pasteContent.trim()}
          >
            Import JSON
          </Button>
        </Box>
      )}
      
      {importing && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Validating...</Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} role="alert">
          {error}
        </Alert>
      )}
      
      {previewData && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Preview
          </Typography>
          <ImportPreview
            data={previewData.data}
            type={previewData.type}
            itemCount={previewData.itemCount}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmImport}
              sx={{ mr: 1 }}
            >
              Confirm Import
            </Button>
            <Button
              variant="outlined"
              onClick={() => dispatch(clearPreviewData())}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      )}
      
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Replace Existing Data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will replace any existing data of the same type. This action cannot be undone.
            Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleProceedImport} color="primary" variant="contained">
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import History</DialogTitle>
        <DialogContent>
          {importHistory.length === 0 ? (
            <Typography>No import history available</Typography>
          ) : (
            <List>
              {importHistory.map((item, index) => (
                <ListItem
                  key={index}
                  onClick={() => loadFromHistory(item)}
                  data-testid={`history-item-${index}`}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.type} • ${new Date(item.timestamp).toLocaleString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteHistoryItem(index)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  )
}