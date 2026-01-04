import { DownOutlined } from '@ant-design/icons'
import { ApplyColumnStateParams } from 'ag-grid-community'
import { Dropdown } from 'antd'
import { TFunction } from 'i18next'
import { applySpdPreset } from 'lib/conditionals/evaluation/applyPresets'
import {
  Sets,
  SetsOrnaments,
  SetsRelics,
} from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import DB from 'lib/state/db'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'

// FIXME HIGH

/*
 * 111.11 (5 actions in first four cycles)
 * 114.28 (4 actions in first three cycles)
 * 120.00 (3 actions in two cycles, activates planar set effects)
 * 133.33 (2 actions in first cycle, 6 actions in first four cycles)
 * 142.85 (5 actions in first three cycles)
 * 155.55 (7 actions in first four cycles)
 * 160.00 (4 actions in first two cycles)
 * 171.42 (6 actions in first three cycles)
 * 177.77 (8 actions in first four cycles)
 * 200.00 (3 actions in first cycle)
 */
export type PresetDefinition = {
  name: string,
  set: SetsRelics | SetsOrnaments,
  value: number | boolean,
  index?: number,
}

export const PresetEffects = {
  // Dynamic values

  fnAshblazingSet: (stacks: number): PresetDefinition => {
    return {
      name: 'fnAshblazingSet',
      value: stacks,
      set: Sets.TheAshblazingGrandDuke,
    }
  },
  fnPioneerSet: (value: number): PresetDefinition => {
    return {
      name: 'fnPioneerSet',
      value: value,
      set: Sets.PioneerDiverOfDeadWaters,
    }
  },
  fnSacerdosSet: (value: number): PresetDefinition => {
    return {
      name: 'fnSacerdosSet',
      value: value,
      set: Sets.SacerdosRelivedOrdeal,
    }
  },

  // Preset values

  PRISONER_SET: {
    name: 'PRISONER_SET',
    value: 3,
    set: Sets.PrisonerInDeepConfinement,
  } as PresetDefinition,
  WASTELANDER_SET: {
    name: 'WASTELANDER_SET',
    value: 2,
    set: Sets.WastelanderOfBanditryDesert,
  } as PresetDefinition,
  VALOROUS_SET: {
    name: 'VALOROUS_SET',
    value: true,
    set: Sets.TheWindSoaringValorous,
  } as PresetDefinition,
  BANANA_SET: {
    name: 'BANANA_SET',
    value: true,
    set: Sets.TheWondrousBananAmusementPark,
  } as PresetDefinition,
  GENIUS_SET: {
    name: 'GENIUS_SET',
    value: true,
    set: Sets.GeniusOfBrilliantStars,
  } as PresetDefinition,
  WARRIOR_SET: {
    name: 'WARRIOR_SET',
    value: true,
    set: Sets.WarriorGoddessOfSunAndThunder,
  } as PresetDefinition,
  TENGOKU_SET: {
    name: 'TENGOKU_SET',
    value: true,
    set: Sets.TengokuLivestream,
  } as PresetDefinition,
}

export function setSortColumn(columnId: string) {
  const columnState: ApplyColumnStateParams = {
    state: [
      {
        colId: columnId,
        sort: 'desc',
      },
    ],
    defaultState: { sort: null },
  }
  window.optimizerGrid.current?.api.applyColumnState(columnState)
}

export type SpdPresets = Record<string, {
  key: string,
  label: string | ReactElement,
  value: number | undefined,
  disabled?: boolean,
}>

export type SpdPresetCategory = {
  key: string,
  label: string,
  presets: SpdPresets,
}

export type SpdPresetsResult = {
  categories: SpdPresetCategory[],
  allPresets: SpdPresets,
}

