import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ThemeSettings {
  mode: 'light' | 'dark'
  primaryColor: string
  fontSize: 'small' | 'medium' | 'large'
}

interface CalculationSettings {
  precision: number
  defaultPopulation: 'ADULT' | 'PEDIATRIC' | 'NEONATAL'
  autoCalculate: boolean
}

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
}

interface DataManagementSettings {
  autoSave: boolean
  saveInterval: number
  backupEnabled: boolean
}

interface SettingsState {
  theme: ThemeSettings
  calculation: CalculationSettings
  notifications: NotificationSettings
  dataManagement: DataManagementSettings
}

const initialState: SettingsState = {
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
    fontSize: 'medium',
  },
  calculation: {
    precision: 2,
    defaultPopulation: 'ADULT',
    autoCalculate: true,
  },
  notifications: {
    enabled: true,
    sound: false,
    desktop: false,
  },
  dataManagement: {
    autoSave: true,
    saveInterval: 60,
    backupEnabled: false,
  },
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme.mode = action.payload
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.theme.fontSize = action.payload
    },
    updateCalculationSettings: (state, action: PayloadAction<Partial<CalculationSettings>>) => {
      state.calculation = { ...state.calculation, ...action.payload }
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload }
    },
    updateDataManagementSettings: (state, action: PayloadAction<Partial<DataManagementSettings>>) => {
      state.dataManagement = { ...state.dataManagement, ...action.payload }
    },
    resetSettings: () => initialState,
  },
})

export const {
  setThemeMode,
  setPrimaryColor,
  setFontSize,
  updateCalculationSettings,
  updateNotificationSettings,
  updateDataManagementSettings,
  resetSettings,
} = settingsSlice.actions

export default settingsSlice.reducer