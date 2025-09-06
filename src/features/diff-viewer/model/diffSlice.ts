import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  ComparisonService, 
  ComparisonResult, 
  ComparisonRequest,
  PopulationType 
} from '../lib/comparisonService';
import { DiffOptions } from '../lib/diffEngine';
import { SharedIngredient } from '@/entities/shared-ingredient';
import { Ingredient } from '@/entities/ingredient/types';

export interface DiffViewerState {
  // Current comparison
  currentComparison: ComparisonResult | null;
  currentIngredient: (SharedIngredient | Ingredient) | null;
  
  // UI state
  viewMode: 'side-by-side' | 'unified';
  showIdentical: boolean;
  granularity: 'line' | 'word' | 'char';
  
  // Selection state
  selectedPopulations: PopulationType[];
  selectedVersions: { v1: number; v2: number } | null;
  comparisonMode: 'populations' | 'versions';
  
  // History
  comparisonHistory: ComparisonResult[];
  
  // Loading and error state
  loading: boolean;
  error: string | null;
  
  // Export state
  exportInProgress: boolean;
  lastExportedAt: Date | null;
}

const initialState: DiffViewerState = {
  currentComparison: null,
  currentIngredient: null,
  viewMode: 'side-by-side',
  showIdentical: true,
  granularity: 'line',
  selectedPopulations: [],
  selectedVersions: null,
  comparisonMode: 'populations',
  comparisonHistory: [],
  loading: false,
  error: null,
  exportInProgress: false,
  lastExportedAt: null
};

// Async thunks
export const comparePopulations = createAsyncThunk(
  'diffViewer/comparePopulations',
  async ({ 
    ingredient, 
    populations, 
    options 
  }: { 
    ingredient: SharedIngredient | Ingredient;
    populations: PopulationType[];
    options?: Partial<DiffOptions>;
  }) => {
    const service = ComparisonService.getInstance();
    return await service.comparePopulations(ingredient, populations, options);
  }
);

export const compareVersions = createAsyncThunk(
  'diffViewer/compareVersions',
  async ({ 
    ingredient, 
    population, 
    version1, 
    version2, 
    options 
  }: { 
    ingredient: SharedIngredient | Ingredient;
    population: PopulationType;
    version1: number;
    version2: number;
    options?: Partial<DiffOptions>;
  }) => {
    const service = ComparisonService.getInstance();
    return await service.compareVersions(ingredient, population, version1, version2, options);
  }
);

export const performComparison = createAsyncThunk(
  'diffViewer/performComparison',
  async (request: ComparisonRequest, { getState }) => {
    const state = getState() as { diffViewer: DiffViewerState };
    const service = ComparisonService.getInstance();
    
    // Get ingredient from state or fetch it
    const ingredient = state.diffViewer.currentIngredient;
    if (!ingredient) {
      throw new Error('No ingredient selected for comparison');
    }
    
    if (request.mode === 'populations' && request.populations) {
      return await service.comparePopulations(
        ingredient, 
        request.populations, 
        request.options
      );
    } else if (request.mode === 'versions' && request.versions) {
      const population = state.diffViewer.selectedPopulations[0] || 'neonatal';
      return await service.compareVersions(
        ingredient,
        population,
        request.versions.v1,
        request.versions.v2,
        request.options
      );
    }
    
    throw new Error('Invalid comparison request');
  }
);

