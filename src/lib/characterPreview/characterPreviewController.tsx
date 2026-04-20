import i18next, { type TFunction } from 'i18next'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import type { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  CUSTOM_TEAM,
  DEFAULT_TEAM,
  ElementToDamage,
  Parts,
} from 'lib/constants/constants'
import {
  innerW,
  lcInnerH,
  lcInnerW,
  lcParentH,
  lcParentW,
  newLcHeight,
  newLcMargin,
  parentH,
  parentW,
  simScoreInnerW,
} from 'lib/constants/constantsUi'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { RelicModalController } from 'lib/overlays/modals/relicModal/relicModalController'
import { RelicFilters } from 'lib/relics/relicFilters'
import {
  RelicScorer,
  type RelicScoringResult,
} from 'lib/relics/scoring/relicScorer'
import { Assets } from 'lib/rendering/assets'
import { DEFAULT_LC_IMAGE_OFFSET } from 'lib/rendering/lcImageTransform'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import type { SimulationRelicByPart } from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import {
  getCharacterById,
  useCharacterStore,
} from 'lib/stores/character/characterStore'
import { normalizeForm } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import {
  clone,
  objectHash,
} from 'lib/utils/objectUtils'
import type {
  Character,
  CharacterId,
  SavedBuild,
} from 'types/character'
import type {
  CustomImageConfig,
  CustomImagePayload,
} from 'types/customImage'
import type { Form } from 'types/form'
import type {
  DBMetadataCharacter,
  DBMetadataLightCone,
  ElementalDamageType,
  ImageCenter,
} from 'types/metadata'
import type { Relic } from 'types/relic'

export type ShowcaseMetadata = {
  characterId: CharacterId,
  characterMetadata: DBMetadataCharacter,
  characterElement: string,
  characterLevel: number,
  characterEidolon: number,
  characterName: string,
  characterPath: string,
  lightConeId: string,
  lightConeLevel: number,
  lightConeSuperimposition: number,
  lightConeMetadata: DBMetadataLightCone,
  lightConeName: string,
  lightConeSrc: string,
  elementalDmgType: ElementalDamageType,
}

export type ShowcaseDisplayDimensions = {
  tempLcParentW: number,
  tempLcParentH: number,
  tempLcInnerW: number,
  tempLcInnerH: number,
  tempInnerW: number,
  tempParentH: number,
  newLcHeight: number,
  newLcMargin: number,
  lcImageOffset: { x: number, y: number, s: number },
  charCenter: ImageCenter,
  spineCenter: ImageCenter,
  disableSpine: boolean,
}

export type ScoringResults = {
  relics: RelicScoringResult[],
  totalScore: number,
  totalRating: string,
}

export type PreviewRelics = Record<Parts, Relic | null>

export function getPreviewRelics(
  source: ShowcaseSource,
  character: Character,
  relicsById: Partial<Record<string, Relic>>,
  buildOverride?: SavedBuild | null,
) {
  let scoringResults: ScoringResults
  let displayRelics: PreviewRelics
  // Showcase tab relics are stored in equipped as relics instead of ids
  if (source !== ShowcaseSource.SHOWCASE_TAB) {
    displayRelics = {
      Head: getRelic(relicsById, character, Parts.Head, buildOverride),
      Hands: getRelic(relicsById, character, Parts.Hands, buildOverride),
      Body: getRelic(relicsById, character, Parts.Body, buildOverride),
      Feet: getRelic(relicsById, character, Parts.Feet, buildOverride),
      PlanarSphere: getRelic(relicsById, character, Parts.PlanarSphere, buildOverride),
      LinkRope: getRelic(relicsById, character, Parts.LinkRope, buildOverride),
    }
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, Object.values(displayRelics))
  } else {
    const equipped = character.equipped as unknown as PreviewRelics
    const relicsArray = Object.values(equipped)
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, relicsArray) as ScoringResults
    displayRelics = equipped
  }

  return { scoringResults, displayRelics }
}

function getRelic(relicsById: Partial<Record<string, Relic>>, character: Character, part: Parts, buildOverride?: SavedBuild | null): Relic | null {
  if (buildOverride != undefined) {
    return relicsById[buildOverride.equipped[part]!] ?? null
  }
  if (character.equipped?.[part]) {
    return relicsById[character.equipped[part]] ?? null
  }
  return null
}

export function resolveScoringType(storedScoringType: ScoringType, hasSimulation: boolean) {
  if (storedScoringType === ScoringType.NONE || storedScoringType === ScoringType.SUBSTAT_SCORE) {
    return storedScoringType
  }
  if (storedScoringType === ScoringType.COMBAT_SCORE && hasSimulation) {
    return storedScoringType
  }
  return ScoringType.SUBSTAT_SCORE
}

export function getArtistName(character: Character) {
  const artistName = character?.portrait?.artistName ?? getCharacterById(character?.id)?.portrait?.artistName
  if (!artistName) return undefined

  const name = artistName.trim()
  return name.length < 1 ? undefined : name
}

