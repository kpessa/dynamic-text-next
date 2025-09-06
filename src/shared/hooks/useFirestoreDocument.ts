import { useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Unsubscribe } from 'firebase/firestore'
import { FirestoreService, ServiceError } from '@/shared/api/firestore/baseService'

interface UseFirestoreDocumentOptions<T> {
  service: FirestoreService<T>
  documentId: string | null
  onSuccess?: (data: T | null) => void
  onError?: (error: ServiceError) => void
  setLoading?: (loading: boolean) => void
  setError?: (error: string | null) => void
  setData?: (data: T | null) => void
  realTime?: boolean
}

export function useFirestoreDocument<T>({
  service,
  documentId,
  onSuccess,
  onError,
  setLoading,
  setError,
  setData,
  realTime = true
}: UseFirestoreDocumentOptions<T>) {
  const dispatch = useDispatch()
  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  const isMountedRef = useRef(true)

  const handleSuccess = useCallback((data: T | null) => {
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
    if (!documentId) {
      if (setData) {
        dispatch(setData(null) as any)
      }
      if (setLoading) {
        dispatch(setLoading(false) as any)
      }
      return
    }

    if (setLoading) {
      dispatch(setLoading(true) as any)
    }

    if (realTime) {
      // Set up real-time listener
      unsubscribeRef.current = service.subscribeToDocument(
        documentId,
        handleSuccess,
        handleError
      )
    } else {
      // One-time fetch
      const result = await service.getById(documentId)
      if (result.data) {
        handleSuccess(result.data)
      } else if (result.error) {
        handleError(result.error)
      }
    }
  }, [service, documentId, realTime, dispatch, setLoading, setData, handleSuccess, handleError])

  useEffect(() => {
    isMountedRef.current = true
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

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