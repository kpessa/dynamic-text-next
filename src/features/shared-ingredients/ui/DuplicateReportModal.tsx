import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Paper,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Merge as MergeIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CompareArrows as CompareIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { SharedIngredient, DuplicateGroup } from '@/entities/shared-ingredient';
import { useAppDispatch } from '@/app/hooks';

interface DuplicateReportModalProps {
  open: boolean;
  onClose: () => void;
  duplicateGroups: DuplicateGroup[];
  onMerge: (group: DuplicateGroup, masterId: string) => void;
  onDelete: (ingredientId: string) => void;
}

export const DuplicateReportModal: React.FC<DuplicateReportModalProps> = ({
  open,
  onClose,
  duplicateGroups,
  onMerge,
  onDelete
}) => {
  const [selectedMaster, setSelectedMaster] = useState<{ [groupId: string]: string }>({});
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');

  const handleMergeGroup = (group: DuplicateGroup) => {
    const masterId = selectedMaster[group.groupId];
    if (masterId) {
      onMerge(group, masterId);
    }
  };

  const getSimilarityColor = (similarity: number): 'error' | 'warning' | 'success' => {
    if (similarity >= 0.95) return 'error';
    if (similarity >= 0.85) return 'warning';
    return 'success';
  };

  const getSimilarityLabel = (similarity: number): string => {
    if (similarity >= 0.95) return 'Exact Match';
    if (similarity >= 0.85) return 'High Similarity';
    return 'Similar';
  };

  const renderIngredientComparison = (group: DuplicateGroup) => {
    if (group.ingredients.length !== 2) return null;
    
    const [ing1, ing2] = group.ingredients;
    
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {ing1.displayName}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Category:</Typography>
              <Typography variant="body2">{ing1.category}</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Unit:</Typography>
              <Typography variant="body2">{ing1.unit}</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Usage:</Typography>
              <Typography variant="body2">{ing1.usage.referenceCount} references</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Last Modified:</Typography>
              <Typography variant="body2">
                {new Date(ing1.metadata.modifiedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {ing2.displayName}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Category:</Typography>
              <Typography variant="body2">{ing2.category}</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Unit:</Typography>
              <Typography variant="body2">{ing2.unit}</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Usage:</Typography>
              <Typography variant="body2">{ing2.usage.referenceCount} references</Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Last Modified:</Typography>
              <Typography variant="body2">
                {new Date(ing2.metadata.modifiedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Duplicate Ingredients Report</Typography>
          <Box>
            <Button
              size="small"
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('list')}
              sx={{ mr: 1 }}
            >
              List View
            </Button>
            <Button
              size="small"
              variant={viewMode === 'compare' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('compare')}
            >
              Compare View
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {duplicateGroups.length === 0 ? (
          <Alert severity="info">No duplicate groups found</Alert>
        ) : (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Found {duplicateGroups.length} groups with potential duplicates. 
              Review each group and select which ingredient to keep as the master.
            </Alert>
            
            <List>
              {duplicateGroups.map((group) => (
                <Box key={group.groupId}>
                  <ListItem
                    button
                    onClick={() => setExpandedGroup(
                      expandedGroup === group.groupId ? null : group.groupId
                    )}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            Group: {group.ingredients.map(i => i.displayName).join(' / ')}
                          </Typography>
                          <Chip
                            label={`${(group.similarity * 100).toFixed(0)}% match`}
                            size="small"
                            color={getSimilarityColor(group.similarity)}
                          />
                          <Chip
                            label={getSimilarityLabel(group.similarity)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={`${group.ingredients.length} ingredients found`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => setExpandedGroup(
                          expandedGroup === group.groupId ? null : group.groupId
                        )}
                      >
                        {expandedGroup === group.groupId ? <CloseIcon /> : <ViewIcon />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {expandedGroup === group.groupId && (
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                      {viewMode === 'list' ? (
                        <FormControl component="fieldset">
                          <RadioGroup
                            value={selectedMaster[group.groupId] || ''}
                            onChange={(e) => setSelectedMaster({
                              ...selectedMaster,
                              [group.groupId]: e.target.value
                            })}
                          >
                            {group.ingredients.map((ingredient) => (
                              <FormControlLabel
                                key={ingredient.id}
                                value={ingredient.id}
                                control={<Radio />}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>{ingredient.displayName}</Typography>
                                    <Chip
                                      label={`${ingredient.usage.referenceCount} refs`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {ingredient.metadata.isPublic && (
                                      <Chip label="Public" size="small" color="primary" />
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      Modified: {new Date(ingredient.metadata.modifiedAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                }
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      ) : (
                        renderIngredientComparison(group)
                      )}
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<MergeIcon />}
                          onClick={() => handleMergeGroup(group)}
                          disabled={!selectedMaster[group.groupId]}
                        >
                          Merge Selected
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CompareIcon />}
                          onClick={() => setViewMode(viewMode === 'list' ? 'compare' : 'list')}
                        >
                          {viewMode === 'list' ? 'Compare' : 'List View'}
                        </Button>
                        <Tooltip title="Keep all as separate ingredients">
                          <Button variant="outlined">
                            Keep Separate
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                  
                  <Divider />
                </Box>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            // Apply all selected merges
            duplicateGroups.forEach(group => {
              if (selectedMaster[group.groupId]) {
                handleMergeGroup(group);
              }
            });
            onClose();
          }}
          disabled={Object.keys(selectedMaster).length === 0}
        >
          Apply All Merges
        </Button>
      </DialogActions>
    </Dialog>
  );
};