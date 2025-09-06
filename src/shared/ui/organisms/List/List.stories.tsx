import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { List } from './List'
import { ListItemData } from './List.types'
import {
  Avatar,
  IconButton,
  Chip,
  Button,
  Box,
  Typography
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
  Info as InfoIcon,
  Add as AddIcon,
  InboxOutlined as InboxIcon
} from '@mui/icons-material'
import { fn } from '@storybook/test'

const meta: Meta<typeof List> = {
  title: 'Organisms/List',
  component: List,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A versatile list component with selection, nesting, search, sorting, and more. Use variant="simple" for basic lists, "interactive" for lists with search/sort/drag, and "nested" for hierarchical data.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['simple', 'interactive', 'nested'],
      description: 'List variant - simple for basic, interactive for advanced features, nested for hierarchy'
    },
    selectable: {
      control: 'boolean',
      description: 'Enable item selection'
    },
    multiSelect: {
      control: 'boolean',
      description: 'Allow multiple selection (requires selectable)'
    },
    searchable: {
      control: 'boolean',
      description: 'Show search bar (only for interactive variant)'
    },
    sortable: {
      control: 'boolean',
      description: 'Enable sorting (only for interactive variant)'
    },
    draggable: {
      control: 'boolean',
      description: 'Enable drag and drop reordering (only for interactive variant)'
    },
    dense: {
      control: 'boolean',
      description: 'Use dense layout'
    },
    divided: {
      control: 'boolean',
      description: 'Show dividers between all items'
    }
  }
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
      <IconButton edge="end" size="small">
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
      <IconButton edge="end" size="small">
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
      <IconButton edge="end" size="small">
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
      <IconButton edge="end" size="small">
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
      <IconButton edge="end" size="small">
        <StarBorderIcon />
      </IconButton>
    )
  },
]

const fileItems: ListItemData[] = [
  { 
    id: 1, 
    primary: 'Documents', 
    secondary: '142 files',
    icon: <FolderIcon color="primary" />
  },
  { 
    id: 2, 
    primary: 'Images', 
    secondary: '892 files',
    icon: <FolderIcon color="primary" />
  },
  { 
    id: 3, 
    primary: 'report.pdf', 
    secondary: '2.3 MB',
    icon: <FileIcon />
  },
  { 
    id: 4, 
    primary: 'presentation.pptx', 
    secondary: '5.1 MB',
    icon: <FileIcon />
  },
  { 
    id: 5, 
    primary: 'spreadsheet.xlsx', 
    secondary: '1.2 MB',
    icon: <FileIcon />
  },
]

// Export individual stories
export const Default: Story = {
  args: {
    items: simpleItems,
  },
}

export const SimpleList: Story = {
  args: {
    items: simpleItems,
    variant: 'simple',
    onItemClick: fn(),
  },
}

export const WithIcons: Story = {
  args: {
    items: fileItems,
    variant: 'simple',
  },
}

export const WithAvatars: Story = {
  args: {
    items: contactItems,
    variant: 'simple',
  },
}

export const Selectable: Story = {
  args: {
    items: simpleItems,
    variant: 'simple',
    selectable: true,
    onSelectionChange: fn(),
  },
}

export const MultiSelect: Story = {
  args: {
    items: contactItems,
    variant: 'simple',
    selectable: true,
    multiSelect: true,
    selectedItems: [1, 3],
    onSelectionChange: fn(),
  },
}

export const Dense: Story = {
  args: {
    items: simpleItems,
    variant: 'simple',
    dense: true,
  },
}

export const Divided: Story = {
  args: {
    items: simpleItems,
    variant: 'simple',
    divided: true,
  },
}

export const InteractiveList: Story = {
  args: {
    items: contactItems,
    variant: 'interactive',
    searchable: true,
    sortable: true,
    selectable: true,
    multiSelect: true,
    onSelectionChange: fn(),
    onSearch: fn(),
    onSort: fn(),
  },
}

export const SearchableList: Story = {
  args: {
    items: contactItems,
    variant: 'interactive',
    searchable: true,
    searchPlaceholder: 'Search contacts...',
    onSearch: fn(),
  },
}

export const SortableList: Story = {
  args: {
    items: simpleItems,
    variant: 'interactive',
    sortable: true,
    sortBy: 'primary',
    sortOrder: 'asc',
    onSort: fn(),
  },
}

