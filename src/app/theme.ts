'use client'
import { createTheme, alpha } from '@mui/material/styles'
import { red, blue, green, amber, grey } from '@mui/material/colors'

// Augment TypeScript definitions
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string
      warning: string
    }
  }
  interface ThemeOptions {
    status?: {
      danger?: string
      warning?: string
    }
  }
  
  interface Palette {
    gradient: {
      primary: string
      secondary: string
    }
  }
  interface PaletteOptions {
    gradient?: {
      primary?: string
      secondary?: string
    }
  }
}

// Extend component props
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    gradient: true
  }
}

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: blue[600],
          light: blue[400],
          dark: blue[800],
        },
        secondary: {
          main: green[600],
          light: green[400],
          dark: green[800],
        },
        error: {
          main: red[600],
        },
        warning: {
          main: amber[600],
        },
        background: {
          default: '#fafafa',
          paper: '#ffffff',
        },
        gradient: {
          primary: `linear-gradient(45deg, ${blue[400]} 30%, ${blue[600]} 90%)`,
          secondary: `linear-gradient(45deg, ${green[400]} 30%, ${green[600]} 90%)`,
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: blue[400],
          light: blue[300],
          dark: blue[500],
        },
        secondary: {
          main: green[400],
          light: green[300],
          dark: green[500],
        },
        background: {
          default: '#0a0a0a',
          paper: '#1a1a1a',
        },
        gradient: {
          primary: `linear-gradient(45deg, ${blue[600]} 30%, ${blue[400]} 90%)`,
          secondary: `linear-gradient(45deg, ${green[600]} 30%, ${green[400]} 90%)`,
        },
      },
    },
  },
  typography: {
    fontFamily: 'var(--font-roboto), var(--font-inter), system-ui, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  status: {
    danger: red[500],
    warning: amber[500],
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s',
        },
        containedPrimary: ({ theme }) => ({
          background: theme.palette.gradient.primary,
          '&:hover': {
            background: theme.palette.gradient.primary,
            filter: 'brightness(1.1)',
          },
        }),
      },
      variants: [
        {
          props: { variant: 'gradient' as any },
          style: ({ theme }) => ({
            background: theme.palette.gradient.primary,
            color: theme.palette.common.white,
            '&:hover': {
              background: theme.palette.gradient.primary,
              filter: 'brightness(1.1)',
            },
          }),
        },
      ],
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: (theme.shape.borderRadius as number) * 2,
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})

export default theme