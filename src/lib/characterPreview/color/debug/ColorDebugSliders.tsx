import { Flex, Slider, Text } from '@mantine/core'
import type { CardColorConfig, DarkModeConfig } from 'lib/characterPreview/color/colorPipelineConfig'

interface SliderDef {
  label: string
  key: string
  min: number
  max: number
  step: number
}

const CARD_SLIDERS: SliderDef[] = [
  // Lightness
  { label: 'Target L', key: 'targetL', min: 0.02, max: 0.50, step: 0.01 },
  { label: 'L Input Scale', key: 'lInputScale', min: -0.5, max: 0.5, step: 0.01 },
  { label: 'Min L', key: 'minL', min: 0.0, max: 0.30, step: 0.01 },
  { label: 'Max L', key: 'maxL', min: 0.10, max: 0.60, step: 0.01 },
  // Chroma
  { label: 'Chroma Scale', key: 'chromaScale', min: 0.0, max: 2.0, step: 0.05 },
  { label: 'Chroma Power', key: 'chromaPower', min: 0.1, max: 3.0, step: 0.1 },
  { label: 'Min Chroma', key: 'minC', min: 0.0, max: 0.10, step: 0.002 },
  { label: 'Max Chroma', key: 'maxC', min: 0.0, max: 0.25, step: 0.005 },
  // Hue
  { label: 'Hue Shift', key: 'hueShift', min: -30, max: 30, step: 1 },
  // Alpha
  { label: 'Alpha', key: 'alpha', min: 0.0, max: 1.0, step: 0.05 },
]

const DARK_MODE_SLIDERS: SliderDef[] = [
  { label: 'L Offset', key: 'lOffset', min: -0.15, max: 0.05, step: 0.005 },
  { label: 'C Scale', key: 'cScale', min: 0.3, max: 1.0, step: 0.05 },
]

export function CardColorSliders({ label, config, onChange }: {
  label: string
  config: CardColorConfig
  onChange: (key: string, value: number) => void
}) {
  return (
    <Flex direction="column" gap={4}>
      <Text size="sm" fw={600}>{label}</Text>
      {CARD_SLIDERS.map((s) => (
        <SliderRow
          key={s.key}
          def={s}
          value={config[s.key as keyof CardColorConfig]}
          onChange={(v) => onChange(s.key, v)}
        />
      ))}
    </Flex>
  )
}

export function DarkModeSliders({ config, onChange }: {
  config: DarkModeConfig
  onChange: (key: string, value: number) => void
}) {
  return (
    <Flex direction="column" gap={4}>
      <Text size="sm" fw={600}>Dark Mode</Text>
      {DARK_MODE_SLIDERS.map((s) => (
        <SliderRow
          key={s.key}
          def={s}
          value={config[s.key as keyof DarkModeConfig]}
          onChange={(v) => onChange(s.key, v)}
        />
      ))}
    </Flex>
  )
}

function SliderRow({ def, value, onChange }: {
  def: SliderDef
  value: number
  onChange: (v: number) => void
}) {
  return (
    <Flex align="center" gap={8}>
      <Text size="xs" style={{ width: 100, flexShrink: 0 }}>{def.label}</Text>
      <Slider
        style={{ flex: 1 }}
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={onChange}
        size="xs"
      />
      <Text size="xs" ff="monospace" style={{ width: 50, textAlign: 'right', flexShrink: 0 }}>
        {value.toFixed(3)}
      </Text>
    </Flex>
  )
}
