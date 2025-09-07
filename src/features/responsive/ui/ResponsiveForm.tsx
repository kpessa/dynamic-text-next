import React from 'react'
import {
  Grid,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  FormHelperText,
  InputAdornment,
  IconButton
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon
} from '@mui/icons-material'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'tel' | 'date' | 'time'
  value: any
  required?: boolean
  error?: string
  helperText?: string
  options?: { value: string; label: string }[]
  fullWidth?: boolean
  multiline?: boolean
  rows?: number
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  disabled?: boolean
  placeholder?: string
  // Mobile-specific props
  mobileFullWidth?: boolean
  mobileOrder?: number
}

interface ResponsiveFormProps {
  fields: FormField[]
  onSubmit: (values: Record<string, any>) => void
  onChange: (name: string, value: any) => void
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  loading?: boolean
  columns?: { xs: number; sm: number; md: number; lg: number }
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  fields,
  onSubmit,
  onChange,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  loading = false,
  columns = { xs: 12, sm: 6, md: 4, lg: 3 }
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showPassword, setShowPassword] = React.useState<Record<string, boolean>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const values = fields.reduce((acc, field) => {
      acc[field.name] = field.value
      return acc
    }, {} as Record<string, any>)
    onSubmit(values)
  }

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({ ...prev, [fieldName]: !prev[fieldName] }))
  }

  // Sort fields by mobile order if on mobile
  const sortedFields = isMobile
    ? [...fields].sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0))
    : fields

  const renderField = (field: FormField) => {
    const isFullWidth = isMobile ? (field.mobileFullWidth ?? true) : (field.fullWidth ?? false)
    const gridColumns = isFullWidth ? 12 : columns

    // Handle password fields
    if (field.type === 'password') {
      return (
        <Grid item xs={gridColumns.xs} sm={gridColumns.sm} md={gridColumns.md} lg={gridColumns.lg} key={field.name}>
          <TextField
            fullWidth
            name={field.name}
            label={field.label}
            type={showPassword[field.name] ? 'text' : 'password'}
            value={field.value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            error={!!field.error}
            helperText={field.error || field.helperText}
            disabled={field.disabled}
            placeholder={field.placeholder}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility(field.name)}
                    edge="end"
                    size="small"
                  >
                    {showPassword[field.name] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            // Mobile optimizations
            inputProps={{
              autoComplete: 'current-password',
              autoCapitalize: 'none',
              autoCorrect: 'off'
            }}
          />
        </Grid>
      )
    }

    // Handle select fields
    if (field.type === 'select' && field.options) {
      return (
        <Grid item xs={gridColumns.xs} sm={gridColumns.sm} md={gridColumns.md} lg={gridColumns.lg} key={field.name}>
          <FormControl fullWidth error={!!field.error} disabled={field.disabled}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={field.value}
              label={field.label}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
            >
              {field.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(field.error || field.helperText) && (
              <FormHelperText>{field.error || field.helperText}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      )
    }

    // Handle other field types
    return (
      <Grid item xs={gridColumns.xs} sm={gridColumns.sm} md={gridColumns.md} lg={gridColumns.lg} key={field.name}>
        <TextField
          fullWidth
          name={field.name}
          label={field.label}
          type={field.type}
          value={field.value}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
          error={!!field.error}
          helperText={field.error || field.helperText}
          disabled={field.disabled}
          placeholder={field.placeholder}
          multiline={field.multiline}
          rows={field.rows}
          InputProps={{
            startAdornment: field.startAdornment,
            endAdornment: field.endAdornment
          }}
          // Mobile-specific input props
          inputProps={{
            ...(field.type === 'email' && {
              autoComplete: 'email',
              autoCapitalize: 'none',
              autoCorrect: 'off'
            }),
            ...(field.type === 'tel' && {
              autoComplete: 'tel',
              pattern: '[0-9]*'
            }),
            ...(field.type === 'number' && {
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }),
            // Ensure minimum touch target size (44px)
            style: isMobile ? { minHeight: 44, fontSize: 16 } : {}
          }}
          // Prevent zoom on iOS
          sx={isMobile ? {
            '& input': {
              fontSize: 16 // Prevents zoom on iOS when focused
            }
          } : {}}
        />
      </Grid>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={isMobile ? 2 : 3}>
        {sortedFields.map(renderField)}
      </Grid>

      {/* Form Actions */}
      <Box sx={{ mt: 3 }}>
        <Stack
          direction={isMobile ? 'column-reverse' : 'row'}
          spacing={2}
          justifyContent="flex-end"
        >
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              fullWidth={isMobile}
              size={isMobile ? 'large' : 'medium'}
              sx={isMobile ? { minHeight: 48 } : {}}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
            sx={isMobile ? { minHeight: 48 } : {}}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

// Mobile-optimized stepper form
interface StepperFormProps {
  steps: {
    label: string
    fields: FormField[]
    optional?: boolean
  }[]
  onSubmit: (values: Record<string, any>) => void
  onChange: (name: string, value: any) => void
}

export const MobileStepperForm: React.FC<StepperFormProps> = ({
  steps,
  onSubmit,
  onChange
}) => {
  const [activeStep, setActiveStep] = React.useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleStepSubmit = () => {
    if (activeStep === steps.length - 1) {
      const values = steps.reduce((acc, step) => {
        step.fields.forEach(field => {
          acc[field.name] = field.value
        })
        return acc
      }, {} as Record<string, any>)
      onSubmit(values)
    } else {
      handleNext()
    }
  }

  return (
    <Box>
      {/* Step indicator */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
          <Typography variant="h6">
            {steps[activeStep].label}
          </Typography>
        </Stack>
        <Box sx={{ width: '100%', bgcolor: 'action.hover', height: 4, borderRadius: 2, mt: 1 }}>
          <Box
            sx={{
              width: `${((activeStep + 1) / steps.length) * 100}%`,
              bgcolor: 'primary.main',
              height: 4,
              borderRadius: 2,
              transition: 'width 0.3s'
            }}
          />
        </Box>
      </Box>

      {/* Current step fields */}
      <ResponsiveForm
        fields={steps[activeStep].fields}
        onChange={onChange}
        onSubmit={handleStepSubmit}
        submitLabel={activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        cancelLabel="Back"
        onCancel={activeStep > 0 ? handleBack : undefined}
      />
    </Box>
  )
}