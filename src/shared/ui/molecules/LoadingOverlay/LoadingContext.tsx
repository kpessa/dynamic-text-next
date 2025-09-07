'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { LoadingOverlay } from './LoadingOverlay'

interface LoadingContextValue {
  showLoading: (message?: string) => void
  hideLoading: () => void
  isLoading: boolean
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: React.ReactNode
  variant?: 'circular' | 'linear'
  size?: number | string
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  variant = 'circular',
  size = 40,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>()

  const showLoading = useCallback((message?: string) => {
    setMessage(message)
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
    setMessage(undefined)
  }, [])

  const value = {
    showLoading,
    hideLoading,
    isLoading,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay
        open={isLoading}
        message={message}
        variant={variant}
        size={size}
      />
    </LoadingContext.Provider>
  )
}