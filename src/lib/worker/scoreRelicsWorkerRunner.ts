import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import type { ScorerMetadata } from 'lib/relics/scoring/types'
import type { ScoredRelic } from 'lib/relics/scoreRelics'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { getRelicById } from 'lib/stores/relic/relicStore'
import type { CharacterId } from 'types/character'
import type { Nullable } from 'types/common'
import type { Relic } from 'types/relic'

// Worker input/output types — shared between runner and worker
export type ScoreRelicsWorkerInput = {
  relics: Relic[]
  characterIds: CharacterId[]
  metadataByCharacter: Map<CharacterId, ScorerMetadata>
  focusCharacter: Nullable<CharacterId>
  excludedRelicPotentialCharacters: CharacterId[]
  equippedRelicByPart: Record<string, Relic | undefined>
}

export type ScoreRelicsWorkerOutput = {
  scoredRelics: ScoredRelic[]
}

// Dedicated worker instance — lazy-initialized, reused across calls
let worker: Worker | null = null
let generation = 0

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./scoreRelicsWorker.ts', import.meta.url), { type: 'module' })
  }
  return worker
}

/**
 * Scores relics off the main thread using a dedicated web worker.
 * Pre-computes per-character metadata on the main thread (fast, ~5ms),
 * then sends pure data to the worker for the O(relics × characters) loop.
 *
 * Automatically cancels stale requests — only the latest call resolves.
 */
export function scoreRelicsAsync(
  relics: Relic[],
  excludedRelicPotentialCharacters: CharacterId[],
  focusCharacter: Nullable<CharacterId>,
  _scoringVersion: number,
): Promise<ScoredRelic[]> {
  const thisGeneration = ++generation

  // Pre-compute enriched metadata on main thread (~5ms, uses ScoringCache)
  const t0 = performance.now()
  const scorer = new RelicScorer()
  const characterIds = Object.values(getGameMetadata().characters).map((x) => x.id as CharacterId)
  const metadataByCharacter = new Map<CharacterId, ScorerMetadata>()
  for (const id of characterIds) {
    metadataByCharacter.set(id, scorer.getMeta(id))
  }

  // Pre-extract equipped relics for focus character delta comparison
  const equippedRelicByPart: Record<string, Relic | undefined> = {}
  if (focusCharacter) {
    const character = getCharacterById(focusCharacter)
    if (character?.equipped) {
      for (const [part, relicId] of Object.entries(character.equipped)) {
        if (relicId) equippedRelicByPart[part] = getRelicById(relicId)
      }
    }
  }

  console.log(`[TAB PROFILE]     scoreRelicsAsync prep: ${(performance.now() - t0).toFixed(1)}ms (${characterIds.length} chars metadata)`)

  const input: ScoreRelicsWorkerInput = {
    relics,
    characterIds,
    metadataByCharacter,
    focusCharacter,
    excludedRelicPotentialCharacters,
    equippedRelicByPart,
  }

  return new Promise((resolve, reject) => {
    const w = getWorker()
    w.onmessage = (e: MessageEvent<ScoreRelicsWorkerOutput>) => {
      // Ignore stale results from superseded calls
      if (thisGeneration !== generation) return
      resolve(e.data.scoredRelics)
    }
    w.onerror = (e) => {
      if (thisGeneration !== generation) return
      reject(e)
    }
    w.postMessage(input)
  })
}
