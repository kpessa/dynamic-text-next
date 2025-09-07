import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  Alert,
  Tabs,
  Tab,
  Stack
} from '@mui/material'
import {
  Save as SaveIcon,
  FolderOpen as LoadIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  CalendarMonth as DateIcon
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  saveCalculation,
  loadCalculation,
  deleteCalculation,
  selectCalculationHistory
} from '../model/tpnSlice'

interface TPNSaveLoadDialogProps {
  open: boolean
  onClose: () => void
  mode: 'save' | 'load'
  patientData?: Record<string, string>
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export const TPNSaveLoadDialog: React.FC<TPNSaveLoadDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  patientData
}) => {
  const dispatch = useAppDispatch()
  const history = useAppSelector(selectCalculationHistory)
  const [mode, setMode] = useState(initialMode)
  const [saveName, setSaveName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSave = () => {
    if (saveName.trim()) {
      dispatch(saveCalculation({ name: saveName, patientData }))
      onClose()
      setSaveName('')
    }
  }

  const handleLoad = () => {
    if (selectedId) {
      dispatch(loadCalculation(selectedId))
      onClose()
      setSelectedId(null)
    }
  }

  const handleDelete = (id: string) => {
    dispatch(deleteCalculation(id))
    if (selectedId === id) {
      setSelectedId(null)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setMode(newValue === 0 ? 'save' : 'load')
  }

  const getPopulationColor = (type: string) => {
    switch (type) {
      case 'NEO': return 'info'
      case 'CHILD': return 'warning'
      case 'ADOLESCENT': return 'secondary'
      case 'ADULT': return 'success'
      default: return 'default'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Tabs value={mode === 'save' ? 0 : 1} onChange={handleTabChange}>
          <Tab icon={<SaveIcon />} label="Save" />
          <Tab icon={<LoadIcon />} label="Load" />
        </Tabs>
      </DialogTitle>
      
      <DialogContent>
        <TabPanel value={mode === 'save' ? 0 : 1} index={0}>
          <Stack spacing={2}>
            <Alert severity="info">
              Save your current calculation for future reference
            </Alert>
            <TextField
              fullWidth
              label="Calculation Name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Patient John Doe - Initial"
              helperText="Enter a descriptive name for this calculation"
              autoFocus
            />
            {patientData && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Patient Data:
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`Weight: ${patientData.weight} kg`} size="small" />
                  {patientData.height && (
                    <Chip label={`Height: ${patientData.height} cm`} size="small" />
                  )}
                  {patientData.age && (
                    <Chip label={`Age: ${patientData.age}`} size="small" />
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </TabPanel>

        <TabPanel value={mode === 'save' ? 0 : 1} index={1}>
          {history.length === 0 ? (
            <Alert severity="info">
              No saved calculations found. Save a calculation first to load it later.
            </Alert>
          ) : (
            <List>
              {history.map((calc) => (
                <ListItem
                  key={calc.id}
                  button
                  selected={selectedId === calc.id}
                  onClick={() => setSelectedId(calc.id)}
                >
                  <ListItemIcon>
                    <CalculateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Calculation ${calc.id}`}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DateIcon fontSize="small" />
                        <Typography variant="caption">
                          {formatDistanceToNow(new Date(calc.timestamp), { addSuffix: true })}
                        </Typography>
                        <Chip
                          label={calc.advisorType}
                          size="small"
                          color={getPopulationColor(calc.advisorType) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        />
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(calc.id)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {mode === 'save' ? (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!saveName.trim()}
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        ) : (
          <Button
            onClick={handleLoad}
            variant="contained"
            disabled={!selectedId}
            startIcon={<LoadIcon />}
          >
            Load
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}