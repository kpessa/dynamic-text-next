import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Switch,
  LinearProgress,
  Paper,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  PlayArrow as MigrateIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Undo as RollbackIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { migrateIngredients, selectMigrationStatus } from '../model/sharedIngredientSlice';
import { Ingredient } from '@/entities/ingredient/types';
import { MigrationOptions, MigrationPreview } from '@/entities/shared-ingredient';
import { MigrationService } from '../lib/migrationService';

interface MigrationWizardProps {
  open: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
}

export const MigrationWizard: React.FC<MigrationWizardProps> = ({
  open,
  onClose,
  ingredients
}) => {
  const dispatch = useAppDispatch();
  const migrationStatus = useAppSelector(selectMigrationStatus);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    ingredients.map(i => i.id)
  );
  const [options, setOptions] = useState<MigrationOptions>({
    deduplication: true,
    updateReferences: true,
    preserveCustomizations: true,
    createBackup: true,
    batchSize: 50,
    conflictResolution: 'manual'
  });
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const steps = [
    'Select Ingredients',
    'Configure Options',
    'Preview Migration',
    'Execute Migration',
    'Complete'
  ];

  useEffect(() => {
    if (activeStep === 2 && !preview) {
      generatePreview();
    }
  }, [activeStep]);

  const generatePreview = async () => {
    setIsPreviewLoading(true);
    const service = MigrationService.getInstance();
    const selectedIngs = ingredients.filter(i => selectedIngredients.includes(i.id));
    const result = await service.preview(selectedIngs, options);
    setPreview(result);
    setIsPreviewLoading(false);
  };

  const handleNext = () => {
    if (activeStep === 3) {
      // Execute migration
      const selectedIngs = ingredients.filter(i => selectedIngredients.includes(i.id));
      dispatch(migrateIngredients({ ingredients: selectedIngs, options }));
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleIngredientToggle = (ingredientId: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select which ingredients to migrate to the shared repository
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedIngredients.length === ingredients.length}
                  indeterminate={
                    selectedIngredients.length > 0 && 
                    selectedIngredients.length < ingredients.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIngredients(ingredients.map(i => i.id));
                    } else {
                      setSelectedIngredients([]);
                    }
                  }}
                />
              }
              label={`Select All (${ingredients.length})`}
            />
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {ingredients.map((ingredient) => (
                <ListItem key={ingredient.id} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedIngredients.includes(ingredient.id)}
                      onChange={() => handleIngredientToggle(ingredient.id)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={ingredient.displayName}
                    secondary={`${ingredient.category} - ${ingredient.unit}`}
                  />
                </ListItem>
              ))}
            </List>
            <Alert severity="info" sx={{ mt: 2 }}>
              Selected {selectedIngredients.length} of {ingredients.length} ingredients
            </Alert>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configure migration options
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={options.deduplication}
                    onChange={(e) => setOptions({
                      ...options,
                      deduplication: e.target.checked
                    })}
                  />
                }
                label="Enable deduplication detection"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                Automatically detect and merge duplicate ingredients
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={options.updateReferences}
                    onChange={(e) => setOptions({
                      ...options,
                      updateReferences: e.target.checked
                    })}
                  />
                }
                label="Update all references"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                Update all document references to use shared ingredients
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={options.preserveCustomizations}
                    onChange={(e) => setOptions({
                      ...options,
                      preserveCustomizations: e.target.checked
                    })}
                  />
                }
                label="Preserve customizations"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                Keep existing customizations for each reference
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={options.createBackup}
                    onChange={(e) => setOptions({
                      ...options,
                      createBackup: e.target.checked
                    })}
                  />
                }
                label="Create backup"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                Create a backup before migration for rollback capability
              </Typography>
            </FormGroup>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Review migration plan before execution
            </Typography>
            {isPreviewLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <LinearProgress sx={{ width: '50%' }} />
              </Box>
            ) : preview ? (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {preview.totalIngredients}
                      </Typography>
                      <Typography variant="caption">Total Ingredients</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {preview.duplicatesFound}
                      </Typography>
                      <Typography variant="caption">Duplicates Found</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {preview.conflictsDetected}
                      </Typography>
                      <Typography variant="caption">Conflicts Detected</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {preview.referencesToUpdate}
                      </Typography>
                      <Typography variant="caption">References to Update</Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Estimated time: {Math.ceil(preview.estimatedTime / 1000)} seconds
                </Alert>
                
                <Typography variant="subtitle2" gutterBottom>
                  Planned Actions:
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ingredient</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.changes.slice(0, 10).map((change, index) => (
                        <TableRow key={index}>
                          <TableCell>{change.ingredientId}</TableCell>
                          <TableCell>
                            <Chip 
                              label={change.action} 
                              size="small" 
                              color={change.action === 'create' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>{change.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : null}
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Migration in progress...
            </Typography>
            {migrationStatus.inProgress ? (
              <Box sx={{ mt: 3 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Processing ingredients...
                </Typography>
              </Box>
            ) : null}
          </Box>
        );
        
      case 4:
        return (
          <Box>
            {migrationStatus.result ? (
              <>
                <Alert 
                  severity={migrationStatus.result.success ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                >
                  {migrationStatus.result.success 
                    ? 'Migration completed successfully!'
                    : 'Migration completed with errors'}
                </Alert>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2">Results</Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Processed"
                            secondary={migrationStatus.result.processed}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Created"
                            secondary={migrationStatus.result.created}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Updated"
                            secondary={migrationStatus.result.updated}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Merged"
                            secondary={migrationStatus.result.merged}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Failed"
                            secondary={migrationStatus.result.failed}
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                  
                  {migrationStatus.result.errors && migrationStatus.result.errors.length > 0 && (
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="error">
                          Errors
                        </Typography>
                        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                          {migrationStatus.result.errors.map((error, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <ErrorIcon color="error" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={error.ingredientId}
                                secondary={error.error}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
                
                {migrationStatus.result.rollbackAvailable && (
                  <Alert severity="info" action={
                    <Button 
                      color="inherit" 
                      size="small"
                      startIcon={<RollbackIcon />}
                    >
                      Rollback
                    </Button>
                  }>
                    Rollback is available if needed
                  </Alert>
                )}
              </>
            ) : null}
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon />
          <Typography variant="h6">Migrate Ingredients to Shared Repository</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={
                      (index === 0 && selectedIngredients.length === 0) ||
                      (index === 3 && migrationStatus.inProgress)
                    }
                    sx={{ mr: 1 }}
                  >
                    {index === 3 ? 'Execute' : index === 4 ? 'Finish' : 'Next'}
                  </Button>
                  {index > 0 && index < 4 && (
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  {index < 3 && (
                    <Button onClick={onClose} sx={{ ml: 1 }}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};