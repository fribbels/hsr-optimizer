import { Text } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'

type SpBarProps = {
  sp: number
  spMax: number
}

export function SpBar({ sp, spMax }: SpBarProps) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
      <Text size='xs' fw={600} c='dimmed' style={{ flexShrink: 0 }}>SP</Text>
      <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
        {Array.from({ length: spMax }, (_, i) => (
          <img
            key={i}
            src={Assets.getSpIcon(i < sp)}
            alt=''
            style={{
              height: 18,
              width: 18,
              objectFit: 'contain',
              opacity: i < sp ? 1 : 0.6,
              transition: 'opacity 0.15s',
            }}
          />
        ))}
      </div>
      <Text size='xs' c='dimmed' style={{ flexShrink: 0 }}>{sp} / {spMax}</Text>
    </div>
  )
}
