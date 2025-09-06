import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRealtimeSync } from '../useRealtimeSync';
import { listenerRegistry } from '@/shared/lib/firebase/listenerRegistry';
import { realtimeMetrics } from '@/shared/lib/monitoring/realtimeMetrics';
import React from 'react';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ path: 'test-collection' })),
  query: vi.fn((collection, ...constraints) => ({ 
    collection, 
    constraints 
  })),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  onSnapshot: vi.fn((query, onNext, onError) => {
    // Return unsubscribe function
    return vi.fn();
  })
}));

// Mock our modules
vi.mock('@/shared/lib/firebase/listenerRegistry', () => ({
  listenerRegistry: {
    register: vi.fn(),
    unregister: vi.fn(),
    has: vi.fn(() => false),
    getListenerCount: vi.fn(() => 0),
    getTotalRefCount: vi.fn(() => 0),
    setupReconnection: vi.fn()
  }
}));

vi.mock('@/shared/lib/monitoring/realtimeMetrics', () => ({
  realtimeMetrics: {
    startLatencyTracking: vi.fn(),
    endLatencyTracking: vi.fn(),
    incrementUpdateCount: vi.fn(),
    trackError: vi.fn(),
    trackListenerCount: vi.fn()
  }
}));

vi.mock('@/shared/lib/firebase/conflictResolver', () => ({
  conflictResolver: {
    detectConflict: vi.fn(() => false),
    resolveConflict: vi.fn((conflict) => ({
      id: conflict.id,
      resolvedData: conflict.remoteVersion,
      strategy: 'last-write-wins',
      conflictInfo: conflict
    }))
  }
}));

