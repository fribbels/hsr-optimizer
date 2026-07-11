import { Hysilens } from 'lib/conditionals/character/1400/Hysilens'
import { Stats } from 'lib/constants/constants'
import {
  createDiminishingReturns,
  type DiminishingReturnsFormulas,
  dpsDiminishingReturns,
  substatRollsModifier,
  supportDiminishingReturns,
} from 'lib/scoring/simScoringUtils'
import type { Simulation } from 'lib/simulations/statSimulationTypes'
import type { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { ScoringConfigType } from 'types/metadata'

export enum DiminishingReturnsCurve {
  IDENTITY = 'identity',
  DPS_DIMINISHING_RETURNS = 'dpsDiminishingReturns',
  SUPPORT_DIMINISHING_RETURNS = 'supportDiminishingReturns',
  HYSILENS_NO_EHR_LC_DIMINISHING_RETURNS = 'hysilensNoEhrLightConeDiminishingReturns',
}

export type DiminishingReturnsCurveConfig = {
  substatRollsModifier: (rolls: number, stat: string, sim: Simulation) => number,
  diminishingReturns: DiminishingReturnsFormulas | undefined,
}

const hysilensNoEhrDr = createDiminishingReturns(24, 2)

export const DIMINISHING_RETURNS_CURVES: Record<DiminishingReturnsCurve, DiminishingReturnsCurveConfig> = {
  [DiminishingReturnsCurve.IDENTITY]: {
    substatRollsModifier: (rolls) => rolls,
    diminishingReturns: undefined,
  },
  [DiminishingReturnsCurve.DPS_DIMINISHING_RETURNS]: {
    substatRollsModifier: substatRollsModifier,
    diminishingReturns: dpsDiminishingReturns,
  },
  [DiminishingReturnsCurve.SUPPORT_DIMINISHING_RETURNS]: {
    substatRollsModifier: (rolls, stat, sim) => substatRollsModifier(rolls, stat, sim, supportDiminishingReturns),
    diminishingReturns: supportDiminishingReturns,
  },
  [DiminishingReturnsCurve.HYSILENS_NO_EHR_LC_DIMINISHING_RETURNS]: {
    substatRollsModifier: (rolls, stat, sim) => substatRollsModifier(rolls, stat, sim, hysilensNoEhrDr),
    diminishingReturns: hysilensNoEhrDr,
  },
}

export function getDiminishingReturnsCurve(input: ComputeOptimalSimulationWorkerInput): DiminishingReturnsCurve {
  if (input.scoringParams.quality !== 0.8) {
    return DiminishingReturnsCurve.IDENTITY
  }

  if (input.context.characterId === Hysilens.id) {
    const ehrLightCone = input.context.characterStatsBreakdown.lightCone[Stats.EHR]
    if (!ehrLightCone) {
      return DiminishingReturnsCurve.HYSILENS_NO_EHR_LC_DIMINISHING_RETURNS
    }
  }

  if (input.configType !== ScoringConfigType.DPS) {
    return DiminishingReturnsCurve.SUPPORT_DIMINISHING_RETURNS
  }

  return DiminishingReturnsCurve.DPS_DIMINISHING_RETURNS
}
