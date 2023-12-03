import { CharacterConverter } from "./characterConverter"


// let minRollValue = 5.184
let minRollValue = 5.1 // Use truncated decimal because OCR'd results show truncated
let mainStatFreeRolls = 1.5
let ratingToRolls = {
  'F': 1,
  'D': 2,
  'C': 3,
  'B': 4,
  'A': 5,
  'S': 6,
  'SS': 7,
  'SSS': 8,
  'WTF': 9,
}
let ratings = []
for (let x of Object.entries(ratingToRolls)) {
  ratings.push({
    threshold: x[1],
    rating: x[0]
  })
}


export const RelicScorer = {
  scoreCharacter: (character) => {
    if (!character || !character.id) return {}

    console.log('SCORE CHARACTER', character)
    let relics = Object.values(character.equipped)
    let scoredRelics = relics.map(x => RelicScorer.score(x, character.id))
    
    let sum = 0
    for (let relic of scoredRelics) {
      sum += Number(relic.score) + Number(relic.mainStatScore)
    }

    let base = 64.8 * 4
    let avgSubstatScore = (sum - base) / 6

    let rating = 'F'
    for (let i = 0; i < ratings.length; i++) {
      if (avgSubstatScore >= ratings[i].threshold * minRollValue) {
        rating = ratings[i].rating
        if (avgSubstatScore >= (ratings[i].threshold + 0.5) * (minRollValue)) {
          rating += '+'
        }
      }
    }

    return {
      relics: scoredRelics,
      totalScore: sum,
      totalRating: rating
    }
  },

  score: (relic, characterId) => {
    console.log('score', relic, characterId)

    if (!relic) {
      return {
        score: 0,
        rating: 'N/A',
        mainStatScore: 0
      }
    }

    if (relic.equippedBy) {
      console.log('using equippedby')

      characterId = relic.equippedBy
    }

    if (relic.optimizerCharacterId) {
      console.log('using optimizerCharacterId')

      characterId = relic.optimizerCharacterId
    }

    if (!characterId) {
      console.log('no id found')
      return {
        score: 0,
        rating: 'N/A',
        mainStatScore: 0
      }
    }

    let scaling = {
      [Constants.Stats.HP_P]: 64.8 / 43.2,
      [Constants.Stats.ATK_P]: 64.8 / 43.2,
      [Constants.Stats.DEF_P]: 64.8 / 54,
      [Constants.Stats.HP]: 0,
      [Constants.Stats.ATK]: 0,
      [Constants.Stats.DEF]: 0,
      [Constants.Stats.CR]: 64.8 / 32.4,
      [Constants.Stats.CD]: 64.8 / 64.8,
      [Constants.Stats.OHB]: 64.8 / 34.5,
      [Constants.Stats.EHR]: 64.8 / 43.2,
      [Constants.Stats.RES]: 64.8 / 43.2,
      [Constants.Stats.SPD]: 64.8 / 25,
      [Constants.Stats.BE]: 64.8 / 64.8,
    }

    let multipliers = DB.getMetadata().characters[characterId].scores.stats
    let conversions = CharacterConverter.getConstantConversions()
    let relicSubAffixes = DB.getMetadata().relics.relicSubAffixes
    let discard = {[Constants.Stats.ATK]: true, [Constants.Stats.DEF]: true, [Constants.Stats.HP]: true}
    console.log('Relic scorer', relic, multipliers, relicSubAffixes)
    
    let sum = 0
    for (let substat of relic.substats) {
      let subdata = Object.values(relicSubAffixes[relic.grade].affixes).find(x => conversions.statConversion[x.property] == substat.stat)

      console.log(substat, subdata)
      substat.scoreMeta = {
        multiplier: (multipliers[substat.stat] || 0),
        score: discard[substat.stat] ? 0 : substat.value * (multipliers[substat.stat] || 0) * scaling[substat.stat]
      }
      sum += substat.scoreMeta.score
      // a = {
      //   "affix_id": "12",
      //   "property": "BreakDamageAddedRatioBase",
      //   "base": 0.051840000785887,
      //   "step": 0.006480000447482,
      //   "step_num": 2
      // }
    }


    if (relic.part == Constants.Parts.Body || relic.part == Constants.Parts.Feet || relic.part == Constants.Parts.PlanarSphere || relic.part == Constants.Parts.LinkRope) {
      sum += mainStatFreeRolls * minRollValue
    }

    let rating = 'F'
    for (let i = 0; i < ratings.length; i++) {
      if (sum >= ratings[i].threshold * minRollValue) {
        rating = ratings[i].rating
        if (sum >= (ratings[i].threshold + 0.5) * (minRollValue)) {
          rating += '+'
        }
      }
    }

    let mainStatScore = 0
    let metaParts = DB.getMetadata().characters[characterId].scores.parts
    let max = 10.368 + 3.6288 * relic.grade * 3
    if (metaParts[relic.part]) {
      if (metaParts[relic.part].includes(relic.main.stat)) {
        mainStatScore = max
      } else {
        mainStatScore = max * multipliers[relic.main.stat]
      }
    }
    
    console.log(relic.substats, ratings, sum)

    return {
      score: sum.toFixed(1),
      rating: rating,
      mainStatScore: mainStatScore,
      part: relic.part,
      meta: DB.getMetadata().characters[characterId].scores
    }
  }
}