import React from 'react'
import {
  Box,
  Alert,
  AlertTitle,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon
} from '@mui/icons-material'

interface TPNCalculatorValidationProps {
  warnings: string[]
}

interface ValidationItem {
  level: 'error' | 'warning' | 'info'
  message: string
  details?: string
  suggestions?: string[]
}

export const TPNCalculatorValidation: React.FC<TPNCalculatorValidationProps> = ({ warnings }) => {
  // Parse warnings into structured validation items
  const parseValidationItems = (): ValidationItem[] => {
    return warnings.map(warning => {
      const item: ValidationItem = {
        level: 'warning',
        message: warning,
        details: undefined,
        suggestions: []
      }

      // Check if it's a critical warning
      if (warning.toLowerCase().includes('critical') || warning.toLowerCase().includes('danger')) {
        item.level = 'error'
      }

      // Add specific suggestions based on warning type
      if (warning.toLowerCase().includes('sodium')) {
        item.details = 'Sodium levels outside the normal range can affect fluid balance and neurological function.'
        item.suggestions = [
          'Review patient\'s fluid status',
          'Check for signs of dehydration or fluid overload',
          'Consider gradual adjustment over 24-48 hours'
        ]
      } else if (warning.toLowerCase().includes('protein')) {
        item.details = 'Protein requirements vary based on metabolic stress and growth needs.'
        item.suggestions = [
          'Assess patient\'s nitrogen balance',
          'Consider underlying conditions (sepsis, burns, etc.)',
          'Monitor BUN and albumin levels'
        ]
      } else if (warning.toLowerCase().includes('calories')) {
        item.details = 'Energy requirements depend on age, activity level, and metabolic state.'
        item.suggestions = [
          'Verify weight and height measurements',
          'Consider stress factors',
          'Monitor weight gain/loss trends'
        ]
      } else if (warning.toLowerCase().includes('potassium')) {
        item.details = 'Potassium imbalances can cause cardiac arrhythmias.'
        item.suggestions = [
          'Check recent serum potassium levels',
          'Review cardiac monitoring if available',
          'Consider renal function'
        ]
      }

      return item
    })
  }

  const validationItems = parseValidationItems()
  const errorCount = validationItems.filter(item => item.level === 'error').length
  const warningCount = validationItems.filter(item => item.level === 'warning').length

  const getIcon = (level: string) => {
    switch (level) {
      case 'error': return <ErrorIcon color="error" />
      case 'warning': return <WarningIcon color="warning" />
      case 'info': return <InfoIcon color="info" />
      default: return <InfoIcon />
    }
  }

  const getSeverity = (level: string): 'error' | 'warning' | 'info' | 'success' => {
    switch (level) {
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'info': return 'info'
      default: return 'info'
    }
  }

  return (
    <Box>
      {/* Summary Alert */}
      <Alert 
        severity={errorCount > 0 ? 'error' : 'warning'}
        sx={{ mb: 3 }}
      >
        <AlertTitle>Validation Results</AlertTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">
            Found {validationItems.length} issue{validationItems.length !== 1 ? 's' : ''} that require attention
          </Typography>
          <Stack direction="row" spacing={1}>
            {errorCount > 0 && (
              <Chip 
                label={`${errorCount} Error${errorCount !== 1 ? 's' : ''}`}
                size="small"
                color="error"
              />
            )}
            {warningCount > 0 && (
              <Chip 
                label={`${warningCount} Warning${warningCount !== 1 ? 's' : ''}`}
                size="small"
                color="warning"
              />
            )}
          </Stack>
        </Stack>
      </Alert>

      {/* Validation Items */}
      <Stack spacing={2}>
        {validationItems.map((item, index) => (
          <Accordion key={index} defaultExpanded={item.level === 'error'}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                {getIcon(item.level)}
                <Typography sx={{ flexGrow: 1 }}>
                  {item.message}
                </Typography>
                <Chip 
                  label={item.level.toUpperCase()}
                  size="small"
                  color={getSeverity(item.level)}
                  variant="outlined"
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {item.details && (
                  <Alert severity="info" icon={<InfoIcon />}>
                    <Typography variant="body2">
                      {item.details}
                    </Typography>
                  </Alert>
                )}
                
                {item.suggestions && item.suggestions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommended Actions:
                    </Typography>
                    <List dense>
                      {item.suggestions.map((suggestion, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={suggestion}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {/* Clinical Guidelines Reference */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }} elevation={0}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <HelpIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" color="primary">
            Clinical Guidelines
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          These validation warnings are based on standard TPN guidelines for the selected population type.
          Always consider individual patient factors and consult current clinical protocols.
        </Typography>
        <Button
          size="small"
          sx={{ mt: 1 }}
          onClick={() => console.log('Open guidelines')}
        >
          View Full Guidelines
        </Button>
      </Paper>
    </Box>
  )
}