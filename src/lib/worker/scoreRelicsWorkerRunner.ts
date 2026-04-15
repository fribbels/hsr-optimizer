import type { ScoredRelic } from 'lib/relics/scoreRelics'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import type { ScorerMetadata } from 'lib/relics/scoring/types'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { getRelicById } from 'lib/stores/relic/relicStore'
import type { CharacterId } from 'types/character'
import type { Nullable } from 'types/common'
import type { Relic } from 'types/relic'

export type ScoreRelicsWorkerInput = {
  generation: number,
  relics: Relic[],
  characterIds: CharacterId[],
  metadataByCharacter: Map<CharacterId, ScorerMetadata>,
  focusCharacter: Nullable<CharacterId>,
  excludedRelicPotentialCharacters: CharacterId[],
  equippedRelicByPart: Record<string, Relic | undefined>,
}

export type ScoreRelicsWorkerOutput = {
  generation: number,
  scoredRelics: ScoredRelic[],
}

let worker: Worker | null = null
let generation = 0
let pendingResolve: ((result: ScoredRelic[]) => void) | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./scoreRelicsWorker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<ScoreRelicsWorkerOutput>) => {
      if (e.data.generation !== generation) return
      pendingResolve?.(e.data.scoredRelics)
      pendingResolve = null
    }
    worker.onerror = (e) => {
      worker?.terminate()
      worker = null // Allow re-creation on next call
      const resolve = pendingResolve
      pendingResolve = null
      resolve?.([]) // Settle the Promise so callers aren't left hanging
      console.warn('scoreRelicsWorker error:', e)
    }
  }
  return worker
}

/**
 * Scores relics off the main thread using a dedicated web worker.
 * Pre-computes per-character metadata on the main thread (fast, ~5ms),
 * then sends pure data to the worker for the O(relics × characters) loop.
 *
 * Automatically cancels stale requests — only the latest call resolves.
 * Previous in-flight Promises resolve with empty array when superseded.
 */
export function scoreRelicsAsync(
  relics: Relic[],
  excludedRelicPotentialCharacters: CharacterId[],
  focusCharacter: Nullable<CharacterId>,
): Promise<ScoredRelic[]> {
  // Settle any previous in-flight request
  if (pendingResolve) {
    pendingResolve([])
    pendingResolve = null
  }

  const thisGeneration = ++generation

  const scorer = new RelicScorer()
  const characterIds = Object.values(getGameMetadata().characters).map((x) => x.id as CharacterId)
  const metadataByCharacter = new Map<CharacterId, ScorerMetadata>()
  for (const id of characterIds) {
    metadataByCharacter.set(id, scorer.getMeta(id))
  }

  const equippedRelicByPart: Record<string, Relic | undefined> = {}
  if (focusCharacter) {
    const character = getCharacterById(focusCharacter)
    if (character?.equipped) {
      for (const [part, relicId] of Object.entries(character.equipped)) {
        if (relicId) equippedRelicByPart[part] = getRelicById(relicId)
      }
    }
  }

  const input: ScoreRelicsWorkerInput = {
    generation: thisGeneration,
    relics,
    characterIds,
    metadataByCharacter,
    focusCharacter,
    excludedRelicPotentialCharacters,
    equippedRelicByPart,
  }

  return new Promise((resolve) => {
    pendingResolve = resolve
    getWorker().postMessage(input)
  })
}
