import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import {
  precisionRound,
  truncate10ths,
} from 'lib/utils/mathUtils'
import { objectHash } from 'lib/utils/objectUtils'
import { isFlat } from 'lib/utils/statUtils'
import type {
  Relic,
  Stat,
} from 'types/relic'

export function partIsOrnament(part: Parts) {
  return part === Parts.PlanarSphere
    || part === Parts.LinkRope
}

export function partIsRelic(part: Parts) {
  return part === Parts.Head
    || part === Parts.Hands
    || part === Parts.Body
    || part === Parts.Feet
}

export function calculateRelicMainStatValue(mainStatType: string, grade: number, enhance: number): number {
  return precisionRound(
    Constants.MainStatsValues[mainStatType][grade].base
      + Constants.MainStatsValues[mainStatType][grade].increment * enhance,
  )
}

export function indexRelics(relics: Relic[]) {
  relics.forEach((r, idx, arr) => {
    if (r.ageIndex != null) return
    arr[idx] = { ...r, ageIndex: idx === 0 ? 0 : arr[idx - 1].ageIndex! + 1 }
  })
}

// Normalize substat value for comparison: floor flats, round percentages to 1 decimal
function normalizeSubstatValue(stat: string, value: number): number {
  if (isFlat(stat)) {
    return Math.floor(value)
  }
  return precisionRound(truncate10ths(value))
}

export function hashRelic(relic: Relic) {
  const substatValues: number[] = []
  const substatStats: string[] = []

  for (const substat of relic.substats) {
    substatValues.push(normalizeSubstatValue(substat.stat, substat.value))
    substatStats.push(substat.stat)
  }
  const hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    enhance: relic.enhance,
    mainStat: relic.main.stat,
    mainValue: Math.floor(relic.main.value),
    substatValues,
    substatStats,
  }

  return objectHash(hashObject)
}

export function partialHashRelic(relic: Relic) {
  const hashObject = {
    part: relic.part,
    set: relic.set,
    grade: relic.grade,
    mainStat: relic.main.stat,
  }

  return objectHash(hashObject)
}

export function findRelicMatch(relic: Relic, oldRelics: Relic[]) {
  const partialHash = partialHashRelic(relic)
  const partialMatches = oldRelics.filter((r) => partialHashRelic(r) === partialHash)

  // Score every valid candidate and return the best fit. First-match-wins would
  // pick a low-enhance precursor when the already-upgraded twin is also in the
  // store, orphaning the twin and producing a visible duplicate.
  const validCandidates: Array<{ relic: Relic, enhanceDelta: number, substatCountDelta: number }> = []
  for (const partialMatch of partialMatches) {
    if (relic.enhance < partialMatch.enhance) continue
    if (relic.substats.length < partialMatch.substats.length) continue

    let exit = false
    let upgrades = 0
    for (let i = 0; i < partialMatch.substats.length; i++) {
      const matchSubstat = partialMatch.substats[i]
      const newSubstat = relic.substats.find((x) => x.stat === matchSubstat.stat)

      if (!newSubstat) {
        exit = true
        break
      }
      const cmp = compareSameTypeSubstat(matchSubstat, newSubstat)
      if (cmp === -1) {
        exit = true
        break
      }

      // When values are equal (cmp === 0), roll decomposition differences are
      // artifacts of the grading algorithm — not evidence of a different relic.
      // Only enforce the roll-bucket superset check during upgrades (cmp === 1),
      // where initial-roll quality is fixed at drop and later tiers only ADD rolls.
      if (cmp === 1 && matchSubstat.rolls && newSubstat.rolls) {
        if (
          newSubstat.rolls.low < matchSubstat.rolls.low
          || newSubstat.rolls.mid < matchSubstat.rolls.mid
          || newSubstat.rolls.high < matchSubstat.rolls.high
        ) {
          exit = true
          break
        }
      }

      if (cmp === 1) upgrades++
    }

    if (exit) continue

    const possibleUpgrades = Math.round((Math.floor(relic.enhance / 3) * 3 - Math.floor(partialMatch.enhance / 3) * 3) / 3)
    if (upgrades > possibleUpgrades) continue

    const enhanceDelta = relic.enhance - partialMatch.enhance
    const substatCountDelta = relic.substats.length - partialMatch.substats.length
    // Exact match on both dimensions is provably optimal — no need to score the rest.
    if (enhanceDelta === 0 && substatCountDelta === 0) return partialMatch
    validCandidates.push({ relic: partialMatch, enhanceDelta, substatCountDelta })
  }

  if (validCandidates.length === 0) return undefined

  // Smallest enhance gap, then smallest substat-count gap.
  validCandidates.sort((a, b) =>
    a.enhanceDelta - b.enhanceDelta
    || a.substatCountDelta - b.substatCountDelta
  )
  return validCandidates[0].relic
}

// -1: old > new, 0: old === new, 1: new > old
export function compareSameTypeSubstat(oldSubstat: Stat, newSubstat: Stat) {
  const oldValue = normalizeSubstatValue(oldSubstat.stat, oldSubstat.value)
  const newValue = normalizeSubstatValue(newSubstat.stat, newSubstat.value)

  if (oldValue === newValue) return 0
  if (oldValue < newValue) return 1
  return -1
}
