import type { SetsOrnaments, SetsRelics } from 'lib/sets/setConfigRegistry'
import type { SimpleCharacter } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import type { LightConeId } from 'types/lightCone'

export type AuditorSetType = 'relic4p' | 'relic2p2p' | 'ornament'

export type AuditorParamCombo = {
  spd: number
  errRope: boolean
  subDps: boolean
}

export type AuditorSetCombo = {
  type: AuditorSetType
  relicSet1: SetsRelics
  relicSet2: SetsRelics
  ornamentSet: SetsOrnaments
  label: string
}

export type AuditorFlagLevel = 'red' | 'yellow' | null

export type AuditorRunResult = {
  setCombo: AuditorSetCombo
  paramCombo: AuditorParamCombo
  score: number
  referenceScore: number
  deltaPct: number
  flag: AuditorFlagLevel
  error?: boolean
  modeLabel?: string
}

export type AuditorSetSummary = {
  setCombo: AuditorSetCombo
  bestDelta: number
  bestDeltaParams: AuditorParamCombo
  flag: AuditorFlagLevel
  matched: boolean
  results: AuditorRunResult[]
}

export type AuditorResults = {
  summaries: AuditorSetSummary[]
  relicReferenceLabel: string
  ornamentReferenceLabel: string
}

export type AuditorStatus = 'idle' | 'running' | 'complete' | 'cancelled'

export type AuditorConfig = {
  spdBreakpoints: number[]
  modes: ('dps' | 'subDps')[]
  errRope: ('noErr' | 'err')[]
  setTypes: AuditorSetType[]
  lightCone: LightConeId
  characterEidolon: number
  lightConeSuperimposition: number
  teammates: SimpleCharacter[]
  scoringModes: ('benchmark' | 'perfection')[]
}
