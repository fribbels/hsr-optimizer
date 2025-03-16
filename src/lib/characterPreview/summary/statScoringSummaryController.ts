import { Stats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { rollCounter } from 'lib/importer/characterConverter'
import { scoreTbp } from 'lib/relics/estTbp/estTbp'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { StatCalculator } from 'lib/relics/statCalculator'
import { TsUtils } from 'lib/utils/TsUtils'
import { ScoringMetadata } from 'types/metadata'
import { Relic } from 'types/relic'

export type RelicAnalysis = {
  relic: Relic
  estTbp: number
  estDays: number
  currentPotential: number
  rerollPotential: number
}

export function enrichRelicAnalysis(relics: SingleRelicByPart, scoringMetadata: ScoringMetadata, characterId: string) {
  return {
    LinkRope: enrichSingleRelicAnalysis(relics.LinkRope, scoringMetadata, characterId),
    PlanarSphere: enrichSingleRelicAnalysis(relics.PlanarSphere, scoringMetadata, characterId),
    Feet: enrichSingleRelicAnalysis(relics.Feet, scoringMetadata, characterId),
    Body: enrichSingleRelicAnalysis(relics.Body, scoringMetadata, characterId),
    Hands: enrichSingleRelicAnalysis(relics.Hands, scoringMetadata, characterId),
    Head: enrichSingleRelicAnalysis(relics.Head, scoringMetadata, characterId),
  }
}

export function enrichSingleRelicAnalysis(relic: Relic, scoringMetadata: ScoringMetadata, characterId: string) {
  if (!relic) return undefined
  const days = scoreTbp(relic, scoringMetadata.stats)
  const potentials = RelicScorer.scoreRelicPotential(relic, characterId)

  countRelicRolls(relic)

  return {
    relic: relic,
    estDays: days,
    estTbp: days * 240,
    currentPotential: potentials.currentPct,
    rerollPotential: potentials.rerollAvgPct,
  }
}

function countRelicRolls(relic: Relic) {
  for (const substat of relic.substats) {
    if (substat.rolls && substat.rolls.low != null && substat.rolls.mid != null && substat.rolls.high != null) {
      // NO-OP
    } else {
      const rolls = substat.addedRolls! + 1
      const expectedStep = substat.stat == Stats.SPD ? 0.3 : StatCalculator.getMaxedSubstatValue(substat.stat) / 10
      const actualStat = substat.value
      const expectedStat = StatCalculator.getMaxedSubstatValue(substat.stat, 0.8) * (rolls)
      const diff = Math.max(0, actualStat - expectedStat)
      const roughStep = diff / (expectedStep)
      const step = TsUtils.precisionRound(roughStep, 0)
      // console.log(substat)
      // console.log(roughStep)
      // console.log(step)
      const result = rollCounter(step, rolls)
      substat.rolls = result.rolls
    }
  }
}
