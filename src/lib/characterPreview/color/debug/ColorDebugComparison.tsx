import { ColorSwatch, Flex, Text } from '@mantine/core'
import chroma from 'chroma-js'
import type { ColorPipelineConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import { showcaseCardBackgroundColor, showcaseCardBorderColor } from 'lib/characterPreview/color/colorUtils'
import {
  getOklchInfo,
  oklchCardBackgroundColor,
  oklchCardBorderColor,
} from 'lib/characterPreview/color/colorUtilsOklch'

// ---------------------------------------------------------------------------
// Side-by-side comparison: old HSL pipeline vs new OKLCH pipeline
// ---------------------------------------------------------------------------

export function ColorDebugComparison({ seedColor, darkMode, config }: {
  seedColor: string
  darkMode: boolean
  config: ColorPipelineConfig
}) {
  const oldBg = showcaseCardBackgroundColor(seedColor, darkMode)
  const oldBorder = showcaseCardBorderColor(seedColor, darkMode)
  const newBg = oklchCardBackgroundColor(seedColor, darkMode, config)
  const newBorder = oklchCardBorderColor(seedColor, darkMode, config)

  const seedInfo = getOklchInfo(seedColor)

  return (
    <Flex direction="column" gap={8}>
      <Text size="sm" fw={600}>Seed Color</Text>
      <Flex align="center" gap={8}>
        <ColorSwatch color={seedColor} size={24} />
        <Text size="xs" ff="monospace">{seedInfo.hex}</Text>
        <Text size="xs" ff="monospace">
          L={seedInfo.l.toFixed(3)} C={seedInfo.c.toFixed(3)} H={seedInfo.h.toFixed(1)}
        </Text>
      </Flex>

      <Flex gap={20}>
        <ComparisonColumn label="Old (HSL)" bg={oldBg} border={oldBorder} />
        <ComparisonColumn label="New (OKLCH)" bg={newBg} border={newBorder} />
      </Flex>
    </Flex>
  )
}

function ComparisonColumn({ label, bg, border }: {
  label: string
  bg: string
  border: string
}) {
  const bgInfo = getOklchInfo(bg)
  const contrast = chroma.contrast(bg, 'white')

  return (
    <Flex direction="column" gap={4} style={{ flex: 1 }}>
      <Text size="xs" fw={600}>{label}</Text>

      <Flex align="center" gap={6}>
        <Text size="xs" style={{ width: 50 }}>Card BG</Text>
        <ColorSwatch color={bg} size={20} />
        <Text size="xs" ff="monospace">{bgInfo.hex}</Text>
      </Flex>
      <Text size="xs" ff="monospace" c="dimmed">
        L={bgInfo.l.toFixed(3)} C={bgInfo.c.toFixed(3)} contrast={contrast.toFixed(1)}:1
      </Text>

      <Flex align="center" gap={6}>
        <Text size="xs" style={{ width: 50 }}>Border</Text>
        <ColorSwatch color={border} size={20} />
        <Text size="xs" ff="monospace">{chroma(border).hex()}</Text>
      </Flex>
    </Flex>
  )
}
