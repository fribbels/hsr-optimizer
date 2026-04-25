import type { SimulationMetadata } from 'types/metadata'
import type { AuditorFlagLevel } from './setAuditorTypes'

export const AUDITOR_RED_THRESHOLD = 0
export const AUDITOR_YELLOW_THRESHOLD = -2

export const AUDITOR_SPD_BREAKPOINTS = [0, 133, 160, 200]

export function getErrRopePermutations(metadata: SimulationMetadata): boolean[] {
  if (metadata.errRopeEidolon != null && 0 >= metadata.errRopeEidolon) {
    return [false, true]
  }
  return [false]
}

export function computeFlag(deltaPct: number): AuditorFlagLevel {
  if (deltaPct >= AUDITOR_RED_THRESHOLD) return 'red'
  if (deltaPct >= AUDITOR_YELLOW_THRESHOLD) return 'yellow'
  return null
}

export const FLAG_COLORS: Record<string, string> = {
  red: 'rgba(255, 60, 60, 0.18)',
  yellow: 'rgba(255, 220, 50, 0.18)',
}

export function formatParamCombo(spd: number, subDps: boolean, errRope: boolean): string {
  const spdStr = spd === 0 ? 'No min' : `SPD ${spd}`
  const dpsStr = subDps ? 'Sub DPS' : 'DPS'
  const errStr = errRope ? 'ERR' : 'No ERR'
  return `${spdStr} / ${dpsStr} / ${errStr}`
}
