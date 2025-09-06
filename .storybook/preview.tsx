import type { Preview } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from '../src/app/store';
import { lightTheme, darkTheme } from '../src/app/themes';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '../src/app/styles/globals.css';

// Polyfill process.env for Storybook
if (typeof window !== 'undefined' && !(globalThis as any).process) {
  (globalThis as any).process = {
    env: {
      // Firebase configuration from .env.local
      NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyBiKTA9vgBQF63TM-Jd8g8rAcXCNZYNg8o',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'dynamic-text-dea93.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'dynamic-text-dea93',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'dynamic-text-dea93.firebasestorage.app',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '54073442061',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:54073442061:web:e33f900517e52c07347a44',
      NEXT_PUBLIC_USE_FIREBASE_EMULATOR: 'false',
    }
  };
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Chromatic configuration
    chromatic: {
      pauseAnimationAtEnd: true, // Disable animations for consistent snapshots
      delay: 200, // Wait for async content to load
      diffThreshold: 0.1, // Sensitivity for detecting changes
      viewports: [375, 768, 1440], // Test on mobile, tablet, desktop
    },
    options: {
      storySort: {
        order: ['Introduction', 'Atoms', 'Molecules', 'Widgets', 'Pages', 'Organisms'],
      },
    },
    backgrounds: {
      default: 'default',
      values: [
        { name: 'default', value: 'transparent' },
        { name: 'light', value: '#fafafa' },
        { name: 'dark', value: '#121212' },
        { name: 'white', value: '#ffffff' },
        { name: 'black', value: '#000000' },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },
  decorators: [
    (Story, context) => {
      const themeMode = context.globals.theme || 'light';
      const theme = themeMode === 'dark' ? darkTheme : lightTheme;
      
      return (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CssBaseline />
              <div 
                style={{ 
                  padding: '20px',
                  minHeight: '100vh',
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                }}
              >
                <Story />
              </div>
            </LocalizationProvider>
          </ThemeProvider>
        </Provider>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Switch between light and dark theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: '☀️ Light', left: '☀️' },
          { value: 'dark', title: '🌙 Dark', left: '🌙' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;