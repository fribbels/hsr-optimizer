// ---------------------------------------------------------------------------
// Color Debug Panel — controlled component
// Reports config/extractor changes up to the parent via callbacks.
// The parent (ColorPreviewGallery) handles imperative DOM updates.
// ---------------------------------------------------------------------------

import { Button, Divider, Flex, Paper, SegmentedControl, Text } from '@mantine/core'
import type {
  CardColorConfig,
  ColorPipelineConfig,
  DarkModeConfig,
} from 'lib/characterPreview/color/colorPipelineConfig'
import { cloneConfig, DEFAULT_CONFIG } from 'lib/characterPreview/color/colorPipelineConfig'
import { CardColorSliders, DarkModeSliders } from 'lib/characterPreview/color/debug/ColorDebugSliders'
import { ColorDebugPresets } from 'lib/characterPreview/color/debug/ColorDebugPresets'
import { ColorDebugComparison } from 'lib/characterPreview/color/debug/ColorDebugComparison'
import type { PaletteResponse } from 'lib/characterPreview/color/vibrantFork'
import { useCallback } from 'react'

export type Extractor = 'vibrant' | 'colorthief'

export function ColorDebugPanel({ config, extractor, exampleSeedColor, darkMode, extractionProgress, palettes, onConfigChange, onExtractorChange, onPresetApply }: {
  config: ColorPipelineConfig
  extractor: Extractor
  exampleSeedColor: string
  darkMode: boolean
  extractionProgress: string
  palettes: Map<string, PaletteResponse>
  onConfigChange: (config: ColorPipelineConfig) => void
  onExtractorChange: (extractor: Extractor) => void
  onPresetApply: (config: ColorPipelineConfig, seeds: Map<string, string>) => void
}) {
  const update = useCallback((next: ColorPipelineConfig) => {
    onConfigChange(next)
  }, [onConfigChange])

  const handleCardBg = useCallback((key: string, value: number) => {
    update({ ...config, cardBg: { ...config.cardBg, [key]: value } as CardColorConfig })
  }, [config, update])

  const handleCardBorder = useCallback((key: string, value: number) => {
    update({ ...config, cardBorder: { ...config.cardBorder, [key]: value } as CardColorConfig })
  }, [config, update])

  const handleOuterBg = useCallback((key: string, value: number) => {
    update({ ...config, outerBg: { ...config.outerBg, [key]: value } as CardColorConfig })
  }, [config, update])

  const handleDarkMode = useCallback((key: string, value: number) => {
    update({ ...config, darkMode: { ...config.darkMode, [key]: value } as DarkModeConfig })
  }, [config, update])

  const handleCopyConfig = useCallback(() => {
    void navigator.clipboard.writeText(JSON.stringify(config, null, 2))
  }, [config])

  return (
    <Paper
      p="md"
      withBorder
      style={{
        position: 'fixed',
        right: 20,
        top: 80,
        width: 420,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        zIndex: 1000,
        backgroundColor: 'var(--mantine-color-dark-7)',
      }}
    >
      <Flex direction="column" gap={12}>
        <Text size="md" fw={700}>Color Debug Panel</Text>

        <Flex direction="column" gap={4}>
          <Text size="xs" fw={600}>Extractor</Text>
          <SegmentedControl
            size="xs"
            value={extractor}
            onChange={(v) => onExtractorChange(v as Extractor)}
            data={[
              { label: 'node-vibrant', value: 'vibrant' },
              { label: 'colorthief', value: 'colorthief' },
            ]}
          />
          {extractionProgress && (
            <Text size="xs" c="dimmed">{extractionProgress}</Text>
          )}
        </Flex>

        <Divider />

        <ColorDebugPresets palettes={palettes} onApply={onPresetApply} />

        <Divider />

        <CardColorSliders label="Card Background" config={config.cardBg} onChange={handleCardBg} />
        <CardColorSliders label="Card Border" config={config.cardBorder} onChange={handleCardBorder} />
        <CardColorSliders label="Outer Background" config={config.outerBg} onChange={handleOuterBg} />
        <DarkModeSliders config={config.darkMode} onChange={handleDarkMode} />

        <Divider />

        <ColorDebugComparison seedColor={exampleSeedColor} darkMode={darkMode} config={config} />

        <Divider />

        <Flex gap={8}>
          <Button size="xs" variant="light" onClick={handleCopyConfig}>
            Copy Config
          </Button>
          <Button size="xs" variant="subtle" onClick={() => update(cloneConfig(DEFAULT_CONFIG))}>
            Reset
          </Button>
        </Flex>
      </Flex>
    </Paper>
  )
}
