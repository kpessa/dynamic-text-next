import { ReactNode } from 'react'
import { TabsProps as MuiTabsProps } from '@mui/material/Tabs'
import { TabProps as MuiTabProps } from '@mui/material/Tab'

export interface TabItem {
  label: string
  value: string | number
  icon?: ReactNode
  disabled?: boolean
  content?: ReactNode
}

export interface TabsProps extends Omit<MuiTabsProps, 'value' | 'onChange'> {
  value: string | number
  onChange: (value: string | number) => void
  tabs: TabItem[]
  variant?: 'standard' | 'scrollable' | 'fullWidth'
  orientation?: 'horizontal' | 'vertical'
  centered?: boolean
  showContent?: boolean
  contentClassName?: string
  tabClassName?: string
  iconPosition?: 'top' | 'start' | 'end' | 'bottom'
}