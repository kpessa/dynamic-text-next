'use client'

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Alert,
  Paper,
  CircularProgress,
  Stack,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  LinearProgress,
  Divider,
  IconButton,
  Collapse,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip
} from '@mui/material'
import { 
  Upload, 
  FileUpload, 
  Check, 
  FolderOpen,
  Warning,
  Error as ErrorIcon,
  Info,
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
  MergeType as Merge,
  Add,
  SkipNext as Skip
} from '@mui/icons-material'
import {
  validateImport,
  detectPopulationTypeFromFilename,
  type ValidationResult
} from '@/features/data-import/lib/validator'
import type { TPNConfiguration, PopulationType } from '@/features/data-import/types/schemas'
import { getAvailableConfigs, loadConfig } from '@/shared/data/refs'

// Import new services
import { ingredientExtractionService, type ExtractedIngredient } from '@/features/data-import/lib/ingredientExtractionService'
import { importAnalysisService, type ImportMatch, type ImportDecision } from '@/features/data-import/lib/importAnalysisService'
import { configManifestService } from '@/entities/config/model/configManifestService'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'

interface ImportModalEnhancedProps {
  open: boolean
  onClose: () => void
  onImportComplete?: (configId: string, ingredientIds: string[]) => void
}

type ImportStep = 'select' | 'validate' | 'analyze' | 'review' | 'import' | 'complete'

