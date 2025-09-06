import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { TPNCalculator } from './TPNCalculator'
import tpnReducer from '../model/tpnSlice'

const meta: Meta<typeof TPNCalculator> = {
  title: 'Features/TPN Calculations/TPNCalculator',
  component: TPNCalculator,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => {
      const store = configureStore({
        reducer: {
          tpn: tpnReducer
        }
      })
      
      return (
        <Provider store={store}>
          <Story />
        </Provider>
      )
    }
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TPNCalculator>

export const Default: Story = {
  args: {},
}

export const AdultAdvisor: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Story would show adult advisor selected by default
  }
}

export const NeonatalAdvisor: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Story would show neonatal advisor
  }
}