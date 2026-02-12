import { FormInstance } from 'antd/es/form/hooks/useForm'
import {
  Constants,
  ElementNames,
  PathNames,
  Sets,
} from 'lib/constants/constants'
import {
  defaultSetConditionals,
  getDefaultForm,
} from 'lib/optimization/defaultForm'
import {
  NULL_TURN_ABILITY_NAME,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  ANAXA,
  CYRENE,
  MOZE,
  PHAINON,
  THE_DAHLIA,
} from 'lib/simulations/tests/testMetadataConstants'
import DB from 'lib/state/db'
import {
  BenchmarkForm,
  SimpleCharacter,
} from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import {
  PresetDefinition,
  setSortColumn,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { CharacterId } from 'types/character'
import { Form } from 'types/form'
import { ScoringMetadata } from 'types/metadata'

export function applySpdPreset(spd: number, characterId: CharacterId | null | undefined) {
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

  // We don't use the clone here because serializing messes up the applyPreset functions
  const sortOption = metadata.simulation ? SortOption.COMBO : metadata.sortOption
  form.resultSort = sortOption.key
  setSortColumn(sortOption.combatGridColumn)

  window.optimizerForm.setFieldsValue(form)
  window.onOptimizerFormValuesChange({} as Form, form)
}

export function applyMetadataPresetToForm(form: Form, scoringMetadata: ScoringMetadata) {
  // @ts-ignore TODO getDefaultForm currently has handling for no character id but is set to be changed
  Utils.mergeUndefinedValues(form, getDefaultForm())

  form.comboTurnAbilities = scoringMetadata?.simulation?.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, WHOLE_BASIC]
  form.comboDot = scoringMetadata?.simulation?.comboDot ?? 0

  // @ts-ignore
  form.maxSpd = undefined
  form.mainBody = scoringMetadata.parts[Constants.Parts.Body]
  form.mainFeet = scoringMetadata.parts[Constants.Parts.Feet]
  form.mainPlanarSphere = scoringMetadata.parts[Constants.Parts.PlanarSphere]
  form.mainLinkRope = scoringMetadata.parts[Constants.Parts.LinkRope]
  form.weights = { ...form.weights, ...scoringMetadata.stats }
  form.weights.headHands = form.weights.headHands ?? 0
  form.weights.bodyFeet = form.weights.bodyFeet ?? 0
  form.weights.sphereRope = form.weights.sphereRope ?? 0

  applySetConditionalPresets(form)
  applyScoringMetadataPresets(form)
}

export function applyScoringMetadataPresets(form: Form | BenchmarkForm) {
  const character = DB.getMetadata().characters[form.characterId]
  const presets = character?.scoringMetadata?.presets ?? []

  for (const preset of presets) {
    applyPreset(form, preset)
  }
}

export function applyPreset(form: Form | BenchmarkForm, preset: PresetDefinition) {
  form.setConditionals[preset.set][preset.index ?? 1] = preset.value
}

export function applySetConditionalPresets(form: Form | BenchmarkForm) {
  const metadataCharacters = DB.getMetadata().characters
  const characterMetadata = metadataCharacters[form.characterId]
  Utils.mergeUndefinedValues(form.setConditionals, defaultSetConditionals)

  // Disable elemental conditions by default if the character is not of the same element
  const element = characterMetadata?.element
  form.setConditionals[Sets.GeniusOfBrilliantStars][1] = element == ElementNames.Quantum
  form.setConditionals[Sets.ForgeOfTheKalpagniLantern][1] = element == ElementNames.Fire || [
    ANAXA,
  ].includes(form.characterId)

  const path = characterMetadata?.path
  form.setConditionals[Sets.HeroOfTriumphantSong][1] = path == PathNames.Remembrance
  form.setConditionals[Sets.WarriorGoddessOfSunAndThunder][1] = path == PathNames.Remembrance
  form.setConditionals[Sets.WorldRemakingDeliverer][1] = path == PathNames.Remembrance
  form.setConditionals[Sets.AmphoreusTheEternalLand][1] = path == PathNames.Remembrance

  applyTeamAwareSetConditionalPresets(form)
}

export function applyTeamAwareSetConditionalPresets(form: Form | BenchmarkForm, teammateIds?: (CharacterId | undefined)[]) {
  const metadataCharacters = DB.getMetadata().characters

  const allyIds = [
    form.characterId,
    ...(
      teammateIds
        ? teammateIds
        : [
          form.teammate0?.characterId,
          form.teammate1?.characterId,
          form.teammate2?.characterId,
        ]
    ),
  ].filter((x) => !!x)

  // Arcadia depends on the number of ally targets
  // Demiurge is out-of-bounds and therefore not a target
  const targetableMemosprites = allyIds.filter((id) => (
    id
    && id != CYRENE
    && metadataCharacters[id].path == PathNames.Remembrance
  )).length
  const mozes = allyIds.filter((id) => id == MOZE).length
  form.setConditionals[Sets.ArcadiaOfWovenDreams][1] = form.characterId == PHAINON ? 1 : 4 + targetableMemosprites - mozes

  if (allyIds.includes(THE_DAHLIA)) {
    form.setConditionals[Sets.ForgeOfTheKalpagniLantern][1] = true
  }
}

export function applyTeamAwareSetConditionalPresetsToOptimizerFormInstance(formInstance: FormInstance<Form>) {
  const form = formInstance.getFieldsValue()
  applyTeamAwareSetConditionalPresets(form)

  formInstance.setFieldValue(['setConditionals', Sets.ArcadiaOfWovenDreams, 1], form.setConditionals[Sets.ArcadiaOfWovenDreams][1])
}

export function applyTeamAwareSetConditionalPresetsToBenchmarkFormInstance(
  formInstance: FormInstance<BenchmarkForm>,
  teammate0?: SimpleCharacter,
  teammate1?: SimpleCharacter,
  teammate2?: SimpleCharacter,
) {
  const form = formInstance.getFieldsValue()
  const teammateIds = [
    teammate0?.characterId,
    teammate1?.characterId,
    teammate2?.characterId,
  ]

  applyTeamAwareSetConditionalPresets(form, teammateIds)

  formInstance.setFieldValue(['setConditionals', Sets.ArcadiaOfWovenDreams, 1], form.setConditionals[Sets.ArcadiaOfWovenDreams][1])
}
