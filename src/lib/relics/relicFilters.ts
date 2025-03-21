import { Constants, Parts, RelicSetFilterOptions, SubStatValues } from 'lib/constants/constants'
import { RelicsByPart, SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { StatToKey } from 'lib/optimization/computedStatsArray'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { Form } from 'types/form'
import { Relic } from 'types/relic'

const statScalings = {
  [Constants.Stats.HP_P]: 64.8 / 43.2,
  [Constants.Stats.ATK_P]: 64.8 / 43.2,
  [Constants.Stats.DEF_P]: 64.8 / 54,
  [Constants.Stats.HP]: (64.8 / 43.2) * SubStatValues[Constants.Stats.HP_P][5].high / SubStatValues[Constants.Stats.HP][5].high,
  [Constants.Stats.ATK]: (64.8 / 43.2) * SubStatValues[Constants.Stats.ATK_P][5].high / SubStatValues[Constants.Stats.ATK][5].high,
  [Constants.Stats.DEF]: (64.8 / 54) * SubStatValues[Constants.Stats.DEF_P][5].high / SubStatValues[Constants.Stats.DEF][5].high,
  [Constants.Stats.CR]: 64.8 / 32.4,
  [Constants.Stats.CD]: 64.8 / 64.8,
  [Constants.Stats.OHB]: 64.8 / 34.5,
  [Constants.Stats.EHR]: 64.8 / 43.2,
  [Constants.Stats.RES]: 64.8 / 43.2,
  [Constants.Stats.SPD]: 64.8 / 25,
  [Constants.Stats.BE]: 64.8 / 64.8,
}

export const RelicFilters = {
  calculateWeightScore: (request: Form, relics: Relic[]) => {
    const weights = request.weights || {}

    weights[Constants.Stats.ATK] = weights[Constants.Stats.ATK_P]
    weights[Constants.Stats.DEF] = weights[Constants.Stats.DEF_P]
    weights[Constants.Stats.HP] = weights[Constants.Stats.HP_P]

    for (const weight of Object.keys(weights)) {
      if (weights[weight] === undefined) {
        weights[weight] = 0
      }
    }

    for (const relic of relics) {
      let sum = 0
      for (const substat of relic.substats) {
        const weight = weights[substat.stat] || 0
        const scale = statScalings[substat.stat] || 0
        const value = substat.value || 0
        sum += value * weight * scale
      }
      relic.weightScore = sum
    }

    return relics
  },

  applyTopFilter: (request: Form, relics: RelicsByPart) => {
    const weights = request.weights || {}
    const partMinRolls = {
      [Parts.Head]: weights.headHands || 0,
      [Parts.Hands]: weights.headHands || 0,
      [Parts.Body]: weights.bodyFeet || 0,
      [Parts.Feet]: weights.bodyFeet || 0,
      [Parts.PlanarSphere]: weights.sphereRope || 0,
      [Parts.LinkRope]: weights.sphereRope || 0,
    }

    for (const part of Object.values(Constants.Parts)) {
      const partition: Relic[] = relics[part]
      relics[part] = partition.filter((relic) => relic.weightScore >= partMinRolls[part] * 6.48 * 0.8)
    }

    return relics
  },

  applyRankFilter: (request: Form, relics: Relic[]) => {
    if (!request.rankFilter) return relics

    const characters = DB.getCharacters()
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
        .map((relicId) => higherRankedRelics[relicId] = true)
    }

    return relics.filter((x) => !higherRankedRelics[x.id])
  },

  applyExcludeFilter: (request: Form, relics: Relic[]) => {
    if (!request.exclude) return relics

    const characters = DB.getCharacters()
    const excludedRelics: Record<string, boolean> = {}
    for (const character of characters) {
      if (request.exclude.includes(character.id) && character.id != request.characterId)
        Object.values(character.equipped)
          .filter((relicId) => relicId != null)
          .map((relicId) => excludedRelics[relicId] = true)
    }

    return relics.filter((x) => !excludedRelics[x.id])
  },

  applyMainFilter: (request: Form, relics: Relic[]) => {
    const out: Relic[] = []
    out.push(...relics.filter((x) => x.part == Constants.Parts.Head))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Hands))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Body).filter((x) => request.mainBody.length == 0 || request.mainBody.includes(x.main.stat)))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Feet).filter((x) => request.mainFeet.length == 0 || request.mainFeet.includes(x.main.stat)))
    out.push(...relics.filter((x) => x.part == Constants.Parts.PlanarSphere).filter((x) => request.mainPlanarSphere.length == 0 || request.mainPlanarSphere.includes(x.main.stat)))
    out.push(...relics.filter((x) => x.part == Constants.Parts.LinkRope).filter((x) => request.mainLinkRope.length == 0 || request.mainLinkRope.includes(x.main.stat)))

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
    window.store.getState().characters.forEach((char) => {
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
      let allowedSets = Utils.arrayOfZeroes(Object.values(Constants.SetsRelics).length)

      for (const relicSet of request.relicSets) {
        if (relicSet[0] == RelicSetFilterOptions.relic4Piece) {
          if (relicSet.length == 2) {
            const index = Constants.RelicSetToIndex[relicSet[1]]
            allowedSets[index] = 1
          }
        }

        if (relicSet[0] == RelicSetFilterOptions.relic2PlusAny) {
          allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
        }

        if (relicSet[0] == RelicSetFilterOptions.relic2Plus2Piece) {
          if (relicSet.length == 3) {
            const index1 = Constants.RelicSetToIndex[relicSet[1]]
            allowedSets[index1] = 1

            const index2 = Constants.RelicSetToIndex[relicSet[2]]
            allowedSets[index2] = 1
          }
        }
      }

      return relics.filter((relic) => {
        if (
          relic.part == Constants.Parts.Head
          || relic.part == Constants.Parts.Hands
          || relic.part == Constants.Parts.Body
          || relic.part == Constants.Parts.Feet) {
          return allowedSets[Constants.RelicSetToIndex[relic.set]] == 1
        } else {
          return true
        }
      })
    }

    function ornamentFilter(request: Form, relics: Relic[]) {
      if (!request.ornamentSets || request.ornamentSets.length == 0) {
        return relics
      }
      const allowedSets = Utils.arrayOfZeroes(Object.values(Constants.SetsOrnaments).length)

      for (const ornamentSet of request.ornamentSets) {
        const index = Constants.OrnamentSetToIndex[ornamentSet]
        allowedSets[index] = 1
      }

      return relics.filter((relic: Relic) => {
        if (
          relic.part == Constants.Parts.PlanarSphere
          || relic.part == Constants.Parts.LinkRope) {
          return allowedSets[Constants.OrnamentSetToIndex[relic.set]] == 1
        } else {
          return true
        }
      })
    }

    return ornamentFilter(request, relicFilter(request, relics))
  },

  applyCurrentFilter: (request: Form, relics: RelicsByPart) => {
    if (!request.keepCurrentRelics) return relics

    const character = DB.getCharacterById(request.characterId)
    if (!character) {
      return relics
    }

    function matchingRelic(part: Parts) {
      const partition: Relic[] = relics[part]
      if (!character.equipped[part]) {
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

  applyMainStatsFilter: (request: Form, relics: Relic[]) => {
    const mainStatUpscaleLevel = request.mainStatUpscaleLevel
    if (mainStatUpscaleLevel) {
      relics.map((x) => {
        const { grade, enhance, main: { stat } } = x
        const maxEnhance = grade * 3
        if (enhance < maxEnhance && enhance < mainStatUpscaleLevel) {
          const newEnhance = maxEnhance < mainStatUpscaleLevel ? maxEnhance : mainStatUpscaleLevel
          const newValue = TsUtils.calculateRelicMainStatValue(stat, grade, newEnhance) / (Utils.isFlat(x.main.stat) ? 1 : 100)
          return x.augmentedStats!.mainValue = newValue
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
        const key = StatToKey[stat]
        const value = getValueByStatType(stat, substat.value)

        relic.condensedStats.push([key, value])
      }
      // Use augmented main value for maxed main stat filter
      relic.condensedStats.push([StatToKey[relic.augmentedStats!.mainStat], relic.augmentedStats!.mainValue])
    }
  },

  condenseRelicSubstatsForOptimizer: (relicsByPart: RelicsByPart) => {
    for (const relics of Object.values(relicsByPart)) {
      RelicFilters.condenseRelicSubstatsForOptimizerSingle(relics)
    }

    return relicsByPart
  },

  condenseSingleRelicByPartSubstatsForOptimizer: (singleRelicByPart: SingleRelicByPart) => {
    for (const relic of Object.values(singleRelicByPart)) {
      RelicFilters.condenseRelicSubstatsForOptimizerSingle([relic])
    }

    return singleRelicByPart
  },
}

function getValueByStatType(stat: string, value: number) {
  return Utils.precisionRound(Utils.isFlat(stat) ? value : value / 100)
}
