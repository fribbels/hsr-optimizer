import i18next from 'i18next'
import {
  Parts,
  SubStatValues,
} from 'lib/constants/constants'
import type { SubStats } from 'lib/constants/constants'
import {
  GRADE_CONFIG,
  MIN_ROLL_VALUE,
  PERCENT_TO_SCORE,
} from 'lib/relics/scoring/scoringConstants'
import type { ValidGrade } from 'lib/relics/scoring/scoringConstants'
import type {
  FutureScoringResult,
  ScorerMetadata,
} from 'lib/relics/scoring/types'
import {
  arrayToMap,
  stringArrayToMap,
} from 'lib/utils/arrayUtils'
import type {
  Relic,
  RelicSubstatMetadata,
} from 'types/relic'

const EMPTY_FUTURE_META: FutureScoringResult['meta'] = {}

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

  if (allSubstats.length === 0) {
    return { current: 0, best: 0, average: 0, worst: 0, rerollAvg: 0, blockerAvg: 0, meta: EMPTY_FUTURE_META }
  }

  const mainStat = relic.main.stat
  const needsFill = allSubstats.length < 4
  // Only compute availableSubstats when needed — skips 238K filter+array allocations for 4-substat relics
  let availableSubstats: [SubStats, number][]
  if (needsFill) {
    const s0 = allSubstats[0]?.stat
    const s1 = allSubstats[1]?.stat
    const s2 = allSubstats[2]?.stat
    availableSubstats = meta.sortedSubstats.filter((x) => {
      const s = x[0]
      return s !== mainStat && s !== s0 && s !== s1 && s !== s2
    })
  } else {
    availableSubstats = undefined! // Safe: all access sites are guarded by needsFill
  }
  const remainingRolls = Math.ceil((config.maxEnhance - relic.enhance) / 3) - (4 - relic.substats.length)

  // ── Single-pass over existing substats: compute current, best, avg, worst raw scores ──
  // Pre-compute grade-specific mid roll scores (grade 5 uses cached metadata, others compute on the fly)
  let midRolls: Record<SubStats, number>
  if (grade === 5) {
    midRolls = meta.midRollScores
  } else {
    midRolls = {} as Record<SubStats, number>
    for (const [stat] of meta.sortedSubstats) {
      midRolls[stat] = contributions[stat] * SubStatValues[stat][grade].mid
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Single-pass accumulation: all scenario raw scores + reroll data in one loop.
  // Eliminates separate loops for best/worst/avg/reroll.
  // ────────────────────────────────────────────────────────────────────────────

  const rollMidFactor = remainingRolls / 4
  const subsLen = relic.substats.length

  // Initialize from first substat (avoids -Infinity sentinel checks per iteration)
  const sub0 = allSubstats[0]
  const stat0 = sub0.stat
  const c0 = contributions[stat0]
  const vc0 = sub0.value * c0
  const mr0 = midRolls[stat0]

  let baseRaw = vc0 // shared base for best + worst (forked after loop)
  let currentRaw = vc0 // only includes relic.substats (not preview)
  let avgRaw = vc0 + rollMidFactor * mr0 // includes mid-roll upgrade projection
  let addedRollsSum = sub0.addedRolls ?? 0 // for reroll totalRolls
  let midRollSum = mr0 // for closed-form reroll (eliminates reroll loop)
  let maxWeight = meta.stats[stat0] // tracks best upgrade stat
  let minWeight = maxWeight // tracks worst upgrade stat (= blocked stat for reroll)
  let bestUpgradeStat: SubStats = stat0
  let worstUpgradeStat: SubStats = stat0

  for (let i = 1; i < allSubstats.length; i++) {
    const sub = allSubstats[i]
    const stat = sub.stat
    const c = contributions[stat]
    const vc = sub.value * c
    const mr = midRolls[stat]

    // ── Raw score accumulation ──
    if (i < subsLen) currentRaw += vc
    baseRaw += vc
    avgRaw += vc + rollMidFactor * mr

    // ── Reroll data (accumulated here, used in closed-form below) ──
    addedRollsSum += sub.addedRolls ?? 0
    midRollSum += mr

    // ── Best/worst upgrade stat tracking ──
    const w = meta.stats[stat]
    if (w > maxWeight) {
      maxWeight = w
      bestUpgradeStat = stat
    }
    if (w < minWeight) {
      minWeight = w
      worstUpgradeStat = stat
    }
  }

  let bestRaw = baseRaw
  let worstRaw = baseRaw

  const current = Math.max(0, (currentRaw + deduction) * normFactor + bonus)

  // ── Fill missing substats (only for relics with < 4 substats) ──
  if (needsFill) {
    const availLen = availableSubstats.length
    for (let i = allSubstats.length; i < 4; i++) {
      const idx = i - allSubstats.length
      // Best: top available
      const bestStat = availableSubstats[idx][0]
      bestRaw += meta.highRollScores[bestStat]
      const bw = meta.stats[bestStat]
      if (bw > maxWeight) {
        maxWeight = bw
        bestUpgradeStat = bestStat
      }
      // Worst: bottom available
      const worstStat = availableSubstats[availLen - 1 - idx][0]
      worstRaw += meta.lowRollScores[worstStat]
      const ww = meta.stats[worstStat]
      if (ww < minWeight) {
        minWeight = ww
        worstUpgradeStat = worstStat
      }
    }
    // Average: mean mid-roll contribution of available stats
    let avgNewContrib = 0
    for (const [stat] of availableSubstats) avgNewContrib += midRolls[stat]
    avgNewContrib /= availLen
    avgRaw += (4 - allSubstats.length) * avgNewContrib * (1 + rollMidFactor)
  }

  bestRaw += remainingRolls * SubStatValues[bestUpgradeStat][grade].high * contributions[bestUpgradeStat]
  const best = Math.max(0, (bestRaw + deduction) * normFactor + bonus)
  const average = Math.max(0, (avgRaw + deduction) * normFactor + bonus)
  worstRaw += remainingRolls * (grade === 5
    ? meta.lowRollScores[worstUpgradeStat]
    : SubStatValues[worstUpgradeStat][grade].low * contributions[worstUpgradeStat])
  const worst = Math.max(0, (worstRaw + deduction) * normFactor + bonus)

  // ── Levelup metadata ──
  let levelupMetadata: {
    bestAddedStats: SubStats[],
    bestUpgradedStats: SubStats[],
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

  // ────────────────────────────────────────────────────────────────────────────
  // Reroll scores — closed-form from midRollSum accumulated in the main loop.
  // No separate iteration needed.
  // ────────────────────────────────────────────────────────────────────────────

  let rerollAvg = 0
  let blockerAvg = 0
  let blockedStat: SubStats | undefined

  if (relic.grade === 5 && allSubstats.length === 4) {
    const totalRolls = Math.min(addedRollsSum, 5)
    blockedStat = worstUpgradeStat

    // rerollAvg  = Σ(midRoll_i × (1 + totalRolls/4)) = midRollSum × (1 + totalRolls/4)
    // blockerAvg = blockedMid × 1 + Σ_{non-blocked}(midRoll_i × (1 + totalRolls/3))
    //            = blockedMid + (midRollSum - blockedMid) × (1 + totalRolls/3)
    const blockedMid = meta.midRollScores[blockedStat]

    rerollAvg = Math.min(midRollSum * (1 + totalRolls / 4), idealScore)
    rerollAvg = (rerollAvg + deduction) * normFactor + bonus

    blockerAvg = Math.min(blockedMid + (midRollSum - blockedMid) * (1 + totalRolls / 3), idealScore)
    blockerAvg = (blockerAvg + deduction) * normFactor + bonus
  }

  return {
    current,
    best,
    average,
    worst,
    rerollAvg,
    blockerAvg,
    meta: levelupMetadata ?? EMPTY_FUTURE_META,
  }
}
