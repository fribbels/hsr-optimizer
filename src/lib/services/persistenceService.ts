import i18next from 'i18next'
import {
  Constants,
  CURRENT_OPTIMIZER_VERSION,
  Parts,
} from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { SortOption } from 'lib/optimization/sortOptions'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { setModifiedScoringMetadata } from 'lib/scoring/scoreComparison'
import * as equipmentService from 'lib/services/equipmentService'
import { savedSessionDefaults, useGlobalStore } from 'lib/stores/appStore'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, getCharacters, useCharacterStore } from 'lib/stores/characterStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { getRelicById, getRelics, useRelicStore } from 'lib/stores/relicStore'
import { getScoringMetadata, useScoringStore } from 'lib/stores/scoringStore'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/optimizerMenuIds'
import { useRelicLocatorStore } from 'lib/tabs/tabRelics/RelicLocator'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  Build,
  Character,
  CharacterId,
  SavedBuild,
} from 'types/character'
import { ConditionalValueMap } from 'types/conditionals'
import { Form } from 'types/form'
import { LightConeId } from 'types/lightCone'
import { DBMetadata, ScoringMetadata } from 'types/metadata'
import {
  Relic,
  Stat,
} from 'types/relic'
import {
  GlobalSavedSession,
  HsrOptimizerSaveFormat,
} from 'types/store'
import { Simulation } from 'lib/simulations/statSimulationTypes'

// ─── Public API ────────────────────────────────────────────────

export function loadSaveData(saveData: HsrOptimizerSaveFormat, autosave = true, sanitize = true): void {
  const charactersById: Record<string, Character> = {}
  const dbCharacters = getGameMetadata().characters

  // Remove invalid characters
  saveData.characters = saveData.characters.filter((x) => dbCharacters[x.id])

  if (saveData.scoringMetadataOverrides) {
    for (const [key, scoringMetadataOverrides] of Object.entries(saveData.scoringMetadataOverrides) as [CharacterId, ScoringMetadata][]) {
      if (!dbCharacters[key]?.scoringMetadata) continue
      const defaultScoringMetadata = dbCharacters[key].scoringMetadata
      setModifiedScoringMetadata(defaultScoringMetadata, scoringMetadataOverrides)
    }

    useScoringStore.getState().setScoringMetadataOverrides(saveData.scoringMetadataOverrides)
  }

  const relicsById = new Map(saveData.relics.map((r) => [r.id, r]))

  // Initialize characters: migrate form fields and build format
  for (const character of saveData.characters) {
    character.equipped = {}
    charactersById[character.id] = character
    migrateCharacterForm(character, dbCharacters)

    // TODO: Temporary migration from old to new format, remove once appropriate
    const scoringMetadata = getScoringMetadata(character.id)
    character.builds = character.builds?.map((savedBuild) => {
      if (savedBuild.optimizerMetadata !== undefined) {
        if (savedBuild.characterConditionals !== undefined) return savedBuild
        // Sub-migration: relocate conditionals from optimizerMetadata into top-level build fields
        const updatedBuild = { ...savedBuild }
        // @ts-ignore
        const oldConditionals: Record<CharacterId | LightConeId, ConditionalValueMap> | undefined = savedBuild.optimizerMetadata?.conditionals
        updatedBuild.characterConditionals = oldConditionals?.[character.id]
        updatedBuild.lightConeConditionals = oldConditionals?.[savedBuild.lightConeId!]
        updatedBuild.team = savedBuild.team.map((x) => ({
          ...x,
          characterConditionals: oldConditionals?.[x.characterId],
          lightConeConditionals: oldConditionals?.[x.lightConeId!],
        }))
        // @ts-ignore
        if (updatedBuild.optimizerMetadata) delete updatedBuild.optimizerMetadata.conditionals
        return updatedBuild
      }
      const build = savedBuild as unknown as { build: string[]; name: string; score: { score: string; rating: string } }
      const migratedBuild: SavedBuild = {
        characterId: character.id,
        eidolon: character.form.characterEidolon,
        lightConeId: character.form.lightCone,
        superimposition: character.form.lightConeSuperimposition,
        name: build.name,
        equipped: build.build.reduce((acc, cur) => {
          const relic = relicsById.get(cur)
          if (relic) acc[relic.part] = cur
          return acc
        }, {} as Build),
        team: scoringMetadata.simulation?.teammates.map((x) => ({
          characterId: x.characterId,
          eidolon: x.characterEidolon,
          lightConeId: x.lightCone,
          superimposition: x.lightConeSuperimposition,
          relicSet: x.teamRelicSet,
          ornamentSet: x.teamOrnamentSet,
          characterConditionals: undefined,
          lightConeConditionals: undefined,
        })) ?? [],
        characterConditionals: undefined,
        lightConeConditionals: undefined,
        optimizerMetadata: null,
        deprioritizeBuffs: scoringMetadata.simulation?.deprioritizeBuffs ?? false,
      }
      return migratedBuild
    }) ?? []
  }

  deduplicateDbCharacterScoringParts(dbCharacters)
  processRelics(saveData.relics, charactersById)

  if (saveData.showcasePreferences) {
    useShowcaseTabStore.getState().setShowcasePreferences(saveData.showcasePreferences || {})
  }

  useWarpCalculatorStore.getState().setRequest(saveData.warpRequest)

  if (saveData.optimizerMenuState) {
    const menuState = useOptimizerDisplayStore.getState().menuState
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
      const overiddenSavedSessionDefaults: GlobalSavedSession = { ...savedSessionDefaults, ...session }

      useGlobalStore.getState().setSavedSession(overiddenSavedSessionDefaults)
    }

    if (saveData.savedSession.showcaseTab) { // Set showcase tab state
      useShowcaseTabStore.getState().setSavedSession(saveData.savedSession.showcaseTab)
    }
  }

  if (saveData.settings) {
    useGlobalStore.getState().setSettings(saveData.settings)
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

  if (autosave) {
    SaveState.delayedSave()
  }
}

