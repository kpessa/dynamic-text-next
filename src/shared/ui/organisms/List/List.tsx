import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  List as MuiList,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListSubheader,
  Checkbox,
  Collapse,
  IconButton,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  Paper,
  Chip,
  Divider
} from '@mui/material'
import {
  ExpandLess,
  ExpandMore,
  Search as SearchIcon,
  Clear as ClearIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material'
import { ListProps, ListItemData } from './List.types'

export function List<T = any>({
  items,
  loading = false,
  error = null,
  
  // Display
  variant = 'simple',
  dense = false,
  disablePadding = false,
  divided = false,
  
  // Selection
  selectable = false,
  multiSelect = false,
  selectedItems = [],
  onSelectionChange,
  
  // Interaction
  onItemClick,
  onItemDoubleClick,
  
  // Nested Items
  nestedItems,
  defaultExpanded = [],
  onExpandChange,
  
  // Empty State
  emptyMessage = 'No items to display',
  emptyIcon,
  emptyAction,
  
  // Styling
  sx,
  itemSx,
  subheader,
  
  // Search (only for interactive variant)
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  
  // Sorting (only for interactive variant)
  sortable = false,
  sortBy = 'primary',
  sortOrder = 'asc',
  onSort,
  
  // Grouping
  grouped = false,
  groupBy,
  groupHeaders,
  
  // Infinite Scroll
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  
  // Drag and Drop (only for interactive variant)
  draggable = false,
  onReorder,
  
  // Custom Rendering
  renderItem,
  renderEmpty,
  renderLoading
}: ListProps<T>) {
  // State management
  const [selectedSet, setSelectedSet] = useState<Set<string | number>>(
    new Set(selectedItems)
  )
  const [expandedSet, setExpandedSet] = useState<Set<string | number>>(
    new Set(defaultExpanded)
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  const observerTarget = useRef<HTMLDivElement>(null)
  
  // Determine if interactive features are enabled
  const isInteractive = variant === 'interactive'
  const showSearch = isInteractive && searchable
  const showSort = isInteractive && sortable
  const showDrag = isInteractive && draggable
  
  // Update selected set when prop changes
  useEffect(() => {
    setSelectedSet(new Set(selectedItems))
  }, [selectedItems])
  
  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!showSearch || !searchQuery.trim()) {
      return items
    }
    
    const query = searchQuery.toLowerCase()
    return items.filter(item => {
      const primary = String(item.primary || '').toLowerCase()
      const secondary = String(item.secondary || '').toLowerCase()
      return primary.includes(query) || secondary.includes(query)
    })
  }, [items, showSearch, searchQuery])
  
  // Sort items
  const sortedItems = useMemo(() => {
    if (!showSort) return filteredItems
    
    const sorted = [...filteredItems]
    sorted.sort((a, b) => {
      const aValue = sortBy === 'primary' ? a.primary : a.secondary
      const bValue = sortBy === 'primary' ? b.primary : b.secondary
      const comparison = String(aValue || '').localeCompare(String(bValue || ''))
      return localSortOrder === 'asc' ? comparison : -comparison
    })
    
    return sorted
  }, [filteredItems, showSort, sortBy, localSortOrder])
  
  // Group items if needed
  const groupedItems = useMemo(() => {
    if (!grouped || !groupBy) return null
    
    const groups = new Map<string, ListItemData<T>[]>()
    sortedItems.forEach(item => {
      const group = groupBy(item)
      if (!groups.has(group)) {
        groups.set(group, [])
      }
      groups.get(group)!.push(item)
    })
    
    return groups
  }, [grouped, groupBy, sortedItems])
  
  // Final items list (grouped or flat)
  const finalItems = useMemo(() => {
    if (groupedItems) {
      const result: (ListItemData<T> | { isHeader: true; group: string })[] = []
      groupedItems.forEach((items, group) => {
        result.push({ isHeader: true, group } as any)
        result.push(...items)
      })
      return result
    }
    return sortedItems
  }, [groupedItems, sortedItems])
  
  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || !onLoadMore || loadingMore) return
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 1.0 }
    )
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, onLoadMore, loadingMore])
  
  // Handlers
  const handleToggleSelect = useCallback((itemId: string | number, event?: React.MouseEvent) => {
    if (!selectable) return
    
    // Prevent event bubbling
    event?.stopPropagation()
    
    const newSelected = new Set(selectedSet)
    
    if (multiSelect) {
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId)
      } else {
        newSelected.add(itemId)
      }
    } else {
      // Single select mode
      if (newSelected.has(itemId)) {
        newSelected.clear()
      } else {
        newSelected.clear()
        newSelected.add(itemId)
      }
    }
    
    setSelectedSet(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }, [selectable, multiSelect, selectedSet, onSelectionChange])
  
  const handleToggleExpand = useCallback((itemId: string | number, event?: React.MouseEvent) => {
    event?.stopPropagation()
    
    const newExpanded = new Set(expandedSet)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    
    setExpandedSet(newExpanded)
    onExpandChange?.(Array.from(newExpanded))
  }, [expandedSet, onExpandChange])
  
  const handleItemClick = useCallback((item: ListItemData<T>, event: React.MouseEvent) => {
    // Handle selection if selectable
    if (selectable && !item.disabled) {
      handleToggleSelect(item.id, event)
    }
    
    // Handle expansion if has nested items
    if (nestedItems?.has(item.id)) {
      handleToggleExpand(item.id, event)
    }
    
    // Call custom click handler
    onItemClick?.(item, event)
  }, [selectable, nestedItems, handleToggleSelect, handleToggleExpand, onItemClick])
  
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }, [onSearch])
  
  const handleSort = useCallback(() => {
    const newOrder = localSortOrder === 'asc' ? 'desc' : 'asc'
    setLocalSortOrder(newOrder)
    onSort?.(sortBy, newOrder)
  }, [sortBy, localSortOrder, onSort])
  
  // Drag and Drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])
  
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) return
    
    const newItems = [...items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)
    
    onReorder?.(newItems)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex, items, onReorder])
  
  // Render single item
  const renderListItem = useCallback((item: ListItemData<T> | { isHeader: true; group: string }, index: number) => {
    // Group header
    if ('isHeader' in item) {
      return (
        <ListSubheader key={`header-${item.group}`} component="div">
          {groupHeaders?.get(item.group) || item.group}
        </ListSubheader>
      )
    }
    
    // Custom renderer
    if (renderItem) {
      return renderItem(item, index)
    }
    
    const hasNested = nestedItems?.has(item.id)
    const isExpanded = expandedSet.has(item.id)
    const isSelected = selectedSet.has(item.id)
    const isDragging = draggedIndex === index
    const isDragOver = dragOverIndex === index
    
    return (
      <React.Fragment key={item.id}>
        <ListItem
          disablePadding={disablePadding}
          divider={divided || item.divider}
          sx={{
            ...itemSx,
            opacity: isDragging ? 0.5 : 1,
            backgroundColor: isDragOver ? 'action.hover' : undefined,
            transition: 'background-color 0.2s'
          }}
          draggable={showDrag && !item.disabled}
          onDragStart={() => showDrag && handleDragStart(index)}
          onDragOver={(e) => showDrag && handleDragOver(e, index)}
          onDrop={(e) => showDrag && handleDrop(e, index)}
          secondaryAction={
            item.action || (hasNested && (
              <IconButton 
                edge="end"
                onClick={(e) => handleToggleExpand(item.id, e)}
                size="small"
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            ))
          }
        >
          {showDrag && (
            <ListItemIcon>
              <DragIcon />
            </ListItemIcon>
          )}
          
          {selectable && (
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={isSelected}
                onChange={(e) => handleToggleSelect(item.id, e as any)}
                disabled={item.disabled}
                onClick={(e) => e.stopPropagation()}
              />
            </ListItemIcon>
          )}
          
          {item.icon && (
            <ListItemIcon>{item.icon}</ListItemIcon>
          )}
          
          {item.avatar && (
            <ListItemAvatar>{item.avatar}</ListItemAvatar>
          )}
          
          <ListItemButton
            dense={dense}
            disabled={item.disabled}
            selected={item.selected || (variant === 'simple' && isSelected)}
            onClick={(e) => handleItemClick(item, e)}
            onDoubleClick={(e) => onItemDoubleClick?.(item, e)}
          >
            <ListItemText
              primary={item.primary}
              secondary={item.secondary}
              primaryTypographyProps={item.primaryTypographyProps}
              secondaryTypographyProps={item.secondaryTypographyProps}
            />
          </ListItemButton>
        </ListItem>
        
        {/* Nested items */}
        {hasNested && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <MuiList component="div" disablePadding sx={{ pl: 4 }}>
              {nestedItems?.get(item.id)?.map((nestedItem) => (
                <ListItem 
                  key={nestedItem.id} 
                  disablePadding={disablePadding}
                  divider={divided || nestedItem.divider}
                >
                  {nestedItem.icon && (
                    <ListItemIcon>{nestedItem.icon}</ListItemIcon>
                  )}
                  <ListItemButton
                    dense={dense}
                    disabled={nestedItem.disabled}
                    selected={nestedItem.selected}
                    onClick={(e) => onItemClick?.(nestedItem, e)}
                    onDoubleClick={(e) => onItemDoubleClick?.(nestedItem, e)}
                  >
                    <ListItemText
                      primary={nestedItem.primary}
                      secondary={nestedItem.secondary}
                    />
                  </ListItemButton>
                  {nestedItem.action && (
                    <ListItemSecondaryAction>
                      {nestedItem.action}
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </MuiList>
          </Collapse>
        )}
      </React.Fragment>
    )
  }, [
    renderItem,
    nestedItems,
    expandedSet,
    selectedSet,
    draggedIndex,
    dragOverIndex,
    disablePadding,
    divided,
    itemSx,
    showDrag,
    selectable,
    dense,
    variant,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleToggleExpand,
    handleToggleSelect,
    handleItemClick,
    onItemDoubleClick,
    onItemClick,
    groupHeaders
  ])
  
  // Loading state
  if (loading) {
    return renderLoading || (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    )
  }
  
  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }
  
  // Empty state
  if (items.length === 0) {
    return renderEmpty || (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        p={3}
      >
        {emptyIcon}
        <Typography variant="body1" color="text.secondary" mt={2}>
          {emptyMessage}
        </Typography>
        {emptyAction && (
          <Box mt={2}>
            {emptyAction}
          </Box>
        )}
      </Box>
    )
  }
  
  // Determine wrapper component
  const WrapperComponent = isInteractive || showSearch || showSort ? Paper : Box
  
  return (
    <WrapperComponent sx={sx} elevation={isInteractive ? 1 : 0}>
      {/* Search Bar */}
      {showSearch && (
        <Box p={2} borderBottom={1} borderColor="divider">
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleSearch('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}
      
      {/* Sort Controls */}
      {showSort && (
        <Box p={1} borderBottom={1} borderColor="divider" display="flex" alignItems="center">
          <Typography variant="caption" sx={{ mr: 1 }}>
            Sort by:
          </Typography>
          <Chip
            label={`${sortBy} ${localSortOrder === 'asc' ? '↑' : '↓'}`}
            onClick={handleSort}
            size="small"
          />
        </Box>
      )}
      
      {/* List */}
      <MuiList
        dense={dense}
        disablePadding={disablePadding}
        subheader={subheader}
      >
        {finalItems.map((item, index) => renderListItem(item, index))}
      </MuiList>
      
      {/* Load More */}
      {hasMore && (
        <Box ref={observerTarget} p={2} display="flex" justifyContent="center">
          {loadingMore ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="caption" color="text.secondary">
              Scroll to load more...
            </Typography>
          )}
        </Box>
      )}
    </WrapperComponent>
  )
}