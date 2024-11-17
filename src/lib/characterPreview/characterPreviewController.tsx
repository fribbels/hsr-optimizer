import i18next from 'i18next'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { BasicStatsObjectCV } from 'lib/conditionals/conditionalConstants'
import { CUSTOM_TEAM, DEFAULT_TEAM, ElementToDamage, Parts, SIMULATION_SCORE } from 'lib/constants/constants'
import { innerW, lcInnerH, lcInnerW, lcParentH, lcParentW, parentH, parentW } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { RelicFilters } from 'lib/relics/relicFilters'
import { RelicScorer, RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { scoreCharacterSimulation } from 'lib/scoring/characterScorer'
import { AppPages, DB } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { MutableRefObject } from 'react'
import { Character } from 'types/character'
import { CustomImageConfig, CustomImagePayload } from 'types/customImage'
import { DBMetadataCharacter, DBMetadataLightCone, ElementalDamageType, ImageCenter } from 'types/metadata'
import { Relic } from 'types/relic'

export type ShowcaseMetadata = {
  characterId: string
  characterMetadata: DBMetadataCharacter
  characterElement: string
  characterLevel: number
  characterEidolon: number
  characterName: string
  characterPath: string
  lightConeId: string
  lightConeLevel: number
  lightConeSuperimposition: number
  lightConeMetadata: DBMetadataLightCone
  lightConeName: string
  lightConeSrc: string
  elementalDmgType: ElementalDamageType
}

export type ShowcaseDisplayDimensions = {
  tempLcParentW: number
  tempLcParentH: number
  tempLcInnerW: number
  tempLcInnerH: number
  tempInnerW: number
  tempParentH: number
  newLcHeight: number
  newLcMargin: number
  lcCenter: number
  charCenter: ImageCenter
}

export type ScoringResults = {
  relics: RelicScoringResult[]
  totalScore: number
  totalRating: string
}

export function getPreviewRelics(source: ShowcaseSource, character: Character, relicsById: Record<string, Relic>) {
  let scoringResults: ScoringResults
  let displayRelics: SingleRelicByPart
  if (source == ShowcaseSource.CHARACTER_TAB) {
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
    // Showcase tab relics are stored in equipped as relics instead of ids
    const equipped = character.equipped as unknown as SingleRelicByPart
    const relicsArray = Object.values(equipped)
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, relicsArray) as ScoringResults
    displayRelics = equipped
  }

  return { scoringResults, displayRelics }
}

function getRelic(relicsById: Record<string, Relic>, character: Character, part: Parts) {
  if (character.equipped?.[part]) {
    return relicsById[character.equipped[part]]
  }
  return null
}

export function showcaseIsInactive(source: ShowcaseSource, activeKey: string) {
  return source == ShowcaseSource.SHOWCASE_TAB && activeKey != AppPages.SHOWCASE
    || source != ShowcaseSource.SHOWCASE_TAB && activeKey != AppPages.CHARACTERS
}

export function getArtistName(character: Character) {
  const artistName = character?.portrait?.artistName ?? DB.getCharacterById(character?.id)?.portrait?.artistName
  if (!artistName) return undefined

  const name = artistName.trim()
  return name.length < 1 ? undefined : name
}

export function presetTeamSelectionDisplay(
  character: Character,
  prevCharId: MutableRefObject<string | undefined>,
  setTeamSelection: (teamSelection: string) => void,
  setCustomPortrait: (customPortrait: CustomImageConfig | undefined) => void,
) {
  // Use any existing character's portrait instead of the default
  setCustomPortrait(DB.getCharacterById(character?.id)?.portrait)
  if (!character?.id) return

  prevCharId.current = character.id

  // Only for simulation scoring characters
  const defaultScoringMetadata = DB.getMetadata().characters[character.id].scoringMetadata
  if (defaultScoringMetadata?.simulation) {
    const scoringMetadata = DB.getScoringMetadata(character.id)

    if (TsUtils.objectHash(scoringMetadata.simulation!.teammates) != TsUtils.objectHash(defaultScoringMetadata.simulation.teammates)) {
      setTeamSelection(CUSTOM_TEAM)
    } else {
      setTeamSelection(DEFAULT_TEAM)
    }
  }
}

