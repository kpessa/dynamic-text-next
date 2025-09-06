import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { 
  selectFunctionHistory, 
  selectAverageDuration,
  clearFunctionHistory 
} from '../model/functionsSlice'

interface FunctionCallHistoryProps {
  functionName?: string
  limit?: number
  showStats?: boolean
}

export const FunctionCallHistory: React.FC<FunctionCallHistoryProps> = ({
  functionName,
  limit = 10,
  showStats = true,
}) => {
  const dispatch = useAppDispatch()
  const history = useAppSelector(selectFunctionHistory)
  const avgDuration = useAppSelector(state => selectAverageDuration(state, functionName))

  const filteredHistory = functionName
    ? history.filter(h => h.functionName === functionName)
    : history

  const displayHistory = filteredHistory.slice(-limit).reverse()

  const successCount = filteredHistory.filter(h => h.status === 'succeeded').length
  const failureCount = filteredHistory.filter(h => h.status === 'failed').length
  const successRate = filteredHistory.length > 0
    ? Math.round((successCount / filteredHistory.length) * 100)
    : 0

  const handleClear = () => {
    dispatch(clearFunctionHistory())
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return ''
    return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="action" />
            <Typography variant="h6">
              Function Call History
              {functionName && ` - ${functionName}`}
            </Typography>
          </Box>
          
          {displayHistory.length > 0 && (
            <Tooltip title="Clear history">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {showStats && filteredHistory.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              label={`Success: ${successCount}`}
              color="success"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Failed: ${failureCount}`}
              color="error"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Rate: ${successRate}%`}
              color={successRate >= 75 ? 'success' : successRate >= 50 ? 'warning' : 'error'}
              variant="outlined"
              size="small"
            />
            {avgDuration > 0 && (
              <Chip
                label={`Avg: ${formatDuration(avgDuration)}`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}

        {displayHistory.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            No function calls yet
          </Typography>
        ) : (
          <List dense>
            {displayHistory.map((item, index) => (
              <ListItem key={`${item.functionName}-${item.timestamp}-${index}`}>
                <ListItemIcon>
                  {item.status === 'succeeded' ? (
                    <SuccessIcon color="success" fontSize="small" />
                  ) : (
                    <ErrorIcon color="error" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {item.functionName}
                      </Typography>
                      {item.duration && (
                        <Chip 
                          label={formatDuration(item.duration)} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={formatTimestamp(item.timestamp)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}