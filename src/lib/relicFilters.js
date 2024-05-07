import { Constants, RelicSetFilterOptions } from './constants.ts'
import DB from './db'
import { Utils } from './utils'
import { StatCalculator } from 'lib/statCalculator'

export const RelicFilters = {
  calculateWeightScore: (request, relics) => {
    const weights = request.weights || {}
    const statScalings = {
      [Constants.Stats.HP_P]: 64.8 / 43.2,
      [Constants.Stats.ATK_P]: 64.8 / 43.2,
      [Constants.Stats.DEF_P]: 64.8 / 54,
      [Constants.Stats.HP]: 1 / (DB.getMetadata().characters[request.characterId].promotions[80][Constants.Stats.HP] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.ATK]: 1 / (DB.getMetadata().characters[request.characterId].promotions[80][Constants.Stats.ATK] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.DEF]: 1 / (DB.getMetadata().characters[request.characterId].promotions[80][Constants.Stats.DEF] * 2 * 0.01) * (64.8 / 54),
      [Constants.Stats.CR]: 64.8 / 32.4,
      [Constants.Stats.CD]: 64.8 / 64.8,
      [Constants.Stats.OHB]: 64.8 / 34.5,
      [Constants.Stats.EHR]: 64.8 / 43.2,
      [Constants.Stats.RES]: 64.8 / 43.2,
      [Constants.Stats.SPD]: 64.8 / 25,
      [Constants.Stats.BE]: 64.8 / 64.8,
    }

    weights[Constants.Stats.ATK] = weights[Constants.Stats.ATK_P]
    weights[Constants.Stats.DEF] = weights[Constants.Stats.DEF_P]
    weights[Constants.Stats.HP] = weights[Constants.Stats.HP_P]

    for (const weight of Object.keys(weights)) {
      if (weights[weight] == undefined) {
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

  applyTopFilter: (request, relics, originalRelics) => {
    const weights = request.weights || {}

    for (const part of Object.values(Constants.Parts)) {
      const partition = relics[part]
      const index = Math.max(1, Math.floor(weights.topPercent / 100 * originalRelics[part].length))
      relics[part] = partition.sort((a, b) => b.weightScore - a.weightScore).slice(0, index)
    }

    return relics
  },

  applyRankFilter: (request, relics) => {
    if (!request.rankFilter) return relics

    const characters = DB.getCharacters()
    const characterId = request.characterId
    const higherRankedRelics = {}
    for (let i = 0; i < characters.length; i++) {
      const rankedCharacter = characters[i]
      if (rankedCharacter.id == characterId) {
        continue
      }
      if (i >= request.rank) {
        break
      }

      Object.values(rankedCharacter.equipped)
        .filter((x) => x != null)
        .map((x) => higherRankedRelics[x] = true)
    }

    return relics.filter((x) => !higherRankedRelics[x.id])
  },

  applyExcludeFilter: (request, relics) => {
    if (!request.exclude) return relics

    const characters = DB.getCharacters()
    const excludedRelics = []
    for (const character of characters) {
      if (request.exclude.includes(character.id) && character.id != request.characterId)
        Object.values(character.equipped)
          .filter((x) => x != null)
          .map((x) => excludedRelics[x] = true)
    }

    return relics.filter((x) => !excludedRelics[x.id])
  },

  applyMainFilter: (request, relics) => {
    const out = []
    out.push(...relics.filter((x) => x.part == Constants.Parts.Head))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Hands))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Body).filter((x) => request.mainBody.length == 0 || request.mainBody.includes(x.main.stat)))
    out.push(...relics.filter((x) => x.part == Constants.Parts.Feet).filter((x) => request.mainFeet.length == 0 || request.mainFeet.includes(x.main.stat)))
    out.push(...relics.filter((x) => x.part == Constants.Parts.PlanarSphere).filter((x) => request.mainPlanarSphere.length == 0 || request.mainPlanarSphere.includes(x.main.stat)))
    out.push(...relics.filter((x) => x.part == Constants.Parts.LinkRope).filter((x) => request.mainLinkRope.length == 0 || request.mainLinkRope.includes(x.main.stat)))

    return out
  },

  applyEnhanceFilter: (request, relics) => {
    return relics.filter((x) => x.enhance >= request.enhance)
  },

  applyEquippedFilter: (request, relics) => {
    if (request.includeEquippedRelics)
      return relics

    const characterId = request.characterId || '99999999'
    // TODO: refactor after https://github.com/fribbels/hsr-optimizer/issues/56 is completed
    let blacklist = []
    window.store.getState().characters.forEach((char) => {
      if (char.id == characterId) return
      blacklist = blacklist.concat(Object.values(char.equipped))
    })
    const ret = relics.filter((x) => !blacklist.includes(x.id))
    return ret
  },

  applyGradeFilter: (request, relics) => {
    return relics.filter((x) => x.grade ? x.grade >= request.grade : true)
  },

  applySetFilter: (request, relics) => {
    function relicFilter(request, relics) {
      if (!request.relicSets || request.relicSets.length == 0) {
        return relics
      }
      let allowedSets = Utils.arrayOfZeroes(Object.values(Constants.SetsRelics).length)

      for (const relicSet of request.relicSets) {
        if (relicSet[0] == RelicSetFilterOptions.relic4Piece) {
          if (relicSet.length == 1) { // Is this one even possible
            allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
          }
          if (relicSet.length == 2) {
            const index = Constants.RelicSetToIndex[relicSet[1]]
            allowedSets[index] = 1
          }
        }
        if (relicSet[0] == RelicSetFilterOptions.relic2PlusAny) {
          allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
        }

        // '2 Piece' and 'Any' is deprecated but leaving here for compatibility
        if (relicSet[0] == '2 Piece' || relicSet[0] == RelicSetFilterOptions.relic2Plus2Piece) {
          if (relicSet.length == 1) {
            allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
          }
          if (relicSet.length == 2) {
            allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
          }
          if (relicSet.length == 3) {
            if (relicSet[2] == 'Any') {
              allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
            }
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

    function ornamentFilter(request, relics) {
      if (!request.ornamentSets || request.ornamentSets.length == 0) {
        return relics
      }
      const allowedSets = Utils.arrayOfZeroes(Object.values(Constants.SetsOrnaments).length)

      for (const ornamentSet of request.ornamentSets) {
        const index = Constants.OrnamentSetToIndex[ornamentSet]
        allowedSets[index] = 1
      }

      return relics.filter((relic) => {
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

  applyCurrentFilter: (request, relics) => {
    if (!request.keepCurrentRelics) return relics

    const character = DB.getCharacterById(request.characterId)
    if (!character) {
      return relics
    }

    function matchingRelic(part) {
      if (!character.equipped[part]) {
        return relics[part]
      }
      const match = relics[part].find((x) => x.id == character.equipped[part])
      return match ? [match] : []
    }

    return {
      Head: matchingRelic(Constants.Parts.Head),
      Hands: matchingRelic(Constants.Parts.Hands),
      Body: matchingRelic(Constants.Parts.Body),
      Feet: matchingRelic(Constants.Parts.Feet),
      PlanarSphere: matchingRelic(Constants.Parts.PlanarSphere),
      LinkRope: matchingRelic(Constants.Parts.LinkRope),
    }
  },

  splitRelicsByPart: (relics) => {
    return {
      Head: relics.filter((x) => x.part == Constants.Parts.Head),
      Hands: relics.filter((x) => x.part == Constants.Parts.Hands),
      Body: relics.filter((x) => x.part == Constants.Parts.Body),
      Feet: relics.filter((x) => x.part == Constants.Parts.Feet),
      PlanarSphere: relics.filter((x) => x.part == Constants.Parts.PlanarSphere),
      LinkRope: relics.filter((x) => x.part == Constants.Parts.LinkRope),
    }
  },

  applyMaxedMainStatsFilter: (request, relics) => {
    if (request.predictMaxedMainStat) {
      relics.map((x) => x.augmentedStats.mainValue = Utils.isFlat(x.main.stat) ? StatCalculator.getMaxedMainStat(x) : StatCalculator.getMaxedMainStat(x) / 100)
    }
    return relics
  },

  condenseRelicSubstatsForOptimizer: (relicsByPart) => {
    for (const part of Object.keys(Constants.Parts)) {
      const relics = relicsByPart[part]
      for (const relic of relics) {
        relic.condensedStats = []
        for (const substat of relic.substats) {
          const stat = substat.stat
          const value = getValueByStatType(stat, substat.value)

          relic.condensedStats.push([stat, value])
        }
        // Use augmented main value for maxed main stat filter
        relic.condensedStats.push([relic.augmentedStats.mainStat, relic.augmentedStats.mainValue])

        delete relic.augmentedStats
        delete relic.weights
      }
    }

    return relicsByPart
  },
}

function getValueByStatType(stat, value) {
  return Utils.precisionRound(Utils.isFlat(stat) ? value : value / 100)
}
