import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './Pagination'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'

const meta = {
  title: 'Molecules/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Pagination molecule provides navigation controls for paginated data with page size selection and jump to page functionality.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: 'number',
      description: 'Total number of items'
    },
    page: {
      control: 'number',
      description: 'Current page number (1-indexed)'
    },
    rowsPerPage: {
      control: 'number',
      description: 'Number of items per page'
    },
    rowsPerPageOptions: {
      control: 'object',
      description: 'Available options for rows per page'
    },
    showFirstButton: {
      control: 'boolean',
      description: 'Show first page button'
    },
    showLastButton: {
      control: 'boolean',
      description: 'Show last page button'
    },
    showPageInfo: {
      control: 'boolean',
      description: 'Show page information text'
    },
    showJumpToPage: {
      control: 'boolean',
      description: 'Show jump to page input'
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of pagination buttons'
    },
    variant: {
      control: 'select',
      options: ['text', 'outlined'],
      description: 'Visual variant of pagination'
    },
    shape: {
      control: 'select',
      options: ['circular', 'rounded'],
      description: 'Shape of pagination buttons'
    }
  }
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    
    return (
      <Pagination
        count={100}
        page={page}
        onPageChange={setPage}
      />
    )
  }
}

export const WithRowsPerPage: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    
    return (
      <Pagination
        count={250}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    )
  }
}

export const WithJumpToPage: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    
    return (
      <Pagination
        count={1000}
        page={page}
        onPageChange={setPage}
        showJumpToPage
      />
    )
  }
}

export const Complete: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    
    return (
      <Pagination
        count={500}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        showFirstButton
        showLastButton
        showPageInfo
        showJumpToPage
      />
    )
  }
}

export const Sizes: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    
    return (
      <Stack spacing={3}>
        <Pagination
          count={50}
          page={page}
          onPageChange={setPage}
          size="small"
        />
        <Pagination
          count={50}
          page={page}
          onPageChange={setPage}
          size="medium"
        />
        <Pagination
          count={50}
          page={page}
          onPageChange={setPage}
          size="large"
        />
      </Stack>
    )
  }
}

export const Variants: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    
    return (
      <Stack spacing={3}>
        <Pagination
          count={50}
          page={page}
          onPageChange={setPage}
          variant="text"
        />
        <Pagination
          count={50}
          page={page}
          onPageChange={setPage}
          variant="outlined"
        />
      </Stack>
    )
  }
}

export const Shapes: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    
    return (
      <Stack spacing={3}>
        <Pagination
          count={50}
          page={page}
          onPageChange={setPage}
          shape="rounded"
        />
        <Pagination
          count={50}
          page={page}
          onPageChange={setPage}
          shape="circular"
        />
      </Stack>
    )
  }
}

export const DataTableExample: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    
    // Mock data
    const allData = Array.from({ length: 47 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`
    }))
    
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentData = allData.slice(startIndex, endIndex)
    
    return (
      <Stack spacing={2} sx={{ width: 600 }}>
        <Paper>
          <List>
            {currentData.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={item.name}
                    secondary={item.description}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
        
        <Pagination
          count={allData.length}
          page={page}
          onPageChange={setPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          showPageInfo
        />
      </Stack>
    )
  }
}

export const SmallDataSet: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    
    return (
      <Stack spacing={2}>
        <Typography variant="body2">
          Small dataset (20 items)
        </Typography>
        <Pagination
          count={20}
          page={page}
          onPageChange={setPage}
          rowsPerPage={10}
          showPageInfo
        />
      </Stack>
    )
  }
}

export const LargeDataSet: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    
    return (
      <Stack spacing={2}>
        <Typography variant="body2">
          Large dataset (10,000 items)
        </Typography>
        <Pagination
          count={10000}
          page={page}
          onPageChange={setPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          rowsPerPageOptions={[25, 50, 100, 250]}
          showFirstButton
          showLastButton
          showPageInfo
          showJumpToPage
          boundaryCount={2}
          siblingCount={1}
        />
      </Stack>
    )
  }
}

export const Disabled: Story = {
  render: () => {
    return (
      <Pagination
        count={100}
        page={1}
        onPageChange={() => {}}
        disabled
        showPageInfo
      />
    )
  }
}

export const InteractivePlayground: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    
    return (
      <Pagination
        count={250}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        showFirstButton={true}
        showLastButton={true}
        showPageInfo={true}
        showJumpToPage={true}
        disabled={false}
        size="medium"
        variant="outlined"
        shape="rounded"
        color="primary"
        boundaryCount={1}
        siblingCount={1}
      />
    )
  }
}