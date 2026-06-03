import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

// Notes: 626 to e6 and 960 to e6s5, 952 with 0.78125 on lc

export const characterWarpCap = 90
export const lightConeWarpCap = 80
export const character5050 = 0.5625
export const lightCone5050 = 0.78125

export enum WarpIncomeType {
  NONE,
  F2P,
  EXPRESS,
  BP_EXPRESS,
}

export enum PlannerMode {
  SINGLE = 'single',
  MULTI = 'multi',
}

export enum WarpStrategy {
  E0 = 0, // E0 -> S1 -> E6 -> S5
  E1 = 1, // E1 -> S1 -> E6 -> S5
  E2 = 2, // E2 -> S1 -> E6 -> S5
  E3 = 3, // E3 -> S1 -> E6 -> S5
  E4 = 4, // E4 -> S1 -> E6 -> S5
  E5 = 5, // E5 -> S1 -> E6 -> S5
  E6 = 6, // E6 -> S1 -> S5
  S1 = 7, // S1 -> E6 -> S5
}

export enum EidolonLevel {
  NONE = -1,
  E0,
  E1,
  E2,
  E3,
  E4,
  E5,
  E6,
}

export enum SuperimpositionLevel {
  NONE = 0,
  S1,
  S2,
  S3,
  S4,
  S5,
}

export enum StarlightRefund {
  REFUND_NONE = 'REFUND_NONE',
  REFUND_LOW = 'REFUND_LOW',
  REFUND_AVG = 'REFUND_AVG',
  REFUND_HIGH = 'REFUND_HIGH',
}

export enum WarpType {
  CHARACTER,
  LIGHTCONE,
}

export const StarlightMultiplier: Record<StarlightRefund, number> = {
  [StarlightRefund.REFUND_NONE]: 0.00,
  [StarlightRefund.REFUND_LOW]: 0.04,
  [StarlightRefund.REFUND_AVG]: 0.075,
  [StarlightRefund.REFUND_HIGH]: 0.11,
}

export type WarpRequest = {
  passes: number,
  jades: number,
  income: string[],
  targets: WarpTarget[],
  plannerMode: PlannerMode,
  strategy: WarpStrategy,
  starlight: StarlightRefund,
  pityCharacter: number,
  guaranteedCharacter: boolean,
  pityLightCone: number,
  guaranteedLightCone: boolean,
}

export type WarpTarget = {
  id: string,
  characterId: CharacterId | null,
  lightConeId: LightConeId | null,
  targetEidolonLevel: EidolonLevel,
  targetSuperimpositionLevel: SuperimpositionLevel,
  currentEidolonLevel: EidolonLevel,
  currentSuperimpositionLevel: SuperimpositionLevel,
}

export type WarpMilestoneResult = { warps: number, wins: number }

export type WarpResult = null | {
  milestoneResults: Record<string, WarpMilestoneResult>,
  targetResults: WarpTargetResult[],
  request: EnrichedWarpRequest,
}

export type WarpTargetResult = {
  target: WarpTarget,
  milestoneResults: Record<string, WarpMilestoneResult>,
}

export type EnrichedWarpRequest = {
  warps: number,
  totalStarlight: number,
  totalPasses: number,
  additionalPasses: number,
  totalJade: number,
} & WarpRequest

export type WarpIncomeDefinition = {
  passes: number,
  id: string,
  version: string,
  type: WarpIncomeType,
  phase: number,
}

export const DEFAULT_WARP_TARGET: WarpTarget = {
  id: 'target-1',
  characterId: null,
  lightConeId: null,
  targetEidolonLevel: EidolonLevel.E6,
  targetSuperimpositionLevel: SuperimpositionLevel.S5,
  currentEidolonLevel: EidolonLevel.NONE,
  currentSuperimpositionLevel: SuperimpositionLevel.NONE,
}

export const DEFAULT_WARP_REQUEST: WarpRequest = {
  passes: 0,
  jades: 0,
  income: [],
  targets: [{ ...DEFAULT_WARP_TARGET }],
  plannerMode: PlannerMode.MULTI,
  strategy: WarpStrategy.E0,
  starlight: StarlightRefund.REFUND_AVG,
  pityCharacter: 0,
  guaranteedCharacter: false,
  pityLightCone: 0,
  guaranteedLightCone: false,
}

function generateOption(version: string, phase: number, type: WarpIncomeType, passes: number): WarpIncomeDefinition {
  return {
    passes,
    version,
    phase,
    type,
    id: generateOptionKey(version, phase, type),
  }
}

function generateOptionKey(version: string, phase: number, type: WarpIncomeType) {
  return `${version}_p${phase}_${type}`
}

function generateOptions(
  version: string,
  f2pTotal: number,
  f2pFirstHalf: number,
  expressTotal: number,
  expressFirstHalf: number,
  bpTotal: number,
  bpFirstHalf: number,
) {
  return [
    generateOption(version, 1, WarpIncomeType.F2P, f2pFirstHalf),
    generateOption(version, 2, WarpIncomeType.F2P, f2pTotal - f2pFirstHalf),
    generateOption(version, 1, WarpIncomeType.EXPRESS, expressFirstHalf),
    generateOption(version, 2, WarpIncomeType.EXPRESS, expressTotal - expressFirstHalf),
    generateOption(version, 1, WarpIncomeType.BP_EXPRESS, bpFirstHalf),
    generateOption(version, 2, WarpIncomeType.BP_EXPRESS, bpTotal - bpFirstHalf),
  ]
}

export const NONE_WARP_INCOME_OPTION = generateOption('NONE', 0, WarpIncomeType.NONE, 0)

// Modified each patch
export const WarpIncomeOptions: WarpIncomeDefinition[] = [
  // ...generateOptions('3.4', 92, 57, 116, 69, 124, 77),
  // ...generateOptions('3.5', 88, 66, 112, 77, 120, 86),

  // ...generateOptions('3.7', 107, 82, 130, 94, 138, 102),
  // ...[
  //   generateOption('3.8', 1, WarpIncomeType.F2P, 66),
  //   generateOption('3.8', 2, WarpIncomeType.F2P, 21),
  //   generateOption('3.8', 3, WarpIncomeType.F2P, 22),
  //   generateOption('3.8', 1, WarpIncomeType.EXPRESS, 78),
  //   generateOption('3.8', 2, WarpIncomeType.EXPRESS, 32),
  //   generateOption('3.8', 3, WarpIncomeType.EXPRESS, 31),
  //   generateOption('3.8', 1, WarpIncomeType.BP_EXPRESS, 82),
  //   generateOption('3.8', 2, WarpIncomeType.BP_EXPRESS, 36),
  //   generateOption('3.8', 3, WarpIncomeType.BP_EXPRESS, 31),
  // ],
  // ...generateOptions('4.0', 115, 96, 138, 107, 146, 115),
  ...generateOptions('4.1', 98, 81, 114, 89, 122, 97),
  ...generateOptions('4.2', 117, 91, 140, 103, 149, 112),
  ...generateOptions('4.3', 91, 66, 116, 78, 124, 86),
]
