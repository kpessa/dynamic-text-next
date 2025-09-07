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
import navigationReducer from '@/features/ui/model/navigationSlice'
import dashboardReducer from '@/features/dashboard/model/dashboardSlice'
import firebaseReducer from '@/features/firebase/model/firebaseSlice'
import importReducer from '@/features/data-import/model/importSlice'
import configurationReducer from '@/features/data-import/model/configurationSlice'
import simulationReducer from '@/entities/simulation/model/simulationSlice'
import referenceReducer from '@/entities/reference/model/referenceSlice'
import ingredientReducer from '@/entities/ingredient/model/ingredientSlice'
import functionsReducer from '@/features/functions/model/functionsSlice'
import sectionReducer from '@/entities/section/model/sectionModel'
import editorReducer from '@/features/text-editor/model/editorSlice'
import kptReducer from '@/features/kpt-functions/model/kptSlice'
import aiTestReducer from '@/features/ai-test-generation/model/aiTestSlice'
import versionReducer from '@/features/version-history/model/versionSlice'
import sharedIngredientReducer from '@/features/shared-ingredients/model/sharedIngredientSlice'
import diffViewerReducer from '@/features/diff-viewer/model/diffSlice'
import { optimisticUpdatesMiddleware } from './store/middleware/optimisticUpdates'

// Persist config for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated']
}

// Persist config for editor (session persistence)
const editorPersistConfig = {
  key: 'editor',
  storage,
  whitelist: ['sections', 'ingredients']
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)
const persistedEditorReducer = persistReducer(editorPersistConfig, editorReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tpn: tpnReducer,
    ui: uiReducer,
    navigation: navigationReducer,
    dashboard: dashboardReducer,
    firebase: firebaseReducer,
    import: importReducer,
    configuration: configurationReducer,
    simulation: simulationReducer,
    reference: referenceReducer,
    ingredient: ingredientReducer,
    functions: functionsReducer,
    sections: sectionReducer,
    editor: persistedEditorReducer,
    kpt: kptReducer,
    aiTest: aiTestReducer,
    version: versionReducer,
    sharedIngredients: sharedIngredientReducer,
    diffViewer: diffViewerReducer,
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