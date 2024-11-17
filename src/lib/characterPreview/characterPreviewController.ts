import { ShowcaseDisplayDimensions } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { CUSTOM_TEAM, DEFAULT_TEAM, Parts, SIMULATION_SCORE } from 'lib/constants/constants'
import { innerW, lcInnerH, lcInnerW, lcParentH, lcParentW, parentH, parentW } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { RelicScorer, RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { scoreCharacterSimulation } from 'lib/scoring/characterScorer'
import { AppPages, DB } from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { MutableRefObject } from 'react'
import { Character } from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { ElementalDamageType } from 'types/metadata'
import { Relic } from 'types/relic'

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
  prevCharId: MutableRefObject<null | string>,
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

  const tempLcParentW = simScore ? parentW : lcParentW

  const tempLcParentH = simScore ? newLcHeight : lcParentH
  const tempLcInnerW = simScore ? parentW + 16 : lcInnerW

  const tempLcInnerH = simScore ? 1260 / 902 * tempLcInnerW : lcInnerH

  const tempParentH = simScore ? parentH - newLcHeight - newLcMargin : parentH

  // Since the lc takes some space, we want to zoom the portrait out
  const tempInnerW = simScore ? 950 : innerW

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

export function getShowcaseSimScoringResult(
  character: Character,
  displayRelics: SingleRelicByPart,
  scoringType: string,
  teamSelection: string,
  elementalDmgType: ElementalDamageType,
) {

  let combatSimResult = scoreCharacterSimulation(character, displayRelics, teamSelection)
  let simScoringResult = scoringType == SIMULATION_SCORE ? combatSimResult : null
  if (!simScoringResult?.originalSim) {
    combatSimResult = null
    simScoringResult = null
  } else {
    // Fix elemental damage
    simScoringResult.originalSimResult[elementalDmgType] = simScoringResult.originalSimResult.ELEMENTAL_DMG
  }

  return simScoringResult
}
