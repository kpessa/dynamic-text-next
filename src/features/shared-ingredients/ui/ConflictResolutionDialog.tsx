import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Paper,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Switch
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  CloudDownload as ServerIcon,
  Computer as LocalIcon,
  Merge as MergeIcon,
  Edit as ManualIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { SyncConflict, SharedIngredient } from '@/entities/shared-ingredient';
import { ResolutionStrategy } from '../lib/conflictResolver';

interface ConflictResolutionDialogProps {
  open: boolean;
  onClose: () => void;
  conflict: SyncConflict | null;
  onResolve: (strategy: ResolutionStrategy, customData?: Partial<SharedIngredient>) => void;
}

export const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  open,
  onClose,
  conflict,
  onResolve
}) => {
  const [strategy, setStrategy] = useState<ResolutionStrategy>('merge');
  const [customData, setCustomData] = useState<Partial<SharedIngredient>>({});
  const [showDetails, setShowDetails] = useState(false);

  if (!conflict) return null;

  const handleResolve = () => {
    if (strategy === 'manual') {
      onResolve(strategy, customData);
    } else {
      onResolve(strategy);
    }
    onClose();
  };

  const renderConflictField = (
    field: string,
    localValue: any,
    serverValue: any
  ) => {
    const isDifferent = JSON.stringify(localValue) !== JSON.stringify(serverValue);
    
    if (!isDifferent) return null;
    
    return (
      <Box key={field} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {field.charAt(0).toUpperCase() + field.slice(1)}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 1, bgcolor: 'action.hover' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="caption">Local Version</Typography>
              </Box>
              <Typography variant="body2">
                {typeof localValue === 'object' ? JSON.stringify(localValue, null, 2) : localValue}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 1, bgcolor: 'action.hover' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ServerIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="caption">Server Version</Typography>
              </Box>
              <Typography variant="body2">
                {typeof serverValue === 'object' ? JSON.stringify(serverValue, null, 2) : serverValue}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderStrategyDescription = () => {
    switch (strategy) {
      case 'local':
        return 'Keep your local changes and overwrite the server version';
      case 'server':
        return 'Discard your local changes and use the server version';
      case 'merge':
        return 'Automatically merge changes, keeping newer modifications';
      case 'manual':
        return 'Manually edit and resolve conflicts field by field';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Resolve Sync Conflict</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This ingredient has been modified in multiple places. Choose how to resolve the conflict.
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Ingredient: {conflict.localVersion.displayName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip
              label={`Local: ${new Date(conflict.localVersion.metadata.modifiedAt).toLocaleString()}`}
              size="small"
              icon={<LocalIcon />}
            />
            <Chip
              label={`Server: ${new Date(conflict.serverVersion.metadata.modifiedAt).toLocaleString()}`}
              size="small"
              icon={<ServerIcon />}
            />
          </Box>
        </Box>
        
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Resolution Strategy</FormLabel>
          <RadioGroup value={strategy} onChange={(e) => setStrategy(e.target.value as ResolutionStrategy)}>
            <FormControlLabel
              value="merge"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MergeIcon />
                  <Box>
                    <Typography>Auto-merge (Recommended)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Intelligently combine both versions
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="local"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalIcon />
                  <Box>
                    <Typography>Keep Local Version</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use your changes, discard server changes
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="server"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ServerIcon />
                  <Box>
                    <Typography>Keep Server Version</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Discard your changes, use server version
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="manual"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ManualIcon />
                  <Box>
                    <Typography>Manual Resolution</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Edit fields manually to resolve conflicts
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          {renderStrategyDescription()}
        </Alert>
        
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">Conflicting Fields</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
              />
            }
            label="Show Details"
          />
        </Box>
        
        {showDetails && (
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {conflict.conflictingFields.map(field => 
              renderConflictField(
                field,
                (conflict.localVersion as any)[field],
                (conflict.serverVersion as any)[field]
              )
            )}
          </Box>
        )}
        
        {strategy === 'manual' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Manual Edit
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Display Name"
              defaultValue={conflict.localVersion.displayName}
              onChange={(e) => setCustomData({
                ...customData,
                displayName: e.target.value
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Unit"
              defaultValue={conflict.localVersion.unit}
              onChange={(e) => setCustomData({
                ...customData,
                unit: e.target.value
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Category"
              defaultValue={conflict.localVersion.category}
              onChange={(e) => setCustomData({
                ...customData,
                category: e.target.value
              })}
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="outlined" startIcon={<CompareIcon />}>
          View Full Comparison
        </Button>
        <Button variant="contained" onClick={handleResolve}>
          Apply Resolution
        </Button>
      </DialogActions>
    </Dialog>
  );
};