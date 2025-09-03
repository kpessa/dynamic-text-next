import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'
import { SelectOption } from './Select.types'

const meta = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile select component with single, multi, and searchable variants. Supports grouping, checkboxes, and icons.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['single', 'multi', 'searchable'],
      description: 'The type of select to render'
    },
    validationState: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'Visual validation state of the select'
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Size of the select field'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the select should take full width'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required'
    },
    showCheckboxes: {
      control: 'boolean',
      description: 'Show checkboxes in multi-select mode'
    }
  }
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const basicOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4' },
  { value: 'option5', label: 'Option 5' }
]

const countryOptions: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'cn', label: 'China' },
  { value: 'br', label: 'Brazil' },
  { value: 'in', label: 'India' }
]

const iconOptions: SelectOption[] = [
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'school', label: 'School', icon: '🎓' },
  { value: 'gym', label: 'Gym', icon: '💪' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' }
]

const groupableOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'grape', label: 'Grape' },
  { value: 'carrot', label: 'Carrot' },
  { value: 'broccoli', label: 'Broccoli' },
  { value: 'potato', label: 'Potato' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'beef', label: 'Beef' },
  { value: 'fish', label: 'Fish' },
  { value: 'pork', label: 'Pork' }
]

export const Default: Story = {
  args: {
    label: 'Default Select',
    options: basicOptions,
    placeholder: 'Select an option...'
  }
}

export const SingleSelect: Story = {
  args: {
    label: 'Choose One Option',
    variant: 'single',
    options: basicOptions,
    placeholder: 'Select one...',
    helperText: 'You can only select one option'
  }
}

export const MultiSelect: Story = {
  args: {
    label: 'Choose Multiple Options',
    variant: 'multi',
    options: basicOptions,
    placeholder: 'Select multiple...',
    helperText: 'You can select multiple options'
  }
}

export const MultiSelectWithCheckboxes: Story = {
  args: {
    label: 'Select Items',
    variant: 'multi',
    options: basicOptions,
    showCheckboxes: true,
    placeholder: 'Select items...',
    helperText: 'Check multiple items'
  }
}

export const SearchableSelect: Story = {
  args: {
    label: 'Country',
    variant: 'searchable',
    options: countryOptions,
    placeholder: 'Search and select a country...',
    helperText: 'Start typing to filter options'
  }
}

export const SearchableMultiSelect: Story = {
  args: {
    label: 'Countries',
    variant: 'searchable',
    multiple: true,
    options: countryOptions,
    placeholder: 'Search and select countries...',
    helperText: 'Search and select multiple countries'
  }
}

export const WithIcons: Story = {
  args: {
    label: 'Location',
    options: iconOptions,
    placeholder: 'Select a location...',
    helperText: 'Options with icons'
  }
}

export const GroupedOptions: Story = {
  args: {
    label: 'Food Category',
    options: groupableOptions,
    placeholder: 'Select food...',
    groupBy: (option: SelectOption) => {
      const fruits = ['apple', 'banana', 'orange', 'grape']
      const vegetables = ['carrot', 'broccoli', 'potato', 'tomato']
      const meats = ['chicken', 'beef', 'fish', 'pork']
      
      if (fruits.includes(option.value as string)) return 'Fruits'
      if (vegetables.includes(option.value as string)) return 'Vegetables'
      if (meats.includes(option.value as string)) return 'Meats'
      return 'Other'
    },
    helperText: 'Options grouped by category'
  }
}

export const DisabledOptions: Story = {
  args: {
    label: 'Select with Disabled Options',
    options: [
      { value: '1', label: 'Available Option 1' },
      { value: '2', label: 'Available Option 2' },
      { value: '3', label: 'Disabled Option', disabled: true },
      { value: '4', label: 'Available Option 3' },
      { value: '5', label: 'Another Disabled', disabled: true }
    ],
    placeholder: 'Some options are disabled...',
    helperText: 'Disabled options cannot be selected'
  }
}

export const ValidationStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Select
        label="Default State"
        options={basicOptions}
        validationState="default"
        value="option1"
        helperText="This is the default state"
      />
      <Select
        label="Success State"
        options={basicOptions}
        validationState="success"
        value="option2"
        helperText="Valid selection!"
      />
      <Select
        label="Warning State"
        options={basicOptions}
        validationState="warning"
        value="option3"
        helperText="Please review your selection"
      />
      <Select
        label="Error State"
        options={basicOptions}
        validationState="error"
        value="option4"
        helperText="Invalid selection"
      />
    </div>
  )
}

export const RequiredField: Story = {
  args: {
    label: 'Required Selection',
    options: basicOptions,
    required: true,
    placeholder: 'This field is required...',
    helperText: 'You must make a selection'
  }
}

export const DisabledSelect: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Select
        label="Disabled Empty"
        options={basicOptions}
        disabled
        placeholder="Cannot select..."
      />
      <Select
        label="Disabled with Value"
        options={basicOptions}
        disabled
        value="option2"
      />
    </div>
  )
}

export const SelectSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Select
        label="Small Select"
        options={basicOptions}
        size="small"
        placeholder="Small size..."
      />
      <Select
        label="Medium Select"
        options={basicOptions}
        size="medium"
        placeholder="Medium size (default)..."
      />
    </div>
  )
}

export const FullWidthSelect: Story = {
  render: () => (
    <div style={{ width: '500px' }}>
      <Select
        label="Full Width Select"
        options={basicOptions}
        fullWidth
        placeholder="This select takes full width..."
        helperText="Spans the entire container width"
      />
    </div>
  )
}

export const EmptyState: Story = {
  args: {
    label: 'Empty Options',
    options: [],
    placeholder: 'No options available...',
    helperText: 'There are no options to select from'
  }
}

export const LongOptionsList: Story = {
  args: {
    label: 'Many Options',
    variant: 'searchable',
    options: Array.from({ length: 100 }, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i + 1}`
    })),
    placeholder: 'Select from many options...',
    helperText: 'Scrollable list with search'
  }
}

export const InteractivePlayground: Story = {
  args: {
    label: 'Playground Select',
    options: basicOptions,
    placeholder: 'Try different props...',
    helperText: 'Experiment with the controls'
  }
}