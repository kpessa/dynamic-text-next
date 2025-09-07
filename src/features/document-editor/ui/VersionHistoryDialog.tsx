import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  Alert
} from '@mui/material'
import {
  History as HistoryIcon,
  RestorePage as RestoreIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Schedule as TimeIcon,
  Compare as CompareIcon
} from '@mui/icons-material'

interface Version {
  id: string
  version: string
  timestamp: Date
  author: string
  message: string
  content: string
  changes: {
    additions: number
    deletions: number
  }
}

interface VersionHistoryDialogProps {
  open: boolean
  onClose: () => void
  onRestore: (version: Version) => void
}

export const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({
  open,
  onClose,
  onRestore
}) => {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [compareMode, setCompareMode] = useState(false)
  const [compareVersions, setCompareVersions] = useState<[Version | null, Version | null]>([null, null])

  // Mock version history
  const versions: Version[] = [
    {
      id: '1',
      version: 'v1.3.0',
      timestamp: new Date('2024-01-15T10:30:00'),
      author: 'John Doe',
      message: 'Added formula calculations section',
      content: '# Dynamic Text Documentation\n\n## Introduction\nUpdated content with formulas...',
      changes: { additions: 45, deletions: 12 }
    },
    {
      id: '2',
      version: 'v1.2.0',
      timestamp: new Date('2024-01-14T15:20:00'),
      author: 'Jane Smith',
      message: 'Updated patient information section',
      content: '# Dynamic Text Documentation\n\n## Introduction\nPrevious version...',
      changes: { additions: 23, deletions: 5 }
    },
    {
      id: '3',
      version: 'v1.1.0',
      timestamp: new Date('2024-01-13T09:00:00'),
      author: 'John Doe',
      message: 'Initial documentation structure',
      content: '# Dynamic Text Documentation\n\n## Introduction\nInitial content...',
      changes: { additions: 120, deletions: 0 }
    }
  ]

  const filteredVersions = versions.filter(version =>
    version.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.version.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVersionSelect = (version: Version) => {
    if (compareMode) {
      if (!compareVersions[0]) {
        setCompareVersions([version, null])
      } else if (!compareVersions[1] && version.id !== compareVersions[0].id) {
        setCompareVersions([compareVersions[0], version])
      } else {
        setCompareVersions([version, null])
      }
    } else {
      setSelectedVersion(version)
    }
  }

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion)
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon />
            <Typography variant="h6">Version History</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search and Controls */}
        <Box mb={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search versions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {filteredVersions.length} version{filteredVersions.length !== 1 ? 's' : ''} found
            </Typography>
            <Button
              startIcon={<CompareIcon />}
              onClick={() => {
                setCompareMode(!compareMode)
                setCompareVersions([null, null])
                setSelectedVersion(null)
              }}
              variant={compareMode ? 'contained' : 'outlined'}
              size="small"
            >
              {compareMode ? 'Exit Compare' : 'Compare Versions'}
            </Button>
          </Box>
        </Box>

        {compareMode && compareVersions[0] && compareVersions[1] && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Comparing {compareVersions[0].version} with {compareVersions[1].version}
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Version List */}
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredVersions.map((version, index) => {
            const isSelected = selectedVersion?.id === version.id
            const isCompareSelected = compareVersions.some(v => v?.id === version.id)
            
            return (
              <React.Fragment key={version.id}>
                <ListItem
                  disablePadding
                  sx={{
                    bgcolor: isSelected || isCompareSelected ? 'action.selected' : 'transparent'
                  }}
                >
                  <ListItemButton onClick={() => handleVersionSelect(version)}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {version.author.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight={500}>
                            {version.version}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {version.message}
                          </Typography>
                          {index === 0 && (
                            <Chip label="Latest" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <PersonIcon fontSize="small" sx={{ fontSize: 16 }} />
                            <Typography variant="caption">{version.author}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <TimeIcon fontSize="small" sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                              {formatTimestamp(version.timestamp)}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={`+${version.changes.additions}`}
                              size="small"
                              sx={{
                                bgcolor: 'success.light',
                                color: 'success.dark',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                            <Chip
                              label={`-${version.changes.deletions}`}
                              size="small"
                              sx={{
                                bgcolor: 'error.light',
                                color: 'error.dark',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                    {!compareMode && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          onRestore(version)
                        }}
                        size="small"
                        title="Restore this version"
                      >
                        <RestoreIcon />
                      </IconButton>
                    )}
                  </ListItemButton>
                </ListItem>
                {index < filteredVersions.length - 1 && <Divider />}
              </React.Fragment>
            )
          })}
        </List>

        {/* Selected Version Preview */}
        {selectedVersion && !compareMode && (
          <Box mt={2}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Preview of {selectedVersion.version}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
              >
                {selectedVersion.content}
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {compareMode && compareVersions[0] && compareVersions[1] && (
          <Button variant="contained" startIcon={<CompareIcon />}>
            View Comparison
          </Button>
        )}
        {!compareMode && selectedVersion && (
          <Button
            variant="contained"
            startIcon={<RestoreIcon />}
            onClick={handleRestore}
          >
            Restore {selectedVersion.version}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}