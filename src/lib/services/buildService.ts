import i18next from 'i18next'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { DEFAULT_TEAM } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { defaultTeammate } from 'lib/optimization/defaultForm'
import { ComboType } from 'lib/optimization/rotation/comboType'
import type { TeammateState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { AppPages, SavedBuildSource } from 'lib/constants/appPages'
import { useGlobalStore } from 'lib/stores/appStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { getScoringMetadata } from 'lib/stores/scoringStore'
import { setCharacter } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { definedEntries } from 'lib/utils/arrayUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  Build,
  BuildOptimizerMetadata,
  BuildTeammate,
  CharacterId,
  SavedBuild,
} from 'types/character'
import { StatFilters } from 'types/form'

export function saveBuild(
  name: string,
  characterId: CharacterId,
  source: SavedBuildSource,
  overwriteExisting: boolean,
): { error?: string } | void {
  const character = getCharacterById(characterId)
  if (!character) {
    console.warn('No character selected')
    return
  }

  let build: SavedBuild
  const team: BuildTeammate[] = []

  switch (source) {
    case SavedBuildSource.OPTIMIZER: {
      const state = useOptimizerRequestStore.getState()
      const optimizerMetadata: BuildOptimizerMetadata = {
        conditionals: {},
        setFilters: {
          relics: TsUtils.clone(state.relicSets),
          ornaments: TsUtils.clone(state.ornamentSets),
        },
        statFilters: TsUtils.clone(state.statFilters) as unknown as StatFilters,
        comboStateJson: TsUtils.clone(state.comboStateJson),
        setConditionals: TsUtils.clone(state.setConditionals),
        presets: state.comboPreprocessor,
      }
      optimizerMetadata.conditionals[state.characterId!] = TsUtils.clone(state.characterConditionals)
      optimizerMetadata.conditionals[state.lightCone!] = TsUtils.clone(state.lightConeConditionals)
      state.teammates.forEach((teammate) => {
        team.push({
          characterId: teammate.characterId!,
          lightConeId: teammate.lightCone!,
          eidolon: teammate.characterEidolon,
          superimposition: teammate.lightConeSuperimposition,
          relicSet: teammate.teamRelicSet,
          ornamentSet: teammate.teamOrnamentSet,
        })
        if (teammate.characterId) optimizerMetadata.conditionals[teammate.characterId] = TsUtils.clone(teammate.characterConditionals)
        if (teammate.lightCone) optimizerMetadata.conditionals[teammate.lightCone] = TsUtils.clone(teammate.lightConeConditionals)
      })

      build = {
        characterId,
        eidolon: state.characterEidolon,
        lightConeId: state.lightCone!,
        superimposition: state.lightConeSuperimposition,
        name,
        equipped: useOptimizerDisplayStore.getState().optimizerBuild ?? {},
        optimizerMetadata,
        team,
        deprioritizeBuffs: state.deprioritizeBuffs ?? false,
      }
      break
    }
    case SavedBuildSource.SHOWCASE: {
      const simulation = getScoringMetadata(character.id)?.simulation
      const useCustomTeam = simulation && (useShowcaseTabStore.getState().showcaseTeamPreferenceById[characterId] !== DEFAULT_TEAM)
      const teammates = useCustomTeam ? simulation.teammates : getGameMetadata().characters[characterId].scoringMetadata.simulation?.teammates
      if (teammates) {
        teammates.forEach((teammate) => {
          team.push({
            characterId: teammate.characterId,
            lightConeId: teammate.lightCone,
            eidolon: teammate.characterEidolon,
            superimposition: teammate.lightConeSuperimposition,
            relicSet: teammate.teamRelicSet,
            ornamentSet: teammate.teamOrnamentSet,
          })
        })
      }
      build = {
        characterId,
        eidolon: character.form.characterEidolon,
        lightConeId: character.form.lightCone,
        superimposition: character.form.lightConeSuperimposition,
        name,
        equipped: character.equipped,
        optimizerMetadata: null,
        team,
        deprioritizeBuffs: simulation?.deprioritizeBuffs ?? false,
      }
      break
    }
    default:
      console.error('Unknown SavedBuildSource', source)
      return
  }

  const builds = character.builds ?? []
  const idx = builds.findIndex((x) => x.name === name)

  if (overwriteExisting) {
    if (idx === -1) {
      const error = i18next.t('charactersTab:Messages.NoMatchingBuild', { name })
      console.error(error)
      return { error }
    }
    builds[idx] = build
  } else {
    if (idx !== -1) {
      const error = i18next.t('charactersTab:Messages.BuildAlreadyExists', { name })
      console.warn(error)
      return { error }
    }
    builds.push(build)
  }

  const updatedCharacter = { ...character, builds: [...builds] }
  useCharacterStore.getState().setCharacter(updatedCharacter)
}

