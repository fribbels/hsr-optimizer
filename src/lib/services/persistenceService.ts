import i18next from 'i18next'
import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import {
  DefaultSettingOptions,
  SettingOptions,
} from 'lib/constants/settingsConstants'
import {
  OpenCloseIDs,
  setClose,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Message } from 'lib/interactions/message'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { SortOption } from 'lib/optimization/sortOptions'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import {
  findRelicMatch,
  hashRelic,
  partialHashRelic,
} from 'lib/relics/relicUtils'
import { migrateBuild } from 'lib/services/buildMigration'
import * as equipmentService from 'lib/services/equipmentService'
import type { Simulation } from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import {
  savedSessionDefaults,
  useGlobalStore,
} from 'lib/stores/app/appStore'
import {
  getCharacterById,
  getCharacters,
  useCharacterStore,
} from 'lib/stores/character/characterStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import {
  getRelicById,
  getRelics,
  useRelicStore,
} from 'lib/stores/relic/relicStore'
import { pruneOverridesOnLoad } from 'lib/stores/scoring/scoringDelta'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/optimizerMenuIds'
import { useRelicLocatorStore } from 'lib/tabs/tabRelics/RelicLocator'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import type {
  Build,
  Character,
  CharacterId,
} from 'types/character'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import type { DBMetadata } from 'types/metadata'
import type { Relic } from 'types/relic'
import type { SavedBuild } from 'types/savedBuild'
import type {
  GlobalSavedSession,
  HsrOptimizerSaveFormat,
  UserSettings,
} from 'types/store'

// ─── Public API ────────────────────────────────────────────────

export function loadSaveData(saveData: HsrOptimizerSaveFormat, autosave = true, sanitize = true): void {
  if (!Array.isArray(saveData?.characters)) {
    console.error('Invalid save data: characters is not an array')
    saveData.characters = []
  }
  if (!Array.isArray(saveData?.relics)) {
    console.error('Invalid save data: relics is not an array')
    saveData.relics = []
  }

  const charactersById: Partial<Record<CharacterId, Character>> = {}
  const dbCharacters = getGameMetadata().characters

  // Remove invalid characters
  saveData.characters = saveData.characters.filter((x) => dbCharacters[x.id])

  // Prune overrides to delta format (converts old full-snapshots)
  const { result: prunedOverrides, changed } = pruneOverridesOnLoad(
    saveData.scoringMetadataOverrides ?? {},
    (id) => dbCharacters[id as CharacterId]?.scoringMetadata,
  )

  useScoringStore.getState().setScoringMetadataOverrides(prunedOverrides)

  // Save if anything was pruned (triggers save outside of the normal autosave check)
  if (changed && autosave) {
    SaveState.delayedSave()
  }

  const relicsById = new Map(saveData.relics.map((r) => [r.id, r]))

  // Initialize characters: migrate form fields and build format
  for (const character of saveData.characters) {
    character.equipped = {}
    charactersById[character.id] = character
    migrateCharacterForm(character, dbCharacters)

    // Migrate builds from all legacy formats to new SavedBuild discriminated union
    character.builds = (character.builds ?? [])
      .map((raw: Record<string, unknown>) =>
        migrateBuild(
          raw,
          character.id,
          character.form,
          relicsById,
        )
      )
      .filter((b): b is SavedBuild => b != null)
  }

  deduplicateDbCharacterScoringParts(dbCharacters)
  processRelics(saveData.relics, charactersById)

  if (saveData.showcasePreferences) {
    useShowcaseTabStore.getState().setShowcasePreferences(saveData.showcasePreferences)
  }

  useWarpCalculatorStore.getState().setRequest(saveData.warpRequest)

  if (saveData.optimizerMenuState) {
    const menuState = { ...useOptimizerDisplayStore.getState().menuState }
    for (const key of Object.values(OptimizerMenuIds)) {
      if (saveData.optimizerMenuState[key] != null) {
        menuState[key] = saveData.optimizerMenuState[key]
      }
    }
    useOptimizerDisplayStore.getState().setMenuState(menuState)
  }

  if (saveData.savedSession) {
    if (saveData.savedSession.global) {
      const session = saveData.savedSession.global
      const optimizerCharacterId = session.optimizerCharacterId
      if (optimizerCharacterId && !dbCharacters[optimizerCharacterId]) {
        session.optimizerCharacterId = null
      }
      // When new session items are added, set user's save to the default
      const overriddenSavedSessionDefaults: GlobalSavedSession = { ...savedSessionDefaults, ...session }

      useGlobalStore.getState().setSavedSession(overriddenSavedSessionDefaults)

      // Restore sidebar collapsed state
      if (overriddenSavedSessionDefaults.sidebarCollapsed) {
        setClose(OpenCloseIDs.MENU_SIDEBAR)
      } else {
        setOpen(OpenCloseIDs.MENU_SIDEBAR)
      }
    }

    if (saveData.savedSession.showcaseTab) { // Set showcase tab state
      useShowcaseTabStore.getState().setSavedSession(saveData.savedSession.showcaseTab)
    }
  }

  if (saveData.settings) {
    const settings = saveData.settings
    if (settings.ShowComboDmgWarning === 'Hide') settings.ShowComboDmgWarning = 'Show'
    useGlobalStore.getState().setSettings({ ...DefaultSettingOptions, ...settings })
  }

  // Set relics tab state
  useRelicsTabStore.getState().setExcludedRelicPotentialCharacters(saveData.excludedRelicPotentialCharacters || [])

  useGlobalStore.getState().setVersion(saveData.version)

  useRelicLocatorStore.getState().setInventoryWidth(saveData.relicLocator?.inventoryWidth)
  useRelicLocatorStore.getState().setRowLimit(saveData.relicLocator?.rowLimit)

  // Restore scanner settings if they exist
  if (saveData.scannerSettings) {
    const scannerState = useScannerState.getState()
    scannerState.setIngest(saveData.scannerSettings.ingest)
    scannerState.setIngestCharacters(saveData.scannerSettings.ingestCharacters)
    scannerState.setIngestWarpResources(saveData.scannerSettings.ingestWarpResources)

    // For security, don't restore the websocket url if we're sanitizing (manual load)
    if (!sanitize && saveData.scannerSettings.customUrl) {
      scannerState.setWebsocketUrl(saveData.scannerSettings.websocketUrl)
    }
  }

  useRelicStore.getState().setRelics(saveData.relics)
  useCharacterStore.getState().setCharacters(saveData.characters)

  // Clear stale focusCharacter — the previous focus may not exist in the new data
  useCharacterTabStore.getState().setFocusCharacter(null)

  if (autosave) {
    SaveState.delayedSave()
  }
}

