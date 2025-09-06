import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { FunctionLoadingIndicator } from './FunctionLoadingIndicator'
import functionsReducer from '../model/functionsSlice'

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      functions: functionsReducer,
    },
    preloadedState: {
      functions: {
        calls: {},
        activeCallsCount: 0,
        lastError: null,
        history: [],
        ...initialState,
      },
    },
  })
}

describe('FunctionLoadingIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when function is not loading', () => {
    const store = createMockStore({
      calls: {
        testFunction: {
          functionName: 'testFunction',
          status: 'idle',
          error: null,
          result: null,
        },
      },
    })

    const { container } = render(
      <Provider store={store}>
        <FunctionLoadingIndicator functionName="testFunction" />
      </Provider>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render loading indicator when function is loading', () => {
    const store = createMockStore({
      calls: {
        testFunction: {
          functionName: 'testFunction',
          status: 'loading',
          error: null,
          result: null,
          startedAt: Date.now(),
        },
      },
    })

    render(
      <Provider store={store}>
        <FunctionLoadingIndicator functionName="testFunction" />
      </Provider>
    )

    expect(screen.getByText(/Processing testFunction.../)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render custom message when provided', () => {
    const store = createMockStore({
      calls: {
        testFunction: {
          functionName: 'testFunction',
          status: 'loading',
          error: null,
          result: null,
        },
      },
    })

    render(
      <Provider store={store}>
        <FunctionLoadingIndicator 
          functionName="testFunction" 
          message="Calculating values..."
        />
      </Provider>
    )

    expect(screen.getByText('Calculating values...')).toBeInTheDocument()
  })

  it('should render compact version when compact prop is true', () => {
    const store = createMockStore({
      calls: {
        testFunction: {
          functionName: 'testFunction',
          status: 'loading',
          error: null,
          result: null,
        },
      },
    })

    const { container } = render(
      <Provider store={store}>
        <FunctionLoadingIndicator functionName="testFunction" compact />
      </Provider>
    )

    const progressBar = container.querySelector('[role="progressbar"]')
    expect(progressBar).toBeInTheDocument()
    expect(screen.queryByText(/Processing/)).not.toBeInTheDocument()
  })

  it('should show elapsed time after 2 seconds', () => {
    const startedAt = Date.now() - 3000 // 3 seconds ago
    const store = createMockStore({
      calls: {
        testFunction: {
          functionName: 'testFunction',
          status: 'loading',
          error: null,
          result: null,
          startedAt,
        },
      },
    })

    render(
      <Provider store={store}>
        <FunctionLoadingIndicator functionName="testFunction" />
      </Provider>
    )

    expect(screen.getByText(/seconds elapsed/)).toBeInTheDocument()
  })

  it('should show attempt count for retries', () => {
    const store = createMockStore({
      calls: {
        testFunction: {
          functionName: 'testFunction',
          status: 'loading',
          error: null,
          result: null,
          startedAt: Date.now() - 3000,
          attemptCount: 2,
        },
      },
    })

    render(
      <Provider store={store}>
        <FunctionLoadingIndicator functionName="testFunction" />
      </Provider>
    )

    expect(screen.getByText(/Attempt 2/)).toBeInTheDocument()
  })

  it('should show progress bar when showProgress is true', () => {
    const store = createMockStore({
      calls: {
        testFunction: {
          functionName: 'testFunction',
          status: 'loading',
          error: null,
          result: null,
        },
      },
    })

    const { container } = render(
      <Provider store={store}>
        <FunctionLoadingIndicator functionName="testFunction" showProgress />
      </Provider>
    )

    const progressBars = container.querySelectorAll('[role="progressbar"]')
    expect(progressBars.length).toBeGreaterThan(1) // Both circular and linear
  })
})