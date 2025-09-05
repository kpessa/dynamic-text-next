import React, { useState, useEffect } from 'react'
import {
  Drawer as MuiDrawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'
import { cn } from '@/shared/lib/utils'
import type { DrawerProps, MiniDrawerProps } from './Drawer.types'

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  justifyContent: 'space-between',
  minHeight: '64px',
}))

const DrawerContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  overflow: 'auto',
}))

const DrawerFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}))

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      anchor = 'left',
      variant = 'temporary',
      width = 280,
      title,
      children,
      showCloseButton = true,
      actions,
      className,
      disableBackdropClick = false,
      disableEscapeKeyDown = false,
      keepMounted = false,
      PaperProps,
      ...props
    },
    ref
  ) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    
    const handleClose = (event: React.MouseEvent | React.KeyboardEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }
      onClose()
    }

    const drawerWidth = typeof width === 'number' ? `${width}px` : width
    const isHorizontal = anchor === 'top' || anchor === 'bottom'
    
    const paperStyles = {
      width: !isHorizontal ? drawerWidth : '100%',
      height: isHorizontal ? drawerWidth : '100%',
      ...PaperProps?.sx,
    }

    return (
      <MuiDrawer
        ref={ref}
        anchor={anchor}
        open={open}
        onClose={disableBackdropClick && disableEscapeKeyDown ? undefined : onClose}
        variant={variant}
        keepMounted={keepMounted}
        PaperProps={{
          ...PaperProps,
          sx: paperStyles,
          className: cn(PaperProps?.className, className),
        }}
        ModalProps={{
          onBackdropClick: disableBackdropClick ? undefined : onClose,
        }}
        {...props}
      >
        {(title || showCloseButton) && (
          <>
            <DrawerHeader>
              {title && (
                <Typography variant="h6" noWrap component="div">
                  {title}
                </Typography>
              )}
              {showCloseButton && variant === 'temporary' && (
                <IconButton
                  onClick={handleClose}
                  aria-label="close drawer"
                  edge={title ? 'end' : 'start'}
                >
                  {anchor === 'right' ? <ChevronRightIcon /> : <CloseIcon />}
                </IconButton>
              )}
            </DrawerHeader>
            <Divider />
          </>
        )}
        
        <DrawerContent role="presentation">
          {children}
        </DrawerContent>
        
        {actions && (
          <>
            <Divider />
            <DrawerFooter>{actions}</DrawerFooter>
          </>
        )}
      </MuiDrawer>
    )
  }
)

Drawer.displayName = 'Drawer'

const MiniDrawerRoot = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerWidth' && prop !== 'miniWidth',
})<{ open?: boolean; drawerWidth: string | number; miniWidth: string | number }>(
  ({ theme, open, drawerWidth, miniWidth }) => ({
    width: open ? drawerWidth : miniWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      width: open ? drawerWidth : miniWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: open
          ? theme.transitions.duration.enteringScreen
          : theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
    },
  })
)

export const MiniDrawer = React.forwardRef<HTMLDivElement, MiniDrawerProps>(
  (
    {
      open,
      onClose,
      anchor = 'left',
      miniWidth = 65,
      expandedWidth = 280,
      expanded: expandedProp,
      onExpand,
      expandOnHover = false,
      title,
      children,
      showCloseButton = true,
      actions,
      className,
      PaperProps,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(expandedProp || false)
    const [hovering, setHovering] = useState(false)

    useEffect(() => {
      if (expandedProp !== undefined) {
        setIsExpanded(expandedProp)
      }
    }, [expandedProp])

    const handleExpandToggle = () => {
      const newExpanded = !isExpanded
      setIsExpanded(newExpanded)
      onExpand?.(newExpanded)
    }

    const handleMouseEnter = () => {
      if (expandOnHover && !isExpanded) {
        setHovering(true)
      }
    }

    const handleMouseLeave = () => {
      if (expandOnHover) {
        setHovering(false)
      }
    }

    const expanded = isExpanded || hovering
    const drawerWidth = typeof expandedWidth === 'number' ? `${expandedWidth}px` : expandedWidth
    const miniDrawerWidth = typeof miniWidth === 'number' ? `${miniWidth}px` : miniWidth

    return (
      <MiniDrawerRoot
        ref={ref}
        variant="permanent"
        anchor={anchor}
        open={expanded}
        drawerWidth={drawerWidth}
        miniWidth={miniDrawerWidth}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        PaperProps={{
          ...PaperProps,
          className: cn(PaperProps?.className, className),
        }}
        {...props}
      >
        <DrawerHeader>
          <IconButton onClick={handleExpandToggle} aria-label="toggle drawer">
            {expanded ? (
              anchor === 'right' ? <ChevronRightIcon /> : <ChevronLeftIcon />
            ) : (
              <MenuIcon />
            )}
          </IconButton>
          {expanded && title && (
            <Typography variant="h6" noWrap component="div">
              {title}
            </Typography>
          )}
        </DrawerHeader>
        <Divider />
        
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {children}
        </Box>
        
        {actions && expanded && (
          <>
            <Divider />
            <DrawerFooter>{actions}</DrawerFooter>
          </>
        )}
      </MiniDrawerRoot>
    )
  }
)

MiniDrawer.displayName = 'MiniDrawer'

export const NavigationDrawer: React.FC<{
  items: Array<{
    text: string
    icon?: React.ReactNode
    onClick?: () => void
    selected?: boolean
    disabled?: boolean
  }>
  variant?: 'temporary' | 'persistent' | 'mini'
  open: boolean
  onClose: () => void
  onItemClick?: (index: number) => void
  title?: string
  width?: number | string
}> = ({
  items,
  variant = 'temporary',
  open,
  onClose,
  onItemClick,
  title,
  width = 280,
}) => {
  const DrawerComponent = variant === 'mini' ? MiniDrawer : Drawer
  
  return (
    <DrawerComponent
      open={open}
      onClose={onClose}
      variant={variant as any}
      title={title}
      width={width}
    >
      <List>
        {items.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              selected={item.selected}
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.()
                onItemClick?.(index)
                if (variant === 'temporary') {
                  onClose()
                }
              }}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </DrawerComponent>
  )
}