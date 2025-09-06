import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  CompareArrows as CompareIcon,
  Merge as MergeIcon
} from '@mui/icons-material';
import { ConflictSection } from '@/entities/version';

interface ConflictResolverProps {
  conflicts: ConflictSection[];
  onResolve: (resolutions: Map<string, ConflictSection>) => void;
  onCancel: () => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  conflicts,
  onResolve,
  onCancel
}) => {
  const [resolutions, setResolutions] = useState<Map<string, ConflictSection>>(
    new Map(conflicts.map(c => [c.sectionId, { ...c }]))
  );
  const [editingConflict, setEditingConflict] = useState<string | null>(null);
  const [customResolution, setCustomResolution] = useState<string>('');

  const handleResolutionChoice = (
    sectionId: string,
    choice: 'local' | 'remote' | 'base'
  ) => {
    const conflict = resolutions.get(sectionId);
    if (!conflict) return;

    const updated = { ...conflict };
    updated.resolution = choice;
    
    switch (choice) {
      case 'local':
        updated.resolved = conflict.local;
        break;
      case 'remote':
        updated.resolved = conflict.remote;
        break;
      case 'base':
        updated.resolved = conflict.base;
        break;
    }
    
    setResolutions(new Map(resolutions).set(sectionId, updated));
  };

  const handleManualEdit = (sectionId: string) => {
    const conflict = resolutions.get(sectionId);
    if (!conflict) return;
    
    setEditingConflict(sectionId);
    setCustomResolution(conflict.resolved || conflict.local);
  };

  const handleSaveManualEdit = () => {
    if (!editingConflict) return;
    
    const conflict = resolutions.get(editingConflict);
    if (!conflict) return;
    
    const updated = { ...conflict };
    updated.resolution = 'manual';
    updated.resolved = customResolution;
    
    setResolutions(new Map(resolutions).set(editingConflict, updated));
    setEditingConflict(null);
    setCustomResolution('');
  };

  const handleCancelEdit = () => {
    setEditingConflict(null);
    setCustomResolution('');
  };

  const handleAutoMerge = (sectionId: string) => {
    const conflict = resolutions.get(sectionId);
    if (!conflict) return;
    
    try {
      const localObj = JSON.parse(conflict.local);
      const remoteObj = JSON.parse(conflict.remote);
      const baseObj = conflict.base ? JSON.parse(conflict.base) : {};
      
      const merged = { ...baseObj, ...remoteObj, ...localObj };
      
      const updated = { ...conflict };
      updated.resolution = 'auto';
      updated.resolved = JSON.stringify(merged, null, 2);
      
      setResolutions(new Map(resolutions).set(sectionId, updated));
    } catch (error) {
      console.error('Auto-merge failed:', error);
    }
  };

  const isAllResolved = () => {
    return Array.from(resolutions.values()).every(r => r.resolved);
  };

  const getResolutionStats = () => {
    const stats = {
      local: 0,
      remote: 0,
      manual: 0,
      auto: 0,
      unresolved: 0
    };
    
    resolutions.forEach(r => {
      if (!r.resolution) {
        stats.unresolved++;
      } else {
        stats[r.resolution]++;
      }
    });
    
    return stats;
  };

  const stats = getResolutionStats();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resolve Conflicts
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} found. 
          Please choose how to resolve each conflict.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Chip label={`Unresolved: ${stats.unresolved}`} color="error" size="small" />
          <Chip label={`Use Local: ${stats.local}`} color="primary" size="small" />
          <Chip label={`Use Remote: ${stats.remote}`} color="secondary" size="small" />
          <Chip label={`Manual: ${stats.manual}`} color="warning" size="small" />
          <Chip label={`Auto: ${stats.auto}`} color="success" size="small" />
        </Box>
      </Paper>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {conflicts.map((conflict, index) => {
          const resolution = resolutions.get(conflict.sectionId);
          const isEditing = editingConflict === conflict.sectionId;
          
          return (
            <Card key={conflict.sectionId} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Conflict {index + 1} of {conflicts.length}
                  </Typography>
                  {resolution?.resolved && (
                    <Chip
                      icon={<CheckIcon />}
                      label="Resolved"
                      color="success"
                      size="small"
                    />
                  )}
                </Box>

                {isEditing ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={10}
                      value={customResolution}
                      onChange={(e) => setCustomResolution(e.target.value)}
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={handleSaveManualEdit}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloseIcon />}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2,
                            bgcolor: resolution?.resolution === 'local' ? 'action.selected' : 'background.paper'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="primary">
                              Your Version (Local)
                            </Typography>
                            <Radio
                              checked={resolution?.resolution === 'local'}
                              onChange={() => handleResolutionChoice(conflict.sectionId, 'local')}
                              size="small"
                            />
                          </Box>
                          <Box 
                            sx={{ 
                              p: 1, 
                              bgcolor: 'grey.100', 
                              borderRadius: 1,
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              overflow: 'auto',
                              maxHeight: 200
                            }}
                          >
                            <pre style={{ margin: 0 }}>
                              {JSON.stringify(JSON.parse(conflict.local), null, 2)}
                            </pre>
                          </Box>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2,
                            bgcolor: resolution?.resolution === 'remote' ? 'action.selected' : 'background.paper'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="secondary">
                              Their Version (Remote)
                            </Typography>
                            <Radio
                              checked={resolution?.resolution === 'remote'}
                              onChange={() => handleResolutionChoice(conflict.sectionId, 'remote')}
                              size="small"
                            />
                          </Box>
                          <Box 
                            sx={{ 
                              p: 1, 
                              bgcolor: 'grey.100', 
                              borderRadius: 1,
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              overflow: 'auto',
                              maxHeight: 200
                            }}
                          >
                            <pre style={{ margin: 0 }}>
                              {JSON.stringify(JSON.parse(conflict.remote), null, 2)}
                            </pre>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>

                    {conflict.base && (
                      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Base Version
                          </Typography>
                          <Radio
                            checked={resolution?.resolution === 'base'}
                            onChange={() => handleResolutionChoice(conflict.sectionId, 'base')}
                            size="small"
                          />
                        </Box>
                        <Box 
                          sx={{ 
                            p: 1, 
                            bgcolor: 'grey.100', 
                            borderRadius: 1,
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            overflow: 'auto',
                            maxHeight: 150
                          }}
                        >
                          <pre style={{ margin: 0 }}>
                            {JSON.stringify(JSON.parse(conflict.base), null, 2)}
                          </pre>
                        </Box>
                      </Paper>
                    )}

                    {resolution?.resolved && resolution.resolution === 'manual' && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Manually edited resolution
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
              
              {!isEditing && (
                <CardActions>
                  <Tooltip title="Edit manually">
                    <IconButton size="small" onClick={() => handleManualEdit(conflict.sectionId)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Try auto-merge">
                    <IconButton size="small" onClick={() => handleAutoMerge(conflict.sectionId)}>
                      <MergeIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              )}
            </Card>
          );
        })}
      </Box>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => onResolve(resolutions)}
            disabled={!isAllResolved()}
            startIcon={<CheckIcon />}
          >
            Apply Resolutions ({stats.unresolved === 0 ? 'All Resolved' : `${stats.unresolved} Unresolved`})
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};