import { useTheme, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'

interface ResponsiveValues {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'largeDesktop'
  orientation: 'portrait' | 'landscape'
  isTouchDevice: boolean
  isSmallScreen: boolean
  isMediumScreen: boolean
  isLargeScreen: boolean
}

export const useResponsive = (): ResponsiveValues => {
  const theme = useTheme()
  
  // Breakpoint checks (320px, 768px, 1024px, 1440px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')) // 600px - 960px
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg')) // 960px - 1280px
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg')) // >= 1280px

  // Additional size checks
  const isSmallScreen = useMediaQuery('(max-width:320px)')
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:1023px)')
  const isLargeScreen = useMediaQuery('(min-width:1440px)')

  // Orientation
  const isPortrait = useMediaQuery('(orientation: portrait)')
  
  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Determine current screen size
  let screenSize: 'mobile' | 'tablet' | 'desktop' | 'largeDesktop' = 'desktop'
  if (isMobile) screenSize = 'mobile'
  else if (isTablet) screenSize = 'tablet'
  else if (isDesktop) screenSize = 'desktop'
  else if (isLargeDesktop) screenSize = 'largeDesktop'

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    screenSize,
    orientation: isPortrait ? 'portrait' : 'landscape',
    isTouchDevice,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen
  }
}

// Custom hook for handling responsive values
export function useResponsiveValue<T>(
  mobileValue: T,
  tabletValue?: T,
  desktopValue?: T,
  largeDesktopValue?: T
): T {
  const { screenSize } = useResponsive()

  switch (screenSize) {
    case 'mobile':
      return mobileValue
    case 'tablet':
      return tabletValue ?? mobileValue
    case 'desktop':
      return desktopValue ?? tabletValue ?? mobileValue
    case 'largeDesktop':
      return largeDesktopValue ?? desktopValue ?? tabletValue ?? mobileValue
    default:
      return mobileValue
  }
}

// Hook for responsive spacing
export const useResponsiveSpacing = () => {
  const { screenSize } = useResponsive()

  const spacing = {
    mobile: { xs: 1, sm: 2, md: 3, lg: 4 },
    tablet: { xs: 2, sm: 3, md: 4, lg: 5 },
    desktop: { xs: 2, sm: 3, md: 4, lg: 6 },
    largeDesktop: { xs: 3, sm: 4, md: 5, lg: 8 }
  }

  return spacing[screenSize]
}

// Hook for responsive font sizes
export const useResponsiveFontSize = () => {
  const { screenSize } = useResponsive()

  const fontSizes = {
    mobile: {
      h1: '2rem',
      h2: '1.5rem',
      h3: '1.25rem',
      h4: '1.125rem',
      h5: '1rem',
      h6: '0.875rem',
      body1: '0.875rem',
      body2: '0.75rem',
      caption: '0.625rem'
    },
    tablet: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.5rem',
      h4: '1.25rem',
      h5: '1.125rem',
      h6: '1rem',
      body1: '1rem',
      body2: '0.875rem',
      caption: '0.75rem'
    },
    desktop: {
      h1: '3rem',
      h2: '2.5rem',
      h3: '2rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1.125rem',
      body1: '1rem',
      body2: '0.875rem',
      caption: '0.75rem'
    },
    largeDesktop: {
      h1: '3.5rem',
      h2: '3rem',
      h3: '2.5rem',
      h4: '2rem',
      h5: '1.5rem',
      h6: '1.25rem',
      body1: '1.125rem',
      body2: '1rem',
      caption: '0.875rem'
    }
  }

  return fontSizes[screenSize]
}

// Hook for handling touch gestures
export const useTouchGestures = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 100
) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)

    if (isHorizontalSwipe) {
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
      }
    } else {
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeUp?.()
        } else {
          onSwipeDown?.()
        }
      }
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}

// Utility for ensuring minimum touch target size (44px)
export const ensureTouchTarget = (size: number = 44) => ({
  minWidth: size,
  minHeight: size,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})