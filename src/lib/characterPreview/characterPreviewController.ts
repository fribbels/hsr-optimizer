import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { CUSTOM_TEAM, DEFAULT_TEAM, Parts } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { RelicScorer, RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { AppPages, DB } from 'lib/state/db'
import { Utils } from 'lib/utils/utils'
import { MutableRefObject } from 'react'
import { Character } from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { Relic } from 'types/relic'

type ScoringResults = {
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
      Head: getRelic(relicsById, character, Parts.Head)!, // relicsById[character.equipped?.Head],
      Hands: getRelic(relicsById, character, Parts.Hands)!, // relicsById[character.equipped?.Hands],
      Body: getRelic(relicsById, character, Parts.Body)!, // relicsById[character.equipped?.Body],
      Feet: getRelic(relicsById, character, Parts.Feet)!, // relicsById[character.equipped?.Feet],
      PlanarSphere: getRelic(relicsById, character, Parts.PlanarSphere)!, // relicsById[character.equipped?.PlanarSphere],
      LinkRope: getRelic(relicsById, character, Parts.LinkRope)!, // relicsById[character.equipped?.LinkRope],
    }
  } else {
    const relicsArray = Object.values(character.equipped)
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, relicsArray)
    displayRelics = character.equipped
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
  if (!artistName) return null

  const name = artistName.trim()
  return name.length < 1 ? null : name
}

export function presetTeamSelectionDisplay(
  character: Character,
  prevCharId: MutableRefObject<null | string>,
  setTeamSelection: (teamSelection: string) => void,
  setCustomPortrait: (customPortrait: CustomImageConfig | null) => void,
) {
  // Use any existing character's portrait instead of the default
  setCustomPortrait(DB.getCharacterById(character?.id)?.portrait ?? null)
  if (character?.id) {
    // Only for simulation scoring characters
    const defaultScoringMetadata = DB.getMetadata().characters[character.id].scoringMetadata
    if (defaultScoringMetadata?.simulation) {
      const scoringMetadata = DB.getScoringMetadata(character.id)

      if (Utils.objectHash(scoringMetadata.simulation!.teammates) != Utils.objectHash(defaultScoringMetadata.simulation.teammates)) {
        setTeamSelection(CUSTOM_TEAM)
      } else {
        setTeamSelection(DEFAULT_TEAM)
      }
    }
    prevCharId.current = character.id
  }
}
