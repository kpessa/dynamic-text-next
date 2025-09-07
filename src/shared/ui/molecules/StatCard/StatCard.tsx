import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Skeleton,
  useTheme,
  CardActionArea,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material'
import type { StatCardProps } from './StatCard.types'

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  loading = false,
  onClick,
  className,
}) => {
  const theme = useTheme()

  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUpIcon fontSize="small" color="success" />
      case 'down':
        return <TrendingDownIcon fontSize="small" color="error" />
      case 'neutral':
        return <TrendingFlatIcon fontSize="small" color="inherit" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'success.main'
      case 'down':
        return 'error.main'
      case 'neutral':
        return 'text.secondary'
      default:
        return 'text.secondary'
    }
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers with commas
      return val.toLocaleString()
    }
    return val
  }

  const cardContent = (
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          {loading ? (
            <>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={40} sx={{ my: 1 }} />
              {trend && <Skeleton variant="text" width="40%" height={20} />}
            </>
          ) : (
            <>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ my: 1 }}>
                {formatValue(value)}
              </Typography>
              {trend && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {getTrendIcon()}
                  <Typography variant="body2" color={getTrendColor()}>
                    {trend.value}
                  </Typography>
                </Stack>
              )}
            </>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${theme.palette[color].main}20`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 48,
            minHeight: 48,
          }}
        >
          {loading ? (
            <Skeleton variant="circular" width={24} height={24} />
          ) : (
            icon
          )}
        </Box>
      </Stack>
    </CardContent>
  )

  return (
    <Card 
      className={className}
      sx={{
        height: '100%',
        transition: 'box-shadow 0.2s',
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }),
      }}
    >
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
          {cardContent}
        </CardActionArea>
      ) : (
        cardContent
      )}
    </Card>
  )
}