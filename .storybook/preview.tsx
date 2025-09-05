import type { Preview } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from '../src/app/store';
import { lightTheme, darkTheme } from '../src/app/themes';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '../src/app/styles/globals.css';

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