export function getShowcaseDisplayDimensions(character: Character, simScore: boolean): ShowcaseDisplayDimensions {
  const characterMeta = getGameMetadata().characters[character.id]
  const charCenter = characterMeta.imageCenter
  const spineCenter = characterMeta.spineCenter
  const disableSpine = characterMeta.disableSpine
  // @ts-expect-error - Some APIs return empty light cone as '0'
  const lcImageOffset = (character.form.lightCone && character.form.lightCone !== '0' && getGameMetadata().lightCones[character.form.lightCone])
    ? getGameMetadata().lightCones[character.form.lightCone].imageOffset ?? DEFAULT_LC_IMAGE_OFFSET
    : DEFAULT_LC_IMAGE_OFFSET

  let tempLcParentW = lcParentW
  let tempLcParentH = lcParentH
  let tempLcInnerW = lcInnerW
  let tempLcInnerH = lcInnerH
  let tempParentH = parentH
  let tempInnerW = innerW

  if (simScore) {
    tempLcParentW = parentW
    tempLcParentH = newLcHeight
    tempLcInnerW = parentW + 16
    tempLcInnerH = 1260 / 902 * tempLcInnerW
    tempParentH = parentH - newLcHeight - newLcMargin
    tempInnerW = simScoreInnerW
  }

  return {
    tempLcParentW,
    tempLcParentH,
    tempLcInnerW,
    tempLcInnerH,
    tempInnerW,
    tempParentH,
    newLcHeight,
    newLcMargin,
    charCenter,
    spineCenter,
    disableSpine,
    lcImageOffset,
  }
}

export function getShowcaseStats(
  character: Character,
  displayRelics: PreviewRelics,
) {
  const statCalculationRelics = clone(displayRelics)
  RelicFilters.condenseRelicSubstatsForOptimizerSingle(Object.values(statCalculationRelics).filter((relic) => !!relic))
  const form = normalizeForm(character.form)
  const context = generateContext(form)
  const { x } = simulateBuild(statCalculationRelics as SimulationRelicByPart, context, null)
  const basicStats = x.c.toBasicStatsObject()
  const finalStats: BasicStatsObject = {
    ...basicStats,
  }

  // Element-specific DMG (e.g., "Ice DMG Boost") is already populated by toBasicStatsObject
  // from the correct Key index - no need to overwrite with ELEMENTAL_DMG

  return finalStats
}

export function showcaseOnEditOk(relic: Relic, selectedRelic: Relic, setSelectedRelic: (r: Relic) => void) {
  const updatedRelic = RelicModalController.onEditOk(selectedRelic, relic)
  setSelectedRelic(updatedRelic)
  SaveState.delayedSave()
}

export function showcaseOnAddOk(relic: Relic, setSelectedRelic: (r: Relic) => void) {
  const t = i18next.getFixedT(null, ['charactersTab', 'modals', 'common'])

  equipmentService.upsertRelicWithEquipment(relic)
  setSelectedRelic(relic)
  SaveState.delayedSave()

  Message.success(t('CharacterPreview.Messages.AddedRelic') /* Successfully added relic */)
}

export function showcaseOnEditPortraitOk(
  character: Character,
  portraitPayload: CustomImagePayload,
  setCustomPortrait: (c: CustomImageConfig | undefined) => void,
  setEditPortraitModalOpen: (b: boolean) => void,
) {
  const t = i18next.getFixedT(null, ['charactersTab', 'modals', 'common'])

  const { type, config } = portraitPayload
  switch (type) {
    case 'add': {
      setCustomPortrait(config)
      let char = getCharacterById(character.id)
      if (!char) {
        // Safe cast: upsertCharacterFromForm only reads characterId in the new-character path (merged over getDefaultForm).
        char = persistenceService.upsertCharacterFromForm({ characterId: character.id } as Form)
      }
      useCharacterStore.getState().setCharacter({ ...char, portrait: config })
      Message.success(t('CharacterPreview.Messages.SavedPortrait') /* Successfully saved portrait */)
      SaveState.delayedSave()
      break
    }
    case 'delete': {
      const charToDelete = getCharacterById(character.id)
      if (!charToDelete) {
        console.warn('No character selected')
        break
      }
      useCharacterStore.getState().setCharacter({ ...charToDelete, portrait: undefined })
      setCustomPortrait(undefined)
      Message.success(t('CharacterPreview.Messages.RevertedPortrait') /* Successfully reverted portrait */)
      SaveState.delayedSave()
      break
    }
    default:
      console.error(`Payload of type '${type}' is not valid!`)
  }
  setEditPortraitModalOpen(false)
}

export function handleTeamSelection(
  character: Character,
  teamSelection: string | undefined,
) {
  let currentSelection: string | undefined = teamSelection

  const defaultScoringMetadata = getGameMetadata().characters[character.id].scoringMetadata
  if (defaultScoringMetadata?.simulation) {
    const scoringMetadata = getScoringMetadata(character.id)

    const hasCustom = scoringMetadata.simulation?.teammates
      && objectHash(scoringMetadata.simulation.teammates) !== objectHash(defaultScoringMetadata.simulation.teammates)

    if (hasCustom && currentSelection !== DEFAULT_TEAM) {
      currentSelection = CUSTOM_TEAM
    }
  }

  return currentSelection ?? DEFAULT_TEAM
}

export function getShowcaseMetadata(character: Character, t: TFunction<'gameData'>) {
  const characterId = character.form.characterId
  const characterMetadata = getGameMetadata().characters[characterId]
  const characterElement = characterMetadata.element
  const characterLevel = 80
  const characterEidolon = character.form.characterEidolon
  const characterName = characterId ? t(`Characters.${characterId}.Name`) : ''
  const characterPath = characterMetadata.path

  const lightConeId = character.form.lightCone
  const lightConeLevel = 80
  const lightConeSuperimposition = character.form.lightConeSuperimposition
  const lightConeMetadata = getGameMetadata().lightCones[lightConeId]
  const lightConeName = lightConeId ? t(`Lightcones.${lightConeId}.Name`) : ''
  const lightConeSrc = Assets.getLightConePortrait(lightConeMetadata) || ''

  const elementalDmgType = ElementToDamage[characterElement]

  return {
    characterId,
    characterMetadata,
    characterElement,
    characterLevel,
    characterEidolon,
    characterName,
    characterPath,
    lightConeId,
    lightConeLevel,
    lightConeSuperimposition,
    lightConeMetadata,
    lightConeName,
    lightConeSrc,
    elementalDmgType,
  }
}
