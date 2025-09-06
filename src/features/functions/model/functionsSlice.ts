import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { 
  callFunction, 
  callFunctionWithRetry,
  getUserFriendlyError 
} from '@/shared/lib/firebase/functionsService'
import { CloudFunctionName, CloudFunctionInput, CloudFunctionOutput } from '@/shared/types/functions/cloudFunctions'

export interface FunctionCall {
  functionName: string
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  result: unknown
  startedAt?: number
  completedAt?: number
  attemptCount?: number
}

export interface FunctionsState {
  calls: Record<string, FunctionCall>
  activeCallsCount: number
  lastError: string | null
  history: Array<{
    functionName: string
    status: 'succeeded' | 'failed'
    timestamp: number
    duration?: number
  }>
}

const initialState: FunctionsState = {
  calls: {},
  activeCallsCount: 0,
  lastError: null,
  history: [],
}

interface CallFunctionParams<T extends CloudFunctionName> {
  functionName: T
  data: CloudFunctionInput<T>
  options?: {
    retry?: boolean
    maxRetries?: number
    timeoutMs?: number
  }
}

export const callCloudFunction = createAsyncThunk(
  'functions/call',
  async <T extends CloudFunctionName>(
    params: CallFunctionParams<T>
  ): Promise<{ functionName: T; result: CloudFunctionOutput<T>; duration: number }> => {
    const startTime = Date.now()
    
    try {
      let result: CloudFunctionOutput<T>
      
      if (params.options?.retry) {
        result = await callFunctionWithRetry<CloudFunctionInput<T>, CloudFunctionOutput<T>>(
          params.functionName,
          params.data,
          { maxRetries: params.options.maxRetries }
        )
      } else {
        result = await callFunction<CloudFunctionInput<T>, CloudFunctionOutput<T>>(
          params.functionName,
          params.data
        )
      }
      
      const duration = Date.now() - startTime
      return { functionName: params.functionName, result, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      throw {
        functionName: params.functionName,
        error: getUserFriendlyError(error),
        duration,
      }
    }
  }
)

const functionsSlice = createSlice({
  name: 'functions',
  initialState,
  reducers: {
    functionCallStart: (
      state,
      action: PayloadAction<{ functionName: string; startedAt: number }>
    ) => {
      const { functionName, startedAt } = action.payload
      state.calls[functionName] = {
        functionName,
        status: 'loading',
        error: null,
        result: null,
        startedAt,
        attemptCount: (state.calls[functionName]?.attemptCount || 0) + 1,
      }
      state.activeCallsCount++
    },
    
    functionCallSuccess: (
      state,
      action: PayloadAction<{
        functionName: string
        result: unknown
        completedAt: number
        duration: number
      }>
    ) => {
      const { functionName, result, completedAt, duration } = action.payload
      const call = state.calls[functionName]
      if (call) {
        call.status = 'succeeded'
        call.result = result
        call.completedAt = completedAt
        call.error = null
      }
      state.activeCallsCount = Math.max(0, state.activeCallsCount - 1)
      state.lastError = null
      
      state.history.push({
        functionName,
        status: 'succeeded',
        timestamp: completedAt,
        duration,
      })
      
      if (state.history.length > 100) {
        state.history = state.history.slice(-100)
      }
    },
    
    functionCallError: (
      state,
      action: PayloadAction<{
        functionName: string
        error: string
        completedAt: number
        duration: number
      }>
    ) => {
      const { functionName, error, completedAt, duration } = action.payload
      const call = state.calls[functionName]
      if (call) {
        call.status = 'failed'
        call.error = error
        call.completedAt = completedAt
      }
      state.activeCallsCount = Math.max(0, state.activeCallsCount - 1)
      state.lastError = error
      
      state.history.push({
        functionName,
        status: 'failed',
        timestamp: completedAt,
        duration,
      })
      
      if (state.history.length > 100) {
        state.history = state.history.slice(-100)
      }
    },
    
    clearFunctionCall: (state, action: PayloadAction<string>) => {
      delete state.calls[action.payload]
    },
    
    clearAllFunctionCalls: (state) => {
      state.calls = {}
      state.activeCallsCount = 0
    },
    
    clearFunctionHistory: (state) => {
      state.history = []
    },
    
    clearLastError: (state) => {
      state.lastError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(callCloudFunction.pending, (state, action) => {
        const functionName = action.meta.arg.functionName
        state.calls[functionName] = {
          functionName,
          status: 'loading',
          error: null,
          result: null,
          startedAt: Date.now(),
          attemptCount: (state.calls[functionName]?.attemptCount || 0) + 1,
        }
        state.activeCallsCount++
      })
      .addCase(callCloudFunction.fulfilled, (state, action) => {
        const { functionName, result, duration } = action.payload
        const completedAt = Date.now()
        
        // Ensure the call object exists
        if (!state.calls[functionName]) {
          state.calls[functionName] = {
            functionName,
            status: 'idle',
            error: null,
            result: null,
          }
        }
        
        const call = state.calls[functionName]
        call.status = 'succeeded'
        call.result = result
        call.completedAt = completedAt
        call.error = null
        
        state.activeCallsCount = Math.max(0, state.activeCallsCount - 1)
        state.lastError = null
        
        state.history.push({
          functionName,
          status: 'succeeded',
          timestamp: completedAt,
          duration,
        })
        
        if (state.history.length > 100) {
          state.history = state.history.slice(-100)
        }
      })
      .addCase(callCloudFunction.rejected, (state, action) => {
        const error = action.error as { functionName?: string; error?: string; message?: string; duration?: number }
        const functionName = error?.functionName || action.meta.arg.functionName
        const errorMessage = error?.error || error?.message || 'Function call failed'
        const duration = error?.duration || 0
        const completedAt = Date.now()
        
        // Ensure the call object exists
        if (!state.calls[functionName]) {
          state.calls[functionName] = {
            functionName,
            status: 'idle',
            error: null,
            result: null,
          }
        }
        
        const call = state.calls[functionName]
        call.status = 'failed'
        call.error = errorMessage
        call.completedAt = completedAt
        
        state.activeCallsCount = Math.max(0, state.activeCallsCount - 1)
        state.lastError = errorMessage
        
        state.history.push({
          functionName,
          status: 'failed',
          timestamp: completedAt,
          duration,
        })
        
        if (state.history.length > 100) {
          state.history = state.history.slice(-100)
        }
      })
  },
})

export const {
  functionCallStart,
  functionCallSuccess,
  functionCallError,
  clearFunctionCall,
  clearAllFunctionCalls,
  clearFunctionHistory,
  clearLastError,
} = functionsSlice.actions

export default functionsSlice.reducer

export const selectFunctionCall = (state: { functions: FunctionsState }, functionName: string) =>
  state.functions.calls[functionName]

export const selectFunctionLoading = (state: { functions: FunctionsState }, functionName: string) =>
  state.functions.calls[functionName]?.status === 'loading'

export const selectFunctionResult = (state: { functions: FunctionsState }, functionName: string) =>
  state.functions.calls[functionName]?.result

export const selectFunctionError = (state: { functions: FunctionsState }, functionName: string) =>
  state.functions.calls[functionName]?.error

export const selectActiveCallsCount = (state: { functions: FunctionsState }) =>
  state.functions.activeCallsCount

export const selectLastError = (state: { functions: FunctionsState }) =>
  state.functions.lastError

export const selectFunctionHistory = (state: { functions: FunctionsState }) =>
  state.functions.history

export const selectRecentSuccesses = (state: { functions: FunctionsState }, limit = 10) =>
  state.functions.history
    .filter(h => h.status === 'succeeded')
    .slice(-limit)

export const selectRecentFailures = (state: { functions: FunctionsState }, limit = 10) =>
  state.functions.history
    .filter(h => h.status === 'failed')
    .slice(-limit)

export const selectAverageDuration = (state: { functions: FunctionsState }, functionName?: string) => {
  const relevantHistory = functionName
    ? state.functions.history.filter(h => h.functionName === functionName)
    : state.functions.history
  
  const withDuration = relevantHistory.filter(h => h.duration !== undefined)
  
  if (withDuration.length === 0) return 0
  
  const totalDuration = withDuration.reduce((sum, h) => sum + (h.duration || 0), 0)
  return Math.round(totalDuration / withDuration.length)
}