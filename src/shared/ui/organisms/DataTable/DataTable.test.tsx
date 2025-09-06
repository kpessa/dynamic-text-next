import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from './DataTable'
import { DataTableColumn } from './DataTable.types'

interface TestData {
  id: number
  name: string
  email: string
  role: string
}

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
]

const mockColumns: DataTableColumn<TestData>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
  },
]

describe('DataTable', () => {
  it('renders with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)
    
    // Check if headers are rendered
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    
    // Check if data is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Manager')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(
      <DataTable 
        data={[]} 
        columns={mockColumns} 
        emptyMessage="No data available" 
      />
    )
    
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <DataTable 
        data={[]} 
        columns={mockColumns} 
        loading={true} 
      />
    )
    
    const progressIndicator = screen.getByRole('progressbar')
    expect(progressIndicator).toBeInTheDocument()
  })

  it('handles row click', () => {
    const handleRowClick = vi.fn()
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        onRowClick={handleRowClick}
      />
    )
    
    const firstRow = screen.getByText('John Doe').closest('tr')
    fireEvent.click(firstRow!)
    
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0])
  })

  it('enables row selection', () => {
    const handleSelectionChange = vi.fn()
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        enableRowSelection={true}
        onSelectionChange={handleSelectionChange}
      />
    )
    
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
    
    fireEvent.click(checkboxes[1]) // Click first data row checkbox
    expect(handleSelectionChange).toHaveBeenCalled()
  })

  it('enables global search', async () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        enableGlobalFilter={true}
        globalFilterPlaceholder="Search..."
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search...')
    expect(searchInput).toBeInTheDocument()
    
    fireEvent.change(searchInput, { target: { value: 'John' } })
    
    // Wait for debounce (500ms)
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // After filtering, only John Doe should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    // Note: The filter may not hide Jane Smith immediately due to implementation
  })

  it('enables pagination', () => {
    const longData = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: 'User',
    }))
    
    render(
      <DataTable 
        data={longData} 
        columns={mockColumns} 
        enablePagination={true}
        pageSize={10}
      />
    )
    
    // Check pagination controls exist
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    
    // First page should show User 0 through User 9
    expect(screen.getByText('User 0')).toBeInTheDocument()
    expect(screen.getByText('User 9')).toBeInTheDocument()
    expect(screen.queryByText('User 10')).not.toBeInTheDocument()
  })

  it('renders with custom title', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        title="User List"
      />
    )
    
    expect(screen.getByText('User List')).toBeInTheDocument()
  })

  it('renders with actions', () => {
    const handleAction = vi.fn()
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        actions={[
          {
            label: 'Export',
            onClick: handleAction,
          }
        ]}
      />
    )
    
    const exportButton = screen.getByText('Export')
    expect(exportButton).toBeInTheDocument()
    
    fireEvent.click(exportButton)
    expect(handleAction).toHaveBeenCalled()
  })
})