describe('useRealtimeSync', () => {
  let mockStore: any;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockStore = configureStore({
      reducer: {
        test: (state = {}, action: any) => state
      }
    });

    wrapper = ({ children }) => (
      React.createElement(Provider, { store: mockStore }, children)
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should setup listener on mount', () => {
    const mockDb = { type: 'firestore' } as any;
    
    const { result } = renderHook(
      () => useRealtimeSync(mockDb, {
        collection: 'test-collection',
        listenerId: 'test-listener'
      }),
      { wrapper }
    );

    expect(listenerRegistry.register).toHaveBeenCalledWith(
      'test-listener',
      expect.any(Function),
      'test-collection',
      'collection'
    );
  });

  it('should unregister listener on unmount', () => {
    const mockDb = { type: 'firestore' } as any;
    
    const { unmount } = renderHook(
      () => useRealtimeSync(mockDb, {
        collection: 'test-collection',
        listenerId: 'test-listener'
      }),
      { wrapper }
    );

    unmount();

    expect(listenerRegistry.unregister).toHaveBeenCalledWith('test-listener');
  });

  it('should handle document changes', async () => {
    const mockDb = { type: 'firestore' } as any;
    const onAdded = vi.fn();
    const onModified = vi.fn();
    const onRemoved = vi.fn();
    
    // Mock onSnapshot to simulate document changes
    const { onSnapshot } = await import('firebase/firestore');
    (onSnapshot as any).mockImplementation((query: any, onNext: any) => {
      // Simulate document changes
      setTimeout(() => {
        onNext({
          docChanges: () => [
            {
              type: 'added',
              doc: {
                id: 'doc1',
                data: () => ({ name: 'Test Document' })
              }
            }
          ]
        });
      }, 10);
      
      return vi.fn(); // Return unsubscribe
    });

    renderHook(
      () => useRealtimeSync(mockDb, {
        collection: 'test-collection',
        onAdded,
        onModified,
        onRemoved
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(onAdded).toHaveBeenCalledWith({
        id: 'doc1',
        name: 'Test Document'
      });
    });

    expect(realtimeMetrics.incrementUpdateCount).toHaveBeenCalledWith('test-collection');
  });

  it('should handle conflict resolution', async () => {
    const mockDb = { type: 'firestore' } as any;
    const onModified = vi.fn();
    
    // Mock conflict detection
    const { conflictResolver } = await import('@/shared/lib/firebase/conflictResolver');
    (conflictResolver.detectConflict as any).mockReturnValue(true);
    (conflictResolver.resolveConflict as any).mockReturnValue({
      id: 'doc1',
      resolvedData: { id: 'doc1', name: 'Resolved' },
      strategy: 'last-write-wins',
      conflictInfo: {}
    });
    
    // Mock onSnapshot to simulate document modification
    const { onSnapshot } = await import('firebase/firestore');
    (onSnapshot as any).mockImplementation((query: any, onNext: any) => {
      setTimeout(() => {
        // First add the document
        onNext({
          docChanges: () => [{
            type: 'added',
            doc: {
              id: 'doc1',
              data: () => ({ name: 'Initial' })
            }
          }]
        });
        
        // Then modify it
        setTimeout(() => {
          onNext({
            docChanges: () => [{
              type: 'modified',
              doc: {
                id: 'doc1',
                data: () => ({ name: 'Modified' })
              }
            }]
          });
        }, 10);
      }, 10);
      
      return vi.fn();
    });

    renderHook(
      () => useRealtimeSync(mockDb, {
        collection: 'test-collection',
        onModified,
        conflictStrategy: 'last-write-wins'
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(onModified).toHaveBeenCalledWith({
        id: 'doc1',
        name: 'Resolved'
      });
    });

    expect(conflictResolver.resolveConflict).toHaveBeenCalled();
  });

  it('should track performance metrics', async () => {
    const mockDb = { type: 'firestore' } as any;
    
    const { onSnapshot } = await import('firebase/firestore');
    (onSnapshot as any).mockImplementation((query: any, onNext: any) => {
      setTimeout(() => {
        onNext({
          docChanges: () => [{
            type: 'added',
            doc: {
              id: 'doc1',
              data: () => ({ name: 'Test' })
            }
          }]
        });
      }, 10);
      
      return vi.fn();
    });

    renderHook(
      () => useRealtimeSync(mockDb, {
        collection: 'test-collection'
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(realtimeMetrics.startLatencyTracking).toHaveBeenCalled();
      expect(realtimeMetrics.endLatencyTracking).toHaveBeenCalled();
      expect(realtimeMetrics.trackListenerCount).toHaveBeenCalled();
    });
  });

  it('should handle errors and setup reconnection', async () => {
    const mockDb = { type: 'firestore' } as any;
    const error = new Error('Connection failed');
    
    const { onSnapshot } = await import('firebase/firestore');
    (onSnapshot as any).mockImplementation((query: any, onNext: any, onError: any) => {
      setTimeout(() => {
        onError(error);
      }, 10);
      
      return vi.fn();
    });

    renderHook(
      () => useRealtimeSync(mockDb, {
        collection: 'test-collection',
        listenerId: 'test-listener'
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(realtimeMetrics.trackError).toHaveBeenCalledWith(
        error,
        'listener-test-collection'
      );
      expect(listenerRegistry.setupReconnection).toHaveBeenCalledWith(
        'test-listener',
        expect.any(Function)
      );
    });
  });

  it('should return helper functions', () => {
    const mockDb = { type: 'firestore' } as any;
    
    const { result } = renderHook(
      () => useRealtimeSync(mockDb, {
        collection: 'test-collection'
      }),
      { wrapper }
    );

    expect(result.current.performOptimisticUpdate).toBeInstanceOf(Function);
    expect(result.current.getLocalState).toBeInstanceOf(Function);
    expect(result.current.isListening).toBeInstanceOf(Function);
  });

  it('should not setup listener when db is null', () => {
    const { result } = renderHook(
      () => useRealtimeSync(null, {
        collection: 'test-collection'
      }),
      { wrapper }
    );

    expect(listenerRegistry.register).not.toHaveBeenCalled();
    expect(result.current.isListening()).toBe(false);
  });
});