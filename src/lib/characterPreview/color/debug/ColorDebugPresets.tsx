import { Button, Flex, Text, Tooltip } from '@mantine/core'
import type { ColorPipelineConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import { FULL_PRESETS, applyPreset, type FullPreset, type PortraitFilterPreset } from 'lib/characterPreview/color/debug/colorPresets'
import type { PaletteResponse } from 'lib/characterPreview/color/colorThiefExtractor'

export function ColorDebugPresets({ palettes, onApply }: {
  palettes: Map<string, PaletteResponse>
  onApply: (config: ColorPipelineConfig, seeds: Map<string, string>, presetName: string, portrait: PortraitFilterPreset, useHSL?: boolean) => void
}) {
  return (
    <Flex direction="column" gap={6}>
      <Text size="xs" fw={600}>Presets</Text>
      <Flex wrap="wrap" gap={4}>
        {FULL_PRESETS.map((preset) => (
          <PresetButton key={preset.name} preset={preset} palettes={palettes} onApply={onApply} />
        ))}
      </Flex>
    </Flex>
  )
}

function PresetButton({ preset, palettes, onApply }: {
  preset: FullPreset
  palettes: Map<string, PaletteResponse>
  onApply: (config: ColorPipelineConfig, seeds: Map<string, string>, presetName: string, portrait: PortraitFilterPreset, useHSL?: boolean) => void
}) {
  return (
    <Tooltip label={preset.description} position="bottom" withArrow zIndex={1100}>
      <Button
        size="compact-xs"
        variant="light"
        color={preset.useHSL ? 'cyan' : undefined}
        onClick={() => {
          const { config, seeds, portrait } = applyPreset(preset, palettes)
          onApply(config, seeds, preset.name, portrait, preset.useHSL)
        }}
      >
        {preset.name}
      </Button>
    </Tooltip>
  )
}