export function resetAll(): void {
  const saveFormat: HsrOptimizerSaveFormat = {
    relics: [],
    characters: [],
  }
  SaveState.permitEmptySave()
  loadSaveData(saveFormat)
}

// These relics may be missing speed decimals depending on the importer.
// We overwrite any existing relics with imported ones.
export function mergeRelics(newRelics: Relic[], newCharacters: Form[]): void {
  const oldRelics = getRelics()
  newRelics = TsUtils.clone(newRelics) ?? []
  newCharacters = TsUtils.clone(newCharacters) ?? []

  // Add new characters
  if (newCharacters) {
    for (const character of newCharacters) {
      upsertCharacterFromForm(character)
    }
  }

  const characters = getCharacters()

  // Generate a hash of existing relics for easy lookup
  const oldRelicHashes: Record<string, Relic> = {}
  for (const oldRelic of oldRelics) {
    const hash = hashRelic(oldRelic)
    oldRelicHashes[hash] = oldRelic
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
    let found = oldRelicHashes[hash]
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

      if (newRelic.equippedBy && newCharacters.length) {
        // Update the owner of the existing relic with the newly imported owner
        found = { ...found, equippedBy: newRelic.equippedBy }
        newRelic = found
      }

      if (newRelic.ageIndex !== undefined) {
        found.ageIndex = newRelic.ageIndex
      }

      // Save the old relic because it may have edited speed values, delete the hash to prevent duplicates
      replacementRelics.push(found)
      stableRelicId = found.id
      delete oldRelicHashes[hash]
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
      let newEquipped
      // Update equipped relic IDs
      for (const part of Object.values(Constants.Parts)) {
        const equippedId = character.equipped?.[part]
        if (equippedId && relicIdMapping[equippedId]) {
          newEquipped = { ...character.equipped, [part]: relicIdMapping[equippedId] }
        }
      }

      let newSavedBuilds
      // Update saved builds relic IDs
      if (character.builds && character.builds.length > 0) {
        newSavedBuilds = character.builds.map((savedBuild) => {
          const updatedBuild = savedBuild
          ;(Object.entries(savedBuild.equipped) as Array<[Parts, string | undefined]>).forEach(([part, id]) => {
            if (!id) return
            updatedBuild.equipped[part] = relicIdMapping[id] || id
          })

          return { ...savedBuild, build: updatedBuild }
        })
      }
      characters[idx] = { ...character, equipped: newEquipped ?? character.equipped, builds: newSavedBuilds ?? character.builds }
    })
  }

  indexRelics(replacementRelics)

  useRelicStore.getState().setRelics(replacementRelics)

  // Clean up any deleted relic ids that are still equipped
  characters.forEach((char, idx, arr) => {
    for (const part of Object.values(Constants.Parts)) {
      if (char.equipped?.[part] && !getRelicById(char.equipped[part])) {
        arr[idx] = { ...char, equipped: { ...char.equipped, [part]: undefined } }
      }
    }
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
  const oldRelics = TsUtils.clone(getRelics()) || []
  newRelics = TsUtils.clone(newRelics)

  // Tracking these for debug / messaging
  const updatedOldRelics: Relic[] = []
  const addedNewRelics: Relic[] = []
  const equipUpdates: {
    relic: Relic
    equippedBy: CharacterId | undefined
  }[] = []

  for (const newRelic of newRelics) {
    const match = findRelicMatch(newRelic, oldRelics)

    if (match) {
      match.substats = newRelic.substats
      match.previewSubstats = newRelic.previewSubstats
      match.main = newRelic.main
      match.enhance = newRelic.enhance
      match.verified = true
      updatedOldRelics.push(match)

      equipUpdates.push({ relic: match, equippedBy: newRelic.equippedBy })
    } else {
      oldRelics.push(newRelic)
      addedNewRelics.push(newRelic)

      equipUpdates.push({ relic: newRelic, equippedBy: newRelic.equippedBy })
      newRelic.equippedBy = undefined
    }
  }

  oldRelics.map((x) => RelicAugmenter.augment(x))
  indexRelics(oldRelics)
  useRelicStore.getState().setRelics(oldRelics)

  for (const equipUpdate of equipUpdates) {
    if (sourceCharacters.find((character) => character.id === equipUpdate.equippedBy)) {
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
  // @ts-ignore
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
  charactersById: Record<string, Character>,
) {
  for (const relic of relics) {
    // @ts-ignore temporary while migrating relic object format
    delete relic.weights
    RelicAugmenter.augment(relic)
    const character = charactersById[relic.equippedBy!]
    if (character && !character.equipped[relic.part]) {
      character.equipped[relic.part] = relic.id
    } else {
      relic.equippedBy = undefined
    }
  }
  indexRelics(relics)
}

function indexRelics(relics: Relic[]) {
  relics.forEach((r, idx, relics) => {
    if (r.ageIndex) return
    relics[idx] = { ...r, ageIndex: idx === 0 ? 0 : relics[idx - 1].ageIndex! + 1 }
  })
}

function hashRelic(relic: Relic) {
  const substatValues: number[] = []
  const substatStats: string[] = []

  for (const substat of relic.substats) {
    if (Utils.isFlat(substat.stat)) {
      // Flat atk/def/hp/spd values we floor to an int
      substatValues.push(Math.floor(substat.value))
    } else {
      // Other values we match to 1 decimal point due to OCR
      substatValues.push(Utils.precisionRound(Utils.truncate10ths(substat.value)))
    }
    substatStats.push(substat.stat)
  }
  const hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    enhance: relic.enhance,
    mainStat: relic.main.stat,
    mainValue: Math.floor(relic.main.value),
    substatValues: substatValues, // Match to 1 decimal point
    substatStats: substatStats,
  }

  return TsUtils.objectHash(hashObject)
}

function partialHashRelic(relic: Relic) {
  const hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    mainStat: relic.main.stat,
  }

  return TsUtils.objectHash(hashObject)
}

function findRelicMatch(relic: Relic, oldRelics: Relic[]) {
  // part set grade mainstat substatStats
  const oldRelicPartialHashes: Record<string, Relic[]> = {}
  for (const oldRelic of oldRelics) {
    const hash = partialHashRelic(oldRelic)
    if (!oldRelicPartialHashes[hash]) oldRelicPartialHashes[hash] = []
    oldRelicPartialHashes[hash].push(oldRelic)
  }
  const partialHash = partialHashRelic(relic)
  const partialMatches = oldRelicPartialHashes[partialHash] || []

  let match: Relic | undefined = undefined
  for (const partialMatch of partialMatches) {
    if (relic.enhance < partialMatch.enhance) continue
    if (relic.substats.length < partialMatch.substats.length) continue

    let exit = false
    let upgrades = 0
    for (let i = 0; i < partialMatch.substats.length; i++) {
      const matchSubstat = partialMatch.substats[i] as Stat
      const newSubstat = relic.substats.find((x) => x.stat === matchSubstat.stat) as Stat

      // Different substats mean different relics - break
      if (!newSubstat) {
        exit = true
        break
      }
      if (matchSubstat.stat !== newSubstat.stat) {
        exit = true
        break
      }
      if (compareSameTypeSubstat(matchSubstat, newSubstat) === -1) {
        exit = true
        break
      }

      // Track if the number of stat increases make sense
      if (compareSameTypeSubstat(matchSubstat, newSubstat) === 1) {
        upgrades++
      }
    }

    if (exit) continue

    const possibleUpgrades = Math.round((Math.floor(relic.enhance / 3) * 3 - Math.floor(partialMatch.enhance / 3) * 3) / 3)
    if (upgrades > possibleUpgrades) continue

    // If it passes all the tests, keep it
    match = partialMatch
    break
  }
  return match
}

// -1: old > new, 0: old === new, 1: new > old
function compareSameTypeSubstat(oldSubstat: Stat, newSubstat: Stat) {
  let oldValue: number
  let newValue: number
  if (Utils.isFlat(oldSubstat.stat)) {
    // Flat atk/def/hp/spd values we floor to an int
    oldValue = Math.floor(oldSubstat.value)
    newValue = Math.floor(newSubstat.value)
  } else {
    // Other values we match to 1 decimal point due to OCR
    oldValue = Utils.precisionRound(Utils.truncate10ths(oldSubstat.value))
    newValue = Utils.precisionRound(Utils.truncate10ths(newSubstat.value))
  }

  if (oldValue === newValue) return 0
  if (oldValue < newValue) return 1
  return -1
}
