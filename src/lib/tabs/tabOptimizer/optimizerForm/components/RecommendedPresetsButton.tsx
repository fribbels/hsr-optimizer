import { DownOutlined } from '@ant-design/icons'
import { ApplyColumnStateParams } from 'ag-grid-community'
import { Button, Dropdown } from 'antd'
import { TFunction } from 'i18next'
import { Constants, Sets } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { defaultSetConditionals, getDefaultForm } from 'lib/optimization/defaultForm'
import DB from 'lib/state/db'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'
import { Form } from 'types/form'
import { ScoringMetadata } from 'types/metadata'

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
  name: string
  value: number | boolean
  apply: (form: Form) => void
}

export const PresetEffects = {
  // Dynamic values

  fnAshblazingSet: (stacks: number): PresetDefinition => {
    return {
      name: 'fnAshblazingSet',
      value: stacks,
      apply: (form: Form) => {
        form.setConditionals[Sets.TheAshblazingGrandDuke][1] = stacks
      },
    }
  },
  fnPioneerSet: (value: number): PresetDefinition => {
    return {
      name: 'fnPioneerSet',
      value: value,
      apply: (form: Form) => {
        form.setConditionals[Sets.PioneerDiverOfDeadWaters][1] = value
      },
    }
  },
  fnSacerdosSet: (value: number): PresetDefinition => {
    return {
      name: 'fnSacerdosSet',
      value: value,
      apply: (form: Form) => {
        form.setConditionals[Sets.SacerdosRelivedOrdeal][1] = value
      },
    }
  },

  // Preset values

  PRISONER_SET: {
    name: 'PRISONER_SET',
    value: 3,
    apply: (form: Form) => {
      form.setConditionals[Sets.PrisonerInDeepConfinement][1] = 3
    },
  } as PresetDefinition,
  WASTELANDER_SET: {
    name: 'WASTELANDER_SET',
    value: 2,
    apply: (form: Form) => {
      form.setConditionals[Sets.WastelanderOfBanditryDesert][1] = 2
    },
  } as PresetDefinition,
  VALOROUS_SET: {
    name: 'VALOROUS_SET',
    value: true,
    apply: (form: Form) => {
      form.setConditionals[Sets.TheWindSoaringValorous][1] = true
    },
  } as PresetDefinition,
  BANANA_SET: {
    name: 'BANANA_SET',
    value: true,
    apply: (form: Form) => {
      form.setConditionals[Sets.TheWondrousBananAmusementPark][1] = true
    },
  } as PresetDefinition,
  GENIUS_SET: {
    name: 'GENIUS_SET',
    value: true,
    apply: (form: Form) => {
      form.setConditionals[Sets.GeniusOfBrilliantStars][1] = true
    },
  } as PresetDefinition,
}

export function setSortColumn(columnId) {
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
  key: string
  label: string | ReactElement
  value: number | undefined
  disabled?: boolean
}>

export function generateSpdPresets(t: TFunction<'optimizerTab', 'Presets'>) {
  const spdPresets: SpdPresets = {
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
      label: t('SpdValues.SPD133')/* 133.334 SPD - 2 actions in first cycle, 6 actions in first four cycles */,
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
  return spdPresets
}

const RecommendedPresetsButton = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  const spdPresets = useMemo(() => {
    return generateSpdPresets(t)
  }, [t])

  const standardSpdOptions = Object.values(spdPresets)
  standardSpdOptions.map((x) => x.label = (<div style={{ minWidth: 450 }}>{x.label}</div>))

  function generateStandardSpdOptions(label) {
    return {
      key: label,
      label: label,
      children: standardSpdOptions,
    }
  }

  const items = useMemo(function () {
    if (!optimizerTabFocusCharacter) return []
    const character = DB.getMetadata().characters[optimizerTabFocusCharacter]
    if (!character) return []

    // "Standard" Placeholder for now until we have customized builds
    return [generateStandardSpdOptions(t('StandardLabel', { id: character.id }))]// Standard ${CharacterName})
  }, [optimizerTabFocusCharacter, t])

  const actionsMenuProps = {
    items,
    onClick: (event: {
      key: string
    }) => {
      if (spdPresets[event.key]) {
        applySpdPreset(spdPresets[event.key].value!, optimizerTabFocusCharacter)
      } else {
        Message.warning(t('PresetNotAvailable')/* 'Preset not available, please select another option' */)
      }
    },
  }

  return (
    <Dropdown
      menu={actionsMenuProps}
      trigger={['click']}
      overlayStyle={{ width: 'max-content' }}
    >
      <a onClick={(e) => e.preventDefault()}>
        <Button type='primary' style={{ width: '100%' }}>
          {t('RecommendedPresets')/* Recommended presets */}
          <DownOutlined/>
        </Button>
      </a>
    </Dropdown>
  )
}

