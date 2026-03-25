import { Combobox, Flex, NumberInput, useCombobox } from '@mantine/core'
import { useDebouncedCallback } from '@mantine/hooks'
import { useState } from 'react'

export interface ComboboxNumberOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxNumberGroup {
  group: string
  items: ComboboxNumberOption[]
}

interface ComboboxNumberInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  options: ComboboxNumberGroup[]
  placeholder?: string
  min?: number
  max?: number
  style?: React.CSSProperties
  dropdownMaxHeight?: number
}

export function ComboboxNumberInput(props: ComboboxNumberInputProps) {
  const {
    value,
    onChange,
    options,
    placeholder = '...',
    min,
    max,
    style,
    dropdownMaxHeight = 800,
  } = props

  const [localValue, setLocalValue] = useState<number | string>(value ?? '')

  // Sync external value changes (e.g. dropdown select) into local state
  if (value != null && value !== localValue) {
    setLocalValue(value)
  } else if (value == null && localValue !== '') {
    setLocalValue('')
  }

  const debouncedOnChange = useDebouncedCallback((val: number | undefined) => {
    onChange(val)
  }, 300)

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const num = Number(val)
        setLocalValue(num)
        debouncedOnChange.cancel()
        onChange(num)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <NumberInput
          hideControls
          style={{ width: '100%', ...style }}
          value={localValue}
          onChange={(val) => {
            setLocalValue(val)
            debouncedOnChange(val === '' ? undefined : Number(val))
          }}
          placeholder={placeholder}
          min={min}
          max={max}
          rightSection={
            <Flex
              align='center'
              justify='center'
              w='100%'
              h='60%'
              style={{ borderLeft: '1px solid var(--mantine-color-dark-4)', cursor: 'pointer' }}
              onClick={() => combobox.toggleDropdown()}
            >
              <Combobox.Chevron />
            </Flex>
          }
          rightSectionPointerEvents='all'
        />
      </Combobox.Target>

      <Combobox.Dropdown style={{ minWidth: 'max-content' }}>
        <Combobox.Options mah={dropdownMaxHeight} style={{ overflowY: 'auto' }}>
          {combobox.dropdownOpened && options.map((group) => (
            <Combobox.Group key={group.group} label={group.group}>
              {group.items.map((opt) => (
                <Combobox.Option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </Combobox.Option>
              ))}
            </Combobox.Group>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
