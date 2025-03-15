import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { scoreTbp } from 'lib/relics/estTbp/estTbp'
import { ScoringMetadata } from 'types/metadata'
import { Relic } from 'types/relic'

export type RelicAnalysis = {
  relic: Relic
  estTbp: number
  estDays: number
}

export function enrichRelicAnalysis(relics: SingleRelicByPart, scoringMetadata: ScoringMetadata) {
  return {
    LinkRope: enrichRelic(relics.LinkRope, scoringMetadata),
    PlanarSphere: enrichRelic(relics.PlanarSphere, scoringMetadata),
    Feet: enrichRelic(relics.Feet, scoringMetadata),
    Body: enrichRelic(relics.Body, scoringMetadata),
    Hands: enrichRelic(relics.Hands, scoringMetadata),
    Head: enrichRelic(relics.Head, scoringMetadata),
  }
}

export function enrichRelic(relic: Relic, scoringMetadata: ScoringMetadata) {
  if (!relic) return undefined
  const days = scoreTbp(relic, scoringMetadata.stats)
  return {
    relic: relic,
    estDays: Math.floor(days),
    estTbp: Math.floor(days * 240),
  }
}
