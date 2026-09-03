import {
  CloseButton,
  Combobox,
  type ComboboxOptionProps,
  Input,
  InputBase,
  Popover,
  type Primitive,
  Text,
  useCombobox,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  type ReactNode,
  useCallback,
  useMemo,
} from 'react'

import classes from 'lib/ui/pillSelects/PillSingleSelect.module.css'

namespace PillSingleSelect {
  export interface CoreProps<T> {
    options: Array<T>
    value: T | null
    onChange: (value: T | null) => void
    renderValue: (value: T) => ReactNode
    renderOption: (value: T, checked: boolean) => ReactNode
    disabled?: boolean
    label?: string
    placeholder?: string
  }

  export type PopoverProps = {
    withPopover?: false,
    popoverText?: string,
  } | {
    withPopover: true,
    popoverText: string,
  }

  export type Props<T extends Primitive> = CoreProps<T> & PopoverProps
}

export function PillSingleSelect<T extends Primitive>({
  withPopover,
  popoverText,
  ...rest
}: PillSingleSelect.Props<T>) {
  const hidePopover = !rest.disabled
  const [opened, { open, close }] = useDisclosure()
  return withPopover
    ? (
      <Popover width={200} position='left' withArrow shadow='md' opened={opened} disabled={hidePopover}>
        <Popover.Target>
          <div onMouseEnter={open} onMouseLeave={close}>
            <PillSingleSelectTarget {...rest} />
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <Text size='sm'>{popoverText}</Text>
        </Popover.Dropdown>
      </Popover>
    )
    : <PillSingleSelectTarget {...rest} />
}

function PillSingleSelectTarget<T extends Primitive>({
  options,
  value,
  onChange,
  renderOption,
  renderValue,
  placeholder,
  disabled,
  label,
}: PillSingleSelect.CoreProps<T>) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const { keyToVal, valToKey } = useMemo(() => {
    const valToKey = new Map<T, string>()
    const keyToVal = new Map<string, T>()
    options.forEach((val) => {
      const key = val.toString()
      valToKey.set(val, key)
      keyToVal.set(key, val)
    })
    return { keyToVal, valToKey }
  }, [options])

  function onOptionSubmit(key: string, _optionProps: ComboboxOptionProps) {
    const val = keyToVal.get(key)
    if (val === undefined) return
    if (val === value) {
      onChange(null)
    } else {
      onChange(val)
    }
    combobox.closeDropdown()
  }

  const rightSection = value === null
    ? <Combobox.Chevron />
    : <CloseButton aria-label='clear selection' onClick={() => onChange(null)} size='sm' onMouseDown={(e) => e.preventDefault()} />

  return (
    <Input.Wrapper label={label}>
      <Combobox store={combobox} withinPortal={false} onOptionSubmit={onOptionSubmit} disabled={disabled}>
        <Combobox.Target>
          <InputBase
            component='button'
            type='button'
            rightSection={rightSection}
            onClick={() => combobox.toggleDropdown()}
            rightSectionPointerEvents={value === null ? 'none' : 'all'}
          >
            {value
              ? renderValue(value)
              : placeholder && <Input.Placeholder>{placeholder}</Input.Placeholder>}
          </InputBase>
        </Combobox.Target>
        <Combobox.Dropdown>
          <div
            className={classes.dropdown}
          >
            {options.map((val) => {
              const key = valToKey.get(val)
              if (key === undefined) return null
              return (
                <Combobox.Option
                  value={key}
                  key={key}
                  className={classes.option}
                >
                  {renderOption(val, val === value)}
                </Combobox.Option>
              )
            })}
          </div>
        </Combobox.Dropdown>
      </Combobox>
    </Input.Wrapper>
  )
}
