import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        filled: 'text-white',
        ghost: 'bg-transparent hover:bg-gray-100',
        soft: 'bg-opacity-10',
        ringed: 'border-2 bg-transparent',
      },
      color: {
        primary: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600',
        secondary: 'bg-gray-600 hover:bg-gray-700 focus-visible:ring-gray-600',
        tertiary: 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-600',
        success: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600',
        warning: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-600',
        error: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        base: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'filled',
      color: 'primary',
      size: 'base',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    color, 
    size, 
    loading, 
    fullWidth, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          ${buttonVariants({ variant, color, size })}
          ${fullWidth ? 'w-full' : ''}
          ${className || ''}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';