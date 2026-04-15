import {
  Badge,
  Button,
  Checkbox,
  Combobox,
  Group,
  useCombobox,
} from '@mantine/core'
import { IconFilter } from '@tabler/icons-react'
import {
  memo,
  type ReactNode,
  useMemo,
  useState,
} from 'react'

export type FilterOption<T> = {
  value: T,
  label: string,
  icon?: ReactNode,
}

type FilterPillProps<T> = {
  label: string,
  options: FilterOption<T>[],
  selected: T[],
  onChange: (values: T[]) => void,
  searchable?: boolean,
  flex?: number,
  columns?: number,
}

function FilterPillInner<T extends string | number | boolean>({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  flex = 1,
  columns = 1,
}: FilterPillProps<T>) {
  const [search, setSearch] = useState('')
  const optionValues = useMemo(() => new Set(options.map((o) => o.value)), [options])
  const activeCount = useMemo(() => selected.filter((v) => optionValues.has(v)).length, [selected, optionValues])

  const combobox = useCombobox({
    onDropdownOpen: () => {
      if (searchable) combobox.focusSearchInput()
    },
    onDropdownClose: () => {
      setSearch('')
      combobox.resetSelectedOption()
    },
  })

  const toggle = (value: T) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(next)
  }

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    const lower = search.toLowerCase().trim()
    return options.filter((opt) => opt.label.toLowerCase().includes(lower))
  }, [options, search])

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        // Find the option by string value and toggle it
        const opt = options.find((o) => String(o.value) === val)
        if (opt) toggle(opt.value)
        // Don't close — let user select multiple
      }}
    >
      <Combobox.Target>
        <Button
          variant={activeCount > 0 ? 'light' : 'default'}
          size='xs'
          onClick={() => combobox.toggleDropdown()}
          leftSection={<IconFilter size={12} />}
          rightSection={activeCount > 0 ? <Badge size='xs' circle variant='filled'>{activeCount}</Badge> : undefined}
          style={{ flex, minWidth: 0, width: '100%' }}
        >
          {label}
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown style={{ minWidth: 'max-content' }}>
        {searchable && (
          <Combobox.Search
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder='Search...'
          />
        )}
        <Combobox.Options
          mah={800}
          style={{
            overflowY: 'auto',
            ...(columns > 1 ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` } : {}),
          }}
        >
          {combobox.dropdownOpened && filteredOptions.map((opt) => {
            const isSelected = selected.includes(opt.value)
            return (
              <Combobox.Option key={String(opt.value)} value={String(opt.value)} active={isSelected}>
                <Group gap={8} wrap='nowrap'>
                  <Checkbox
                    size='xs'
                    checked={isSelected}
                    onChange={() => {}}
                    tabIndex={-1}
                    styles={{ input: { cursor: 'pointer' } }}
                  />
                  {opt.icon && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, flexShrink: 0 }}>
                      {opt.icon}
                    </div>
                  )}
                  <span style={{ whiteSpace: 'nowrap' }}>{opt.label}</span>
                </Group>
              </Combobox.Option>
            )
          })}
          {combobox.dropdownOpened && filteredOptions.length === 0 && <Combobox.Empty>No results</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

export const FilterPill = memo(FilterPillInner) as typeof FilterPillInner
