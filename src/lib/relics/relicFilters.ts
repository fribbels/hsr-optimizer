import {
  Constants,
  Parts,
  RelicSetFilterOptions,
} from 'lib/constants/constants'
import type { StatsValues } from 'lib/constants/constants'
import type {
  RelicsByPart,
  SingleRelicByPart,
} from 'lib/gpu/webgpuTypes'
import { BasicStatToKey } from 'lib/optimization/basicStatsArray'
import { calculateRelicMainStatValue } from 'lib/relics/relicUtils'
import {
  FLAT_STAT_SCALING,
  STAT_NORMALIZATION,
} from 'lib/relics/scoring/scoringConstants'
import { weightedSubstatScore } from 'lib/relics/scoring/substatScoring'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  SetsOrnaments,
  SetsOrnamentsNames,
  SetsRelics,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import {
  getCharacterById,
  getCharacters,
} from 'lib/stores/character/characterStore'
import { getRelics } from 'lib/stores/relic/relicStore'
import {
  arrayOfValue,
  arrayOfZeroes,
} from 'lib/utils/arrayUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'
import type { Form } from 'types/form'
import type { Relic } from 'types/relic'

export type PartCounts = Record<Parts, number>
export type PartCountsBySet = Record<Parts, number[]>

const RELIC_PARTS: ReadonlySet<string> = new Set([Parts.Head, Parts.Hands, Parts.Body, Parts.Feet])

function zeroCounts(): PartCounts {
  return { Head: 0, Hands: 0, Body: 0, Feet: 0, PlanarSphere: 0, LinkRope: 0 }
}

export function zeroCountsBySet(): PartCountsBySet {
  const relicLen = SetsRelicsNames.length
  const ornLen = SetsOrnamentsNames.length
  return {
    Head: arrayOfZeroes(relicLen),
    Hands: arrayOfZeroes(relicLen),
    Body: arrayOfZeroes(relicLen),
    Feet: arrayOfZeroes(relicLen),
    PlanarSphere: arrayOfZeroes(ornLen),
    LinkRope: arrayOfZeroes(ornLen),
  }
}

// Returns true if at least one positively-weighted substat can appear on this relic
// (i.e. is not blocked by the relic's main stat). When false, the weight filter
// is impossible to satisfy and the relic should be exempt.
function hasAchievableWeightedSubstat(weights: Record<string, number>, mainStat: string): boolean {
  for (const stat in weights) {
    if (stat === 'minWeightedRolls') continue
    if (weights[stat] > 0 && stat !== mainStat) return true
  }
  return false
}

function computeWeightScore(relic: Relic, weights: Record<string, number>, upgradeLevel: number): number {
  let score = weightedSubstatScore(relic.substats, weights as Record<StatsValues, number>)
  if (upgradeLevel) {
    for (let i = 0; i < relic.previewSubstats.length; i++) {
      if (relic.enhance + 3 * i >= upgradeLevel) break
      const sub = relic.previewSubstats[i]
      score += (sub.value || 0) * (weights[sub.stat] || 0) * (STAT_NORMALIZATION[sub.stat] || 0)
    }
  }
  return score
}

