import {
  CheckIcon,
  Combobox,
  Flex,
  Group,
  Input,
  InputBase,
  useCombobox,
} from '@mantine/core'
import { ellipsisTextStyle } from 'lib/constants/constantsUi'
import {
  type ReactNode,
  useMemo,
  useState,
} from 'react'
import iconClasses from 'style/icons.module.css'

const inputEllipsisStyles = { input: ellipsisTextStyle }

export type SearchableComboboxOption = {
  value: string,
  label: string,
  icon?: string,
}

export function SearchableCombobox(props: {
  options: SearchableComboboxOption[],
  value: string | null | undefined,
  onChange: (value: string | null) => void,
  placeholder?: string,
  dropdownWidth?: number | 'auto',
  dropdownMaxHeight?: number,
  style?: React.CSSProperties,
  clearable?: boolean,
  disabled?: boolean,
  searchable?: boolean,
  leftSection?: ReactNode,
  renderOption?: (option: SearchableComboboxOption) => ReactNode,
}) {
  const {
    options,
    value,
    onChange,
    placeholder,
    dropdownWidth = 'auto',
    dropdownMaxHeight = 700,
    style,
    clearable,
    disabled,
    searchable = true,
    leftSection,
    renderOption,
  } = props

  const [search, setSearch] = useState('')

  const combobox = useCombobox({
    onDropdownOpen: () => searchable && combobox.focusSearchInput(),
    onDropdownClose: () => {
      combobox.resetSelectedOption()
      setSearch('')
    },
  })

  const selected = useMemo(() => {
    return options.find((opt) => opt.value === value) ?? null
  }, [options, value])

  const filteredOptions = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim()
    if (!lowerSearch) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch))
  }, [options, search])

  const resolvedLeftSection = leftSection
    ?? (selected?.icon ? <img src={selected.icon} className={iconClasses.icon20} style={{ marginLeft: 2, marginRight: 2 }} /> : null)

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
          component='button'
          type='button'
          size='xs'
          pointer
          disabled={disabled}
          leftSection={resolvedLeftSection}
          rightSection={clearable && value
            ? <Combobox.ClearButton onClear={() => onChange(null)} />
            : <Combobox.Chevron />}
          rightSectionPointerEvents={clearable && value ? 'all' : 'none'}
          onClick={() => combobox.toggleDropdown()}
          style={style}
          styles={inputEllipsisStyles}
        >
          {selected?.label || <Input.Placeholder>{placeholder}</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown style={dropdownWidth === 'auto' ? { minWidth: 'max-content' } : undefined}>
        {searchable && (
          <Combobox.Search
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder={placeholder}
          />
        )}
        <Combobox.Options mah={dropdownMaxHeight} style={{ overflowY: 'auto' }}>
          {combobox.dropdownOpened
            && filteredOptions.map((opt) => (
              <Combobox.Option key={opt.value} value={opt.value} active={opt.value === value} style={{ whiteSpace: 'nowrap' }}>
                <Group gap={6} justify='space-between' wrap='nowrap'>
                  {renderOption
                    ? renderOption(opt)
                    : (
                      <Flex gap={6} align='center'>
                        {opt.icon && <img src={opt.icon} className={iconClasses.icon22} />}
                        {opt.label}
                      </Flex>
                    )}
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
