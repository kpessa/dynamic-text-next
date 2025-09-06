import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Collapse,
  Menu,
  MenuItem
} from '@mui/material';
import {
  History as HistoryIcon,
  Compare as CompareIcon,
  Restore as RestoreIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchVersionHistory,
  selectVersionHistory,
  selectVersionLoading,
  selectVersionError,
  setComparedVersions,
  searchVersions,
  restoreVersion
} from '../model/versionSlice';
import { Version } from '@/entities/version';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
  documentId: string;
  onVersionSelect?: (version: Version) => void;
  onCompare?: (left: Version, right: Version) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  documentId,
  onVersionSelect,
  onCompare
}) => {
  const dispatch = useAppDispatch();
  const versions = useAppSelector(selectVersionHistory);
  const loading = useAppSelector(selectVersionLoading);
  const error = useAppSelector(selectVersionError);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextVersion, setContextVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (documentId) {
      dispatch(fetchVersionHistory(documentId));
    }
  }, [documentId, dispatch]);

  const handleVersionClick = (version: Version) => {
    if (selectedVersions.size === 1 && !selectedVersions.has(version.id)) {
      const firstVersion = versions.find(v => selectedVersions.has(v.id));
      if (firstVersion && onCompare) {
        onCompare(firstVersion, version);
        dispatch(setComparedVersions({ left: firstVersion, right: version }));
      }
      setSelectedVersions(new Set());
    } else {
      const newSelection = new Set(selectedVersions);
      if (newSelection.has(version.id)) {
        newSelection.delete(version.id);
      } else {
        newSelection.add(version.id);
      }
      setSelectedVersions(newSelection);
      
      if (onVersionSelect && newSelection.size === 1) {
        onVersionSelect(version);
      }
    }
  };

  const handleExpandClick = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, version: Version) => {
    setAnchorEl(event.currentTarget);
    setContextVersion(version);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setContextVersion(null);
  };

  const handleRestore = async () => {
    if (contextVersion) {
      await dispatch(restoreVersion({
        versionId: contextVersion.id,
        createBackup: true,
        author: { userId: 'current-user', email: 'user@example.com', name: 'Current User', timestamp: new Date() }
      }));
      handleMenuClose();
    }
  };

  const handleSearch = () => {
    if (searchQuery) {
      dispatch(searchVersions({
        documentId,
        filters: { searchQuery }
      }));
    }
  };

  const getVersionStatusColor = (version: Version) => {
    if (version.isBaseline) return 'primary';
    if (version.metadata.tags?.includes('backup')) return 'warning';
    if (version.metadata.tags?.includes('restore-point')) return 'info';
    return 'default';
  };

  const renderVersionDiff = (version: Version) => {
    if (!version.diff) return null;
    
    return (
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        {version.diff.added > 0 && (
          <Chip
            size="small"
            label={`+${version.diff.added}`}
            color="success"
            variant="outlined"
          />
        )}
        {version.diff.removed > 0 && (
          <Chip
            size="small"
            label={`-${version.diff.removed}`}
            color="error"
            variant="outlined"
          />
        )}
        {version.diff.modified > 0 && (
          <Chip
            size="small"
            label={`~${version.diff.modified}`}
            color="warning"
            variant="outlined"
          />
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <HistoryIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Version History
        </Typography>
        {selectedVersions.size === 2 && (
          <Button
            variant="contained"
            startIcon={<CompareIcon />}
            size="small"
            onClick={() => {
              const selected = Array.from(selectedVersions);
              const v1 = versions.find(v => v.id === selected[0]);
              const v2 = versions.find(v => v.id === selected[1]);
              if (v1 && v2 && onCompare) {
                onCompare(v1, v2);
              }
            }}
          >
            Compare
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search versions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {versions.map((version, index) => (
          <React.Fragment key={version.id}>
            <ListItem
              button
              selected={selectedVersions.has(version.id)}
              onClick={() => handleVersionClick(version)}
              sx={{
                borderLeft: selectedVersions.has(version.id) ? '4px solid' : 'none',
                borderColor: 'primary.main'
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      v{version.version}
                    </Typography>
                    {version.isBaseline && (
                      <Chip label="Baseline" size="small" color="primary" />
                    )}
                    {version.metadata.tags?.map(tag => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {version.metadata.commitMessage || 'No message'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {version.metadata.createdBy} • {' '}
                      {formatDistanceToNow(version.metadata.createdAt, { addSuffix: true })}
                    </Typography>
                    {renderVersionDiff(version)}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={() => handleExpandClick(version.id)}
                >
                  {expandedVersions.has(version.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, version)}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            
            <Collapse in={expandedVersions.has(version.id)} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 2, py: 1, bgcolor: 'background.default' }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Size: {(version.metadata.size / 1024).toFixed(2)} KB
                </Typography>
                {version.metadata.branch && (
                  <Typography variant="caption" display="block" gutterBottom>
                    Branch: {version.metadata.branch}
                  </Typography>
                )}
                {version.checksum && (
                  <Typography variant="caption" display="block" gutterBottom>
                    Checksum: {version.checksum.substring(0, 8)}...
                  </Typography>
                )}
              </Box>
            </Collapse>
            
            {index < versions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRestore}>
          <RestoreIcon sx={{ mr: 1 }} fontSize="small" />
          Restore this version
        </MenuItem>
        <MenuItem onClick={() => {
          if (contextVersion && onVersionSelect) {
            onVersionSelect(contextVersion);
          }
          handleMenuClose();
        }}>
          <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
          View details
        </MenuItem>
      </Menu>
    </Paper>
  );
};