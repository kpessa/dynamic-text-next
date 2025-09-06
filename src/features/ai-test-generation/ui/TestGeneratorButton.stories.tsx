import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TestGeneratorButton } from './TestGeneratorButton';
import aiTestReducer, { configureAI } from '../model/aiTestSlice';

const meta = {
  title: 'Features/AI Test Generation/TestGeneratorButton',
  component: TestGeneratorButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    sectionType: {
      control: 'select',
      options: ['static', 'dynamic'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: 'select',
      options: ['text', 'outlined', 'contained'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
    },
  },
} satisfies Meta<typeof TestGeneratorButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Create a mock store for stories
const createMockStore = (isConfigured: boolean = true) => {
  const store = configureStore({
    reducer: {
      aiTest: aiTestReducer,
    },
  });

  if (isConfigured) {
    store.dispatch(configureAI({
      provider: 'openai',
      apiKey: 'mock-api-key'
    }));
  }

  return store;
};

// Wrapper component for stories
const StoryWrapper: React.FC<{ 
  children: React.ReactNode; 
  isConfigured?: boolean;
}> = ({ children, isConfigured = true }) => (
  <Provider store={createMockStore(isConfigured)}>
    {children}
  </Provider>
);

export const Default: Story = {
  args: {
    sectionContent: 'return me.getValue("weight") + " kg";',
    sectionType: 'dynamic',
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const WithExistingTests: Story = {
  args: {
    sectionContent: 'return me.getValue("weight") + " kg";',
    sectionType: 'dynamic',
    testCount: 5,
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const StaticSection: Story = {
  args: {
    sectionContent: '<h1>Static Content</h1><p>This is static HTML content.</p>',
    sectionType: 'static',
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const SmallButton: Story = {
  args: {
    sectionContent: 'test content',
    sectionType: 'dynamic',
    size: 'small',
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const OutlinedVariant: Story = {
  args: {
    sectionContent: 'test content',
    sectionType: 'dynamic',
    variant: 'outlined',
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const SecondaryColor: Story = {
  args: {
    sectionContent: 'test content',
    sectionType: 'dynamic',
    color: 'secondary',
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const FullWidth: Story = {
  args: {
    sectionContent: 'test content',
    sectionType: 'dynamic',
    fullWidth: true,
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const Disabled: Story = {
  args: {
    sectionContent: 'test content',
    sectionType: 'dynamic',
    disabled: true,
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const NotConfigured: Story = {
  args: {
    sectionContent: 'test content',
    sectionType: 'dynamic',
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper isConfigured={false}>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const NoContent: Story = {
  args: {
    sectionContent: '',
    sectionType: 'dynamic',
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};

export const WithExistingVariables: Story = {
  args: {
    sectionContent: 'return me.getValue("weight") * me.getValue("dosage");',
    sectionType: 'dynamic',
    existingVariables: {
      weight: 70,
      dosage: 1.5,
      patientId: '12345',
    },
    onTestsGenerated: (tests) => console.log('Tests generated:', tests),
  },
  render: (args) => (
    <StoryWrapper>
      <TestGeneratorButton {...args} />
    </StoryWrapper>
  ),
};