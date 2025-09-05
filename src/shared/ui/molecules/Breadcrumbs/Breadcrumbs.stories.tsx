import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { 
  Breadcrumbs,
  CollapsibleBreadcrumbs,
  IconBreadcrumbs,
  ChipBreadcrumbs,
  CustomSeparatorBreadcrumbs
} from './Breadcrumbs'
import { Box, Typography, Paper } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

const meta = {
  title: 'Shared/UI/Molecules/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible breadcrumbs component built on Material UI Breadcrumbs with collapsible support and custom styling.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Laptops', href: '/products/electronics/laptops' },
      { label: 'Gaming Laptop' },
    ]

    return <Breadcrumbs items={items} />
  },
}

export const WithIcons: Story = {
  render: () => {
    const items = [
      { label: 'Home', href: '/', icon: <HomeIcon fontSize="small" /> },
      { label: 'Documents', href: '/documents', icon: <FolderIcon fontSize="small" /> },
      { label: 'Projects', href: '/documents/projects', icon: <FolderOpenIcon fontSize="small" /> },
      { label: 'Report.pdf', icon: <InsertDriveFileIcon fontSize="small" /> },
    ]

    return <Breadcrumbs items={items} />
  },
}

export const Interactive: Story = {
  render: () => {
    const [currentPath, setCurrentPath] = useState(['Home', 'Products', 'Electronics', 'Laptop'])
    
    const items = currentPath.map((label, index) => ({
      label,
      onClick: index < currentPath.length - 1
        ? () => setCurrentPath(currentPath.slice(0, index + 1))
        : undefined,
    }))

    return (
      <Box>
        <Breadcrumbs items={items} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Click on any breadcrumb to navigate
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Current path: {currentPath.join(' / ')}
        </Typography>
      </Box>
    )
  },
}

export const Collapsible: Story = {
  render: () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/category' },
      { label: 'Subcategory', href: '/category/sub' },
      { label: 'Products', href: '/category/sub/products' },
      { label: 'Type', href: '/category/sub/products/type' },
      { label: 'Brand', href: '/category/sub/products/type/brand' },
      { label: 'Model', href: '/category/sub/products/type/brand/model' },
      { label: 'Item Details' },
    ]

    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Default (All items shown)
          </Typography>
          <Breadcrumbs items={items} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Collapsed (Max 4 items)
          </Typography>
          <CollapsibleBreadcrumbs items={items} collapseThreshold={4} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Collapsed (Max 3 items)
          </Typography>
          <CollapsibleBreadcrumbs items={items} collapseThreshold={3} />
        </Box>
      </Box>
    )
  },
}

export const WithHomeIcon: Story = {
  render: () => {
    const items = [
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Laptop' },
    ]

    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Without Home
          </Typography>
          <Breadcrumbs items={items} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            With Home Icon
          </Typography>
          <Breadcrumbs items={items} showHome />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Custom Home Label
          </Typography>
          <Breadcrumbs items={items} showHome homeLabel="Dashboard" />
        </Box>
      </Box>
    )
  },
}

export const CustomSeparators: Story = {
  render: () => {
    const items = [
      { label: 'Home' },
      { label: 'Products' },
      { label: 'Electronics' },
      { label: 'Laptop' },
    ]

    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Default Separator (›)
          </Typography>
          <Breadcrumbs items={items} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Chevron Right
          </Typography>
          <Breadcrumbs items={items} separator={<ChevronRightIcon fontSize="small" />} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Arrow
          </Typography>
          <Breadcrumbs items={items} separator={<ArrowForwardIosIcon fontSize="small" />} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Text Separator
          </Typography>
          <CustomSeparatorBreadcrumbs items={items} customSeparator=" / " />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Dot Separator
          </Typography>
          <CustomSeparatorBreadcrumbs items={items} customSeparator=" • " />
        </Box>
      </Box>
    )
  },
}

