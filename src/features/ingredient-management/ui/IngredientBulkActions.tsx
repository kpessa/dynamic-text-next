import React, { useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Share as ShareIcon,
  Block as BlockIcon,
  Category as CategoryIcon,
  Science as ScienceIcon,
  FileDownload as ExportIcon,
  CheckCircle as ValidateIcon,
  MoreVert as MoreIcon,
  Update as UpdateIcon,
  LocalHospital as HealthSystemIcon
} from '@mui/icons-material'
import type { 
  IngredientCategory,
  IngredientType,
  BulkOperation
} from '@/entities/ingredient/types'

interface IngredientBulkActionsProps {
  selectedCount: number
  selectedIds: string[]
  onBulkOperation: (operation: BulkOperation) => void
  onExport?: (ids: string[]) => void
  disabled?: boolean
}

type DialogType = 'delete' | 'category' | 'type' | 'healthSystem' | 'share' | null

export const IngredientBulkActions: React.FC<IngredientBulkActionsProps> = ({
  selectedCount,
  selectedIds,
  onBulkOperation,
  onExport,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [dialogOpen, setDialogOpen] = useState<DialogType>(null)
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory>('other')
  const [selectedType, setSelectedType] = useState<IngredientType>('Other')
  const [selectedHealthSystem, setSelectedHealthSystem] = useState<string>('')
  const [shareStatus, setShareStatus] = useState<boolean>(true)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleDialogOpen = (type: DialogType) => {
    setDialogOpen(type)
    handleMenuClose()
  }

  const handleDialogClose = () => {
    setDialogOpen(null)
  }

  const handleDelete = () => {
    onBulkOperation({
      type: 'delete',
      ingredientIds: selectedIds,
      options: { transaction: true }
    })
    handleDialogClose()
  }

  const handleUpdateCategory = () => {
    onBulkOperation({
      type: 'update',
      ingredientIds: selectedIds,
      changes: { category: selectedCategory },
      options: { transaction: true }
    })
    handleDialogClose()
  }

  const handleUpdateType = () => {
    onBulkOperation({
      type: 'update',
      ingredientIds: selectedIds,
      changes: { type: selectedType },
      options: { transaction: true }
    })
    handleDialogClose()
  }

  const handleUpdateHealthSystem = () => {
    onBulkOperation({
      type: 'update',
      ingredientIds: selectedIds,
      changes: { healthSystem: selectedHealthSystem },
      options: { transaction: true }
    })
    handleDialogClose()
  }

  const handleUpdateShareStatus = () => {
    onBulkOperation({
      type: 'update',
      ingredientIds: selectedIds,
      changes: { isShared: shareStatus },
      options: { transaction: true }
    })
    handleDialogClose()
  }

  const handleValidate = () => {
    onBulkOperation({
      type: 'validate',
      ingredientIds: selectedIds,
      options: { dryRun: false }
    })
    handleMenuClose()
  }

  const handleExport = () => {
    onExport?.(selectedIds)
    handleMenuClose()
  }

  const isDisabled = disabled || selectedCount === 0

  const ingredientCategories: IngredientCategory[] = [
    'macro', 'micro', 'electrolyte', 'vitamin', 'other'
  ]

  const ingredientTypes: IngredientType[] = [
    'Macronutrient', 'Micronutrient', 'Additive', 'Salt', 'Diluent', 'Other'
  ]

  return (
    <>
      <Box display="flex" alignItems="center" gap={2}>
        {selectedCount > 0 && (
          <Chip
            label={`${selectedCount} selected`}
            color="primary"
            variant="outlined"
          />
        )}

        <ButtonGroup variant="outlined" disabled={isDisabled}>
          <Button
            startIcon={<ValidateIcon />}
            onClick={handleValidate}
          >
            Validate
          </Button>
          <Button
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            onClick={handleMenuOpen}
          >
            <MoreIcon />
          </Button>
        </ButtonGroup>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleDialogOpen('category')}>
            <ListItemIcon>
              <CategoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Change Category</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('type')}>
            <ListItemIcon>
              <ScienceIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Change Type</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('healthSystem')}>
            <ListItemIcon>
              <HealthSystemIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Set Health System</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('share')}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Update Share Status</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleDialogOpen('delete')}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Selected</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen === 'delete'} onClose={handleDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <DialogContentText>
            Are you sure you want to delete {selectedCount} ingredient{selectedCount > 1 ? 's' : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Update Dialog */}
      <Dialog open={dialogOpen === 'category'} onClose={handleDialogClose}>
        <DialogTitle>Change Category</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update category for {selectedCount} ingredient{selectedCount > 1 ? 's' : ''}
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as IngredientCategory)}
              label="Category"
            >
              {ingredientCategories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateCategory} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Type Update Dialog */}
      <Dialog open={dialogOpen === 'type'} onClose={handleDialogClose}>
        <DialogTitle>Change Type</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update type for {selectedCount} ingredient{selectedCount > 1 ? 's' : ''}
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as IngredientType)}
              label="Type"
            >
              {ingredientTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateType} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Health System Update Dialog */}
      <Dialog open={dialogOpen === 'healthSystem'} onClose={handleDialogClose}>
        <DialogTitle>Set Health System</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update health system for {selectedCount} ingredient{selectedCount > 1 ? 's' : ''}
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Health System</InputLabel>
            <Select
              value={selectedHealthSystem}
              onChange={(e) => setSelectedHealthSystem(e.target.value)}
              label="Health System"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateHealthSystem} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Status Update Dialog */}
      <Dialog open={dialogOpen === 'share'} onClose={handleDialogClose}>
        <DialogTitle>Update Share Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update share status for {selectedCount} ingredient{selectedCount > 1 ? 's' : ''}
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Share Status</InputLabel>
            <Select
              value={shareStatus ? 'shared' : 'not-shared'}
              onChange={(e) => setShareStatus(e.target.value === 'shared')}
              label="Share Status"
            >
              <MenuItem value="shared">
                <Box display="flex" alignItems="center" gap={1}>
                  <ShareIcon fontSize="small" />
                  Shared
                </Box>
              </MenuItem>
              <MenuItem value="not-shared">
                <Box display="flex" alignItems="center" gap={1}>
                  <BlockIcon fontSize="small" />
                  Not Shared
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateShareStatus} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}