import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listenerRegistry } from './listenerRegistry';

describe('ListenerRegistry', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUnsubscribe = vi.fn();
    listenerRegistry.cleanup(); // Ensure clean state
  });

  afterEach(() => {
    listenerRegistry.cleanup();
    vi.clearAllTimers();
  });

  describe('register', () => {
    it('should register a new listener', () => {
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      
      expect(listenerRegistry.has('test-key')).toBe(true);
      expect(listenerRegistry.getListenerCount()).toBe(1);
    });

    it('should increment reference count for existing listener', () => {
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      
      const listener = listenerRegistry.getListener('test-key');
      expect(listener?.refCount).toBe(2);
      expect(listenerRegistry.getListenerCount()).toBe(1);
    });

    it('should track listener metadata', () => {
      const now = Date.now();
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'collection');
      
      const listener = listenerRegistry.getListener('test-key');
      expect(listener).toBeDefined();
      expect(listener?.path).toBe('/test/path');
      expect(listener?.type).toBe('collection');
      expect(listener?.createdAt).toBeGreaterThanOrEqual(now);
    });
  });

  describe('unregister', () => {
    it('should decrement reference count', () => {
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      
      listenerRegistry.unregister('test-key');
      
      const listener = listenerRegistry.getListener('test-key');
      expect(listener?.refCount).toBe(1);
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it('should unsubscribe and remove when refCount reaches 0', () => {
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      
      listenerRegistry.unregister('test-key');
      
      expect(listenerRegistry.has('test-key')).toBe(false);
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should handle unregistering non-existent listener', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      listenerRegistry.unregister('non-existent');
      
      expect(consoleSpy).toHaveBeenCalledWith('Listener not found for key: non-existent');
      consoleSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe all listeners', () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();
      
      listenerRegistry.register('key1', unsubscribe1, '/path1', 'document');
      listenerRegistry.register('key2', unsubscribe2, '/path2', 'collection');
      
      listenerRegistry.cleanup();
      
      expect(unsubscribe1).toHaveBeenCalledTimes(1);
      expect(unsubscribe2).toHaveBeenCalledTimes(1);
      expect(listenerRegistry.getListenerCount()).toBe(0);
    });
  });

  describe('cleanupByPath', () => {
    it('should cleanup listeners matching path pattern', () => {
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();
      const unsubscribe3 = vi.fn();
      
      listenerRegistry.register('key1', unsubscribe1, '/users/123', 'document');
      listenerRegistry.register('key2', unsubscribe2, '/users/456', 'document');
      listenerRegistry.register('key3', unsubscribe3, '/posts/789', 'document');
      
      listenerRegistry.cleanupByPath('/users');
      
      expect(unsubscribe1).toHaveBeenCalledTimes(1);
      expect(unsubscribe2).toHaveBeenCalledTimes(1);
      expect(unsubscribe3).not.toHaveBeenCalled();
      expect(listenerRegistry.has('key3')).toBe(true);
      expect(listenerRegistry.getListenerCount()).toBe(1);
    });
  });

  describe('setupReconnection', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should attempt reconnection after delay', async () => {
      const newUnsubscribe = vi.fn();
      const reconnectFn = vi.fn().mockResolvedValue(newUnsubscribe);
      
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      listenerRegistry.setupReconnection('test-key', reconnectFn);
      
      expect(reconnectFn).not.toHaveBeenCalled();
      
      await vi.advanceTimersByTimeAsync(1000);
      
      expect(reconnectFn).toHaveBeenCalledTimes(1);
    });

    it('should update listener with new unsubscribe function', async () => {
      const newUnsubscribe = vi.fn();
      const reconnectFn = vi.fn().mockResolvedValue(newUnsubscribe);
      
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      listenerRegistry.setupReconnection('test-key', reconnectFn);
      
      await vi.advanceTimersByTimeAsync(1000);
      
      const listener = listenerRegistry.getListener('test-key');
      expect(listener?.unsubscribe).toBe(newUnsubscribe);
    });

    it('should retry with exponential backoff on failure', async () => {
      const reconnectFn = vi.fn().mockRejectedValue(new Error('Connection failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      listenerRegistry.setupReconnection('test-key', reconnectFn);
      
      // First attempt after 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      expect(reconnectFn).toHaveBeenCalledTimes(1);
      
      // Second attempt after 2000ms (exponential backoff)
      await vi.advanceTimersByTimeAsync(2000);
      expect(reconnectFn).toHaveBeenCalledTimes(2);
      
      // Third attempt after 4000ms
      await vi.advanceTimersByTimeAsync(4000);
      expect(reconnectFn).toHaveBeenCalledTimes(3);
      
      consoleSpy.mockRestore();
    });

    it('should stop reconnection after max attempts', async () => {
      const reconnectFn = vi.fn().mockRejectedValue(new Error('Connection failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      listenerRegistry.register('test-key', mockUnsubscribe, '/test/path', 'document');
      listenerRegistry.setupReconnection('test-key', reconnectFn);
      
      // Advance through all retry attempts
      for (let i = 0; i < 6; i++) {
        await vi.advanceTimersByTimeAsync(Math.pow(2, i) * 1000);
      }
      
      // Should stop at MAX_RECONNECT_ATTEMPTS (5)
      expect(reconnectFn).toHaveBeenCalledTimes(5);
      
      // Check that the max attempts error was logged
      const errorCalls = consoleSpy.mock.calls;
      const maxAttemptsCall = errorCalls.find(call => 
        call[0]?.includes('Max reconnection attempts reached')
      );
      expect(maxAttemptsCall).toBeDefined();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getters and debug methods', () => {
    it('should return active listener keys', () => {
      listenerRegistry.register('key1', vi.fn(), '/path1', 'document');
      listenerRegistry.register('key2', vi.fn(), '/path2', 'collection');
      
      const activeKeys = listenerRegistry.getActiveListeners();
      expect(activeKeys).toEqual(['key1', 'key2']);
    });

    it('should calculate total reference count', () => {
      const unsubscribe = vi.fn();
      
      listenerRegistry.register('key1', unsubscribe, '/path1', 'document');
      listenerRegistry.register('key1', unsubscribe, '/path1', 'document');
      listenerRegistry.register('key2', unsubscribe, '/path2', 'collection');
      
      expect(listenerRegistry.getTotalRefCount()).toBe(3);
    });

    it('should provide debug information', () => {
      const unsubscribe = vi.fn();
      
      listenerRegistry.register('key1', unsubscribe, '/path1', 'document');
      listenerRegistry.register('key1', unsubscribe, '/path1', 'document');
      listenerRegistry.register('key2', unsubscribe, '/path2', 'collection');
      
      const debugInfo = listenerRegistry.getDebugInfo();
      
      expect(debugInfo.totalListeners).toBe(2);
      expect(debugInfo.totalRefCount).toBe(3);
      expect(debugInfo.listeners).toHaveLength(2);
      expect(debugInfo.listeners[0]).toMatchObject({
        key: 'key1',
        path: '/path1',
        type: 'document',
        refCount: 2
      });
      expect(debugInfo.listeners[0].age).toBeGreaterThanOrEqual(0);
    });
  });
});