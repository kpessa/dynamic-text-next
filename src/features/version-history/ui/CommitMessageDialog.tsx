import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { ChangeTracking } from '@/entities/version';

interface CommitMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onCommit: (message: string) => void;
  changes: ChangesSummary;
  suggestions?: string[];
}

export interface ChangesSummary {
  sectionsAdded: number;
  sectionsModified: number;
  sectionsRemoved: number;
  ingredientsAdded?: number;
  ingredientsModified?: number;
  ingredientsRemoved?: number;
  totalChanges: number;
}

export const CommitMessageDialog: React.FC<CommitMessageDialogProps> = ({
  open,
  onClose,
  onCommit,
  changes,
  suggestions = []
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateSummary = (): string => {
    const parts: string[] = [];
    
    if (changes.sectionsAdded > 0) {
      parts.push(`Added ${changes.sectionsAdded} section${changes.sectionsAdded > 1 ? 's' : ''}`);
    }
    if (changes.sectionsModified > 0) {
      parts.push(`Modified ${changes.sectionsModified} section${changes.sectionsModified > 1 ? 's' : ''}`);
    }
    if (changes.sectionsRemoved > 0) {
      parts.push(`Removed ${changes.sectionsRemoved} section${changes.sectionsRemoved > 1 ? 's' : ''}`);
    }
    
    if (changes.ingredientsAdded && changes.ingredientsAdded > 0) {
      parts.push(`Added ${changes.ingredientsAdded} ingredient${changes.ingredientsAdded > 1 ? 's' : ''}`);
    }
    if (changes.ingredientsModified && changes.ingredientsModified > 0) {
      parts.push(`Modified ${changes.ingredientsModified} ingredient${changes.ingredientsModified > 1 ? 's' : ''}`);
    }
    if (changes.ingredientsRemoved && changes.ingredientsRemoved > 0) {
      parts.push(`Removed ${changes.ingredientsRemoved} ingredient${changes.ingredientsRemoved > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ') || 'No changes';
  };

  const handleCommit = () => {
    if (!message.trim()) {
      setError('Please enter a commit message');
      return;
    }
    
    if (message.length > 500) {
      setError('Commit message is too long (max 500 characters)');
      return;
    }
    
    onCommit(message);
    setMessage('');
    setError(null);
  };

  const handleClose = () => {
    setMessage('');
    setError(null);
    onClose();
  };

  const defaultSuggestions = [
    'Updated content sections',
    'Fixed formatting issues',
    'Added new ingredients',
    'Updated reference ranges',
    'Corrected calculations',
    'Improved documentation'
  ];

  const allSuggestions = [...suggestions, ...defaultSuggestions].slice(0, 6);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Save Changes</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Summary of changes:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {generateSummary()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {changes.sectionsAdded > 0 && (
              <Chip 
                size="small" 
                label={`+${changes.sectionsAdded}`} 
                color="success" 
                variant="outlined"
              />
            )}
            {changes.sectionsModified > 0 && (
              <Chip 
                size="small" 
                label={`~${changes.sectionsModified}`} 
                color="warning" 
                variant="outlined"
              />
            )}
            {changes.sectionsRemoved > 0 && (
              <Chip 
                size="small" 
                label={`-${changes.sectionsRemoved}`} 
                color="error" 
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <TextField
          autoFocus
          label="Commit Message"
          placeholder="Describe your changes..."
          fullWidth
          multiline
          rows={3}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError(null);
          }}
          error={!!error}
          helperText={error || `${message.length}/500 characters`}
          sx={{ mb: 2 }}
        />

        {allSuggestions.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Quick suggestions:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
              {allSuggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  onClick={() => setMessage(suggestion)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {changes.totalChanges > 50 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Large number of changes detected. Consider breaking this into smaller commits.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleCommit} 
          variant="contained"
          disabled={!message.trim()}
        >
          Save Version
        </Button>
      </DialogActions>
    </Dialog>
  );
};