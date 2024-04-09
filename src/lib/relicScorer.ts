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
  // Bucketised substats
  groupedSubstats: Map<number, StatsValues[]>
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
// - array of [weight, ...] for possible new stats in priority order (usually sort by weight asc or desc)
// - selection function to choose the substat weight extra rolls will go into (usually min/max)
//
// Returns:
// - predicted additional weight (unscaled by roll value - usually multiply by 6.48 or minRollValue after)
// - array of [[new substat name, weight], ...]
function predictExtraRollWeight(substats, grade, enhance, possibleNewWeights, substatWeightSelector) {
  const missingSubstats = (4 - substats.length)
  const missingRolls = Math.ceil(((15 - (5 - grade) * 3) - enhance) / 3) - missingSubstats
  // console.log(grade, enhance, missingSubstats, missingRolls)

  const newSubstatWeights = possibleNewWeights.slice(0, missingSubstats)
  const finalSubstatWeights = substats.map((x) => x[1]).concat(newSubstatWeights)
  const rollSubstatWeight = substatWeightSelector(finalSubstatWeights)

  let extraRolls = 0

  for (let i = 0; i < missingSubstats; i++) {
    extraRolls += 1 * newSubstatWeights[i]
  }

  for (let i = 0; i < missingRolls; i++) {
    extraRolls += rollSubstatWeight
  }

  // console.log(substats, newSubstatWeights, finalSubstatWeights, extraRolls)
  return {
    extraRolls: extraRolls,
    newSubstatWeights: newSubstatWeights,
    rollSubstatWeight: missingRolls > 0 ? rollSubstatWeight : null,
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
      scoringMetadata.groupedSubstats = new Map()
      for (const [s, w] of scoringMetadata.sortedSubstats) {
        if (!scoringMetadata.groupedSubstats.has(w)) {
          scoringMetadata.groupedSubstats.set(w, [])
        }
        scoringMetadata.groupedSubstats.get(w)!.push(s)
      }
      for (const stats of scoringMetadata.groupedSubstats.values()) {
        stats.sort()
      }
      this.characterRelicScoreMetas.set(id, scoringMetadata)
    }
    return scoringMetadata
  }

  static scoreCharacterWithRelics(character, relics) {
    return new RelicScorer().scoreCharacterWithRelics(character, relics)
  }

  scoreCharacterWithRelics(character, relics) {
    if (!character?.id) return {}

    const scoredRelics = relics.map((x) => this.score(x, character.id))

    let sum = 0
    for (const relic of scoredRelics) {
      sum += Number(relic.score) + Number(relic.mainStatScore)
    }

    const missingSets = 3 - countPairs(relics.filter((x) => x != undefined).map((x) => x.set))
    const deduction = missingSets * minRollValue * 3
    // console.log(`Missing sets ${missingSets} sets, deducting ${deduction} score`)
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
    if (!character?.id) return {}

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
    let mainStat
    if (Utils.hasMainStat(part)) {
      // Need the specific optimal mainstat to remove it from possible substats. Find it by
      // - finding the highest multiplier mainstat of those valid for this relic
      // - looking at all stats with this exact multiplier and biasing towards
      //   a) ideal mainstats and b) mainstats that can't be substats
      //   in that order
      //
      // NOTE: we deliberately ignore 'ideal' mainstats here as they can have varying weights
      // which causes unintuitive optimal relic creation effects (i.e. it's best to choose the
      // lowest weighted one so the higher weighted one ends up as a substat and be scored
      // normally)
      const optimalMainStats = scoringMetadata.parts[part]
      // First candidate, i.e. has the highest weight
      const mainStatIndex = scoreEntries.findIndex(([name, _weight]) => PartsMainStats[part].includes(name))
      const mainStatWeight = scoreEntries[mainStatIndex][1]
      // Worst case, will be overriden on first loop iteration by true values
      let isIdeal = false
      let isSubstat = true
      // Look at all stats of the same weight and see if they're 'better' (as documented above)
      for (let i = mainStatIndex; i < scoreEntries.length; i++) {
        const [name, weight] = scoreEntries[i]
        if (weight !== mainStatWeight) {
          break
        }
        if (!PartsMainStats[part].includes(name)) {
          continue
        }
        const newIsIdeal = optimalMainStats.includes(name)
        const newIsSubstat = possibleSubstats.has(name)
        if (isIdeal && !newIsIdeal) {
          continue
        } else if (isIdeal === newIsIdeal && isSubstat && !newIsSubstat) {
          continue
        }
        // We're improving on the idealness or the substatness of this mainstat
        mainStat = name
        isIdeal = newIsIdeal
        isSubstat = newIsSubstat
      }
      // Ignore main stat for max weight
      // maxWeight += mainStatWeight * 64.8
    } else {
      mainStat = scoreEntries.find(([name, _weight]) => PartsMainStats[part][0] === name)![0]
    }

    // Now get substat score entries, excluding the mainstat
    const substatScoreEntries = scoringMetadata.sortedSubstats.filter(([name, _]) => name !== mainStat)

    const substats = substatScoreEntries.slice(0, 4)
    maxWeight += substats.reduce((weightSum, [_name, weight]) => weightSum + weight, 0) * 6.48

    const optimalRollPrediction = predictExtraRollWeight(
      // We should never need new weight for a substat, relic has all substats
      substats, 5, 0, [], (weights) => Math.max(...weights),
    )
    maxWeight += optimalRollPrediction.extraRolls * 6.48

    if (!this.optimalPartCharacterScore.has(part)) {
      this.optimalPartCharacterScore.set(part, new Map())
    }
    this.optimalPartCharacterScore.get(part)!.set(id, maxWeight)
    return maxWeight
  }

  static scoreRelicPct(relic, id, withMeta = false) {
    return new RelicScorer().scoreRelicPct(relic, id, withMeta)
  }

  scoreRelicPct(relic: Relic, id: CharacterId, withMeta: boolean = false) {
    const maxWeight = this.scoreOptimalRelic(relic.part, id)
    const score = this.scoreRelic(relic, id, withMeta)

    if (Utils.hasMainStat(relic.part)) {
      // undo mainstat free roll as it's not relevant for potential
      const scoringMetadata = this.getRelicScoreMeta(id)
      const freeRoll = mainStatFreeRoll(relic.part, relic.main.stat, scoringMetadata.stats)
      score.best -= freeRoll
      score.average -= freeRoll
      score.worst -= freeRoll
    }

    // TODO: we assume it's always possible to get a worthless relic, i.e. 0 weight - not true,
    // but close enough for now
    // We max it a 0 to avoid negative percents
    return {
      bestPct: Math.max(0, 100 * score.best / maxWeight),
      averagePct: Math.max(0, 100 * score.average / maxWeight),
      worstPct: Math.max(0, 100 * score.worst / maxWeight),
      meta: score.meta,
    }
  }

  static scoreRelic(relic, id, withMeta = false) {
    return new RelicScorer().scoreRelic(relic, id, withMeta)
  }

  scoreRelic(relic: Relic, id: CharacterId, withMeta: boolean = false) {
    const scoringMetadata = this.getRelicScoreMeta(id)

    const scoringResult = this.score(relic, id)
    const subScore = parseFloat(scoringResult.score)

    // Turn the main stat score into a deduction if using a suboptimal main
    let mainScoreDeduction = 0
    if (Utils.hasMainStat(relic.part)) {
      const mainStatWeight = getMainStatWeight(relic, scoringMetadata)
      mainScoreDeduction = mainStatWeight * 64.8 - 64.8
    }

    const substats: [StatsValues, number][] = relic.substats.map((x) => [x.stat, scoringMetadata.stats[x.stat]])
    const substatNames = relic.substats.map((x) => x.stat)

    const substatScoreWeights = scoringMetadata.sortedSubstats
      // Exclude mainstat and already existing substats
      .filter((x) => relic.main.stat !== x[0] && !substatNames.includes(x[0]))
      .map(([_s, w]) => w)

    // Predict best substat scores
    const bestRollPrediction = predictExtraRollWeight(
      substats, relic.grade, relic.enhance, substatScoreWeights, (weights) => Math.max(...weights),
    )
    const avgWeight = (
      substats.reduce((a, b) => a + b[1], 0)
      + bestRollPrediction.newSubstatWeights.reduce((a, b) => a + b, 0) / 2
    ) / 4
    const bestExtraRolls = bestRollPrediction.extraRolls

    // Predict worst substat scores
    substatScoreWeights.reverse() // prioritise worst substats
    const worstExtraRolls = predictExtraRollWeight(
      substats, relic.grade, relic.enhance, substatScoreWeights, (weights) => Math.min(...weights),
    ).extraRolls

    let meta: { bestNewSubstats: StatsValues[]; bestRolledSubstats: StatsValues[] } | undefined = undefined
    if (withMeta) {
      // Given the weights of new substats, which substats could have been picked?
      // (all substats matching those weights, except current substats and the mainstat)
      const bestNewSubstats: string[] = bestRollPrediction.newSubstatWeights
        .flatMap((w) => scoringMetadata.groupedSubstats.get(w))
        .filter((s) => relic.main.stat !== s && !substatNames.includes(s))
      // All possible substats that could end up somewhere on the relic
      const finalPossibleBestSubstats = new Set(substatNames.concat(bestNewSubstats))
      // Given the weight of substats that rolls went into, what could the substats have been?
      // (all substats currently on the relic or that could have been added, that match the weight)
      let bestRolledSubstats
      if (bestRollPrediction.rollSubstatWeight !== null) {
        bestRolledSubstats = scoringMetadata.groupedSubstats
          .get(bestRollPrediction.rollSubstatWeight)!
          .filter((s) => finalPossibleBestSubstats.has(s))
      }
      meta = {
        bestNewSubstats: [...new Set(bestNewSubstats)],
        bestRolledSubstats: bestRolledSubstats,
      }
    }

    const currentWeight = Utils.precisionRound(subScore + mainScoreDeduction)
    return {
      current: Math.max(0, currentWeight),
      best: Math.max(0, currentWeight + bestExtraRolls * 6.48),
      average: Math.max(0, currentWeight + bestExtraRolls * 6.48 * avgWeight),
      worst: Math.max(0, currentWeight + worstExtraRolls * minRollValue),
      meta: meta,
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

    const scoringMetadata: ScoringMetadata = DB.getScoringMetadata(characterId)
    const multipliers = scoringMetadata.stats

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
    const metaParts = scoringMetadata.parts
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
      meta: scoringMetadata,
    }
  }
}

// Hands/Head have no weight. Optimal main stats are 1.0 weight, and anything else inherits the substat weight.
function getMainStatWeight(relic, scoringMetadata) {
  if (!Utils.hasMainStat(relic.part)) {
    return 0
  }
  if (scoringMetadata.parts[relic.part].includes(relic.main.stat)) {
    return 1
  }

  return scoringMetadata.stats[relic.main.stat]
}
