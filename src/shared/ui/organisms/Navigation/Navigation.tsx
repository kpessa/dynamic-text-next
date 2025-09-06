import React, { useState, useCallback, useEffect } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Badge,
  InputBase,
  useScrollTrigger,
  Slide,
  useMediaQuery,
  useTheme,
  Stack,
  Paper
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
  ArrowDropDown
} from '@mui/icons-material'
import { NavigationProps, NavigationItem } from './Navigation.types'
import { alpha } from '@mui/material/styles'

interface HideOnScrollProps {
  children: React.ReactElement
}

function HideOnScroll({ children }: HideOnScrollProps) {
  const trigger = useScrollTrigger()
  
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

const DesktopMenuItem: React.FC<{
  item: NavigationItem
  activeId?: string
  onItemClick?: (item: NavigationItem) => void
  maxDepth: number
  currentDepth?: number
}> = ({ item, activeId, onItemClick, maxDepth, currentDepth = 0 }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.id === activeId
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (hasChildren && currentDepth < maxDepth) {
      setAnchorEl(event.currentTarget)
    } else {
      handleItemClick()
    }
  }
  
  const handleClose = () => {
    setAnchorEl(null)
  }
  
  const handleItemClick = () => {
    if (item.onClick) {
      item.onClick()
    }
    if (onItemClick) {
      onItemClick(item)
    }
    handleClose()
  }
  
  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        disabled={item.disabled}
        startIcon={item.icon}
        endIcon={hasChildren && currentDepth < maxDepth ? <ArrowDropDown /> : null}
        sx={{
          fontWeight: isActive ? 'bold' : 'normal',
          textDecoration: isActive ? 'underline' : 'none',
          textUnderlineOffset: 4
        }}
        href={!hasChildren ? item.href : undefined}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
      >
        {item.badge ? (
          <Badge badgeContent={item.badge} color="error">
            {item.label}
          </Badge>
        ) : (
          item.label
        )}
      </Button>
      
      {hasChildren && currentDepth < maxDepth && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {item.children!.map((child, index) => [
            child.divider && index > 0 && <Divider key={`${child.id}-divider`} />,
            <MenuItem
              key={child.id}
              onClick={() => {
                if (child.onClick) child.onClick()
                if (onItemClick) onItemClick(child)
                handleClose()
              }}
              disabled={child.disabled}
              selected={child.id === activeId}
              component={child.href ? 'a' : 'li'}
              href={child.href}
              target={child.external ? '_blank' : undefined}
              rel={child.external ? 'noopener noreferrer' : undefined}
            >
              {child.icon && (
                <ListItemIcon>
                  {child.icon}
                </ListItemIcon>
              )}
              <ListItemText 
                primary={child.label}
                secondary={child.description}
              />
              {child.badge && (
                <Badge badgeContent={child.badge} color="error" sx={{ ml: 2 }} />
              )}
            </MenuItem>
          ]).flat().filter(Boolean)}
        </Menu>
      )}
    </>
  )
}

const MobileMenuItem: React.FC<{
  item: NavigationItem
  activeId?: string
  onItemClick?: (item: NavigationItem) => void
  level?: number
  maxDepth: number
}> = ({ item, activeId, onItemClick, level = 0, maxDepth }) => {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.id === activeId
  
  const handleClick = () => {
    if (hasChildren && level < maxDepth) {
      setOpen(!open)
    } else {
      if (item.onClick) item.onClick()
      if (onItemClick) onItemClick(item)
    }
  }
  
  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleClick}
          disabled={item.disabled}
          selected={isActive}
          sx={{ pl: 2 + level * 2 }}
          component={!hasChildren && item.href ? 'a' : 'div'}
          href={!hasChildren ? item.href : undefined}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
        >
          {item.icon && (
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
          )}
          <ListItemText 
            primary={
              item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.label}
                </Badge>
              ) : (
                item.label
              )
            }
            secondary={item.description}
          />
          {hasChildren && level < maxDepth && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>
      
      {hasChildren && level < maxDepth && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <MobileMenuItem
                key={child.id}
                item={child}
                activeId={activeId}
                onItemClick={onItemClick}
                level={level + 1}
                maxDepth={maxDepth}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  )
}

