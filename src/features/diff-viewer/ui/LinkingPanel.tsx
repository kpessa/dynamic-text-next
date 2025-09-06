'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import {
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  AutoFixHigh as AutoFixIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { LinkingService } from '../lib/linkingService';
import type { SharedIngredient, PopulationType, LinkingResult, LinkingStatus } from '../types';

interface LinkingPanelProps {
  ingredient: SharedIngredient;
  ingredients: SharedIngredient[];
  populations: PopulationType[];
  onLinkingChange?: (status: LinkingStatus | null) => void;
}

export const LinkingPanel: React.FC<LinkingPanelProps> = ({
  ingredient,
  ingredients,
  populations,
  onLinkingChange
}) => {
  const linkingService = LinkingService.getInstance();
  
  const [linkingStatus, setLinkingStatus] = useState<LinkingStatus | null>(null);
  const [candidates, setCandidates] = useState<Map<string, Array<{
    ingredient: SharedIngredient;
    score: number;
    matchType: 'exact' | 'partial' | 'fuzzy';
    matchedFields: string[];
  }>>>(new Map());
  const [selectedLinks, setSelectedLinks] = useState<Map<PopulationType, SharedIngredient>>(new Map());
  const [linkingResult, setLinkingResult] = useState<LinkingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Load current linking status
  useEffect(() => {
    const status = linkingService.getLinkingStatus(ingredient.id);
    setLinkingStatus(status);
    setCanUndo(linkingService.canUndo());
    setCanRedo(linkingService.canRedo());
    onLinkingChange?.(status);
  }, [ingredient.id]);

  // Detect shared ingredients
  const handleDetectCandidates = async () => {
    setLoading(true);
    try {
      const detected = await linkingService.detectSharedIngredients(
        ingredients,
        populations
      );
      setCandidates(detected);
    } catch (error) {
      console.error('Failed to detect candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Link selected ingredients
  const handleLink = async () => {
    if (selectedLinks.size === 0) return;
    
    setLoading(true);
    try {
      const result = await linkingService.linkIngredients(
        ingredient,
        selectedLinks,
        false // Don't auto-resolve conflicts
      );
      
      setLinkingResult(result);
      
      if (result.conflicts.length > 0) {
        setConflictDialogOpen(true);
      } else {
        const status = linkingService.getLinkingStatus(ingredient.id);
        setLinkingStatus(status);
        onLinkingChange?.(status);
        setSelectedLinks(new Map());
      }
      
      setCanUndo(linkingService.canUndo());
      setCanRedo(linkingService.canRedo());
    } catch (error) {
      console.error('Failed to link ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Unlink ingredients
  const handleUnlink = async (populationsToUnlink?: PopulationType[]) => {
    await linkingService.unlinkIngredients(ingredient.id, populationsToUnlink);
    const status = linkingService.getLinkingStatus(ingredient.id);
    setLinkingStatus(status);
    onLinkingChange?.(status);
    setCanUndo(linkingService.canUndo());
    setCanRedo(linkingService.canRedo());
  };

  // Handle undo/redo
  const handleUndo = () => {
    if (linkingService.undo()) {
      const status = linkingService.getLinkingStatus(ingredient.id);
      setLinkingStatus(status);
      onLinkingChange?.(status);
      setCanUndo(linkingService.canUndo());
      setCanRedo(linkingService.canRedo());
    }
  };

  const handleRedo = () => {
    if (linkingService.redo()) {
      const status = linkingService.getLinkingStatus(ingredient.id);
      setLinkingStatus(status);
      onLinkingChange?.(status);
      setCanUndo(linkingService.canUndo());
      setCanRedo(linkingService.canRedo());
    }
  };

  // Auto-resolve conflicts
  const handleAutoResolve = async () => {
    setLoading(true);
    try {
      const result = await linkingService.linkIngredients(
        ingredient,
        selectedLinks,
        true // Auto-resolve conflicts
      );
      
      setLinkingResult(result);
      setConflictDialogOpen(false);
      
      const status = linkingService.getLinkingStatus(ingredient.id);
      setLinkingStatus(status);
      onLinkingChange?.(status);
      setSelectedLinks(new Map());
      
      setCanUndo(linkingService.canUndo());
      setCanRedo(linkingService.canRedo());
    } catch (error) {
      console.error('Failed to auto-resolve conflicts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bulk link operation
  const handleBulkLink = async () => {
    setLoading(true);
    try {
      const results = await linkingService.bulkLinkIngredients(
        ingredients,
        {
          threshold: 0.9,
          populations,
          conflictResolution: 'auto'
        }
      );
      
      // Update status for current ingredient
      const status = linkingService.getLinkingStatus(ingredient.id);
      setLinkingStatus(status);
      onLinkingChange?.(status);
      
      setCanUndo(linkingService.canUndo());
      setCanRedo(linkingService.canRedo());
    } catch (error) {
      console.error('Failed to bulk link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Header with Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Ingredient Linking</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Undo">
              <span>
                <IconButton onClick={handleUndo} disabled={!canUndo} size="small">
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo">
              <span>
                <IconButton onClick={handleRedo} disabled={!canRedo} size="small">
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              startIcon={<AutoFixIcon />}
              onClick={handleBulkLink}
              disabled={loading}
              size="small"
              variant="outlined"
            >
              Auto-Link All
            </Button>
          </Stack>
        </Box>

        {/* Current Linking Status */}
        {linkingStatus && (
          <Alert 
            severity="info" 
            action={
              <Button onClick={() => handleUnlink()} size="small">
                Unlink All
              </Button>
            }
          >
            Linked to {linkingStatus.populations.length} population(s): {linkingStatus.populations.join(', ')}
            <br />
            Confidence: {(linkingStatus.confidence * 100).toFixed(0)}%
          </Alert>
        )}

        {/* Detect Candidates */}
        {!linkingStatus && (
          <Box>
            <Button
              startIcon={<SearchIcon />}
              onClick={handleDetectCandidates}
              disabled={loading}
              variant="contained"
              fullWidth
            >
              Find Similar Ingredients
            </Button>
          </Box>
        )}

        {/* Candidates List */}
        {candidates.size > 0 && !linkingStatus && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Found Candidates
            </Typography>
            <List dense>
              {Array.from(candidates.entries()).slice(0, 5).map(([id, candidateList]) => (
                <React.Fragment key={id}>
                  {candidateList.map((candidate, idx) => (
                    <ListItem key={`${id}-${idx}`}>
                      <ListItemText
                        primary={candidate.ingredient.displayName || candidate.ingredient.name}
                        secondary={
                          <>
                            <Chip 
                              label={candidate.matchType} 
                              size="small" 
                              color={
                                candidate.matchType === 'exact' ? 'success' :
                                candidate.matchType === 'partial' ? 'warning' : 'default'
                              }
                              sx={{ mr: 1 }}
                            />
                            Score: {(candidate.score * 100).toFixed(0)}% | 
                            Matched: {candidate.matchedFields.join(', ')}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <FormControl size="small">
                          <Select
                            value=""
                            onChange={(e) => {
                              const pop = e.target.value as PopulationType;
                              const newLinks = new Map(selectedLinks);
                              newLinks.set(pop, candidate.ingredient);
                              setSelectedLinks(newLinks);
                            }}
                            displayEmpty
                          >
                            <MenuItem value="" disabled>Link as...</MenuItem>
                            {populations.map(pop => (
                              <MenuItem key={pop} value={pop} disabled={selectedLinks.has(pop)}>
                                {pop}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Selected Links */}
        {selectedLinks.size > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Links
            </Typography>
            <Stack spacing={1}>
              {Array.from(selectedLinks.entries()).map(([pop, ing]) => (
                <Box key={pop} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={pop} size="small" color="primary" />
                  <Typography variant="body2">→</Typography>
                  <Typography variant="body2">{ing.displayName || ing.name}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      const newLinks = new Map(selectedLinks);
                      newLinks.delete(pop);
                      setSelectedLinks(newLinks);
                    }}
                  >
                    <LinkOffIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                startIcon={<LinkIcon />}
                onClick={handleLink}
                disabled={loading}
                variant="contained"
                size="small"
              >
                Create Links
              </Button>
              <Button
                onClick={() => setSelectedLinks(new Map())}
                size="small"
              >
                Clear
              </Button>
            </Box>
          </Paper>
        )}

        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Stack>

      {/* Conflict Resolution Dialog */}
      <Dialog open={conflictDialogOpen} onClose={() => setConflictDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Resolve Conflicts
          </Box>
        </DialogTitle>
        <DialogContent>
          {linkingResult?.conflicts && linkingResult.conflicts.length > 0 && (
            <Stack spacing={2}>
              <Alert severity="warning">
                Found {linkingResult.conflicts.length} conflict(s) that need resolution
              </Alert>
              {linkingResult.conflicts.map((conflict, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {conflict.field}
                  </Typography>
                  <List dense>
                    {Array.from(conflict.values.entries()).map(([pop, value]) => (
                      <ListItem key={pop}>
                        <ListItemText
                          primary={pop}
                          secondary={value || '(empty)'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAutoResolve} variant="contained" startIcon={<AutoFixIcon />}>
            Auto-Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};