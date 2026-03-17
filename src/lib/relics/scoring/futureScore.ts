import i18next from 'i18next'
import {
  Parts,
  SubStats,
  SubStatValues,
} from 'lib/constants/constants'
import {
  GRADE_CONFIG,
  MIN_ROLL_VALUE,
  PERCENT_TO_SCORE,
  ValidGrade,
} from 'lib/relics/scoring/scoringConstants'
import type { FutureScoringResult, ScorerMetadata } from 'lib/relics/scoring/types'
import {
  arrayToMap,
  stringArrayToMap,
} from 'lib/utils/arrayUtils'
import type { Relic, RelicSubstatMetadata } from 'types/relic'

export function computeFutureScores(
  relic: Relic,
  meta: ScorerMetadata,
  idealScore: number,
  withMeta: boolean,
): FutureScoringResult {
  const gradeConfig = GRADE_CONFIG[relic.grade as ValidGrade]
  const config = gradeConfig ?? GRADE_CONFIG[5]
  const grade = relic.grade as ValidGrade
  const contributions = meta.contributions
  const part = relic.part

  // Inline mainStatWeight/deduction/bonus — avoids 6 cross-module function calls per relic
  const isSelectablePart = part === Parts.Body || part === Parts.Feet || part === Parts.PlanarSphere || part === Parts.LinkRope
  let deduction = 0
  let bonus = 0
  if (isSelectablePart) {
    const w = meta.parts[part].includes(relic.main.stat) ? 1 : (meta.stats[relic.main.stat] ?? 0)
    deduction = (w - 1) * config.maxMainstat
    bonus = MIN_ROLL_VALUE * w
  }
  const normFactor = idealScore === Infinity ? 0 : 100 * PERCENT_TO_SCORE / idealScore

  const allSubstats: RelicSubstatMetadata[] = relic.previewSubstats.length > 0
    ? relic.substats.concat(relic.previewSubstats)
    : relic.substats
  const mainStat = relic.main.stat
  const s0 = allSubstats[0]?.stat
  const s1 = allSubstats[1]?.stat
  const s2 = allSubstats[2]?.stat
  const s3 = allSubstats[3]?.stat
  const availableSubstats = meta.sortedSubstats.filter((x) => {
    const s = x[0]
    return s !== mainStat && s !== s0 && s !== s1 && s !== s2 && s !== s3
  })
  const remainingRolls = Math.ceil((config.maxEnhance - relic.enhance) / 3) - (4 - relic.substats.length)

  // ── Single-pass over existing substats: compute current, best, avg, worst raw scores ──
  // Pre-compute grade-specific mid roll scores (grade 5 uses cached metadata, others compute on the fly)
  const midRolls = grade === 5
    ? meta.midRollScores
    : (() => {
      const m = {} as Record<SubStats, number>
      for (const [stat] of meta.sortedSubstats) m[stat] = contributions[stat] * SubStatValues[stat][grade].mid
      return m
    })()

  let currentRaw = 0
  let bestRaw = 0
  let avgRaw = 0
  let worstRaw = 0
  let maxWeight = -Infinity
  let minWeight = Infinity
  const defaultStat = allSubstats[0]?.stat ?? meta.sortedSubstats[0][0]
  let bestUpgradeStat: SubStats = defaultStat
  let worstUpgradeStat: SubStats = defaultStat
  const rollMidFactor = remainingRolls / 4
  const subsLen = relic.substats.length
  let addedRollsSum = 0

  for (let i = 0; i < allSubstats.length; i++) {
    const sub = allSubstats[i]
    const c = contributions[sub.stat]
    const vc = sub.value * c
    if (i < subsLen) currentRaw += vc
    bestRaw += vc
    worstRaw += vc
    avgRaw += vc + rollMidFactor * midRolls[sub.stat]
    addedRollsSum += sub.addedRolls ?? 0
    const w = meta.stats[sub.stat]
    if (w > maxWeight || maxWeight === -Infinity) {
      maxWeight = w
      bestUpgradeStat = sub.stat
    }
    if (w < minWeight) {
      minWeight = w
      worstUpgradeStat = sub.stat
    }
  }

  const current = Math.max(0, (currentRaw + deduction) * normFactor + bonus)

  // ── Best: fill missing substats from top available ──
  for (let i = allSubstats.length; i < 4; i++) {
    const stat = availableSubstats[i - allSubstats.length][0]
    bestRaw += meta.highRollScores[stat]
    const w = meta.stats[stat]
    if (w > maxWeight) {
      maxWeight = w
      bestUpgradeStat = stat
    }
  }
  bestRaw += remainingRolls * SubStatValues[bestUpgradeStat][grade].high * contributions[bestUpgradeStat]
  const best = Math.max(0, (bestRaw + deduction) * normFactor + bonus)

  // ── Average: fill missing substats ──
  if (allSubstats.length < 4) {
    let avgNewContrib = 0
    for (const [stat] of availableSubstats) {
      avgNewContrib += midRolls[stat]
    }
    avgNewContrib /= availableSubstats.length
    avgRaw += (4 - allSubstats.length) * avgNewContrib * (1 + rollMidFactor)
  }
  const average = Math.max(0, (avgRaw + deduction) * normFactor + bonus)

  // ── Worst: fill missing substats from bottom available ──
  const availLen = availableSubstats.length
  for (let i = allSubstats.length; i < 4; i++) {
    const stat = availableSubstats[availLen - 1 - (i - allSubstats.length)][0]
    const lowRoll = SubStatValues[stat][5].low
    worstRaw += lowRoll * contributions[stat]
    const w = meta.stats[stat]
    if (w < minWeight) {
      minWeight = w
      worstUpgradeStat = stat
    }
  }
  worstRaw += remainingRolls * SubStatValues[worstUpgradeStat][grade].low * contributions[worstUpgradeStat]
  const worst = Math.max(0, (worstRaw + deduction) * normFactor + bonus)

  // ── Levelup metadata ──
  let levelupMetadata: {
    bestAddedStats: SubStats[]
    bestUpgradedStats: SubStats[]
  } | undefined = undefined

  if (withMeta) {
    const bestAddedStats: SubStats[] = []
    if (allSubstats.length < 4 && availableSubstats.length > 0) {
      const topWeight = availableSubstats[0][1]
      for (const [stat, weight] of availableSubstats) {
        if (weight < topWeight) break
        bestAddedStats.push(stat)
      }
    }

    const candidateSubstats: [SubStats, number][] = meta.sortedSubstats.filter(
      (x) => relic.main.stat !== x[0],
    )
    const bestUpgradedStats: SubStats[] = []

    const validUpgrades: Record<SubStats, object | true | undefined> = {
      ...arrayToMap(allSubstats, 'stat'),
      ...stringArrayToMap(bestAddedStats),
    } as Record<SubStats, object | true | undefined>

    const upgradeCandidates: [SubStats, number][] = candidateSubstats.filter(
      (candidateSubstats) => validUpgrades[candidateSubstats[0]],
    )
    if (upgradeCandidates.length > 0) {
      const bestWeight = upgradeCandidates[0][1]
      for (const [stat, weight] of upgradeCandidates) {
        if (validUpgrades[stat] && weight >= bestWeight) {
          bestUpgradedStats.push(stat)
        }
      }
    }

    bestAddedStats.forEach((s, i) => bestAddedStats[i] = i18next.t(`common:Stats.${s}`) as SubStats)
    bestUpgradedStats.forEach((s, i) => bestUpgradedStats[i] = i18next.t(`common:Stats.${s}`) as SubStats)

    levelupMetadata = {
      bestAddedStats: bestAddedStats,
      bestUpgradedStats: bestUpgradedStats,
    }
  }

  // ── Reroll scores ──
  let rerollAvg = 0
  let blockerAvg = 0
  // Reuse worstUpgradeStat from main loop as blockedStat (lowest weight substat)
  let blockedStat: SubStats | undefined

  if (relic.grade === 5 && allSubstats.length == 4) {
    const totalRolls = Math.min(addedRollsSum, 5)
    blockedStat = worstUpgradeStat

    for (const substat of allSubstats) {
      const value = meta.midRollScores[substat.stat]

      rerollAvg += value * (1 + totalRolls / 4)

      if (substat.stat === blockedStat) {
        blockerAvg += value
      } else {
        blockerAvg += value * (1 + totalRolls / 3)
      }
    }

    rerollAvg = Math.min(rerollAvg, idealScore)
    rerollAvg = (rerollAvg + deduction) * normFactor + bonus

    blockerAvg = Math.min(blockerAvg, idealScore)
    blockerAvg = (blockerAvg + deduction) * normFactor + bonus
  }

  return {
    current,
    best,
    average,
    worst,
    rerollAvg,
    blockerAvg,
    meta: levelupMetadata
      ? { bestAddedStats: levelupMetadata.bestAddedStats, bestUpgradedStats: levelupMetadata.bestUpgradedStats, blockedStat }
      : { blockedStat },
  }
}
