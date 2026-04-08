import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { rollCounter } from 'lib/importer/characterConverter'
import type { RelicScoringResult } from 'lib/relics/scoring/relicScorer'
import { ScoringCache } from 'lib/relics/scoring/relicScorer'
import { StatCalculator } from 'lib/relics/statCalculator'
import { precisionRound } from 'lib/utils/mathUtils'
import { objectHash } from 'lib/utils/objectUtils'
import type { EstTbpRunnerOutput } from 'lib/worker/estTbpWorkerRunner'
import type { CharacterId } from 'types/character'
import type { ScoringMetadata } from 'types/metadata'
import type { Relic } from 'types/relic'

export type EnrichedRelics = {
  LinkRope?: RelicAnalysis,
  PlanarSphere?: RelicAnalysis,
  Feet?: RelicAnalysis,
  Body?: RelicAnalysis,
  Hands?: RelicAnalysis,
  Head?: RelicAnalysis,
}

export type RelicAnalysis = {
  relic: Relic,
  estTbp: number,
  estDays: number,
  scoringResult?: RelicScoringResult,
  currentPotential: number,
  rerollPotential: number,
  rerollDelta: number,
  weights: Record<string, number>,
  weightedRolls: number,
}

export function enrichRelicAnalysis(
  relics: SingleRelicByPart,
  estTbpRunnerOutput: EstTbpRunnerOutput,
  scoringMetadata: ScoringMetadata,
  characterId: CharacterId,
): EnrichedRelics {
  const scorer = new ScoringCache()
  return {
    LinkRope: enrichSingleRelicAnalysis(relics.LinkRope, estTbpRunnerOutput.LinkRope, scoringMetadata, characterId, scorer),
    PlanarSphere: enrichSingleRelicAnalysis(relics.PlanarSphere, estTbpRunnerOutput.PlanarSphere, scoringMetadata, characterId, scorer),
    Feet: enrichSingleRelicAnalysis(relics.Feet, estTbpRunnerOutput.Feet, scoringMetadata, characterId, scorer),
    Body: enrichSingleRelicAnalysis(relics.Body, estTbpRunnerOutput.Body, scoringMetadata, characterId, scorer),
    Hands: enrichSingleRelicAnalysis(relics.Hands, estTbpRunnerOutput.Hands, scoringMetadata, characterId, scorer),
    Head: enrichSingleRelicAnalysis(relics.Head, estTbpRunnerOutput.Head, scoringMetadata, characterId, scorer),
  }
}

export function enrichSingleRelicAnalysis(relic: Relic, days: number, scoringMetadata: ScoringMetadata, characterId: CharacterId, scorer: ScoringCache) {
  if (!relic) return undefined
  const score = scorer.getCurrentRelicScore(relic, characterId)
  const potentials = scorer.scoreRelicPotential(relic, characterId)

  const weightedRolls = countRelicRolls(relic, scoringMetadata.stats)
  const valid = validMainStat(relic, scoringMetadata)

  if (!valid) {
    return {
      relic: relic,
      estDays: 0,
      estTbp: 0,
      currentPotential: 0,
      rerollPotential: 0,
      rerollDelta: 0,
      weights: scoringMetadata.stats,
      weightedRolls: weightedRolls,
    }
  }

  return {
    relic: relic,
    estDays: days,
    estTbp: days * 240,
    scoringResult: score,
    currentPotential: potentials.currentPct,
    rerollPotential: potentials.rerollAvgPct,
    rerollDelta: potentials.rerollAvgPct - potentials.currentPct,
    weights: scoringMetadata.stats,
    weightedRolls: weightedRolls,
  }
}

function validMainStat(relic: Relic, scoringMetadata: ScoringMetadata) {
  if (relic.part === Parts.Head || relic.part === Parts.Hands) return true

  const acceptableStats = scoringMetadata.parts[relic.part]
  return acceptableStats.includes(relic.main.stat)
}

export function countRelicRolls(relic: Relic, scoringMetadata: ScoringMetadata['stats']) {
  let weightedRolls = 0
  for (const substat of relic.substats) {
    const stat = substat.stat
    if (substat.rolls && substat.rolls.low != null && substat.rolls.mid != null && substat.rolls.high != null) {
      // NO-OP
    } else {
      const rolls = substat.addedRolls! + 1
      const expectedStep = stat === Stats.SPD ? 0.3 : StatCalculator.getMaxedSubstatValue(stat) / 10
      const actualStat = substat.value
      const expectedStat = StatCalculator.getMaxedSubstatValue(stat, 0.8) * rolls
      const diff = Math.max(0, actualStat - expectedStat)
      const roughStep = diff / expectedStep
      const step = precisionRound(roughStep, 0)

      const result = rollCounter(rolls, step)
      substat.rolls = result.rolls
    }

    weightedRolls += scoringMetadata[stat] * flatReduction(stat) * (substat.rolls.high + substat.rolls.mid * 0.9 + substat.rolls.low * 0.8)
  }

  return weightedRolls
}

export function flatReduction(stat: string) {
  return stat === Stats.HP || stat === Stats.DEF || stat === Stats.ATK ? 0.4 : 1
}

export function hashEstTbpRun(displayRelics: SingleRelicByPart, characterId: CharacterId, scoringMetadata: ScoringMetadata) {
  return objectHash({
    weights: scoringMetadata.stats,
    parts: scoringMetadata.parts,
    characterId,
    relicsHash: Object.values(displayRelics).map(hashRelic),
  })
}

function hashRelic(relic: Relic) {
  if (!relic) return '-'
  return objectHash({
    enhance: relic.enhance,
    equippedBy: relic.equippedBy,
    grade: relic.grade,
    id: relic.id,
    main: relic.main,
    part: relic.part,
    set: relic.set,
    substats: relic.substats,
  })
}
