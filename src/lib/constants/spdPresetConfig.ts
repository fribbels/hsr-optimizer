import type { TFunction } from 'i18next'
import type { ComboboxNumberGroup } from 'lib/ui/ComboboxNumberInput'

export type SpdPresets = Record<string, {
  key: string,
  label: string,
  value: number | undefined,
  disabled?: boolean,
}>

type SpdPresetCategory = {
  key: string,
  label: string,
  presets: SpdPresets,
}

type SpdPresetsResult = {
  categories: SpdPresetCategory[],
  allPresets: SpdPresets,
}

/**
 * SPD breakpoint definitions: key -> numeric value.
 *
 * Memory of Chaos breakpoints:
 *   111.112 — 5 actions in first four cycles
 *   114.286 — 4 actions in first three cycles
 *   120.000 — 3 actions in first two cycles (activates planar set effects)
 *   133.334 — 2 actions in first cycle, 6 actions in first four cycles
 *   142.858 — 5 actions in first three cycles
 *   155.556 — 7 actions in first four cycles
 *   160.000 — 4 actions in first two cycles
 *   171.429 — 6 actions in first three cycles
 *   177.778 — 8 actions in first four cycles
 *   200.000 — 3 actions in first cycle
 *
 * Anomaly Arbitration breakpoints:
 *   133.334 — 4 turns in first cycle
 *   166.667 — 5 turns in first cycle
 *   120.000 — 6 turns in first two cycles
 *   140.000 — 7 turns in first two cycles
 *   160.000 — 8 turns in first two cycles
 *   180.000 — 9 turns in first two cycles
 *   200.000 — 6 turns in first cycle, 10 turns in first two cycles
 */

const MOC_SPD_BREAKPOINTS = {
  SPD0: undefined,
  SPD111: 111.112,
  SPD114: 114.286,
  SPD120: 120.000,
  SPD133: 133.334,
  SPD142: 142.858,
  SPD155: 155.556,
  SPD160: 160.000,
  SPD171: 171.429,
  SPD177: 177.778,
  SPD200: 200.000,
} as const

const AA_SPD_BREAKPOINTS = {
  AA_SPD0: 0,
  AA_SPD133: 133.334,
  AA_SPD166: 166.667,
  AA_SPD120: 120.000,
  AA_SPD140: 140.000,
  AA_SPD160: 160.000,
  AA_SPD180: 180.000,
  AA_SPD200: 200.000,
} as const

function buildPresets<T extends Record<string, number | undefined>>(
  breakpoints: T,
  t: TFunction<'optimizerTab', 'Presets'>,
  i18nPrefix: string,
): SpdPresets {
  const presets: SpdPresets = {}
  for (const [key, value] of Object.entries(breakpoints)) {
    const labelKey = key.replace(/^AA_/, '')
    presets[key] = {
      key,
      label: t(`${i18nPrefix}.${labelKey}` as never),
      value: value as number | undefined,
    }
  }
  return presets
}

export function generateSpdPresets(t: TFunction<'optimizerTab', 'Presets'>): SpdPresetsResult {
  const mocPresets = buildPresets(MOC_SPD_BREAKPOINTS, t, 'SpdValues')
  const aaPresets = buildPresets(AA_SPD_BREAKPOINTS, t, 'AaSpdValues')

  // The "no minimum speed" entry for AA uses the MoC label
  aaPresets.AA_SPD0.label = t('SpdValues.SPD0')

  const categories: SpdPresetCategory[] = [
    {
      key: 'moc',
      label: t('SpdCategories.MemoryOfChaos'),
      presets: mocPresets,
    },
    {
      key: 'aa',
      label: t('SpdCategories.AnomalyArbitration'),
      presets: aaPresets,
    },
  ]

  const allPresets: SpdPresets = { ...mocPresets, ...aaPresets }

  return { categories, allPresets }
}

export function buildSpdPresetOptions(
  t: TFunction<'optimizerTab', 'Presets'>,
  opts: {
    skipNoMinimum?: boolean,
    disableAbove?: number,
    extraGroups?: ComboboxNumberGroup[],
  } = {},
): ComboboxNumberGroup[] {
  const { categories } = generateSpdPresets(t)
  const seen = new Set<string>()

  const categoryItems = categories.map((category) => {
    let presetEntries = Object.values(category.presets)
    if (opts.skipNoMinimum) {
      // Skip entries where value is absent or zero (the "no minimum speed" entries)
      presetEntries = presetEntries.filter((p) => p.value != null && p.value > 0)
    }

    const items = presetEntries
      .map((preset) => ({
        value: String(preset.value ?? 0),
        label: String(preset.label),
        disabled: opts.disableAbove != null && preset.value != null && preset.value > opts.disableAbove
          ? true
          : undefined,
      }))
      .filter((opt) => {
        if (seen.has(opt.value)) return false
        seen.add(opt.value)
        return true
      })

    return {
      group: category.label,
      items,
    }
  })

  return [
    ...(opts.extraGroups ?? []),
    ...categoryItems,
  ]
}

