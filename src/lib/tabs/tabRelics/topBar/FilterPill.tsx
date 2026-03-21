import { IconFilter } from '@tabler/icons-react'
import { Badge, Button, Checkbox, Flex, Popover, ScrollArea, UnstyledButton } from '@mantine/core'
import { type ReactNode, useState } from 'react'

export type FilterOption<T> = {
  value: T
  label: string
  icon?: ReactNode
}

export function FilterPill<T extends string | number | boolean>({
  label,
  options,
  selected,
  onChange,
  popoverWidth = 220,
  columns = 1,
}: {
  label: string
  options: FilterOption<T>[]
  selected: T[]
  onChange: (values: T[]) => void
  popoverWidth?: number
  columns?: number
}) {
  const [opened, setOpened] = useState(false)
  const activeCount = selected.length

  const toggle = (value: T) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(next)
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      withinPortal
      shadow="md"
    >
      <Popover.Target>
        <Button
          variant={activeCount > 0 ? 'light' : 'default'}
          size="xs"
          onClick={() => setOpened((o) => !o)}
          leftSection={<IconFilter size={12} />}
          style={{ flex: 1 }}
          rightSection={activeCount > 0 ? (
            <Badge size="xs" circle variant="filled">{activeCount}</Badge>
          ) : undefined}
        >
          {label}
        </Button>
      </Popover.Target>

      <Popover.Dropdown p={6} style={{ width: popoverWidth }}>
        {opened && (
          <ScrollArea.Autosize mah={400}>
            <Flex
              direction={columns > 1 ? 'row' : 'column'}
              wrap={columns > 1 ? 'wrap' : undefined}
              gap={1}
            >
              {options.map((opt) => {
                const isSelected = selected.includes(opt.value)
                return (
                  <UnstyledButton
                    key={String(opt.value)}
                    onClick={() => toggle(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 8px',
                      borderRadius: 4,
                      backgroundColor: isSelected ? 'var(--mantine-color-primary-light)' : undefined,
                      width: columns > 1 ? `calc(${100 / columns}% - 2px)` : undefined,
                    }}
                  >
                    <Checkbox
                      size="xs"
                      checked={isSelected}
                      onChange={() => toggle(opt.value)}
                      tabIndex={-1}
                      styles={{ input: { cursor: 'pointer' } }}
                    />
                    {opt.icon && (
                      <Flex align="center" justify="center" style={{ width: 22, height: 22, flexShrink: 0 }}>
                        {opt.icon}
                      </Flex>
                    )}
                    <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{opt.label}</span>
                  </UnstyledButton>
                )
              })}
            </Flex>
          </ScrollArea.Autosize>
        )}
      </Popover.Dropdown>
    </Popover>
  )
}
