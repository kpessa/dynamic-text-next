import React, { useState, useCallback } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  StepButton,
  Stack
} from '@mui/material'
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { StepperFormProps, StepperFormStep } from '../Form/Form.types'
import { Form } from '../Form'

export function StepperForm<T extends FieldValues = FieldValues>({
  steps,
  defaultValues,
  
  onSubmit,
  onError,
  
  onStepChange,
  defaultStep = 0,
  
  orientation = 'horizontal',
  alternativeLabel = false,
  nonLinear = false,
  
  showReviewStep = false,
  reviewStepLabel = 'Review & Submit',
  
  nextLabel = 'Next',
  backLabel = 'Back',
  skipLabel = 'Skip',
  finishLabel = 'Finish',
  resetLabel = 'Reset',
  
  loading = false,
  disabled = false,
  
  validateOnStepChange = true,
  
  spacing = 2,
  
  sx,
  stepperSx,
  contentSx,
  buttonsSx,
  
  customStepIcon,
  header,
  footer
}: StepperFormProps<T>) {
  const [activeStep, setActiveStep] = useState(defaultStep)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [stepData, setStepData] = useState<Partial<T>>(defaultValues || {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Add review step if enabled
  const allSteps = showReviewStep 
    ? [...steps, { label: reviewStepLabel, fields: [], sections: [] }]
    : steps

  const isLastStep = activeStep === allSteps.length - 1
  const isReviewStep = showReviewStep && activeStep === allSteps.length - 1
  const currentStep = allSteps[activeStep]

  // Create form instance
  const form = useForm<T>({
    defaultValues: stepData as any,
    mode: 'onBlur',
    resolver: currentStep.validationSchema && !isReviewStep
      ? yupResolver(currentStep.validationSchema)
      : undefined
  })

  // Handle step navigation
  const handleNext = useCallback(async () => {
    if (isReviewStep) {
      // Submit form
      setIsSubmitting(true)
      setError(null)
      try {
        await onSubmit(stepData as T)
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        if (onError) onError(err)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Validate current step if required
    if (validateOnStepChange && currentStep.fields) {
      const isValid = await form.trigger()
      if (!isValid) return
    }

    // Get current form data
    const currentData = form.getValues()
    const updatedData = { ...stepData, ...currentData }
    setStepData(updatedData)

    // Call step submit handler if provided
    if (currentStep.onStepSubmit) {
      try {
        await currentStep.onStepSubmit(currentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Step validation failed')
        return
      }
    }

    // Mark step as completed
    const newCompleted = new Set(completed)
    newCompleted.add(activeStep)
    setCompleted(newCompleted)

    // Move to next step
    const nextStep = activeStep + 1
    setActiveStep(nextStep)
    if (onStepChange) onStepChange(nextStep)
    
    // Reset form with combined data for next step
    form.reset(updatedData)
  }, [activeStep, completed, currentStep, form, isReviewStep, onError, onStepChange, onSubmit, stepData, validateOnStepChange])

  const handleBack = useCallback(() => {
    const prevStep = activeStep - 1
    setActiveStep(prevStep)
    if (onStepChange) onStepChange(prevStep)
    
    // Reset form with existing data
    form.reset(stepData)
  }, [activeStep, form, onStepChange, stepData])

  const handleSkip = useCallback(() => {
    if (!currentStep.canSkip) return

    const nextStep = activeStep + 1
    setActiveStep(nextStep)
    if (onStepChange) onStepChange(nextStep)
  }, [activeStep, currentStep.canSkip, onStepChange])

  const handleReset = useCallback(() => {
    setActiveStep(0)
    setCompleted(new Set())
    setStepData(defaultValues || {})
    setError(null)
    setSuccess(false)
    form.reset(defaultValues)
    if (onStepChange) onStepChange(0)
  }, [defaultValues, form, onStepChange])

  const handleStepClick = useCallback((stepIndex: number) => {
    if (!nonLinear) return
    if (stepIndex > activeStep && !completed.has(activeStep)) return

    setActiveStep(stepIndex)
    if (onStepChange) onStepChange(stepIndex)
    form.reset(stepData)
  }, [activeStep, completed, form, nonLinear, onStepChange, stepData])

  // Render review content
  const renderReview = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Review Your Information
        </Typography>
        
        {steps.map((step, index) => {
          const stepFields = step.fields || []
          const hasData = stepFields.some(field => stepData[field.name as keyof T])
          
          if (!hasData && step.optional) return null
          
          return (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                {step.label}
              </Typography>
              
              <Stack spacing={1}>
                {stepFields.map(field => {
                  const value = stepData[field.name as keyof T]
                  if (!value && value !== 0 && value !== false) return null
                  
                  return (
                    <Box key={field.name} display="flex" gap={2}>
                      <Typography variant="body2" color="text.secondary" minWidth={120}>
                        {field.label || field.name}:
                      </Typography>
                      <Typography variant="body2">
                        {typeof value === 'boolean' 
                          ? value ? 'Yes' : 'No'
                          : Array.isArray(value)
                          ? value.join(', ')
                          : String(value)}
                      </Typography>
                    </Box>
                  )
                })}
                
                {step.sections?.map((section, sectionIndex) => (
                  <Box key={sectionIndex}>
                    {section.title && (
                      <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                        {section.title}
                      </Typography>
                    )}
                    {section.fields.map(field => {
                      const value = stepData[field.name as keyof T]
                      if (!value && value !== 0 && value !== false) return null
                      
                      return (
                        <Box key={field.name} display="flex" gap={2} pl={2}>
                          <Typography variant="body2" color="text.secondary" minWidth={100}>
                            {field.label || field.name}:
                          </Typography>
                          <Typography variant="body2">
                            {typeof value === 'boolean' 
                              ? value ? 'Yes' : 'No'
                              : Array.isArray(value)
                              ? value.join(', ')
                              : String(value)}
                          </Typography>
                        </Box>
                      )
                    })}
                  </Box>
                ))}
              </Stack>
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <Box sx={sx}>
      {header}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Form submitted successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Stepper
        activeStep={activeStep}
        orientation={orientation}
        alternativeLabel={alternativeLabel}
        sx={stepperSx}
      >
        {allSteps.map((step, index) => {
          const stepProps: { completed?: boolean } = {}
          const labelProps: { optional?: React.ReactNode; error?: boolean } = {}
          
          if (completed.has(index)) {
            stepProps.completed = true
          }
          
          if (step.optional && index < steps.length) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            )
          }
          
          if (customStepIcon) {
            // Custom step icon support would go here
          }

          return (
            <Step key={index} {...stepProps}>
              {nonLinear ? (
                <StepButton
                  color="inherit"
                  onClick={() => handleStepClick(index)}
                  disabled={disabled || (index > activeStep && !completed.has(activeStep))}
                >
                  {step.label}
                </StepButton>
              ) : (
                <StepLabel {...labelProps}>{step.label}</StepLabel>
              )}
              
              {orientation === 'vertical' && (
                <StepContent>
                  {isReviewStep && index === activeStep ? (
                    renderReview()
                  ) : index === activeStep && (
                    <>
                      {step.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {step.description}
                        </Typography>
                      )}
                      
                      <Form
                        form={form as any}
                        fields={step.fields}
                        sections={step.sections}
                        onSubmit={() => {}}
                        disabled={disabled || isSubmitting}
                        customButtons={<></>}
                        spacing={spacing}
                      />
                    </>
                  )}
                  
                  <Box sx={{ mb: 2, mt: 2, ...buttonsSx }}>
                    {step.canSkip && !isLastStep && (
                      <Button
                        disabled={disabled || isSubmitting}
                        onClick={handleSkip}
                        sx={{ mr: 1 }}
                      >
                        {skipLabel}
                      </Button>
                    )}
                    
                    {activeStep > 0 && (
                      <Button
                        disabled={disabled || isSubmitting}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        {backLabel}
                      </Button>
                    )}
                    
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={disabled || isSubmitting}
                      startIcon={isSubmitting && <CircularProgress size={16} />}
                    >
                      {isLastStep ? finishLabel : nextLabel}
                    </Button>
                  </Box>
                </StepContent>
              )}
            </Step>
          )
        })}
      </Stepper>
      
      {orientation === 'horizontal' && (
        <Box sx={{ mt: 3, ...contentSx }}>
          {success ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" color="success.main" gutterBottom>
                Success!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Your form has been submitted successfully.
              </Typography>
              <Button variant="outlined" onClick={handleReset}>
                {resetLabel}
              </Button>
            </Paper>
          ) : isReviewStep ? (
            <Paper sx={{ p: 3 }}>
              {renderReview()}
            </Paper>
          ) : (
            <>
              {currentStep.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {currentStep.description}
                </Typography>
              )}
              
              <Form
                form={form as any}
                fields={currentStep.fields}
                sections={currentStep.sections}
                onSubmit={() => {}}
                disabled={disabled || isSubmitting}
                customButtons={<></>}
                spacing={spacing}
              />
            </>
          )}
          
          {!success && (
            <Box sx={{ display: 'flex', pt: 2, ...buttonsSx }}>
              <Button
                color="inherit"
                disabled={activeStep === 0 || disabled || isSubmitting}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                {backLabel}
              </Button>
              
              <Box sx={{ flex: '1 1 auto' }} />
              
              {currentStep.canSkip && !isLastStep && (
                <Button
                  color="inherit"
                  onClick={handleSkip}
                  disabled={disabled || isSubmitting}
                  sx={{ mr: 1 }}
                >
                  {skipLabel}
                </Button>
              )}
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={disabled || isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={16} />}
              >
                {isLastStep ? finishLabel : nextLabel}
              </Button>
            </Box>
          )}
        </Box>
      )}
      
      {footer}
    </Box>
  )
}