export function resetAll(): void {
  const saveFormat: HsrOptimizerSaveFormat = {
    relics: [],
    characters: [],
    scoringMetadataOverrides: {},
  }
  SaveState.permitEmptySave()
  loadSaveData(saveFormat)
}

// These relics may be missing speed decimals depending on the importer.
// We overwrite any existing relics with imported ones.
export function mergeRelics(newRelics: Relic[], newCharacters: Form[]): void {
  const oldRelics = getRelics()

  // Add new characters
  if (newCharacters) {
    for (const character of newCharacters) {
      upsertCharacterFromForm(character)
    }
  }

  const characters = [...getCharacters()]

  // Generate a hash of existing relics for easy lookup (array per hash to handle collisions)
  const oldRelicHashes: Record<string, Relic[]> = {}
  for (const oldRelic of oldRelics) {
    const hash = hashRelic(oldRelic)
    if (!oldRelicHashes[hash]) oldRelicHashes[hash] = []
    oldRelicHashes[hash].push(oldRelic)
  }

  // Track relic ID changes for updating references
  const relicIdMapping: Record<string, string> = {} // oldId -> newId

  let replacementRelics: Relic[] = []
  // In case the user tries to import a characters only file, we do this
  if (newRelics.length === 0) {
    replacementRelics = oldRelics
  }
  for (let newRelic of newRelics) {
    const hash = hashRelic(newRelic)

    // Compare new relic hashes to old relic hashes
    const candidates = oldRelicHashes[hash]
    let found = candidates?.shift()
    let stableRelicId: string
    if (found) {
      if (newRelic.verified) {
        // Track the ID change if it will occur
        if (found.id !== newRelic.id) {
          relicIdMapping[found.id] = newRelic.id
        }

        // Inherit the new verified speed stats
        found = {
          ...found,
          id: newRelic.id,
          verified: true,
          substats: newRelic.substats,
          previewSubstats: newRelic.previewSubstats,
          augmentedStats: newRelic.augmentedStats,
        }
      }

      // Save ageIndex before equippedBy branch aliases newRelic to found
      const newAgeIndex = newRelic.ageIndex

      if (newRelic.equippedBy && newCharacters.length) {
        found = { ...found, equippedBy: newRelic.equippedBy }
        newRelic = found
      }

      if (newAgeIndex !== undefined && found.ageIndex !== newAgeIndex) {
        found = { ...found, ageIndex: newAgeIndex }
      }

      replacementRelics.push(found)
      stableRelicId = found.id
      // shift() already consumed the match; clean up empty buckets
      if (!candidates?.length) delete oldRelicHashes[hash]
    } else {
      // No match found - save the new relic
      stableRelicId = newRelic.id
      replacementRelics.push(newRelic)
    }

    // Update the character's equipped inventory
    if (newRelic.equippedBy && newCharacters.length) {
      const idx = characters.findIndex((x) => x.id === newRelic.equippedBy)
      if (idx >= 0) {
        characters[idx] = { ...characters[idx], equipped: { ...characters[idx].equipped, [newRelic.part]: stableRelicId } }
      } else {
        console.warn('No character to equip relic to', newRelic)
      }
    }
  }

  // Update all relic ID references in character equipment and saved builds
  if (Object.keys(relicIdMapping).length > 0) {
    characters.forEach((character, idx, characters) => {
      let newEquipped = character.equipped
      // Update equipped relic IDs
      for (const part of Object.values(Constants.Parts)) {
        const equippedId = newEquipped?.[part]
        if (equippedId && relicIdMapping[equippedId]) {
          newEquipped = { ...newEquipped, [part]: relicIdMapping[equippedId] }
        }
      }

      let newSavedBuilds
      // Update saved builds relic IDs
      if (character.builds && character.builds.length > 0) {
        newSavedBuilds = character.builds.map((savedBuild) => {
          let newBuildEquipped = savedBuild.equipped
          const equippedEntries = Object.entries(savedBuild.equipped) as Array<[Parts, string | undefined]>
          equippedEntries.forEach(([part, id]) => {
            if (!id || !relicIdMapping[id]) return
            newBuildEquipped = { ...newBuildEquipped, [part]: relicIdMapping[id] }
          })
          return { ...savedBuild, equipped: newBuildEquipped }
        })
      }
      characters[idx] = { ...character, equipped: newEquipped ?? character.equipped, builds: newSavedBuilds ?? character.builds }
    })
  }

  useRelicStore.getState().setRelics(replacementRelics)

  // Clean up any deleted relic ids that are still equipped
  characters.forEach((char, idx, arr) => {
    let updated = char
    for (const part of Object.values(Constants.Parts)) {
      if (updated.equipped?.[part] && !getRelicById(updated.equipped[part])) {
        updated = { ...updated, equipped: { ...updated.equipped, [part]: undefined } }
      }
    }
    arr[idx] = updated
  })
  useCharacterStore.getState().setCharacters(characters)

  // Clean up relics that are double equipped
  const relics = getRelics().map((r) => {
    if (!r.equippedBy) return r
    const wearer = getCharacterById(r.equippedBy)
    if (!wearer || wearer.equipped[r.part] !== r.id) {
      return { ...r, equippedBy: undefined }
    }
    return r
  })
  useRelicStore.getState().setRelics(relics)

  // Clean up characters who have relics equipped by someone else, or characters that don't exist ingame yet
  const cleanedCharacters = getCharacters().map((c) => {
    let newC = c
    for (const part of Object.keys(c.equipped) as Parts[]) {
      const relicId = c.equipped[part]
      if (relicId) {
        const relic = getRelicById(relicId)
        if (!relic || relic.equippedBy !== c.id) {
          newC = { ...newC, equipped: { ...newC.equipped, [part]: undefined } }
        }
      }
    }
    return newC
  })
  useCharacterStore.getState().setCharacters(cleanedCharacters)

  void import('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions').then(({ recalculatePermutations }) => {
    recalculatePermutations()
  })
}

