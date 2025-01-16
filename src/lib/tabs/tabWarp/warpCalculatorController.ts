import { characterCumulative, characterDistribution, lightConeCumulative, lightConeDistribution } from 'lib/tabs/tabWarp/warpRates'

const characterWarpCap = 90
const lightConeWarpCap = 80

// 626 to e6 and 960 to e6s5, 952 with 0.78125 on lc

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
  passes: number,
  jades: number,
  income: WarpIncome,
  strategy: WarpStrategy,
  pityCharacter: number,
  guaranteedCharacter: false,
  pityLightCone: number,
  guaranteedLightCone: false
}

export type WarpMilestoneResult = { warps: number, wins: number }
export type WarpResult = {
  milestoneResults: Record<string, WarpMilestoneResult>
}

export enum WarpType {
  CHARACTER,
  LIGHTCONE
}

export enum WarpIncome {
  F2P,
  EXPRESS,
  EXPRESSBP,
}

type WarpMilestone = {
  warpType: WarpType
  label: string
  pity: number
  guaranteed: boolean
  redistributedCumulative: number[]
  warpCap: number
}

export function generateWarpMilestones(
  strategy: WarpStrategy,
  characterPity: number,
  lightConePity: number,
  characterGuaranteed: boolean,
  lightConeGuaranteed: boolean,
) {
  const e0CharacterDistribution = redistributePityCumulative(characterPity, characterWarpCap, characterDistribution)
  const s1LightConeDistribution = redistributePityCumulative(lightConePity, lightConeWarpCap, lightConeDistribution)
  const milestones: WarpMilestone[] = [
    {
      warpType: WarpType.CHARACTER,
      label: 'E0',
      guaranteed: characterGuaranteed,
      pity: characterPity,
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
    guaranteed: lightConeGuaranteed,
    pity: lightConePity,
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
    milestone.label = e == -1 ? `S${s}` : `E${e}S${s}`
  }

  return milestones
}

export function simulateWarps(request: WarpRequest) {
  console.clear()
  console.log('simulate Warps', request)
  const n = 100000

  window.store.getState().setWarpRequest(request)

  const milestones: WarpMilestone[] = generateWarpMilestones(
    WarpStrategy.E0,
    0,
    0,
    false,
    false,
  )

  const milestoneResults: Record<string, WarpMilestoneResult> = Object.fromEntries(
    milestones.map(({ label }) => [label, { warps: 0, wins: 0 }]),
  )

  for (let i = 0; i < n; i++) {
    let count = 0

    for (const milestone of milestones) {
      let {
        warpType,
        label,
        pity,
        guaranteed,
        redistributedCumulative,
        warpCap,
      } = milestone

      const rate = warpType == WarpType.CHARACTER ? 0.5625 : 0.75 // 0.78125
      const index = getNextSuccessIndex(redistributedCumulative, warpCap, pity) - pity + 1
      if (Math.random() < rate || guaranteed) {
        count += index
      } else {
        const index2 = getNextSuccessIndex(redistributedCumulative, warpCap, pity) - pity + 1
        count += index + index2
      }

      milestoneResults[label].warps += count
      if (count < 960) {
        milestoneResults[label].wins++
      }
    }
  }

  for (const milestone of milestones) {
    milestoneResults[milestone.label].warps /= n
    milestoneResults[milestone.label].wins /= n
    console.log(`${milestone.label}: ${milestoneResults[milestone.label].warps}`)
  }

  console.log('----')

  for (const milestone of milestones) {
    console.log(`${milestone.label}: ${milestoneResults[milestone.label].wins}`)
  }

  const warpResult: WarpResult = {
    milestoneResults: milestoneResults,
  }

  window.store.getState().setWarpResult(warpResult)
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
  let diff = 1 - redistributedCumulative[warpCap - 1]
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
