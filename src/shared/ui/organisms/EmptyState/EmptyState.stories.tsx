import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import { fn } from '@storybook/test'
import { Box, Chip } from '@mui/material'

const meta: Meta<typeof EmptyState> = {
  title: 'Organisms/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible empty state component for various scenarios like no data, errors, or coming soon features.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: 'No content available',
    description: 'Start by adding some items to see them here.',
  },
}

export const WithPrimaryAction: Story = {
  args: {
    title: 'No items yet',
    description: 'Create your first item to get started.',
    primaryAction: {
      label: 'Create Item',
      onClick: fn(),
      startIcon: <AddIcon />,
    },
  },
}

export const WithBothActions: Story = {
  args: {
    title: 'No projects found',
    description: 'Create a new project or import an existing one.',
    primaryAction: {
      label: 'New Project',
      onClick: fn(),
      startIcon: <AddIcon />,
    },
    secondaryAction: {
      label: 'Import',
      onClick: fn(),
      startIcon: <UploadIcon />,
    },
  },
}

export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    primaryAction: {
      label: 'Try Again',
      onClick: fn(),
      startIcon: <RefreshIcon />,
    },
  },
}

export const NoResultsVariant: Story = {
  args: {
    variant: 'no-results',
    primaryAction: {
      label: 'Clear Filters',
      onClick: fn(),
      startIcon: <FilterIcon />,
    },
    secondaryAction: {
      label: 'Search Tips',
      onClick: fn(),
      startIcon: <SearchIcon />,
    },
  },
}

export const NoDataVariant: Story = {
  args: {
    variant: 'no-data',
    title: 'No data to display',
    description: 'Data will appear here once it becomes available.',
  },
}

export const NoPermissionVariant: Story = {
  args: {
    variant: 'no-permission',
    primaryAction: {
      label: 'Request Access',
      onClick: fn(),
    },
    secondaryAction: {
      label: 'Go Back',
      onClick: fn(),
      startIcon: <HomeIcon />,
    },
  },
}

export const ComingSoonVariant: Story = {
  args: {
    variant: 'coming-soon',
    title: 'Analytics Dashboard',
    description: 'Advanced analytics features are coming in Q2 2024.',
  },
}

export const CustomIcon: Story = {
  args: {
    title: 'Upload your files',
    description: 'Drag and drop files here or click to browse.',
    icon: <UploadIcon sx={{ fontSize: 'inherit' }} />,
    iconColor: 'primary',
    primaryAction: {
      label: 'Browse Files',
      onClick: fn(),
    },
  },
}

export const WithImage: Story = {
  args: {
    title: 'Welcome to our platform',
    description: 'Get started by exploring our features.',
    image: 'https://via.placeholder.com/200x200/3f51b5/ffffff?text=Welcome',
    imageAlt: 'Welcome illustration',
    primaryAction: {
      label: 'Get Started',
      onClick: fn(),
    },
  },
}

export const HorizontalOrientation: Story = {
  args: {
    orientation: 'horizontal',
    title: 'Your inbox is empty',
    description: 'When you receive messages, they will appear here. Check back later or send a message to get started.',
    primaryAction: {
      label: 'Compose Message',
      onClick: fn(),
    },
  },
}

export const SmallSize: Story = {
  args: {
    size: 'small',
    title: 'No notifications',
    description: 'You\'re all caught up!',
  },
}

export const LargeSize: Story = {
  args: {
    size: 'large',
    title: 'Start your journey',
    description: 'Welcome to our platform. Let\'s get you set up with your first project.',
    primaryAction: {
      label: 'Create Project',
      onClick: fn(),
      startIcon: <AddIcon />,
    },
    secondaryAction: {
      label: 'Watch Tutorial',
      onClick: fn(),
    },
  },
}

export const WithCustomActions: Story = {
  args: {
    title: 'Choose your path',
    description: 'Select how you want to proceed.',
    customActions: (
      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
        <Chip label="Option 1" onClick={fn()} color="primary" />
        <Chip label="Option 2" onClick={fn()} color="secondary" />
        <Chip label="Option 3" onClick={fn()} />
      </Box>
    ),
  },
}

export const WithChildren: Story = {
  args: {
    title: 'No search results',
    description: 'Try different keywords or adjust your filters.',
    children: (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <strong>Search tips:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          <li>Use specific keywords</li>
          <li>Check your spelling</li>
          <li>Try broader terms</li>
        </ul>
      </Box>
    ),
  },
}

export const WithFooter: Story = {
  args: {
    title: 'Maintenance mode',
    description: 'We\'re updating our systems to serve you better.',
    variant: 'coming-soon',
    footer: (
      <Box sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
        Expected completion: 2:00 PM EST
        <br />
        For urgent matters, contact support@example.com
      </Box>
    ),
  },
}

export const Bordered: Story = {
  args: {
    title: 'Empty folder',
    description: 'This folder doesn\'t contain any files.',
    bordered: true,
    primaryAction: {
      label: 'Upload Files',
      onClick: fn(),
      startIcon: <UploadIcon />,
    },
  },
}

export const Elevated: Story = {
  args: {
    title: 'No downloads',
    description: 'Your download history is empty.',
    elevation: 3,
    rounded: true,
    primaryAction: {
      label: 'Browse Content',
      onClick: fn(),
    },
  },
}

export const ColoredBackground: Story = {
  args: {
    title: 'Premium feature',
    description: 'Upgrade to access advanced analytics.',
    backgroundColor: '#f3e5f5',
    iconColor: 'secondary',
    primaryAction: {
      label: 'Upgrade Now',
      onClick: fn(),
    },
    secondaryAction: {
      label: 'Learn More',
      onClick: fn(),
    },
  },
}

export const FullHeight: Story = {
  args: {
    title: 'Page not found',
    description: 'The page you\'re looking for doesn\'t exist.',
    variant: 'error',
    fullHeight: true,
    primaryAction: {
      label: 'Go Home',
      onClick: fn(),
      startIcon: <HomeIcon />,
    },
  },
}

export const CustomStyling: Story = {
  args: {
    title: 'Custom styled empty state',
    description: 'This empty state has custom styling applied.',
    sx: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      '& .MuiTypography-root': {
        color: 'white',
      },
    },
    primaryAction: {
      label: 'Action',
      onClick: fn(),
    },
  },
}

export const CompleteExample: Story = {
  args: {
    variant: 'no-results',
    size: 'large',
    orientation: 'vertical',
    bordered: true,
    rounded: true,
    title: 'No matching results',
    description: 'We couldn\'t find any items matching your search criteria.',
    primaryAction: {
      label: 'Clear All Filters',
      onClick: fn(),
      startIcon: <FilterIcon />,
    },
    secondaryAction: {
      label: 'New Search',
      onClick: fn(),
      startIcon: <SearchIcon />,
    },
    children: (
      <Box sx={{ mt: 3 }}>
        <strong>Current filters:</strong>
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Category: Electronics" size="small" onDelete={fn()} />
          <Chip label="Price: $100-$500" size="small" onDelete={fn()} />
          <Chip label="Brand: Apple" size="small" onDelete={fn()} />
        </Box>
      </Box>
    ),
    footer: (
      <Box sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 12, mt: 2 }}>
        Need help? <a href="#" onClick={fn()}>Contact support</a>
      </Box>
    ),
  },
}