/*
 * These relics have accurate speed values from relic scorer import.
 * We keep the existing set of relics and only overwrite ones that match an imported one.
 */
export function mergePartialRelics(newRelics: Relic[] = [], sourceCharacters: { id: CharacterId }[] = []): void {
  const oldRelics = [...getRelics()]

  // Tracking these for debug / messaging
  const updatedOldRelics: Relic[] = []
  const addedNewRelics: Relic[] = []
  const equipUpdates: {
    relic: Relic,
    equippedBy: CharacterId | undefined,
  }[] = []

  // Build partial-hash map once instead of per-iteration
  const partialHashBuckets: Record<string, Relic[]> = {}
  for (const r of oldRelics) {
    const h = partialHashRelic(r)
    ;(partialHashBuckets[h] ??= []).push(r)
  }

  const matchedIds = new Set<string>()
  for (const newRelic of newRelics) {
    const h = partialHashRelic(newRelic)
    const candidates = (partialHashBuckets[h] ?? []).filter((r) => !matchedIds.has(r.id))
    const match = findRelicMatch(newRelic, candidates)

    if (match) {
      matchedIds.add(match.id)
      const updated: Relic = {
        ...match,
        substats: newRelic.substats,
        previewSubstats: newRelic.previewSubstats,
        main: newRelic.main,
        enhance: newRelic.enhance,
        verified: true,
      }
      const matchIdx = oldRelics.indexOf(match)
      if (matchIdx >= 0) oldRelics[matchIdx] = updated
      updatedOldRelics.push(updated)

      equipUpdates.push({ relic: updated, equippedBy: newRelic.equippedBy })
    } else {
      const added: Relic = { ...newRelic, equippedBy: undefined }
      oldRelics.push(added)
      addedNewRelics.push(added)

      equipUpdates.push({ relic: added, equippedBy: newRelic.equippedBy })
    }
  }

  // Only augment relics that were modified or newly added
  for (const relic of [...updatedOldRelics, ...addedNewRelics]) {
    RelicAugmenter.augment(relic)
  }
  useRelicStore.getState().setRelics(oldRelics)

  for (const equipUpdate of equipUpdates) {
    if (sourceCharacters.some((character) => character.id === equipUpdate.equippedBy)) {
      equipmentService.equipRelic(equipUpdate.relic, equipUpdate.equippedBy)
    }
  }

  // Updated stats for ${updatedOldRelics.length} existing relics
  // Added ${addedNewRelics.length} new relics
  if (updatedOldRelics.length) Message.success(i18next.t('importSaveTab:PartialImport.OldRelics', { count: updatedOldRelics.length }), 8)
  if (addedNewRelics.length) Message.success(i18next.t('importSaveTab:PartialImport.NewRelics', { count: addedNewRelics.length }), 8)
}

