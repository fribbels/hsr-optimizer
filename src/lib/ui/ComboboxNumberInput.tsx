import { Combobox, Flex, NumberInput, useCombobox } from '@mantine/core'

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

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        onChange(Number(val))
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <NumberInput
          hideControls
          readOnly
          style={{ width: '100%', ...style }}
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          rightSection={
            <Flex align='center' justify='center' w='100%' h='60%' style={{ borderLeft: '1px solid var(--mantine-color-dark-4)' }}>
              <Combobox.Chevron />
            </Flex>
          }
          rightSectionPointerEvents='none'
          styles={{ input: { cursor: 'pointer' } }}
          onClick={() => combobox.toggleDropdown()}
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
