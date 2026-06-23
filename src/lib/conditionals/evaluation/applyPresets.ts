import type { UseFormReturnType } from '@mantine/form'
import { SilverWolfB1 } from 'lib/conditionals/character/1000/SilverWolfB1'
import { WeltB1 } from 'lib/conditionals/character/1000/WeltB1'
import { Pela } from 'lib/conditionals/character/1100/Pela'
import { Fugue } from 'lib/conditionals/character/1200/Fugue'
import { Moze } from 'lib/conditionals/character/1200/Moze'
import { BlackSwanB1 } from 'lib/conditionals/character/1300/BlackSwanB1'
import { Misha } from 'lib/conditionals/character/1300/Misha'
import { TheDahlia } from 'lib/conditionals/character/1300/TheDahlia'
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { Cyrene } from 'lib/conditionals/character/1400/Cyrene'
import { Hysilens } from 'lib/conditionals/character/1400/Hysilens'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { Phainon } from 'lib/conditionals/character/1400/Phainon'
import { Ashveil } from 'lib/conditionals/character/1500/Ashveil'
import { MortenaxBlade } from 'lib/conditionals/character/1500/MortenaxBlade'
import { ResolutionShinesAsPearlsOfSweat } from 'lib/conditionals/lightcone/4star/ResolutionShinesAsPearlsOfSweat'
import { LiesAflutterInTheWind } from 'lib/conditionals/lightcone/5star/LiesAflutterInTheWind'
import { LifeShouldBeCastToFlames } from 'lib/conditionals/lightcone/5star/LifeShouldBeCastToFlames'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { TRAILBLAZE_COMPANION_IDS } from 'lib/constants/characterTagConstants'
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
import type { PresetDefinition } from 'lib/scoring/presetEffects'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { setSortColumn } from 'lib/stores/gridStore'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { resolveLcDefaults } from 'lib/stores/optimizerForm/optimizerFormStoreActions'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import type { BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import {
  clone,
  mergeDefinedValues,
  mergeUndefinedValues,
} from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import type { ScoringMetadata } from 'types/metadata'

const DEF_REDUCTION_LIGHT_CONES = [
  LiesAflutterInTheWind.id,
  LifeShouldBeCastToFlames.id,
  ResolutionShinesAsPearlsOfSweat.id,
]

const DEF_REDUCTION_CHARACTERS = [
  MortenaxBlade.id,
  SilverWolfB1.id,
  BlackSwanB1.id,
  Ashveil.id,
  Hysilens.id,
  Cyrene.id,
  Fugue.id,
  Pela.id,
  WeltB1.id,
  TheDahlia.id,
  Anaxa.id,
  Misha.id,
]

export type TeammateInfo = {
  id: CharacterId | undefined,
  eidolon: number,
  lightCone?: LightConeId,
}

type TeammateInfoSource =
  | {
    characterId?: CharacterId | null,
    characterEidolon?: number | null,
    lightCone?: LightConeId | null,
  }
  | null
  | undefined

export function applySpdPreset(spd: number, characterId: CharacterId | null | undefined) {
  if (!characterId) return

  const dbMetadata = getGameMetadata()
  const character = dbMetadata.characters[characterId]
  const metadata = clone(character.scoringMetadata)

  // Get current form in internal format
  const form = displayToInternal(useOptimizerRequestStore.getState())
  // Get defaults for setConditionals
  const defaultForm = getDefaultForm(character)
  form.setConditionals = defaultForm.setConditionals

  // Reset character and light cone conditionals to defaults for the current eidolon/superimposition
  const charController = CharacterConditionalsResolver.get({
    characterId: form.characterId,
    characterEidolon: form.characterEidolon,
  })
  form.characterConditionals = charController.defaults ? { ...charController.defaults() } : {}
  form.lightConeConditionals = resolveLcDefaults(form, dbMetadata, false) ?? {}

  // Reset teammate conditionals to defaults
  for (const prop of ['teammate0', 'teammate1', 'teammate2'] as const) {
    const teammate = form[prop]
    if (!teammate?.characterId) continue

    const tmCharController = CharacterConditionalsResolver.get({
      characterId: teammate.characterId,
      characterEidolon: teammate.characterEidolon,
    })
    teammate.characterConditionals = tmCharController.teammateDefaults ? { ...tmCharController.teammateDefaults() } : {}
    teammate.lightConeConditionals = resolveLcDefaults(teammate as any, dbMetadata, true) ?? {}
  }

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

  const teammates = resolveTeammateInfo(form.teammate0, form.teammate1, form.teammate2)
  applySetConditionalPresets(form, teammates)
  applyScoringMetadataPresets(form, teammates)
}

function resolveScoringMetadataPresets(form: Form | BenchmarkForm) {
  const character = getGameMetadata().characters[form.characterId]
  return character?.scoringMetadata?.presets ?? []
}

export function resolveTeammateInfo(...teammates: TeammateInfoSource[]): TeammateInfo[] {
  return teammates
    .filter((teammate) => teammate != null)
    .map((teammate) => ({
      id: teammate.characterId ?? undefined,
      eidolon: teammate.characterEidolon ?? 0,
      lightCone: teammate.lightCone ?? undefined,
    }))
}

export function applyScoringMetadataPresets(form: Form | BenchmarkForm, teammates: TeammateInfo[]) {
  const presets = resolveScoringMetadataPresets(form)

  for (const preset of presets) {
    const { teammateCondition } = preset
    if (teammateCondition) {
      const match = teammates.some((teammate) => teammate.id === teammateCondition.characterId && teammate.eidolon >= teammateCondition.minEidolon)
      if (!match) continue
    }

    applyPreset(form, preset)
  }
}

export function applyTeammateConditionalPresets(form: Form | BenchmarkForm, teammates: TeammateInfo[]) {
  const presets = resolveScoringMetadataPresets(form)

  for (const preset of presets) {
    const { teammateCondition } = preset
    if (!teammateCondition) continue

    const index = preset.index ?? 1
    const match = teammates.some((teammate) => teammate.id === teammateCondition.characterId && teammate.eidolon >= teammateCondition.minEidolon)

    form.setConditionals[preset.set][index] = match
      ? preset.value
      : defaultSetConditionals[preset.set][index]
  }
}

export function applyPreset(form: Form | BenchmarkForm, preset: PresetDefinition) {
  form.setConditionals[preset.set][preset.index ?? 1] = preset.value
}

export function applySetConditionalPresets(form: Form | BenchmarkForm, teammates: TeammateInfo[]) {
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

  applyTeamAwareSetConditionalPresets(form, teammates)
}

export function applyTeamAwareSetConditionalPresets(form: Form | BenchmarkForm, teammates: TeammateInfo[]) {
  if (!form.setConditionals) return
  const metadataCharacters = getGameMetadata().characters

  const allyIds = [form.characterId, ...teammates.map((t) => t.id)].filter((x) => !!x)

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

  // Fallen Star Anchorage: wearer + at least one teammate are both Trailblaze Companions
  const wearerIsCompanion = TRAILBLAZE_COMPANION_IDS.has(form.characterId)
  const teammateIsCompanion = teammates.some((t) => t.id && TRAILBLAZE_COMPANION_IDS.has(t.id))
  form.setConditionals[Sets.FallenStarAnchorage][1] = wearerIsCompanion && teammateIsCompanion

  // DHPT gives a summon to the primary character, enabling banana set conditional
  if (allyIds.includes(PermansorTerrae.id)) {
    form.setConditionals[Sets.TheWondrousBananAmusementPark][1] = true
  }

  const wearerHasDefReductionLc = DEF_REDUCTION_LIGHT_CONES.includes(form.lightCone)
  const wearerIsDefReducer = DEF_REDUCTION_CHARACTERS.includes(form.characterId)

  if (wearerHasDefReductionLc || wearerIsDefReducer) {
    form.setConditionals[Sets.DivineQueryingMasterSmith][1] = 2
  } else {
    const teammateHasDefReductionLc = teammates.some((t) => t.lightCone && DEF_REDUCTION_LIGHT_CONES.includes(t.lightCone))
    const teammateIsDefReducer = teammates.some((t) => t.id && DEF_REDUCTION_CHARACTERS.includes(t.id))
    if (teammateHasDefReductionLc || teammateIsDefReducer) {
      form.setConditionals[Sets.DivineQueryingMasterSmith][1] = 1
    }
  }
}

export function applyTeamAwareSetConditionalPresetsToStore() {
  const state = useOptimizerRequestStore.getState()
  const form = displayToInternal(state)
  const teammates = resolveTeammateInfo(form.teammate0, form.teammate1, form.teammate2)
  applyTeamAwareSetConditionalPresets(form, teammates)
  applyTeammateConditionalPresets(form, teammates)

  useOptimizerRequestStore.getState().setSetConditionals(form.setConditionals)
}