export function applySpdPreset(spd: number, characterId: string | undefined) {
  if (!characterId) return

  const character = DB.getMetadata().characters[characterId]
  const metadata = TsUtils.clone(character.scoringMetadata)

  // Using the user's current form so we don't overwrite their other numeric filter values
  const form: Form = OptimizerTabController.formToDisplay(OptimizerTabController.getForm())
  const defaultForm: Form = OptimizerTabController.formToDisplay(getDefaultForm(character))
  form.setConditionals = defaultForm.setConditionals

  const overrides = window.store.getState().scoringMetadataOverrides[characterId]
  if (overrides) {
    Utils.mergeDefinedValues(metadata.parts, overrides.parts)
    Utils.mergeDefinedValues(metadata.stats, overrides.stats)
  }
  form.minSpd = spd

  applyMetadataPresetToForm(form, metadata)

  /*
   * Not sure if we want to support set recommendations yet
   * form.ornamentSets = metadata.ornamentSets
   * form.relicSets = metadata.relicSets.map(x => [RelicSetFilterOptions.relic2PlusAny, x])
   */

  // We dont use the clone here because serializing messes up the applyPreset functions
  const presets = character.scoringMetadata.presets || []
  const sortOption = metadata.sortOption
  form.resultSort = sortOption.key
  setSortColumn(sortOption.combatGridColumn)
  for (const preset of presets) {
    preset.apply(form)
  }

  window.optimizerForm.setFieldsValue(form)
  window.onOptimizerFormValuesChange({}, form)
}

export default RecommendedPresetsButton

export function applyMetadataPresetToForm(form: Form, scoringMetadata: ScoringMetadata) {
  Utils.mergeUndefinedValues(form, getDefaultForm())
  Utils.mergeUndefinedValues(form.setConditionals, defaultSetConditionals)

  form.comboAbilities = scoringMetadata?.simulation?.comboAbilities || [null, 'BASIC']
  form.comboDot = scoringMetadata?.simulation?.comboDot || 0
  form.comboBreak = scoringMetadata?.simulation?.comboBreak || 0

  // @ts-ignore
  form.maxSpd = undefined
  form.mainBody = scoringMetadata.parts[Constants.Parts.Body]
  form.mainFeet = scoringMetadata.parts[Constants.Parts.Feet]
  form.mainPlanarSphere = scoringMetadata.parts[Constants.Parts.PlanarSphere]
  form.mainLinkRope = scoringMetadata.parts[Constants.Parts.LinkRope]
  form.weights = { ...form.weights, ...scoringMetadata.stats }
  form.weights.headHands = form.weights.headHands || 0
  form.weights.bodyFeet = form.weights.bodyFeet || 0
  form.weights.sphereRope = form.weights.sphereRope || 0

  // Disable elemental conditions by default if the character is not of the same element
  const element = DB.getMetadata().characters[form.characterId].element
  form.setConditionals[Sets.GeniusOfBrilliantStars][1] = element == 'Quantum'
  form.setConditionals[Sets.ForgeOfTheKalpagniLantern][1] = element == 'Fire'
}
