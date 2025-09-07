import React from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  Tooltip
} from '@mui/material'
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  Science as ScienceIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import type { Ingredient } from '@/entities/ingredient/types'

interface IngredientDetailDrawerProps {
  open: boolean
  ingredient: Ingredient | null
  onClose: () => void
  onEdit: (ingredient: Ingredient) => void
  onDelete: (id: string) => void
}

export const IngredientDetailDrawer: React.FC<IngredientDetailDrawerProps> = ({
  open,
  ingredient,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!ingredient) return null

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electrolyte: 'primary',
      macro: 'secondary',
      micro: 'info',
      vitamin: 'success',
      trace: 'warning',
      other: 'default'
    }
    return colors[category] || 'default'
  }

  const getPopulationLabel = (pop: string) => {
    const labels: Record<string, string> = {
      NEO: 'Neonatal',
      CHILD: 'Pediatric',
      ADOLESCENT: 'Adolescent',
      ADULT: 'Adult'
    }
    return labels[pop] || pop
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <ScienceIcon />
                <Typography variant="h6">
                  Ingredient Details
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold">
                {ingredient.displayName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {ingredient.keyname}
              </Typography>
            </Box>
            <IconButton 
              onClick={onClose}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEdit(ingredient)}
              fullWidth
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              startIcon={<DuplicateIcon />}
              fullWidth
            >
              Duplicate
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(ingredient.id)}
            >
              Delete
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* Basic Information */}
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              BASIC INFORMATION
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Chip
                  label={ingredient.category}
                  size="small"
                  color={getCategoryColor(ingredient.category) as any}
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Unit
                </Typography>
                <Typography variant="body1">{ingredient.unit}</Typography>
              </Box>
              {ingredient.mnemonic && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mnemonic
                  </Typography>
                  <Typography variant="body1">{ingredient.mnemonic}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Sharing Status
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  {ingredient.isShared ? (
                    <Chip
                      icon={<ShareIcon />}
                      label="Shared"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label="Private"
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {ingredient.healthSystem && (
                    <Chip
                      label={ingredient.healthSystem}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Concentration */}
          {ingredient.concentration && (
            <>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  CONCENTRATION
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Typography variant="body2">
                    {ingredient.concentration.strength} {ingredient.concentration.strengthUnit} / {ingredient.concentration.volume} {ingredient.concentration.volumeUnit}
                  </Typography>
                </Paper>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Reference Ranges */}
          {ingredient.referenceRanges && ingredient.referenceRanges.length > 0 && (
            <>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  REFERENCE RANGES
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Population</TableCell>
                        <TableCell>Min</TableCell>
                        <TableCell>Max</TableCell>
                        <TableCell>Unit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ingredient.referenceRanges.map((range, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              label={getPopulationLabel(range.populationType)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{range.min || range.normal?.low || '-'}</TableCell>
                          <TableCell>{range.max || range.normal?.high || '-'}</TableCell>
                          <TableCell>{range.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Formula */}
          {ingredient.formula && (
            <>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  FORMULA
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" fontFamily="monospace">
                    {ingredient.formula}
                  </Typography>
                </Paper>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Dependencies & Exclusions */}
          {(ingredient.dependencies?.length || ingredient.excludes?.length) && (
            <>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  RELATIONSHIPS
                </Typography>
                {ingredient.dependencies && ingredient.dependencies.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Dependencies
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {ingredient.dependencies.map((dep, index) => (
                        <Chip
                          key={index}
                          label={dep}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                {ingredient.excludes && ingredient.excludes.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Exclusions
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {ingredient.excludes.map((exc, index) => (
                        <Chip
                          key={index}
                          label={exc}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Notes */}
          {ingredient.notes && ingredient.notes.length > 0 && (
            <>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  NOTES
                </Typography>
                <List dense>
                  {ingredient.notes.map((note, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={note}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Metadata */}
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              METADATA
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(ingredient.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Updated
                </Typography>
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(ingredient.updatedAt), { addSuffix: true })}
                </Typography>
              </Box>
              {ingredient.version && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body2">{ingredient.version}</Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Warnings */}
          {ingredient.special && (
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="body2">{ingredient.special}</Typography>
            </Alert>
          )}
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Button
            fullWidth
            startIcon={<HistoryIcon />}
            onClick={() => {/* TODO: Show history */}}
          >
            View History
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}