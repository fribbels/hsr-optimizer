import { SaveState } from 'lib/state/saveState'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import {
  characterCumulative,
  characterDistribution,
  lightConeCumulative,
  lightConeDistribution,
} from 'lib/tabs/tabWarp/warpRates'

// Notes: 626 to e6 and 960 to e6s5, 952 with 0.78125 on lc

const characterWarpCap = 90
const lightConeWarpCap = 80
const simulations = 100000
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

  ...generateOptions('3.6', 96, 64, 119, 76, 128, 84),
  ...generateOptions('3.7', 107, 82, 130, 94, 138, 102),
  ...generateOptions('3.8', 109, 66, 141, 78, 149, 82),
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
  redistributedCumulative: number[],
  redistributedCumulativeNonPity?: number[],
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
  console.log('simulate Warps', originalRequest)
  useWarpCalculatorStore.getState().setRequest(originalRequest)

  const warpResult = simulateWarps(originalRequest)

  useWarpCalculatorStore.getState().setResult(warpResult)
  SaveState.delayedSave()
}

export function simulateWarps(originalRequest: WarpRequest) {
  const request = enrichWarpRequest(originalRequest)
  const milestones = generateWarpMilestones(request)

  const milestoneResults: Record<string, WarpMilestoneResult> = Object.fromEntries(
    milestones.map(({ label }) => [label, { warps: 0, wins: 0 }]),
  )

  for (let i = 0; i < simulations; i++) {
    let count = 0

    for (const milestone of milestones) {
      const {
        warpType,
        label,
        pity,
        guaranteed,
        redistributedCumulative,
        redistributedCumulativeNonPity,
        warpCap,
      } = milestone

      const rate = warpType == WarpType.CHARACTER ? character5050 : lightCone5050
      const index = getNextSuccessIndex(redistributedCumulative, warpCap, pity) - pity + 1
      if (Math.random() < rate || guaranteed) {
        count += index
      } else {
        const index2 = getNextSuccessIndex(redistributedCumulativeNonPity ?? redistributedCumulative, warpCap, 0) + 1
        count += index + index2
      }

      milestoneResults[label].warps += count
      if (count <= request.warps) {
        milestoneResults[label].wins++
      }
    }
  }

  for (const milestone of milestones) {
    milestoneResults[milestone.label].warps /= simulations
    milestoneResults[milestone.label].wins /= simulations
  }

  const warpResult: WarpResult = {
    milestoneResults: milestoneResults,
    request: request,
  }

  return warpResult
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

  const e0CharacterDistribution = redistributePityCumulative(pityCharacter, characterWarpCap, characterDistribution)
  const e0CharacterDistributionNonPity = redistributePityCumulative(0, characterWarpCap, characterDistribution)
  const s1LightConeDistribution = redistributePityCumulative(pityLightCone, lightConeWarpCap, lightConeDistribution)
  const s1LightConeDistributionNonPity = redistributePityCumulative(0, lightConeWarpCap, lightConeDistribution)
  let milestones: WarpMilestone[] = [
    {
      warpType: WarpType.CHARACTER,
      label: 'E0',
      guaranteed: guaranteedCharacter,
      pity: pityCharacter,
      redistributedCumulative: e0CharacterDistribution,
      redistributedCumulativeNonPity: e0CharacterDistributionNonPity,
      warpCap: characterWarpCap,
    },
    { warpType: WarpType.CHARACTER, label: 'E1', guaranteed: false, pity: 0, redistributedCumulative: characterCumulative, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E2', guaranteed: false, pity: 0, redistributedCumulative: characterCumulative, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E3', guaranteed: false, pity: 0, redistributedCumulative: characterCumulative, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E4', guaranteed: false, pity: 0, redistributedCumulative: characterCumulative, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E5', guaranteed: false, pity: 0, redistributedCumulative: characterCumulative, warpCap: characterWarpCap },
    { warpType: WarpType.CHARACTER, label: 'E6', guaranteed: false, pity: 0, redistributedCumulative: characterCumulative, warpCap: characterWarpCap },

    { warpType: WarpType.LIGHTCONE, label: 'S2', guaranteed: false, pity: 0, redistributedCumulative: lightConeCumulative, warpCap: lightConeWarpCap },
    { warpType: WarpType.LIGHTCONE, label: 'S3', guaranteed: false, pity: 0, redistributedCumulative: lightConeCumulative, warpCap: lightConeWarpCap },
    { warpType: WarpType.LIGHTCONE, label: 'S4', guaranteed: false, pity: 0, redistributedCumulative: lightConeCumulative, warpCap: lightConeWarpCap },
    { warpType: WarpType.LIGHTCONE, label: 'S5', guaranteed: false, pity: 0, redistributedCumulative: lightConeCumulative, warpCap: lightConeWarpCap },
  ]

  const s1Milestone: WarpMilestone = {
    warpType: WarpType.LIGHTCONE,
    label: 'S1',
    guaranteed: guaranteedLightCone,
    pity: pityLightCone,
    redistributedCumulative: s1LightConeDistribution,
    redistributedCumulativeNonPity: s1LightConeDistributionNonPity,
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
  const e0CharacterDistribution = redistributePityCumulative(enrichRequest.pityCharacter, characterWarpCap, characterDistribution)
  const e0CharacterDistributionNonPity = redistributePityCumulative(0, characterWarpCap, characterDistribution)
  const s1LightConeDistribution = redistributePityCumulative(enrichRequest.pityLightCone, lightConeWarpCap, lightConeDistribution)
  const s1LightConeDistributionNonPity = redistributePityCumulative(0, lightConeWarpCap, lightConeDistribution)

  const firstNewCharacterIndex: number = filteredMilestones.findIndex((milestone) => milestone.warpType === WarpType.CHARACTER)
  if (firstNewCharacterIndex >= 0) {
    filteredMilestones[firstNewCharacterIndex].pity = enrichRequest.pityCharacter
    filteredMilestones[firstNewCharacterIndex].guaranteed = enrichRequest.guaranteedCharacter
    filteredMilestones[firstNewCharacterIndex].redistributedCumulative = e0CharacterDistribution
    filteredMilestones[firstNewCharacterIndex].redistributedCumulativeNonPity = e0CharacterDistributionNonPity
  }

  const firstNewLightConeIndex: number = filteredMilestones.findIndex((milestone) => milestone.warpType === WarpType.LIGHTCONE)
  if (firstNewLightConeIndex >= 0) {
    filteredMilestones[firstNewLightConeIndex].pity = enrichRequest.pityLightCone
    filteredMilestones[firstNewLightConeIndex].guaranteed = enrichRequest.guaranteedLightCone
    filteredMilestones[firstNewLightConeIndex].redistributedCumulative = s1LightConeDistribution
    filteredMilestones[firstNewLightConeIndex].redistributedCumulativeNonPity = s1LightConeDistributionNonPity
  }

  return filteredMilestones
}

export type EnrichedWarpRequest = {
  warps: number,
  totalStarlight: number,
  totalPasses: number,
  totalJade: number,
} & WarpRequest

function enrichWarpRequest(request: WarpRequest) {
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

  // Treat null form values as empty and use defaults
  for (const [key, value] of Object.entries(request)) {
    if (value == null) {
      // @ts-ignore
      request[key] = DEFAULT_WARP_REQUEST[key]
    }
  }

  const enrichedRequest: EnrichedWarpRequest = {
    ...request,
    warps: totalWarps,
    totalJade: totalJade,
    totalPasses: totalPasses,
    totalStarlight: totalStarlight,
  }

  if (request.bannerRotation == BannerRotation.NEW) {
    enrichedRequest.currentEidolonLevel = EidolonLevel.NONE
    enrichedRequest.currentSuperimpositionLevel = SuperimpositionLevel.NONE
  }

  return enrichedRequest
}

// We have the cumulative distribution of warp results for 0 pity counter.
// To compute the with-pity distribution, redistribute the probability mass from before the pity among the remaining possibilities
function redistributePityCumulative(pity: number, warpCap: number, distribution: number[]) {
  const redistributedCumulative: number[] = []

  for (let i = 0; i < pity; i++) {
    redistributedCumulative[i] = 0
  }
  for (let i = pity; i < warpCap; i++) {
    redistributedCumulative[i] = i == 0 ? distribution[i] : redistributedCumulative[i - 1] + distribution[i]
  }
  const diff = 1 - redistributedCumulative[warpCap - 1]
  for (let i = pity; i < warpCap; i++) {
    redistributedCumulative[i] += diff * (redistributedCumulative[i])
  }

  return redistributedCumulative
}

// Adjust the random number to account for pity counter since anything before the pity is impossible
function getNextSuccessIndex(cumulative: number[], warpCap: number, pity: number) {
  const rand = Math.random() * cumulative[warpCap - 1]
  return getIndex(rand, cumulative, pity)
}

// Binary search the index of random number within the distribution
function getIndex(random: number, cumulativeDistribution: number[], pity: number) {
  let left = pity
  let right = cumulativeDistribution.length - 1

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (random > cumulativeDistribution[mid]) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}
