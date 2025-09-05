import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Drawer, MiniDrawer, NavigationDrawer } from './Drawer'
import {
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import NotificationsIcon from '@mui/icons-material/Notifications'
import SecurityIcon from '@mui/icons-material/Security'
import HelpIcon from '@mui/icons-material/Help'
import LogoutIcon from '@mui/icons-material/Logout'

const meta = {
  title: 'Shared/UI/Molecules/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A flexible drawer component built on Material UI Drawer with multiple variants and configurations.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

const DrawerWrapper: React.FC<any> = ({ children, ...props }) => {
  const [open, setOpen] = useState(false)
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Drawer
      </Button>
      {React.cloneElement(children, {
        ...props,
        open,
        onClose: () => setOpen(false),
      })}
    </Box>
  )
}

export const Default: Story = {
  render: (args) => (
    <DrawerWrapper>
      <Drawer {...args}>
        <Box sx={{ p: 2 }}>
          <Typography paragraph>
            This is a standard drawer with default settings. It slides in from the left side of the screen.
          </Typography>
          <Typography>
            You can add any content here, including forms, lists, or navigation items.
          </Typography>
        </Box>
      </Drawer>
    </DrawerWrapper>
  ),
  args: {
    title: 'Standard Drawer',
  },
}

export const Anchors: Story = {
  render: () => {
    const anchors = ['left', 'right', 'top', 'bottom'] as const
    
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', p: 4 }}>
        {anchors.map((anchor) => {
          const [open, setOpen] = useState(false)
          return (
            <Box key={anchor}>
              <Button variant="outlined" onClick={() => setOpen(true)}>
                Open {anchor}
              </Button>
              <Drawer
                open={open}
                onClose={() => setOpen(false)}
                anchor={anchor}
                title={`${anchor.charAt(0).toUpperCase() + anchor.slice(1)} Drawer`}
                width={anchor === 'top' || anchor === 'bottom' ? 200 : 280}
              >
                <Box sx={{ p: 2 }}>
                  <Typography>
                    This drawer slides in from the {anchor} side.
                  </Typography>
                </Box>
              </Drawer>
            </Box>
          )
        })}
      </Box>
    )
  },
}

export const WithActions: Story = {
  render: (args) => (
    <DrawerWrapper>
      <Drawer
        {...args}
        actions={
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
            <Button color="inherit">Cancel</Button>
            <Button variant="contained" color="primary">
              Apply
            </Button>
          </Box>
        }
      >
        <Box sx={{ p: 2 }}>
          <Typography gutterBottom variant="h6">
            Settings
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable notifications"
            />
            <FormControlLabel
              control={<Switch />}
              label="Dark mode"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-save"
            />
          </Box>
        </Box>
      </Drawer>
    </DrawerWrapper>
  ),
  args: {
    title: 'Settings Drawer',
  },
}

export const PersistentDrawer: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <Box sx={{ display: 'flex', height: '400px', border: '1px solid #ddd' }}>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          variant="persistent"
          title="Persistent Drawer"
        >
          <Box sx={{ p: 2 }}>
            <Typography paragraph>
              This is a persistent drawer. It pushes the content instead of overlaying it.
            </Typography>
            <Button onClick={() => setOpen(false)}>Close Drawer</Button>
          </Box>
        </Drawer>
        <Box sx={{ flexGrow: 1, p: 2, transition: 'margin 225ms' }}>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Open Persistent Drawer
          </Button>
          <Typography paragraph sx={{ mt: 2 }}>
            Main content area. Notice how the content shifts when the drawer opens.
          </Typography>
        </Box>
      </Box>
    )
  },
}

