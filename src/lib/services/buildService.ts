import i18next from 'i18next'
import { DEFAULT_TEAM } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { AppPages } from 'lib/constants/appPages'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { handleTeamSelection } from 'lib/characterPreview/characterPreviewController'
import { deserializeBuild, serializeFromCharacterTab, serializeFromOptimizer } from 'lib/services/buildConverter'
import * as equipmentService from 'lib/services/equipmentService'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { getCharacterById, useCharacterStore } from 'lib/stores/character/characterStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { computeLoadForm } from 'lib/stores/optimizerForm/optimizerFormStoreActions'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { setCharacter } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import { BuildSource, type Build, type SavedBuild } from 'types/savedBuild'

export function saveBuild(
  name: string,
  characterId: CharacterId,
  source: BuildSource,
  overwrite: boolean,
): { error?: string } {
  const character = getCharacterById(characterId)
  if (!character) return { error: 'No character selected' }

  let build: SavedBuild

  if (source === BuildSource.Optimizer) {
    const state = useOptimizerRequestStore.getState()
    if (!state.lightCone) return { error: 'No light cone selected' }
    const equipped = useOptimizerDisplayStore.getState().optimizerBuild ?? {}
    build = serializeFromOptimizer(name, characterId, state as typeof state & { lightCone: LightConeId }, equipped)
  } else {
    const rawTeamSelection = useShowcaseTabStore.getState().showcaseTeamPreferenceById[characterId]
    const teamSelection = handleTeamSelection(character, rawTeamSelection)
    const simulation = getScoringMetadata(character.id)?.simulation
    const useCustom = simulation && teamSelection !== DEFAULT_TEAM
    const teammates = useCustom ? simulation.teammates : getGameMetadata().characters[characterId]?.scoringMetadata?.simulation?.teammates
    build = serializeFromCharacterTab(name, character, teammates, teamSelection)
  }

  const builds = [...(character.builds ?? [])]
  const idx = builds.findIndex((x) => x.name === name)

  if (overwrite) {
    if (idx === -1) return { error: i18next.t('charactersTab:Messages.NoMatchingBuild', { name }) }
    builds[idx] = build
  } else {
    if (idx !== -1) return { error: i18next.t('charactersTab:Messages.BuildAlreadyExists', { name }) }
    builds.push(build)
  }

  useCharacterStore.getState().setCharacter({ ...character, builds })
  SaveState.delayedSave()
  return {}
}

export function loadBuildInOptimizer(build: SavedBuild): void {
  const characterId = build.characterId
  const character = getCharacterById(characterId)
  const form = character?.form ?? getDefaultForm({ id: characterId })

  // Compute the full merged state atomically: DB form defaults + build overrides
  const formState = computeLoadForm(form)
  const buildPatch = deserializeBuild(build, form)
  const mergedState = { ...formState, ...buildPatch }

  // Set focus, then apply single atomic state update
  setCharacter(characterId)
  useOptimizerRequestStore.setState(mergedState)

  // Navigate
  useGlobalStore.getState().setActiveKey(AppPages.OPTIMIZER)
  useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.optimizerCharacterId, characterId)
  SaveState.delayedSave()
}

export function equipBuildRelics(characterId: CharacterId, equipped: Build): void {
  const relicIds = Object.values(equipped).filter((id): id is string => id != null)
  equipmentService.equipRelicIds(relicIds, characterId)
  SaveState.delayedSave()
}

export function deleteBuild(characterId: CharacterId, name: string): void {
  const character = getCharacterById(characterId)
  if (!character) return
  useCharacterStore.getState().setCharacter({
    ...character,
    builds: (character.builds ?? []).filter((x) => x.name !== name),
  })
  SaveState.delayedSave()
}

export function clearBuilds(characterId: CharacterId): void {
  const character = getCharacterById(characterId)
  if (!character) return
  useCharacterStore.getState().setCharacter({ ...character, builds: [] })
  SaveState.delayedSave()
}
