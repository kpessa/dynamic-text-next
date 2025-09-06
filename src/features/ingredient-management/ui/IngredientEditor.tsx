import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Box,
  Typography,
  Divider,
  Alert,
  Tabs,
  Tab,
  Chip,
  Stack,
  Grid
} from '@mui/material'
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import type { 
  Ingredient, 
  IngredientType, 
  IngredientCategory,
  ReferenceRange,
  PopulationType,
  ThresholdType
} from '@/entities/ingredient/types'

interface IngredientEditorProps {
  open: boolean
  ingredient?: Ingredient | null
  onClose: () => void
  onSave: (ingredient: Partial<Ingredient>) => void
  loading?: boolean
  error?: string | null
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

const ingredientTypes: IngredientType[] = [
  'Macronutrient',
  'Micronutrient',
  'Additive',
  'Salt',
  'Diluent',
  'Other'
]

const ingredientCategories: IngredientCategory[] = [
  'macro',
  'micro',
  'electrolyte',
  'vitamin',
  'other'
]

const populationTypes: PopulationType[] = [
  'NEO',
  'CHILD',
  'ADOLESCENT',
  'ADULT'
]

const thresholdTypes: ThresholdType[] = [
  'Feasible Low',
  'Critical Low',
  'Normal Low',
  'Normal High',
  'Critical High',
  'Feasible High'
]

export const IngredientEditor: React.FC<IngredientEditorProps> = ({
  open,
  ingredient,
  onClose,
  onSave,
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    keyname: '',
    displayName: '',
    mnemonic: '',
    type: 'Other',
    category: 'other',
    unit: '',
    isShared: false,
    healthSystem: '',
    osmolalityRatio: 0,
    precision: 2,
    referenceRanges: [],
    alternateUnits: [],
    notes: []
  })
  
  const [activeTab, setActiveTab] = useState(0)
  const [newNote, setNewNote] = useState('')
  const [newAltUnit, setNewAltUnit] = useState({ name: '', unit: '' })

  useEffect(() => {
    if (ingredient) {
      setFormData(ingredient)
    } else {
      setFormData({
        keyname: '',
        displayName: '',
        mnemonic: '',
        type: 'Other',
        category: 'other',
        unit: '',
        isShared: false,
        healthSystem: '',
        osmolalityRatio: 0,
        precision: 2,
        referenceRanges: [],
        alternateUnits: [],
        notes: []
      })
    }
  }, [ingredient])

  const handleChange = (field: keyof Ingredient) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value
    
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      setFormData(prev => ({
        ...prev,
        notes: [...(prev.notes || []), newNote.trim()]
      }))
      setNewNote('')
    }
  }

  const handleRemoveNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes?.filter((_, i) => i !== index) || []
    }))
  }

  const handleAddAltUnit = () => {
    if (newAltUnit.name && newAltUnit.unit) {
      setFormData(prev => ({
        ...prev,
        alternateUnits: [...(prev.alternateUnits || []), newAltUnit]
      }))
      setNewAltUnit({ name: '', unit: '' })
    }
  }

  const handleRemoveAltUnit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alternateUnits: prev.alternateUnits?.filter((_, i) => i !== index) || []
    }))
  }

  const handleAddReferenceRange = () => {
    const newRange: ReferenceRange = {
      populationType: 'ADULT',
      unit: formData.unit || ''
    }
    setFormData(prev => ({
      ...prev,
      referenceRanges: [...(prev.referenceRanges || []), newRange]
    }))
  }

  const handleUpdateReferenceRange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const ranges = [...(prev.referenceRanges || [])]
      ranges[index] = { ...ranges[index], [field]: value }
      return { ...prev, referenceRanges: ranges }
    })
  }

  const handleRemoveReferenceRange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceRanges: prev.referenceRanges?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  const isEditMode = !!ingredient

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isEditMode ? 'Edit Ingredient' : 'New Ingredient'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Basic Info" />
          <Tab label="Reference Ranges" />
          <Tab label="Additional Info" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Keyname"
                value={formData.keyname}
                onChange={handleChange('keyname')}
                required
                helperText="Unique identifier for the ingredient"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.displayName}
                onChange={handleChange('displayName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Mnemonic"
                value={formData.mnemonic}
                onChange={handleChange('mnemonic')}
                helperText="Short code"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type || 'Other'}
                  onChange={handleChange('type')}
                  label="Type"
                >
                  {ingredientTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  label="Category"
                  required
                >
                  {ingredientCategories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={handleChange('unit')}
                required
                helperText="e.g., mg, mL, g"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Health System"
                value={formData.healthSystem}
                onChange={handleChange('healthSystem')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isShared || false}
                    onChange={handleChange('isShared')}
                  />
                }
                label="Shared"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Osmolality Ratio"
                type="number"
                value={formData.osmolalityRatio || 0}
                onChange={handleChange('osmolalityRatio')}
                inputProps={{ step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precision"
                type="number"
                value={formData.precision || 2}
                onChange={handleChange('precision')}
                inputProps={{ min: 0, max: 10 }}
                helperText="Decimal places for display"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">Reference Ranges</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddReferenceRange}
                size="small"
              >
                Add Range
              </Button>
            </Box>
            
            {formData.referenceRanges?.map((range, index) => (
              <Box key={index} mb={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Population</InputLabel>
                      <Select
                        value={range.populationType}
                        onChange={(e) => handleUpdateReferenceRange(index, 'populationType', e.target.value)}
                        label="Population"
                      >
                        {populationTypes.map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Unit"
                      value={range.unit}
                      onChange={(e) => handleUpdateReferenceRange(index, 'unit', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Min"
                      type="number"
                      value={range.min || ''}
                      onChange={(e) => handleUpdateReferenceRange(index, 'min', parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Max"
                      type="number"
                      value={range.max || ''}
                      onChange={(e) => handleUpdateReferenceRange(index, 'max', parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveReferenceRange(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            {/* Notes Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Notes</Typography>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button onClick={handleAddNote} size="small">Add</Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.notes?.map((note, index) => (
                  <Chip
                    key={index}
                    label={note}
                    onDelete={() => handleRemoveNote(index)}
                    size="small"
                  />
                ))}
              </Stack>
            </Grid>

            {/* Alternate Units Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Alternate Units</Typography>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  size="small"
                  value={newAltUnit.name}
                  onChange={(e) => setNewAltUnit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                />
                <TextField
                  size="small"
                  value={newAltUnit.unit}
                  onChange={(e) => setNewAltUnit(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="Unit"
                />
                <Button onClick={handleAddAltUnit} size="small">Add</Button>
              </Box>
              <Stack spacing={1}>
                {formData.alternateUnits?.map((alt, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <Chip label={`${alt.name}: ${alt.unit}`} size="small" />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveAltUnit(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Grid>

            {/* Special Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Instructions"
                multiline
                rows={3}
                value={formData.special || ''}
                onChange={handleChange('special')}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}