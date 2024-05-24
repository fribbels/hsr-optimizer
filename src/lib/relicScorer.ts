import { Constants, MainStatsValues, Parts, PartsMainStats, StatsValues, SubStatValues } from 'lib/constants'
import { Character, CharacterId } from 'types/Character'
import { Relic, RelicEnhance, RelicGrade, Stat } from 'types/Relic'
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

function mainStatFreeRoll(part, mainStat, scoringMetadata) {
  const stats = scoringMetadata.stats
  const parts = scoringMetadata.parts
  if (part == Constants.Parts.Body || part == Constants.Parts.Feet || part == Constants.Parts.PlanarSphere || part == Constants.Parts.LinkRope) {
    const multiplier = parts[part].includes(mainStat) ? 1 : stats[mainStat]
    return mainStatFreeRolls[part][mainStat] * minRollValue * multiplier
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

    // console.log('SCORE CHARACTER', character)
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

    const optimalMainStats = scoringMetadata.parts[part] || []
    const scoreEntries = Object.entries(scoringMetadata.stats)
      .map((entry: [string, number]) => {
        if (optimalMainStats.includes(entry[0])) {
          return [entry[0], 1]
        }
        return [entry[0], entry[1]]
      })
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])

    // Find the mainstat for this relic
    let mainStat = ''
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
    const subs = generateSubStats(5
      , { stat: substats[0][0], value: SubStatValues[substats[0][0]][5].high * 6 }, { stat: substats[1][0], value: SubStatValues[substats[1][0]][5].high }
      , { stat: substats[2][0], value: SubStatValues[substats[2][0]][5].high }, { stat: substats[3][0], value: SubStatValues[substats[3][0]][5].high })

    const fake = fakeRelic(5, 15, part, mainStat, subs)
    let ideal = parseFloat(this.score(fake, id).longscore)
    ideal -= mainStatFreeRoll(part, mainStat, scoringMetadata)
    maxWeight = Utils.precisionRound(ideal)

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
    let maxWeight = this.scoreOptimalRelic(relic.part, id)
    const score = this.scoreRelic(relic, id, withMeta)

    if (Utils.hasMainStat(relic.part)) {
      // undo mainstat free roll as it's not relevant for potential
      const scoringMetadata = this.getRelicScoreMeta(id)
      const freeRoll = mainStatFreeRoll(relic.part, relic.main.stat, scoringMetadata)
      score.best -= freeRoll
      score.average -= freeRoll
      score.worst -= freeRoll
    }

    // TODO: we assume it's always possible to get a worthless relic, i.e. 0 weight - not true,
    // but close enough for now
    // We max it a 0 to avoid negative percents
    if (maxWeight == 0) { // Catch the edge case of only 1 weighted substat -> gets used as mainstat
      const scoringMetadata = this.getRelicScoreMeta(id)
      if (!(scoringMetadata.sortedSubstats[0][1] > 0)) {
        return {
          bestPct: 0,
          averagePct: 0,
          worstPct: 0,
          meta: score.meta,
        }
      }
      const substats = [
        {
          stat: scoringMetadata.sortedSubstats[0][0],
          value: SubStatValues[scoringMetadata.sortedSubstats[0][0]][5].high * 6,
          rolls: {
            high: SubStatValues[scoringMetadata.sortedSubstats[0][0]][5].high,
            mid: SubStatValues[scoringMetadata.sortedSubstats[0][0]][5].mid,
            low: SubStatValues[scoringMetadata.sortedSubstats[0][0]][5].low,
          },
          addedRolls: 5,
        },
      ]
      const fake = fakeRelic(5, 15, relic.part, relic.main.stat, substats)
      const ideal = this.score(fake, id)
      maxWeight = parseFloat(ideal.longscore)
      maxWeight -= mainStatFreeRoll(relic.part, relic.main.stat, scoringMetadata)
    }
    const special = isSpecial(this.getRelicScoreMeta(id))
    let substats
    if (special.isSpecial) {
      if (relic.main.stat == special.stat2) {
        substats = [{
          stat: special.stat1,
          value: SubStatValues[special.stat1][5].high * 6,
          rolls: {
            high: SubStatValues[special.stat1][5].high,
            mid: SubStatValues[special.stat1][5].mid,
            low: SubStatValues[special.stat1][5].low,
          },
          addedRolls: 5,
        }]
      } else {
        substats = [
          {
            stat: special.stat1,
            value: SubStatValues[special.stat1][5].high * 6,
            rolls: {
              high: SubStatValues[special.stat1][5].high,
              mid: SubStatValues[special.stat1][5].mid,
              low: SubStatValues[special.stat1][5].low,
            },
            addedRolls: 5,
          },
          {
            stat: special.stat2,
            value: SubStatValues[special.stat2][5].high,
            rolls: {
              high: SubStatValues[special.stat2][5].high,
              mid: SubStatValues[special.stat2][5].mid,
              low: SubStatValues[special.stat2][5].low,
            },
            addedRolls: 0,
          },
        ]
      }
      const fake = fakeRelic(5, 15, relic.part, relic.main.stat, substats)
      const ideal = this.score(fake, id)
      maxWeight = parseFloat(ideal.longscore)
      maxWeight -= mainStatFreeRoll(relic.part, relic.main.stat, this.getRelicScoreMeta(id))
    }
    return {
      bestPct: Math.max(0, 100 * Utils.precisionRound(score.best) / maxWeight),
      averagePct: Math.max(0, 100 * Utils.precisionRound(score.average) / maxWeight),
      worstPct: Math.max(0, 100 * Utils.precisionRound(score.worst) / maxWeight),
      meta: score.meta,
    }
  }

  static scoreRelic(relic, id, withMeta = false) {
    return new RelicScorer().scoreRelic(relic, id, withMeta)
  }

  scoreRelic(relic: Relic, id: CharacterId, withMeta: boolean = false) {
    const scoringMetadata = this.getRelicScoreMeta(id)

    const scoringResult = this.score(relic, id)

    const subScore = parseFloat(scoringResult.longscore)

    // Turn the main stat score into a deduction if using a suboptimal main
    let max: number
    switch (relic.grade) {
      case 2:
        max = 12.8562
        break
      case 3:
        max = 25.8165
        break
      case 4:
        max = 43.1304
        break
      default:
        max = 64.8
        break
    }
    let mainScoreDeduction = 0
    if (Utils.hasMainStat(relic.part)) {
      const mainStatWeight = getMainStatWeight(relic, scoringMetadata)
      mainScoreDeduction = (mainStatWeight - 1) * max
    }
    const currentWeight = subScore + mainScoreDeduction

    const remainingSubStats = scoringMetadata.sortedSubstats.filter((x) => relic.main.stat !== x[0] && !relic.substats.map((x) => x.stat).includes(x[0]))
    const remainingRolls = Math.ceil(((15 - (5 - relic.grade) * 3) - relic.enhance) / 3) - 4 + relic.substats.length
    let bestNewSubstats: string[] = []

    // Calculate the highest possible score
    const fakesubs: Stat[] = [{ stat: '', value: 0 }, { stat: '', value: 0 }, { stat: '', value: 0 }, { stat: '', value: 0 }]
    for (let i = 0; i < relic.substats.length; i++) { // Carry over the already existing substats
      fakesubs[i].stat = relic.substats[i].stat
      fakesubs[i].value = relic.substats[i].value
    }
    for (let i = relic.substats.length; i < 4; i++) { // Supplement with the highest weight available substats
      fakesubs[i].stat = remainingSubStats[i - relic.substats.length][0]
      fakesubs[i].value = SubStatValues[fakesubs[i].stat][relic.grade].high
      bestNewSubstats.push(fakesubs[i].stat)
    }
    let index = findHighestWeight(fakesubs, scoringMetadata)
    fakesubs[index].value += SubStatValues[fakesubs[index].stat][relic.grade].high * remainingRolls
    const bestCase = parseFloat(this.score(fakeRelic(relic.grade, relic.enhance, relic.part, relic.main.stat, generateSubStats(
      relic.grade, fakesubs[0], fakesubs[1], fakesubs[2], fakesubs[3],
    )), id).longscore) + mainScoreDeduction

    // Calculate the average score
    for (let i = 0; i < relic.substats.length; i++) { // Carry over the already existing substats and add the average number of mid rolls to the value
      fakesubs[i].stat = relic.substats[i].stat
      fakesubs[i].value = relic.substats[i].value + remainingRolls / 4 * SubStatValues[fakesubs[i].stat][relic.grade].mid
    }
    // We want to use the score() function to score relics for maximum accuracy (and easier maintainability potentially)
    // How do we score a relic with unknown substats?
    // One option would be to score all possible relics and take the average score (ew, slow, expensive)
    // Instead, we calculate the average score of the possible new line (using a mid roll)
    // We then choose a substat to camouflage as so that the score() function is able to handle the relic
    // We divide the average score of 1 mid roll we calculated earlier by the weight and normalization of the chosen camouflage stat
    // We then multiply this by the number of rolls our filler stat will have
    // This way, when the score() function evaluates our relic, all the additional lines will score their expected average score

    // average score of 1 midroll = avg(weight * normalization * midroll)

    // avg score = avg(weight * norm * midroll) * rolls
    // AND
    // acg score = value * weight * scaling

    // Therefore

    // value = avg(weight * norm * midroll) * rolls / (weight * scaling)
    // value = average score of 1 midroll * rolls / (weight * scaling)

    let averageScore: number = 0
    const scaling = {
      [Constants.Stats.HP_P]: 64.8 / 43.2,
      [Constants.Stats.ATK_P]: 64.8 / 43.2,
      [Constants.Stats.DEF_P]: 64.8 / 54,
      [Constants.Stats.HP]: 1 / (DB.getMetadata().characters[id].promotions[80][Constants.Stats.HP] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.ATK]: 1 / (DB.getMetadata().characters[id].promotions[80][Constants.Stats.ATK] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.DEF]: 1 / (DB.getMetadata().characters[id].promotions[80][Constants.Stats.DEF] * 2 * 0.01) * (64.8 / 54),
      [Constants.Stats.CR]: 64.8 / 32.4,
      [Constants.Stats.CD]: 64.8 / 64.8,
      [Constants.Stats.OHB]: 64.8 / 34.5606,
      [Constants.Stats.EHR]: 64.8 / 43.2,
      [Constants.Stats.RES]: 64.8 / 43.2,
      [Constants.Stats.SPD]: 64.8 / 25.032,
      [Constants.Stats.BE]: 64.8 / 64.8,
    }
    for (let i = 0; i < remainingSubStats.length; i++) {
      averageScore += remainingSubStats[i][1] * scaling[remainingSubStats[i][0]] * SubStatValues[remainingSubStats[i][0]][relic.grade].mid
    }
    averageScore = averageScore / remainingSubStats.length
    for (let i = relic.substats.length; i < 4; i++) {
      fakesubs[i].stat = remainingSubStats[0][0]
      fakesubs[i].value = (averageScore * (1 + remainingRolls / 4) / (remainingSubStats[0][1] * scaling[remainingSubStats[0][0]]))
    }
    const averageCase = parseFloat(this.score(fakeRelic(relic.grade, relic.enhance, relic.part, relic.main.stat, generateSubStats(
      relic.grade, fakesubs[0], fakesubs[1], fakesubs[2], fakesubs[3],
    )), id).longscore) + mainScoreDeduction

    // Calculate the lowest possible substat scores
    remainingSubStats.reverse()
    for (let i = 0; i < relic.substats.length; i++) { // Carry over the already existing substats
      fakesubs[i].stat = relic.substats[i].stat
      fakesubs[i].value = relic.substats[i].value
    }
    for (let i = relic.substats.length; i < 4; i++) { // Supplement with the lowest weight available substats
      fakesubs[i].stat = remainingSubStats[i - relic.substats.length][0]
      fakesubs[i].value = SubStatValues[fakesubs[i].stat][relic.grade].low
    }
    index = findLowestWeight(fakesubs, scoringMetadata)
    fakesubs[index].value += SubStatValues[fakesubs[index].stat][relic.grade].low * remainingRolls
    const worstCase = parseFloat(this.score(fakeRelic(relic.grade, relic.enhance, relic.part, relic.main.stat, generateSubStats(
      relic.grade, fakesubs[0], fakesubs[1], fakesubs[2], fakesubs[3],
    )), id).longscore) + mainScoreDeduction

    // Generate Metadata
    let meta: { bestNewSubstats: StatsValues[]; bestRolledSubstats: StatsValues[] } | undefined = undefined
    if (withMeta) {
      bestNewSubstats = [] // Array of all potential additional stats
      if (relic.substats.length !== 4) {
        const worstWeight = remainingSubStats[3 - relic.substats.length][1]
        let i = 0
        while (remainingSubStats[i][1] >= worstWeight) {
          bestNewSubstats.push(remainingSubStats[i][0])
          i++
          if (i == remainingSubStats.length) break
        }
      }
      const candidateSubstats: [string, number][] = scoringMetadata.sortedSubstats.filter((x) => relic.main.stat !== x[0]) // All substats that could possibly exist on the relic
      const bestRolledSubstats: string[] = [] // Array of all substats possibly on relic sharing highest weight
      const bestWeight = candidateSubstats[0][1]
      let i = 0
      while (candidateSubstats[i][1] >= bestWeight) {
        bestRolledSubstats.push(candidateSubstats[i][0])
        i++
        if (i == candidateSubstats.length) break
      }
      meta = {
        bestNewSubstats: bestNewSubstats,
        bestRolledSubstats: bestRolledSubstats,
      }
    }

    return {
      current: Math.max(0, currentWeight),
      best: Math.max(0, bestCase),
      average: Math.max(0, averageCase),
      worst: Math.max(0, worstCase),
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
    longscore: string
  } {
    // console.log('score', relic, characterId)

    if (!relic) {
      return {
        score: '0',
        rating: 'N/A',
        mainStatScore: 0,
        longscore: '0',
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
          longscore: '0',
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
      [Constants.Stats.OHB]: 64.8 / 34.5606,
      [Constants.Stats.EHR]: 64.8 / 43.2,
      [Constants.Stats.RES]: 64.8 / 43.2,
      [Constants.Stats.SPD]: 64.8 / 25.032,
      [Constants.Stats.BE]: 64.8 / 64.8,
    }

    const scoringMetadata: ScoringMetadata = DB.getScoringMetadata(characterId)
    const multipliers = scoringMetadata.stats

    let sum = 0
    for (const substat of relic.substats) {
      sum += substat.value * (multipliers[substat.stat] || 0) * scaling[substat.stat]
    }

    sum += mainStatFreeRoll(relic.part, relic.main.stat, scoringMetadata)

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
    let max: number
    switch (relic.grade) {
      case 2:
        max = 12.8562
        break
      case 3:
        max = 25.8165
        break
      case 4:
        max = 43.1304
        break
      default:
        max = 64.8
        break
    }
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
      longscore: sum.toFixed(5),
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

// Create a fake relic to feed into score() to get accurate scores for potential relics
function fakeRelic(grade: RelicGrade, enhance: RelicEnhance, part: string, mainstat: string, substats) {
  const fake: Relic = {
    weights: undefined,
    cs: undefined,
    ds: undefined,
    ss: undefined,
    enhance: enhance,
    equippedBy: '',
    grade: grade,
    id: '',
    set: '',
    part: part,
    main: {
      stat: mainstat,
      value: MainStatsValues[mainstat][grade].base + MainStatsValues[mainstat][grade].increment * enhance,
    },
    substats: substats,
  }
  return fake
}

// Create the substats array to feed into fakeRelic(), addedRolls is left at 0 as it is not used
function generateSubStats(grade: RelicGrade, sub1: Stat, sub2: Stat, sub3: Stat, sub4: Stat) {
  const substats = [
    {
      stat: sub1.stat,
      value: sub1.value,
      rolls: {
        high: SubStatValues[sub1.stat][grade].high,
        mid: SubStatValues[sub1.stat][grade].mid,
        low: SubStatValues[sub1.stat][grade].low,
      },
      addedRolls: 0,
    }, {
      stat: sub2.stat,
      value: sub2.value,
      rolls: {
        high: SubStatValues[sub2.stat][grade].high,
        mid: SubStatValues[sub2.stat][grade].mid,
        low: SubStatValues[sub2.stat][grade].low,
      },
      addedRolls: 0,
    }, {
      stat: sub3.stat,
      value: sub3.value,
      rolls: {
        high: SubStatValues[sub3.stat][grade].high,
        mid: SubStatValues[sub3.stat][grade].mid,
        low: SubStatValues[sub3.stat][grade].low,
      },
      addedRolls: 0,
    }, {
      stat: sub4.stat,
      value: sub4.value,
      rolls: {
        high: SubStatValues[sub4.stat][grade].high,
        mid: SubStatValues[sub4.stat][grade].mid,
        low: SubStatValues[sub4.stat][grade].low,
      },
      addedRolls: 0,
    },
  ]
  return substats
}

// Checks to see if the only weighted stat is atk/hp/def, needs special handling due to flat stats
function isSpecial(scoringMetadata) {
  let special: boolean = false
  let stat1: string = ''
  let stat2: string = ''
  const substats = scoringMetadata.sortedSubstats
  if (substats[2][1] > 0 || substats[1][1] == 0) {
    return {
      isSpecial: special,
      stat1: stat1,
      stat2: stat2,
    }
  }
  if (substats[0][0] == Constants.Stats.HP_P || substats[0][0] == Constants.Stats.ATK_P || substats[0][0] == Constants.Stats.DEF_P) {
    special = true
    stat1 = substats[0][0]
    stat2 = substats[1][0]
    return {
      isSpecial: special,
      stat1: stat1,
      stat2: stat2,
    }
  }
  return {
    isSpecial: special,
    stat1: stat1,
    stat2: stat2,
  }
}

function findHighestWeight(substats, scoringMetadata) {
  let index = 0
  let weight = 0
  for (let i = 0; i < substats.length; i++) {
    const newWeight = scoringMetadata.stats[substats[i].stat]
    if (newWeight > weight) {
      weight = newWeight
      index = i
    }
  }
  return index
}

function findLowestWeight(substats, scoringMetadata) {
  let index = 0
  let weight = 1
  for (let i = 0; i < substats.length; i++) {
    const newWeight = scoringMetadata.stats[substats[i].stat]
    if (newWeight < weight) {
      weight = newWeight
      index = i
    }
  }
  return index
}
