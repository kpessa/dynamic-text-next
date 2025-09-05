import React, { useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  InputLabel
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import {
  useForm,
  Controller,
  FieldValues,
  UseFormReturn,
  SubmitHandler
} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormProps, FieldConfig, FormSection } from './Form.types'

function renderField<T extends FieldValues>(
  fieldConfig: FieldConfig,
  form: UseFormReturn<T>,
  disabled?: boolean
) {
  const {
    name,
    label,
    type,
    placeholder,
    defaultValue,
    required,
    disabled: fieldDisabled,
    readOnly,
    helperText,
    options,
    multiple,
    rows,
    accept,
    autoComplete,
    autoFocus,
    component,
    transform,
    showWhen
  } = fieldConfig

  const values = form.watch()
  
  // Check conditional rendering
  if (showWhen && !showWhen(values)) {
    return null
  }

  // Custom component
  if (component) {
    return (
      <Controller
        name={name as any}
        control={form.control}
        defaultValue={defaultValue}
        render={({ field, fieldState, formState }) => 
          component({ field, fieldState, formState, fieldConfig })
        }
      />
    )
  }

  const isDisabled = disabled || fieldDisabled

  switch (type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
    case 'tel':
    case 'url':
    case 'date':
    case 'time':
    case 'datetime-local':
      return (
        <Controller
          name={name as any}
          control={form.control}
          defaultValue={defaultValue || ''}
          render={({ field, fieldState }) => {
            const fieldValue = transform?.input ? transform.input(field.value) : field.value
            return (
              <TextField
                {...field}
                value={fieldValue}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(transform?.output ? transform.output(value) : value)
                }}
                label={label}
                type={type}
                placeholder={placeholder}
                required={required}
                disabled={isDisabled}
                InputProps={{ readOnly }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message || helperText}
                fullWidth
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                variant="outlined"
              />
            )
          }}
        />
      )

    case 'textarea':
      return (
        <Controller
          name={name as any}
          control={form.control}
          defaultValue={defaultValue || ''}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label={label}
              placeholder={placeholder}
              required={required}
              disabled={isDisabled}
              InputProps={{ readOnly }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message || helperText}
              fullWidth
              multiline
              rows={rows || 4}
              variant="outlined"
            />
          )}
        />
      )

    case 'select':
      return (
        <Controller
          name={name as any}
          control={form.control}
          defaultValue={defaultValue || ''}
          render={({ field, fieldState }) => (
            <FormControl fullWidth error={!!fieldState.error}>
              <InputLabel>{label}</InputLabel>
              <Select
                {...field}
                label={label}
                required={required}
                disabled={isDisabled}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {options?.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {(fieldState.error?.message || helperText) && (
                <FormHelperText>
                  {fieldState.error?.message || helperText}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      )

    case 'multiselect':
      return (
        <Controller
          name={name as any}
          control={form.control}
          defaultValue={defaultValue || []}
          render={({ field, fieldState }) => (
            <FormControl fullWidth error={!!fieldState.error}>
              <InputLabel>{label}</InputLabel>
              <Select
                {...field}
                label={label}
                multiple
                required={required}
                disabled={isDisabled}
              >
                {options?.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {(fieldState.error?.message || helperText) && (
                <FormHelperText>
                  {fieldState.error?.message || helperText}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      )

    case 'checkbox':
      return (
        <Controller
          name={name as any}
          control={form.control}
          defaultValue={defaultValue || false}
          render={({ field, fieldState }) => (
            <FormControl error={!!fieldState.error}>
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    disabled={isDisabled}
                  />
                }
                label={label}
              />
              {(fieldState.error?.message || helperText) && (
                <FormHelperText>
                  {fieldState.error?.message || helperText}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      )

    case 'radio':
      return (
        <Controller
          name={name as any}
          control={form.control}
          defaultValue={defaultValue || ''}
          render={({ field, fieldState }) => (
            <FormControl error={!!fieldState.error}>
              <FormLabel>{label}</FormLabel>
              <RadioGroup {...field}>
                {options?.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                    disabled={isDisabled || option.disabled}
                  />
                ))}
              </RadioGroup>
              {(fieldState.error?.message || helperText) && (
                <FormHelperText>
                  {fieldState.error?.message || helperText}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      )

    case 'switch':
      return (
        <Controller
          name={name as any}
          control={form.control}
          defaultValue={defaultValue || false}
          render={({ field, fieldState }) => (
            <FormControl error={!!fieldState.error}>
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    disabled={isDisabled}
                  />
                }
                label={label}
              />
              {(fieldState.error?.message || helperText) && (
                <FormHelperText>
                  {fieldState.error?.message || helperText}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      )

    case 'file':
      return (
        <Controller
          name={name as any}
          control={form.control}
          defaultValue={defaultValue || ''}
          render={({ field: { onChange, value, ...field }, fieldState }) => (
            <FormControl fullWidth error={!!fieldState.error}>
              <Button
                variant="outlined"
                component="label"
                disabled={isDisabled}
                fullWidth
              >
                {label || 'Choose File'}
                <input
                  {...field}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  hidden
                  onChange={(e) => {
                    const files = e.target.files
                    onChange(multiple ? files : files?.[0])
                  }}
                />
              </Button>
              {value && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {multiple 
                    ? `${value.length} file(s) selected`
                    : value.name || 'File selected'}
                </Typography>
              )}
              {(fieldState.error?.message || helperText) && (
                <FormHelperText>
                  {fieldState.error?.message || helperText}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      )

    default:
      return null
  }
}

export function Form<T extends FieldValues = FieldValues>({
  fields = [],
  sections = [],
  defaultValues,
  
  validationSchema,
  validationMode = 'onBlur',
  reValidateMode = 'onChange',
  
  onSubmit,
  onError,
  
  form: externalForm,
  
  submitLabel = 'Submit',
  resetLabel = 'Reset',
  cancelLabel = 'Cancel',
  onCancel,
  
  showReset = true,
  showCancel = false,
  submitOnEnter = true,
  
  loading = false,
  disabled = false,
  
  layout = 'vertical',
  spacing = 2,
  columns = 1,
  
  sx,
  formSx,
  buttonsSx,
  
  successMessage,
  errorMessage,
  showValidationSummary = false,
  
  autoSave = false,
  autoSaveDelay = 1000,
  onAutoSave,
  
  customButtons,
  header,
  footer
}: FormProps<T>) {
  // Use external form or create internal one
  const internalForm = useForm<T>({
    defaultValues,
    mode: validationMode,
    reValidateMode,
    resolver: validationSchema ? yupResolver(validationSchema) : undefined
  })
  
  const form = externalForm || internalForm
  
  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
    watch
  } = form

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onAutoSave || !isDirty) return

    const timeoutId = setTimeout(() => {
      onAutoSave(watch() as T)
    }, autoSaveDelay)

    return () => clearTimeout(timeoutId)
  }, [autoSave, autoSaveDelay, isDirty, onAutoSave, watch])

  // Handle form submission
  const handleFormSubmit: SubmitHandler<T> = async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      if (onError) {
        onError(error)
      }
    }
  }

  // Handle key press for submit on enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(handleFormSubmit)()
    }
  }

  // Render fields in grid
  const renderFields = (fieldsToRender: FieldConfig[]) => {
    const columnSize = 12 / columns

    return (
      <Grid container spacing={spacing}>
        {fieldsToRender.map((field) => {
          const gridProps = field.gridProps || {}
          const defaultSize = field.type === 'checkbox' || field.type === 'switch' 
            ? 12 
            : columnSize

          return (
            <Grid
              key={field.name}
              size={{ 
                xs: gridProps.xs ?? 12,
                sm: gridProps.sm ?? defaultSize,
                md: gridProps.md ?? defaultSize,
                lg: gridProps.lg ?? defaultSize,
                xl: gridProps.xl ?? defaultSize
              }}
            >
              {renderField(field, form, disabled)}
            </Grid>
          )
        })}
      </Grid>
    )
  }

  // Render sections
  const renderSections = () => {
    return sections.map((section, index) => {
      if (section.collapsible) {
        return (
          <Accordion key={index} defaultExpanded={section.defaultExpanded}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{section.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {section.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {section.description}
                </Typography>
              )}
              {renderFields(section.fields)}
            </AccordionDetails>
          </Accordion>
        )
      }

      return (
        <Box key={index}>
          {section.title && (
            <Typography variant="h6" sx={{ mb: 1 }}>
              {section.title}
            </Typography>
          )}
          {section.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {section.description}
            </Typography>
          )}
          {renderFields(section.fields)}
        </Box>
      )
    })
  }

  return (
    <Box sx={sx}>
      {header}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      {showValidationSummary && Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Please correct the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error?.message || `Error in ${key}`}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        onKeyPress={handleKeyPress}
        sx={formSx}
      >
        <Stack spacing={spacing}>
          {sections.length > 0 ? renderSections() : renderFields(fields)}
          
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: layout === 'inline' ? 'flex-start' : 'flex-end',
              flexWrap: 'wrap',
              ...buttonsSx
            }}
          >
            {customButtons || (
              <>
                {showCancel && (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading || disabled}
                  >
                    {cancelLabel}
                  </Button>
                )}
                
                {showReset && (
                  <Button
                    variant="outlined"
                    onClick={() => reset()}
                    disabled={loading || disabled || !isDirty}
                  >
                    {resetLabel}
                  </Button>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || disabled || isSubmitting}
                  startIcon={loading && <CircularProgress size={16} />}
                >
                  {submitLabel}
                </Button>
              </>
            )}
          </Box>
        </Stack>
      </Box>
      
      {footer}
    </Box>
  )
}