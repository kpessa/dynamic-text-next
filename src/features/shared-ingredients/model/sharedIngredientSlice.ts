import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  SharedIngredient,
  DuplicateGroup,
  SyncConflict,
  MigrationResult,
  SharedIngredientFilter,
  SharedIngredientStats
} from '@/entities/shared-ingredient';
import { DeduplicationService } from '../lib/deduplicationService';
import { ReferenceCountingService } from '../lib/referenceCountingService';
import { SyncService } from '../lib/syncService';
import { PermissionService } from '../lib/permissionService';
import { MigrationService } from '../lib/migrationService';

interface SharedIngredientState {
  ingredients: SharedIngredient[];
  selectedIngredient: SharedIngredient | null;
  duplicateGroups: DuplicateGroup[];
  conflicts: SyncConflict[];
  syncStatus: {
    syncing: boolean;
    lastSync: Date | null;
    errors: string[];
  };
  migrationStatus: {
    inProgress: boolean;
    result: MigrationResult | null;
  };
  stats: SharedIngredientStats | null;
  loading: boolean;
  error: string | null;
  filters: SharedIngredientFilter;
}

const initialState: SharedIngredientState = {
  ingredients: [],
  selectedIngredient: null,
  duplicateGroups: [],
  conflicts: [],
  syncStatus: {
    syncing: false,
    lastSync: null,
    errors: []
  },
  migrationStatus: {
    inProgress: false,
    result: null
  },
  stats: null,
  loading: false,
  error: null,
  filters: {}
};

export const fetchSharedIngredients = createAsyncThunk(
  'sharedIngredients/fetch',
  async (filter?: SharedIngredientFilter) => {
    // This would fetch from Firebase
    return [] as SharedIngredient[];
  }
);

export const detectDuplicates = createAsyncThunk(
  'sharedIngredients/detectDuplicates',
  async (ingredients: SharedIngredient[]) => {
    const service = DeduplicationService.getInstance();
    return await service.detectDuplicates(ingredients);
  }
);

export const updateReferenceCount = createAsyncThunk(
  'sharedIngredients/updateReferenceCount',
  async (ingredientId: string) => {
    const service = ReferenceCountingService.getInstance();
    return await service.updateReferenceCount(ingredientId);
  }
);

export const syncIngredient = createAsyncThunk(
  'sharedIngredients/sync',
  async (params: { id: string; changes: Partial<SharedIngredient> }) => {
    const service = SyncService.getInstance();
    await service.syncSharedIngredient(params.id, params.changes);
    return params.id;
  }
);

export const migrateIngredients = createAsyncThunk(
  'sharedIngredients/migrate',
  async (params: { ingredients: any[]; options: any }) => {
    const service = MigrationService.getInstance();
    return await service.migrate(params.ingredients, params.options);
  }
);

const sharedIngredientSlice = createSlice({
  name: 'sharedIngredients',
  initialState,
  reducers: {
    setSelectedIngredient: (state, action: PayloadAction<SharedIngredient | null>) => {
      state.selectedIngredient = action.payload;
    },
    addConflict: (state, action: PayloadAction<SyncConflict>) => {
      state.conflicts.push(action.payload);
    },
    resolveConflict: (state, action: PayloadAction<string>) => {
      state.conflicts = state.conflicts.filter(c => c.ingredientId !== action.payload);
    },
    setFilters: (state, action: PayloadAction<SharedIngredientFilter>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocalIngredient: (state, action: PayloadAction<SharedIngredient>) => {
      const index = state.ingredients.findIndex(i => i.id === action.payload.id);
      if (index >= 0) {
        state.ingredients[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSharedIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSharedIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.ingredients = action.payload;
      })
      .addCase(fetchSharedIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ingredients';
      })
      
      .addCase(detectDuplicates.fulfilled, (state, action) => {
        state.duplicateGroups = action.payload;
      })
      
      .addCase(syncIngredient.pending, (state) => {
        state.syncStatus.syncing = true;
      })
      .addCase(syncIngredient.fulfilled, (state) => {
        state.syncStatus.syncing = false;
        state.syncStatus.lastSync = new Date();
      })
      .addCase(syncIngredient.rejected, (state, action) => {
        state.syncStatus.syncing = false;
        state.syncStatus.errors.push(action.error.message || 'Sync failed');
      })
      
      .addCase(migrateIngredients.pending, (state) => {
        state.migrationStatus.inProgress = true;
      })
      .addCase(migrateIngredients.fulfilled, (state, action) => {
        state.migrationStatus.inProgress = false;
        state.migrationStatus.result = action.payload;
      })
      .addCase(migrateIngredients.rejected, (state) => {
        state.migrationStatus.inProgress = false;
      });
  }
});

export const {
  setSelectedIngredient,
  addConflict,
  resolveConflict,
  setFilters,
  clearError,
  updateLocalIngredient
} = sharedIngredientSlice.actions;

export const selectSharedIngredients = (state: { sharedIngredients: SharedIngredientState }) =>
  state.sharedIngredients.ingredients;

export const selectSelectedIngredient = (state: { sharedIngredients: SharedIngredientState }) =>
  state.sharedIngredients.selectedIngredient;

export const selectDuplicateGroups = (state: { sharedIngredients: SharedIngredientState }) =>
  state.sharedIngredients.duplicateGroups;

export const selectConflicts = (state: { sharedIngredients: SharedIngredientState }) =>
  state.sharedIngredients.conflicts;

export const selectSyncStatus = (state: { sharedIngredients: SharedIngredientState }) =>
  state.sharedIngredients.syncStatus;

export const selectMigrationStatus = (state: { sharedIngredients: SharedIngredientState }) =>
  state.sharedIngredients.migrationStatus;

export default sharedIngredientSlice.reducer;