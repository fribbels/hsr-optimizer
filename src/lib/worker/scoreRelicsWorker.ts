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

  const t0 = performance.now()

  const scoredRelics = scoreRelicsBatch(
    relics,
    characterIds,
    metadataByCharacter,
    focusCharacter,
    excludedRelicPotentialCharacters,
    equippedRelicByPart,
  )

  console.log(`[TAB PROFILE]       scoreRelicsWorker: ${(performance.now() - t0).toFixed(1)}ms (${relics.length} relics, ${characterIds.length} chars)`)

  self.postMessage({ scoredRelics })
}
