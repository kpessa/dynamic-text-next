import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'
import MailIcon from '@mui/icons-material/Mail'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FolderIcon from '@mui/icons-material/Folder'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge component for displaying counts, dots, or status indicators on other components.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'dot'],
      description: 'The variant of the badge'
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'default'],
      description: 'The color of the badge'
    },
    overlap: {
      control: 'select',
      options: ['rectangular', 'circular'],
      description: 'Wrapped shape the badge should overlap'
    },
    max: {
      control: 'number',
      description: 'Max count to show'
    },
    showZero: {
      control: 'boolean',
      description: 'Controls whether badge is visible when badgeContent is zero'
    },
    invisible: {
      control: 'boolean',
      description: 'If true, the badge is invisible'
    }
  }
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    badgeContent: 4,
    children: <MailIcon />
  }
}

export const NumericBadges: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent={1} color="primary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={12} color="secondary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={99} color="error">
        <MailIcon />
      </Badge>
      <Badge badgeContent={100} max={99} color="success">
        <MailIcon />
      </Badge>
      <Badge badgeContent={1000} max={999} color="warning">
        <MailIcon />
      </Badge>
    </Stack>
  )
}

export const DotBadges: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge variant="dot" color="primary">
        <MailIcon />
      </Badge>
      <Badge variant="dot" color="secondary">
        <NotificationsIcon />
      </Badge>
      <Badge variant="dot" color="error">
        <Typography>Typography</Typography>
      </Badge>
      <Badge variant="dot" color="success">
        <Avatar>A</Avatar>
      </Badge>
    </Stack>
  )
}

export const Colors: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent={4} color="primary">
        <MailIcon color="action" />
      </Badge>
      <Badge badgeContent={4} color="secondary">
        <MailIcon color="action" />
      </Badge>
      <Badge badgeContent={4} color="error">
        <MailIcon color="action" />
      </Badge>
      <Badge badgeContent={4} color="info">
        <MailIcon color="action" />
      </Badge>
      <Badge badgeContent={4} color="success">
        <MailIcon color="action" />
      </Badge>
      <Badge badgeContent={4} color="warning">
        <MailIcon color="action" />
      </Badge>
      <Badge badgeContent={4} color="default">
        <MailIcon color="action" />
      </Badge>
    </Stack>
  )
}

export const MaxValue: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent={99}>
        <MailIcon />
      </Badge>
      <Badge badgeContent={100}>
        <MailIcon />
      </Badge>
      <Badge badgeContent={1000} max={999}>
        <MailIcon />
      </Badge>
      <Badge badgeContent={50} max={9}>
        <MailIcon />
      </Badge>
    </Stack>
  )
}

export const ShowZero: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Stack alignItems="center">
        <Badge badgeContent={0}>
          <MailIcon />
        </Badge>
        <Typography variant="caption">Default (hidden)</Typography>
      </Stack>
      <Stack alignItems="center">
        <Badge badgeContent={0} showZero>
          <MailIcon />
        </Badge>
        <Typography variant="caption">showZero</Typography>
      </Stack>
    </Stack>
  )
}

export const BadgePositions: Story = {
  render: () => (
    <Stack spacing={4}>
      <Stack direction="row" spacing={4}>
        <Badge badgeContent={1} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Button variant="contained">Top Right</Button>
        </Badge>
        <Badge badgeContent={2} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
          <Button variant="contained">Top Left</Button>
        </Badge>
      </Stack>
      <Stack direction="row" spacing={4}>
        <Badge badgeContent={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Button variant="contained">Bottom Right</Button>
        </Badge>
        <Badge badgeContent={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
          <Button variant="contained">Bottom Left</Button>
        </Badge>
      </Stack>
    </Stack>
  )
}

export const BadgeOverlap: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent=" " color="secondary" variant="dot" overlap="circular">
        <Avatar>R</Avatar>
      </Badge>
      <Badge badgeContent=" " color="secondary" variant="dot" overlap="rectangular">
        <Avatar variant="square">R</Avatar>
      </Badge>
      <Badge badgeContent={4} color="secondary" overlap="circular">
        <Avatar>C</Avatar>
      </Badge>
      <Badge badgeContent={4} color="secondary" overlap="rectangular">
        <Avatar variant="square">S</Avatar>
      </Badge>
    </Stack>
  )
}

