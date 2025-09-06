import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import functionsReducer, {
  functionCallStart,
  functionCallSuccess,
  functionCallError,
  clearFunctionCall,
  clearAllFunctionCalls,
  clearFunctionHistory,
  clearLastError,
  callCloudFunction,
  selectFunctionCall,
  selectFunctionLoading,
  selectFunctionResult,
  selectFunctionError,
  selectActiveCallsCount,
  selectLastError,
  selectFunctionHistory,
  selectRecentSuccesses,
  selectRecentFailures,
  selectAverageDuration,
  FunctionsState,
} from './functionsSlice'

vi.mock('@/shared/lib/firebase/functionsService', () => ({
  callFunction: vi.fn(),
  callFunctionWithRetry: vi.fn(),
  getUserFriendlyError: vi.fn((error) => error?.message || 'Error occurred'),
}))

describe('functionsSlice', () => {
  let initialState: FunctionsState

  beforeEach(() => {
    initialState = {
      calls: {},
      activeCallsCount: 0,
      lastError: null,
      history: [],
    }
    vi.clearAllMocks()
  })

  describe('reducers', () => {
    it('should handle functionCallStart', () => {
      const state = functionsReducer(
        initialState,
        functionCallStart({
          functionName: 'testFunction',
          startedAt: 1000,
        })
      )

      expect(state.calls.testFunction).toEqual({
        functionName: 'testFunction',
        status: 'loading',
        error: null,
        result: null,
        startedAt: 1000,
        attemptCount: 1,
      })
      expect(state.activeCallsCount).toBe(1)
    })

    it('should increment attemptCount on repeated calls', () => {
      let state = functionsReducer(
        initialState,
        functionCallStart({
          functionName: 'testFunction',
          startedAt: 1000,
        })
      )

      state = functionsReducer(
        state,
        functionCallStart({
          functionName: 'testFunction',
          startedAt: 2000,
        })
      )

      expect(state.calls.testFunction.attemptCount).toBe(2)
    })

    it('should handle functionCallSuccess', () => {
      const stateWithCall = {
        ...initialState,
        calls: {
          testFunction: {
            functionName: 'testFunction',
            status: 'loading' as const,
            error: null,
            result: null,
            startedAt: 1000,
          },
        },
        activeCallsCount: 1,
      }

      const state = functionsReducer(
        stateWithCall,
        functionCallSuccess({
          functionName: 'testFunction',
          result: { data: 'success' },
          completedAt: 2000,
          duration: 1000,
        })
      )

      expect(state.calls.testFunction).toEqual({
        functionName: 'testFunction',
        status: 'succeeded',
        error: null,
        result: { data: 'success' },
        startedAt: 1000,
        completedAt: 2000,
      })
      expect(state.activeCallsCount).toBe(0)
      expect(state.lastError).toBeNull()
      expect(state.history).toHaveLength(1)
      expect(state.history[0]).toEqual({
        functionName: 'testFunction',
        status: 'succeeded',
        timestamp: 2000,
        duration: 1000,
      })
    })

    it('should handle functionCallError', () => {
      const stateWithCall = {
        ...initialState,
        calls: {
          testFunction: {
            functionName: 'testFunction',
            status: 'loading' as const,
            error: null,
            result: null,
            startedAt: 1000,
          },
        },
        activeCallsCount: 1,
      }

      const state = functionsReducer(
        stateWithCall,
        functionCallError({
          functionName: 'testFunction',
          error: 'Function failed',
          completedAt: 2000,
          duration: 1000,
        })
      )

      expect(state.calls.testFunction).toEqual({
        functionName: 'testFunction',
        status: 'failed',
        error: 'Function failed',
        result: null,
        startedAt: 1000,
        completedAt: 2000,
      })
      expect(state.activeCallsCount).toBe(0)
      expect(state.lastError).toBe('Function failed')
      expect(state.history).toHaveLength(1)
      expect(state.history[0]).toEqual({
        functionName: 'testFunction',
        status: 'failed',
        timestamp: 2000,
        duration: 1000,
      })
    })

    it('should handle clearFunctionCall', () => {
      const stateWithCalls = {
        ...initialState,
        calls: {
          function1: {
            functionName: 'function1',
            status: 'succeeded' as const,
            error: null,
            result: { data: '1' },
          },
          function2: {
            functionName: 'function2',
            status: 'failed' as const,
            error: 'Error',
            result: null,
          },
        },
      }

      const state = functionsReducer(
        stateWithCalls,
        clearFunctionCall('function1')
      )

      expect(state.calls).toEqual({
        function2: {
          functionName: 'function2',
          status: 'failed',
          error: 'Error',
          result: null,
        },
      })
    })

    it('should handle clearAllFunctionCalls', () => {
      const stateWithCalls = {
        ...initialState,
        calls: {
          function1: {
            functionName: 'function1',
            status: 'succeeded' as const,
            error: null,
            result: { data: '1' },
          },
          function2: {
            functionName: 'function2',
            status: 'loading' as const,
            error: null,
            result: null,
          },
        },
        activeCallsCount: 1,
      }

      const state = functionsReducer(stateWithCalls, clearAllFunctionCalls())

      expect(state.calls).toEqual({})
      expect(state.activeCallsCount).toBe(0)
    })

    it('should handle clearFunctionHistory', () => {
      const stateWithHistory = {
        ...initialState,
        history: [
          {
            functionName: 'function1',
            status: 'succeeded' as const,
            timestamp: 1000,
            duration: 100,
          },
          {
            functionName: 'function2',
            status: 'failed' as const,
            timestamp: 2000,
            duration: 200,
          },
        ],
      }

      const state = functionsReducer(stateWithHistory, clearFunctionHistory())

      expect(state.history).toEqual([])
    })

    it('should handle clearLastError', () => {
      const stateWithError = {
        ...initialState,
        lastError: 'Some error occurred',
      }

      const state = functionsReducer(stateWithError, clearLastError())

      expect(state.lastError).toBeNull()
    })

    it('should limit history to 100 entries', () => {
      let state = initialState

      for (let i = 0; i < 105; i++) {
        state = functionsReducer(
          state,
          functionCallSuccess({
            functionName: `function${i}`,
            result: { data: i },
            completedAt: i * 1000,
            duration: 100,
          })
        )
      }

      expect(state.history).toHaveLength(100)
      expect(state.history[0].functionName).toBe('function5')
      expect(state.history[99].functionName).toBe('function104')
    })
  })

  describe('selectors', () => {
    const createTestState = (functions: FunctionsState) => ({ functions })

    it('should select function call', () => {
      const state = createTestState({
        ...initialState,
        calls: {
          testFunction: {
            functionName: 'testFunction',
            status: 'loading',
            error: null,
            result: null,
          },
        },
      })

      expect(selectFunctionCall(state, 'testFunction')).toEqual({
        functionName: 'testFunction',
        status: 'loading',
        error: null,
        result: null,
      })
      expect(selectFunctionCall(state, 'nonExistent')).toBeUndefined()
    })

    it('should select function loading status', () => {
      const state = createTestState({
        ...initialState,
        calls: {
          loadingFunction: {
            functionName: 'loadingFunction',
            status: 'loading',
            error: null,
            result: null,
          },
          completedFunction: {
            functionName: 'completedFunction',
            status: 'succeeded',
            error: null,
            result: { data: 'result' },
          },
        },
      })

      expect(selectFunctionLoading(state, 'loadingFunction')).toBe(true)
      expect(selectFunctionLoading(state, 'completedFunction')).toBe(false)
      expect(selectFunctionLoading(state, 'nonExistent')).toBe(false)
    })

    it('should select function result', () => {
      const state = createTestState({
        ...initialState,
        calls: {
          testFunction: {
            functionName: 'testFunction',
            status: 'succeeded',
            error: null,
            result: { data: 'test result' },
          },
        },
      })

      expect(selectFunctionResult(state, 'testFunction')).toEqual({
        data: 'test result',
      })
    })

    it('should select function error', () => {
      const state = createTestState({
        ...initialState,
        calls: {
          testFunction: {
            functionName: 'testFunction',
            status: 'failed',
            error: 'Test error',
            result: null,
          },
        },
      })

      expect(selectFunctionError(state, 'testFunction')).toBe('Test error')
    })

    it('should select active calls count', () => {
      const state = createTestState({
        ...initialState,
        activeCallsCount: 3,
      })

      expect(selectActiveCallsCount(state)).toBe(3)
    })

    it('should select last error', () => {
      const state = createTestState({
        ...initialState,
        lastError: 'Last error message',
      })

      expect(selectLastError(state)).toBe('Last error message')
    })

    it('should select function history', () => {
      const history = [
        {
          functionName: 'function1',
          status: 'succeeded' as const,
          timestamp: 1000,
          duration: 100,
        },
        {
          functionName: 'function2',
          status: 'failed' as const,
          timestamp: 2000,
          duration: 200,
        },
      ]

      const state = createTestState({
        ...initialState,
        history,
      })

      expect(selectFunctionHistory(state)).toEqual(history)
    })

    it('should select recent successes', () => {
      const history = [
        {
          functionName: 'function1',
          status: 'succeeded' as const,
          timestamp: 1000,
          duration: 100,
        },
        {
          functionName: 'function2',
          status: 'failed' as const,
          timestamp: 2000,
          duration: 200,
        },
        {
          functionName: 'function3',
          status: 'succeeded' as const,
          timestamp: 3000,
          duration: 150,
        },
      ]

      const state = createTestState({
        ...initialState,
        history,
      })

      const successes = selectRecentSuccesses(state, 10)
      expect(successes).toHaveLength(2)
      expect(successes[0].functionName).toBe('function1')
      expect(successes[1].functionName).toBe('function3')
    })

    it('should select recent failures', () => {
      const history = [
        {
          functionName: 'function1',
          status: 'succeeded' as const,
          timestamp: 1000,
          duration: 100,
        },
        {
          functionName: 'function2',
          status: 'failed' as const,
          timestamp: 2000,
          duration: 200,
        },
        {
          functionName: 'function3',
          status: 'failed' as const,
          timestamp: 3000,
          duration: 150,
        },
      ]

      const state = createTestState({
        ...initialState,
        history,
      })

      const failures = selectRecentFailures(state, 10)
      expect(failures).toHaveLength(2)
      expect(failures[0].functionName).toBe('function2')
      expect(failures[1].functionName).toBe('function3')
    })

    it('should calculate average duration for all functions', () => {
      const history = [
        {
          functionName: 'function1',
          status: 'succeeded' as const,
          timestamp: 1000,
          duration: 100,
        },
        {
          functionName: 'function2',
          status: 'failed' as const,
          timestamp: 2000,
          duration: 200,
        },
        {
          functionName: 'function3',
          status: 'succeeded' as const,
          timestamp: 3000,
          duration: 150,
        },
      ]

      const state = createTestState({
        ...initialState,
        history,
      })

      expect(selectAverageDuration(state)).toBe(150) // (100 + 200 + 150) / 3
    })

    it('should calculate average duration for specific function', () => {
      const history = [
        {
          functionName: 'function1',
          status: 'succeeded' as const,
          timestamp: 1000,
          duration: 100,
        },
        {
          functionName: 'function1',
          status: 'failed' as const,
          timestamp: 2000,
          duration: 200,
        },
        {
          functionName: 'function2',
          status: 'succeeded' as const,
          timestamp: 3000,
          duration: 500,
        },
      ]

      const state = createTestState({
        ...initialState,
        history,
      })

      expect(selectAverageDuration(state, 'function1')).toBe(150) // (100 + 200) / 2
      expect(selectAverageDuration(state, 'function2')).toBe(500)
      expect(selectAverageDuration(state, 'nonExistent')).toBe(0)
    })
  })

  describe('async thunk', () => {
    it('should create callCloudFunction thunk', () => {
      expect(callCloudFunction).toBeDefined()
      expect(typeof callCloudFunction).toBe('function')
    })

    it('should handle callCloudFunction.pending', () => {
      const store = configureStore({
        reducer: {
          functions: functionsReducer,
        },
      })

      const action = {
        type: callCloudFunction.pending.type,
        meta: {
          arg: {
            functionName: 'testFunction',
            data: { test: 'data' },
          },
        },
      }

      store.dispatch(action)

      const state = store.getState().functions
      expect(state.calls.testFunction).toBeDefined()
      expect(state.calls.testFunction.status).toBe('loading')
      expect(state.activeCallsCount).toBe(1)
    })

    it('should handle callCloudFunction.fulfilled', () => {
      const store = configureStore({
        reducer: {
          functions: functionsReducer,
        },
      })

      const action = {
        type: callCloudFunction.fulfilled.type,
        payload: {
          functionName: 'testFunction',
          result: { output: 'success' },
          duration: 500,
        },
      }

      store.dispatch(action)

      const state = store.getState().functions
      expect(state.calls.testFunction).toBeDefined()
      expect(state.calls.testFunction.status).toBe('succeeded')
      expect(state.calls.testFunction.result).toEqual({ output: 'success' })
      expect(state.history).toHaveLength(1)
    })

    it('should handle callCloudFunction.rejected', () => {
      const store = configureStore({
        reducer: {
          functions: functionsReducer,
        },
      })

      const action = {
        type: callCloudFunction.rejected.type,
        error: {
          functionName: 'testFunction',
          error: 'Function failed',
          duration: 500,
        },
        meta: {
          arg: {
            functionName: 'testFunction',
            data: { test: 'data' },
          },
        },
      }

      store.dispatch(action)

      const state = store.getState().functions
      expect(state.calls.testFunction).toBeDefined()
      expect(state.calls.testFunction.status).toBe('failed')
      expect(state.calls.testFunction.error).toBe('Function failed')
      expect(state.lastError).toBe('Function failed')
      expect(state.history).toHaveLength(1)
    })
  })
})