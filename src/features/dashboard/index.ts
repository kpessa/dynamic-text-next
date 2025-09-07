// Dashboard Feature Public API

export {
  fetchDashboardData,
  refreshDashboard,
  setUser,
  clearDashboard,
  updateStatistics,
  selectDashboardUser,
  selectRecentCalculations,
  selectRecentIngredients,
  selectDashboardStatistics,
  selectDashboardLoading,
  selectDashboardError,
  selectLastRefreshed,
} from './model/dashboardSlice'

export type { DashboardStatistics } from './model/dashboardSlice'