export const AnimatedBadge: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent={4} color="error" animated>
        <MailIcon />
      </Badge>
      <Badge variant="dot" color="success" animated>
        <NotificationsIcon />
      </Badge>
      <Badge badgeContent="NEW" color="secondary" animated>
        <ShoppingCartIcon />
      </Badge>
    </Stack>
  )
}

export const StringContent: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge badgeContent="NEW" color="secondary">
        <FolderIcon />
      </Badge>
      <Badge badgeContent="HOT" color="error">
        <ShoppingCartIcon />
      </Badge>
      <Badge badgeContent="!" color="warning">
        <NotificationsIcon />
      </Badge>
      <Badge badgeContent="99%" color="success">
        <Avatar>S</Avatar>
      </Badge>
    </Stack>
  )
}

export const WithIconButtons: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <IconButton>
        <Badge badgeContent={4} color="error">
          <MailIcon />
        </Badge>
      </IconButton>
      <IconButton>
        <Badge badgeContent={10} color="primary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <IconButton>
        <Badge variant="dot" color="success">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Stack>
  )
}

export const WithAvatars: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <Badge
        badgeContent={4}
        color="error"
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar alt="User" src="/api/placeholder/40/40" />
      </Badge>
      <Badge
        variant="dot"
        color="success"
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar>JD</Avatar>
      </Badge>
      <Badge
        badgeContent="VIP"
        color="secondary"
        overlap="circular"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Avatar sx={{ bgcolor: 'orange' }}>N</Avatar>
      </Badge>
    </Stack>
  )
}

export const Invisible: Story = {
  render: () => {
    const [invisible, setInvisible] = React.useState(false)
    
    return (
      <Stack spacing={2} alignItems="center">
        <Badge badgeContent={4} color="error" invisible={invisible}>
          <MailIcon />
        </Badge>
        <Button variant="outlined" onClick={() => setInvisible(!invisible)}>
          {invisible ? 'Show' : 'Hide'} Badge
        </Button>
      </Stack>
    )
  }
}

export const ShoppingCart: Story = {
  render: () => {
    const [cartItems, setCartItems] = React.useState(0)
    
    return (
      <Stack spacing={2} alignItems="center">
        <IconButton>
          <Badge badgeContent={cartItems} color="primary" showZero={false}>
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => setCartItems(Math.max(0, cartItems - 1))}
          >
            Remove
          </Button>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => setCartItems(cartItems + 1)}
          >
            Add
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setCartItems(0)}
          >
            Clear
          </Button>
        </Stack>
      </Stack>
    )
  }
}

export const NotificationBell: Story = {
  render: () => {
    const [notifications, setNotifications] = React.useState(5)
    const [hasNew, setHasNew] = React.useState(true)
    
    return (
      <Stack spacing={2} alignItems="center">
        <IconButton onClick={() => {
          setNotifications(0)
          setHasNew(false)
        }}>
          {hasNew ? (
            <Badge variant="dot" color="error" animated>
              <NotificationsIcon />
            </Badge>
          ) : (
            <Badge badgeContent={notifications} color="primary">
              <NotificationsIcon />
            </Badge>
          )}
        </IconButton>
        <Typography variant="caption">
          {hasNew ? 'New notifications!' : `${notifications} notifications`}
        </Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => {
            setNotifications(prev => prev + 1)
            setHasNew(true)
          }}
        >
          Add Notification
        </Button>
      </Stack>
    )
  }
}

export const InteractivePlayground: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    variant: 'standard',
    children: <MailIcon />
  }
}