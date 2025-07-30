import i18next from 'i18next'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
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
} from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { RelicFilters } from 'lib/relics/relicFilters'
import {
  RelicScorer,
  RelicScoringResult,
} from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'
import { AsyncSimScoringExecution } from 'lib/scoring/dpsScore'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { SimulationRelicByPart } from 'lib/simulations/statSimulationTypes'
import { DB } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { filterNonNull } from 'lib/utils/arrayUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { MutableRefObject } from 'react'
import {
  Character,
  CharacterId,
} from 'types/character'
import {
  CustomImageConfig,
  CustomImagePayload,
} from 'types/customImage'
import {
  DBMetadataCharacter,
  DBMetadataLightCone,
  ElementalDamageType,
  ImageCenter,
} from 'types/metadata'
import { Relic } from 'types/relic'

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
  lcCenter: number,
  charCenter: ImageCenter,
}

export type ScoringResults = {
  relics: RelicScoringResult[],
  totalScore: number,
  totalRating: string,
}

export function getPreviewRelics(source: ShowcaseSource, character: Character, relicsById: Partial<Record<string, Relic>>) {
  let scoringResults: ScoringResults
  let displayRelics: SingleRelicByPart
  // Showcase tab relics are stored in equipped as relics instead of ids
  if (source !== ShowcaseSource.SHOWCASE_TAB) {
    scoringResults = RelicScorer.scoreCharacter(character) as ScoringResults
    displayRelics = {
      Head: getRelic(relicsById, character, Parts.Head)!,
      Hands: getRelic(relicsById, character, Parts.Hands)!,
      Body: getRelic(relicsById, character, Parts.Body)!,
      Feet: getRelic(relicsById, character, Parts.Feet)!,
      PlanarSphere: getRelic(relicsById, character, Parts.PlanarSphere)!,
      LinkRope: getRelic(relicsById, character, Parts.LinkRope)!,
    }
  } else {
    const equipped = character.equipped as unknown as SingleRelicByPart
    const relicsArray = Object.values(equipped)
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, relicsArray) as ScoringResults
    displayRelics = equipped
  }

  return { scoringResults, displayRelics }
}

function getRelic(relicsById: Partial<Record<string, Relic>>, character: Character, part: Parts) {
  if (character.equipped?.[part]) {
    return relicsById[character.equipped[part]] ?? null
  }
  return null
}

export function resolveScoringType(storedScoringType: ScoringType, asyncSimScoringExecution: AsyncSimScoringExecution) {
  if (storedScoringType == ScoringType.NONE || storedScoringType == ScoringType.SUBSTAT_SCORE) {
    return storedScoringType
  }
  if (storedScoringType == ScoringType.COMBAT_SCORE && asyncSimScoringExecution.promise != null) {
    return storedScoringType
  }
  return ScoringType.SUBSTAT_SCORE
}

export function getArtistName(character: Character) {
  const artistName = character?.portrait?.artistName ?? DB.getCharacterById(character?.id)?.portrait?.artistName
  if (!artistName) return undefined

  const name = artistName.trim()
  return name.length < 1 ? undefined : name
}

export function getShowcaseDisplayDimensions(character: Character, simScore: boolean): ShowcaseDisplayDimensions {
  const charCenter = DB.getMetadata().characters[character.id].imageCenter
  // @ts-ignore Some APIs return empty light cone as '0'
  const lcCenter = (character.form.lightCone && character.form.lightCone != '0' && DB.getMetadata().lightCones[character.form.lightCone])
    ? DB.getMetadata().lightCones[character.form.lightCone].imageCenter
    : 0

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
    tempInnerW = 950
  }

  return {
    tempLcParentW: tempLcParentW,
    tempLcParentH: tempLcParentH,
    tempLcInnerW: tempLcInnerW,
    tempLcInnerH: tempLcInnerH,
    tempInnerW: tempInnerW,
    tempParentH: tempParentH,
    newLcHeight: newLcHeight,
    newLcMargin: newLcMargin,
    charCenter: charCenter,
    lcCenter: lcCenter,
  }
}

export function getShowcaseStats(
  character: Character,
  displayRelics: SingleRelicByPart,
  showcaseMetadata: ShowcaseMetadata,
) {
  const statCalculationRelics = TsUtils.clone(displayRelics)
  RelicFilters.condenseRelicSubstatsForOptimizerSingle(Object.values(statCalculationRelics).filter((relic) => !!relic))
  const form = OptimizerTabController.displayToForm(OptimizerTabController.formToDisplay(character.form))
  const context = generateContext(form)
  const x = simulateBuild(statCalculationRelics as SimulationRelicByPart, context, null, null)
  const basicStats = x.c.toBasicStatsObject()
  const finalStats: BasicStatsObject = {
    ...basicStats,
  }

  finalStats[showcaseMetadata.elementalDmgType] = finalStats.ELEMENTAL_DMG

  return finalStats
}

export function showcaseOnEditOk(relic: Relic, selectedRelic: Relic, setSelectedRelic: (r: Relic) => void) {
  const updatedRelic = RelicModalController.onEditOk(selectedRelic, relic)
  setSelectedRelic(updatedRelic)
  SaveState.delayedSave()
}

export function showcaseOnAddOk(relic: Relic, setSelectedRelic: (r: Relic) => void) {
  const t = i18next.getFixedT(null, ['charactersTab', 'modals', 'common'])

  DB.setRelic(relic)
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
    case 'add':
      setCustomPortrait(config)
      DB.saveCharacterPortrait(character.id, config)
      Message.success(t('CharacterPreview.Messages.SavedPortrait') /* Successfully saved portrait */)
      SaveState.delayedSave()
      break
    case 'delete':
      DB.deleteCharacterPortrait(character.id)
      setCustomPortrait(undefined)
      Message.success(t('CharacterPreview.Messages.RevertedPortrait') /* Successfully reverted portrait */)
      SaveState.delayedSave()
      break
    default:
      console.error(`Payload of type '${type}' is not valid!`)
  }
  setEditPortraitModalOpen(false)
}

export function handleTeamSelection(
  character: Character,
  prevCharId: MutableRefObject<string | undefined>,
  teamSelection: Record<string, string>,
) {
  let currentSelection: string | undefined = teamSelection[character.id]

  const defaultScoringMetadata = DB.getMetadata().characters[character.id].scoringMetadata
  if (defaultScoringMetadata?.simulation) {
    const scoringMetadata = DB.getScoringMetadata(character.id)

    const hasCustom = Utils.objectHash(scoringMetadata.simulation!.teammates) != Utils.objectHash(defaultScoringMetadata.simulation.teammates)

    if (hasCustom && currentSelection != DEFAULT_TEAM) {
      currentSelection = CUSTOM_TEAM
    }
  }

  prevCharId.current = character.id

  return currentSelection ?? DEFAULT_TEAM
}

export function getShowcaseMetadata(character: Character) {
  const t = i18next.getFixedT(null, 'gameData')

  const characterId = character.form.characterId
  const characterMetadata = DB.getMetadata().characters[characterId]
  const characterElement = characterMetadata.element
  const characterLevel = 80
  const characterEidolon = character.form.characterEidolon
  const characterName = characterId ? t(`Characters.${characterId}.Name`) : ''
  const characterPath = characterMetadata.path

  const lightConeId = character.form.lightCone
  const lightConeLevel = 80
  const lightConeSuperimposition = character.form.lightConeSuperimposition
  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
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
