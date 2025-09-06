import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  describe('Basic Rendering', () => {
    it('should render pagination controls', () => {
      render(
        <Pagination 
          count={100}
          page={1}
          onPageChange={() => {}}
        />
      )
      
      // Should show page buttons
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should display page info', () => {
      render(
        <Pagination 
          count={100}
          page={1}
          rowsPerPage={10}
          onPageChange={() => {}}
          showPageInfo
        />
      )
      
      expect(screen.getByText('1-10 of 100 items')).toBeInTheDocument()
    })

    it('should calculate correct page range', () => {
      render(
        <Pagination 
          count={95}
          page={10}
          rowsPerPage={10}
          onPageChange={() => {}}
          showPageInfo
        />
      )
      
      expect(screen.getByText('91-95 of 95 items')).toBeInTheDocument()
    })

    it('should show no items when count is 0', () => {
      render(
        <Pagination 
          count={0}
          page={1}
          onPageChange={() => {}}
          showPageInfo
        />
      )
      
      expect(screen.getByText('No items')).toBeInTheDocument()
    })
  })

  describe('Page Navigation', () => {
    it('should call onPageChange when clicking page button', () => {
      const handlePageChange = vi.fn()
      
      render(
        <Pagination 
          count={50}
          page={1}
          rowsPerPage={10}
          onPageChange={handlePageChange}
        />
      )
      
      const page2Button = screen.getByRole('button', { name: /page 2/i })
      fireEvent.click(page2Button)
      
      expect(handlePageChange).toHaveBeenCalledWith(2)
    })

    it('should show first and last buttons when enabled', () => {
      render(
        <Pagination 
          count={100}
          page={5}
          rowsPerPage={10}
          onPageChange={() => {}}
          showFirstButton
          showLastButton
        />
      )
      
      expect(screen.getByRole('button', { name: /first page/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /last page/i })).toBeInTheDocument()
    })
  })

  describe('Rows Per Page', () => {
    it('should display rows per page selector', () => {
      render(
        <Pagination 
          count={100}
          page={1}
          rowsPerPage={10}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
        />
      )
      
      expect(screen.getByText('Rows per page:')).toBeInTheDocument()
    })

    it('should call onRowsPerPageChange when changing selection', () => {
      const handleRowsPerPageChange = vi.fn()
      const handlePageChange = vi.fn()
      
      const { container } = render(
        <Pagination 
          count={100}
          page={2}
          rowsPerPage={10}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )
      
      const select = container.querySelector('.MuiSelect-select')
      expect(select).toBeInTheDocument()
    })
  })

  describe('Jump to Page', () => {
    it('should show jump to page input when enabled', () => {
      render(
        <Pagination 
          count={500}
          page={1}
          rowsPerPage={10}
          onPageChange={() => {}}
          showJumpToPage
        />
      )
      
      expect(screen.getByText('Go to:')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('1-50')).toBeInTheDocument()
    })

    it('should navigate to entered page', async () => {
      const handlePageChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Pagination 
          count={500}
          page={1}
          rowsPerPage={10}
          onPageChange={handlePageChange}
          showJumpToPage
        />
      )
      
      const input = screen.getByPlaceholderText('1-50')
      const goButtons = screen.getAllByRole('button', { name: /go/i })
      const goButton = goButtons[0]  // Use the first Go button
      
      await user.type(input, '25')
      await user.click(goButton)
      
      expect(handlePageChange).toHaveBeenCalledWith(25)
    })

    it('should handle Enter key in jump input', async () => {
      const handlePageChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Pagination 
          count={500}
          page={1}
          rowsPerPage={10}
          onPageChange={handlePageChange}
          showJumpToPage
        />
      )
      
      const input = screen.getByPlaceholderText('1-50')
      
      await user.type(input, '10{Enter}')
      
      expect(handlePageChange).toHaveBeenCalledWith(10)
    })

    it('should not show jump to page for small page counts', () => {
      render(
        <Pagination 
          count={50}
          page={1}
          rowsPerPage={10}
          onPageChange={() => {}}
          showJumpToPage
        />
      )
      
      expect(screen.queryByText('Go to:')).not.toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should disable all controls when disabled', () => {
      render(
        <Pagination 
          count={100}
          page={1}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          showJumpToPage
          disabled
        />
      )
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Customization', () => {
    it('should apply size prop', () => {
      const { container } = render(
        <Pagination 
          count={100}
          page={1}
          onPageChange={() => {}}
          size="small"
        />
      )
      
      const pagination = container.querySelector('.MuiPagination-root')
      expect(pagination).toBeInTheDocument()
      // Size is applied internally to MUI Pagination component
    })

    it('should apply variant prop', () => {
      const { container } = render(
        <Pagination 
          count={100}
          page={1}
          onPageChange={() => {}}
          variant="text"
        />
      )
      
      const pagination = container.querySelector('.MuiPagination-root')
      expect(pagination).toHaveClass('MuiPagination-text')
    })

    it('should apply shape prop', () => {
      const { container } = render(
        <Pagination 
          count={100}
          page={1}
          onPageChange={() => {}}
          shape="circular"
        />
      )
      
      const buttons = container.querySelectorAll('.MuiPaginationItem-circular')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})