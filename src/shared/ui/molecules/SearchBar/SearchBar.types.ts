export interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  suggestions?: string[]
  recentSearches?: string[]
  onSuggestionClick?: (suggestion: string) => void
  onRecentSearchClick?: (search: string) => void
  showClearButton?: boolean
  showSearchButton?: boolean
  autoFocus?: boolean
  disabled?: boolean
  fullWidth?: boolean
  size?: 'small' | 'medium'
  variant?: 'outlined' | 'filled' | 'standard'
  loading?: boolean
  sx?: any
  className?: string
}