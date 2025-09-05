import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Modal, ConfirmationModal, FormModal } from './Modal'
import { Button, TextField, Box, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import DeleteIcon from '@mui/icons-material/Delete'

const meta = {
  title: 'Shared/UI/Molecules/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible modal component built on Material UI Dialog with multiple variants and configurations.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

const ModalWrapper: React.FC<any> = ({ children, ...props }) => {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Modal
      </Button>
      {React.cloneElement(children, {
        ...props,
        open,
        onClose: () => setOpen(false),
      })}
    </>
  )
}

export const Default: Story = {
  render: (args) => (
    <ModalWrapper>
      <Modal {...args}>
        <Typography paragraph>
          This is a standard modal with default settings. It provides a clean and simple way to display content in a dialog.
        </Typography>
        <Typography>
          You can add any content here, including forms, images, or complex layouts.
        </Typography>
      </Modal>
    </ModalWrapper>
  ),
  args: {
    title: 'Standard Modal',
  },
}

export const Sizes: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    
    return (
      <Box display="flex" gap={2} flexWrap="wrap">
        {sizes.map((size) => {
          const [open, setOpen] = useState(false)
          return (
            <Box key={size}>
              <Button variant="outlined" onClick={() => setOpen(true)}>
                Size: {size.toUpperCase()}
              </Button>
              <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={`Modal Size: ${size.toUpperCase()}`}
                size={size}
              >
                <Typography paragraph>
                  This modal demonstrates the {size} size variant.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Width: {size === 'xs' ? '444px' : size === 'sm' ? '600px' : size === 'md' ? '900px' : size === 'lg' ? '1200px' : '1536px'}
                </Typography>
              </Modal>
            </Box>
          )
        })}
      </Box>
    )
  },
}

export const WithActions: Story = {
  render: (args) => (
    <ModalWrapper>
      <Modal
        {...args}
        actions={
          <>
            <Button color="inherit">Cancel</Button>
            <Button variant="contained" color="primary">
              Save Changes
            </Button>
          </>
        }
      >
        <Typography paragraph>
          This modal includes action buttons in the footer. This pattern is useful for forms or confirmation dialogs.
        </Typography>
      </Modal>
    </ModalWrapper>
  ),
  args: {
    title: 'Modal with Actions',
  },
}

export const LoadingState: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    
    const handleOpen = () => {
      setOpen(true)
      setLoading(true)
      setTimeout(() => setLoading(false), 2000)
    }
    
    return (
      <>
        <Button variant="contained" onClick={handleOpen}>
          Open Loading Modal
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Loading Content"
          loading={loading}
        >
          <Typography>
            This content appears after loading completes.
          </Typography>
        </Modal>
      </>
    )
  },
}

export const WithDividers: Story = {
  render: (args) => (
    <ModalWrapper>
      <Modal {...args} dividers>
        <Box py={2}>
          <Typography paragraph>
            This modal uses dividers to separate the header, content, and footer sections.
          </Typography>
          <Typography paragraph>
            Dividers help create visual separation between different sections of the modal.
          </Typography>
        </Box>
      </Modal>
    </ModalWrapper>
  ),
  args: {
    title: 'Modal with Dividers',
    actions: (
      <>
        <Button>Cancel</Button>
        <Button variant="contained">Confirm</Button>
      </>
    ),
  },
}

export const StickyHeaderFooter: Story = {
  render: (args) => (
    <ModalWrapper>
      <Modal
        {...args}
        sticky={{ header: true, footer: true }}
        dividers
        actions={
          <>
            <Button>Cancel</Button>
            <Button variant="contained">Save</Button>
          </>
        }
      >
        <Box py={2}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Typography key={i} paragraph>
              Paragraph {i + 1}: This is scrollable content. The header and footer remain sticky while you scroll.
            </Typography>
          ))}
        </Box>
      </Modal>
    </ModalWrapper>
  ),
  args: {
    title: 'Sticky Header & Footer',
    size: 'sm',
  },
}

