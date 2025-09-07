import { configureStore } from '@reduxjs/toolkit'
import tpnReducer from '@/features/tpn-calculations/model/tpnSlice'
import settingsReducer from '@/features/settings/store/settingsSlice'
import ingredientReducer from '@/features/ingredient-management/store/ingredientSlice'

/**
 * Simplified store configuration for Storybook stories
 * Only includes reducers that are actually used in page components
 */
export const createMockStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      tpn: tpnReducer,
      settings: settingsReducer,
      ingredients: ingredientReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for Storybook
      }),
  })
}

export type MockRootState = ReturnType<ReturnType<typeof createMockStore>['getState']>
export type MockAppDispatch = ReturnType<typeof createMockStore>['dispatch']