import React from 'react'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

const StyledCard = styled(MuiCard)(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}))

interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
  hoverable?: boolean
  className?: string
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  hoverable = false,
  className,
}) => {
  const CardComponent = hoverable ? StyledCard : MuiCard
  
  return (
    <CardComponent className={className}>
      <CardContent>
        {title && (
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        {children}
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </CardComponent>
  )
}