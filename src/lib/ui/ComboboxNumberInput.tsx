import { Combobox, Flex, NumberInput, useCombobox } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import { useRef, useState } from 'react'

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
  const focusedRef = useRef(false)
  const wasOpenRef = useRef(false)

  // Sync external value changes into local state, but not while the user is typing
  if (!focusedRef.current) {
    if (value != null && value !== localValue) {
      setLocalValue(value)
    } else if (value == null && localValue !== '') {
      setLocalValue('')
    }
  }

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  function commitLocalValue() {
    focusedRef.current = false
    const committed = localValue === '' ? undefined : Number(localValue)
    if (committed !== value) {
      onChange(committed)
    }
  }

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const num = Number(val)
        setLocalValue(num)
        onChange(num)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <NumberInput
          hideControls
          style={{ width: '100%', ...style }}
          value={localValue}
          onChange={setLocalValue}
          onFocus={() => focusedRef.current = true}
          onBlur={commitLocalValue}
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
