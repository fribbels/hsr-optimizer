import { SaveState } from 'lib/state/saveState'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import {
  characterDistribution,
  lightConeDistribution,
} from 'lib/tabs/tabWarp/warpRates'

// Notes: 626 to e6 and 960 to e6s5, 952 with 0.78125 on lc

const characterWarpCap = 90
const lightConeWarpCap = 80
const character5050 = 0.5625
const lightCone5050 = 0.78125

export enum WarpIncomeType {
  NONE,
  F2P,
  EXPRESS,
  BP_EXPRESS,
}

export enum BannerRotation {
  NEW,
  RERUN,
}

export const NONE_WARP_INCOME_OPTION = generateOption('NONE', 0, WarpIncomeType.NONE, 0)

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
  ...generateOptions('4.0', 115, 96, 138, 107, 146, 115),
  ...generateOptions('4.1', 98, 81, 114, 89, 122, 97),
]

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
  bannerRotation: BannerRotation,
  strategy: WarpStrategy,
  starlight: StarlightRefund,
  pityCharacter: number,
  guaranteedCharacter: boolean,
  pityLightCone: number,
  guaranteedLightCone: boolean,
  currentEidolonLevel: EidolonLevel,
  currentSuperimpositionLevel: SuperimpositionLevel,
}

export type WarpMilestoneResult = { warps: number, wins: number }
export type WarpResult = null | {
  milestoneResults: Record<string, WarpMilestoneResult>,
  request: EnrichedWarpRequest,
}

export enum WarpType {
  CHARACTER,
  LIGHTCONE,
}

export const DEFAULT_WARP_REQUEST: WarpRequest = {
  passes: 0,
  jades: 0,
  income: [],
  bannerRotation: BannerRotation.NEW,
  strategy: WarpStrategy.E0,
  starlight: StarlightRefund.REFUND_AVG,
  pityCharacter: 0,
  guaranteedCharacter: false,
  pityLightCone: 0,
  guaranteedLightCone: false,
  currentEidolonLevel: EidolonLevel.NONE,
  currentSuperimpositionLevel: SuperimpositionLevel.NONE,
}

export type WarpIncomeDefinition = {
  passes: number,
  id: string,
  version: string,
  type: WarpIncomeType,
  phase: number,
}

type WarpMilestone = {
  warpType: WarpType,
  label: string,
  pity: number,
  guaranteed: boolean,
  warpCap: number,
}

