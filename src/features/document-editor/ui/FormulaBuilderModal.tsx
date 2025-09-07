import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Paper,
  Tabs,
  Tab,
  IconButton
} from '@mui/material'
import {
  Functions as FunctionIcon,
  Code as VariableIcon,
  Calculate as OperatorIcon,
  Close as CloseIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material'

interface FormulaBuilderModalProps {
  open: boolean
  onClose: () => void
  onInsert: (formula: string) => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export const FormulaBuilderModal: React.FC<FormulaBuilderModalProps> = ({
  open,
  onClose,
  onInsert
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [formulaName, setFormulaName] = useState('')
  const [formulaExpression, setFormulaExpression] = useState('')
  const [selectedFunction, setSelectedFunction] = useState('')
  const [variables, setVariables] = useState<string[]>(['weight', 'height', 'age'])

  // Available functions
  const functions = [
    { name: 'sum', description: 'Sum of values', example: 'sum(a, b, c)' },
    { name: 'avg', description: 'Average of values', example: 'avg(a, b, c)' },
    { name: 'min', description: 'Minimum value', example: 'min(a, b, c)' },
    { name: 'max', description: 'Maximum value', example: 'max(a, b, c)' },
    { name: 'round', description: 'Round to decimal places', example: 'round(value, 2)' },
    { name: 'if', description: 'Conditional logic', example: 'if(condition, true_val, false_val)' }
  ]

  // Common formulas
  const commonFormulas = [
    { name: 'BMI', formula: 'weight / (height * height)', description: 'Body Mass Index' },
    { name: 'BSA', formula: 'sqrt((height * weight) / 3600)', description: 'Body Surface Area' },
    { name: 'Calcium Dose', formula: 'weight * 10', description: 'Standard calcium dosing' },
    { name: 'Protein Target', formula: 'weight * 1.5', description: 'Protein requirement' }
  ]

  // Available variables
  const availableVariables = [
    { name: 'weight', type: 'number', description: 'Patient weight (kg)' },
    { name: 'height', type: 'number', description: 'Patient height (cm)' },
    { name: 'age', type: 'number', description: 'Patient age (years)' },
    { name: 'gender', type: 'string', description: 'Patient gender' },
    { name: 'activityLevel', type: 'string', description: 'Activity level' }
  ]

  const handleFunctionSelect = (func: string) => {
    setFormulaExpression(prev => prev + func)
  }

  const handleVariableSelect = (variable: string) => {
    setFormulaExpression(prev => prev + variable)
  }

  const handleCommonFormulaSelect = (formula: any) => {
    setFormulaName(formula.name)
    setFormulaExpression(formula.formula)
  }

  const handleInsert = () => {
    const formula = formulaName ? `${formulaName}: ${formulaExpression}` : formulaExpression
    onInsert(formula)
    // Reset form
    setFormulaName('')
    setFormulaExpression('')
    setSelectedFunction('')
  }

  const handleOperatorClick = (operator: string) => {
    setFormulaExpression(prev => prev + ` ${operator} `)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Formula Builder</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Formula Input */}
        <Box mb={3}>
          <TextField
            fullWidth
            label="Formula Name"
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value)}
            placeholder="e.g., Calcium Dose"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Formula Expression"
            value={formulaExpression}
            onChange={(e) => setFormulaExpression(e.target.value)}
            placeholder="e.g., weight * 10"
            multiline
            rows={3}
            helperText="Build your formula using the tools below or type directly"
          />
        </Box>

        {/* Quick Actions */}
        <Box mb={2}>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => handleOperatorClick('+')}>+</Button>
            <Button size="small" onClick={() => handleOperatorClick('-')}>-</Button>
            <Button size="small" onClick={() => handleOperatorClick('*')}>×</Button>
            <Button size="small" onClick={() => handleOperatorClick('/')}>÷</Button>
            <Button size="small" onClick={() => handleOperatorClick('(')}>( )</Button>
          </Stack>
        </Box>

        {/* Tabs for different formula building options */}
        <Paper variant="outlined">
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Common Formulas" />
            <Tab label="Variables" />
            <Tab label="Functions" />
          </Tabs>

          <Box sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
            <TabPanel value={activeTab} index={0}>
              <List>
                {commonFormulas.map((formula) => (
                  <ListItemButton
                    key={formula.name}
                    onClick={() => handleCommonFormulaSelect(formula)}
                  >
                    <ListItemText
                      primary={formula.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" component="div">
                            {formula.description}
                          </Typography>
                          <Typography variant="caption" component="code" sx={{ fontFamily: 'monospace' }}>
                            {formula.formula}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <List>
                {availableVariables.map((variable) => (
                  <ListItemButton
                    key={variable.name}
                    onClick={() => handleVariableSelect(variable.name)}
                  >
                    <ListItemIcon>
                      <VariableIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={variable.name}
                      secondary={
                        <Box>
                          <Typography variant="caption">{variable.description}</Typography>
                          <Chip label={variable.type} size="small" sx={{ ml: 1 }} />
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <List>
                {functions.map((func) => (
                  <ListItemButton
                    key={func.name}
                    onClick={() => handleFunctionSelect(func.name + '()')}
                  >
                    <ListItemIcon>
                      <FunctionIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={func.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" component="div">
                            {func.description}
                          </Typography>
                          <Typography variant="caption" component="code" sx={{ fontFamily: 'monospace' }}>
                            {func.example}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            </TabPanel>
          </Box>
        </Paper>

        {/* Preview */}
        {formulaExpression && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Preview:</Typography>
            <Typography variant="body2" component="code" sx={{ fontFamily: 'monospace' }}>
              {formulaName && `${formulaName}: `}{formulaExpression}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleInsert}
          disabled={!formulaExpression}
        >
          Insert Formula
        </Button>
      </DialogActions>
    </Dialog>
  )
}