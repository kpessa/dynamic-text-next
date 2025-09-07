import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { TPNCalculation } from '@/entities/calculation'
import type { SimpleIngredient } from '@/entities/ingredient/types'

export interface DashboardStatistics {
  totalCalculations: number
  totalIngredients: number
  weeklyActivity: number
  monthlyGrowth: {
    calculations: number
    ingredients: number
  }
}

interface DashboardState {
  user: {
    name: string
    email: string
    lastLogin: Date | string | null
  } | null
  recentCalculations: TPNCalculation[]
  recentIngredients: SimpleIngredient[]
  statistics: DashboardStatistics
  isLoading: boolean
  error: string | null
  lastRefreshed: Date | string | null
}

const initialState: DashboardState = {
  user: null,
  recentCalculations: [],
  recentIngredients: [],
  statistics: {
    totalCalculations: 0,
    totalIngredients: 0,
    weeklyActivity: 0,
    monthlyGrowth: {
      calculations: 0,
      ingredients: 0,
    },
  },
  isLoading: false,
  error: null,
  lastRefreshed: null,
}

// Mock data for development
const mockCalculations: TPNCalculation[] = [
  {
    id: '1',
    patientId: 'P001',
    patientName: 'Baby Smith',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    populationType: 'NEO',
    status: 'completed',
  },
  {
    id: '2',
    patientId: 'P002',
    patientName: 'Child Johnson',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    populationType: 'CHILD',
    status: 'completed',
  },
  {
    id: '3',
    patientId: 'P003',
    patientName: 'Adult Williams',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    populationType: 'ADULT',
    status: 'draft',
  },
  {
    id: '4',
    patientId: 'P004',
    patientName: 'Neonate Brown',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    populationType: 'NEO',
    status: 'completed',
  },
  {
    id: '5',
    patientId: 'P005',
    patientName: 'Pediatric Davis',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    populationType: 'CHILD',
    status: 'completed',
  },
]

const mockIngredients: SimpleIngredient[] = [
  {
    id: '1',
    name: 'Calcium Gluconate 10%',
    category: 'Electrolytes',
    lastModified: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    isShared: false,
  },
  {
    id: '2',
    name: 'Magnesium Sulfate',
    category: 'Electrolytes',
    lastModified: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    isShared: true,
  },
  {
    id: '3',
    name: 'Potassium Chloride',
    category: 'Electrolytes',
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    isShared: false,
  },
  {
    id: '4',
    name: 'Dextrose 70%',
    category: 'Carbohydrates',
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    isShared: true,
  },
  {
    id: '5',
    name: 'Amino Acids 10%',
    category: 'Proteins',
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    isShared: false,
  },
  {
    id: '6',
    name: 'Lipids 20%',
    category: 'Fats',
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isShared: true,
  },
  {
    id: '7',
    name: 'Sodium Phosphate',
    category: 'Electrolytes',
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    isShared: false,
  },
  {
    id: '8',
    name: 'Zinc Sulfate',
    category: 'Trace Elements',
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isShared: true,
  },
  {
    id: '9',
    name: 'Multivitamins',
    category: 'Vitamins',
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(), // 2.5 days ago
    isShared: false,
  },
  {
    id: '10',
    name: 'Heparin',
    category: 'Additives',
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    isShared: true,
  },
]

// Async thunks for fetching data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // In production, this would fetch from Firestore
    return {
      user: {
        name: 'Dr. Jane Smith',
        email: 'jane.smith@hospital.com',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      recentCalculations: mockCalculations,
      recentIngredients: mockIngredients,
      statistics: {
        totalCalculations: 156,
        totalIngredients: 42,
        weeklyActivity: 23,
        monthlyGrowth: {
          calculations: 12,
          ingredients: 5,
        },
      },
    }
  }
)

export const refreshDashboard = createAsyncThunk(
  'dashboard/refresh',
  async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Return updated data
    return {
      recentCalculations: mockCalculations,
      recentIngredients: mockIngredients,
      statistics: {
        totalCalculations: 157, // Incremented for demo
        totalIngredients: 42,
        weeklyActivity: 24,
        monthlyGrowth: {
          calculations: 12,
          ingredients: 5,
        },
      },
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<DashboardState['user']>) => {
      state.user = action.payload
    },
    clearDashboard: () => {
      return initialState
    },
    updateStatistics: (state, action: PayloadAction<Partial<DashboardStatistics>>) => {
      state.statistics = { ...state.statistics, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.recentCalculations = action.payload.recentCalculations
        state.recentIngredients = action.payload.recentIngredients
        state.statistics = action.payload.statistics
        state.lastRefreshed = new Date().toISOString()
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch dashboard data'
      })
      // Refresh dashboard
      .addCase(refreshDashboard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshDashboard.fulfilled, (state, action) => {
        state.isLoading = false
        state.recentCalculations = action.payload.recentCalculations
        state.recentIngredients = action.payload.recentIngredients
        state.statistics = action.payload.statistics
        state.lastRefreshed = new Date().toISOString()
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to refresh dashboard'
      })
  },
})

// Actions
export const { setUser, clearDashboard, updateStatistics } = dashboardSlice.actions

// Selectors
export const selectDashboardUser = (state: RootState) => state.dashboard.user
export const selectRecentCalculations = (state: RootState) => state.dashboard.recentCalculations
export const selectRecentIngredients = (state: RootState) => state.dashboard.recentIngredients
export const selectDashboardStatistics = (state: RootState) => state.dashboard.statistics
export const selectDashboardLoading = (state: RootState) => state.dashboard.isLoading
export const selectDashboardError = (state: RootState) => state.dashboard.error
export const selectLastRefreshed = (state: RootState) => state.dashboard.lastRefreshed

export default dashboardSlice.reducer