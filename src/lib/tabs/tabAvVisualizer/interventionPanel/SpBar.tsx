import { Text } from '@mantine/core'

type SpBarProps = {
  sp: number
  spMax: number
}

export function SpBar({ sp, spMax }: SpBarProps) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
      <Text size='xs' fw={600} c='dimmed' style={{ flexShrink: 0 }}>SP</Text>
      <div style={{ flex: 1, display: 'flex', gap: 3, alignItems: 'center' }}>
        {Array.from({ length: spMax }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 14,
              borderRadius: 3,
              background: i < sp
                ? 'var(--mantine-color-yellow-5)'
                : 'var(--mantine-color-dark-4)',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>
      <Text size='xs' c='dimmed' style={{ flexShrink: 0 }}>{sp} / {spMax}</Text>
    </div>
  )
}
