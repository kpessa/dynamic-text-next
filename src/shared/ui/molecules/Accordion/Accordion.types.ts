import { ReactNode } from 'react'
import { AccordionProps as MuiAccordionProps } from '@mui/material/Accordion'

export interface AccordionItem {
  id: string
  title: string
  content: ReactNode
  disabled?: boolean
  icon?: ReactNode
}

export interface AccordionProps extends Omit<MuiAccordionProps, 'children'> {
  items: AccordionItem[]
  expanded?: string | string[] | false
  onChange?: (id: string, isExpanded: boolean) => void
  multiple?: boolean
  variant?: 'standard' | 'outlined' | 'filled'
  showIcon?: boolean
  className?: string
}