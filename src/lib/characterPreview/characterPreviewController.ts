import { CharacterPreviewSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { Parts } from 'lib/constants/constants'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { Character } from 'types/character'
import { Relic } from 'types/relic'

type ScoringResults = {
  relics: Relic[]
  totalScore: number
  totalRating: string
}

export function getPreviewRelics(source: CharacterPreviewSource, character: Character, relicsById: Record<string, Relic>) {
  let scoringResults: ScoringResults
  let displayRelics
  if (source == CharacterPreviewSource.SHOWCASE_TAB) {
    scoringResults = RelicScorer.scoreCharacter(character) as ScoringResults
    displayRelics = {
      Head: getRelic(relicsById, character, Parts.Head), // relicsById[character.equipped?.Head],
      Hands: getRelic(relicsById, character, Parts.Hands), // relicsById[character.equipped?.Hands],
      Body: getRelic(relicsById, character, Parts.Body), // relicsById[character.equipped?.Body],
      Feet: getRelic(relicsById, character, Parts.Feet), // relicsById[character.equipped?.Feet],
      PlanarSphere: getRelic(relicsById, character, Parts.PlanarSphere), // relicsById[character.equipped?.PlanarSphere],
      LinkRope: getRelic(relicsById, character, Parts.LinkRope), // relicsById[character.equipped?.LinkRope],
    }
  } else {
    const relicsArray = Object.values(character.equipped)
    // @ts-ignore The scorer relics are a Relic[]
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