export const MiniDrawerExample: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(false)
    
    return (
      <Box sx={{ display: 'flex', height: '500px', border: '1px solid #ddd' }}>
        <MiniDrawer
          open={true}
          onClose={() => {}}
          expanded={expanded}
          onExpand={setExpanded}
          title="Navigation"
          miniWidth={65}
          expandedWidth={280}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </MiniDrawer>
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Mini Drawer Demo
          </Typography>
          <Typography paragraph>
            The drawer on the left can be expanded and collapsed. Click the menu icon to toggle.
          </Typography>
          <Typography>
            Current state: {expanded ? 'Expanded' : 'Collapsed'}
          </Typography>
        </Box>
      </Box>
    )
  },
}

export const MiniDrawerWithHover: Story = {
  render: () => {
    return (
      <Box sx={{ display: 'flex', height: '500px', border: '1px solid #ddd' }}>
        <MiniDrawer
          open={true}
          onClose={() => {}}
          expandOnHover
          title="Hover to Expand"
          miniWidth={65}
          expandedWidth={280}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Security" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText primary="Help" />
              </ListItemButton>
            </ListItem>
          </List>
        </MiniDrawer>
        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Hover Expansion Demo
          </Typography>
          <Typography>
            Hover over the mini drawer to see it expand automatically.
          </Typography>
        </Box>
      </Box>
    )
  },
}

export const NavigationDrawerExample: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    
    const navigationItems = [
      { text: 'Dashboard', icon: <HomeIcon />, selected: selectedIndex === 0 },
      { text: 'Profile', icon: <PersonIcon />, selected: selectedIndex === 1 },
      { text: 'Notifications', icon: <NotificationsIcon />, selected: selectedIndex === 2 },
      { text: 'Settings', icon: <SettingsIcon />, selected: selectedIndex === 3 },
      { text: 'Security', icon: <SecurityIcon />, selected: selectedIndex === 4 },
      { text: 'Help & Support', icon: <HelpIcon />, selected: selectedIndex === 5 },
      { text: 'Logout', icon: <LogoutIcon />, selected: selectedIndex === 6 },
    ]
    
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Navigation
        </Button>
        <NavigationDrawer
          items={navigationItems}
          open={open}
          onClose={() => setOpen(false)}
          onItemClick={(index) => {
            setSelectedIndex(index)
            console.log(`Clicked: ${navigationItems[index].text}`)
          }}
          title="Main Menu"
        />
      </Box>
    )
  },
}

export const FormDrawer: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      message: '',
    })
    
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Form
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Contact Form"
          width={400}
          actions={
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  console.log('Form submitted:', formData)
                  setOpen(false)
                }}
              >
                Submit
              </Button>
            </Box>
          }
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <TextField
              label="Message"
              multiline
              rows={4}
              fullWidth
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </Box>
        </Drawer>
      </Box>
    )
  },
}

export const CustomWidth: Story = {
  render: () => {
    const widths = [200, 280, 400, '50%', '100vw']
    
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', p: 4 }}>
        {widths.map((width) => {
          const [open, setOpen] = useState(false)
          return (
            <Box key={String(width)}>
              <Button variant="outlined" onClick={() => setOpen(true)}>
                Width: {width}
              </Button>
              <Drawer
                open={open}
                onClose={() => setOpen(false)}
                title={`Width: ${width}`}
                width={width}
              >
                <Box sx={{ p: 2 }}>
                  <Typography>
                    This drawer has a custom width of {width}.
                  </Typography>
                </Box>
              </Drawer>
            </Box>
          )
        })}
      </Box>
    )
  },
}

export const NoBackdropClick: Story = {
  render: (args) => (
    <DrawerWrapper>
      <Drawer
        {...args}
        disableBackdropClick
        disableEscapeKeyDown
        showCloseButton={false}
        actions={
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button variant="contained" color="primary">
              Close Drawer
            </Button>
          </Box>
        }
      >
        <Box sx={{ p: 2 }}>
          <Typography paragraph>
            This drawer cannot be closed by clicking the backdrop or pressing Escape.
          </Typography>
          <Typography>
            You must use the button below to close it.
          </Typography>
        </Box>
      </Drawer>
    </DrawerWrapper>
  ),
  args: {
    title: 'Controlled Drawer',
  },
}