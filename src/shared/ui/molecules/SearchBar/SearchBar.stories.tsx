import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from './SearchBar'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'

const meta = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'SearchBar molecule provides a complete search experience with suggestions, recent searches, and keyboard navigation.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input'
    },
    value: {
      control: 'text',
      description: 'Controlled value of the search input'
    },
    suggestions: {
      control: 'object',
      description: 'Array of search suggestions'
    },
    recentSearches: {
      control: 'object',
      description: 'Array of recent search terms'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the search bar'
    },
    showClearButton: {
      control: 'boolean',
      description: 'Show clear button when there is text'
    },
    showSearchButton: {
      control: 'boolean',
      description: 'Show search button'
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Size of the search bar'
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
      description: 'Visual variant of the search bar'
    }
  }
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Search...',
    showClearButton: true,
    showSearchButton: true
  }
}

export const WithSuggestions: Story = {
  args: {
    placeholder: 'Search products...',
    suggestions: [
      'Apple iPhone 15',
      'Samsung Galaxy S24',
      'Google Pixel 8',
      'OnePlus 12',
      'Xiaomi 14'
    ]
  }
}

export const WithRecentSearches: Story = {
  args: {
    placeholder: 'Search...',
    recentSearches: [
      'JavaScript tutorial',
      'React best practices',
      'TypeScript guide',
      'Material UI components'
    ]
  }
}

export const WithBoth: Story = {
  args: {
    placeholder: 'Search documentation...',
    suggestions: [
      'Getting Started',
      'API Reference',
      'Components Guide',
      'Troubleshooting'
    ],
    recentSearches: [
      'Installation',
      'Configuration',
      'Examples'
    ]
  }
}

export const Loading: Story = {
  args: {
    placeholder: 'Searching...',
    loading: true,
    value: 'React'
  }
}

export const Disabled: Story = {
  args: {
    placeholder: 'Search disabled',
    disabled: true,
    value: 'Cannot edit'
  }
}

export const Variants: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <SearchBar
        variant="outlined"
        placeholder="Outlined variant"
      />
      <SearchBar
        variant="filled"
        placeholder="Filled variant"
      />
      <SearchBar
        variant="standard"
        placeholder="Standard variant"
      />
    </Stack>
  )
}

export const Sizes: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <SearchBar
        size="small"
        placeholder="Small size"
      />
      <SearchBar
        size="medium"
        placeholder="Medium size (default)"
      />
    </Stack>
  )
}

export const LiveSearch: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const [results, setResults] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    
    const mockData = [
      'React Components',
      'React Hooks',
      'React Router',
      'Redux Toolkit',
      'Material UI',
      'Tailwind CSS',
      'TypeScript',
      'JavaScript',
      'Node.js',
      'Next.js'
    ]
    
    const handleChange = (newValue: string) => {
      setValue(newValue)
      setLoading(true)
      
      // Simulate API call
      setTimeout(() => {
        if (newValue) {
          const filtered = mockData.filter(item =>
            item.toLowerCase().includes(newValue.toLowerCase())
          )
          setResults(filtered)
        } else {
          setResults([])
        }
        setLoading(false)
      }, 300)
    }
    
    return (
      <Stack spacing={2} sx={{ width: 400 }}>
        <SearchBar
          value={value}
          onChange={handleChange}
          suggestions={results}
          loading={loading}
          placeholder="Search technologies..."
        />
        {value && !loading && (
          <Typography variant="body2" color="text.secondary">
            Found {results.length} results for "{value}"
          </Typography>
        )}
      </Stack>
    )
  }
}

export const WithSearchHistory: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const [recentSearches, setRecentSearches] = useState<string[]>([
      'Previous search 1',
      'Previous search 2',
      'Previous search 3'
    ])
    
    const handleSearch = (searchTerm: string) => {
      if (searchTerm && !recentSearches.includes(searchTerm)) {
        setRecentSearches(prev => [searchTerm, ...prev.slice(0, 4)])
      }
      alert(`Searching for: ${searchTerm}`)
    }
    
    const handleRecentSearchClick = (search: string) => {
      setValue(search)
      handleSearch(search)
    }
    
    return (
      <Stack spacing={3} sx={{ width: 400 }}>
        <SearchBar
          value={value}
          onChange={setValue}
          onSearch={handleSearch}
          recentSearches={recentSearches}
          onRecentSearchClick={handleRecentSearchClick}
          placeholder="Search with history..."
        />
        
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Search History
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {recentSearches.map((search, index) => (
              <Chip
                key={index}
                label={search}
                size="small"
                onClick={() => handleRecentSearchClick(search)}
              />
            ))}
          </Stack>
        </Paper>
      </Stack>
    )
  }
}

export const ProductSearch: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    
    const products = [
      { id: 1, name: 'MacBook Pro', category: 'Laptops', price: '$2,399' },
      { id: 2, name: 'iPad Pro', category: 'Tablets', price: '$1,099' },
      { id: 3, name: 'iPhone 15 Pro', category: 'Phones', price: '$999' },
      { id: 4, name: 'AirPods Pro', category: 'Audio', price: '$249' },
      { id: 5, name: 'Apple Watch', category: 'Wearables', price: '$399' }
    ]
    
    const suggestions = products.map(p => p.name)
    const recentSearches = ['iPhone', 'MacBook', 'iPad']
    
    const handleSearch = (searchTerm: string) => {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(results)
    }
    
    return (
      <Stack spacing={3} sx={{ width: 500 }}>
        <SearchBar
          value={value}
          onChange={setValue}
          onSearch={handleSearch}
          suggestions={value ? suggestions.filter(s =>
            s.toLowerCase().includes(value.toLowerCase())
          ) : []}
          recentSearches={!value ? recentSearches : []}
          placeholder="Search products..."
        />
        
        {searchResults.length > 0 && (
          <Paper>
            <List>
              {searchResults.map(product => (
                <ListItem key={product.id}>
                  <ListItemText
                    primary={product.name}
                    secondary={`${product.category} • ${product.price}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
    )
  }
}

export const CustomActions: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const [log, setLog] = useState<string[]>([])
    
    const addLog = (message: string) => {
      setLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 4)])
    }
    
    return (
      <Stack spacing={3} sx={{ width: 400 }}>
        <SearchBar
          value={value}
          onChange={(v) => {
            setValue(v)
            addLog(`Changed to: "${v}"`)
          }}
          onSearch={(v) => addLog(`Searched: "${v}"`)}
          onClear={() => addLog('Cleared search')}
          onSuggestionClick={(s) => addLog(`Clicked suggestion: "${s}"`)}
          onRecentSearchClick={(r) => addLog(`Clicked recent: "${r}"`)}
          suggestions={['Suggestion 1', 'Suggestion 2']}
          recentSearches={['Recent 1', 'Recent 2']}
          placeholder="Try different actions..."
        />
        
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Action Log
          </Typography>
          <List dense>
            {log.map((entry, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={entry}
                  primaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Stack>
    )
  }
}

export const InteractivePlayground: Story = {
  args: {
    placeholder: 'Search anything...',
    showClearButton: true,
    showSearchButton: true,
    suggestions: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
    recentSearches: ['Last search', 'Previous search'],
    loading: false,
    disabled: false,
    size: 'medium',
    variant: 'outlined',
    autoFocus: false,
    fullWidth: true
  }
}