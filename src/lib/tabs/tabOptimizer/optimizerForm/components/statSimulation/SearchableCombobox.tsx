import { CheckIcon, Combobox, Group, Input, InputBase, useCombobox } from '@mantine/core'
import { useMemo, useState } from 'react'

export function SearchableCombobox(props: {
  options: { value: string; label: string }[]
  value: string | null | undefined
  onChange: (value: string | null) => void
  placeholder: string
  dropdownWidth?: number | 'auto'
  dropdownMaxHeight?: number
  style?: React.CSSProperties
  clearable?: boolean
}) {
  const { options, value, onChange, placeholder, dropdownWidth = 'auto', dropdownMaxHeight = 700, style, clearable } = props
  const [search, setSearch] = useState('')

  const combobox = useCombobox({
    onDropdownOpen: () => combobox.focusSearchInput(),
    onDropdownClose: () => {
      combobox.resetSelectedOption()
      setSearch('')
    },
  })

  const selectedLabel = useMemo(() => {
    return options.find((opt) => opt.value === value)?.label ?? null
  }, [options, value])

  const filteredOptions = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim()
    if (!lowerSearch) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch))
  }, [options, search])

  return (
    <Combobox
      store={combobox}
      width={dropdownWidth === 'auto' ? undefined : dropdownWidth}
      onOptionSubmit={(val) => {
        onChange(val)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          size="xs"
          pointer
          rightSection={
            clearable && value
              ? <Combobox.ClearButton onClear={() => onChange(null)} />
              : <Combobox.Chevron />
          }
          rightSectionPointerEvents={clearable && value ? 'all' : 'none'}
          onClick={() => combobox.toggleDropdown()}
          style={style}
        >
          {selectedLabel || <Input.Placeholder>{placeholder}</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown style={dropdownWidth === 'auto' ? { minWidth: 'max-content' } : undefined}>
        <Combobox.Search
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder={placeholder}
        />
        <Combobox.Options mah={dropdownMaxHeight} style={{ overflowY: 'auto' }}>
          {combobox.dropdownOpened && filteredOptions.map((opt) => (
            <Combobox.Option key={opt.value} value={opt.value} active={opt.value === value} style={{ whiteSpace: 'nowrap' }}>
              <Group gap={6} justify='space-between'>
                {opt.label}
                {opt.value === value && <CheckIcon size={12} />}
              </Group>
            </Combobox.Option>
          ))}
          {combobox.dropdownOpened && filteredOptions.length === 0 && <Combobox.Empty>No results</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
