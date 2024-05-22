import { useMemo } from 'react'
import { Button, Dropdown } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import DB from 'lib/db.js'
import { Message } from 'lib/message.js'
import { Constants, Sets } from 'lib/constants.ts'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import { defaultSetConditionals, getDefaultForm } from 'lib/defaultForm.js'
import { ApplyColumnStateParams } from 'ag-grid-community'
import { Utils } from 'lib/utils'

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

export const SpdValues = {
  SPD0: {
    key: 'SPD0',
    label: '0 SPD - Action advance support recommended',
    value: undefined,
  },
  SPD111: {
    key: 'SPD111',
    label: '111.112 SPD - 5 actions in first four cycles',
    value: 111.112,
  },
  SPD114: {
    key: 'SPD114',
    label: '114.286 SPD - 4 actions in first three cycles',
    value: 114.286,
  },
  SPD120: {
    key: 'SPD120',
    label: '120.000 SPD - 3 actions in first two cycles',
    value: 120.000,
  },
  SPD133: {
    key: 'SPD133',
    label: (<b>133.334 SPD - 2 actions in first cycle, 6 actions in first four cycles</b>),
    value: 133.334,
  },
  SPD142: {
    key: 'SPD142',
    label: '142.858 SPD - 5 actions in first three cycles',
    value: 142.858,
  },
  SPD155: {
    key: 'SPD155',
    label: '155.556 SPD - 7 actions in first four cycles',
    value: 155.556,
  },
  SPD160: {
    key: 'SPD160',
    label: '160.000 SPD - 4 actions in first two cycles',
    value: 160.000,
  },
  SPD171: {
    key: 'SPD171',
    label: '171.429 SPD - 6 actions in first three cycles',
    value: 171.429,
  },
  SPD177: {
    key: 'SPD177',
    label: '177.778 SPD - 8 actions in first four cycles',
    value: 177.778,
  },
  SPD200: {
    key: 'SPD200',
    label: '200.000 SPD - 3 actions in first cycle',
    value: 200.000,
  },
}
const standardSpdOptions = Object.values(SpdValues)
standardSpdOptions.map((x) => x.label = (<div style={{ minWidth: 450 }}>{x.label}</div>))

export function generateStandardSpdOptions(label) {
  return {
    key: label,
    label: label,
    children: standardSpdOptions,
  }
}

export const PresetEffects = {
  fnAshblazingSet: (stacks) => {
    return (form) => {
      form.setConditionals[Sets.TheAshblazingGrandDuke][1] = stacks
    }
  },
  fnPioneerSet: (value) => {
    return (form) => {
      form.setConditionals[Sets.PioneerDiverOfDeadWaters][1] = value
    }
  },
  PRISONER_SET: (form) => {
    form.setConditionals[Sets.PrisonerInDeepConfinement][1] = 3
  },
  WASTELANDER_SET: (form) => {
    form.setConditionals[Sets.PrisonerInDeepConfinement][1] = 2
  },
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

const RecommendedPresetsButton = () => {
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  const items = useMemo(function() {
    if (!optimizerTabFocusCharacter) return []
    const character = DB.getMetadata().characters[optimizerTabFocusCharacter]
    if (!character) return []

    // "Standard" Placeholder for now until we have customized builds
    return [generateStandardSpdOptions(`Standard ${character.displayName}`)]
  }, [optimizerTabFocusCharacter])

  const actionsMenuProps = {
    items,
    onClick: (event) => {
      if (SpdValues[event.key]) {
        applySpdPreset(SpdValues[event.key].value, optimizerTabFocusCharacter)
      } else {
        Message.warning('Preset not available, please select another option')
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
        <Button type="primary" style={{ width: '100%' }}>
          Recommended presets
          <DownOutlined />
        </Button>
      </a>
    </Dropdown>
  )
}

export function applySpdPreset(spd, characterId) {
  if (!characterId) return

  const character = DB.getMetadata().characters[characterId]
  let metadata = Utils.clone(character.scoringMetadata)

  // Using the user's current form so we don't overwrite their other numeric filter values
  const form = OptimizerTabController.getDisplayFormValues(OptimizerTabController.getForm())
  const defaultForm = OptimizerTabController.getDisplayFormValues(getDefaultForm(character))
  form.setConditionals = defaultForm.setConditionals

  const overrides = window.store.getState().scoringMetadataOverrides[characterId]
  if (overrides) {
    metadata = Utils.mergeDefinedValues(metadata, overrides)
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
  for (const applyPreset of presets) {
    applyPreset(form)
  }

  window.optimizerForm.setFieldsValue(form)
  window.onOptimizerFormValuesChange({}, form)
}

export default RecommendedPresetsButton

export function applyMetadataPresetToForm(form, scoringMetadata) {
  Utils.mergeUndefinedValues(form, getDefaultForm())
  Utils.mergeUndefinedValues(form.setConditionals, defaultSetConditionals)

  const formula = scoringMetadata?.simulation?.formula || {}
  Utils.mergeUndefinedValues(form.combo, formula)
  Object.keys(form.combo).map((key) => form.combo[key] = form.combo[key] || null)

  form.maxSpd = undefined
  form.mainBody = scoringMetadata.parts[Constants.Parts.Body]
  form.mainFeet = scoringMetadata.parts[Constants.Parts.Feet]
  form.mainPlanarSphere = scoringMetadata.parts[Constants.Parts.PlanarSphere]
  form.mainLinkRope = scoringMetadata.parts[Constants.Parts.LinkRope]
  form.weights = scoringMetadata.stats
  form.weights.topPercent = 100

  // Disable elemental conditions by default if the character is not of the same element
  const element = DB.getMetadata().characters[form.characterId].element
  form.setConditionals[Sets.GeniusOfBrilliantStars][1] = element == 'Quantum'
  form.setConditionals[Sets.ForgeOfTheKalpagniLantern][1] = element == 'Fire'
}
