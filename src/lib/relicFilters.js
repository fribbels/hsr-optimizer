import { Constants } from "./constants.ts";
import DB from "./db";
import { Utils } from "./utils";

export const RelicFilters = {
  calculateWeightScore: (request, relics) => {
    let weights = request.weights || {}
    let statScalings = {
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

    for (let weight of Object.keys(weights)) {
      if (weights[weight] == undefined) {
        weights[weight] = 0
      }
    }

    for (let relic of relics) {
      let sum = 0
      for (let substat of relic.substats) {
        let weight = weights[substat.stat] || 0
        let scale = statScalings[substat.stat] || 0
        let value = substat.value || 0
        sum += value * weight * scale
      }
      relic.weightScore = sum
    }

    return relics
  },

  applyTopFilter: (request, relics, originalRelics) => {
    let weights = request.weights || {}

    for (let part of Object.values(Constants.Parts)) {
      let partition = relics[part]
      let index = Math.max(1, Math.floor(weights.topPercent / 100 * originalRelics[part].length))
      relics[part] = partition.sort((a, b) => b.weightScore - a.weightScore).slice(0, index)
    }

    return relics
  },

  applyRankFilter: (request, relics) => {
    if (!request.rankFilter) return relics;

    let characters = DB.getCharacters()
    let characterId = request.characterId;
    let higherRankedRelics = {}
    for (let i = 0; i < characters.length; i++) {
      let rankedCharacter = characters[i]
      if (rankedCharacter.id == characterId) {
        break
      }

      Object.values(rankedCharacter.equipped)
        .filter(x => x != null)
        .map(x => higherRankedRelics[x] = true)
    }

    return relics.filter(x => !higherRankedRelics[x.id])
  },

  applyMainFilter: (request, relics) => {
    let out = []
    out.push(...relics.filter(x => x.part == Constants.Parts.Head))
    out.push(...relics.filter(x => x.part == Constants.Parts.Hands))
    out.push(...relics.filter(x => x.part == Constants.Parts.Body).filter(x => request.mainBody.length == 0 || request.mainBody.includes(x.main.stat)))
    out.push(...relics.filter(x => x.part == Constants.Parts.Feet).filter(x => request.mainFeet.length == 0 || request.mainFeet.includes(x.main.stat)))
    out.push(...relics.filter(x => x.part == Constants.Parts.PlanarSphere).filter(x => request.mainPlanarSphere.length == 0 || request.mainPlanarSphere.includes(x.main.stat)))
    out.push(...relics.filter(x => x.part == Constants.Parts.LinkRope).filter(x => request.mainLinkRope.length == 0 || request.mainLinkRope.includes(x.main.stat)))

    return out;
  },

  applyEnhanceFilter: (request, relics) => {
    return relics.filter(x => x.enhance >= request.enhance);
  },

  applyGradeFilter: (request, relics) => {
    return relics.filter(x => x.grade ? x.grade >= request.grade : true);
  },

  applySetFilter: (request, relics) => {
    function relicFilter(request, relics) {
      if (!request.relicSets || request.relicSets.length == 0) {
        return relics
      }
      let allowedSets = Utils.arrayOfZeroes(Object.values(Constants.SetsRelics).length)

      for (let relicSet of request.relicSets) {
        if (relicSet[0] == '4 Piece') {
          if (relicSet.length == 1) {
            allowedSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 1)
          }
          if (relicSet.length == 2) {
            let index = Constants.RelicSetToIndex[relicSet[1]]
            allowedSets[index] = 1
          }
        }
        if (relicSet[0] == '2 Piece') {
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
            let index1 = Constants.RelicSetToIndex[relicSet[1]]
            allowedSets[index1] = 1

            let index2 = Constants.RelicSetToIndex[relicSet[2]]
            allowedSets[index2] = 1
          }
        }
      }

      return relics.filter(relic => {
        if (
          relic.part == Constants.Parts.Head ||
          relic.part == Constants.Parts.Hands ||
          relic.part == Constants.Parts.Body ||
          relic.part == Constants.Parts.Feet) {
          return allowedSets[Constants.RelicSetToIndex[relic.set]] == 1;
        } else {
          return true
        }
      })
    }

    function ornamentFilter(request, relics) {
      if (!request.ornamentSets || request.ornamentSets.length == 0) {
        return relics
      }
      let allowedSets = Utils.arrayOfZeroes(Object.values(Constants.SetsOrnaments).length)

      for (let ornamentSet of request.ornamentSets) {
        let index = Constants.OrnamentSetToIndex[ornamentSet]
        allowedSets[index] = 1
      }

      return relics.filter(relic => {
        if (
          relic.part == Constants.Parts.PlanarSphere ||
          relic.part == Constants.Parts.LinkRope) {
          return allowedSets[Constants.OrnamentSetToIndex[relic.set]] == 1;
        } else {
          return true
        }
      })
    }

    return ornamentFilter(request, relicFilter(request, relics))
  },

  applyCurrentFilter: (request, relics) => {
    if (!request.keepCurrentRelics) return relics;

    let character = DB.getCharacterById(request.characterId)
    if (!character) {
      return relics
    }

    function matchingRelic(part) {
      if (!character.equipped[part]) {
        return relics[part]
      }
      let match = relics[part].find(x => x.id == character.equipped[part])
      return match ? [match] : []
    }

    return {
      Head: matchingRelic(Constants.Parts.Head),
      Hands: matchingRelic(Constants.Parts.Hands),
      Body: matchingRelic(Constants.Parts.Body),
      Feet: matchingRelic(Constants.Parts.Feet),
      PlanarSphere: matchingRelic(Constants.Parts.PlanarSphere),
      LinkRope: matchingRelic(Constants.Parts.LinkRope)
    }
  },

  splitRelicsByPart: (relics) => {
    return {
      Head: relics.filter(x => x.part == Constants.Parts.Head),
      Hands: relics.filter(x => x.part == Constants.Parts.Hands),
      Body: relics.filter(x => x.part == Constants.Parts.Body),
      Feet: relics.filter(x => x.part == Constants.Parts.Feet),
      PlanarSphere: relics.filter(x => x.part == Constants.Parts.PlanarSphere),
      LinkRope: relics.filter(x => x.part == Constants.Parts.LinkRope)
    }
  }
}