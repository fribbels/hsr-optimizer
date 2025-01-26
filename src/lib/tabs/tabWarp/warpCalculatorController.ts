import { SaveState } from 'lib/state/saveState'
import { characterCumulative, characterDistribution, lightConeCumulative, lightConeDistribution } from 'lib/tabs/tabWarp/warpRates'

// 626 to e6 and 960 to e6s5, 952 with 0.78125 on lc

const characterWarpCap = 90
const lightConeWarpCap = 80
const simulations = 100000
const character5050 = 0.5625
const lightCone5050 = 0.78125 // 0.78125 or 0.75

export enum WarpIncome {
  NONE = 'NONE',
  F2P_3_0 = 'F2P_3_0',
  EXPRESS_3_0 = 'EXPRESS_3_0',
  EXPRESS_BP_3_0 = 'EXPRESS_BP_3_0',
  F2P_3_1 = 'F2P_3_1',
  EXPRESS_3_1 = 'EXPRESS_3_1',
  EXPRESS_BP_3_1 = 'EXPRESS_BP_3_1',
}

export const WarpIncomeValuesMapping: Record<WarpIncome, WarpIncomeValues> = {
  [WarpIncome.NONE]: {
    passes: 0,
    jades: 0,
    label: 'None',
  },
  [WarpIncome.F2P_3_0]: {
    passes: 25,
    jades: 13490,
    label: 'v3.0 F2P',
  },
  [WarpIncome.EXPRESS_3_0]: {
    passes: 25,
    jades: 17270,
    label: 'v3.0 Express',
  },
  [WarpIncome.EXPRESS_BP_3_0]: {
    passes: 29,
    jades: 17950,
    label: 'v3.0 Express & BP',
  },
  [WarpIncome.F2P_3_1]: {
    passes: 20,
    jades: 13355,
    label: 'v3.1 F2P',
  },
  [WarpIncome.EXPRESS_3_1]: {
    passes: 20,
    jades: 17135,
    label: 'v3.1 Express',
  },
  [WarpIncome.EXPRESS_BP_3_1]: {
    passes: 24,
    jades: 17815,
    label: 'v3.1 Express & BP',
  },
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

export type WarpRequest = {
  passes: number
  jades: number
  income: WarpIncome
  strategy: WarpStrategy
  pityCharacter: number
  guaranteedCharacter: false
  pityLightCone: number
  guaranteedLightCone: false
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
  income: WarpIncome.NONE,
  strategy: WarpStrategy.E0,
  pityCharacter: 0,
  guaranteedCharacter: false,
  pityLightCone: 0,
  guaranteedLightCone: false,
}

type WarpIncomeValues = {
  passes: number
  jades: number
  label: string
}

type WarpMilestone = {
  warpType: WarpType
  label: string
  pity: number
  guaranteed: boolean
  redistributedCumulative: number[]
  warpCap: number
}

export function simulateWarps(originalRequest: WarpRequest) {
  console.log('simulate Warps', originalRequest)

  window.store.getState().setWarpRequest(originalRequest)

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
        warpCap,
      } = milestone

      const rate = warpType == WarpType.CHARACTER ? character5050 : lightCone5050
      const index = getNextSuccessIndex(redistributedCumulative, warpCap, pity) - pity + 1
      if (Math.random() < rate || guaranteed) {
        count += index
      } else {
        const index2 = getNextSuccessIndex(redistributedCumulative, warpCap, pity) - pity + 1
        count += index + index2
      }

      milestoneResults[label].warps += count
      if (count < request.warps) {
        milestoneResults[label].wins++
      }
    }
  }

  for (const milestone of milestones) {
    milestoneResults[milestone.label].warps /= simulations
    milestoneResults[milestone.label].wins /= simulations
    // console.log(`${milestone.label}: ${milestoneResults[milestone.label].warps}`)
  }

  // for (const milestone of milestones) {
  //   console.log(`${milestone.label}: ${milestoneResults[milestone.label].wins}`)
  // }

  const warpResult: WarpResult = {
    milestoneResults: milestoneResults,
    request: request,
  }

  window.store.getState().setWarpResult(warpResult)
  SaveState.delayedSave()
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
  const s1LightConeDistribution = redistributePityCumulative(pityLightCone, lightConeWarpCap, lightConeDistribution)
  const milestones: WarpMilestone[] = [
    {
      warpType: WarpType.CHARACTER,
      label: 'E0',
      guaranteed: guaranteedCharacter,
      pity: pityCharacter,
      redistributedCumulative: e0CharacterDistribution,
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
    milestone.label = e == -1 ? `S${s}` : `E${e} S${s}`
  }

  return milestones
}

export type EnrichedWarpRequest = {
  warps: number
  totalPasses: number
  totalJade: number
} & WarpRequest

function enrichWarpRequest(request: WarpRequest) {
  const additionalIncome = WarpIncomeValuesMapping[request.income] ?? WarpIncomeValuesMapping[WarpIncome.NONE]
  const totalJade = request.jades + additionalIncome.jades
  const totalPasses = request.passes + additionalIncome.passes
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