// ─── Helpers (internal) ────────────────────────────────────────

export function upsertCharacterFromForm(form: Form): Character {
  let found = getCharacterById(form.characterId)
  if (found) {
    const updated = { ...found, form: { ...found.form, ...form } }
    useCharacterStore.getState().setCharacter(updated)
    return updated
  } else {
    const defaultForm = getDefaultForm({ id: form.characterId })
    const newChar = {
      id: form.characterId,
      form: { ...defaultForm, ...form },
      equipped: {},
    } as Character
    useCharacterStore.getState().addCharacter(newChar)
    return newChar
  }
}

function deduplicateStringArray<T extends string[] | null | undefined>(arr: T) {
  if (arr == null) return arr

  return [...new Set(arr)] as T
}

function migrateCharacterForm(character: Character, dbCharacters: DBMetadata['characters']) {
  // Previously sim requests didn't use the stats field
  if (character.form?.statSim?.simulations) {
    character.form.statSim.simulations = character.form.statSim.simulations.filter((simulation: Simulation) => simulation.request?.stats)
  }

  // Previously characters had customizable options, now we're defaulting to 80s
  character.form.characterLevel = 80
  character.form.lightConeLevel = 80

  // Previously there was a weight sort which is now removed, arbitrarily replaced with SPD if the user had used it
  // @ts-expect-error - Migration: legacy save format field not in current types
  if (character.form.resultSort === 'WEIGHT') {
    character.form.resultSort = 'SPD'
  }

  // Validate that the saved resultSort is a valid sort option, otherwise reset to default
  if (!character.form.resultSort || !(character.form.resultSort in SortOption)) {
    const scoringMetadata = dbCharacters[character.id]?.scoringMetadata
    character.form.resultSort = scoringMetadata?.simulation
      ? SortOption.COMBO.key
      : scoringMetadata?.sortOption.key
  }

  // Deduplicate main stat filter values
  character.form.mainBody = deduplicateStringArray(character.form.mainBody)
  character.form.mainFeet = deduplicateStringArray(character.form.mainFeet)
  character.form.mainPlanarSphere = deduplicateStringArray(character.form.mainPlanarSphere)
  character.form.mainLinkRope = deduplicateStringArray(character.form.mainLinkRope)
}

function deduplicateDbCharacterScoringParts(dbCharacters: DBMetadata['characters']) {
  for (const character of Object.values(dbCharacters)) {
    for (const part of Object.keys(Constants.Parts) as Parts[]) {
      if (part === Parts.Hands || part === Parts.Head) continue
      character.scoringMetadata.parts[part] = deduplicateStringArray(character.scoringMetadata.parts[part])
    }
  }
}

function processRelics(
  relics: Relic[],
  charactersById: Partial<Record<CharacterId, Character>>,
) {
  for (let i = relics.length - 1; i >= 0; i--) {
    const relic = relics[i]
    // @ts-expect-error - Migration: legacy relic format had weights field
    delete relic.weights
    const augmented = RelicAugmenter.augment(relic)
    if (augmented === null) {
      console.warn('Failed to augment relic, removing:', relic.id)
      relics.splice(i, 1)
      continue
    }
    const character = charactersById[relic.equippedBy!]
    if (character && !character.equipped[relic.part]) {
      character.equipped[relic.part] = relic.id
    } else {
      relic.equippedBy = undefined
    }
  }
}