export const RelicFilters = {
  // Count-only variant of getFilteredRelics: single pass, no clone, no mutation.
  // countsBySet buckets filtered relics by slot and set index, for combinatorial
  // permutation counting that respects set-filter constraints (2pc, 4pc, 2+2).
  getFilteredRelicCounts: (request: Form): { counts: PartCounts, preCounts: PartCounts, countsBySet: PartCountsBySet } => {
    const allRelics = getRelics()
    const characters = getCharacters()
    const selfId = request.characterId || '99999999'

    // Consolidate equipped/rank/exclude into one blacklist
    const blacklist = new Set<string>()
    const excludeSet = request.exclude?.length ? new Set(request.exclude) : null

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i]
      if (char.id === selfId) continue

      const excluded = !request.includeEquippedRelics
        || (request.rankFilter && i < request.rank)
        || (excludeSet != null && excludeSet.has(char.id))
      if (!excluded) continue

      for (const id of Object.values(char.equipped)) {
        if (id != null) blacklist.add(id)
      }
    }

    // Set filter lookups
    let relicSetsAllowed: number[] | null = null
    if (request.relicSets?.length) {
      relicSetsAllowed = arrayOfZeroes(Object.values(SetsRelics).length)
      for (const rs of request.relicSets) {
        if (rs[0] === RelicSetFilterOptions.relic4Piece && rs.length === 2) {
          relicSetsAllowed[RelicSetToIndex[rs[1]]] = 1
        } else if (rs[0] === RelicSetFilterOptions.relic2PlusAny) {
          relicSetsAllowed = arrayOfValue(Object.values(SetsRelics).length, 1)
        } else if (rs[0] === RelicSetFilterOptions.relic2Plus2Any) {
          relicSetsAllowed = arrayOfValue(Object.values(SetsRelics).length, 1)
        } else if (rs[0] === RelicSetFilterOptions.relic2Plus2Piece && rs.length === 3) {
          relicSetsAllowed[RelicSetToIndex[rs[1]]] = 1
          relicSetsAllowed[RelicSetToIndex[rs[2]]] = 1
        }
      }
    }

    let ornamentSetsAllowed: number[] | null = null
    if (request.ornamentSets?.length) {
      ornamentSetsAllowed = arrayOfZeroes(Object.values(SetsOrnaments).length)
      for (const os of request.ornamentSets) {
        ornamentSetsAllowed[OrnamentSetToIndex[os]] = 1
      }
    }

    // Weight score thresholds
    const weights: Record<string, number> = { ...request.weights }
    weights[Constants.Stats.ATK] = (weights[Constants.Stats.ATK_P] || 0) * FLAT_STAT_SCALING.ATK
    weights[Constants.Stats.DEF] = (weights[Constants.Stats.DEF_P] || 0) * FLAT_STAT_SCALING.DEF
    weights[Constants.Stats.HP] = (weights[Constants.Stats.HP_P] || 0) * FLAT_STAT_SCALING.HP

    const rollThreshold = (weights.minWeightedRolls ?? 0) * 6.48 * 0.8

    // Main stat filters (Head/Hands have no main stat constraints)
    const mainFilters: Partial<Record<Parts, string[]>> = {
      [Parts.Body]: request.mainBody,
      [Parts.Feet]: request.mainFeet,
      [Parts.PlanarSphere]: request.mainPlanarSphere,
      [Parts.LinkRope]: request.mainLinkRope,
    }

    // keepCurrentRelics locks specific parts to one relic
    const lockedParts: Partial<Record<Parts, string>> = {}
    if (request.keepCurrentRelics) {
      const equipped = getCharacterById(request.characterId)?.equipped
      if (equipped) {
        for (const part of Object.values(Parts)) {
          if (equipped[part]) lockedParts[part] = equipped[part]
        }
      }
    }

    // Single pass
    const preCounts = zeroCounts()
    const counts = zeroCounts()
    const countsBySet = zeroCountsBySet()
    const lockedFound: Partial<Record<Parts, boolean>> = {}
    const lockedRelicSetIdx: Partial<Record<Parts, number>> = {}

    for (const relic of allRelics) {
      const part = relic.part as Parts

      if (relic.grade && relic.grade < request.grade) continue
      if (relic.enhance < request.enhance) continue
      if (blacklist.has(relic.id)) continue

      preCounts[part]++

      const mainFilter = mainFilters[part]
      if (mainFilter?.length && !mainFilter.includes(relic.main.stat)) continue

      const isRelic = RELIC_PARTS.has(part)
      const setIdx = isRelic
        ? RelicSetToIndex[relic.set as SetsRelics]
        : OrnamentSetToIndex[relic.set as SetsOrnaments]
      if (isRelic && relicSetsAllowed && relicSetsAllowed[setIdx] !== 1) continue
      if (!isRelic && ornamentSetsAllowed && ornamentSetsAllowed[setIdx] !== 1) continue

      if (hasAchievableWeightedSubstat(weights, relic.main.stat) && computeWeightScore(relic, weights, request.mainStatUpscaleLevel) < rollThreshold) continue

      if (lockedParts[part]) {
        if (relic.id === lockedParts[part]) {
          lockedFound[part] = true
          lockedRelicSetIdx[part] = setIdx
        }
        continue
      }

      counts[part]++
      countsBySet[part][setIdx]++
    }

    // Resolve locked parts: count is 0 or 1; the single relic contributes to its set bucket
    for (const part of Object.values(Parts)) {
      if (!lockedParts[part]) continue
      counts[part] = lockedFound[part] ? 1 : 0
      if (lockedFound[part]) {
        countsBySet[part][lockedRelicSetIdx[part]!] = 1
      }
    }

    return { counts, preCounts, countsBySet }
  },

  calculateWeightScore: (request: Form, relics: Relic[]) => {
    const weights = request.weights || {}

    weights[Constants.Stats.ATK] = (weights[Constants.Stats.ATK_P] || 0) * FLAT_STAT_SCALING.ATK
    weights[Constants.Stats.DEF] = (weights[Constants.Stats.DEF_P] || 0) * FLAT_STAT_SCALING.DEF
    weights[Constants.Stats.HP] = (weights[Constants.Stats.HP_P] || 0) * FLAT_STAT_SCALING.HP

    for (const weight of Object.keys(weights) as Array<keyof typeof weights>) {
      if (!weights[weight]) weights[weight] = 0
    }

    for (const relic of relics) {
      relic.weightScore = weightedSubstatScore(relic.substats, weights as Record<StatsValues, number>)
    }

    return relics
  },

  applyTopFilter: (request: Form, relics: RelicsByPart) => {
    const weights = request.weights || {}
    const minRolls = (weights.minWeightedRolls ?? 0) * 6.48 * 0.8

    for (const part of Object.values(Constants.Parts)) {
      const partition: Relic[] = relics[part]
      relics[part] = partition.filter((relic) => !hasAchievableWeightedSubstat(weights, relic.main.stat) || relic.weightScore >= minRolls)
    }

    return relics
  },

  applyRankFilter: (request: Form, relics: Relic[]) => {
    if (!request.rankFilter) return relics

    const characters = getCharacters()
    const characterId = request.characterId
    const higherRankedRelics: Record<string, boolean> = {}
    for (let i = 0; i < characters.length; i++) {
      const rankedCharacter = characters[i]
      if (rankedCharacter.id == characterId) {
        continue
      }
      if (i >= request.rank) {
        break
      }

      Object.values(rankedCharacter.equipped)
        .filter((relicId) => relicId != null)
        .forEach((relicId) => higherRankedRelics[relicId] = true)
    }

    return relics.filter((x) => !higherRankedRelics[x.id])
  },

  applyExcludeFilter: (request: Form, relics: Relic[]) => {
    if (!request.exclude) return relics

    const characters = getCharacters()
    const excludedRelics: Record<string, boolean> = {}
    for (const character of characters) {
      if (request.exclude.includes(character.id) && character.id != request.characterId) {
        Object.values(character.equipped)
          .filter((relicId) => relicId != null)
          .forEach((relicId) => excludedRelics[relicId] = true)
      }
    }

    return relics.filter((x) => !excludedRelics[x.id])
  },

  applyMainFilter: (request: Form, relics: Relic[]) => {
    const out: Relic[] = []
    out.push(...relics.filter((x) => x.part == Constants.Parts.Head))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Hands))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Body).filter((x) => request.mainBody.length == 0 || request.mainBody.includes(x.main.stat)))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Feet).filter((x) => request.mainFeet.length == 0 || request.mainFeet.includes(x.main.stat)))
    out.push(
      ...relics.filter((x) => x.part == Constants.Parts.PlanarSphere).filter((x) =>
        request.mainPlanarSphere.length == 0 || request.mainPlanarSphere.includes(x.main.stat)
      ),
    )
    out.push(
      ...relics.filter((x) => x.part == Constants.Parts.LinkRope).filter((x) => request.mainLinkRope.length == 0 || request.mainLinkRope.includes(x.main.stat)),
    )

    return out
  },

  applyEnhanceFilter: (request: Form, relics: Relic[]) => {
    return relics.filter((x) => x.enhance >= request.enhance)
  },

  applyEquippedFilter: (request: Form, relics: Relic[]) => {
    if (request.includeEquippedRelics) return relics

    const characterId = request.characterId || '99999999'
    // TODO: refactor after https://github.com/fribbels/hsr-optimizer/issues/56 is completed
    let blacklist: string[] = []
    getCharacters().forEach((char) => {
      if (char.id == characterId) return
      const equipped: string[] = Object.values(char.equipped).filter((x) => x != undefined)
      blacklist = blacklist.concat(equipped)
    })
    return relics.filter((x) => !blacklist.includes(x.id))
  },

  applyGradeFilter: (request: Form, relics: Relic[]) => {
    return relics.filter((x) => x.grade ? x.grade >= request.grade : true)
  },

  applySetFilter: (request: Form, relics: Relic[]) => {
    function relicFilter(request: Form, relics: Relic[]) {
      if (!request.relicSets || request.relicSets.length == 0) {
        return relics
      }
      let allowedSets = arrayOfZeroes(Object.values(SetsRelics).length)

      for (const relicSet of request.relicSets) {
        if (relicSet[0] == RelicSetFilterOptions.relic4Piece) {
          if (relicSet.length == 2) {
            const index = RelicSetToIndex[relicSet[1]]
            allowedSets[index] = 1
          }
        }

        if (relicSet[0] == RelicSetFilterOptions.relic2PlusAny) {
          allowedSets = arrayOfValue(Object.values(SetsRelics).length, 1)
        }

        if (relicSet[0] == RelicSetFilterOptions.relic2Plus2Any) {
          allowedSets = arrayOfValue(Object.values(SetsRelics).length, 1)
        }

        if (relicSet[0] == RelicSetFilterOptions.relic2Plus2Piece) {
          if (relicSet.length == 3) {
            const index1 = RelicSetToIndex[relicSet[1]]
            allowedSets[index1] = 1

            const index2 = RelicSetToIndex[relicSet[2]]
            allowedSets[index2] = 1
          }
        }
      }

      return relics.filter((relic) => {
        if (
          relic.part == Constants.Parts.Head
          || relic.part == Constants.Parts.Hands
          || relic.part == Constants.Parts.Body
          || relic.part == Constants.Parts.Feet
        ) {
          return allowedSets[RelicSetToIndex[relic.set as SetsRelics]] == 1
        } else {
          return true
        }
      })
    }

    function ornamentFilter(request: Form, relics: Relic[]) {
      if (!request.ornamentSets || request.ornamentSets.length == 0) {
        return relics
      }
      const allowedSets = arrayOfZeroes(Object.values(SetsOrnaments).length)

      for (const ornamentSet of request.ornamentSets) {
        const index = OrnamentSetToIndex[ornamentSet]
        allowedSets[index] = 1
      }

      return relics.filter((relic: Relic) => {
        if (
          relic.part == Constants.Parts.PlanarSphere
          || relic.part == Constants.Parts.LinkRope
        ) {
          return allowedSets[OrnamentSetToIndex[relic.set as SetsOrnaments]] == 1
        } else {
          return true
        }
      })
    }

    return ornamentFilter(request, relicFilter(request, relics))
  },

  applyCurrentFilter: (request: Form, relics: RelicsByPart) => {
    if (!request.keepCurrentRelics) return relics

    const character = getCharacterById(request.characterId)
    if (!character) {
      return relics
    }

    function matchingRelic(part: Parts) {
      const partition: Relic[] = relics[part]
      if (!character?.equipped[part]) {
        return partition
      }
      const match = partition.find((x) => x.id == character.equipped[part])
      return match ? [match] : []
    }

    return {
      Head: matchingRelic(Parts.Head),
      Hands: matchingRelic(Parts.Hands),
      Body: matchingRelic(Parts.Body),
      Feet: matchingRelic(Parts.Feet),
      PlanarSphere: matchingRelic(Parts.PlanarSphere),
      LinkRope: matchingRelic(Parts.LinkRope),
    }
  },

  splitRelicsByPart: (relics: Relic[]) => {
    return {
      Head: relics.filter((x) => x.part == Parts.Head),
      Hands: relics.filter((x) => x.part == Parts.Hands),
      Body: relics.filter((x) => x.part == Parts.Body),
      Feet: relics.filter((x) => x.part == Parts.Feet),
      PlanarSphere: relics.filter((x) => x.part == Parts.PlanarSphere),
      LinkRope: relics.filter((x) => x.part == Parts.LinkRope),
    }
  },

  mergePreviewSubstats: (request: Form, relics: Relic[]) => {
    const upgradeLevel = request.mainStatUpscaleLevel
    relics.forEach((relic) => {
      relic.previewSubstats.forEach((s, idx) => {
        if (relic.enhance + 3 * idx < upgradeLevel) {
          relic.substats.push(s)
        }
      })
    })
  },

  applyMainStatsFilter: (request: Form, relics: Relic[]) => {
    const mainStatUpscaleLevel = request.mainStatUpscaleLevel
    if (mainStatUpscaleLevel) {
      relics.forEach((x) => {
        const { grade, enhance, main: { stat } } = x
        const maxEnhance = grade * 3
        if (enhance < maxEnhance && enhance < mainStatUpscaleLevel) {
          const newEnhance = maxEnhance < mainStatUpscaleLevel ? maxEnhance : mainStatUpscaleLevel
          const newValue = calculateRelicMainStatValue(stat, grade, newEnhance) / (isFlat(x.main.stat) ? 1 : 100)
          x.augmentedStats!.mainValue = newValue
        }
      })
    }
    return relics
  },

  condenseRelicSubstatsForOptimizerSingle: (relics: Relic[]) => {
    for (const relic of relics) {
      relic.condensedStats = []
      for (const substat of relic.substats) {
        const stat = substat.stat
        const key = BasicStatToKey[stat]
        const value = getValueByStatType(stat, substat.value)

        relic.condensedStats.push([key, value])
      }
      // Use augmented main value for maxed main stat filter
      relic.condensedStats.push([BasicStatToKey[relic.augmentedStats!.mainStat as StatsValues], relic.augmentedStats!.mainValue])
    }
  },

  condenseRelicSubstatsForOptimizer: (relicsByPart: RelicsByPart) => {
    for (const relics of Object.values(relicsByPart)) {
      RelicFilters.condenseRelicSubstatsForOptimizerSingle(relics)
    }

    return relicsByPart
  },

  condenseSingleRelicByPartSubstatsForOptimizer: (singleRelicByPart: Partial<SingleRelicByPart>) => {
    for (const relic of Object.values(singleRelicByPart)) {
      RelicFilters.condenseRelicSubstatsForOptimizerSingle([relic])
    }

    return singleRelicByPart
  },
}

function getValueByStatType(stat: string, value: number) {
  return precisionRound(isFlat(stat) ? value : value / 100)
}
