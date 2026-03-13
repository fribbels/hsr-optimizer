import { CheckIcon, CloseButton, Combobox, Group, Input, Pill, PillsInput, useCombobox } from '@mantine/core'
import { CSSProperties, ReactNode, useMemo, useState } from 'react'

type SimpleOption = { value: string; label: string }
type GroupedOption = { group: string; items: SimpleOption[] }
type DataItem = SimpleOption | GroupedOption

function isGrouped(item: DataItem): item is GroupedOption {
  return 'group' in item
}

function flattenData(data: DataItem[]): SimpleOption[] {
  return data.flatMap((item) => isGrouped(item) ? item.items : [item])
}

export function MultiSelectPills({
  data,
  value,
  onChange,
  placeholder,
  clearable = false,
  searchable = false,
  maxDropdownHeight,
  maxDisplayedValues = Infinity,
  dropdownWidth,
  style,
  rightSection,
  renderOption,
}: {
  data: DataItem[]
  value: string[]
  onChange: (val: string[]) => void
  placeholder?: string
  clearable?: boolean
  searchable?: boolean
  maxDropdownHeight?: number
  maxDisplayedValues?: number
  dropdownWidth?: number | string
  style?: CSSProperties
  rightSection?: ReactNode
  renderOption?: (option: SimpleOption, active: boolean) => ReactNode
}) {
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption()
      setSearch('')
    },
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  })

  const [search, setSearch] = useState('')

  const flatOptions = useMemo(() => flattenData(data), [data])
  const labelMap = useMemo(
    () => new Map(flatOptions.map((o) => [o.value, o.label])),
    [flatOptions],
  )

  const handleValueSelect = (val: string) => {
    onChange(
      value.includes(val)
        ? value.filter((v) => v !== val)
        : [...value, val],
    )
  }

  const handleValueRemove = (val: string) => {
    onChange(value.filter((v) => v !== val))
  }

  // +N display logic from Mantine's MaxDisplayedItems example
  const max = maxDisplayedValues
  const visibleValues = value.slice(0, max >= value.length ? max : max - 1)
  const overflowCount = value.length - visibleValues.length

  const pills = visibleValues.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {labelMap.get(item) ?? item}
    </Pill>
  ))

  const searchLower = search.toLowerCase().trim()

  function matchesSearch(opt: SimpleOption) {
    return !searchLower || opt.label.toLowerCase().includes(searchLower)
  }

  function renderOptionItem(opt: SimpleOption) {
    const active = value.includes(opt.value)
    return (
      <Combobox.Option value={opt.value} key={opt.value} active={active}>
        {renderOption
          ? renderOption(opt, active)
          : (
            <Group gap="sm">
              {active && <CheckIcon size={12} />}
              <span>{opt.label}</span>
            </Group>
          )}
      </Combobox.Option>
    )
  }

  function renderOptions() {
    const hasGroups = data.some(isGrouped)
    if (hasGroups) {
      return data.map((item) => {
        if (isGrouped(item)) {
          const filtered = item.items.filter(matchesSearch)
          if (filtered.length === 0) return null
          return (
            <Combobox.Group label={item.group} key={item.group}>
              {filtered.map(renderOptionItem)}
            </Combobox.Group>
          )
        }
        return matchesSearch(item) ? renderOptionItem(item) : null
      })
    }
    return flatOptions.filter(matchesSearch).map(renderOptionItem)
  }

  const showClear = clearable && value.length > 0 && !rightSection

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect} width={dropdownWidth}>
      <Combobox.DropdownTarget>
        <PillsInput
          pointer
          onClick={() => combobox.toggleDropdown()}
          rightSection={
            showClear
              ? <CloseButton size="sm" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); onChange([]) }} />
              : rightSection
          }
          style={style}
        >
          <Pill.Group>
            {value.length > 0
              ? (
                <>
                  {pills}
                  {overflowCount > 0 && <Pill>+{overflowCount} more</Pill>}
                </>
              )
              : <Input.Placeholder>{placeholder}</Input.Placeholder>}

            <Combobox.EventsTarget>
              <PillsInput.Field
                type={searchable ? undefined : 'hidden'}
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value)
                  combobox.updateSelectedOptionIndex()
                }}
                onBlur={() => combobox.closeDropdown()}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && value.length > 0 && !search) {
                    event.preventDefault()
                    handleValueRemove(value[value.length - 1])
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options mah={maxDropdownHeight} style={{ overflowY: 'auto' }}>
          {renderOptions()}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
