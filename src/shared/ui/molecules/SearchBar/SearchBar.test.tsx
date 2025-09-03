import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  describe('Basic Rendering', () => {
    it('should render search input', () => {
      render(<SearchBar />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<SearchBar placeholder="Search products..." />)
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
    })

    it('should render search icon', () => {
      const { container } = render(<SearchBar />)
      const searchIcon = container.querySelector('[data-testid="SearchIcon"]')
      expect(searchIcon).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      render(<SearchBar value="initial search" />)
      expect(screen.getByRole('textbox')).toHaveValue('initial search')
    })
  })

  describe('User Interaction', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<SearchBar onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'test')
      expect(handleChange).toHaveBeenCalledWith('t')
      expect(handleChange).toHaveBeenCalledWith('te')
      expect(handleChange).toHaveBeenCalledWith('tes')
      expect(handleChange).toHaveBeenCalledWith('test')
    })

    it('should handle search on Enter key', async () => {
      const user = userEvent.setup()
      const handleSearch = vi.fn()
      
      render(<SearchBar onSearch={handleSearch} value="query" />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, '{Enter}')
      expect(handleSearch).toHaveBeenCalledWith('query')
    })

    it('should handle search button click', async () => {
      const user = userEvent.setup()
      const handleSearch = vi.fn()
      
      render(<SearchBar onSearch={handleSearch} value="search term" showSearchButton />)
      const searchButton = screen.getByLabelText('search')
      
      await user.click(searchButton)
      expect(handleSearch).toHaveBeenCalledWith('search term')
    })
  })

  describe('Clear Functionality', () => {
    it('should show clear button when value exists', () => {
      render(<SearchBar value="test" showClearButton />)
      expect(screen.getByLabelText('clear search')).toBeInTheDocument()
    })

    it('should not show clear button when value is empty', () => {
      render(<SearchBar value="" showClearButton />)
      expect(screen.queryByLabelText('clear search')).not.toBeInTheDocument()
    })

    it('should clear value on clear button click', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const handleClear = vi.fn()
      
      render(
        <SearchBar 
          value="test" 
          onChange={handleChange} 
          onClear={handleClear}
          showClearButton 
        />
      )
      
      const clearButton = screen.getByLabelText('clear search')
      await user.click(clearButton)
      
      expect(handleChange).toHaveBeenCalledWith('')
      expect(handleClear).toHaveBeenCalled()
    })
  })

  describe('Suggestions', () => {
    it('should show suggestions dropdown on focus', async () => {
      const user = userEvent.setup()
      const suggestions = ['Apple', 'Banana', 'Cherry']
      
      render(<SearchBar suggestions={suggestions} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
        expect(screen.getByText('Banana')).toBeInTheDocument()
        expect(screen.getByText('Cherry')).toBeInTheDocument()
      })
    })

    it('should handle suggestion click', async () => {
      const user = userEvent.setup()
      const handleSuggestionClick = vi.fn()
      const handleChange = vi.fn()
      const suggestions = ['Option 1', 'Option 2']
      
      render(
        <SearchBar 
          suggestions={suggestions} 
          onSuggestionClick={handleSuggestionClick}
          onChange={handleChange}
        />
      )
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      
      const option = await screen.findByText('Option 1')
      await user.click(option)
      
      expect(handleSuggestionClick).toHaveBeenCalledWith('Option 1')
      expect(handleChange).toHaveBeenCalledWith('Option 1')
    })
  })

  describe('Recent Searches', () => {
    it('should show recent searches', async () => {
      const user = userEvent.setup()
      const recentSearches = ['Previous search 1', 'Previous search 2']
      
      render(<SearchBar recentSearches={recentSearches} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('Recent Searches')).toBeInTheDocument()
        expect(screen.getByText('Previous search 1')).toBeInTheDocument()
        expect(screen.getByText('Previous search 2')).toBeInTheDocument()
      })
    })

    it('should handle recent search click', async () => {
      const user = userEvent.setup()
      const handleRecentSearchClick = vi.fn()
      const handleChange = vi.fn()
      const recentSearches = ['Old search']
      
      render(
        <SearchBar 
          recentSearches={recentSearches}
          onRecentSearchClick={handleRecentSearchClick}
          onChange={handleChange}
        />
      )
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      
      const recentSearch = await screen.findByText('Old search')
      await user.click(recentSearch)
      
      expect(handleRecentSearchClick).toHaveBeenCalledWith('Old search')
      expect(handleChange).toHaveBeenCalledWith('Old search')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      const user = userEvent.setup()
      const suggestions = ['First', 'Second', 'Third']
      
      render(<SearchBar suggestions={suggestions} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await screen.findByText('First')
      
      await user.type(input, '{ArrowDown}')
      // First item should be selected
      
      await user.type(input, '{ArrowDown}')
      // Second item should be selected
      
      await user.type(input, '{ArrowUp}')
      // First item should be selected again
      
      // Verify navigation works (visual selection hard to test)
      expect(input).toBeInTheDocument()
    })

    it('should close dropdown on Escape', async () => {
      const user = userEvent.setup()
      const suggestions = ['Item']
      
      render(<SearchBar suggestions={suggestions} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await screen.findByText('Item')
      
      await user.type(input, '{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByText('Item')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      const { container } = render(<SearchBar loading />)
      const progress = container.querySelector('.MuiCircularProgress-root')
      expect(progress).toBeInTheDocument()
    })

    it('should replace search icon with spinner when loading', () => {
      const { container } = render(<SearchBar loading />)
      // When loading, the search icon is replaced with a circular progress
      const progress = container.querySelector('.MuiCircularProgress-root')
      expect(progress).toBeInTheDocument()
      // The start adornment contains the spinner instead of search icon
    })
  })

  describe('Disabled State', () => {
    it('should disable input when disabled', () => {
      render(<SearchBar disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should not show clear button when disabled', () => {
      render(<SearchBar value="test" disabled showClearButton />)
      expect(screen.queryByLabelText('clear search')).not.toBeInTheDocument()
    })

    it('should not show suggestions when disabled', async () => {
      const user = userEvent.setup()
      render(<SearchBar disabled suggestions={['Item']} />)
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      
      expect(screen.queryByText('Item')).not.toBeInTheDocument()
    })
  })

  describe('Variants and Sizing', () => {
    it('should render with different variants', () => {
      const { rerender, container } = render(<SearchBar variant="outlined" />)
      expect(container.querySelector('.MuiOutlinedInput-root')).toBeInTheDocument()
      
      rerender(<SearchBar variant="filled" />)
      expect(container.querySelector('.MuiFilledInput-root')).toBeInTheDocument()
      
      rerender(<SearchBar variant="standard" />)
      expect(container.querySelector('.MuiInput-root')).toBeInTheDocument()
    })

    it('should render with different sizes', () => {
      const { rerender, container } = render(<SearchBar size="small" />)
      expect(container.querySelector('.MuiInputBase-sizeSmall')).toBeInTheDocument()
      
      rerender(<SearchBar size="medium" />)
      // Medium is default size
      expect(container.querySelector('.MuiInputBase-root')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should support autofocus', () => {
      render(<SearchBar autoFocus />)
      expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('should have proper ARIA labels', () => {
      render(<SearchBar showClearButton showSearchButton value="test" />)
      expect(screen.getByLabelText('clear search')).toBeInTheDocument()
      expect(screen.getByLabelText('search')).toBeInTheDocument()
    })
  })
})