export function generateSpdPresets(t: TFunction<'optimizerTab', 'Presets'>): SpdPresetsResult {
  const mocPresets: SpdPresets = {
    SPD0: {
      key: 'SPD0',
      label: t('SpdValues.SPD0'), // 'No minimum speed',
      value: undefined,
    },
    SPD111: {
      key: 'SPD111',
      label: t('SpdValues.SPD111'), // '111.112 SPD - 5 actions in first four cycles',
      value: 111.112,
    },
    SPD114: {
      key: 'SPD114',
      label: t('SpdValues.SPD114'), // '114.286 SPD - 4 actions in first three cycles',
      value: 114.286,
    },
    SPD120: {
      key: 'SPD120',
      label: t('SpdValues.SPD120'), // '120.000 SPD - 3 actions in first two cycles',
      value: 120.000,
    },
    SPD133: {
      key: 'SPD133',
      label: t('SpdValues.SPD133'), /* 133.334 SPD - 2 actions in first cycle, 6 actions in first four cycles */
      value: 133.334,
    },
    SPD142: {
      key: 'SPD142',
      label: t('SpdValues.SPD142'), // '142.858 SPD - 5 actions in first three cycles',
      value: 142.858,
    },
    SPD155: {
      key: 'SPD155',
      label: t('SpdValues.SPD155'), // '155.556 SPD - 7 actions in first four cycles',
      value: 155.556,
    },
    SPD160: {
      key: 'SPD160',
      label: t('SpdValues.SPD160'), // '160.000 SPD - 4 actions in first two cycles',
      value: 160.000,
    },
    SPD171: {
      key: 'SPD171',
      label: t('SpdValues.SPD171'), // '171.429 SPD - 6 actions in first three cycles',
      value: 171.429,
    },
    SPD177: {
      key: 'SPD177',
      label: t('SpdValues.SPD177'), // '177.778 SPD - 8 actions in first four cycles',
      value: 177.778,
    },
    SPD200: {
      key: 'SPD200',
      label: t('SpdValues.SPD200'), // '200.000 SPD - 3 actions in first cycle',
      value: 200.000,
    },
  }

  const aaPresets: SpdPresets = {
    AA_SPD0: {
      key: 'AA_SPD0',
      label: t('SpdValues.SPD0'), // 'No minimum speed',
      value: 0,
    },
    AA_SPD133: {
      key: 'AA_SPD133',
      label: t('AaSpdValues.SPD133'), // '133.334 SPD - 4 turns in first cycle',
      value: 133.334,
    },
    AA_SPD166: {
      key: 'AA_SPD166',
      label: t('AaSpdValues.SPD166'), // '166.667 SPD - 5 turns in first cycle',
      value: 166.667,
    },
    AA_SPD120: {
      key: 'AA_SPD120',
      label: t('AaSpdValues.SPD120'), // '120.000 SPD - 6 turns in first two cycles',
      value: 120.000,
    },
    AA_SPD140: {
      key: 'AA_SPD140',
      label: t('AaSpdValues.SPD140'), // '140.000 SPD - 7 turns in first two cycles',
      value: 140.000,
    },
    AA_SPD160: {
      key: 'AA_SPD160',
      label: t('AaSpdValues.SPD160'), // '160.000 SPD - 8 turns in first two cycles',
      value: 160.000,
    },
    AA_SPD180: {
      key: 'AA_SPD180',
      label: t('AaSpdValues.SPD180'), // '180.000 SPD - 9 turns in first two cycles',
      value: 180.000,
    },
    AA_SPD200: {
      key: 'AA_SPD200',
      label: t('AaSpdValues.SPD200'), // '200.000 SPD - 6 turns in first cycle, 10 turns in first two cycles',
      value: 200.000,
    },
  }

  const categories: SpdPresetCategory[] = [
    {
      key: 'moc',
      label: t('SpdCategories.MemoryOfChaos'), // 'Memory of Chaos',
      presets: mocPresets,
    },
    {
      key: 'aa',
      label: t('SpdCategories.AnomalyArbitration'), // 'Anomaly Arbitration',
      presets: aaPresets,
    },
  ]

  const allPresets: SpdPresets = { ...mocPresets, ...aaPresets }

  return { categories, allPresets }
}

export const RecommendedPresetsButton = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  const { categories, allPresets } = useMemo(() => {
    return generateSpdPresets(t)
  }, [t])

  const items = useMemo(function() {
    if (!optimizerTabFocusCharacter) return []
    const character = DB.getMetadata().characters[optimizerTabFocusCharacter]
    if (!character) return []

    const groupedChildren = categories.map((category) => {
      const presetItems = Object.values(category.presets).map((preset) => ({
        ...preset,
        label: <div style={{ minWidth: 450, lineHeight: '18px' }}>{preset.label}</div>,
      }))

      return { type: 'group' as const, label: category.label, children: presetItems }
    })

    return [{
      key: t('StandardLabel', { id: character.id }),
      label: t('StandardLabel', { id: character.id }),
      children: groupedChildren,
    }]
  }, [optimizerTabFocusCharacter, t, categories])

  const actionsMenuProps = {
    items,
    onClick: (event: {
      key: string,
    }) => {
      if (allPresets[event.key]) {
        applySpdPreset(allPresets[event.key].value!, optimizerTabFocusCharacter)
      } else {
        Message.warning(t('PresetNotAvailable') /* 'Preset not available, please select another option' */)
      }
    },
  }

  return (
    <Dropdown.Button
      className='full-width-dropdown-button'
      type='primary'
      menu={actionsMenuProps}
      onClick={() => applySpdPreset(allPresets.SPD0.value!, optimizerTabFocusCharacter)}
      icon={<DownOutlined />}
      style={{ flex: 1, width: '100%' }}
    >
      {t('RecommendedPresets') /* Recommended presets */}
    </Dropdown.Button>
  )
}