export const DraggableList: Story = {
  args: {
    items: simpleItems,
    variant: 'interactive',
    draggable: true,
    onReorder: fn(),
  },
}

export const NestedList: Story = {
  args: {
    items: [
      { id: 'inbox', primary: 'Inbox', secondary: '12 new', icon: <EmailIcon /> },
      { id: 'contacts', primary: 'Contacts', secondary: '5 groups', icon: <PersonIcon /> },
      { id: 'recent', primary: 'Recent', secondary: '10 calls', icon: <PhoneIcon /> },
    ],
    variant: 'nested',
    nestedItems: new Map([
      ['inbox', [
        { id: 'inbox-1', primary: 'Meeting notes', secondary: 'From John' },
        { id: 'inbox-2', primary: 'Project update', secondary: 'From Sarah' },
        { id: 'inbox-3', primary: 'Invoice', secondary: 'From Accounting' },
      ]],
      ['contacts', [
        { id: 'contacts-1', primary: 'Family', secondary: '8 contacts' },
        { id: 'contacts-2', primary: 'Work', secondary: '45 contacts' },
        { id: 'contacts-3', primary: 'Friends', secondary: '12 contacts' },
      ]],
    ]),
    defaultExpanded: ['inbox'],
    onExpandChange: fn(),
  },
}

export const GroupedList: Story = {
  args: {
    items: [
      { id: 1, primary: 'Apple', secondary: 'Fruit', data: { category: 'Fruits' } },
      { id: 2, primary: 'Banana', secondary: 'Fruit', data: { category: 'Fruits' } },
      { id: 3, primary: 'Carrot', secondary: 'Vegetable', data: { category: 'Vegetables' } },
      { id: 4, primary: 'Broccoli', secondary: 'Vegetable', data: { category: 'Vegetables' } },
      { id: 5, primary: 'Milk', secondary: 'Dairy', data: { category: 'Dairy' } },
      { id: 6, primary: 'Cheese', secondary: 'Dairy', data: { category: 'Dairy' } },
    ],
    grouped: true,
    groupBy: (item) => item.data?.category || 'Other',
    groupHeaders: new Map([
      ['Fruits', <Typography variant="subtitle2" color="primary">Fresh Fruits</Typography>],
      ['Vegetables', <Typography variant="subtitle2" color="success.main">Vegetables</Typography>],
      ['Dairy', <Typography variant="subtitle2" color="info.main">Dairy Products</Typography>],
    ]),
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
    emptyIcon: <InboxIcon sx={{ fontSize: 48, color: 'text.disabled' }} />,
    emptyAction: (
      <Button variant="contained" startIcon={<AddIcon />}>
        Add Item
      </Button>
    ),
  },
}

export const CustomEmptyState: Story = {
  args: {
    items: [],
    renderEmpty: (
      <Box textAlign="center" py={4}>
        <InboxIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Your inbox is empty
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          When you receive messages, they'll appear here
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />}>
          Compose Message
        </Button>
      </Box>
    ),
  },
}

export const InfiniteScroll: Story = {
  args: {
    items: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      primary: `Item ${i + 1}`,
      secondary: `Description for item ${i + 1}`,
    })),
    hasMore: true,
    loadingMore: false,
    onLoadMore: fn(),
  },
}

export const DisabledItems: Story = {
  args: {
    items: simpleItems.map((item, index) => ({
      ...item,
      disabled: index % 2 === 0,
    })),
    selectable: true,
  },
}

export const CustomItemRenderer: Story = {
  args: {
    items: contactItems,
    renderItem: (item) => (
      <Box
        key={item.id}
        sx={{
          p: 2,
          mb: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          {item.avatar}
          <Box flex={1}>
            <Typography variant="subtitle1">{item.primary}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.secondary}
            </Typography>
          </Box>
          {item.action}
        </Box>
      </Box>
    ),
  },
}

export const CompleteExample: Story = {
  args: {
    items: contactItems,
    variant: 'interactive',
    searchable: true,
    sortable: true,
    selectable: true,
    multiSelect: true,
    draggable: true,
    dense: false,
    divided: true,
    searchPlaceholder: 'Search contacts...',
    emptyMessage: 'No contacts found',
    emptyIcon: <PersonIcon sx={{ fontSize: 48 }} />,
    onSelectionChange: fn(),
    onItemClick: fn(),
    onItemDoubleClick: fn(),
    onSearch: fn(),
    onSort: fn(),
    onReorder: fn(),
  },
}