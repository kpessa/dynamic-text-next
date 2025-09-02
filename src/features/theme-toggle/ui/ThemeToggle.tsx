'use client'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useColorScheme } from '@mui/material/styles'

export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useColorScheme()

  const toggleColorMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  // Handle SSR - mode might be undefined on initial render
  if (!mode) {
    return (
      <IconButton disabled color="inherit">
        <Brightness7Icon />
      </IconButton>
    )
  }

  return (
    <IconButton onClick={toggleColorMode} color="inherit" aria-label="toggle theme">
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  )
}