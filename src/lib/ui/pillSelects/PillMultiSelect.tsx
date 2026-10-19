import {
  MultiSelect,
  Popover,
  type Primitive,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useCallback, type ReactNode } from 'react'

import classes from 'lib/ui/pillSelects/PillMultiSelect.module.css'

export namespace PillMultiSelect {
  export interface SelectorProps<T extends Primitive> {
    options: ReadonlyArray<T>
    value: Array<T>
    onChange: (values: Array<T>) => void
    renderPills: (value?: T) => ReactNode
    renderOptions: (value: T, checked?: boolean) => ReactNode
    disabled?: boolean
    label?: string
    popoverText?: string,
  }

  export type PopoverProps = {
    popoverText?: string,
  }

  export type Props<T extends Primitive> = SelectorProps<T>
    & PopoverProps
    & Pick<MultiSelect.Props, 'flex' | 'clearable'>
}

export function PillMultiSelect<T extends Primitive>({
  options,
  value,
  onChange,
  renderPills,
  renderOptions,
  popoverText,
  disabled,
  label,
  flex,
  clearable
}: PillMultiSelect.Props<T>) {
  const [opened, { close, open }] = useDisclosure(false)

  const renderOption: MultiSelect.Props<T>['renderOption'] = useCallback(({ option: { value }, checked }) => {
    return renderOptions(value, checked)
  }, [renderOptions])
  const renderPill: MultiSelect.Props<T>['renderPill'] = useCallback(({ value }) => {
    return renderPills(value)
  }, [renderPills])

  const select = (
    <MultiSelect
      data={options}
      value={value}
      onChange={onChange}
      label={label}
      classNames={{ dropdown: classes.dropdown, option: classes.option }}
      renderOption={renderOption}
      renderPill={renderPill}
      comboboxProps={{ width: 'max-content' }}
      flex={flex}
      clearable={clearable}
    />
  )

  return popoverText?.length
    ? (
      <Popover width={200} position='left' withArrow shadow='md' opened={opened} disabled={!disabled}>
        <Popover.Target>
          {/* div required to capture mouse events, these events arent captured by multiselect if it is disabled */}
          <div
            onMouseEnter={open}
            onMouseLeave={close}
          >
            {select}
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <Text size='sm'>{popoverText}</Text>
        </Popover.Dropdown>
      </Popover>
    )
    : select
}