export function deleteBuild(characterId: CharacterId, name: string): void {
  const character = getCharacterById(characterId)
  if (!character) return console.warn('No character to delete build for')

  const updatedCharacter = { ...character, builds: (character.builds ?? []).filter((x) => x.name != name) }
  useCharacterStore.getState().setCharacter(updatedCharacter)
}

export function clearBuilds(characterId: CharacterId): void {
  const character = getCharacterById(characterId)
  if (!character) return console.warn('No character to clear builds for')

  const updatedCharacter = { ...character, builds: [] }
  useCharacterStore.getState().setCharacter(updatedCharacter)
}

export function loadBuildInOptimizer(build: SavedBuild): void
export function loadBuildInOptimizer(characterId: CharacterId, buildIndex: number): void
export function loadBuildInOptimizer(arg1: CharacterId | SavedBuild, buildIndex?: number): void {
  const characterId = typeof arg1 === 'string' ? arg1 : arg1.characterId
  const build = typeof arg1 === 'string' ? getCharacterById(characterId)?.builds?.[buildIndex!] : arg1

  if (!build) {
    console.error(`attempted to load build ${buildIndex} into optimizer for character ${characterId} but build does not exist`)
    return
  }
  if (build.characterId !== characterId) {
    console.error(`attempted to load build`, build, `for character ${characterId} but characterIds do not match`)
    return
  }

  const meta = build.optimizerMetadata
  const metadata = getGameMetadata()

  // Set the character first (sets focus + characterId in store)
  setCharacter(characterId)

  // Build teammate states
  const teammateIndices = [0, 1, 2] as const
  const teammateStates = teammateIndices.map((i) => {
    const teammate = build.team[i] as BuildTeammate | undefined
    if (!teammate) {
      return defaultTeammate() as TeammateState
    }

    let characterConditionals: Record<string, unknown> = {}
    let lightConeConditionals: Record<string, unknown> = {}

    if (!meta) {
      // No saved conditionals - try to preserve conditionals from the DB form for the same teammate character
      const dbCharForm = getCharacterById(characterId)?.form
      const dbTeammates = [dbCharForm?.teammate0, dbCharForm?.teammate1, dbCharForm?.teammate2]
      const matchingDbTeammate = dbTeammates.find((t) => t?.characterId === teammate.characterId && t?.lightCone === teammate.lightConeId)

      if (matchingDbTeammate) {
        characterConditionals = matchingDbTeammate.characterConditionals ?? {}
        lightConeConditionals = matchingDbTeammate.lightConeConditionals ?? {}
      } else {
        const path = metadata.characters[teammate.characterId]?.path
        const element = metadata.characters[teammate.characterId]?.element
        const lightConePath = metadata.lightCones[teammate.lightConeId]?.path

        if (path && element) {
          characterConditionals = CharacterConditionalsResolver
            .get({ characterId: teammate.characterId, characterEidolon: teammate.eidolon })
            .defaults()

          lightConeConditionals = LightConeConditionalsResolver
            .get({
              lightCone: teammate.lightConeId,
              lightConeSuperimposition: teammate.superimposition,
              lightConePath,
              path,
              element,
              characterId: teammate.characterId,
            })
            .defaults()
        }
      }
    }

    return {
      characterId: teammate.characterId,
      characterEidolon: teammate.eidolon,
      lightCone: teammate.lightConeId,
      lightConeSuperimposition: teammate.superimposition,
      teamOrnamentSet: teammate.ornamentSet,
      teamRelicSet: teammate.relicSet,
      characterConditionals,
      lightConeConditionals,
    } as TeammateState
  }) as [TeammateState, TeammateState, TeammateState]

  // Build store state patch
  const patch: Record<string, unknown> = {
    characterEidolon: build.eidolon,
    lightCone: build.lightConeId,
    lightConeSuperimposition: build.superimposition,
    deprioritizeBuffs: build.deprioritizeBuffs,
    teammates: teammateStates,
  }

  if (!meta) {
    const dbCharForm = getCharacterById(characterId)!.form
    patch.comboType = ComboType.SIMPLE
    patch.comboPreprocessor = true
    patch.comboStateJson = '{}'
    patch.setConditionals = TsUtils.clone(dbCharForm.setConditionals)
    patch.relicSets = TsUtils.clone(dbCharForm.relicSets)
    patch.ornamentSets = TsUtils.clone(dbCharForm.ornamentSets)
    patch.statFilters = {
      minAtk: undefined, maxAtk: undefined, minHp: undefined, maxHp: undefined,
      minDef: undefined, maxDef: undefined, minSpd: undefined, maxSpd: undefined,
      minCr: undefined, maxCr: undefined, minCd: undefined, maxCd: undefined,
      minEhr: undefined, maxEhr: undefined, minRes: undefined, maxRes: undefined,
      minBe: undefined, maxBe: undefined, minErr: undefined, maxErr: undefined,
    }
  } else {
    if (meta.comboStateJson) {
      patch.comboType = ComboType.ADVANCED
      patch.comboPreprocessor = meta.presets
      patch.comboStateJson = TsUtils.clone(meta.comboStateJson)
    } else {
      patch.comboType = ComboType.SIMPLE
    }
    if (meta.statFilters) {
      patch.statFilters = TsUtils.clone(meta.statFilters)
    }
    patch.relicSets = TsUtils.clone(meta.setFilters.relics)
    patch.ornamentSets = TsUtils.clone(meta.setFilters.ornaments)
    patch.setConditionals = TsUtils.clone(meta.setConditionals)

    // Apply saved conditionals
    definedEntries(meta.conditionals)
      .forEach(([id, conditionalValueMap]) => {
        if (id === build.characterId) {
          patch.characterConditionals = TsUtils.clone(conditionalValueMap)
          return
        }
        if (id === build.lightConeId) {
          patch.lightConeConditionals = TsUtils.clone(conditionalValueMap)
          return
        }

        let teammateIdx = build.team.findIndex((x) => x.characterId === id)
        switch (teammateIdx) {
          case 0:
          case 1:
          case 2:
            teammateStates[teammateIdx] = {
              ...teammateStates[teammateIdx],
              characterConditionals: TsUtils.clone(conditionalValueMap),
            }
            return
          default:
            break
        }

        teammateIdx = build.team.findIndex((x) => x.lightConeId === id)
        switch (teammateIdx) {
          case 0:
          case 1:
          case 2:
            teammateStates[teammateIdx] = {
              ...teammateStates[teammateIdx],
              lightConeConditionals: TsUtils.clone(conditionalValueMap),
            }
            return
          default:
            break
        }

        console.error('Found orphaned conditional while loading build')
      })
  }

  // Apply all overrides to store at once, then navigate.
  void import('lib/stores/optimizerForm/useOptimizerRequestStore').then(({ useOptimizerRequestStore }) => {
    useOptimizerRequestStore.setState(patch)

    useGlobalStore.getState().setActiveKey(AppPages.OPTIMIZER)
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.optimizerCharacterId, characterId)
    SaveState.delayedSave()
  })
}
