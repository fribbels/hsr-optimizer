import {
  Combobox,
  Flex,
  NumberInput,
  useCombobox,
} from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import { useBlurCommittedNumberInput } from 'lib/hooks/useBlurCommittedNumberInput'
import { useRef } from 'react'

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

  const input = useBlurCommittedNumberInput(value, onChange)
  const wasOpenRef = useRef(false)

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const num = Number(val)
        input.setValue(num)
        onChange(num)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <NumberInput
          hideControls
          style={{ width: '100%', ...style }}
          value={input.value}
          onChange={input.onChange}
          onFocus={input.onFocus}
          onBlur={input.onBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          rightSection={
            <Flex
              align='center'
              justify='center'
              w='100%'
              h='60%'
              style={{ borderLeft: '1px solid var(--border-default)', cursor: 'pointer', paddingRight: 1 }}
              onMouseDown={() => {
                wasOpenRef.current = combobox.dropdownOpened
              }}
              onClick={() => {
                if (!wasOpenRef.current) {
                  combobox.openDropdown()
                }
              }}
            >
              <IconChevronDown size={14} />
            </Flex>
          }
          rightSectionWidth={20}
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
