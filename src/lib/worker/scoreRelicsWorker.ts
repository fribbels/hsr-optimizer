import { scoreRelicsBatch } from 'lib/relics/scoreRelicsBatch'
import type { ScoreRelicsWorkerInput } from './scoreRelicsWorkerRunner'

self.onmessage = function(e: MessageEvent<ScoreRelicsWorkerInput>) {
  const {
    relics,
    characterIds,
    metadataByCharacter,
    focusCharacter,
    excludedRelicPotentialCharacters,
    equippedRelicByPart,
  } = e.data

  const scoredRelics = scoreRelicsBatch(
    relics,
    characterIds,
    metadataByCharacter,
    focusCharacter,
    excludedRelicPotentialCharacters,
    equippedRelicByPart,
  )

  self.postMessage({ generation: e.data.generation, scoredRelics })
}
