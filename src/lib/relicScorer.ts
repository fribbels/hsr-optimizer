import { Constants } from 'lib/constants'
import { Character } from 'types/Character'

import DB from './db.js'

const minRollValue = 5.1 // Use truncated decimal instead of 5.184 because OCR'd results show truncated
let mainStatFreeRolls

function setMainStatFreeRolls() {
  if (!mainStatFreeRolls) {
    mainStatFreeRolls = {
      [Constants.Parts.Body]: {
        [Constants.Stats.HP_P]: 1.32,
        [Constants.Stats.ATK_P]: 1.284,
        [Constants.Stats.DEF_P]: 1.305,
        [Constants.Stats.CR]: 1.644,
        [Constants.Stats.CD]: 1.658,
        [Constants.Stats.OHB]: 1.712,
        [Constants.Stats.EHR]: 1.668,
      },
      [Constants.Parts.Feet]: {
        [Constants.Stats.HP_P]: 1.058,
        [Constants.Stats.ATK_P]: 1.019,
        [Constants.Stats.DEF_P]: 1,
        [Constants.Stats.SPD]: 1.567,
      },
      [Constants.Parts.PlanarSphere]: {
        [Constants.Stats.HP_P]: 1.583,
        [Constants.Stats.ATK_P]: 1.559,
        [Constants.Stats.DEF_P]: 1.587,
        [Constants.Stats.Physical_DMG]: 1.763,
        [Constants.Stats.Fire_DMG]: 1.763,
        [Constants.Stats.Ice_DMG]: 1.763,
        [Constants.Stats.Lightning_DMG]: 1.763,
        [Constants.Stats.Wind_DMG]: 1.763,
        [Constants.Stats.Quantum_DMG]: 1.763,
        [Constants.Stats.Imaginary_DMG]: 1.763,
      },
      [Constants.Parts.LinkRope]: {
        [Constants.Stats.HP_P]: 1.073,
        [Constants.Stats.ATK_P]: 1.076,
        [Constants.Stats.DEF_P]: 1.172,
        [Constants.Stats.BE]: 1.416,
        [Constants.Stats.ERR]: 2,
      },
    }
  }
}

const ratingToRolls = {
  F: 1,
  D: 2,
  C: 3,
  B: 4,
  A: 5,
  S: 6,
  SS: 7,
  SSS: 8,
  WTF: 9,
}
const ratings: { threshold: number; rating: string }[] = []
for (const x of Object.entries(ratingToRolls)) {
  ratings.push({
    threshold: x[1],
    rating: x[0],
  })
}

function countPairs(arr) {
  let pairs = 0
  const obj = {}
  arr.forEach((i) => {
    if (obj[i]) {
      pairs += 1
      obj[i] = 0
    } else {
      obj[i] = 1
    }
  })
  return pairs
}

export const RelicScorer = {
  scoreCharacterWithRelics: (character, relics) => {
    if (!character || !character.id) return {}

    const scoredRelics = relics.map((x) => RelicScorer.score(x, character.id))

    let sum = 0
    for (const relic of scoredRelics) {
      sum += Number(relic.score) + Number(relic.mainStatScore)
    }

    const missingSets = 3 - countPairs(relics.filter((x) => x != undefined).map((x) => x.set))
    const deduction = missingSets * minRollValue * 3
    console.log(`Missing sets ${missingSets} sets, deducting ${deduction} score`)
    sum = Math.max(0, sum - deduction)

    const base = 64.8 * 4
    const avgSubstatScore = (sum - base) / 6

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
      totalRating: rating,
    }
  },

  scoreCharacter: (character: Character) => {
    if (!character || !character.id) return {}

    console.log('SCORE CHARACTER', character)
    const relicsById = window.store.getState().relicsById
    const relics = Object.values(character.equipped).map((x) => relicsById[x])

    return RelicScorer.scoreCharacterWithRelics(character, relics)
  },

  score: (relic, characterId) => {
    // console.log('score', relic, characterId)

    setMainStatFreeRolls()

    if (!relic) {
      return {
        score: 0,
        rating: 'N/A',
        mainStatScore: 0,
      }
    }

    if (!characterId) {
      if (relic.optimizerCharacterId) {
        characterId = relic.optimizerCharacterId
      } else if (relic.equippedBy) {
        characterId = relic.equippedBy
      } else {
        console.log('no id found')
        return {
          score: 0,
          rating: 'N/A',
          mainStatScore: 0,
        }
      }
    }

    const scaling = {
      [Constants.Stats.HP_P]: 64.8 / 43.2,
      [Constants.Stats.ATK_P]: 64.8 / 43.2,
      [Constants.Stats.DEF_P]: 64.8 / 54,
      [Constants.Stats.HP]: 1 / (DB.getMetadata().characters[characterId].promotions[80][Constants.Stats.HP] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.ATK]: 1 / (DB.getMetadata().characters[characterId].promotions[80][Constants.Stats.ATK] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.DEF]: 1 / (DB.getMetadata().characters[characterId].promotions[80][Constants.Stats.DEF] * 2 * 0.01) * (64.8 / 54),
      [Constants.Stats.CR]: 64.8 / 32.4,
      [Constants.Stats.CD]: 64.8 / 64.8,
      [Constants.Stats.OHB]: 64.8 / 34.5,
      [Constants.Stats.EHR]: 64.8 / 43.2,
      [Constants.Stats.RES]: 64.8 / 43.2,
      [Constants.Stats.SPD]: 64.8 / 25,
      [Constants.Stats.BE]: 64.8 / 64.8,
    }

    const multipliers = DB.getScoringMetadata(characterId).stats

    let sum = 0
    for (const substat of relic.substats) {
      substat.scoreMeta = {
        multiplier: (multipliers[substat.stat] || 0),
        score: substat.value * (multipliers[substat.stat] || 0) * scaling[substat.stat],
      }
      sum += substat.scoreMeta.score
    }

    if (relic.part == Constants.Parts.Body || relic.part == Constants.Parts.Feet || relic.part == Constants.Parts.PlanarSphere || relic.part == Constants.Parts.LinkRope) {
      sum += mainStatFreeRolls[relic.part][relic.main.stat] * minRollValue
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
    const metaParts = DB.getScoringMetadata(characterId).parts
    const max = 10.368 + 3.6288 * relic.grade * 3
    if (metaParts[relic.part]) {
      if (metaParts[relic.part].includes(relic.main.stat)) {
        mainStatScore = max
      } else {
        mainStatScore = max * multipliers[relic.main.stat]
      }
    }

    return {
      score: sum.toFixed(1),
      rating: rating,
      mainStatScore: mainStatScore,
      part: relic.part,
      meta: DB.getScoringMetadata(characterId),
    }
  },
}
