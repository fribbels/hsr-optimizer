import { Constants, Parts } from 'lib/constants/constants'
import { TsUtils } from 'lib/utils/TsUtils'

export function partIsOrnament(part: string) {
  return part === Parts.PlanarSphere
    || part === Parts.LinkRope
}

export function partIsRelic(part: string) {
  return part === Parts.Head
    || part === Parts.Hands
    || part === Parts.Body
    || part === Parts.Feet
}

export function calculateRelicMainStatValue(mainStatType: string, grade: number, enhance: number): number {
  return TsUtils.precisionRound(
    Constants.MainStatsValues[mainStatType][grade].base
    + Constants.MainStatsValues[mainStatType][grade].increment * enhance,
  )
}
