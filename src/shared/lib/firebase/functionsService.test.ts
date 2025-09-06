import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { httpsCallable } from 'firebase/functions'
import {
  callFunction,
  callFunctionWithRetry,
  callFunctionWithTimeout,
  createFunctionCaller,
  FunctionError,
  getUserFriendlyError,
  FunctionErrorCode,
} from './functionsService'

vi.mock('@/shared/config/firebase', () => ({
  functions: { type: 'functions-instance' },
}))

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
}))

describe('functionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('callFunction', () => {
    it('should successfully call a function and return data', async () => {
      const mockData = { result: 'success' }
      const mockCallable = vi.fn().mockResolvedValue({ data: mockData })
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const result = await callFunction('testFunction', { input: 'test' })

      expect(httpsCallable).toHaveBeenCalledWith(
        { type: 'functions-instance' },
        'testFunction'
      )
      expect(mockCallable).toHaveBeenCalledWith({ input: 'test' })
      expect(result).toEqual(mockData)
    })

    it('should throw FunctionError on failure', async () => {
      const mockError = {
        code: 'invalid-argument',
        message: 'Invalid input',
        details: { field: 'test' },
      }
      const mockCallable = vi.fn().mockRejectedValue(mockError)
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      await expect(callFunction('testFunction', {})).rejects.toThrow(FunctionError)
      
      try {
        await callFunction('testFunction', {})
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(FunctionError)
        expect(error.code).toBe('invalid-argument')
        expect(error.message).toBe('Invalid input provided. Please check your data.')
        expect(error.originalMessage).toBe('Invalid input')
        expect(error.details).toEqual({ field: 'test' })
      }
    })

    it('should handle errors without code', async () => {
      const mockError = new Error('Generic error')
      const mockCallable = vi.fn().mockRejectedValue(mockError)
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      try {
        await callFunction('testFunction', {})
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(FunctionError)
        expect(error.code).toBe('internal')
        expect(error.message).toBe('An internal error occurred. Please try again.')
      }
    })
  })

  describe('callFunctionWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockData = { result: 'success' }
      const mockCallable = vi.fn().mockResolvedValue({ data: mockData })
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const result = await callFunctionWithRetry('testFunction', { input: 'test' })

      expect(mockCallable).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockData)
    })

    it('should retry on retryable errors', async () => {
      const mockData = { result: 'success' }
      const mockCallable = vi.fn()
        .mockRejectedValueOnce({ code: 'unavailable', message: 'Service unavailable' })
        .mockRejectedValueOnce({ code: 'deadline-exceeded', message: 'Timeout' })
        .mockResolvedValueOnce({ data: mockData })
      
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const promise = callFunctionWithRetry('testFunction', {}, {
        maxRetries: 3,
        initialDelayMs: 100,
      })

      // Fast-forward through the delays
      await vi.advanceTimersByTimeAsync(100) // First retry delay
      await vi.advanceTimersByTimeAsync(200) // Second retry delay

      const result = await promise

      expect(mockCallable).toHaveBeenCalledTimes(3)
      expect(result).toEqual(mockData)
    })

    it('should not retry non-retryable errors', async () => {
      const mockCallable = vi.fn()
        .mockRejectedValueOnce({ code: 'invalid-argument', message: 'Bad input' })
      
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      await expect(
        callFunctionWithRetry('testFunction', {})
      ).rejects.toThrow(FunctionError)

      expect(mockCallable).toHaveBeenCalledTimes(1)
    })

    it('should throw after max retries', async () => {
      const mockCallable = vi.fn()
        .mockRejectedValue({ code: 'unavailable', message: 'Service unavailable' })
      
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const promise = callFunctionWithRetry('testFunction', {}, {
        maxRetries: 2,
        initialDelayMs: 100,
      })

      // Fast-forward through the delays
      await vi.advanceTimersByTimeAsync(100) // First retry delay

      await expect(promise).rejects.toThrow(FunctionError)
      expect(mockCallable).toHaveBeenCalledTimes(2)
    })

    it('should use exponential backoff', async () => {
      const mockCallable = vi.fn()
        .mockRejectedValueOnce({ code: 'unavailable', message: 'Service unavailable' })
        .mockRejectedValueOnce({ code: 'unavailable', message: 'Service unavailable' })
        .mockResolvedValueOnce({ data: { result: 'success' } })
      
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const promise = callFunctionWithRetry('testFunction', {}, {
        maxRetries: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000,
      })

      // Fast-forward through the delays
      await vi.advanceTimersByTimeAsync(100) // First retry: 100ms
      await vi.advanceTimersByTimeAsync(200) // Second retry: 200ms (exponential)

      await promise

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Retrying in 100ms... (Attempt 1/3)')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Retrying in 200ms... (Attempt 2/3)')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('callFunctionWithTimeout', () => {
    it('should return result if function completes within timeout', async () => {
      const mockData = { result: 'success' }
      const mockCallable = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: mockData }), 100))
      )
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const promise = callFunctionWithTimeout('testFunction', {}, 1000)
      
      await vi.advanceTimersByTimeAsync(100)
      
      const result = await promise
      expect(result).toEqual(mockData)
    })

    it('should timeout if function takes too long', async () => {
      const mockCallable = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: 'late' }), 2000))
      )
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const promise = callFunctionWithTimeout('testFunction', {}, 1000)
      
      await vi.advanceTimersByTimeAsync(1000)
      
      await expect(promise).rejects.toThrow(FunctionError)
      // The error message is mapped to user-friendly text
      await expect(promise).rejects.toThrow('Operation took too long. Please try again.')
    })
  })

  describe('createFunctionCaller', () => {
    it('should create a function caller with all methods', () => {
      const caller = createFunctionCaller<{ input: string }, { output: string }>(
        'myFunction'
      )

      expect(caller).toHaveProperty('call')
      expect(caller).toHaveProperty('callWithRetry')
      expect(caller).toHaveProperty('callWithTimeout')
      expect(typeof caller.call).toBe('function')
      expect(typeof caller.callWithRetry).toBe('function')
      expect(typeof caller.callWithTimeout).toBe('function')
    })

    it('should call the correct function with caller methods', async () => {
      const mockData = { output: 'result' }
      const mockCallable = vi.fn().mockResolvedValue({ data: mockData })
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const caller = createFunctionCaller<{ input: string }, { output: string }>(
        'myFunction'
      )

      const result = await caller.call({ input: 'test' })

      expect(httpsCallable).toHaveBeenCalledWith(
        { type: 'functions-instance' },
        'myFunction'
      )
      expect(mockCallable).toHaveBeenCalledWith({ input: 'test' })
      expect(result).toEqual(mockData)
    })

    it('should use default options in createFunctionCaller', async () => {
      const mockCallable = vi.fn()
        .mockRejectedValueOnce({ code: 'unavailable', message: 'Service unavailable' })
        .mockResolvedValueOnce({ data: { output: 'success' } })
      
      vi.mocked(httpsCallable).mockReturnValue(mockCallable)

      const caller = createFunctionCaller<{ input: string }, { output: string }>(
        'myFunction',
        { maxRetries: 2, initialDelayMs: 50 }
      )

      const promise = caller.callWithRetry({ input: 'test' })
      
      await vi.advanceTimersByTimeAsync(50)
      
      const result = await promise
      expect(result).toEqual({ output: 'success' })
      expect(mockCallable).toHaveBeenCalledTimes(2)
    })
  })

  describe('getUserFriendlyError', () => {
    it('should return FunctionError message', () => {
      const error = new FunctionError(
        'invalid-argument',
        'Raw error message'
      )
      expect(getUserFriendlyError(error)).toBe(
        'Invalid input provided. Please check your data.'
      )
    })

    it('should return Error message', () => {
      const error = new Error('Something went wrong')
      expect(getUserFriendlyError(error)).toBe('Something went wrong')
    })

    it('should return default message for unknown errors', () => {
      expect(getUserFriendlyError('string error')).toBe('An unexpected error occurred')
      expect(getUserFriendlyError(null)).toBe('An unexpected error occurred')
      expect(getUserFriendlyError(undefined)).toBe('An unexpected error occurred')
      expect(getUserFriendlyError(123)).toBe('An unexpected error occurred')
    })
  })

  describe('FunctionError', () => {
    it('should create error with user-friendly message', () => {
      const error = new FunctionError(
        'deadline-exceeded',
        'Function timed out after 30s',
        { requestId: '123' }
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(FunctionError)
      expect(error.name).toBe('FunctionError')
      expect(error.code).toBe('deadline-exceeded')
      expect(error.originalMessage).toBe('Function timed out after 30s')
      expect(error.message).toBe('Operation took too long. Please try again.')
      expect(error.details).toEqual({ requestId: '123' })
    })

    it('should fall back to original message if code not in map', () => {
      const error = new FunctionError(
        'unknown-code',
        'Unknown error occurred'
      )

      expect(error.message).toBe('Unknown error occurred')
    })
  })

  describe('FunctionErrorCode enum', () => {
    it('should have all expected error codes', () => {
      expect(FunctionErrorCode.UNAUTHENTICATED).toBe('unauthenticated')
      expect(FunctionErrorCode.INVALID_ARGUMENT).toBe('invalid-argument')
      expect(FunctionErrorCode.DEADLINE_EXCEEDED).toBe('deadline-exceeded')
      expect(FunctionErrorCode.NOT_FOUND).toBe('not-found')
      expect(FunctionErrorCode.ALREADY_EXISTS).toBe('already-exists')
      expect(FunctionErrorCode.RESOURCE_EXHAUSTED).toBe('resource-exhausted')
      expect(FunctionErrorCode.FAILED_PRECONDITION).toBe('failed-precondition')
      expect(FunctionErrorCode.ABORTED).toBe('aborted')
      expect(FunctionErrorCode.OUT_OF_RANGE).toBe('out-of-range')
      expect(FunctionErrorCode.UNIMPLEMENTED).toBe('unimplemented')
      expect(FunctionErrorCode.INTERNAL).toBe('internal')
      expect(FunctionErrorCode.UNAVAILABLE).toBe('unavailable')
      expect(FunctionErrorCode.DATA_LOSS).toBe('data-loss')
    })
  })
})