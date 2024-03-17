import { Constants, Parts, PartsMainStats, StatsValues } from 'lib/constants'
import { Character, CharacterId } from 'types/Character'
import { Relic } from 'types/Relic'
import { Utils } from 'lib/utils'

import DB from './db.js'

// Define the fields we care about, until DB+dataParser are typed and can be inferred in this file
type ScoringMetadata = {
  parts: { [K in Parts]: [StatsValues] }
  stats: { [K in StatsValues]: number }
  sortedSubstats: [StatsValues, number][]
}

const minRollValue = 5.1 // Use truncated decimal instead of 5.184 because OCR'd results show truncated
const mainStatFreeRolls = {
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

function mainStatFreeRoll(part, mainStat, multipliers) {
  if (part == Constants.Parts.Body || part == Constants.Parts.Feet || part == Constants.Parts.PlanarSphere || part == Constants.Parts.LinkRope) {
    return mainStatFreeRolls[part][mainStat] * minRollValue * multipliers[mainStat]
  }
  return 0
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

const possibleSubstats = new Set(Constants.SubStats)

// Given a relic, predict additional weight if it were fully enhanced
//
// Takes:
// - relic grade + current enhance
// - relic current substats as [[substat name, weight], ...]
// - array of [[substat name, weight], ...] in selection priority order (usually sort by weight asc or desc)
// - selection function to choose the substat weight extra rolls will go into (usually min/max)
//
// Returns:
// - predicted additional weight (unscaled by roll value - usually multiply by 6.48 or minRollValue after)
// - array of [[new substat name, weight], ...]
function predictExtraRollWeight(substats, grade, enhance, substatScores, substatWeightSelector) {
  const missingSubstats = (4 - substats.length)
  const missingRolls = Math.ceil(((15 - (5 - grade) * 3) - enhance) / 3) - missingSubstats
  // console.log(grade, enhance, missingSubstats, missingRolls)

  const finalSubstatWeights = substats.map((x) => x[1])
  const newSubstats = substatScores.slice(0, missingSubstats)
  newSubstats.forEach(([_substat, weight]) => finalSubstatWeights.push(weight))
  const rollSubstatWeight = substatWeightSelector(finalSubstatWeights)

  let extraRolls = 0

  for (let i = 0; i < missingSubstats; i++) {
    extraRolls += 1 * newSubstats[i][1]
  }

  for (let i = 0; i < missingRolls; i++) {
    extraRolls += rollSubstatWeight
  }

  // console.log(substats, newSubstats, finalSubstatWeights, extraRolls)
  return {
    extraRolls: extraRolls,
    newSubstats: newSubstats,
  }
}

// This class has methods statically available for one-off scoring calculations, but can
// also be instantiated to batch up many scoring calculations. An instantiated RelicScorer
// should *not* be kept alive for long periods of time, as it will cache scoring metadata
// for characters (which users can edit).
// You will almost certainly want to instantiate one of these in a component rerender
// if you're doing >= 10 scorings
export class RelicScorer {
  characterRelicScoreMetas: Map<CharacterId, ScoringMetadata>
  optimalPartCharacterScore: Map<Parts, Map<CharacterId, number>>

  constructor() {
    this.characterRelicScoreMetas = new Map()
    this.optimalPartCharacterScore = new Map()
  }

  getRelicScoreMeta(id): ScoringMetadata {
    let scoringMetadata = this.characterRelicScoreMetas.get(id)
    if (!scoringMetadata) {
      scoringMetadata = Utils.clone(DB.getScoringMetadata(id)) as ScoringMetadata

      const level80Stats = DB.getMetadata().characters[id].promotions[80]
      scoringMetadata.stats[Constants.Stats.HP] = scoringMetadata.stats[Constants.Stats.HP_P] * 38 / (level80Stats[Constants.Stats.HP] * 2 * 0.03888)
      scoringMetadata.stats[Constants.Stats.ATK] = scoringMetadata.stats[Constants.Stats.ATK_P] * 19 / (level80Stats[Constants.Stats.ATK] * 2 * 0.03888)
      scoringMetadata.stats[Constants.Stats.DEF] = scoringMetadata.stats[Constants.Stats.DEF_P] * 19 / (level80Stats[Constants.Stats.DEF] * 2 * 0.04860)

      scoringMetadata.sortedSubstats = Object.entries(scoringMetadata.stats)
        .filter((x) => possibleSubstats.has(x[0]))
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      this.characterRelicScoreMetas.set(id, scoringMetadata)
    }
    return scoringMetadata
  }

  static scoreCharacterWithRelics(character, relics) {
    return new RelicScorer().scoreCharacterWithRelics(character, relics)
  }

  scoreCharacterWithRelics(character, relics) {
    if (!character || !character.id) return {}

    const scoredRelics = relics.map((x) => this.score(x, character.id))

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
  }

  static scoreCharacter(character) {
    return new RelicScorer().scoreCharacter(character)
  }

  scoreCharacter(character: Character) {
    if (!character || !character.id) return {}

    console.log('SCORE CHARACTER', character)
    const relicsById = window.store.getState().relicsById
    const relics = Object.values(character.equipped).map((x) => relicsById[x])

    return this.scoreCharacterWithRelics(character, relics)
  }

  // Given a part and a character, calculate the weight of the optimal relic
  // i.e. 5* relic, 4 best substats already exist, all rolls go into the best
  static scoreOptimalRelic(part, id) {
    return new RelicScorer().scoreOptimalRelic(part, id)
  }

  scoreOptimalRelic(part: Parts, id: CharacterId) {
    const cachedScore = this.optimalPartCharacterScore.get(part)?.get(id)
    if (cachedScore != null) {
      return cachedScore
    }

    const scoringMetadata = this.getRelicScoreMeta(id)
    let maxWeight = 0

    const scoreEntries = Object.entries(scoringMetadata.stats)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])

    // Find the mainstat for this relic
    if (Utils.hasMainStat(part)) {
      // Fixed maxed-out weight for a 1 weight mainstat
      maxWeight += 64.8

      // Need the specific optimal mainstat to remove it from possible substats. Find it by:
      // 1. choosing the highest multiplier stat from the list of part mainstats for the character (if possible)
      // 2. otherwise: choosing the highest multiplier mainstat of those valid for this relic
      const optimalMainStats = scoringMetadata.parts[part]
      const mainStatIndex = optimalMainStats
        ? scoreEntries.findIndex(([name, _weight]) => optimalMainStats.includes(name))
        : scoreEntries.findIndex(([name, _weight]) => PartsMainStats[part].includes(name))
      scoreEntries.splice(mainStatIndex, 1)
    } else {
      const mainStatIndex = scoreEntries.findIndex(([name, _weight]) => PartsMainStats[part][0] === name)
      scoreEntries.splice(mainStatIndex, 1)[0]
    }

    // Now the mainstat (if any) is gone, filter to just substats
    const substatScoreEntries = scoreEntries.filter((x) => possibleSubstats.has(x[0]))

    const substats = substatScoreEntries.slice(0, 4)
    maxWeight += substats.reduce((weightSum, [_name, weight]) => weightSum + weight, 0) * 6.48

    const optimalRollPrediction = predictExtraRollWeight(
      substats, 5, 0, substatScoreEntries.slice(4), (weights) => Math.max(...weights),
    )
    maxWeight += optimalRollPrediction.extraRolls * 6.48

    if (!this.optimalPartCharacterScore.has(part)) {
      this.optimalPartCharacterScore.set(part, new Map())
    }
    this.optimalPartCharacterScore.get(part)!.set(id, maxWeight)
    return maxWeight
  }

  static scoreRelicPct(relic, id) {
    return new RelicScorer().scoreRelicPct(relic, id)
  }

  scoreRelicPct(relic: Relic, id: CharacterId) {
    const maxWeight = this.scoreOptimalRelic(relic.part, id)
    const score = this.scoreRelic(relic, id)

    if (!Utils.hasMainStat(relic.part)) {
      // undo false mainstat weight to avoid percentage skew
      score.best -= 64.8
      score.average -= 64.8
      score.worst -= 64.8
    } else {
      // undo mainstat free roll as it's not relevant for optimality
      const scoringMetadata = this.getRelicScoreMeta(id)
      const freeRoll = mainStatFreeRoll(relic.part, relic.main.stat, scoringMetadata.stats)
      score.best -= freeRoll
      score.average -= freeRoll
      score.worst -= freeRoll
    }

    // TODO: we assume it's always possible to get a worthless relic, i.e. 0 weight - not true,
    // but close enough for now
    return {
      bestPct: 100 * score.best / maxWeight,
      averagePct: 100 * score.average / maxWeight,
      worstPct: 100 * score.worst / maxWeight,
    }
  }

  static scoreRelic(relic, id) {
    return new RelicScorer().scoreRelic(relic, id)
  }

  scoreRelic(relic: Relic, id: CharacterId) {
    const scoringMetadata = this.getRelicScoreMeta(id)

    const scoringResult = this.score(relic, id)
    const subScore = parseFloat(scoringResult.score)
    let mainScore = 0
    if (Utils.hasMainStat(relic.part)) {
      if (scoringMetadata.parts[relic.part].includes(relic.main.stat)) {
        mainScore = 64.8
      } else {
        mainScore = scoringMetadata.stats[relic.main.stat] * 64.8
      }
    } else {
      mainScore = 64.8
    }

    const substats: [StatsValues, number][] = relic.substats.map((x) => [x.stat, scoringMetadata.stats[x.stat]])
    const substatNames = relic.substats.map((x) => x.stat)

    const substatScoreEntries = scoringMetadata.sortedSubstats
      // Exclude mainstat and already existing substats
      .filter((x) => relic.main.stat !== x[0] && !substatNames.includes(x[0]))

    // Predict best substat scores
    const bestRollPrediction = predictExtraRollWeight(
      substats, relic.grade, relic.enhance, substatScoreEntries, (weights) => Math.max(...weights),
    )
    const bestFinalSubstats = substats.concat(bestRollPrediction.newSubstats)
    const avgWeight = (
      bestFinalSubstats.reduce((a, b) => a + b[1], 0)
      - bestRollPrediction.newSubstats.reduce((a, b) => a + b[1], 0) / 2
    ) / 4
    const bestExtraRolls = bestRollPrediction.extraRolls

    // Predict worst substat scores
    substatScoreEntries.reverse() // prioritise worst substats
    const worstExtraRolls = predictExtraRollWeight(
      substats, relic.grade, relic.enhance, substatScoreEntries, (weights) => Math.min(...weights),
    ).extraRolls

    const currentWeight = Utils.precisionRound(subScore + mainScore)
    return {
      current: currentWeight,
      best: currentWeight + bestExtraRolls * 6.48,
      average: currentWeight + bestExtraRolls * 6.48 * avgWeight,
      worst: currentWeight + worstExtraRolls * minRollValue,
      meta: {
        bestSubstats: bestFinalSubstats.map((s) => s[0]),
      },
    }
  }

  static score(relic, characterId) {
    return new RelicScorer().score(relic, characterId)
  }

  score(relic, characterId): {
    score: string
    rating: string
    mainStatScore: number
    part?: number
    meta?: object
  } {
    // console.log('score', relic, characterId)

    if (!relic) {
      return {
        score: '0',
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
          score: '0',
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

    const multipliers: ScoringMetadata = DB.getScoringMetadata(characterId).stats

    let sum = 0
    for (const substat of relic.substats) {
      sum += substat.value * (multipliers[substat.stat] || 0) * scaling[substat.stat]
    }

    sum += mainStatFreeRoll(relic.part, relic.main.stat, multipliers)

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
  }
}
