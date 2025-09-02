import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/stories/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/**/*.story.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldExtractValuesFromUnion: true,
      propFilter: (prop) => {
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },
  viteFinal: async (config) => {
    // Add path aliases
    config.resolve = {
      ...config.resolve,
      alias: {
        '@': '/home/pessk/code/dynamic-text-next/src',
        '@/app': '/home/pessk/code/dynamic-text-next/src/app',
        '@/pages': '/home/pessk/code/dynamic-text-next/src/pages',
        '@/widgets': '/home/pessk/code/dynamic-text-next/src/widgets',
        '@/features': '/home/pessk/code/dynamic-text-next/src/features',
        '@/entities': '/home/pessk/code/dynamic-text-next/src/entities',
        '@/shared': '/home/pessk/code/dynamic-text-next/src/shared',
      },
    };
    return config;
  },
};

export default config;