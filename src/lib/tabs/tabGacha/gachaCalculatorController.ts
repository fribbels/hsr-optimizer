import { characterCumulative, characterDistribution, lightConeDistribution } from 'lib/tabs/tabGacha/gachaRates'

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

export enum WarpType {
  CHARACTER,
  LIGHTCONE
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

    // { warpType: WarpType.LIGHTCONE, label: 'S2', guaranteed: false, pity: 0, redistributedCumulative: lightConeCumulative, warpCap: lightConeWarpCap },
    // { warpType: WarpType.LIGHTCONE, label: 'S3', guaranteed: false, pity: 0, redistributedCumulative: lightConeCumulative, warpCap: lightConeWarpCap },
    // { warpType: WarpType.LIGHTCONE, label: 'S4', guaranteed: false, pity: 0, redistributedCumulative: lightConeCumulative, warpCap: lightConeWarpCap },
    // { warpType: WarpType.LIGHTCONE, label: 'S5', guaranteed: false, pity: 0, redistributedCumulative: lightConeCumulative, warpCap: lightConeWarpCap },
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

  return milestones
}

export function simulateWarps() {
  console.clear()
  console.log('simulate Warps')
  let wins = 0
  let counts: Record<string, number> = {}
  const n = 100000

  const milestones: WarpMilestone[] = generateWarpMilestones(
    WarpStrategy.E0,
    0,
    0,
    false,
    false,
  )

  let sum = 0

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

      const rate = warpType == WarpType.CHARACTER ? 0.5625 : 0.78125 // 0.78125
      const index = getNextSuccessIndex(redistributedCumulative, warpCap, pity) + 1
      if (Math.random() < rate) { // 0.5625
        count += index
      } else {
        const index2 = getNextSuccessIndex(redistributedCumulative, warpCap, pity) + 1
        count += index + index2
      }

      if (label == 'S5' && count <= 952) {
        wins++
      }
    }

    sum += count
  }

  console.log(sum / n)
  console.log(wins / n)

  // Constants

  // Adjusted cumulative distribution after 30 pulls
  //
  // const pity: number = 60
  // const redistributedCumulative = redistributePityCumulative(pity, characterWarpCap, characterDistribution)
  // // const redistributedCumulative = redistributePityCumulative(pity, lightConeWarpCap, lightConeDistribution)
  //
  // console.log(redistributedCumulative)
  //
  // for (let i = 0; i < n; i++) {
  //   const index = getNextSuccessIndex(redistributedCumulative, characterWarpCap, pity)
  //
  //   if (counts[index] == null) counts[index] = 0
  //   counts[index]++
  // }
  //
  // let sum = 0
  // for (const [key, value] of Object.entries(counts)) {
  //   console.log(`${key}: ${value / n * 100}%`)
  //   sum += value / n * 100
  // }
  //
  // console.log(counts)
  // console.log(sum)
}

function getNextSuccessIndex(cumulative: number[], warpCap: number, pity: number) {
  const rand = Math.random() * cumulative[warpCap - 1]
  const index = getIndex(rand, cumulative, pity)

  return index
}

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