const diffSlice = createSlice({
  name: 'diffViewer',
  initialState,
  reducers: {
    setIngredient: (state, action: PayloadAction<SharedIngredient | Ingredient | null>) => {
      state.currentIngredient = action.payload;
      // Reset comparison when ingredient changes
      if (action.payload?.id !== state.currentIngredient?.id) {
        state.currentComparison = null;
      }
    },
    
    setViewMode: (state, action: PayloadAction<'side-by-side' | 'unified'>) => {
      state.viewMode = action.payload;
    },
    
    setShowIdentical: (state, action: PayloadAction<boolean>) => {
      state.showIdentical = action.payload;
    },
    
    setGranularity: (state, action: PayloadAction<'line' | 'word' | 'char'>) => {
      state.granularity = action.payload;
    },
    
    setComparisonMode: (state, action: PayloadAction<'populations' | 'versions'>) => {
      state.comparisonMode = action.payload;
    },
    
    setSelectedPopulations: (state, action: PayloadAction<PopulationType[]>) => {
      state.selectedPopulations = action.payload;
    },
    
    togglePopulation: (state, action: PayloadAction<PopulationType>) => {
      const population = action.payload;
      const index = state.selectedPopulations.indexOf(population);
      
      if (index >= 0) {
        state.selectedPopulations.splice(index, 1);
      } else {
        state.selectedPopulations.push(population);
      }
    },
    
    setSelectedVersions: (state, action: PayloadAction<{ v1: number; v2: number } | null>) => {
      state.selectedVersions = action.payload;
    },
    
    clearComparison: (state) => {
      state.currentComparison = null;
      state.error = null;
    },
    
    addToHistory: (state, action: PayloadAction<ComparisonResult>) => {
      // Keep only last 10 comparisons
      state.comparisonHistory = [
        action.payload,
        ...state.comparisonHistory.slice(0, 9)
      ];
    },
    
    clearHistory: (state) => {
      state.comparisonHistory = [];
    },
    
    setExportInProgress: (state, action: PayloadAction<boolean>) => {
      state.exportInProgress = action.payload;
      if (!action.payload) {
        state.lastExportedAt = new Date();
      }
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Compare populations
    builder
      .addCase(comparePopulations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(comparePopulations.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComparison = action.payload;
        state.comparisonHistory = [
          action.payload,
          ...state.comparisonHistory.slice(0, 9)
        ];
      })
      .addCase(comparePopulations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to compare populations';
      });
    
    // Compare versions
    builder
      .addCase(compareVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(compareVersions.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComparison = action.payload;
        state.comparisonHistory = [
          action.payload,
          ...state.comparisonHistory.slice(0, 9)
        ];
      })
      .addCase(compareVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to compare versions';
      });
    
    // Perform comparison
    builder
      .addCase(performComparison.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.currentComparison = action.payload;
        state.comparisonHistory = [
          action.payload,
          ...state.comparisonHistory.slice(0, 9)
        ];
      })
      .addCase(performComparison.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Comparison failed';
      });
  }
});

export const {
  setIngredient,
  setViewMode,
  setShowIdentical,
  setGranularity,
  setComparisonMode,
  setSelectedPopulations,
  togglePopulation,
  setSelectedVersions,
  clearComparison,
  addToHistory,
  clearHistory,
  setExportInProgress,
  clearError
} = diffSlice.actions;

// Selectors
export const selectCurrentComparison = (state: { diffViewer: DiffViewerState }) => 
  state.diffViewer.currentComparison;

export const selectCurrentIngredient = (state: { diffViewer: DiffViewerState }) => 
  state.diffViewer.currentIngredient;

export const selectViewOptions = (state: { diffViewer: DiffViewerState }) => ({
  viewMode: state.diffViewer.viewMode,
  showIdentical: state.diffViewer.showIdentical,
  granularity: state.diffViewer.granularity
});

export const selectComparisonMode = (state: { diffViewer: DiffViewerState }) => 
  state.diffViewer.comparisonMode;

export const selectSelectedPopulations = (state: { diffViewer: DiffViewerState }) => 
  state.diffViewer.selectedPopulations;

export const selectSelectedVersions = (state: { diffViewer: DiffViewerState }) => 
  state.diffViewer.selectedVersions;

export const selectComparisonHistory = (state: { diffViewer: DiffViewerState }) => 
  state.diffViewer.comparisonHistory;

export const selectLoadingState = (state: { diffViewer: DiffViewerState }) => ({
  loading: state.diffViewer.loading,
  error: state.diffViewer.error
});

export const selectExportState = (state: { diffViewer: DiffViewerState }) => ({
  exportInProgress: state.diffViewer.exportInProgress,
  lastExportedAt: state.diffViewer.lastExportedAt
});

export default diffSlice.reducer;