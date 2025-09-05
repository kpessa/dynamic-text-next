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
  Divider,
  InputAdornment,
  Paper,
  Chip
} from '@mui/material'
import {
  ExpandLess,
  ExpandMore,
  Search as SearchIcon,
  Clear as ClearIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material'
// import { FixedSizeList, VariableSizeList } from 'react-window' // Commented out - causing issues
import { ListProps, ListItemData } from './List.types'

// Default empty values to prevent re-renders
const DEFAULT_SELECTED: (string | number)[] = []
const DEFAULT_EXPANDED: (string | number)[] = []
const DEFAULT_NESTED_ITEMS = new Map()

export function List<T = any>({
  items,
  loading = false,
  error = null,
  
  variant = 'simple',
  dense = false,
  disablePadding = false,
  
  selectable = false,
  multiSelect = false,
  selectedItems = DEFAULT_SELECTED,
  onSelectionChange,
  
  onItemClick,
  onItemDoubleClick,
  
  nestedItems = DEFAULT_NESTED_ITEMS,
  defaultExpanded = DEFAULT_EXPANDED,
  onExpandChange,
  
  virtualized = false,
  itemHeight = 56,
  overscan = 3,
  height = 400,
  
  emptyMessage = 'No items to display',
  emptyIcon,
  emptyAction,
  
  sx,
  itemSx,
  subheader,
  
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  filterMode = 'local',
  
  sortable = false,
  sortBy = 'primary',
  sortOrder = 'asc',
  onSort,
  customSort,
  
  grouped = false,
  groupBy,
  groupHeaders = new Map(),
  
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  
  swipeActions,
  
  draggable = false,
  onReorder,
  
  customItemRenderer,
  customEmptyState,
  customLoadingState
}: ListProps<T>) {
  // State
  const [selectedSet, setSelectedSet] = useState<Set<string | number>>(
    new Set(selectedItems)
  )
  const [expandedSet, setExpandedSet] = useState<Set<string | number>>(
    new Set(defaultExpanded)
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [localSortBy, setLocalSortBy] = useState(sortBy)
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder)
  const [draggedItem, setDraggedItem] = useState<ListItemData<T> | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // Ref for virtualized list (if we re-enable react-window)
  const listRef = useRef<any>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Update selected set when prop changes
  useEffect(() => {
    // Only update if selectedItems actually changed (not just a new array reference)
    const newSelectedSet = new Set(selectedItems)
    setSelectedSet(current => {
      // Check if the sets are different
      if (current.size !== newSelectedSet.size) return newSelectedSet
      for (const item of newSelectedSet) {
        if (!current.has(item)) return newSelectedSet
      }
      return current // No change needed
    })
  }, [selectedItems])

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchable || filterMode === 'server' || !searchQuery) {
      return items
    }

    return items.filter(item => {
      const primaryText = typeof item.primary === 'string' ? item.primary : ''
      const secondaryText = typeof item.secondary === 'string' ? item.secondary : ''
      const searchLower = searchQuery.toLowerCase()
      
      return (
        primaryText.toLowerCase().includes(searchLower) ||
        secondaryText.toLowerCase().includes(searchLower)
      )
    })
  }, [items, searchable, filterMode, searchQuery])

  // Sort items
  const sortedItems = useMemo(() => {
    if (!sortable) return filteredItems

    const sorted = [...filteredItems]
    
    if (customSort) {
      sorted.sort(customSort)
      if (localSortOrder === 'desc') sorted.reverse()
    } else {
      sorted.sort((a, b) => {
        const aValue = localSortBy === 'primary' ? a.primary : a.secondary
        const bValue = localSortBy === 'primary' ? b.primary : b.secondary
        
        const aString = String(aValue || '')
        const bString = String(bValue || '')
        
        if (localSortOrder === 'asc') {
          return aString.localeCompare(bString)
        } else {
          return bString.localeCompare(aString)
        }
      })
    }

    return sorted
  }, [filteredItems, sortable, localSortBy, localSortOrder, customSort])

  // Group items
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
  const handleToggleSelect = useCallback((itemId: string | number) => {
    if (!selectable) return

    const newSelected = new Set(selectedSet)
    
    if (multiSelect) {
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId)
      } else {
        newSelected.add(itemId)
      }
    } else {
      if (newSelected.has(itemId)) {
        newSelected.clear()
      } else {
        newSelected.clear()
        newSelected.add(itemId)
      }
    }
    
    setSelectedSet(newSelected)
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected))
    }
  }, [selectable, multiSelect, selectedSet, onSelectionChange])

  const handleToggleExpand = useCallback((itemId: string | number) => {
    const newExpanded = new Set(expandedSet)
    
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    
    setExpandedSet(newExpanded)
    
    if (onExpandChange) {
      onExpandChange(Array.from(newExpanded))
    }
  }, [expandedSet, onExpandChange])

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }, [onSearch])

  const handleSort = useCallback(() => {
    if (!sortable) return
    
    const newOrder = localSortOrder === 'asc' ? 'desc' : 'asc'
    setLocalSortOrder(newOrder)
    
    if (onSort) {
      onSort(localSortBy, newOrder)
    }
  }, [sortable, localSortBy, localSortOrder, onSort])

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, item: ListItemData<T>) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (!draggedItem || !onReorder) return
    
    const dragIndex = finalItems.findIndex(item => 
      'id' in item && item.id === draggedItem.id
    )
    
    if (dragIndex === -1 || dragIndex === dropIndex) return
    
    const newItems = [...finalItems.filter(item => 'id' in item)] as ListItemData<T>[]
    const [removed] = newItems.splice(dragIndex, 1)
    newItems.splice(dropIndex, 0, removed)
    
    onReorder(newItems)
    handleDragEnd()
  }, [draggedItem, finalItems, onReorder, handleDragEnd])

  // Render single item
  const renderItem = useCallback((item: ListItemData<T> | { isHeader: true; group: string }, index: number) => {
    // Group header
    if ('isHeader' in item) {
      return (
        <ListSubheader key={`header-${item.group}`} component="div">
          {groupHeaders.get(item.group) || item.group}
        </ListSubheader>
      )
    }

    // Custom renderer
    if (customItemRenderer) {
      return customItemRenderer(item, index)
    }

    const hasNested = nestedItems.has(item.id)
    const isExpanded = expandedSet.has(item.id)
    const isSelected = selectedSet.has(item.id)
    const isDragging = draggedItem?.id === item.id
    const isDragOver = dragOverIndex === index

    return (
      <React.Fragment key={item.id}>
        <ListItem
          disablePadding={disablePadding}
          divider={item.divider}
          sx={{
            ...itemSx,
            opacity: isDragging ? 0.5 : 1,
            backgroundColor: isDragOver ? 'action.hover' : undefined,
            transition: 'background-color 0.2s'
          }}
          draggable={draggable}
          onDragStart={(e) => draggable && handleDragStart(e, item)}
          onDragOver={(e) => draggable && handleDragOver(e, index)}
          onDragEnd={draggable ? handleDragEnd : undefined}
          onDrop={(e) => draggable && handleDrop(e, index)}
          secondaryAction={
            item.action || (hasNested && (
              <IconButton onClick={() => handleToggleExpand(item.id)}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            ))
          }
        >
          {draggable && (
            <ListItemIcon>
              <DragIcon />
            </ListItemIcon>
          )}
          
          {selectable && (
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={isSelected}
                onChange={() => handleToggleSelect(item.id)}
                disabled={item.disabled}
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
            selected={item.selected}
            onClick={(e) => {
              if (onItemClick) onItemClick(item, e)
              if (selectable && !e.defaultPrevented) {
                handleToggleSelect(item.id)
              }
              if (hasNested && !e.defaultPrevented) {
                handleToggleExpand(item.id)
              }
            }}
            onDoubleClick={(e) => onItemDoubleClick && onItemDoubleClick(item, e)}
          >
            <ListItemText
              primary={item.primary}
              secondary={item.secondary}
            />
          </ListItemButton>
        </ListItem>
        
        {hasNested && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <MuiList component="div" disablePadding sx={{ pl: 4 }}>
              {nestedItems.get(item.id)?.map((nestedItem) => (
                <ListItem key={nestedItem.id} disablePadding={disablePadding}>
                  {nestedItem.icon && (
                    <ListItemIcon>{nestedItem.icon}</ListItemIcon>
                  )}
                  <ListItemButton
                    dense={dense}
                    disabled={nestedItem.disabled}
                    selected={nestedItem.selected}
                    onClick={(e) => onItemClick && onItemClick(nestedItem, e)}
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
    customItemRenderer,
    nestedItems,
    expandedSet,
    selectedSet,
    draggedItem,
    dragOverIndex,
    disablePadding,
    itemSx,
    draggable,
    selectable,
    dense,
    onItemClick,
    onItemDoubleClick,
    handleToggleSelect,
    handleToggleExpand,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    groupHeaders
  ])

  // Virtual list row renderer - commented out until react-window v2 issues are resolved
  // const VirtualRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
  //   return (
  //     <div style={style}>
  //       {renderItem(finalItems[index], index)}
  //     </div>
  //   )
  // }, [finalItems, renderItem])

  // Loading state
  if (loading) {
    return customLoadingState || (
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
    return customEmptyState || (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        p={3}
      >
        {emptyIcon}
        <Typography variant="h6" color="text.secondary" mt={2}>
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

  // Row height function - commented out until react-window v2 issues are resolved
  // const getRowHeight = useCallback((index: number) => {
  //   if (typeof itemHeight === 'function') {
  //     return itemHeight(index)
  //   }
  //   return itemHeight
  // }, [itemHeight])

  return (
    <Paper sx={sx} elevation={0}>
      {/* Search Bar */}
      {searchable && (
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
      {sortable && (
        <Box p={1} borderBottom={1} borderColor="divider" display="flex" alignItems="center">
          <Typography variant="caption" sx={{ mr: 1 }}>
            Sort by:
          </Typography>
          <Chip
            label={`${localSortBy} ${localSortOrder === 'asc' ? '↑' : '↓'}`}
            onClick={handleSort}
            size="small"
          />
        </Box>
      )}

      {/* List - Virtualization temporarily disabled due to react-window v2 issues */}
      <MuiList
        dense={dense}
        disablePadding={disablePadding}
        subheader={subheader}
      >
        {finalItems.map((item, index) => renderItem(item, index))}
      </MuiList>

      {/* Load More */}
      {hasMore && !virtualized && (
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
    </Paper>
  )
}