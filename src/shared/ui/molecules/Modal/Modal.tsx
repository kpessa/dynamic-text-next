import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Button,
  Slide,
  useMediaQuery,
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import type { ModalProps, ConfirmationModalProps } from './Modal.types'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

const modalVariants = cva('', {
  variants: {
    size: {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      fullscreen: '',
    },
    variant: {
      standard: '',
      confirmation: '',
      form: '',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'standard',
  },
})

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      children,
      size = 'md',
      variant = 'standard',
      actions,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      loading = false,
      dividers = false,
      sticky = {},
      className,
      fullScreen: fullScreenProp,
      maxWidth,
      TransitionComponent = Transition,
      ...props
    },
    ref
  ) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const fullScreen = fullScreenProp || size === 'fullscreen' || isMobile

    const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (loading) return
      if (reason === 'backdropClick' && !closeOnBackdropClick) return
      if (reason === 'escapeKeyDown' && !closeOnEscape) return
      onClose()
    }

    const getMaxWidth = () => {
      if (maxWidth) return maxWidth
      if (fullScreen) return false
      
      switch (size) {
        case 'xs':
          return 'xs'
        case 'sm':
          return 'sm'
        case 'md':
          return 'md'
        case 'lg':
          return 'lg'
        case 'xl':
          return 'xl'
        default:
          return 'md'
      }
    }

    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth={getMaxWidth()}
        fullWidth
        TransitionComponent={TransitionComponent}
        className={cn(modalVariants({ size, variant }), className)}
        {...props}
      >
        {(title || showCloseButton) && (
          <DialogTitle
            sx={{
              m: 0,
              p: 2,
              ...(sticky?.header && {
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
              }),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              {title && (
                <Typography variant="h6" component="div">
                  {title}
                </Typography>
              )}
              {showCloseButton && (
                <IconButton
                  aria-label="close"
                  onClick={() => onClose()}
                  disabled={loading}
                  sx={{
                    position: title ? 'relative' : 'absolute',
                    right: title ? 0 : 8,
                    top: title ? 0 : 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </DialogTitle>
        )}
        
        <DialogContent dividers={dividers}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={200}
            >
              <CircularProgress />
            </Box>
          ) : (
            children
          )}
        </DialogContent>
        
        {actions && (
          <DialogActions
            sx={{
              ...(sticky?.footer && {
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                zIndex: 1,
              }),
            }}
          >
            {actions}
          </DialogActions>
        )}
      </Dialog>
    )
  }
)

Modal.displayName = 'Modal'

export const ConfirmationModal = React.forwardRef<HTMLDivElement, ConfirmationModalProps>(
  (
    {
      open,
      onClose,
      title = 'Confirm Action',
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      confirmButtonColor = 'primary',
      icon,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [isConfirming, setIsConfirming] = useState(false)

    const handleConfirm = async () => {
      setIsConfirming(true)
      try {
        await onConfirm()
        onClose()
      } catch (error) {
        console.error('Confirmation error:', error)
      } finally {
        setIsConfirming(false)
      }
    }

    return (
      <Modal
        ref={ref}
        open={open}
        onClose={onClose}
        title={title}
        variant="confirmation"
        size="sm"
        loading={loading || isConfirming}
        closeOnBackdropClick={!isConfirming}
        closeOnEscape={!isConfirming}
        showCloseButton={!isConfirming}
        actions={
          <>
            <Button
              onClick={onClose}
              disabled={isConfirming}
              color="inherit"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirming}
              color={confirmButtonColor}
              variant="contained"
              startIcon={isConfirming && <CircularProgress size={16} />}
            >
              {confirmText}
            </Button>
          </>
        }
        {...props}
      >
        <Box display="flex" alignItems="flex-start" gap={2}>
          {icon || (
            <WarningAmberIcon
              color={confirmButtonColor === 'error' ? 'error' : 'warning'}
              sx={{ fontSize: 40 }}
            />
          )}
          <Typography>{message}</Typography>
        </Box>
      </Modal>
    )
  }
)

ConfirmationModal.displayName = 'ConfirmationModal'

export const FormModal: React.FC<
  ModalProps & {
    onSubmit: () => void | Promise<void>
    submitText?: string
    cancelText?: string
    submitDisabled?: boolean
  }
> = ({
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitDisabled = false,
  onClose,
  ...props
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit()
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      variant="form"
      onClose={onClose}
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      showCloseButton={!isSubmitting}
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            color="inherit"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitDisabled || isSubmitting}
            variant="contained"
            color="primary"
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            {submitText}
          </Button>
        </>
      }
      {...props}
    >
      {children}
    </Modal>
  )
}