import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { rollCounter } from 'lib/importer/characterConverter'
import {
  RelicScorer,
  RelicScoringResult,
} from 'lib/relics/relicScorerPotential'
import { StatCalculator } from 'lib/relics/statCalculator'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { EstTbpRunnerOutput } from 'lib/worker/estTbpWorkerRunner'
import { CharacterId } from 'types/character'
import { ScoringMetadata } from 'types/metadata'
import { Relic } from 'types/relic'

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
  return {
    LinkRope: enrichSingleRelicAnalysis(relics.LinkRope, estTbpRunnerOutput.LinkRope, scoringMetadata, characterId),
    PlanarSphere: enrichSingleRelicAnalysis(relics.PlanarSphere, estTbpRunnerOutput.PlanarSphere, scoringMetadata, characterId),
    Feet: enrichSingleRelicAnalysis(relics.Feet, estTbpRunnerOutput.Feet, scoringMetadata, characterId),
    Body: enrichSingleRelicAnalysis(relics.Body, estTbpRunnerOutput.Body, scoringMetadata, characterId),
    Hands: enrichSingleRelicAnalysis(relics.Hands, estTbpRunnerOutput.Hands, scoringMetadata, characterId),
    Head: enrichSingleRelicAnalysis(relics.Head, estTbpRunnerOutput.Head, scoringMetadata, characterId),
  }
}

export function enrichSingleRelicAnalysis(relic: Relic, days: number, scoringMetadata: ScoringMetadata, characterId: CharacterId) {
  if (!relic) return undefined
  const score = RelicScorer.scoreCurrentRelic(relic, characterId)
  const potentials = RelicScorer.scoreRelicPotential(relic, characterId)

  const weightedRolls = countRelicRolls(relic, scoringMetadata)
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
  if (relic.part == Parts.Head || relic.part == Parts.Hands) return true

  const acceptableStats = scoringMetadata.parts[relic.part]
  return acceptableStats.includes(relic.main.stat)
}

function countRelicRolls(relic: Relic, scoringMetadata: ScoringMetadata) {
  let weightedRolls = 0
  for (const substat of relic.substats) {
    const stat = substat.stat
    if (substat.rolls && substat.rolls.low != null && substat.rolls.mid != null && substat.rolls.high != null) {
      // NO-OP
    } else {
      const rolls = substat.addedRolls! + 1
      const expectedStep = stat == Stats.SPD ? 0.3 : StatCalculator.getMaxedSubstatValue(stat) / 10
      const actualStat = substat.value
      const expectedStat = StatCalculator.getMaxedSubstatValue(stat, 0.8) * rolls
      const diff = Math.max(0, actualStat - expectedStat)
      const roughStep = diff / expectedStep
      const step = TsUtils.precisionRound(roughStep, 0)

      const result = rollCounter(rolls, step)
      substat.rolls = result.rolls
    }

    weightedRolls += scoringMetadata.stats[stat] * flatReduction(stat) * (substat.rolls.high + substat.rolls.mid * 0.9 + substat.rolls.low * 0.8)
  }

  return weightedRolls
}

export function flatReduction(stat: string) {
  return stat == Stats.HP || stat == Stats.DEF || stat == Stats.ATK ? 0.4 : 1
}

// Scoring type isn't strictly needed in the hash, but it helps work around some rendering issues with switching score type
export function hashEstTbpRun(displayRelics: SingleRelicByPart, characterId: string, scoringType: ScoringType, scoringMetadata: ScoringMetadata) {
  return TsUtils.objectHash({
    weights: scoringMetadata.stats,
    parts: scoringMetadata.parts,
    scoringType,
    characterId,
    relicsHash: Object.values(displayRelics).map(hashRelic),
  })
}

function hashRelic(relic: Relic) {
  if (!relic) return '-'
  return TsUtils.objectHash({
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
