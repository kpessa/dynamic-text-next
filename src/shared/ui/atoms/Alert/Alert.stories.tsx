import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Alert } from './Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

const meta = {
  title: 'Atoms/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Alert component for displaying important messages with various severity levels, dismissible options, and action buttons.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
      description: 'The severity of the alert'
    },
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined'],
      description: 'The visual variant of the alert'
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the alert can be dismissed'
    },
    autoHideDuration: {
      control: 'number',
      description: 'Auto-hide duration in milliseconds'
    }
  }
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'This is a default alert message'
  }
}

export const Severities: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="success">
        This is a success alert — check it out!
      </Alert>
      <Alert severity="info">
        This is an info alert — check it out!
      </Alert>
      <Alert severity="warning">
        This is a warning alert — check it out!
      </Alert>
      <Alert severity="error">
        This is an error alert — check it out!
      </Alert>
    </Stack>
  )
}

export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert variant="standard" severity="success">
        Standard success alert
      </Alert>
      <Alert variant="filled" severity="success">
        Filled success alert
      </Alert>
      <Alert variant="outlined" severity="success">
        Outlined success alert
      </Alert>
    </Stack>
  )
}

export const WithTitles: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="success" title="Success">
        Your changes have been saved successfully!
      </Alert>
      <Alert severity="info" title="Information">
        New features are available in this update.
      </Alert>
      <Alert severity="warning" title="Warning">
        Your session will expire in 5 minutes.
      </Alert>
      <Alert severity="error" title="Error">
        Failed to save changes. Please try again.
      </Alert>
    </Stack>
  )
}

export const Dismissible: Story = {
  render: () => {
    const [open1, setOpen1] = useState(true)
    const [open2, setOpen2] = useState(true)
    const [open3, setOpen3] = useState(true)
    
    return (
      <Stack spacing={2}>
        {open1 && (
          <Alert 
            severity="success" 
            dismissible
            onDismiss={() => setOpen1(false)}
          >
            This alert can be dismissed by clicking the X button
          </Alert>
        )}
        {open2 && (
          <Alert 
            severity="warning" 
            dismissible
            onDismiss={() => setOpen2(false)}
            title="Dismissible Warning"
          >
            Click the X to dismiss this warning
          </Alert>
        )}
        {open3 && (
          <Alert 
            severity="info" 
            variant="filled"
            dismissible
            onDismiss={() => setOpen3(false)}
          >
            Filled alert that can be dismissed
          </Alert>
        )}
        {!open1 && !open2 && !open3 && (
          <Button 
            variant="contained"
            onClick={() => {
              setOpen1(true)
              setOpen2(true)
              setOpen3(true)
            }}
          >
            Reset All Alerts
          </Button>
        )}
      </Stack>
    )
  }
}

export const WithActionButton: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert 
        severity="success"
        actionButton={{
          label: 'UNDO',
          onClick: () => console.log('Undo clicked')
        }}
      >
        File uploaded successfully
      </Alert>
      <Alert 
        severity="error"
        actionButton={{
          label: 'RETRY',
          onClick: () => console.log('Retry clicked')
        }}
      >
        Upload failed
      </Alert>
      <Alert 
        severity="warning"
        dismissible
        actionButton={{
          label: 'DETAILS',
          onClick: () => console.log('Details clicked')
        }}
      >
        Warning with both action and dismiss
      </Alert>
    </Stack>
  )
}

export const AutoHide: Story = {
  render: () => {
    const [show, setShow] = useState(true)
    
    return (
      <Stack spacing={2}>
        {show && (
          <Alert 
            severity="success" 
            autoHideDuration={5000}
            onDismiss={() => setShow(false)}
          >
            This alert will automatically disappear in 5 seconds
          </Alert>
        )}
        {!show && (
          <Button variant="contained" onClick={() => setShow(true)}>
            Show Auto-Hide Alert
          </Button>
        )}
      </Stack>
    )
  }
}

export const NoIcon: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="info" icon={false}>
        Alert without icon
      </Alert>
      <Alert severity="success" icon={false} title="No Icon">
        This success alert has no icon
      </Alert>
    </Stack>
  )
}

export const CustomIcon: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="info" icon={<span>🚀</span>}>
        Alert with rocket emoji as icon
      </Alert>
      <Alert severity="success" icon={<span>✨</span>}>
        Alert with sparkles emoji as icon
      </Alert>
      <Alert severity="warning" icon={<span>⚡</span>}>
        Alert with lightning emoji as icon
      </Alert>
    </Stack>
  )
}

export const ComplexContent: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="info" title="System Maintenance">
        <div>
          <p>Scheduled maintenance will occur on:</p>
          <ul style={{ margin: '8px 0' }}>
            <li>Saturday, January 6th - 2:00 AM to 4:00 AM EST</li>
            <li>Sunday, January 7th - 3:00 AM to 5:00 AM EST</li>
          </ul>
          <p>During this time, the service may be temporarily unavailable.</p>
        </div>
      </Alert>
      <Alert severity="error" title="Multiple Errors Found">
        <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Invalid email format</li>
          <li>Password must be at least 8 characters</li>
          <li>Username is already taken</li>
        </ol>
      </Alert>
    </Stack>
  )
}

export const AllVariantSeverityCombinations: Story = {
  render: () => (
    <Stack spacing={2}>
      {(['standard', 'filled', 'outlined'] as const).map(variant => (
        <div key={variant}>
          <h4 style={{ margin: '16px 0 8px' }}>{variant.charAt(0).toUpperCase() + variant.slice(1)}</h4>
          <Stack spacing={1}>
            {(['success', 'info', 'warning', 'error'] as const).map(severity => (
              <Alert key={`${variant}-${severity}`} variant={variant} severity={severity}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)} {variant} alert
              </Alert>
            ))}
          </Stack>
        </div>
      ))}
    </Stack>
  )
}

export const NotificationExample: Story = {
  render: () => {
    const [notifications, setNotifications] = useState<Array<{
      id: number
      severity: 'success' | 'error' | 'warning' | 'info'
      message: string
    }>>([])
    
    const addNotification = (severity: 'success' | 'error' | 'warning' | 'info', message: string) => {
      const id = Date.now()
      setNotifications(prev => [...prev, { id, severity, message }])
    }
    
    const removeNotification = (id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }
    
    return (
      <div>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => addNotification('success', 'Operation completed successfully!')}
          >
            Success
          </Button>
          <Button 
            variant="contained" 
            color="info"
            onClick={() => addNotification('info', 'New update available')}
          >
            Info
          </Button>
          <Button 
            variant="contained" 
            color="warning"
            onClick={() => addNotification('warning', 'Low disk space')}
          >
            Warning
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => addNotification('error', 'Connection failed')}
          >
            Error
          </Button>
        </Stack>
        
        <Stack spacing={1}>
          {notifications.map(notification => (
            <Alert
              key={notification.id}
              severity={notification.severity}
              dismissible
              onDismiss={() => removeNotification(notification.id)}
              autoHideDuration={5000}
            >
              {notification.message}
            </Alert>
          ))}
        </Stack>
      </div>
    )
  }
}

export const InteractivePlayground: Story = {
  args: {
    severity: 'info',
    variant: 'standard',
    title: 'Playground Alert',
    children: 'Experiment with the controls to see different alert configurations',
    dismissible: true
  }
}