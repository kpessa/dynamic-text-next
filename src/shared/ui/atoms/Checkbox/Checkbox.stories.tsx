import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible checkbox component with label placement options, indeterminate state, and helper text support.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked'
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in an indeterminate state'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required'
    },
    error: {
      control: 'boolean',
      description: 'Whether the checkbox has an error state'
    },
    labelPlacement: {
      control: 'select',
      options: ['end', 'start', 'top', 'bottom'],
      description: 'Position of the label relative to the checkbox'
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the checkbox'
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'default'],
      description: 'Color of the checkbox'
    }
  }
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Default Checkbox'
  }
}

export const Checked: Story = {
  args: {
    label: 'Checked Checkbox',
    checked: true
  }
}

export const Unchecked: Story = {
  args: {
    label: 'Unchecked Checkbox',
    checked: false
  }
}

export const Indeterminate: Story = {
  args: {
    label: 'Indeterminate State',
    indeterminate: true
  }
}

export const WithHelperText: Story = {
  args: {
    label: 'Subscribe to newsletter',
    helperText: 'You will receive weekly updates'
  }
}

export const Required: Story = {
  args: {
    label: 'I agree to the terms and conditions',
    required: true,
    helperText: 'This field is required'
  }
}

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox label="Disabled Unchecked" disabled />
      <Checkbox label="Disabled Checked" disabled checked />
      <Checkbox label="Disabled Indeterminate" disabled indeterminate />
    </div>
  )
}

export const ErrorState: Story = {
  args: {
    label: 'Accept terms',
    error: true,
    helperText: 'You must accept the terms to continue'
  }
}

export const LabelPlacement: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <Checkbox label="Label at End (default)" labelPlacement="end" />
      <Checkbox label="Label at Start" labelPlacement="start" />
      <Checkbox label="Label at Top" labelPlacement="top" />
      <Checkbox label="Label at Bottom" labelPlacement="bottom" />
    </div>
  )
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
      <Checkbox label="Small Checkbox" size="small" />
      <Checkbox label="Medium Checkbox (default)" size="medium" />
      <Checkbox label="Large Checkbox" size="large" />
    </div>
  )
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
      <Checkbox label="Primary Color" color="primary" checked />
      <Checkbox label="Secondary Color" color="secondary" checked />
      <Checkbox label="Success Color" color="success" checked />
      <Checkbox label="Error Color" color="error" checked />
      <Checkbox label="Warning Color" color="warning" checked />
      <Checkbox label="Info Color" color="info" checked />
      <Checkbox label="Default Color" color="default" checked />
    </div>
  )
}

export const WithoutLabel: Story = {
  args: {
    'aria-label': 'Standalone checkbox'
  }
}

export const GroupedCheckboxes: Story = {
  render: () => {
    const [state, setState] = useState({
      option1: false,
      option2: false,
      option3: false
    })

    const allChecked = Object.values(state).every(v => v)
    const someChecked = Object.values(state).some(v => v) && !allChecked

    const handleParentChange = () => {
      const newValue = !allChecked
      setState({
        option1: newValue,
        option2: newValue,
        option3: newValue
      })
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Checkbox
          label="Select All"
          checked={allChecked}
          indeterminate={someChecked}
          onChange={handleParentChange}
        />
        <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Checkbox
            label="Option 1"
            checked={state.option1}
            onChange={(e) => setState({ ...state, option1: e.target.checked })}
          />
          <Checkbox
            label="Option 2"
            checked={state.option2}
            onChange={(e) => setState({ ...state, option2: e.target.checked })}
          />
          <Checkbox
            label="Option 3"
            checked={state.option3}
            onChange={(e) => setState({ ...state, option3: e.target.checked })}
          />
        </div>
      </div>
    )
  }
}

export const FormExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '400px' }}>
      <h3>Preferences</h3>
      <Checkbox
        label="Email notifications"
        helperText="Receive email updates about your account"
      />
      <Checkbox
        label="SMS notifications"
        helperText="Receive text messages for important alerts"
      />
      <Checkbox
        label="Marketing communications"
        helperText="Receive promotional offers and newsletters"
      />
      <Checkbox
        label="I agree to the terms of service"
        required
        error
        helperText="You must accept the terms to continue"
      />
    </div>
  )
}

export const InteractivePlayground: Story = {
  args: {
    label: 'Playground Checkbox',
    helperText: 'Experiment with the controls'
  }
}