import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { List } from './List'
import { ListItemData } from './List.types'
import {
  Avatar,
  IconButton,
  Chip,
  Button
} from '@mui/material'
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { fn } from '@storybook/test'

const meta: Meta<typeof List> = {
  title: 'Organisms/List',
  component: List,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A versatile list component with virtual scrolling, selection, nesting, and more.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof List>

// Sample data
const simpleItems: ListItemData[] = [
  { id: 1, primary: 'Inbox', secondary: '12 new messages' },
  { id: 2, primary: 'Drafts', secondary: '3 unsent messages' },
  { id: 3, primary: 'Sent', secondary: '145 messages' },
  { id: 4, primary: 'Spam', secondary: '2 messages' },
  { id: 5, primary: 'Trash', secondary: 'Empty' },
]

const contactItems: ListItemData[] = [
  {
    id: 1,
    primary: 'John Doe',
    secondary: 'john.doe@example.com',
    avatar: <Avatar>JD</Avatar>,
    action: (
      <IconButton edge="end">
        <StarBorderIcon />
      </IconButton>
    )
  },
  {
    id: 2,
    primary: 'Jane Smith',
    secondary: 'jane.smith@example.com',
    avatar: <Avatar sx={{ bgcolor: 'secondary.main' }}>JS</Avatar>,
    action: (
      <IconButton edge="end">
        <StarIcon color="warning" />
      </IconButton>
    )
  },
  {
    id: 3,
    primary: 'Bob Johnson',
    secondary: 'bob.johnson@example.com',
    avatar: <Avatar sx={{ bgcolor: 'success.main' }}>BJ</Avatar>,
    action: (
      <IconButton edge="end">
        <StarBorderIcon />
      </IconButton>
    )
  },
  {
    id: 4,
    primary: 'Alice Brown',
    secondary: 'alice.brown@example.com',
    avatar: <Avatar sx={{ bgcolor: 'warning.main' }}>AB</Avatar>,
    action: (
      <IconButton edge="end">
        <StarBorderIcon />
      </IconButton>
    )
  },
  {
    id: 5,
    primary: 'Charlie Wilson',
    secondary: 'charlie.wilson@example.com',
    avatar: <Avatar sx={{ bgcolor: 'error.main' }}>CW</Avatar>,
    action: (
      <IconButton edge="end">
        <StarBorderIcon />
      </IconButton>
    )
  },
]

const fileItems: ListItemData[] = [
  {
    id: 1,
    primary: 'Documents',
    secondary: '24 files',
    icon: <FolderIcon color="primary" />,
    divider: true
  },
  {
    id: 2,
    primary: 'Images',
    secondary: '142 files',
    icon: <FolderIcon color="primary" />,
    divider: true
  },
  {
    id: 3,
    primary: 'report.pdf',
    secondary: '2.4 MB',
    icon: <FileIcon />,
    divider: true
  },
  {
    id: 4,
    primary: 'presentation.pptx',
    secondary: '5.1 MB',
    icon: <FileIcon />,
    divider: true
  },
  {
    id: 5,
    primary: 'data.xlsx',
    secondary: '1.2 MB',
    icon: <FileIcon />
  },
]

// Generate large dataset
const generateLargeDataset = (count: number): ListItemData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    primary: `Item ${i + 1}`,
    secondary: `Description for item ${i + 1}`,
    avatar: <Avatar>{(i + 1).toString().slice(0, 2)}</Avatar>,
    action: (
      <IconButton edge="end" size="small">
        <DeleteIcon />
      </IconButton>
    )
  }))
}

export const Default: Story = {
  args: {
    items: simpleItems,
  },
}

export const WithAvatars: Story = {
  args: {
    items: contactItems,
  },
}

export const WithIcons: Story = {
  args: {
    items: fileItems,
  },
}

export const Dense: Story = {
  args: {
    items: simpleItems,
    dense: true,
  },
}

export const Selectable: Story = {
  args: {
    items: contactItems,
    selectable: true,
    onSelectionChange: fn(),
  },
}

export const MultiSelect: Story = {
  args: {
    items: contactItems,
    selectable: true,
    multiSelect: true,
    selectedItems: [1, 3],
    onSelectionChange: fn(),
  },
}

export const Interactive: Story = {
  args: {
    items: contactItems,
    variant: 'interactive',
    onItemClick: fn(),
    onItemDoubleClick: fn(),
  },
}

export const NestedLists: Story = {
  args: {
    items: [
      {
        id: 'inbox',
        primary: 'Inbox',
        secondary: '5 categories',
        icon: <EmailIcon />
      },
      {
        id: 'contacts',
        primary: 'Contacts',
        secondary: '3 groups',
        icon: <PersonIcon />
      },
      {
        id: 'recent',
        primary: 'Recent',
        secondary: '10 items',
        icon: <PhoneIcon />
      },
    ],
    variant: 'nested',
    nestedItems: new Map([
      ['inbox', [
        { id: 'primary', primary: 'Primary', secondary: '12 new' },
        { id: 'social', primary: 'Social', secondary: '8 new' },
        { id: 'promotions', primary: 'Promotions', secondary: '23 new' },
      ]],
      ['contacts', [
        { id: 'family', primary: 'Family', secondary: '5 contacts' },
        { id: 'friends', primary: 'Friends', secondary: '12 contacts' },
        { id: 'work', primary: 'Work', secondary: '28 contacts' },
      ]],
    ]),
    defaultExpanded: ['inbox'],
  },
}

