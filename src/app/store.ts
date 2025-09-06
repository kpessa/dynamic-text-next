import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from '@/features/auth/model/authSlice'
import tpnReducer from '@/features/tpn-calculations/model/tpnSlice'
import uiReducer from '@/features/ui/model/uiSlice'
import firebaseReducer from '@/features/firebase/model/firebaseSlice'
import simulationReducer from '@/entities/simulation/model/simulationSlice'
import referenceReducer from '@/entities/reference/model/referenceSlice'
import ingredientReducer from '@/entities/ingredient/model/ingredientSlice'
import { optimisticUpdatesMiddleware } from './store/middleware/optimisticUpdates'

// Persist config for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated']
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tpn: tpnReducer,
    ui: uiReducer,
    firebase: firebaseReducer,
    simulation: simulationReducer,
    reference: referenceReducer,
    ingredient: ingredientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(optimisticUpdatesMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch)

// Infer types from store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch