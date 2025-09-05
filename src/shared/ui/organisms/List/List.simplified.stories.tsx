import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { List } from './List'
import { ListItemData } from './List.types'
import { Avatar } from '@mui/material'
import { fn } from '@storybook/test'

const meta: Meta<typeof List> = {
  title: 'Organisms/List (Simplified)',
  component: List,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof List>

// Small dataset to avoid performance issues
const smallItems: ListItemData[] = [
  { id: 1, primary: 'Item 1', secondary: 'Description 1' },
  { id: 2, primary: 'Item 2', secondary: 'Description 2' },
  { id: 3, primary: 'Item 3', secondary: 'Description 3' },
  { id: 4, primary: 'Item 4', secondary: 'Description 4' },
  { id: 5, primary: 'Item 5', secondary: 'Description 5' },
]

export const Default: Story = {
  args: {
    items: smallItems,
  },
}

export const WithAvatars: Story = {
  args: {
    items: smallItems.map(item => ({
      ...item,
      avatar: <Avatar>{item.primary[0]}</Avatar>,
    })),
  },
}

export const Selectable: Story = {
  args: {
    items: smallItems,
    selectable: true,
    onSelectionChange: fn(),
  },
}

export const WithSearch: Story = {
  args: {
    items: smallItems,
    searchable: true,
    searchPlaceholder: 'Search items...',
  },
}

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: 'No items to display',
  },
}

export const WithError: Story = {
  args: {
    items: [],
    error: 'Failed to load items',
  },
}

// Small nested items
export const NestedSmall: Story = {
  args: {
    items: [
      { id: 'folder1', primary: 'Folder 1', secondary: '2 items' },
      { id: 'folder2', primary: 'Folder 2', secondary: '1 item' },
    ],
    variant: 'nested',
    nestedItems: new Map([
      ['folder1', [
        { id: 'file1', primary: 'File 1.txt', secondary: '10 KB' },
        { id: 'file2', primary: 'File 2.txt', secondary: '5 KB' },
      ]],
      ['folder2', [
        { id: 'file3', primary: 'File 3.txt', secondary: '8 KB' },
      ]],
    ]),
  },
}

// Medium dataset (20 items)
export const MediumList: Story = {
  args: {
    items: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      primary: `Item ${i + 1}`,
      secondary: `Description for item ${i + 1}`,
    })),
  },
}