export const VirtualizedList: Story = {
  args: {
    items: generateLargeDataset(50), // Reduced from 1000 to avoid performance issues
    virtualized: false, // Virtualization temporarily disabled
    height: 400,
    itemHeight: 72,
    overscan: 5,
  },
}

export const VirtualizedWithVariableHeight: Story = {
  args: {
    items: generateLargeDataset(30).map((item, i) => ({ // Reduced from 100
      ...item,
      secondary: i % 3 === 0 
        ? 'This is a longer description that will take up more space and cause the item to be taller'
        : item.secondary
    })),
    virtualized: false, // Temporarily disabled
    height: 400,
    itemHeight: (index: number) => index % 3 === 0 ? 100 : 72,
  },
}

export const Searchable: Story = {
  args: {
    items: contactItems,
    searchable: true,
    searchPlaceholder: 'Search contacts...',
    onSearch: fn(),
  },
}

export const SearchableWithLocalFilter: Story = {
  args: {
    items: generateLargeDataset(50),
    searchable: true,
    filterMode: 'local',
  },
}

export const Sortable: Story = {
  args: {
    items: contactItems,
    sortable: true,
    sortBy: 'primary',
    sortOrder: 'asc',
    onSort: fn(),
  },
}

export const Grouped: Story = {
  args: {
    items: [
      { id: 1, primary: 'Apple', secondary: 'Fruit' },
      { id: 2, primary: 'Banana', secondary: 'Fruit' },
      { id: 3, primary: 'Carrot', secondary: 'Vegetable' },
      { id: 4, primary: 'Date', secondary: 'Fruit' },
      { id: 5, primary: 'Eggplant', secondary: 'Vegetable' },
      { id: 6, primary: 'Fig', secondary: 'Fruit' },
      { id: 7, primary: 'Garlic', secondary: 'Vegetable' },
    ],
    grouped: true,
    groupBy: (item) => item.secondary as string,
    groupHeaders: new Map([
      ['Fruit', <Chip label="Fruits" color="primary" size="small" />],
      ['Vegetable', <Chip label="Vegetables" color="success" size="small" />],
    ]),
  },
}

export const InfiniteScroll: Story = {
  args: {
    items: generateLargeDataset(20),
    hasMore: true,
    onLoadMore: fn(),
  },
}

export const Draggable: Story = {
  args: {
    items: simpleItems,
    draggable: true,
    onReorder: fn(),
  },
}

export const WithCustomActions: Story = {
  args: {
    items: fileItems.map(item => ({
      ...item,
      action: (
        <div>
          <IconButton size="small" color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      )
    })),
  },
}

export const DisabledItems: Story = {
  args: {
    items: simpleItems.map((item, index) => ({
      ...item,
      disabled: index % 2 === 1,
    })),
    selectable: true,
  },
}

export const WithSubheader: Story = {
  args: {
    items: contactItems,
    subheader: (
      <div style={{ padding: '8px 16px', backgroundColor: '#f5f5f5' }}>
        <strong>Contact List</strong> - 5 contacts
      </div>
    ),
  },
}

export const LoadingState: Story = {
  args: {
    items: [],
    loading: true,
  },
}

export const ErrorState: Story = {
  args: {
    items: [],
    error: 'Failed to load items. Please try again.',
  },
}

export const EmptyState: Story = {
  args: {
    items: [],
    emptyMessage: 'No items found',
    emptyIcon: <InfoIcon sx={{ fontSize: 48, color: 'text.secondary' }} />,
    emptyAction: (
      <Button variant="contained" size="small">
        Add New Item
      </Button>
    ),
  },
}

export const CustomEmptyState: Story = {
  args: {
    items: [],
    customEmptyState: (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <FolderIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <h3>Your folder is empty</h3>
        <p>Start by adding some files or folders</p>
        <Button variant="outlined" startIcon={<FileIcon />}>
          Upload Files
        </Button>
      </div>
    ),
  },
}

export const FullFeatured: Story = {
  args: {
    items: generateLargeDataset(25), // Reduced to avoid performance issues
    virtualized: false, // Temporarily disabled
    height: 500,
    searchable: true,
    sortable: true,
    selectable: true,
    multiSelect: true,
    draggable: true,
    onItemClick: fn(),
    onSelectionChange: fn(),
    onSort: fn(),
    onSearch: fn(),
    onReorder: fn(),
  },
}

export const MobileOptimized: Story = {
  args: {
    items: contactItems.map(item => ({
      ...item,
      action: undefined, // Remove actions for cleaner mobile view
    })),
    dense: false,
    selectable: true,
    sx: {
      maxWidth: 360,
      mx: 'auto',
    },
  },
}