function generateOption(version: string, phase: number, type: WarpIncomeType, passes: number) {
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

export function handleWarpRequest(originalRequest: WarpRequest) {
  console.log('calculate Warps', originalRequest)
  useWarpCalculatorStore.getState().setRequest(originalRequest)

  const warpResult = calculateWarps(originalRequest)

  useWarpCalculatorStore.getState().setResult(warpResult)
  SaveState.delayedSave()
}

export function calculateWarps(originalRequest: WarpRequest): Exclude<WarpResult, null> {
  const request = enrichWarpRequest(originalRequest)
  const milestones = generateWarpMilestones(request)

  const freshStartCharDist = pityAdjustedPmf(characterDistribution, 0, characterWarpCap)
  const freshStartLcDist = pityAdjustedPmf(lightConeDistribution, 0, lightConeWarpCap)

  const milestoneResults: Record<string, WarpMilestoneResult> = {}
  let cumulativePmf: number[] = [1] // P(total cost = 0) = 1 before any milestones

  for (const milestone of milestones) {
    const { warpType, label, pity, guaranteed } = milestone
    const isChar = warpType === WarpType.CHARACTER
    const baseDistribution = isChar ? characterDistribution : lightConeDistribution
    const warpCap = isChar ? characterWarpCap : lightConeWarpCap
    const rate = isChar ? character5050 : lightCone5050
    const freshStartDist = isChar ? freshStartCharDist : freshStartLcDist

    const milestoneStartDist = pityAdjustedPmf(baseDistribution, pity, warpCap)
    const milestoneDist = milestoneCostPmf(milestoneStartDist, guaranteed, rate, freshStartDist)

    cumulativePmf = convolveArrays(cumulativePmf, milestoneDist)

    // Expected warps = Σ k * P(total cost = k)
    const expectedWarps = cumulativePmf.reduce((sum, p, k) => sum + k * p, 0)

    // Win probability = P(total cost <= budget)
    let winProb = 0
    for (let k = 0; k <= request.warps && k < cumulativePmf.length; k++) {
      winProb += cumulativePmf[k]
    }

    milestoneResults[label] = { warps: expectedWarps, wins: winProb }
  }

  return { milestoneResults, request }
}

function generateWarpMilestones(enrichedRequest: EnrichedWarpRequest) {
  const {
    strategy,
    pityCharacter,
    guaranteedCharacter,
    pityLightCone,
    guaranteedLightCone,
    currentEidolonLevel,
    currentSuperimpositionLevel,
  } = enrichedRequest

  let milestones: WarpMilestone[] = [
    {
      warpType: WarpType.CHARACTER,
      label: 'E0',
      guaranteed: guaranteedCharacter,
      pity: pityCharacter,
      warpCap: characterWarpCap,
    },
    { warpType: WarpType.CHARACTER, label: 'E1', guaranteed: false, pity: 0, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E2', guaranteed: false, pity: 0, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E3', guaranteed: false, pity: 0, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E4', guaranteed: false, pity: 0, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E5', guaranteed: false, pity: 0, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E6', guaranteed: false, pity: 0, warpCap: characterWarpCap },

    { warpType: WarpType.LIGHTCONE, label: 'S2', guaranteed: false, pity: 0, warpCap: lightConeWarpCap },
    { warpType: WarpType.LIGHTCONE, label: 'S3', guaranteed: false, pity: 0, warpCap: lightConeWarpCap },
    { warpType: WarpType.LIGHTCONE, label: 'S4', guaranteed: false, pity: 0, warpCap: lightConeWarpCap },
    { warpType: WarpType.LIGHTCONE, label: 'S5', guaranteed: false, pity: 0, warpCap: lightConeWarpCap },
  ]

  const s1Milestone: WarpMilestone = {
    warpType: WarpType.LIGHTCONE,
    label: 'S1',
    guaranteed: guaranteedLightCone,
    pity: pityLightCone,
    warpCap: lightConeWarpCap,
  }

  switch (strategy) {
    case WarpStrategy.E0:
      milestones.splice(1, 0, s1Milestone)
      break
    case WarpStrategy.E1:
      milestones.splice(2, 0, s1Milestone)
      break
    case WarpStrategy.E2:
      milestones.splice(3, 0, s1Milestone)
      break
    case WarpStrategy.E3:
      milestones.splice(4, 0, s1Milestone)
      break
    case WarpStrategy.E4:
      milestones.splice(5, 0, s1Milestone)
      break
    case WarpStrategy.E5:
      milestones.splice(6, 0, s1Milestone)
      break
    case WarpStrategy.E6:
      milestones.splice(7, 0, s1Milestone)
      break
    case WarpStrategy.S1:
      milestones.splice(0, 0, s1Milestone)
      break
  }

  const currEidolonSuperCheck: boolean = (currentEidolonLevel !== EidolonLevel.NONE) || (currentSuperimpositionLevel !== SuperimpositionLevel.NONE)
  milestones = currEidolonSuperCheck ? filterRemapMilestones(milestones, enrichedRequest) : milestones

  let e = currentEidolonLevel
  let s = currentSuperimpositionLevel

  for (const milestone of milestones) {
    if (milestone.warpType == WarpType.CHARACTER) e++
    if (milestone.warpType == WarpType.LIGHTCONE) s++
    milestone.label = e == EidolonLevel.NONE ? `S${s}` : `E${e}S${s}`
  }

  return milestones
}

function filterRemapMilestones(milestones: WarpMilestone[], enrichRequest: EnrichedWarpRequest) {
  let skipCharacterMilestones: number = enrichRequest.currentEidolonLevel
  let skipLightConeMilestones: number = enrichRequest.currentSuperimpositionLevel
  let filteredMilestones: WarpMilestone[] = []

  // Filter out previous eidolon and superimposition already obtained.
  filteredMilestones = milestones.filter((milestone) => {
    switch (milestone.warpType) {
      case WarpType.CHARACTER:
        if (skipCharacterMilestones > -1) {
          skipCharacterMilestones--
          return false
        }
        break
      case WarpType.LIGHTCONE:
        if (skipLightConeMilestones > 0) {
          skipLightConeMilestones--
          return false
        }
        break
    }
    return true
  })

  // Remap the new starting milestone
  const firstNewCharacterIndex: number = filteredMilestones.findIndex((milestone) => milestone.warpType === WarpType.CHARACTER)
  if (firstNewCharacterIndex >= 0) {
    filteredMilestones[firstNewCharacterIndex].pity = enrichRequest.pityCharacter
    filteredMilestones[firstNewCharacterIndex].guaranteed = enrichRequest.guaranteedCharacter
  }

  const firstNewLightConeIndex: number = filteredMilestones.findIndex((milestone) => milestone.warpType === WarpType.LIGHTCONE)
  if (firstNewLightConeIndex >= 0) {
    filteredMilestones[firstNewLightConeIndex].pity = enrichRequest.pityLightCone
    filteredMilestones[firstNewLightConeIndex].guaranteed = enrichRequest.guaranteedLightCone
  }

  return filteredMilestones
}

export type EnrichedWarpRequest = {
  warps: number,
  totalStarlight: number,
  totalPasses: number,
  additionalPasses: number,
  totalJade: number,
} & WarpRequest

export function enrichWarpRequest(originalRequest: WarpRequest) {
  const request: WarpRequest = {
    ...originalRequest,
    jades: Number(originalRequest.jades) || 0,
    passes: Number(originalRequest.passes) || 0,
    pityCharacter: Number(originalRequest.pityCharacter) || 0,
    pityLightCone: Number(originalRequest.pityLightCone) || 0,
  }

  const selectedIncome = request.income.map(
    (incomeId) => WarpIncomeOptions.find((option) => option.id == incomeId) ?? NONE_WARP_INCOME_OPTION,
  )

  let additionalPasses = 0

  for (const income of selectedIncome) {
    additionalPasses += income.passes
  }

  const totalJade = request.jades
  const totalPasses = request.passes + additionalPasses
  const initialWarps = Math.floor(totalJade / 160) + totalPasses

  const refundedWarps = Math.floor((StarlightMultiplier[request.starlight] ?? 0) * initialWarps)
  const totalStarlight = refundedWarps * 20
  const totalWarps = initialWarps + refundedWarps

  const enrichedRequest: EnrichedWarpRequest = {
    ...request,
    warps: totalWarps,
    totalJade: totalJade,
    totalPasses: totalPasses,
    additionalPasses: additionalPasses,
    totalStarlight: totalStarlight,
  }

  if (request.bannerRotation == BannerRotation.NEW) {
    enrichedRequest.currentEidolonLevel = EidolonLevel.NONE
    enrichedRequest.currentSuperimpositionLevel = SuperimpositionLevel.NONE
  }

  return enrichedRequest
}

// PMF (probability mass function) for cost starting at pity position.
// Result is 1-indexed: result[0] = 0, result[k] = P(costs k warps from pity position).
function pityAdjustedPmf(distribution: number[], pity: number, warpCap: number): number[] {
  const slice = distribution.slice(pity, warpCap)
  const total = slice.reduce((sum, p) => sum + p, 0)
  return [0, ...slice.map((p) => p / total)]
}

// Discrete convolution: (a ⊗ b)[k] = Σᵢ a[i] * b[k-i]
function convolveArrays(a: number[], b: number[]): number[] {
  const result = Array.from({ length: a.length + b.length - 1 }, () => 0)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j]
    }
  }
  return result
}

// PMF for a single milestone cost.
// For 50/50: rate * milestoneStartDist + (1 - rate) * convolve(milestoneStartDist, freshStartDist)
// For guaranteed: milestoneStartDist
function milestoneCostPmf(
  milestoneStartDist: number[],
  guaranteed: boolean,
  rate: number,
  freshStartDist: number[],
): number[] {
  if (guaranteed) return milestoneStartDist

  const winBranch = milestoneStartDist.map((p) => p * rate)
  const loseBranch = convolveArrays(milestoneStartDist, freshStartDist).map((p) => p * (1 - rate))

  const result = Array.from({ length: Math.max(winBranch.length, loseBranch.length) }, () => 0)
  for (let i = 0; i < winBranch.length; i++) {
    result[i] += winBranch[i]
  }
  for (let i = 0; i < loseBranch.length; i++) {
    result[i] += loseBranch[i]
  }
  return result
}
