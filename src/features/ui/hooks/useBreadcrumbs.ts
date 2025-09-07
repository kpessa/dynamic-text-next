'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setActiveRoute, selectBreadcrumbs } from '../model/navigationSlice'

export const useBreadcrumbs = () => {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const breadcrumbs = useAppSelector(selectBreadcrumbs)

  useEffect(() => {
    dispatch(setActiveRoute(pathname))
  }, [pathname, dispatch])

  return breadcrumbs
}