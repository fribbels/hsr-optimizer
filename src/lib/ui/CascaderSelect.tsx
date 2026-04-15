import {
  Input,
  InputBase,
  type MantineRadius,
  type MantineSize,
  Menu,
} from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import {
  type ReactNode,
  useMemo,
} from 'react'

// === Types ===

export type CascaderOption = {
  label: string,
  value: string,
  leftSection?: ReactNode,
}

export type CascaderGroup = {
  label: string,
  leftSection?: ReactNode,
  options: CascaderOption[],
}

export type CascaderData = CascaderGroup[]

export interface CascaderSelectProps {
  data: CascaderData
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  size?: MantineSize
  variant?: 'default' | 'filled' | 'unstyled'
  radius?: MantineRadius
  leftSection?: ReactNode
  leftSectionWidth?: React.CSSProperties['width']
  rightSection?: ReactNode
  clearable?: boolean
  onClear?: () => void
  style?: React.CSSProperties
  styles?: Partial<Record<'input' | 'wrapper' | 'section', React.CSSProperties>>
  className?: string
  menuWidth?: number | string
  menuPosition?: 'bottom' | 'bottom-start' | 'bottom-end'
  subMenuPosition?: 'right-start' | 'right' | 'right-end' | 'left-start' | 'left' | 'left-end'
}

// === Component ===

export function CascaderSelect(props: CascaderSelectProps) {
  const {
    data,
    value,
    onChange,
    placeholder,
    disabled = false,
    size,
    variant,
    radius,
    leftSection,
    leftSectionWidth,
    rightSection,
    clearable = false,
    onClear,
    style,
    styles,
    className,
    menuWidth,
    menuPosition = 'bottom-start',
    subMenuPosition,
  } = props

  // Resolve value → display label
  const selectedLabel = useMemo(() => {
    if (value == null) return null
    for (const group of data) {
      for (const opt of group.options) {
        if (opt.value === value) return opt.label
      }
    }
    return null
  }, [data, value])

  // Handle clear — always call onChange(null), plus onClear as side-channel
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    onClear?.()
  }

  // Right section: clear button when clearable+has value, otherwise custom or nothing
  const resolvedRightSection = clearable && value != null
    ? (
      <IconX
        size={14}
        style={{ cursor: 'pointer', opacity: 0.5 }}
        onClick={handleClear}
      />
    )
    : rightSection

  return (
    <Menu
      position={menuPosition}
      width={menuWidth}
      disabled={disabled}
    >
      <Menu.Target>
        <InputBase
          component='button'
          type='button'
          pointer
          size={size}
          variant={variant}
          radius={radius}
          leftSection={leftSection}
          leftSectionWidth={leftSectionWidth}
          rightSection={resolvedRightSection}
          rightSectionPointerEvents={clearable && value != null ? 'all' : 'none'}
          disabled={disabled}
          style={style}
          styles={styles}
          className={className}
        >
          {selectedLabel || <Input.Placeholder>{placeholder}</Input.Placeholder>}
        </InputBase>
      </Menu.Target>

      <Menu.Dropdown miw={125}>
        {data.map((group) => (
          <Menu.Sub key={group.label} position={subMenuPosition}>
            <Menu.Sub.Target>
              <Menu.Sub.Item leftSection={group.leftSection}>
                {group.label}
              </Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown miw={125}>
              {group.options.map((opt) => (
                <Menu.Item
                  key={opt.value}
                  leftSection={opt.leftSection}
                  onClick={() => onChange(opt.value)}
                >
                  {opt.label}
                </Menu.Item>
              ))}
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