export const IconVariants: Story = {
  render: () => {
    const items = [
      { label: 'Dashboard' },
      { label: 'Users' },
      { label: 'Profile' },
      { label: 'Settings' },
    ]

    const customItems = [
      { label: 'Dashboard', icon: <HomeIcon fontSize="small" /> },
      { label: 'Users', icon: <PersonIcon fontSize="small" /> },
      { label: 'Profile', icon: <PersonIcon fontSize="small" /> },
      { label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
    ]

    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Auto Home Icon (First item only)
          </Typography>
          <IconBreadcrumbs items={items} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Custom Icons for Each Item
          </Typography>
          <Breadcrumbs items={customItems} />
        </Box>
      </Box>
    )
  },
}

export const ChipStyle: Story = {
  render: () => {
    const items = [
      { label: 'Home' },
      { label: 'Products' },
      { label: 'Electronics' },
      { label: 'Laptop' },
    ]

    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Chip Breadcrumbs
          </Typography>
          <ChipBreadcrumbs items={items} />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Chip Breadcrumbs with Click Handlers
          </Typography>
          <ChipBreadcrumbs
            items={items.map((item, index) => ({
              ...item,
              onClick: index < items.length - 1 ? () => console.log(`Clicked: ${item.label}`) : undefined,
            }))}
          />
        </Box>
      </Box>
    )
  },
}

export const DisabledItems: Story = {
  render: () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Restricted', disabled: true, href: '/restricted' },
      { label: 'Available', href: '/available' },
      { label: 'Current Page' },
    ]

    return (
      <Box>
        <Breadcrumbs items={items} />
        <Typography variant="caption" color="text.secondary" mt={2} display="block">
          The "Restricted" item is disabled and cannot be clicked
        </Typography>
      </Box>
    )
  },
}

export const ECommerce: Story = {
  render: () => {
    const items = [
      { label: 'Shop', icon: <ShoppingCartIcon fontSize="small" />, href: '/shop' },
      { label: "Women's", href: '/shop/womens' },
      { label: 'Clothing', href: '/shop/womens/clothing' },
      { label: 'Dresses', href: '/shop/womens/clothing/dresses' },
      { label: 'Summer Collection' },
    ]

    return (
      <Paper sx={{ p: 2 }}>
        <Breadcrumbs items={items} />
        <Typography variant="h5" mt={2}>
          Summer Collection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse our latest summer dress collection
        </Typography>
      </Paper>
    )
  },
}

export const FilePath: Story = {
  render: () => {
    const items = [
      { label: 'src', icon: <FolderIcon fontSize="small" /> },
      { label: 'components', icon: <FolderIcon fontSize="small" /> },
      { label: 'shared', icon: <FolderIcon fontSize="small" /> },
      { label: 'ui', icon: <FolderIcon fontSize="small" /> },
      { label: 'molecules', icon: <FolderIcon fontSize="small" /> },
      { label: 'Breadcrumbs.tsx', icon: <InsertDriveFileIcon fontSize="small" /> },
    ]

    return (
      <Box sx={{ fontFamily: 'monospace' }}>
        <CustomSeparatorBreadcrumbs items={items} customSeparator=" / " />
      </Box>
    )
  },
}

export const Responsive: Story = {
  render: () => {
    const items = [
      { label: 'Home' },
      { label: 'Very Long Category Name' },
      { label: 'Another Long Subcategory' },
      { label: 'Products with Extended Description' },
      { label: 'Specific Item' },
    ]

    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Responsive breadcrumbs (resize window to see collapse)
        </Typography>
        <Box sx={{ maxWidth: { xs: 300, sm: 400, md: 600 } }}>
          <CollapsibleBreadcrumbs 
            items={items} 
            collapseThreshold={4}
            sx={{
              '& .MuiBreadcrumbs-ol': {
                flexWrap: { xs: 'wrap', sm: 'nowrap' }
              }
            }}
          />
        </Box>
      </Box>
    )
  },
}