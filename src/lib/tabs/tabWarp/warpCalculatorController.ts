import { SaveState } from 'lib/state/saveState'
import { characterCumulative, characterDistribution, lightConeCumulative, lightConeDistribution } from 'lib/tabs/tabWarp/warpRates'

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

export const NONE_WARP_INCOME_OPTION = generateOption('NONE', 0, WarpIncomeType.NONE, 0)

// Modified each patch
export const WarpIncomeOptions: WarpIncomeDefinition[] = [

  generateOption('3.0', 1, WarpIncomeType.F2P, 75),
  generateOption('3.0', 2, WarpIncomeType.F2P, 34),
  generateOption('3.0', 1, WarpIncomeType.EXPRESS, 86),
  generateOption('3.0', 2, WarpIncomeType.EXPRESS, 46),
  generateOption('3.0', 1, WarpIncomeType.BP_EXPRESS, 90),
  generateOption('3.0', 2, WarpIncomeType.BP_EXPRESS, 51),

  generateOption('3.1', 1, WarpIncomeType.F2P, 80),
  generateOption('3.1', 2, WarpIncomeType.F2P, 23),
  generateOption('3.1', 1, WarpIncomeType.EXPRESS, 93),
  generateOption('3.1', 2, WarpIncomeType.EXPRESS, 34),
  generateOption('3.1', 1, WarpIncomeType.BP_EXPRESS, 96),
  generateOption('3.1', 2, WarpIncomeType.BP_EXPRESS, 39),
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

export type WarpRequest = {
  passes: number
  jades: number
  income: string[]
  strategy: WarpStrategy
  pityCharacter: number
  guaranteedCharacter: boolean
  pityLightCone: number
  guaranteedLightCone: boolean
}

export type WarpMilestoneResult = { warps: number; wins: number }
export type WarpResult = {
  milestoneResults: Record<string, WarpMilestoneResult>
  request: EnrichedWarpRequest
}

export enum WarpType {
  CHARACTER,
  LIGHTCONE,
}

export const DEFAULT_WARP_REQUEST: WarpRequest = {
  passes: 0,
  jades: 0,
  income: [],
  strategy: WarpStrategy.E0,
  pityCharacter: 0,
  guaranteedCharacter: false,
  pityLightCone: 0,
  guaranteedLightCone: false,
}

export type WarpIncomeDefinition = {
  passes: number
  id: string
  version: string
  type: WarpIncomeType
  phase: number
}

type WarpMilestone = {
  warpType: WarpType
  label: string
  pity: number
  guaranteed: boolean
  redistributedCumulative: number[]
  redistributedCumulativeNonPity?: number[]
  warpCap: number
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
  window.store.getState().setWarpRequest(originalRequest)

  const warpResult = simulateWarps(originalRequest)

  window.store.getState().setWarpResult(warpResult)
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
  } = enrichedRequest

  const e0CharacterDistribution = redistributePityCumulative(pityCharacter, characterWarpCap, characterDistribution)
  const e0CharacterDistributionNonPity = redistributePityCumulative(0, characterWarpCap, characterDistribution)
  const s1LightConeDistribution = redistributePityCumulative(pityLightCone, lightConeWarpCap, lightConeDistribution)
  const s1LightConeDistributionNonPity = redistributePityCumulative(0, lightConeWarpCap, lightConeDistribution)
  const milestones: WarpMilestone[] = [
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

  let e = -1
  let s = 0
  for (const milestone of milestones) {
    if (milestone.warpType == WarpType.CHARACTER) e++
    if (milestone.warpType == WarpType.LIGHTCONE) s++
    milestone.label = e == -1 ? `S${s}` : `E${e}S${s}`
  }

  return milestones
}

export type EnrichedWarpRequest = {
  warps: number
  totalPasses: number
  totalJade: number
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
  const totalWarps = Math.floor(totalJade / 160) + totalPasses

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
