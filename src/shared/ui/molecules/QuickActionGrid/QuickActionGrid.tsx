'use client'

import React from 'react'
import { Grid, Button, Paper, Typography, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import type { QuickActionGridProps } from './QuickActionGrid.types'

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  actions,
  columns = { xs: 12, sm: 6, md: 3, lg: 3 },
  spacing = 2,
  className,
}) => {
  const router = useRouter()

  const handleAction = (action: typeof actions[0]) => {
    if (action.onClick) {
      action.onClick()
    } else if (action.path) {
      router.push(action.path)
    }
  }

  return (
    <Grid container spacing={spacing} className={className}>
      {actions.map((action) => (
        <Grid item key={action.id} {...columns}>
          <Button
            fullWidth
            variant={action.variant || 'contained'}
            color={action.color || 'primary'}
            startIcon={action.icon}
            onClick={() => handleAction(action)}
            disabled={action.disabled}
            sx={{
              py: 1.5,
              justifyContent: 'flex-start',
              textAlign: 'left',
            }}
          >
            {action.label}
          </Button>
        </Grid>
      ))}
    </Grid>
  )
}

// Alternative card-based layout for quick actions
export const QuickActionCards: React.FC<QuickActionGridProps> = ({
  actions,
  columns = { xs: 6, sm: 4, md: 3, lg: 2 },
  spacing = 2,
  className,
}) => {
  const router = useRouter()

  const handleAction = (action: typeof actions[0]) => {
    if (action.onClick) {
      action.onClick()
    } else if (action.path) {
      router.push(action.path)
    }
  }

  return (
    <Grid container spacing={spacing} className={className}>
      {actions.map((action) => (
        <Grid item key={action.id} {...columns}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              cursor: action.disabled ? 'default' : 'pointer',
              opacity: action.disabled ? 0.5 : 1,
              transition: 'all 0.2s',
              '&:hover': action.disabled
                ? {}
                : {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
            }}
            onClick={() => !action.disabled && handleAction(action)}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 1,
                '& > svg': {
                  fontSize: 32,
                },
              }}
            >
              {action.icon}
            </Box>
            <Typography variant="body2" noWrap>
              {action.label}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}