export function getShowcaseDisplayDimensions(character: Character, simScore: boolean): ShowcaseDisplayDimensions {
  const newLcMargin = 5
  const newLcHeight = 125

  // Some APIs return empty light cone as '0'
  const charCenter = DB.getMetadata().characters[character.id].imageCenter
  const lcCenter = (character.form.lightCone && character.form.lightCone != '0')
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
  const statCalculationRelics = Utils.clone(displayRelics)
  RelicFilters.condenseRelicSubstatsForOptimizerSingle(Object.values(statCalculationRelics))
  const { c: basicStats } = calculateBuild(OptimizerTabController.displayToForm(OptimizerTabController.formToDisplay(character.form)), statCalculationRelics, null)
  const finalStats: BasicStatsObjectCV = {
    ...basicStats,
    CV: StatCalculator.calculateCv(Object.values(statCalculationRelics)),
  }

  finalStats[showcaseMetadata.elementalDmgType] = finalStats.ELEMENTAL_DMG

  return finalStats
}

export function getShowcaseSimScoringResult(
  character: Character,
  displayRelics: SingleRelicByPart,
  scoringType: string,
  teamSelection: string,
  showcaseMetadata: ShowcaseMetadata,
) {

  let combatSimResult = scoreCharacterSimulation(character, displayRelics, teamSelection)
  let simScoringResult = scoringType == SIMULATION_SCORE ? combatSimResult : null
  if (!simScoringResult?.originalSim) {
    combatSimResult = null
    simScoringResult = null
  } else {
    // Fix elemental damage
    simScoringResult.originalSimResult[showcaseMetadata.elementalDmgType] = simScoringResult.originalSimResult.ELEMENTAL_DMG
  }

  return simScoringResult
}

export function showcaseOnEditOk(relic: Relic, selectedRelic: Relic | undefined, setSelectedRelic: (r: Relic) => void) {
  const updatedRelic = RelicModalController.onEditOk(selectedRelic!, relic)
  setSelectedRelic(updatedRelic)
  SaveState.delayedSave()
}

export function showcaseOnAddOk(relic: Relic, setSelectedRelic: (r: Relic) => void) {
  const t = i18next.getFixedT(null, ['charactersTab', 'modals', 'common'])

  DB.setRelic(relic)
  window.setRelicRows(DB.getRelics())
  setSelectedRelic(relic)
  SaveState.delayedSave()

  Message.success(t('CharacterPreview.Messages.AddedRelic')/* Successfully added relic */)
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
      Message.success(t('CharacterPreview.Messages.SavedPortrait')/* Successfully saved portrait */)
      SaveState.delayedSave()
      break
    case 'delete':
      DB.deleteCharacterPortrait(character.id)
      setCustomPortrait(undefined)
      Message.success(t('CharacterPreview.Messages.RevertedPortrait')/* Successfully reverted portrait */)
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
  teamSelection: string,
) {
  let currentSelection: string = teamSelection

  const defaultScoringMetadata = DB.getMetadata().characters[character.id].scoringMetadata
  if (defaultScoringMetadata?.simulation) {
    const scoringMetadata = DB.getScoringMetadata(character.id)

    const hasCustom = Utils.objectHash(scoringMetadata.simulation!.teammates) != Utils.objectHash(defaultScoringMetadata.simulation.teammates)

    // Use the previously selected character to handle all cases of overriding the sim team display
    if (prevCharId.current == null) {
      if (hasCustom) {
        currentSelection = CUSTOM_TEAM
      } else {
        currentSelection = DEFAULT_TEAM
      }
    }

    if (prevCharId.current != character.id) {
      if (hasCustom) {
        currentSelection = CUSTOM_TEAM
      } else {
        currentSelection = teamSelection
      }
    }
  }

  return currentSelection
}

export function getShowcaseMetadata(character: Character) {
  const t = i18next.getFixedT(null, ['charactersTab', 'modals', 'common'])

  const characterId = character.form.characterId
  const characterMetadata = DB.getMetadata().characters[characterId]
  const characterElement = characterMetadata.element
  const characterLevel = 80
  const characterEidolon = character.form.characterEidolon
  const characterName = characterId ? t(`gameData:Characters.${characterId}.Name` as never) : ''
  const characterPath = characterMetadata.path

  const lightConeId = character.form.lightCone
  const lightConeLevel = 80
  const lightConeSuperimposition = character.form.lightConeSuperimposition
  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  const lightConeName = lightConeId ? t(`gameData:Lightcones.${lightConeId}.Name` as never) : ''
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
