import type { UseFormReturnType } from '@mantine/form'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
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
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { Cyrene } from 'lib/conditionals/character/1400/Cyrene'
import { Phainon } from 'lib/conditionals/character/1400/Phainon'
import { Moze } from 'lib/conditionals/character/1200/Moze'
import { TheDahlia } from 'lib/conditionals/character/1300/TheDahlia'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import type { BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import type { PresetDefinition } from 'lib/scoring/presetEffects'
import { setSortColumn } from 'lib/stores/gridStore'
import { clone, mergeDefinedValues, mergeUndefinedValues } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'
import type { ScoringMetadata } from 'types/metadata'

export function applySpdPreset(spd: number, characterId: CharacterId | null | undefined) {
  if (!characterId) return

  const character = getGameMetadata().characters[characterId]
  const metadata = clone(character.scoringMetadata)

  // Get current form in internal format
  const form = displayToInternal(useOptimizerRequestStore.getState())
  // Get defaults for setConditionals
  const defaultForm = getDefaultForm(character)
  form.setConditionals = defaultForm.setConditionals

  const overrides = useScoringStore.getState().scoringMetadataOverrides[characterId]
  if (overrides) {
    mergeDefinedValues(metadata.parts, overrides.parts)
    mergeDefinedValues(metadata.stats, overrides.stats)
  }
  form.minSpd = spd

  applyMetadataPresetToForm(form, metadata)

  // We don't use the clone here because serializing messes up the applyPreset functions
  const sortOption = metadata.simulation ? SortOption.COMBO : metadata.sortOption
  form.resultSort = sortOption.key
  setSortColumn(sortOption.combatGridColumn)

  // Load the modified internal form back into store
  useOptimizerRequestStore.getState().loadForm(form)
}

function applyMetadataPresetToForm(form: Form, scoringMetadata: ScoringMetadata) {
  // @ts-expect-error - getDefaultForm currently has handling for no character id but is set to be changed
  mergeUndefinedValues(form, getDefaultForm())

  form.comboTurnAbilities = [...(scoringMetadata?.simulation?.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, WHOLE_BASIC])]
  form.comboDot = scoringMetadata?.simulation?.comboDot ?? 0

  // @ts-expect-error - maxSpd is typed as number but needs to be cleared for presets
  form.maxSpd = undefined
  form.mainBody = scoringMetadata.parts[Constants.Parts.Body]
  form.mainFeet = scoringMetadata.parts[Constants.Parts.Feet]
  form.mainPlanarSphere = scoringMetadata.parts[Constants.Parts.PlanarSphere]
  form.mainLinkRope = scoringMetadata.parts[Constants.Parts.LinkRope]
  form.weights = { ...form.weights, ...scoringMetadata.stats }
  form.weights.minWeightedRolls = form.weights.minWeightedRolls ?? 0

  applySetConditionalPresets(form)
  applyScoringMetadataPresets(form)
}

export function applyScoringMetadataPresets(form: Form | BenchmarkForm) {
  const character = getGameMetadata().characters[form.characterId]
  const presets = character?.scoringMetadata?.presets ?? []

  for (const preset of presets) {
    applyPreset(form, preset)
  }
}

export function applyPreset(form: Form | BenchmarkForm, preset: PresetDefinition) {
  form.setConditionals[preset.set][preset.index ?? 1] = preset.value
}

export function applySetConditionalPresets(form: Form | BenchmarkForm) {
  const metadataCharacters = getGameMetadata().characters
  const characterMetadata = metadataCharacters[form.characterId]
  mergeUndefinedValues(form.setConditionals, defaultSetConditionals)

  // Disable elemental conditions by default if the character is not of the same element
  const element = characterMetadata?.element
  form.setConditionals[Sets.GeniusOfBrilliantStars][1] = element == ElementNames.Quantum
  form.setConditionals[Sets.ForgeOfTheKalpagniLantern][1] = element == ElementNames.Fire || [
    Anaxa.id,
  ].includes(form.characterId)

  const path = characterMetadata?.path
  form.setConditionals[Sets.HeroOfTriumphantSong][1] = path == PathNames.Remembrance
  form.setConditionals[Sets.WarriorGoddessOfSunAndThunder][1] = path == PathNames.Remembrance
  form.setConditionals[Sets.WorldRemakingDeliverer][1] = path == PathNames.Remembrance
  form.setConditionals[Sets.AmphoreusTheEternalLand][1] = path == PathNames.Remembrance

  applyTeamAwareSetConditionalPresets(form)
}

export function applyTeamAwareSetConditionalPresets(form: Form | BenchmarkForm, teammateIds?: (CharacterId | undefined)[]) {
  if (!form.setConditionals) return
  const metadataCharacters = getGameMetadata().characters

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
    && id != Cyrene.id
    && metadataCharacters[id].path == PathNames.Remembrance
  )).length
  const mozes = allyIds.filter((id) => id == Moze.id).length
  form.setConditionals[Sets.ArcadiaOfWovenDreams][1] = form.characterId == Phainon.id ? 1 : 4 + targetableMemosprites - mozes

  if (allyIds.includes(TheDahlia.id)) {
    form.setConditionals[Sets.ForgeOfTheKalpagniLantern][1] = true
  }

  // DHPT gives a summon to the primary character, enabling banana set conditional
  if (allyIds.includes(PermansorTerrae.id)) {
    form.setConditionals[Sets.TheWondrousBananAmusementPark][1] = true
  }
}

export function applyTeamAwareSetConditionalPresetsToStore() {
  const state = useOptimizerRequestStore.getState()
  const form = displayToInternal(state)
  applyTeamAwareSetConditionalPresets(form)

  // Update the store with the modified set conditionals
  useOptimizerRequestStore.getState().setSetConditionals(form.setConditionals)
}
