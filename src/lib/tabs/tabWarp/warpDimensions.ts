import {
  character5050,
  characterWarpCap,
  EidolonLevel,
  lightCone5050,
  lightConeWarpCap,
  SuperimpositionLevel,
  type WarpTarget,
  WarpType,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import {
  characterDistribution,
  lightConeDistribution,
} from 'lib/tabs/tabWarp/warpRates'

// One declarative description per warp dimension (eidolons for characters, superimpositions for light
// cones). The reflow (mutations) and the cost engine (controller) both drive off this single table via
// dot-access getters/setters, so the character/light-cone split lives in exactly one place.
export type WarpDimension = {
  type: WarpType,
  none: number, // "not owned / no goal" sentinel: EidolonLevel.NONE (-1) / SuperimpositionLevel.NONE (0)
  cap: number, // highest reachable level: E6 (6) / S5 (5)
  warpCap: number, // hard-pity warp count: 90 / 80
  fiftyFifty: number, // probability of winning the 50/50
  distribution: number[], // per-pull win PMF
  getId: (target: WarpTarget) => string | null,
  getCurrent: (target: WarpTarget) => number,
  getGoal: (target: WarpTarget) => number,
  withLevels: (target: WarpTarget, current: number, goal: number) => WarpTarget,
}

export const WARP_DIMENSIONS: Record<WarpType, WarpDimension> = {
  [WarpType.CHARACTER]: {
    type: WarpType.CHARACTER,
    none: EidolonLevel.NONE,
    cap: EidolonLevel.E6,
    warpCap: characterWarpCap,
    fiftyFifty: character5050,
    distribution: characterDistribution,
    getId: (target) => target.characterId,
    getCurrent: (target) => target.currentEidolonLevel,
    getGoal: (target) => target.targetEidolonLevel,
    withLevels: (target, current, goal) => ({ ...target, currentEidolonLevel: current as EidolonLevel, targetEidolonLevel: goal as EidolonLevel }),
  },
  [WarpType.LIGHTCONE]: {
    type: WarpType.LIGHTCONE,
    none: SuperimpositionLevel.NONE,
    cap: SuperimpositionLevel.S5,
    warpCap: lightConeWarpCap,
    fiftyFifty: lightCone5050,
    distribution: lightConeDistribution,
    getId: (target) => target.lightConeId,
    getCurrent: (target) => target.currentSuperimpositionLevel,
    getGoal: (target) => target.targetSuperimpositionLevel,
    withLevels: (target, current, goal) => ({ ...target, currentSuperimpositionLevel: current as SuperimpositionLevel, targetSuperimpositionLevel: goal as SuperimpositionLevel }),
  },
}

// A target is a light-cone goal only when it has a superimposition goal and no eidolon goal; every other
// shape (including the default combined goal) is treated as a character goal.
export function getTargetWarpType(target: WarpTarget): WarpType {
  if (target.targetSuperimpositionLevel > SuperimpositionLevel.NONE && target.targetEidolonLevel === EidolonLevel.NONE) {
    return WarpType.LIGHTCONE
  }
  return WarpType.CHARACTER
}
