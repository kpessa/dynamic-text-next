import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  Backup as BackupIcon,
  RestartAlt as ResetIcon,
  Warning as WarningIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon
} from '@mui/icons-material'

interface DataManagementProps {
  onClearCache: () => void
  onExportData: () => void
  onDeleteData: () => void
}

export const DataManagement: React.FC<DataManagementProps> = ({
  onClearCache,
  onExportData,
  onDeleteData
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: 'clear' | 'delete' | 'reset' | null
    title: string
    message: string
  }>({
    open: false,
    action: null,
    title: '',
    message: ''
  })

  const [storageInfo] = useState({
    cacheSize: '15.2 MB',
    dataSize: '8.7 MB',
    totalSize: '23.9 MB',
    lastBackup: '2024-01-30 14:30',
    itemCount: {
      calculations: 127,
      ingredients: 456,
      documents: 23
    }
  })

  const handleAction = (action: 'clear' | 'delete' | 'reset') => {
    const configs = {
      clear: {
        title: 'Clear Cache',
        message: 'This will clear all cached data. Your saved data will not be affected. This action cannot be undone.'
      },
      delete: {
        title: 'Delete All Data',
        message: 'WARNING: This will permanently delete all your data including calculations, ingredients, and documents. This action cannot be undone.'
      },
      reset: {
        title: 'Reset to Factory Settings',
        message: 'This will reset the application to factory settings and delete all user data. This action cannot be undone.'
      }
    }

    setConfirmDialog({
      open: true,
      action,
      ...configs[action]
    })
  }

  const handleConfirm = () => {
    switch (confirmDialog.action) {
      case 'clear':
        onClearCache()
        break
      case 'delete':
        onDeleteData()
        break
      case 'reset':
        // Reset to factory settings
        localStorage.clear()
        sessionStorage.clear()
        onDeleteData()
        break
    }
    setConfirmDialog({ open: false, action: null, title: '', message: '' })
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Data Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your application data and storage
      </Typography>

      <Grid container spacing={3}>
        {/* Storage Information */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <StorageIcon color="action" />
              <Typography variant="subtitle1">Storage Information</Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Storage Used</Typography>
                    <Typography variant="h4">{storageInfo.totalSize}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={35} 
                      sx={{ mt: 1, height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  
                  <Stack direction="row" spacing={2}>
                    <Chip 
                      icon={<FolderIcon />} 
                      label={`Cache: ${storageInfo.cacheSize}`} 
                      variant="outlined" 
                      size="small" 
                    />
                    <Chip 
                      icon={<FolderIcon />} 
                      label={`Data: ${storageInfo.dataSize}`} 
                      variant="outlined" 
                      size="small" 
                    />
                  </Stack>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Stored Items
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Calculations" 
                      secondary={`${storageInfo.itemCount.calculations} items`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ingredients" 
                      secondary={`${storageInfo.itemCount.ingredients} items`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Documents" 
                      secondary={`${storageInfo.itemCount.documents} items`}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Backup & Export */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BackupIcon color="action" />
              <Typography variant="subtitle1">Backup & Export</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Export your data for backup or migration
            </Typography>
            
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<CloudDownloadIcon />}
                onClick={onExportData}
                fullWidth
              >
                Export All Data
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                disabled
              >
                Import Data (Coming Soon)
              </Button>
              
              <Typography variant="caption" color="text.secondary" align="center">
                Last backup: {storageInfo.lastBackup}
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Clear & Reset */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <DeleteIcon color="action" />
              <Typography variant="subtitle1">Clear & Reset</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Remove cached or all data
            </Typography>
            
            <Stack spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => handleAction('clear')}
                fullWidth
              >
                Clear Cache
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                startIcon={<DeleteIcon />}
                onClick={() => handleAction('delete')}
                fullWidth
              >
                Delete All Data
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<ResetIcon />}
                onClick={() => handleAction('reset')}
                fullWidth
              >
                Factory Reset
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Warning */}
        <Grid item xs={12}>
          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="subtitle2" gutterBottom>
              Important Information
            </Typography>
            <Typography variant="body2">
              • Clearing cache will remove temporary files but preserve your saved data
              <br />
              • Deleting all data is permanent and cannot be undone
              <br />
              • Always export your data before performing destructive operations
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            color={confirmDialog.action === 'delete' || confirmDialog.action === 'reset' ? 'error' : 'primary'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}