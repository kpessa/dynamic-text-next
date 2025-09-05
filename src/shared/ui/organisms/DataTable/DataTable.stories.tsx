import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from './DataTable'
import { DataTableColumn } from './DataTable.types'
import { fn } from '@storybook/test'
import { Chip, IconButton } from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

const meta: Meta<typeof DataTable> = {
  title: 'Organisms/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A high-performance data table built with TanStack Table and Material UI components. Features sorting, filtering, pagination, row selection, and more.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataTable>

// Sample data types
interface Person {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
}

// Generate sample data
const generateData = (count: number): Person[] => {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']
  const roles = ['Manager', 'Developer', 'Designer', 'Analyst', 'Coordinator']
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `person-${i + 1}`,
    name: `Person ${i + 1}`,
    email: `person${i + 1}@example.com`,
    role: roles[i % roles.length],
    department: departments[i % departments.length],
    status: statuses[i % statuses.length],
    joinDate: new Date(2020 + Math.floor(i / 50), i % 12, (i % 28) + 1).toISOString().split('T')[0]
  }))
}

// Basic columns
const basicColumns: DataTableColumn<Person>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: 'includesString',
  },
  {
    id: 'department',
    accessorKey: 'department',
    header: 'Department',
    enableSorting: true,
    enableColumnFilter: true,
  },
]

// Advanced columns with custom rendering
const advancedColumns: DataTableColumn<Person>[] = [
  ...basicColumns,
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue }) => {
      const status = getValue() as string
      const color = status === 'active' ? 'success' : status === 'inactive' ? 'default' : 'warning'
      return <Chip label={status} color={color} size="small" />
    },
  },
  {
    id: 'joinDate',
    accessorKey: 'joinDate',
    header: 'Join Date',
    enableSorting: true,
    cell: ({ getValue }) => {
      const date = getValue() as string
      return new Date(date).toLocaleDateString()
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <IconButton size="small" onClick={() => console.log('Edit', row.original)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => console.log('Delete', row.original)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
    ),
  },
]

// Small dataset for basic testing
const smallData = generateData(5)

// Medium dataset
const mediumData = generateData(25)

// Export columns for CSV
const exportColumns = ['name', 'email', 'role', 'department', 'status', 'joinDate']

export const Default: Story = {
  args: {
    data: smallData,
    columns: basicColumns,
  },
}

export const WithAllFeatures: Story = {
  args: {
    data: mediumData,
    columns: advancedColumns,
    enableRowSelection: true,
    enableColumnVisibility: true,
    enableGlobalFilter: true,
    enableExport: true,
    exportColumns,
    title: 'Employee Directory',
    onRowClick: fn(),
    onSelectionChange: fn(),
    onExport: fn(),
  },
}

export const WithPagination: Story = {
  args: {
    data: generateData(50),
    columns: basicColumns,
    enablePagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  },
}

export const WithSorting: Story = {
  args: {
    data: mediumData,
    columns: basicColumns,
    enableSorting: true,
    initialSorting: [{ id: 'name', desc: false }],
  },
}

export const WithFiltering: Story = {
  args: {
    data: mediumData,
    columns: basicColumns,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    globalFilterPlaceholder: 'Search employees...',
  },
}

export const WithRowSelection: Story = {
  args: {
    data: mediumData,
    columns: basicColumns,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onSelectionChange: fn(),
  },
}

export const SingleRowSelection: Story = {
  args: {
    data: smallData,
    columns: basicColumns,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onSelectionChange: fn(),
  },
}

export const WithActions: Story = {
  args: {
    data: smallData,
    columns: advancedColumns,
    enableRowSelection: true,
    actions: [
      {
        label: 'Delete Selected',
        onClick: fn(),
        disabled: false,
        color: 'error',
      },
      {
        label: 'Export',
        onClick: fn(),
        disabled: false,
      },
    ],
  },
}

export const Striped: Story = {
  args: {
    data: mediumData,
    columns: basicColumns,
    striped: true,
  },
}

export const Bordered: Story = {
  args: {
    data: smallData,
    columns: basicColumns,
    bordered: true,
  },
}

export const Dense: Story = {
  args: {
    data: mediumData,
    columns: basicColumns,
    size: 'small',
    enablePagination: true,
  },
}

export const WithStickyHeader: Story = {
  args: {
    data: generateData(100),
    columns: basicColumns,
    stickyHeader: true,
    maxHeight: 400,
    enablePagination: true,
  },
}

export const LoadingState: Story = {
  args: {
    data: [],
    columns: basicColumns,
    loading: true,
  },
}

export const EmptyState: Story = {
  args: {
    data: [],
    columns: basicColumns,
    emptyMessage: 'No employees found',
  },
}

export const CustomEmptyState: Story = {
  args: {
    data: [],
    columns: basicColumns,
    emptyState: (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h3>No Data Available</h3>
        <p>Start by adding some employees to the directory</p>
      </div>
    ),
  },
}

export const ManualPagination: Story = {
  args: {
    data: smallData,
    columns: basicColumns,
    manualPagination: true,
    pageCount: 10,
    onPaginationChange: fn(),
  },
}

export const ManualSorting: Story = {
  args: {
    data: smallData,
    columns: basicColumns,
    manualSorting: true,
    onSortingChange: fn(),
  },
}

export const ManualFiltering: Story = {
  args: {
    data: smallData,
    columns: basicColumns,
    manualFiltering: true,
    enableGlobalFilter: true,
    onGlobalFilterChange: fn(),
    onColumnFiltersChange: fn(),
  },
}

export const WithColumnVisibility: Story = {
  args: {
    data: mediumData,
    columns: advancedColumns,
    enableColumnVisibility: true,
    initialColumnVisibility: {
      joinDate: false,
    },
  },
}

export const ResponsiveColumns: Story = {
  args: {
    data: mediumData,
    columns: [
      ...basicColumns.map(col => ({
        ...col,
        minSize: 100,
        maxSize: 300,
      })),
    ],
  },
}

export const WithCustomStyles: Story = {
  args: {
    data: smallData,
    columns: basicColumns,
    sx: {
      '& .MuiTableRow-root:hover': {
        backgroundColor: 'action.hover',
      },
      '& .MuiTableCell-head': {
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
      },
    },
  },
}

export const WithRowClick: Story = {
  args: {
    data: smallData,
    columns: basicColumns,
    onRowClick: fn(),
    sx: {
      '& tbody tr': {
        cursor: 'pointer',
      },
    },
  },
}

export const FullFeatured: Story = {
  args: {
    data: generateData(100),
    columns: advancedColumns,
    title: 'Complete DataTable Example',
    enableRowSelection: true,
    enableColumnVisibility: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableSorting: true,
    enablePagination: true,
    enableExport: true,
    exportColumns,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    striped: true,
    stickyHeader: true,
    maxHeight: 600,
    actions: [
      {
        label: 'Add New',
        onClick: fn(),
        color: 'primary',
      },
      {
        label: 'Delete Selected',
        onClick: fn(),
        color: 'error',
        disabled: false,
      },
    ],
    onRowClick: fn(),
    onSelectionChange: fn(),
    onExport: fn(),
  },
}