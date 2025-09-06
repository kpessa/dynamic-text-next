import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { db } from '@/shared/lib/firebase';
import { useRealtimeSync } from './useRealtimeSync';
import { QueryConstraint } from 'firebase/firestore';

// Import entity actions
import {
  addSimulation,
  updateSimulation,
  deleteSimulation
} from '@/entities/simulation/model/simulationSlice';
import {
  addReference,
  updateReference,
  deleteReference
} from '@/entities/reference/model/referenceSlice';

interface EntitySyncConfig {
  entityType: 'simulations' | 'references' | 'ingredients';
  queryConstraints?: QueryConstraint[];
  userId?: string;
  enableOptimisticUpdates?: boolean;
}

export function useEntitySync(config: EntitySyncConfig) {
  const dispatch = useDispatch();
  const { entityType, queryConstraints = [], enableOptimisticUpdates = true } = config;

  // Map entity types to their Redux actions
  const getEntityActions = () => {
    switch (entityType) {
      case 'simulations':
        return {
          onAdded: (data: any) => dispatch(addSimulation(data)),
          onModified: (data: any) => dispatch(updateSimulation(data)),
          onRemoved: (id: string) => dispatch(deleteSimulation(id))
        };
      case 'references':
        return {
          onAdded: (data: any) => dispatch(addReference(data)),
          onModified: (data: any) => dispatch(updateReference(data)),
          onRemoved: (id: string) => dispatch(deleteReference(id))
        };
      default:
        return {
          onAdded: () => {},
          onModified: () => {},
          onRemoved: () => {}
        };
    }
  };

  const actions = getEntityActions();

  const { performOptimisticUpdate, isListening } = useRealtimeSync(db, {
    collection: entityType,
    queryConstraints,
    ...actions,
    conflictStrategy: 'last-write-wins',
    enableOptimisticUpdates,
    listenerId: `entity-${entityType}`
  });

  useEffect(() => {
    // Log sync status
    if (isListening()) {
      console.log(`✅ Real-time sync active for ${entityType}`);
    }
  }, [entityType, isListening]);

  return {
    performOptimisticUpdate,
    isListening,
    isSynced: isListening()
  };
}