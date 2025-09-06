import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Sync as SyncIcon,
  ContentCopy as DuplicateIcon,
  Warning as ConflictIcon,
  Upload as ImportIcon,
  MoreVert as MoreIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchSharedIngredients,
  detectDuplicates,
  syncIngredient,
  selectSharedIngredients,
  selectDuplicateGroups,
  selectConflicts,
  selectSyncStatus,
  setFilters
} from '../model/sharedIngredientSlice';
import { SharedIngredient, SharedIngredientFilter } from '@/entities/shared-ingredient';
import { DataTable } from '@/shared/ui/organisms/DataTable/DataTable';
import { EmptyState } from '@/shared/ui/organisms/EmptyState/EmptyState';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ingredient-tabpanel-${index}`}
      aria-labelledby={`ingredient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SharedIngredientManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector(selectSharedIngredients);
  const duplicateGroups = useAppSelector(selectDuplicateGroups);
  const conflicts = useAppSelector(selectConflicts);
  const syncStatus = useAppSelector(selectSyncStatus);
  
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<SharedIngredientFilter>({});
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    dispatch(fetchSharedIngredients(selectedFilter));
  }, [dispatch, selectedFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setSelectedFilter({ ...selectedFilter, search: event.target.value });
  };

  const handleSync = async () => {
    for (const id of selectedIngredients) {
      const ingredient = ingredients.find(i => i.id === id);
      if (ingredient) {
        await dispatch(syncIngredient({ id, changes: ingredient }));
      }
    }
  };

  const handleDetectDuplicates = () => {
    dispatch(detectDuplicates(ingredients));
    setTabValue(1); // Switch to duplicates tab
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterSelect = (filterType: keyof SharedIngredientFilter, value: any) => {
    setSelectedFilter({ ...selectedFilter, [filterType]: value });
    dispatch(setFilters({ ...selectedFilter, [filterType]: value }));
    handleFilterClose();
  };

  const columns = [
    {
      id: 'select',
      label: '',
      width: 50,
      render: (row: SharedIngredient) => (
        <input
          type="checkbox"
          checked={selectedIngredients.includes(row.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIngredients([...selectedIngredients, row.id]);
            } else {
              setSelectedIngredients(selectedIngredients.filter(id => id !== row.id));
            }
          }}
        />
      )
    },
    {
      id: 'displayName',
      label: 'Name',
      sortable: true,
      render: (row: SharedIngredient) => (
        <Box>
          <Typography variant="body2">{row.displayName}</Typography>
          {row.metadata.isPublic && (
            <Chip label="Public" size="small" color="primary" sx={{ ml: 1 }} />
          )}
        </Box>
      )
    },
    {
      id: 'category',
      label: 'Category',
      sortable: true
    },
    {
      id: 'unit',
      label: 'Unit',
      width: 100
    },
    {
      id: 'usage',
      label: 'Usage',
      width: 120,
      render: (row: SharedIngredient) => (
        <Tooltip title={`Last used: ${row.usage.lastUsed?.toLocaleDateString() || 'Never'}`}>
          <Chip 
            label={`${row.usage.referenceCount} refs`} 
            size="small" 
            variant="outlined"
          />
        </Tooltip>
      )
    },
    {
      id: 'status',
      label: 'Status',
      width: 100,
      render: (row: SharedIngredient) => {
        const hasConflict = conflicts.some(c => c.ingredientId === row.id);
        const isDuplicate = duplicateGroups.some(g => 
          g.ingredients.some(i => i.id === row.id)
        );
        
        if (hasConflict) {
          return <Chip label="Conflict" size="small" color="error" icon={<ConflictIcon />} />;
        }
        if (isDuplicate) {
          return <Chip label="Duplicate" size="small" color="warning" icon={<DuplicateIcon />} />;
        }
        return <Chip label="OK" size="small" color="success" icon={<CheckIcon />} />;
      }
    },
    {
      id: 'actions',
      label: '',
      width: 50,
      render: (row: SharedIngredient) => (
        <IconButton size="small" onClick={(e) => setMoreMenuAnchor(e.currentTarget)}>
          <MoreIcon />
        </IconButton>
      )
    }
  ];

  const filteredIngredients = ingredients.filter(ing => 
    ing.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Shared Ingredients Repository
          </Typography>
          
          <TextField
            size="small"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          
          <Tooltip title="Filter">
            <IconButton onClick={handleFilterClick}>
              <Badge badgeContent={Object.keys(selectedFilter).length} color="primary">
                <FilterIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Detect Duplicates">
            <IconButton onClick={handleDetectDuplicates}>
              <Badge badgeContent={duplicateGroups.length} color="warning">
                <DuplicateIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Sync Selected">
            <IconButton 
              onClick={handleSync} 
              disabled={selectedIngredients.length === 0 || syncStatus.syncing}
            >
              {syncStatus.syncing ? <CircularProgress size={24} /> : <SyncIcon />}
            </IconButton>
          </Tooltip>
          
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Ingredient
          </Button>
        </Box>
        
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`All (${ingredients.length})`} />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Duplicates
                {duplicateGroups.length > 0 && (
                  <Chip label={duplicateGroups.length} size="small" color="warning" />
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Conflicts
                {conflicts.length > 0 && (
                  <Chip label={conflicts.length} size="small" color="error" />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {filteredIngredients.length > 0 ? (
          <DataTable
            data={filteredIngredients}
            columns={columns}
            onSort={(column, direction) => {
              // Handle sorting
            }}
          />
        ) : (
          <EmptyState
            title="No ingredients found"
            description="Try adjusting your search or filters"
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setSelectedFilter({});
            }}
          />
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {duplicateGroups.length > 0 ? (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Found {duplicateGroups.length} groups of potential duplicates
            </Alert>
            {/* Duplicate groups display would go here */}
          </Box>
        ) : (
          <EmptyState
            title="No duplicates detected"
            description="All ingredients appear to be unique"
          />
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {conflicts.length > 0 ? (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {conflicts.length} sync conflicts need resolution
            </Alert>
            {/* Conflicts display would go here */}
          </Box>
        ) : (
          <EmptyState
            title="No conflicts"
            description="All ingredients are in sync"
          />
        )}
      </TabPanel>
      
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleFilterSelect('category', 'Amino Acids')}>
          Amino Acids
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('category', 'Vitamins')}>
          Vitamins
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('category', 'Minerals')}>
          Minerals
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('isActive', true)}>
          Active Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect('hasCustomizations', true)}>
          Has Customizations
        </MenuItem>
      </Menu>
      
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
      >
        <MenuItem>Edit</MenuItem>
        <MenuItem>View Details</MenuItem>
        <MenuItem>View History</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem>Archive</MenuItem>
      </Menu>
    </Paper>
  );
};