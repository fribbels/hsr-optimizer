import {
  CheckIcon,
  CloseButton,
  Combobox,
  Group,
  Input,
  type MantineSize,
  Pill,
  PillsInput,
  type PillsInputProps,
  useCombobox,
} from '@mantine/core'
import {
  type CSSProperties,
  type ReactNode,
  useMemo,
  useState,
} from 'react'
import classes from './MultiSelectPills.module.css'

type SimpleOption = { value: string, label: string }
type GroupedOption = { group: string, items: SimpleOption[] }
type DataItem = SimpleOption | GroupedOption

const compactPillStyle = { '--pill-height': '20px' } as CSSProperties
const ellipsisOptionStyle: CSSProperties = { overflow: 'hidden' }
const ellipsisTextStyle: CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

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
  maxDisplayedValues = 2,
  dropdownWidth,
  columns,
  style,
  leftSection,
  leftSectionWidth,
  rightSection,
  renderOption,
  size,
  styles,
  height,
  className,
}: {
  data: DataItem[],
  value: string[],
  onChange: (val: string[]) => void,
  placeholder?: string,
  clearable?: boolean,
  searchable?: boolean,
  maxDropdownHeight?: number,
  maxDisplayedValues?: number,
  dropdownWidth?: number | string,
  columns?: number,
  style?: CSSProperties,
  leftSection?: ReactNode,
  leftSectionWidth?: number,
  rightSection?: ReactNode,
  renderOption?: (option: SimpleOption, active: boolean) => ReactNode,
  size?: MantineSize,
  styles?: PillsInputProps['styles'],
  height?: number,
  className?: string,
}) {
  const compact = size === 'xs'
  const compactHeight = height ?? (compact ? 30 : undefined)

  const heightStyles = useMemo<PillsInputProps['styles'] | undefined>(() => {
    if (compactHeight == null) return styles
    const inputStyle: CSSProperties = {
      minHeight: compactHeight,
      height: compactHeight,
      paddingTop: 0,
      paddingBottom: 0,
      display: 'flex',
      alignItems: 'center',
      ...(leftSectionWidth != null ? { paddingLeft: leftSectionWidth + 4 } : {}),
      ...((styles as Record<string, CSSProperties>)?.input),
    }
    return { ...styles, input: inputStyle } as PillsInputProps['styles']
  }, [compactHeight, leftSectionWidth, styles])

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
  const visibleValues = max === 0 ? [] : value.slice(0, max >= value.length ? max : max - 1)
  const overflowCount = value.length - visibleValues.length

  const pillStyle = compactHeight != null ? compactPillStyle : undefined
  const pills = visibleValues.map((item) => (
    <Pill key={item} style={pillStyle} withRemoveButton onRemove={() => handleValueRemove(item)}>
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
      <Combobox.Option
        value={opt.value}
        key={opt.value}
        active={active}
        className={active ? classes.activeOption : undefined}
        style={columns ? ellipsisOptionStyle : undefined}
      >
        <Group gap='sm' justify='space-between' wrap='nowrap'>
          <span style={columns ? ellipsisTextStyle : undefined}>
            {renderOption ? renderOption(opt, active) : opt.label}
          </span>
          {active && <CheckIcon size={12} />}
        </Group>
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

  const showClear = clearable && value.length > 0

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect} width={dropdownWidth}>
      <Combobox.DropdownTarget>
        <PillsInput
          pointer
          size={compact ? undefined : size}
          className={className}
          styles={heightStyles}
          onClick={() => combobox.toggleDropdown()}
          leftSection={leftSection}
          leftSectionWidth={leftSectionWidth}
          rightSection={showClear
            ? (
              <CloseButton
                size='sm'
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange([])
                }}
              />
            )
            : rightSection}
          style={style}
        >
          <Pill.Group style={{ flexWrap: 'nowrap', overflow: 'hidden', alignItems: 'center', gap: compactHeight != null ? 4 : undefined }}>
            {value.length > 0
              ? (
                <>
                  {pills}
                  {overflowCount > 0 && <Pill style={pillStyle}>+{overflowCount}</Pill>}
                </>
              )
              : !search && (
                <Input.Placeholder style={{ height: 'var(--pill-height, 22px)', display: 'flex', alignItems: 'center', position: 'absolute' }}>
                  {placeholder}
                </Input.Placeholder>
              )}

            <Combobox.EventsTarget>
              <PillsInput.Field
                type={searchable && combobox.dropdownOpened ? undefined : 'hidden'}
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
        <Combobox.Options mah={maxDropdownHeight} className={columns ? classes.columnOptions : undefined} style={{ overflowY: 'auto' }}>
          {combobox.dropdownOpened && renderOptions()}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
