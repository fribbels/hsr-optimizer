import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { scoreTbp } from 'lib/relics/estTbp/estTbp'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { ScoringMetadata } from 'types/metadata'
import { Relic } from 'types/relic'

export type RelicAnalysis = {
  relic: Relic
  estTbp: number
  estDays: number
  currentPotential: number
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

  return {
    relic: relic,
    estDays: days,
    estTbp: days * 240,
    currentPotential: potentials.currentPct,
  }
}