export const ImportModalEnhanced: React.FC<ImportModalEnhancedProps> = ({ 
  open, 
  onClose,
  onImportComplete 
}) => {
  // State management
  const [activeStep, setActiveStep] = useState<ImportStep>('select')
  const [file, setFile] = useState<File | null>(null)
  const [populationType, setPopulationType] = useState<PopulationType | ''>('')
  const [healthSystem, setHealthSystem] = useState<string>('')
  const [configName, setConfigName] = useState<string>('')
  const [parsedData, setParsedData] = useState<TPNConfiguration | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRef, setSelectedRef] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Extraction and analysis state
  const [extractedIngredients, setExtractedIngredients] = useState<ExtractedIngredient[]>([])
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [importDecisions, setImportDecisions] = useState<Map<string, ImportDecision>>(new Map())
  const [importProgress, setImportProgress] = useState<number>(0)
  const [importResult, setImportResult] = useState<any>(null)
  
  // UI state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    unchanged: false,
    variants: true,
    near: false,
    unique: true
  })
  
  const availableConfigs = getAvailableConfigs()

  const steps: { key: ImportStep; label: string }[] = [
    { key: 'select', label: 'Select Configuration' },
    { key: 'validate', label: 'Validate Data' },
    { key: 'analyze', label: 'Analyze Ingredients' },
    { key: 'review', label: 'Review & Decide' },
    { key: 'import', label: 'Import to Firebase' },
    { key: 'complete', label: 'Complete' }
  ]

  const getStepIndex = (step: ImportStep) => steps.findIndex(s => s.key === step)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setSelectedRef('')
    setIsLoading(true)
    setValidation(null)

    // Detect population type from filename
    const detectedType = detectPopulationTypeFromFilename(selectedFile.name)
    if (detectedType && !populationType) {
      setPopulationType(detectedType)
    }

    // Extract health system from filename if possible
    const filename = selectedFile.name.toLowerCase()
    if (filename.includes('choc')) setHealthSystem('CHOC')
    else if (filename.includes('chla')) setHealthSystem('CHLA')
    
    // Set config name from filename
    setConfigName(selectedFile.name.replace(/\.[^/.]+$/, ''))

    try {
      const text = await selectedFile.text()
      const data = JSON.parse(text)
      const result = validateImport(data)
      setValidation(result)

      if (result.valid && result.dataType === 'tpn-full') {
        const tpnConfig = data as TPNConfiguration
        if (!tpnConfig.populationType && populationType) {
          tpnConfig.populationType = populationType
        }
        setParsedData(tpnConfig)
        setActiveStep('validate')
      }
    } catch (error) {
      setValidation({
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to parse JSON file'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReferenceLoad = async (configKey: string) => {
    if (!configKey) return
    
    setSelectedRef(configKey)
    setFile(null)
    setIsLoading(true)
    setValidation(null)
    
    const [population, ...configParts] = configKey.split('/')
    const configNameFromRef = configParts.join('/')
    
    // Set population type from config
    const popMap: Record<string, PopulationType> = {
      'neo': 'NEO',
      'child': 'CHILD',
      'adolescent': 'ADOLESCENT',
      'adult': 'ADULT'
    }
    
    if (popMap[population]) {
      setPopulationType(popMap[population])
    }
    
    // Extract health system from config name
    if (configNameFromRef.includes('choc')) setHealthSystem('CHOC')
    else if (configNameFromRef.includes('chla')) setHealthSystem('CHLA')
    else if (configNameFromRef.includes('uhs')) setHealthSystem('UHS')
    else setHealthSystem('OTHER')
    
    setConfigName(configNameFromRef)
    
    try {
      const data = await loadConfig(population as any, configNameFromRef as any)
      const result = validateImport(data)
      setValidation(result)
      
      if (result.valid && result.dataType === 'tpn-full') {
        const tpnConfig = data as TPNConfiguration
        if (!tpnConfig.populationType && popMap[population]) {
          tpnConfig.populationType = popMap[population]
        }
        setParsedData(tpnConfig)
        setActiveStep('validate')
      }
    } catch (error) {
      setValidation({
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to load reference config'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!parsedData || !populationType || !healthSystem) return
    
    setIsLoading(true)
    setActiveStep('analyze')
    
    try {
      // Extract ingredients from config
      const extractionResult = await ingredientExtractionService.extractFromConfig(
        parsedData,
        {
          healthSystem,
          populationType,
          checkExisting: true
        }
      )
      
      setExtractedIngredients(extractionResult.ingredients)
      
      // Analyze for duplicates and similarities
      const analysis = await importAnalysisService.analyzeImport(
        extractionResult.ingredients,
        {
          nearMatchThreshold: 70,
          checkContent: true,
          checkReferenceRanges: true
        }
      )
      
      setAnalysisResult(analysis)
      
      // Set default decisions based on recommendations
      const defaultDecisions = new Map<string, ImportDecision>()
      analysis.matches.forEach((match: ImportMatch) => {
        defaultDecisions.set(match.id, {
          matchId: match.id,
          action: match.recommendation === 'use-existing' ? 'use-existing' :
                  match.recommendation === 'create-new' ? 'create-new' :
                  match.recommendation === 'merge' ? 'merge' : 'skip',
          ingredientId: match.existing?.id
        })
      })
      setImportDecisions(defaultDecisions)
      
      setActiveStep('review')
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!parsedData || !analysisResult) return
    
    setIsLoading(true)
    setActiveStep('import')
    setImportProgress(0)
    
    try {
      const createdIngredientIds: string[] = []
      const usedIngredientIds: string[] = []
      let processed = 0
      const total = analysisResult.matches.length
      
      // Process each ingredient based on decisions
      for (const match of analysisResult.matches) {
        const decision = importDecisions.get(match.id)
        if (!decision) continue
        
        switch (decision.action) {
          case 'create-new':
            // Create new ingredient in Firestore with keyname as ID
            const createResult = await ingredientService.createWithKeyname(match.incoming.domain)
            if (createResult.data) {
              createdIngredientIds.push(createResult.data.id)
            }
            break
            
          case 'use-existing':
            // Use existing ingredient ID
            if (decision.ingredientId) {
              usedIngredientIds.push(decision.ingredientId)
            }
            break
            
          case 'merge':
            // Merge with existing (for now, just use existing)
            if (decision.ingredientId) {
              usedIngredientIds.push(decision.ingredientId)
            }
            break
            
          case 'skip':
            // Do nothing
            break
        }
        
        processed++
        setImportProgress((processed / total) * 100)
      }
      
      // Create config manifest
      const allIngredientIds = [...createdIngredientIds, ...usedIngredientIds]
      
      // Determine domain and subdomain from config name or file path
      let domain = 'main'
      let subdomain = 'build'
      
      // Check if it's a UHS config with specific domain (west, east, etc.)
      const configNameLower = configName.toLowerCase()
      if (healthSystem.toLowerCase() === 'uhs') {
        if (configNameLower.includes('west')) {
          domain = 'west'
        } else if (configNameLower.includes('east')) {
          domain = 'east'
        }
        // Check for subdomain (cert, prod, etc.)
        if (configNameLower.includes('cert')) {
          subdomain = 'cert'
        } else if (configNameLower.includes('prod')) {
          subdomain = 'prod'
        }
      }
      
      const configResult = await configManifestService.createManifest(
        {
          name: configName,
          healthSystem,
          populationType,
          ingredientIds: allIngredientIds,
          ingredientKeynames: extractedIngredients.map(e => e.original.KEYNAME),
          settings: {
            flexEnabled: parsedData.FLEX && parsedData.FLEX.length > 0,
            flexConfigs: parsedData.FLEX?.map(f => ({
              name: f.NAME,
              value: f.VALUE,
              comment: f.CONFIG_COMMENT
            }))
          },
          source: {
            path: file?.name || selectedRef,
            importedAt: new Date().toISOString(),
            originalFormat: 'tpn-full'
          },
          metadata: {
            version: parsedData.version,
            ingredientCount: allIngredientIds.length
          }
        },
        JSON.stringify(parsedData),
        domain,
        subdomain
      )
      
      setImportResult({
        configId: configResult.data?.id,
        ingredientIds: allIngredientIds,
        created: createdIngredientIds.length,
        reused: usedIngredientIds.length,
        skipped: analysisResult.matches.length - allIngredientIds.length
      })
      
      setActiveStep('complete')
      
      // Notify parent
      if (onImportComplete && configResult.data) {
        onImportComplete(configResult.data.id, allIngredientIds)
      }
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecisionChange = (matchId: string, action: ImportDecision['action']) => {
    const match = analysisResult.matches.find((m: ImportMatch) => m.id === matchId)
    if (!match) return
    
    setImportDecisions(prev => new Map(prev).set(matchId, {
      matchId,
      action,
      ingredientId: match.existing?.id
    }))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleReset = () => {
    setActiveStep('select')
    setFile(null)
    setPopulationType('')
    setHealthSystem('')
    setConfigName('')
    setParsedData(null)
    setValidation(null)
    setSelectedRef('')
    setExtractedIngredients([])
    setAnalysisResult(null)
    setImportDecisions(new Map())
    setImportProgress(0)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Component for rendering match items - moved to avoid hooks in map
  const MatchItem: React.FC<{ match: ImportMatch }> = ({ match }) => {
    const decision = importDecisions.get(match.id)
    const [showDiff, setShowDiff] = React.useState(false)
    const actionIcons = {
      'use-existing': <CheckCircle color="success" />,
      'create-new': <Add color="primary" />,
      'merge': <Merge color="warning" />,
      'skip': <Skip color="disabled" />
    }
    
    // Check if same keyname and whether it requires a variant
    const hasSameKeyname = match.existing && 
      match.incoming.original.KEYNAME === match.existing.keyname
    const requiresVariant = match.requiresVariant || false
    
    return (
      <Box key={match.id}>
        <ListItem divider>
          <ListItemIcon>
            {actionIcons[decision?.action || 'skip']}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">
                  {match.incoming.original.DISPLAY}
                </Typography>
                <Chip 
                  label={match.incoming.original.KEYNAME} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip
                  label={(() => {
                    const categoryLabels: Record<string, string> = {
                      'macro': 'Macronutrient',
                      'micro': 'Micronutrient',
                      'additive': 'Additive',
                      'salt': 'Salt',
                      'diluent': 'Diluent',
                      'other': 'Other'
                    }
                    const category = match.incoming.domain.category || 'other'
                    return categoryLabels[category] || 'Other'
                  })()}
                  size="small"
                  color="default"
                  variant="filled"
                />
                {match.similarity > 0 && (
                  <Chip 
                    label={
                      hasSameKeyname 
                        ? (requiresVariant ? 'Same Ingredient - Has Differences' : 'Same Ingredient') 
                        : `${match.similarity}% match`
                    }
                    size="small"
                    color={hasSameKeyname ? (requiresVariant ? 'warning' : 'success') : match.similarity === 100 ? 'success' : 'warning'}
                  />
                )}
                {match.differences && match.differences.length > 0 && (
                  <IconButton 
                    size="small" 
                    onClick={() => setShowDiff(!showDiff)}
                  >
                    {showDiff ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </Box>
            }
            secondary={
              match.existing ? 
                hasSameKeyname ? 
                  (requiresVariant 
                    ? `Same ingredient with different content - population variant needed`
                    : `Same ingredient - can reuse existing for ${match.existing.populationType || 'all'} populations`
                  ) :
                  `Similar to: ${match.existing.displayName}` :
                'New ingredient'
            }
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={
              hasSameKeyname 
                ? (requiresVariant ? "Use existing (ignore differences)" : "Use existing ingredient") 
                : "Use existing"
            }>
              <IconButton
                size="small"
                color={decision?.action === 'use-existing' ? 'success' : 'default'}
                onClick={() => handleDecisionChange(match.id, 'use-existing')}
                disabled={!match.existing}
              >
                <CheckCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title={
              hasSameKeyname 
                ? (requiresVariant ? "Create population variant" : "Create new (not recommended - same ingredient exists)") 
                : "Create new"
            }>
              <IconButton
                size="small"
                color={decision?.action === 'create-new' ? 'primary' : 'default'}
                onClick={() => handleDecisionChange(match.id, 'create-new')}
                disabled={hasSameKeyname && !requiresVariant} // Disable if same ingredient with no differences
              >
                <Add />
              </IconButton>
            </Tooltip>
            <Tooltip title="Merge differences">
              <IconButton
                size="small"
                color={decision?.action === 'merge' ? 'warning' : 'default'}
                onClick={() => handleDecisionChange(match.id, 'merge')}
                disabled={!match.existing}
              >
                <Merge />
              </IconButton>
            </Tooltip>
            <Tooltip title="Skip">
              <IconButton
                size="small"
                color={decision?.action === 'skip' ? 'error' : 'default'}
                onClick={() => handleDecisionChange(match.id, 'skip')}
              >
                <Skip />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItem>
        <Collapse in={showDiff && match.differences && match.differences.length > 0}>
          <Box sx={{ pl: 8, pr: 2, py: 1, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>Differences:</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Existing</TableCell>
                  <TableCell>Incoming</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {match.differences?.map((diff, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{diff.field}</TableCell>
                    <TableCell>{diff.existingValue}</TableCell>
                    <TableCell>{diff.incomingValue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Import TPN Configuration with Ingredient Extraction
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={getStepIndex(activeStep)} orientation="vertical">
          {/* Step 1: Select Configuration */}
          <Step>
            <StepLabel>Select Configuration</StepLabel>
            <StepContent>
              <Stack spacing={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Reference Configs</InputLabel>
                  <Select
                    value={selectedRef}
                    onChange={(e) => handleReferenceLoad(e.target.value)}
                    label="Reference Configs"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableConfigs.map((config) => (
                      <MenuItem key={config.key} value={config.key}>
                        {config.population.toUpperCase()} - {config.healthSystem.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary" align="center">
                  — OR —
                </Typography>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    fullWidth
                  >
                    {file ? file.name : 'Upload Configuration File'}
                  </Button>
                </label>

                <FormControl fullWidth>
                  <InputLabel>Population Type</InputLabel>
                  <Select
                    value={populationType}
                    onChange={(e) => setPopulationType(e.target.value as PopulationType)}
                    label="Population Type"
                  >
                    <MenuItem value="NEO">Neonatal (NEO)</MenuItem>
                    <MenuItem value="CHILD">Child</MenuItem>
                    <MenuItem value="ADOLESCENT">Adolescent</MenuItem>
                    <MenuItem value="ADULT">Adult</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Health System</InputLabel>
                  <Select
                    value={healthSystem}
                    onChange={(e) => setHealthSystem(e.target.value)}
                    label="Health System"
                  >
                    <MenuItem value="CHOC">CHOC</MenuItem>
                    <MenuItem value="CHLA">CHLA</MenuItem>
                    <MenuItem value="UHS">UHS</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 2: Validate */}
          <Step>
            <StepLabel>Validate Data</StepLabel>
            <StepContent>
              {validation && (
                <>
                  {validation.valid ? (
                    <Alert severity="success" icon={<Check />}>
                      <Typography variant="subtitle2">
                        Valid TPN Configuration
                      </Typography>
                      {parsedData && (
                        <Typography variant="body2">
                          {parsedData.INGREDIENT.length} ingredients found
                        </Typography>
                      )}
                    </Alert>
                  ) : (
                    <Alert severity="error">
                      <Typography variant="subtitle2">Validation Failed</Typography>
                      {validation.error && (
                        <Typography variant="body2">{validation.error}</Typography>
                      )}
                    </Alert>
                  )}
                  
                  {validation.valid && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleAnalyze}
                        disabled={!populationType || !healthSystem}
                      >
                        Analyze Ingredients
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </StepContent>
          </Step>

          {/* Step 3: Analyze */}
          <Step>
            <StepLabel>Analyze Ingredients</StepLabel>
            <StepContent>
              {isLoading && activeStep === 'analyze' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography>Analyzing ingredients for duplicates...</Typography>
                </Box>
              )}
              
              {analysisResult && (
                <Alert severity="info">
                  <Typography variant="subtitle2">Analysis Complete</Typography>
                  <Typography variant="body2">
                    • {analysisResult.summary.exactMatchCount} exact matches (will reuse)
                  </Typography>
                  <Typography variant="body2">
                    • {analysisResult.summary.nearMatchCount} similar ingredients (review needed)
                  </Typography>
                  <Typography variant="body2">
                    • {analysisResult.summary.uniqueCount} new ingredients
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Estimated space saved: {analysisResult.summary.estimatedDataSaved}
                  </Typography>
                </Alert>
              )}
            </StepContent>
          </Step>

          {/* Step 4: Review */}
          <Step>
            <StepLabel>Review & Decide</StepLabel>
            <StepContent>
              {analysisResult && (
                <Stack spacing={2}>
                  {/* Unchanged Ingredients - Exact matches without variants */}
                  {(() => {
                    const unchangedMatches = analysisResult.exactMatches.filter((m: ImportMatch) => !m.requiresVariant)
                    return unchangedMatches.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box 
                          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => toggleSection('unchanged')}
                        >
                          <Badge badgeContent={unchangedMatches.length} color="success">
                            <Typography variant="h6">Unchanged Ingredients (Will Reuse)</Typography>
                          </Badge>
                          <IconButton size="small" sx={{ ml: 'auto' }}>
                            {expandedSections.unchanged ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                          These ingredients exactly match existing ones and will be reused without changes
                        </Typography>
                        <Collapse in={expandedSections.unchanged}>
                          <List dense>
                            {unchangedMatches
                              .sort((a: ImportMatch, b: ImportMatch) => {
                                // First sort by category
                                const catA = a.incoming.domain.category || 'other'
                                const catB = b.incoming.domain.category || 'other'
                                if (catA !== catB) return catA.localeCompare(catB)
                                // Then sort by keyname
                                const keynameA = a.incoming.domain.keyname || a.incoming.original?.KEYNAME || ''
                                const keynameB = b.incoming.domain.keyname || b.incoming.original?.KEYNAME || ''
                                return keynameA.localeCompare(keynameB)
                              })
                              .map((match: ImportMatch) => <MatchItem key={match.id} match={match} />)}
                          </List>
                        </Collapse>
                      </Paper>
                    )
                  })()}

                  {/* Variant Ingredients - Same keyname but different content */}
                  {(() => {
                    const variantMatches = analysisResult.exactMatches.filter((m: ImportMatch) => m.requiresVariant)
                    return variantMatches.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box 
                          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => toggleSection('variants')}
                        >
                          <Badge badgeContent={variantMatches.length} color="warning">
                            <Typography variant="h6">Variant Ingredients (Population-Specific)</Typography>
                          </Badge>
                          <IconButton size="small" sx={{ ml: 'auto' }}>
                            {expandedSections.variants ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                          These share keynames with existing ingredients but have different content - will create population variants
                        </Typography>
                        <Collapse in={expandedSections.variants}>
                          <List dense>
                            {variantMatches
                              .sort((a: ImportMatch, b: ImportMatch) => {
                                // First sort by category
                                const catA = a.incoming.domain.category || 'other'
                                const catB = b.incoming.domain.category || 'other'
                                if (catA !== catB) return catA.localeCompare(catB)
                                // Then sort by keyname
                                const keynameA = a.incoming.domain.keyname || a.incoming.original?.KEYNAME || ''
                                const keynameB = b.incoming.domain.keyname || b.incoming.original?.KEYNAME || ''
                                return keynameA.localeCompare(keynameB)
                              })
                              .map((match: ImportMatch) => <MatchItem key={match.id} match={match} />)}
                          </List>
                        </Collapse>
                      </Paper>
                    )
                  })()}

                  {/* Near Matches Section */}
                  {analysisResult.nearMatches.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => toggleSection('near')}
                      >
                        <Badge badgeContent={analysisResult.nearMatches.length} color="warning">
                          <Typography variant="h6">Similar Ingredients</Typography>
                        </Badge>
                        <IconButton size="small" sx={{ ml: 'auto' }}>
                          {expandedSections.near ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedSections.near}>
                        <List dense>
                          {analysisResult.nearMatches
                            .sort((a: ImportMatch, b: ImportMatch) => {
                              // First sort by category
                              const catA = a.incoming.domain.category || 'other'
                              const catB = b.incoming.domain.category || 'other'
                              if (catA !== catB) return catA.localeCompare(catB)
                              // Then sort by keyname
                              const keynameA = a.incoming.domain.keyname || a.incoming.original?.KEYNAME || ''
                              const keynameB = b.incoming.domain.keyname || b.incoming.original?.KEYNAME || ''
                              return keynameA.localeCompare(keynameB)
                            })
                            .map((match: ImportMatch) => <MatchItem key={match.id} match={match} />)}
                        </List>
                      </Collapse>
                    </Paper>
                  )}

                  {/* Unique Ingredients Section */}
                  {analysisResult.uniqueIngredients.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => toggleSection('unique')}
                      >
                        <Badge badgeContent={analysisResult.uniqueIngredients.length} color="primary">
                          <Typography variant="h6">New Ingredients</Typography>
                        </Badge>
                        <IconButton size="small" sx={{ ml: 'auto' }}>
                          {expandedSections.unique ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedSections.unique}>
                        <List dense>
                          {analysisResult.uniqueIngredients
                            .sort((a: ImportMatch, b: ImportMatch) => {
                              // First sort by category
                              const catA = a.incoming.domain.category || 'other'
                              const catB = b.incoming.domain.category || 'other'
                              if (catA !== catB) return catA.localeCompare(catB)
                              // Then sort by keyname
                              const keynameA = a.incoming.domain.keyname || a.incoming.original?.KEYNAME || ''
                              const keynameB = b.incoming.domain.keyname || b.incoming.original?.KEYNAME || ''
                              return keynameA.localeCompare(keynameB)
                            })
                            .map((match: ImportMatch) => <MatchItem key={match.id} match={match} />)}
                        </List>
                      </Collapse>
                    </Paper>
                  )}

                  <Button
                    variant="contained"
                    onClick={handleImport}
                    startIcon={<FileUpload />}
                  >
                    Import to Firebase
                  </Button>
                </Stack>
              )}
            </StepContent>
          </Step>

          {/* Step 5: Import */}
          <Step>
            <StepLabel>Import to Firebase</StepLabel>
            <StepContent>
              {isLoading && activeStep === 'import' && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Importing ingredients...
                  </Typography>
                  <LinearProgress variant="determinate" value={importProgress} />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(importProgress)}% complete
                  </Typography>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 6: Complete */}
          <Step>
            <StepLabel>Complete</StepLabel>
            <StepContent>
              {importResult && (
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="h6">Import Successful!</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • Configuration saved with ID: {importResult.configId}
                  </Typography>
                  <Typography variant="body2">
                    • {importResult.created} new ingredients created
                  </Typography>
                  <Typography variant="body2">
                    • {importResult.reused} existing ingredients reused
                  </Typography>
                  {importResult.skipped > 0 && (
                    <Typography variant="body2">
                      • {importResult.skipped} ingredients skipped
                    </Typography>
                  )}
                </Alert>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {activeStep === 'complete' ? 'Close' : 'Cancel'}
        </Button>
        {activeStep === 'complete' && (
          <Button onClick={handleReset} variant="outlined">
            Import Another
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}