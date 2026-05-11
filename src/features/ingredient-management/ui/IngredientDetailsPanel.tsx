import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
} from '@mui/material'
import {
  Close as CloseIcon,
  ExpandMore,
  ExpandLess,
  Science,
  LocalHospital,
  Person,
  Description,
  Info,
  Warning,
  Edit as EditIcon,
} from '@mui/icons-material'
import type { Ingredient, IngredientVariant, ConcentrationData, ReferenceRange } from '../store/variantSlice'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'
import type { Ingredient as DomainIngredient } from '@/entities/ingredient/types'
import { useAppDispatch } from '@/app/hooks'
import { setIsEditingSection } from '@/shared/model/selectedIngredientModel'

interface IngredientDetailsPanelProps {
  ingredient: Ingredient | null
  onClose: () => void
  onVariantSelect?: (variant: IngredientVariant) => void
}

const populationIcons: Record<string, string> = {
  NEO: '👶',
  CHILD: '👧',
  ADOLESCENT: '🧑',
  ADULT: '👨',
}

export const IngredientDetailsPanel: React.FC<IngredientDetailsPanelProps> = ({
  ingredient,
  onClose,
  onVariantSelect,
}) => {
  const dispatch = useAppDispatch()
  const [selectedVariant, setSelectedVariant] = useState<IngredientVariant | null>(null)
  const [showMetadata, setShowMetadata] = useState(false)
  const [fullIngredient, setFullIngredient] = useState<DomainIngredient | null>(null)
  const [isLoadingIngredient, setIsLoadingIngredient] = useState(false)

  // Load full ingredient data when ingredient changes
  useEffect(() => {
    const loadFullIngredient = async () => {
      if (!ingredient) return
      
      setIsLoadingIngredient(true)
      
      // First, use the ingredient as-is since it already has the data from variantService
      // Convert notes to sections if needed
      const ingWithSections = {
        ...ingredient,
        sections: ingredient.sections || (ingredient.notes && ingredient.notes.length > 0 ? 
          ingredient.notes.map((note: string, index: number) => ({
            id: `note-${index}`,
            name: '',
            type: 'static' as const,
            content: note
          })) : [])
      }
      setFullIngredient(ingWithSections as any)
      
      // Then try to load from Firebase to get any additional data (but don't fail if not found)
      try {
        const result = await ingredientService.getById(ingredient.keyname || ingredient.id)
        if (result.data) {
          // If we got data from Firebase, use it (it might have more recent sections)
          setFullIngredient(result.data)
        }
      } catch (error) {
        // Silently ignore - we already have the ingredient data
        console.log('Could not load from Firebase, using variant data')
      } finally {
        setIsLoadingIngredient(false)
      }
    }
    
    loadFullIngredient()
  }, [ingredient])

  if (!ingredient) return null

  const handleVariantClick = (variant: IngredientVariant) => {
    setSelectedVariant(variant)
    onVariantSelect?.(variant)
  }

  const hasVariants = ingredient.variants && ingredient.variants.length > 0
  const hasReferenceText = (selectedVariant?.sections?.static && selectedVariant.sections.static.length > 0) || 
                           (selectedVariant?.sections?.dynamic && selectedVariant.sections.dynamic.length > 0)

  const handleEditSections = () => {
    // Set the editing state in shared model so main content area shows the editor
    dispatch(setIsEditingSection(true))
    // Close the details panel to give more room for editing
    onClose()
  }

  return (
    <Box
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Science fontSize="small" />
              <Typography variant="h6">
                {ingredient.displayName || ingredient.name}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {ingredient.keyname || ingredient.id}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton 
              size="small"
              onClick={handleEditSections}
              sx={{ color: 'inherit' }}
              disabled={isLoadingIngredient}
              title="Edit sections"
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small"
              onClick={onClose}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Variant Selection */}
        {hasVariants ? (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              SELECT VARIANT
            </Typography>
            <List dense sx={{ bgcolor: 'background.paper' }}>
              {ingredient.variants.map((variant) => (
                <ListItemButton
                  key={variant.id}
                  selected={selectedVariant?.id === variant.id}
                  onClick={() => handleVariantClick(variant)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 0.5,
                    border: '1px solid',
                    borderColor: selectedVariant?.id === variant.id ? 'primary.main' : 'divider',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Typography variant="caption">
                      {populationIcons[variant.population] || '❓'}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          {variant.population}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {variant.healthSystem}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {variant.domain} • v{variant.version}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>No Variants Available</AlertTitle>
            This ingredient does not have any population-specific variants defined.
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Reference Text - Show from full ingredient data */}
        {fullIngredient && (
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" color="text.secondary">
                SECTIONS ({fullIngredient.sections?.length || 0})
              </Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={handleEditSections}
                disabled={isLoadingIngredient}
              >
                Edit Sections
              </Button>
            </Stack>
            {fullIngredient.sections && fullIngredient.sections.length > 0 ? (
              <Box>
                {fullIngredient.sections.map((section, index) => (
                  <Paper 
                    key={section.id || `section-${index}`} 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      mb: 1,
                      bgcolor: section.type === 'dynamic' ? 'action.hover' : 'background.paper'
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      {section.type === 'static' ? (
                        <Description fontSize="small" color="action" />
                      ) : (
                        <Description fontSize="small" color="primary" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {section.name || `${section.type === 'static' ? 'Static' : 'Dynamic'} Section ${index + 1}`}
                      </Typography>
                      <Chip
                        label={section.type}
                        size="small"
                        color={section.type === 'dynamic' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </Stack>
                    <Typography 
                      variant="body2" 
                      fontFamily={section.type === 'dynamic' ? 'monospace' : 'inherit'}
                      sx={{
                        whiteSpace: 'pre-wrap',
                        maxHeight: 200,
                        overflow: 'auto',
                        fontSize: section.type === 'dynamic' ? '0.85rem' : 'inherit'
                      }}
                    >
                      {section.content || 'No content available'}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : fullIngredient.notes && fullIngredient.notes.length > 0 ? (
              <Box>
                <Alert severity="info" sx={{ mb: 1 }}>
                  This ingredient uses legacy notes format. Click "Edit Sections" to convert to the new section format.
                </Alert>
                {fullIngredient.notes.map((note, index) => (
                  <Paper 
                    key={`note-${index}`} 
                    variant="outlined" 
                    sx={{ p: 2, mb: 1 }}
                  >
                    <Typography variant="body2">
                      {note}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Alert severity="warning">
                <AlertTitle>No Sections Defined</AlertTitle>
                This ingredient does not have any sections defined yet. Click "Edit Sections" to add content.
              </Alert>
            )}
          </Box>
        )}

        {/* Concentration Information */}
        {ingredient.concentration && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              CONCENTRATION
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2">
                {ingredient.concentration.strength} {ingredient.concentration.strengthUom} / {ingredient.concentration.volume} {ingredient.concentration.volumeUom}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Reference Ranges */}
        {ingredient.referenceRanges && ingredient.referenceRanges.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              REFERENCE RANGES
            </Typography>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <List dense>
                {ingredient.referenceRanges.map((range, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={range.threshold}
                      secondary={`Value: ${range.value}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* Excludes */}
        {ingredient.excludes && ingredient.excludes.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              EXCLUDED INGREDIENTS
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {ingredient.excludes.map((exclude, index) => (
                <Chip
                  key={index}
                  label={exclude}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Notes */}
        {ingredient.notes && ingredient.notes.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              NOTES
            </Typography>
            <List dense>
              {ingredient.notes.map((note, index) => (
                <ListItem key={index}>
                  <ListItemText primary={note} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Special Handling */}
        {ingredient.special && (
          <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
            <AlertTitle>Special Handling</AlertTitle>
            {ingredient.special}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Ingredient Metadata */}
        <Box>
          <ListItemButton
            onClick={() => setShowMetadata(!showMetadata)}
            sx={{ borderRadius: 1, bgcolor: 'action.hover' }}
          >
            <ListItemIcon>
              <Info fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Ingredient Information" />
            {showMetadata ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          
          <Collapse in={showMetadata}>
            <Box sx={{ p: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                        Type
                      </TableCell>
                      <TableCell>
                        <Chip label={ingredient.type} size="small" />
                      </TableCell>
                    </TableRow>
                    {ingredient.displayName && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                          Display Name
                        </TableCell>
                        <TableCell>{ingredient.displayName}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                        Key Name
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {ingredient.keyname || ingredient.id}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {ingredient.mnemonic && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                          Mnemonic
                        </TableCell>
                        <TableCell>{ingredient.mnemonic}</TableCell>
                      </TableRow>
                    )}
                    {ingredient.uomDisp && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                          Unit
                        </TableCell>
                        <TableCell>{ingredient.uomDisp}</TableCell>
                      </TableRow>
                    )}
                    {ingredient.osmoRatio !== undefined && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                          Osmolarity Ratio
                        </TableCell>
                        <TableCell>{ingredient.osmoRatio}</TableCell>
                      </TableRow>
                    )}
                    {ingredient.precision !== undefined && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                          Precision
                        </TableCell>
                        <TableCell>{ingredient.precision} decimal places</TableCell>
                      </TableRow>
                    )}
                    {ingredient.editMode && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                          Edit Mode
                        </TableCell>
                        <TableCell>{ingredient.editMode}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                        Variants
                      </TableCell>
                      <TableCell>{ingredient.variants?.length || 0}</TableCell>
                    </TableRow>
                    {ingredient.hasSyncConflicts && (
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                          Status
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={<Warning />}
                            label="Sync Conflicts" 
                            size="small" 
                            color="warning"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  )
}

export default IngredientDetailsPanel