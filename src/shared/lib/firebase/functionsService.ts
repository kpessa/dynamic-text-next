import { httpsCallable, HttpsCallableResult } from 'firebase/functions'
import { functions } from '@/shared/config/firebase'

export enum FunctionErrorCode {
  UNAUTHENTICATED = 'unauthenticated',
  INVALID_ARGUMENT = 'invalid-argument',
  DEADLINE_EXCEEDED = 'deadline-exceeded',
  NOT_FOUND = 'not-found',
  ALREADY_EXISTS = 'already-exists',
  RESOURCE_EXHAUSTED = 'resource-exhausted',
  FAILED_PRECONDITION = 'failed-precondition',
  ABORTED = 'aborted',
  OUT_OF_RANGE = 'out-of-range',
  UNIMPLEMENTED = 'unimplemented',
  INTERNAL = 'internal',
  UNAVAILABLE = 'unavailable',
  DATA_LOSS = 'data-loss',
}

const errorMessages: Record<string, string> = {
  'deadline-exceeded': 'Operation took too long. Please try again.',
  'resource-exhausted': 'Too many requests. Please wait and try again.',
  'unavailable': 'Service temporarily unavailable. Please try again later.',
  'invalid-argument': 'Invalid input provided. Please check your data.',
  'not-found': 'The requested resource was not found.',
  'already-exists': 'This item already exists.',
  'failed-precondition': 'Operation cannot be performed in the current state.',
  'aborted': 'Operation was cancelled.',
  'out-of-range': 'Value is out of acceptable range.',
  'unimplemented': 'This feature is not yet available.',
  'internal': 'An internal error occurred. Please try again.',
  'data-loss': 'Data may have been lost or corrupted.',
  'unauthenticated': 'Authentication required for this operation.',
}

export class FunctionError extends Error {
  constructor(
    public code: string,
    public originalMessage: string,
    public details?: unknown
  ) {
    super(errorMessages[code] || originalMessage)
    this.name = 'FunctionError'
  }
}

interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  retryableErrors?: string[]
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  retryableErrors: ['unavailable', 'deadline-exceeded', 'resource-exhausted'],
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function callFunctionWithRetry<T, R>(
  functionName: string,
  data: T,
  options: RetryOptions = {}
): Promise<R> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: FunctionError | Error | undefined

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      const result = await callFunction<T, R>(functionName, data)
      return result
    } catch (error: unknown) {
      lastError = error

      const errorCode = (error as { code?: string }).code || 'internal'
      const isRetryable = opts.retryableErrors.includes(errorCode)
      const isLastAttempt = attempt === opts.maxRetries - 1

      if (!isRetryable || isLastAttempt) {
        throw error
      }

      const delayTime = Math.min(
        opts.initialDelayMs * Math.pow(2, attempt),
        opts.maxDelayMs
      )

      console.warn(
        `Function ${functionName} failed with ${errorCode}. Retrying in ${delayTime}ms... (Attempt ${attempt + 1}/${opts.maxRetries})`
      )

      await delay(delayTime)
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

export async function callFunction<T, R>(
  functionName: string,
  data: T
): Promise<R> {
  if (!functions) {
    throw new Error('Firebase Functions not initialized')
  }

  const callable = httpsCallable<T, R>(functions, functionName)

  try {
    const result: HttpsCallableResult<R> = await callable(data)
    return result.data
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string; details?: unknown }
    const errorCode = err.code || 'internal'
    const errorMessage = err.message || 'Function call failed'
    const errorDetails = err.details || undefined

    console.error(`Function ${functionName} failed:`, {
      code: errorCode,
      message: errorMessage,
      details: errorDetails,
    })

    throw new FunctionError(errorCode, errorMessage, errorDetails)
  }
}

export async function callFunctionWithTimeout<T, R>(
  functionName: string,
  data: T,
  timeoutMs: number = 30000
): Promise<R> {
  return Promise.race([
    callFunction<T, R>(functionName, data),
    new Promise<R>((_, reject) =>
      setTimeout(
        () => reject(new FunctionError('deadline-exceeded', `Function ${functionName} timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ])
}

export function createFunctionCaller<T, R>(
  functionName: string,
  defaultOptions?: RetryOptions
) {
  return {
    call: (data: T) => callFunction<T, R>(functionName, data),
    callWithRetry: (data: T, options?: RetryOptions) =>
      callFunctionWithRetry<T, R>(functionName, data, { ...defaultOptions, ...options }),
    callWithTimeout: (data: T, timeoutMs?: number) =>
      callFunctionWithTimeout<T, R>(functionName, data, timeoutMs),
  }
}

export function getUserFriendlyError(error: unknown): string {
  if (error instanceof FunctionError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}