export const NoCloseButton: Story = {
  render: (args) => (
    <ModalWrapper>
      <Modal
        {...args}
        showCloseButton={false}
        actions={
          <>
            <Button variant="contained">Got It</Button>
          </>
        }
      >
        <Typography>
          This modal doesn't have a close button. Users must use the action button to dismiss it.
        </Typography>
      </Modal>
    </ModalWrapper>
  ),
  args: {
    title: 'Important Notice',
    closeOnBackdropClick: false,
    closeOnEscape: false,
  },
}

export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    const handleConfirm = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Action confirmed!')
          resolve(undefined)
        }, 1000)
      })
    }
    
    return (
      <>
        <Button variant="contained" color="error" onClick={() => setOpen(true)}>
          Delete Item
        </Button>
        <ConfirmationModal
          open={open}
          onClose={() => setOpen(false)}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={handleConfirm}
          confirmText="Delete"
          confirmButtonColor="error"
        />
      </>
    )
  },
}

export const ConfirmationWithCustomIcon: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button variant="contained" color="info" onClick={() => setOpen(true)}>
          Show Info
        </Button>
        <ConfirmationModal
          open={open}
          onClose={() => setOpen(false)}
          title="Information"
          message="This is an informational message with a custom icon."
          onConfirm={() => {}}
          confirmText="OK"
          cancelText="Close"
          confirmButtonColor="info"
          icon={<InfoIcon color="info" sx={{ fontSize: 40 }} />}
        />
      </>
    )
  },
}

export const FormModalExample: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '' })
    
    const handleSubmit = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Form submitted:', formData)
          setFormData({ name: '', email: '' })
          resolve(undefined)
        }, 1000)
      })
    }
    
    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Form
        </Button>
        <FormModal
          open={open}
          onClose={() => setOpen(false)}
          title="User Registration"
          onSubmit={handleSubmit}
          submitText="Register"
          size="sm"
        >
          <Box display="flex" flexDirection="column" gap={2} py={2}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Typography variant="caption" color="text.secondary">
              * All fields are required
            </Typography>
          </Box>
        </FormModal>
      </>
    )
  },
}

export const FullscreenModal: Story = {
  render: (args) => (
    <ModalWrapper>
      <Modal {...args} size="fullscreen">
        <Box py={2}>
          <Typography variant="h4" gutterBottom>
            Fullscreen Modal
          </Typography>
          <Typography paragraph>
            This modal takes up the entire screen. It's useful for complex forms, wizards, or when you need maximum space for content.
          </Typography>
          <Typography paragraph>
            On mobile devices, modals automatically become fullscreen for better usability.
          </Typography>
        </Box>
      </Modal>
    </ModalWrapper>
  ),
  args: {
    title: 'Fullscreen Experience',
    actions: (
      <>
        <Button>Close</Button>
        <Button variant="contained">Continue</Button>
      </>
    ),
  },
}

export const NestedModals: Story = {
  render: () => {
    const [firstOpen, setFirstOpen] = useState(false)
    const [secondOpen, setSecondOpen] = useState(false)
    
    return (
      <>
        <Button variant="contained" onClick={() => setFirstOpen(true)}>
          Open First Modal
        </Button>
        <Modal
          open={firstOpen}
          onClose={() => setFirstOpen(false)}
          title="First Modal"
          actions={
            <>
              <Button onClick={() => setFirstOpen(false)}>Close</Button>
              <Button variant="contained" onClick={() => setSecondOpen(true)}>
                Open Second Modal
              </Button>
            </>
          }
        >
          <Typography>
            This is the first modal. Click the button below to open a nested modal.
          </Typography>
        </Modal>
        <Modal
          open={secondOpen}
          onClose={() => setSecondOpen(false)}
          title="Second Modal"
          size="sm"
        >
          <Typography>
            This is a nested modal. It appears on top of the first modal.
          </Typography>
        </Modal>
      </>
    )
  },
}