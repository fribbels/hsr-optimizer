// ---------------------------------------------------------------------------
// Color Debug Panel — controlled component
// Reports config/extractor changes up to the parent via callbacks.
// The parent (ColorPreviewGallery) handles imperative DOM updates.
// ---------------------------------------------------------------------------

import { Button, Divider, Flex, Paper, SegmentedControl, Text, TextInput } from '@mantine/core'
import type {
  CardColorConfig,
  ColorPipelineConfig,
  DarkModeConfig,
} from 'lib/characterPreview/color/colorPipelineConfig'
import { cloneConfig, DEFAULT_CONFIG } from 'lib/characterPreview/color/colorPipelineConfig'
import { CardColorSliders, DarkModeSliders, GenericSliders, type SliderDef } from 'lib/characterPreview/color/debug/ColorDebugSliders'
import { ColorDebugPresets } from 'lib/characterPreview/color/debug/ColorDebugPresets'
import { ColorDebugComparison } from 'lib/characterPreview/color/debug/ColorDebugComparison'
import type { PaletteResponse } from 'lib/characterPreview/color/vibrantFork'
import { useCallback, useRef, useState } from 'react'

export type Extractor = 'vibrant' | 'colorthief'

export interface PortraitFilterConfig {
  blur: number
  brightness: number
  saturate: number
}

export const DEFAULT_PORTRAIT_FILTER: PortraitFilterConfig = {
  blur: 18,
  brightness: 0.50,
  saturate: 0.80,
}

const PORTRAIT_SLIDERS: SliderDef[] = [
  { label: 'Blur', key: 'blur', min: 0, max: 40, step: 1 },
  { label: 'Brightness', key: 'brightness', min: 0.0, max: 1.0, step: 0.05 },
  { label: 'Saturate', key: 'saturate', min: 0.0, max: 2.0, step: 0.05 },
]

export function ColorDebugPanel({ config, extractor, exampleSeedColor, darkMode, extractionProgress, palettes, activePresetName, portraitFilter, onConfigChange, onExtractorChange, onPresetApply, onPortraitFilterChange }: {
  config: ColorPipelineConfig
  extractor: Extractor
  exampleSeedColor: string
  darkMode: boolean
  extractionProgress: string
  palettes: Map<string, PaletteResponse>
  activePresetName: string
  portraitFilter: PortraitFilterConfig
  onConfigChange: (config: ColorPipelineConfig) => void
  onExtractorChange: (extractor: Extractor) => void
  onPresetApply: (config: ColorPipelineConfig, seeds: Map<string, string>, presetName: string, portrait: PortraitFilterConfig) => void
  onPortraitFilterChange: (filter: PortraitFilterConfig) => void
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

  const handleDarkMode = useCallback((key: string, value: number) => {
    update({ ...config, darkMode: { ...config.darkMode, [key]: value } as DarkModeConfig })
  }, [config, update])

  const handlePortraitFilter = useCallback((key: string, value: number) => {
    onPortraitFilterChange({ ...portraitFilter, [key]: value })
  }, [portraitFilter, onPortraitFilterChange])

  const handleCopyConfig = useCallback(() => {
    void navigator.clipboard.writeText(JSON.stringify({ config, portraitFilter }, null, 2))
  }, [config, portraitFilter])

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

        <PresetRating activePresetName={activePresetName} config={config} portraitFilter={portraitFilter} />

        <Divider />

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

        <ColorDebugPresets palettes={palettes} onApply={(cfg, seeds, name, portrait) => {
          onPresetApply(cfg, seeds, name, portrait)
        }} />

        <Divider />

        <CardColorSliders label="Card Background" config={config.cardBg} onChange={handleCardBg} />
        <CardColorSliders label="Card Border" config={config.cardBorder} onChange={handleCardBorder} />
        <GenericSliders label="Portrait Background" sliders={PORTRAIT_SLIDERS} values={portraitFilter as unknown as Record<string, number>} onChange={handlePortraitFilter} />
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

// ---------------------------------------------------------------------------
// Quick rating widget: rate the current config 1-10, add notes, log to console
// ---------------------------------------------------------------------------
const QUICK_ISSUES = [
  // Colors
  'browns', 'ugly colors', 'too vivid', 'washed out', 'good colors',
  // Brightness
  'too dark', 'too light',
  // Card panel
  'too opaque', 'too transparent',
  // Background portrait
  'bg too bright', 'bg too saturated', 'bg too blurry', 'bg good',
  // Text
  'cant read text',
  // Overall
  'good vibe', 'close', 'best so far',
] as const

interface RatingEntry {
  preset: string
  score: number
  keep: boolean
  notes: string
}

function PresetRating({ activePresetName }: {
  activePresetName: string
  config: ColorPipelineConfig
  portraitFilter: PortraitFilterConfig
}) {
  const [notes, setNotes] = useState('')
  const [keep, setKeep] = useState(false)
  const logRef = useRef<RatingEntry[]>([])

  const submit = useCallback((score: number) => {
    const entry: RatingEntry = { preset: activePresetName, score, keep, notes }
    logRef.current.push(entry)

    console.log(`[Rating] ${keep ? '★' : '✗'} ${activePresetName}: ${score}/5 — ${notes || ''}`)

    const keeps = logRef.current.filter((e) => e.keep)
    if (keeps.length) {
      console.log(`[Rating] Keepers:`)
      console.table(keeps)
    }
    console.log(`[Rating] All (${logRef.current.length}):`)
    console.table(logRef.current)

    setNotes('')
    setKeep(false)
  }, [activePresetName, notes, keep])

  return (
    <Flex direction="column" gap={6}>
      <Text size="xs" fw={700}>{activePresetName}</Text>

      <Flex gap={3} wrap="wrap">
        {QUICK_ISSUES.map((tag) => (
          <Button key={tag} size="compact-xs" variant="outline" color="gray"
            onClick={() => setNotes((prev) => prev ? `${prev}, ${tag}` : tag)}
          >
            {tag}
          </Button>
        ))}
      </Flex>

      <TextInput
        size="xs"
        placeholder="What stands out? (tags auto-append)"
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(3) }}
      />

      <Flex align="center" gap={8}>
        <SegmentedControl
          size="xs"
          value={keep ? 'keep' : 'discard'}
          onChange={(v) => setKeep(v === 'keep')}
          data={[
            { label: '✗ Discard', value: 'discard' },
            { label: '★ Keep', value: 'keep' },
          ]}
          color={keep ? 'teal' : 'red'}
        />
        <Flex gap={2}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Button key={n} size="compact-xs" variant="light"
              color={n >= 4 ? 'teal' : n >= 3 ? 'yellow' : 'red'}
              onClick={() => submit(n)}
              style={{ width: 28 }}
            >
              {n}
            </Button>
          ))}
        </Flex>
        <Text size="xs" c="dimmed">← submit</Text>
      </Flex>
    </Flex>
  )
}
