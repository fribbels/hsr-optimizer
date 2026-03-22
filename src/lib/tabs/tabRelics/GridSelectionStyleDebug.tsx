import { Button, Divider, Flex, Slider, Text } from '@mantine/core'
import { useState } from 'react'

const hoverPresets = {
  currentPurple: {
    label: 'Current (strong purple)',
    css: ``,
  },
  subtleWhite: {
    label: 'Subtle white lift',
    css: `.ag-theme-balham-dark { --ag-row-hover-color: rgba(255, 255, 255, 0.03); }
.ag-row-hover:not(.ag-row-selected) .ag-cell {
  background: linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)), var(--cell-bg, transparent);
}`,
  },
  softBlue: {
    label: 'Soft blue',
    css: `.ag-theme-balham-dark { --ag-row-hover-color: rgba(99, 130, 191, 0.06); }
.ag-row-hover:not(.ag-row-selected) .ag-cell {
  background: linear-gradient(rgba(99, 130, 191, 0.06), rgba(99, 130, 191, 0.06)), var(--cell-bg, transparent);
}`,
  },
  mediumBlue: {
    label: 'Medium blue',
    css: `.ag-theme-balham-dark { --ag-row-hover-color: rgba(99, 130, 191, 0.10); }
.ag-row-hover:not(.ag-row-selected) .ag-cell {
  background: linear-gradient(rgba(99, 130, 191, 0.10), rgba(99, 130, 191, 0.10)), var(--cell-bg, transparent);
}`,
  },
  warmWhite: {
    label: 'Warm white',
    css: `.ag-theme-balham-dark { --ag-row-hover-color: rgba(255, 245, 230, 0.04); }
.ag-row-hover:not(.ag-row-selected) .ag-cell {
  background: linear-gradient(rgba(255, 245, 230, 0.05), rgba(255, 245, 230, 0.05)), var(--cell-bg, transparent);
}`,
  },
  coolGray: {
    label: 'Cool gray',
    css: `.ag-theme-balham-dark { --ag-row-hover-color: rgba(180, 190, 210, 0.06); }
.ag-row-hover:not(.ag-row-selected) .ag-cell {
  background: linear-gradient(rgba(180, 190, 210, 0.06), rgba(180, 190, 210, 0.06)), var(--cell-bg, transparent);
}`,
  },
  noHover: {
    label: 'No hover effect',
    css: `.ag-theme-balham-dark { --ag-row-hover-color: transparent; }
.ag-row-hover:not(.ag-row-selected) .ag-cell {
  background: var(--cell-bg, transparent);
}`,
  },
} as const

type HoverKey = keyof typeof hoverPresets

export function GridSelectionStyleDebug() {
  const [activeHover, setActiveHover] = useState<HoverKey>('currentPurple')
  const [hoverOpacity, setHoverOpacity] = useState(4)

  const applyHover = (key: HoverKey) => {
    setActiveHover(key)
    const existing = document.getElementById('grid-hover-debug-style')
    if (existing) existing.remove()

    if (key === 'currentPurple') return // default, no override

    const style = document.createElement('style')
    style.id = 'grid-hover-debug-style'
    style.textContent = hoverPresets[key].css
    document.head.appendChild(style)
  }

  const applyHoverOpacity = (val: number) => {
    setHoverOpacity(val)
    const existing = document.getElementById('grid-hover-debug-opacity')
    if (existing) existing.remove()

    const style = document.createElement('style')
    style.id = 'grid-hover-debug-opacity'
    const alpha = (val / 100).toFixed(2)
    style.textContent = `.ag-theme-balham-dark { --ag-row-hover-color: rgba(255, 255, 255, ${alpha}); }
.ag-row-hover:not(.ag-row-selected) .ag-cell {
  background: linear-gradient(rgba(255, 255, 255, ${alpha}), rgba(255, 255, 255, ${alpha})), var(--cell-bg, transparent) !important;
}`
    document.head.appendChild(style)
  }

  const cleanup = () => {
    document.getElementById('grid-hover-debug-style')?.remove()
    document.getElementById('grid-hover-debug-opacity')?.remove()
    setActiveHover('currentPurple')
    setHoverOpacity(4)
  }

  return (
    <Flex direction="column" gap={8} p="xs" style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 99999,
      border: '1px solid var(--border-color)',
      borderRadius: 6,
      background: 'var(--bg-app)',
      width: 260,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
    }}>
      <Text size="xs" fw={600}>Row Hover Style</Text>

      <Flex direction="column" gap={4}>
        {(Object.keys(hoverPresets) as HoverKey[]).map((key) => (
          <Button
            key={key}
            size="compact-xs"
            variant={activeHover === key ? 'light' : 'subtle'}
            onClick={() => applyHover(key)}
            justify="start"
            fullWidth
          >
            {hoverPresets[key].label}
          </Button>
        ))}
      </Flex>

      <Divider />

      <Flex direction="column" gap={2}>
        <Text size="xs" c="dimmed">Hover tint: {hoverOpacity}%</Text>
        <Slider size="xs" min={0} max={15} value={hoverOpacity} onChange={applyHoverOpacity} />
      </Flex>

      <Button size="compact-xs" variant="default" onClick={cleanup}>
        Reset to default
      </Button>
    </Flex>
  )
}