export function Navigation({
  items,
  activeId,
  onItemClick,
  logo,
  brand,
  showBrandOnMobile = false,
  rightActions,
  variant = 'default',
  position = 'sticky',
  elevation = 4,
  hideOnScroll = false,
  mobileBreakpoint = 'md',
  mobileMenuVariant = 'drawer',
  sx,
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue: externalSearchValue,
  onSearchChange,
  onSearchSubmit,
  maxDepth = 2,
  customMobileMenuButton,
  toolbarContent,
  stickyOffset = 0
}: NavigationProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(externalSearchValue || '')
  const [searchOpen, setSearchOpen] = useState(false)
  
  useEffect(() => {
    if (externalSearchValue !== undefined) {
      setSearchValue(externalSearchValue)
    }
  }, [externalSearchValue])
  
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
    if (onSearchChange) {
      onSearchChange(value)
    }
  }
  
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (onSearchSubmit) {
      onSearchSubmit(searchValue)
    }
    if (isMobile) {
      setSearchOpen(false)
    }
  }
  
  const handleItemClick = useCallback((item: NavigationItem) => {
    if (onItemClick) {
      onItemClick(item)
    }
    setMobileMenuOpen(false)
  }, [onItemClick])
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'transparent':
        return 'transparent'
      case 'dark':
        return theme.palette.grey[900]
      default:
        return theme.palette.background.paper
    }
  }
  
  const getTextColor = () => {
    switch (variant) {
      case 'dark':
        return theme.palette.common.white
      default:
        return 'inherit'
    }
  }
  
  const appBar = (
    <AppBar
      position={position}
      elevation={elevation}
      sx={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        top: stickyOffset,
        ...sx
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            {logo}
            {brand && (!isMobile || showBrandOnMobile) && (
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ ml: logo ? 1 : 0, fontWeight: 'bold' }}
              >
                {brand}
              </Typography>
            )}
          </Box>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              {items.map((item) => (
                <React.Fragment key={item.id}>
                  {item.divider && <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />}
                  <DesktopMenuItem
                    item={item}
                    activeId={activeId}
                    onItemClick={handleItemClick}
                    maxDepth={maxDepth}
                  />
                </React.Fragment>
              ))}
            </Box>
          )}
          
          {/* Mobile spacer */}
          {isMobile && <Box sx={{ flexGrow: 1 }} />}
          
          {/* Search Bar */}
          {showSearch && !isMobile && (
            <Paper
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: 300,
                mr: 2,
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.25),
                },
              }}
              elevation={0}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, color: 'inherit' }}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
              />
              <IconButton type="submit" sx={{ p: '10px', color: 'inherit' }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
          )}
          
          {/* Mobile Search */}
          {showSearch && isMobile && (
            <>
              {searchOpen ? (
                <Paper
                  component="form"
                  onSubmit={handleSearchSubmit}
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    mr: 1,
                  }}
                  elevation={0}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={handleSearchChange}
                    autoFocus
                  />
                  <IconButton
                    onClick={() => setSearchOpen(false)}
                    sx={{ p: '10px' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Paper>
              ) : (
                <IconButton
                  color="inherit"
                  onClick={() => setSearchOpen(true)}
                  sx={{ mr: 1 }}
                >
                  <SearchIcon />
                </IconButton>
              )}
            </>
          )}
          
          {/* Right Actions */}
          {rightActions && !searchOpen && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              {rightActions}
            </Box>
          )}
          
          {/* Mobile Menu Button */}
          {isMobile && !searchOpen && (
            customMobileMenuButton || (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleMobileMenuToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )
          )}
        </Toolbar>
        
        {/* Additional Toolbar Content */}
        {toolbarContent && (
          <Box sx={{ pb: 2 }}>
            {toolbarContent}
          </Box>
        )}
      </Container>
    </AppBar>
  )
  
  // Mobile Menu
  const mobileMenu = (
    <Drawer
      anchor={mobileMenuVariant === 'drawer' ? 'left' : 'top'}
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <Box
        sx={{
          width: mobileMenuVariant === 'drawer' ? 280 : 'auto',
          pt: 2,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {logo}
            {brand && (
              <Typography variant="h6" sx={{ ml: logo ? 1 : 0 }}>
                {brand}
              </Typography>
            )}
          </Box>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        
        <Divider />
        
        <List>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider && <Divider />}
              <MobileMenuItem
                item={item}
                activeId={activeId}
                onItemClick={handleItemClick}
                maxDepth={maxDepth}
              />
            </React.Fragment>
          ))}
        </List>
        
        {rightActions && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              {rightActions}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  )
  
  return (
    <>
      {hideOnScroll ? (
        <HideOnScroll>
          {appBar}
        </HideOnScroll>
      ) : (
        appBar
      )}
      {isMobile && mobileMenu}
    </>
  )
}