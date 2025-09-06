import { useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Unsubscribe, QueryConstraint } from 'firebase/firestore'
import { FirestoreService, ServiceError } from '@/shared/api/firestore/baseService'

interface UseFirestoreCollectionOptions<T> {
  service: FirestoreService<T>
  constraints?: QueryConstraint[]
  onSuccess?: (data: T[]) => void
  onError?: (error: ServiceError) => void
  setLoading?: (loading: boolean) => void
  setError?: (error: string | null) => void
  setData?: (data: T[]) => void
  realTime?: boolean
}

export function useFirestoreCollection<T>({
  service,
  constraints = [],
  onSuccess,
  onError,
  setLoading,
  setError,
  setData,
  realTime = true
}: UseFirestoreCollectionOptions<T>) {
  const dispatch = useDispatch()
  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  const isMountedRef = useRef(true)

  const handleSuccess = useCallback((data: T[]) => {
    if (!isMountedRef.current) return
    
    if (setData) {
      dispatch(setData(data) as any)
    }
    if (setLoading) {
      dispatch(setLoading(false) as any)
    }
    if (onSuccess) {
      onSuccess(data)
    }
  }, [dispatch, setData, setLoading, onSuccess])

  const handleError = useCallback((error: ServiceError) => {
    if (!isMountedRef.current) return
    
    if (setError) {
      dispatch(setError(error.message) as any)
    }
    if (setLoading) {
      dispatch(setLoading(false) as any)
    }
    if (onError) {
      onError(error)
    }
  }, [dispatch, setError, setLoading, onError])

  const fetchData = useCallback(async () => {
    if (setLoading) {
      dispatch(setLoading(true) as any)
    }

    if (realTime) {
      // Set up real-time listener
      unsubscribeRef.current = service.subscribe(
        handleSuccess,
        handleError,
        constraints
      )
    } else {
      // One-time fetch
      const result = await service.getAll(constraints)
      if (result.data) {
        handleSuccess(result.data)
      } else if (result.error) {
        handleError(result.error)
      }
    }
  }, [service, constraints, realTime, dispatch, setLoading, handleSuccess, handleError])

  useEffect(() => {
    isMountedRef.current = true
    fetchData()

    return () => {
      isMountedRef.current = false
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [fetchData])

  const refetch = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
    await fetchData()
  }, [fetchData])

  return { refetch }
}