/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Constants, MainStats, MainStatsValues, Parts, PartsMainStats, StatsValues, SubStatValues } from 'lib/constants'
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

type substat = {
  stat: string
  value: number
  rolls: {
    high: number
    mid: number
    low: number
  }
  addedRolls: number
}

const percentToScore = 1// TODO: establish a good conversion number
const minRollValue = 5.184
const mainStatBonuses = { // TODO: Establish new mainstat bonuses
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

  /**
   * returns the scoring metadata for the given character
   * @param id id of the character who's scoring data is wanted
   */
  getRelicScoreMeta(id: string): ScoringMetadata {
    let scoringMetadata = this.characterRelicScoreMetas.get(id)
    if (!scoringMetadata) {
      scoringMetadata = Utils.clone(DB.getScoringMetadata(id)) as ScoringMetadata

      const baseStats = DB.getMetadata().characters[id].stats
      scoringMetadata.stats[Constants.Stats.HP] = scoringMetadata.stats[Constants.Stats.HP_P] * 38 / (baseStats[Constants.Stats.HP] * 2 * 0.03888)
      scoringMetadata.stats[Constants.Stats.ATK] = scoringMetadata.stats[Constants.Stats.ATK_P] * 19 / (baseStats[Constants.Stats.ATK] * 2 * 0.03888)
      scoringMetadata.stats[Constants.Stats.DEF] = scoringMetadata.stats[Constants.Stats.DEF_P] * 19 / (baseStats[Constants.Stats.DEF] * 2 * 0.04860)

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

  /**
   * returns the substat score of the given relic, does not include mainstat bonus
   */
  substatScore(relic: Relic, scoringMetadata: ScoringMetadata, id: CharacterId) {
    if (!scoringMetadata && id) scoringMetadata = this.getRelicScoreMeta(id)
    if (!scoringMetadata || !id || !relic) {
      console.warn('substatScore() called but missing 1 or more arguments. relic:', relic, 'meta:', scoringMetadata, 'id:', id)
      return {
        score: 0,
        mainStatScore: 0,
        scoringMetadata,
        part: relic?.part,
      }
    }
    const baseStats = DB.getMetadata().characters[id].stats
    const normalization = {
      [Constants.Stats.HP_P]: 64.8 / 43.2,
      [Constants.Stats.ATK_P]: 64.8 / 43.2,
      [Constants.Stats.DEF_P]: 64.8 / 54,
      [Constants.Stats.HP]: 1 / (baseStats[Constants.Stats.HP] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.ATK]: 1 / (baseStats[Constants.Stats.ATK] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.DEF]: 1 / (baseStats[Constants.Stats.DEF] * 2 * 0.01) * (64.8 / 54),
      [Constants.Stats.CR]: 64.8 / 32.4,
      [Constants.Stats.CD]: 64.8 / 64.8,
      [Constants.Stats.OHB]: 64.8 / 34.5606,
      [Constants.Stats.EHR]: 64.8 / 43.2,
      [Constants.Stats.RES]: 64.8 / 43.2,
      [Constants.Stats.SPD]: 64.8 / 25.032,
      [Constants.Stats.BE]: 64.8 / 64.8,
    }
    const weights = scoringMetadata.stats
    let score = 0
    for (const substat of relic.substats) {
      score += substat.value * (weights[substat.stat] || 0) * normalization[substat.stat]
    }
    const mainStatScore = ((stat, grade, part, metaParts) => {
      if ([Constants.Parts.Head, Constants.Parts.Hands].includes(part)) return 0
      let max = 0
      switch (grade) {
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
      }
      return max * (metaParts[part].includes(stat) ? 1 : weights[stat])
    })(relic.main.stat, relic.grade, relic.part, scoringMetadata.parts)
    return {
      score,
      mainStatScore,
      part: relic.part,
      scoringMetadata,
    }
  }

  /**
   * returns the substat score for the ideal relic
   * @param part relic slot
   * @param id id of character to score against, used for caching
   * @param meta optional relicScoreMeta for this character
   */
  scoreOptimalRelic(part: Parts, id: CharacterId, meta?: ScoringMetadata) {
    const cachedScore = this.optimalPartCharacterScore.get(part)?.get(id)
    if (cachedScore != null) {
      return cachedScore
    }
    let maxScore: number = 0
    if (!meta) meta = this.getRelicScoreMeta(id)
    let mainStat = ''
    const optimalMainStats = meta.parts[part] || []
    // list of stats, sorted by weight as mainstat in decreasing order
    const scoreEntries: [string, number][] = Object.entries(meta.stats)
      .map((entry: [string, number]) => {
        if (optimalMainStats.includes(entry[0])) {
          return [entry[0], 1]
        } else return [entry[0], entry[1]]
      })
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    if (Utils.hasMainStat(part)) {
      /*
      * Need the specific optimal mainstat to remove it from possible substats. Find it by
      * - finding the highest multiplier mainstat of those valid for this relic
      * - looking at all stats with this exact multiplier and biasing towards
      *   a) ideal mainstats and
      *   b) mainstats that can't be substats in that order
      *
      * NOTE: we deliberately ignore 'ideal' mainstats here as they can have varying weights
      * which causes unintuitive optimal relic creation effects (i.e. it's best to choose the
      * lowest weighted one so the higher weighted one ends up as a substat and be scored
      * normally) TODO: Go over this in the discord, implementation does not align with note
      */
      // First candidate (i.e. has highest weight)
      const mainStatIndex = scoreEntries.findIndex(([name, _weight]) => PartsMainStats[part].includes(name))
      const mainStatWeight = scoreEntries[mainStatIndex][1]
      mainStat = scoreEntries[mainStatIndex][0]
      // Worst case, will be overwritten by true values on first loop iteration
      let isIdeal = false
      let isSubstat = true
      // look at all stats of weight equal to highest weight stat and find any 'better' mainstats
      for (let i = mainStatIndex; i < scoreEntries.length; i++) {
        const [name, weight] = scoreEntries[i]
        if (weight != mainStatWeight) break// sorted by weight, weight no longer equal means all following will be lower
        if (!PartsMainStats[part].includes(name)) continue// check for possible mainstat
        const newIsIdeal = optimalMainStats.includes(name)
        const newIsSubstat = possibleSubstats.has(name)
        if (isIdeal && !newIsIdeal) continue// prefer ideal mainstats
        if (!isSubstat && newIsSubstat) continue// prefer mainstats that can't be substats
        if (isIdeal === newIsIdeal && isSubstat == newIsSubstat) continue
        mainStat = name
        isIdeal = newIsIdeal
        isSubstat = newIsSubstat
      }
    } else {
      mainStat = scoreEntries.find(([name, _weight]) => PartsMainStats[part][0] === name)![0]
    }

    const substatScoreEntries = meta.sortedSubstats.filter(([name, _]) => name !== mainStat)
    const substats = substatScoreEntries.slice(0, 4)
    const subs = generateSubStats(
      5, { stat: substats[0][0], value: SubStatValues[substats[0][0]][5].high * 6 }, { stat: substats[1][0], value: SubStatValues[substats[1][0]][5].high }
      , { stat: substats[2][0], value: SubStatValues[substats[2][0]][5].high }, { stat: substats[3][0], value: SubStatValues[substats[3][0]][5].high },
    )
    const fake = fakeRelic(5, 15, part, mainStat, subs)
    maxScore = this.substatScore(fake, meta, id).score

    if (!this.optimalPartCharacterScore.has(part)) {
      this.optimalPartCharacterScore.set(part, new Map())
    }
    this.optimalPartCharacterScore.get(part)!.set(id, maxScore)
    return maxScore
  }

  /**
   * returns the current score of the relic, as well as the best, worst, and average scores when at max enhance\
   * meta field includes the ideal added and/or upgraded substats for the relic
   */
  static scoreFutureRelic(relic: Relic, characterId: CharacterId, scoringMetadata?: ScoringMetadata) {
    return new RelicScorer().scoreFutureRelic(relic, characterId, scoringMetadata)
  }

  /**
   * returns the current score of the relic, as well as the best, worst, and average scores when at max enhance\
   * meta field includes the ideal added and/or upgraded substats for the relic
   */
  scoreFutureRelic(relic: Relic, id: CharacterId, withMeta: boolean = false, meta?: ScoringMetadata) {
    if (!id || !relic) {
      console.warn('scoreFutureRelic() called but lacking arguments')
      return {
        current: 0,
        best: 0,
        average: 0,
        worst: 0,
        meta: {
          bestAddedStats: [''],
          bestUpgradedStats: [''],
        },
        substatScore: {
          best: 0,
          average: 0,
          worst: 0,
        },
      }
    }
    if (!meta) meta = this.getRelicScoreMeta(id)
    if (!meta.sortedSubstats[0][0]) return { // 0 weighted substats
      current: 0,
      best: 0,
      average: 0,
      worst: 0,
      meta: {
        bestAddedStats: [''],
        bestUpgradedStats: [''],
      },
      substatScore: {
        best: 0,
        average: 0,
        worst: 0,
      },
    }
    const maxMainstat = (() => {
      switch (relic.grade) {
        case 2:
          return 12.8562
        case 3:
          return 25.8165
        case 4:
          return 43.1304
        case 5:
          return 64.8
      }
    })()
    const mainstatDeduction = (() => {
      if (Utils.hasMainStat(relic.part)) {
        return (getMainStatWeight(relic, meta) - 1) * maxMainstat
      } else return 0
    })()
    const substatscores = { best: 0, average: 0, worst: 0 }
    const availableSubstats = meta.sortedSubstats.filter((x) => x[0] != relic.main.stat && !relic.substats.map((x) => x.stat).includes(x[0]))
    const remainingRolls = Math.ceil((maxEnhance(relic.grade) - relic.enhance) / 3) - (4 - relic.substats.length)
    const mainstatBonus = mainStatBonus(relic.part, relic.main.stat, meta)
    const idealScore = this.scoreOptimalRelic(relic.part, id, meta)
    const current = Math.max(0, this.substatScore(relic, meta, id).score / idealScore * 100 * percentToScore + mainstatBonus + mainstatDeduction)

    // evaluate best possible outcome
    const bestSubstats: Stat[] = [{ stat: '', value: 0 }, { stat: '', value: 0 }, { stat: '', value: 0 }, { stat: '', value: 0 }]
    for (let i = 0; i < relic.substats.length; i++) { // we pass values instead of references to avoid accidentally modifying the actual relic
      bestSubstats[i].stat = relic.substats[i].stat
      bestSubstats[i].value = relic.substats[i].value
    }// after copying over existing lines, supplement to 4 lines if necessary
    for (let i = relic.substats.length; i < 4; i++) {
      const stat = availableSubstats[i - relic.substats.length][0]
      bestSubstats[i].stat = stat
      bestSubstats[i].value = SubStatValues[stat][5].high
    }
    const bestSub = findHighestWeight(bestSubstats, meta)
    bestSubstats[bestSub.index].value += remainingRolls * SubStatValues[bestSub.stat][relic.grade].high
    let fake = fakeRelic(relic.grade, maxEnhance(relic.grade), relic.part, relic.main.stat, generateSubStats(
      5, bestSubstats[0], bestSubstats[1], bestSubstats[2], bestSubstats[3],
    ))
    substatscores.best = this.substatScore(fake, meta, id).score + mainstatDeduction
    const best = Math.max(0, substatscores.best / idealScore * 100 * percentToScore + mainstatBonus)

    // evaluate average outcome
    const averageSubstats: Stat[] = [{ stat: '', value: 0 }, { stat: '', value: 0 }, { stat: '', value: 0 }, { stat: '', value: 0 }]
    for (let i = 0; i < relic.substats.length; i++) { // we pass values instead of references to avoid accidentally modifying the actual relic
      averageSubstats[i].stat = relic.substats[i].stat
      averageSubstats[i].value = relic.substats[i].value + remainingRolls / 4 * SubStatValues[averageSubstats[i].stat][relic.grade].mid
    }
    /*
    * We want to use the score() function to score relics for maximum accuracy (and easier maintainability potentially)
    * How do we score a relic with unknown substats?
    * One option would be to score all possible relics and take the average score (ew, slow, expensive)
    * Instead, we calculate the average score of the possible new line (using a mid roll)
    * We then choose a substat to camouflage as so that the score() function is able to handle the relic
    * We divide the average score of 1 mid roll we calculated earlier by the weight and normalization of the chosen camouflage stat
    * We then multiply this by the number of rolls our filler stat will have
    * This way, when the score() function evaluates our relic, all the additional lines will score their expected average score

    * average score of 1 midroll = avg(weight * normalization * midroll)

    * avg score = avg(weight * norm * midroll) * rolls
    * AND
    * avg score = value * weight * scaling

    * Therefore

    * value = avg(weight * norm * midroll) * rolls / (weight * scaling)
    * value = average score of 1 midroll * rolls / (weight * scaling)
    */
    let averageScore = 0
    const baseStats = DB.getMetadata().characters[id].stats
    const normalization = {
      [Constants.Stats.HP_P]: 64.8 / 43.2,
      [Constants.Stats.ATK_P]: 64.8 / 43.2,
      [Constants.Stats.DEF_P]: 64.8 / 54,
      [Constants.Stats.HP]: 1 / (baseStats[Constants.Stats.HP] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.ATK]: 1 / (baseStats[Constants.Stats.ATK] * 2 * 0.01) * (64.8 / 43.2),
      [Constants.Stats.DEF]: 1 / (baseStats[Constants.Stats.DEF] * 2 * 0.01) * (64.8 / 54),
      [Constants.Stats.CR]: 64.8 / 32.4,
      [Constants.Stats.CD]: 64.8 / 64.8,
      [Constants.Stats.OHB]: 64.8 / 34.5606,
      [Constants.Stats.EHR]: 64.8 / 43.2,
      [Constants.Stats.RES]: 64.8 / 43.2,
      [Constants.Stats.SPD]: 64.8 / 25.032,
      [Constants.Stats.BE]: 64.8 / 64.8,
    }
    for (const pair of availableSubstats) {
      const [stat, weight] = pair
      averageScore += SubStatValues[stat][relic.grade].mid * weight * normalization[stat]
    }
    averageScore = averageScore / availableSubstats.length
    for (let i = relic.substats.length; i < 4; i++) {
      averageSubstats[i].stat = meta.sortedSubstats[0][0]
      averageSubstats[i].value = averageScore * (1 + remainingRolls / 4) / (normalization[meta.sortedSubstats[0][0]] * meta.sortedSubstats[0][1])
    }
    fake = fakeRelic(relic.grade, maxEnhance(relic.grade), relic.part, relic.main.stat, generateSubStats(
      5, averageSubstats[0], averageSubstats[1], averageSubstats[2], averageSubstats[3],
    ))
    substatscores.average = this.substatScore(fake, meta, id).score + mainstatDeduction
    const average = Math.max(0, substatscores.average / idealScore * 100 * percentToScore + mainstatBonus)

    // evaluate worst possible outcome
    availableSubstats.reverse()
    const worstSubstats: Stat[] = [{ stat: '', value: 0 }, { stat: '', value: 0 }, { stat: '', value: 0 }, { stat: '', value: 0 }]
    for (let i = 0; i < relic.substats.length; i++) { // we pass values instead of references to avoid accidentally modifying the actual relic
      worstSubstats[i].stat = relic.substats[i].stat
      worstSubstats[i].value = relic.substats[i].value
    }// after copying over existing lines, supplement to 4 lines if necessary
    for (let i = relic.substats.length; i < 4; i++) {
      const stat = availableSubstats[i - relic.substats.length][0]
      worstSubstats[i].stat = stat
      worstSubstats[i].value = SubStatValues[stat][5].high
    }
    const worstSub = findLowestWeight(worstSubstats, meta)
    worstSubstats[worstSub.index].value += SubStatValues[worstSub.stat][relic.grade].low * remainingRolls
    fake = fakeRelic(relic.grade, maxEnhance(relic.grade), relic.part, relic.main.stat, generateSubStats(
      5, worstSubstats[0], worstSubstats[1], worstSubstats[2], worstSubstats[3],
    ))
    substatscores.worst = this.substatScore(fake, meta, id).score + mainstatDeduction
    const worst = Math.max(0, substatscores.worst / idealScore * 100 * percentToScore + mainstatBonus)

    let levelupMetadata: { bestAddedStats: StatsValues[]; bestUpgradedStats: StatsValues[] } | undefined = undefined
    if (withMeta) {
      const bestAddedStats: StatsValues[] = []
      if (relic.substats.length < 4) {
        for (const [stat, weight] of availableSubstats) {
          if (weight >= availableSubstats[availableSubstats.length - 1][1]) {
            bestAddedStats.push(stat)
          }
        }
      }
      const candidateSubstats: [string, number][] = meta.sortedSubstats.filter((x) => relic.main.stat !== x[0]) // All substats that could possibly exist on the relic
      const bestUpgradedStats: string[] = [] // Array of all substats possibly on relic sharing highest weight

      const validUpgrades = {
        ...Utils.arrayToMap(relic.substats, 'stat'),
        ...Utils.stringArrayToMap(bestAddedStats),
      }

      const upgradeCandidates = candidateSubstats.filter((candidateSubstats) => validUpgrades[candidateSubstats[0]])
      const bestWeight = upgradeCandidates[0][1]
      for (const [stat, weight] of upgradeCandidates) {
        if (validUpgrades[stat] && weight >= bestWeight) {
          bestUpgradedStats.push(stat)
        }
      }
      levelupMetadata = {
        bestAddedStats: bestAddedStats,
        bestUpgradedStats: bestUpgradedStats,
      }
    }

    return {
      current,
      best,
      average,
      worst,
      meta: levelupMetadata,
      substatScore: substatscores,
    }
  }

  /**
   * returns the current score, mainstat score, and rating for the relic\
   * additionally returns the part, and scoring metadata
   */
  static scoreCurrentRelic(relic: Relic, id: CharacterId, meta: ScoringMetadata) {
    return new RelicScorer().scoreCurrentRelic(relic, id, meta)
  }

  /**
   * returns the current score, mainstat score, and rating for the relic\
   * additionally returns the part, and scoring metadata
   */
  scoreCurrentRelic(relic: Relic, id: CharacterId, meta?: ScoringMetadata): {
    score: string
    rating: string
    mainStatScore: number
    part?: Parts
    meta?: ScoringMetadata
  } {
    if (!relic) {
      console.warn('scoreCurrentRelic called but no relic given')
      return {
        score: '',
        rating: '???',
        mainStatScore: 0,
      }
    }
    if (!meta && !id) {
      console.warn('scoreCurrentRelic called but lacking character and meta arguments')
      return {
        score: '',
        rating: '???',
        mainStatScore: 0,
      }
    }
    if (!meta) meta = this.getRelicScoreMeta(id)
    const part = relic.part
    const mainstatBonus = mainStatBonus(relic.part, relic.main.stat, meta)
    const substatScore = this.substatScore(relic, meta, id)
    const idealScore = this.scoreOptimalRelic(part, id, meta)
    const score = substatScore.score / idealScore * 100 * percentToScore + mainstatBonus
    const rating = scoreToRating(score)
    const mainStatScore = substatScore.mainStatScore
    return {
      score: score.toFixed(1),
      rating,
      mainStatScore,
      part,
      meta,
    }
  }

  /**
   * returns a score (number) and rating (string) for the character, and the scored relics
   * @param character character object to score
   * @param relics relics to score against the character
   */
  static scoreCharacterWithRelics(character: Character, relics: Relic[]) {
    return new RelicScorer().scoreCharacterWithRelics(character, relics)
  }

  /**
   * returns a score (number) and rating (string) for the character, and the scored relics
   * @param character character object to score
   * @param relics relics to score against the character
   */
  scoreCharacterWithRelics(character: Character, relics: Relic[]): { relics: object[]; totalScore: number; totalRating: string } {
    if (!character?.id) {
      console.warn('scoreCharacterWithRelics called but no character given')
      return {
        relics: [],
        totalScore: 0,
        totalRating: '???',
      }
    }

    const scoredRelics = relics.map((x) => this.scoreCurrentRelic(x, character.id, this.getRelicScoreMeta(character.id)))
    let totalScore = 0
    for (const relic of scoredRelics) {
      totalScore += Number(relic.score) + Number(relic.mainStatScore)
    }
    const missingSets = 3 - countPairs(relics.filter((x) => x != undefined).map((x) => x.set))
    totalScore = Math.max(0, totalScore - missingSets * 3 * minRollValue)
    const totalRating = scoreToRating((totalScore - 4 * 64.8) / 6)
    return {
      relics: scoredRelics,
      totalScore,
      totalRating,
    }
  }

  /**
   * returns a score (number) and rating (string) for the character, and the scored equipped relics
   * @param character character object to score
   */
  static scoreCharacter(character: Character) {
    return new RelicScorer().scoreCharacter(character)
  }

  /**
   * returns a score (number) and rating (string) for the character, and the scored equipped relics
   * @param character character object to score
   */
  scoreCharacter(character: Character) {
    if (!character) return {}
    const relicsById = window.store.getState().relicsById
    const relics: Relic[] = Object.values(character.equipped).map((x) => relicsById[x ?? ''])
    return this.scoreCharacterWithRelics(character, relics)
  }

  /**
   * evaluates the max, min, and avg potential optimalities of a relic
   * @param relic relic to evaluate
   * @param characterId id of character to evaluate against
   * @param withMeta whether or not to include the character scoringMetadata in the return
   */
  static scoreRelicPotential(relic: Relic, characterId: CharacterId, withMeta: boolean = false) {
    return new RelicScorer().scoreRelicPotential(relic, characterId, withMeta)
  }

  /**
   * evaluates the max, min, and avg potential optimalities of a relic
   * @param relic relic to evaluate
   * @param characterId id of character to evaluate against
   * @param withMeta whether or not to include the character scoringMetadata in the return
   */
  scoreRelicPotential(relic: Relic, id: CharacterId, withMeta: boolean = false, meta?: ScoringMetadata) {
    if (!meta) meta = this.getRelicScoreMeta(id)
    const handlingCase = getHandlingCase(meta)
    const mainstatBonus = mainStatBonus(relic.part, relic.main.stat, meta)
    const futureScore = this.scoreFutureRelic(relic, id, withMeta, meta)
    const actualScore = futureScore.substatScore
    let [bestPct, averagePct, worstPct] = [0, 0, 0]
    if (Utils.hasMainStat(relic.part)) {
      actualScore.best -= mainstatBonus
      actualScore.average -= mainstatBonus
      actualScore.worst -= mainstatBonus
      futureScore.best -= mainstatBonus
      futureScore.average -= mainstatBonus
      futureScore.worst -= mainstatBonus
    }
    switch (handlingCase) {
      case relicPotentialCases.HP:
      // falls through
      case relicPotentialCases.ATK:
      // falls through
      case relicPotentialCases.DEF:
        {
          let substats: substat[] = []
          const stat1 = meta.sortedSubstats[0][0]
          const stat2 = meta.sortedSubstats[1][0]
          if (relic.part == Constants.Parts.Head && handlingCase == relicPotentialCases.HP
            || relic.part == Constants.Parts.Hands && handlingCase == relicPotentialCases.ATK
          ) { // we assume % will always score better than flat, hoyo pls no punish
            substats = [{
              stat: stat1,
              value: SubStatValues[stat1][5].high * 6,
              rolls: {
                high: SubStatValues[stat1][5].high,
                mid: SubStatValues[stat1][5].mid,
                low: SubStatValues[stat1][5].low,
              },
              addedRolls: 5,
            }]
          } else {
            substats = [{
              stat: stat1,
              value: SubStatValues[stat1][5].high * 6,
              rolls: {
                high: SubStatValues[stat1][5].high,
                mid: SubStatValues[stat1][5].mid,
                low: SubStatValues[stat1][5].low,
              },
              addedRolls: 5,
            },
            {
              stat: stat2,
              value: SubStatValues[stat2][5].high,
              rolls: {
                high: SubStatValues[stat2][5].high,
                mid: SubStatValues[stat2][5].mid,
                low: SubStatValues[stat2][5].low,
              },
              addedRolls: 5,
            }]
          }
          const fake = fakeRelic(5, 15, relic.part, relic.main.stat, substats)
          const idealScore = this.substatScore(fake, meta, id).score
          bestPct = Math.max(0, actualScore.best / idealScore * 100)
          averagePct = Math.max(0, actualScore.average / idealScore * 100)
          worstPct = Math.max(0, actualScore.worst / idealScore * 100)
        }
        break

      case relicPotentialCases.SINGLE_STAT: { // we assume the user is looking for the maximum value in substats alone for the singular weighted stat
        const normalization = { // we don't need hp/atk/def since those will always lead to either 2 or 0 weighted stats (flat stat + % stat)
          [Constants.Stats.CR]: 64.8 / 32.4,
          [Constants.Stats.CD]: 64.8 / 64.8,
          [Constants.Stats.OHB]: 64.8 / 34.5606,
          [Constants.Stats.EHR]: 64.8 / 43.2,
          [Constants.Stats.RES]: 64.8 / 43.2,
          [Constants.Stats.SPD]: 64.8 / 25.032,
          [Constants.Stats.BE]: 64.8 / 64.8,
        }
        const stat = meta.sortedSubstats[0][0]
        const idealScore = normalization[stat] * SubStatValues[stat][5].high * meta.stats[stat]
        bestPct = Math.max(0, actualScore.best / idealScore * 100)
        averagePct = Math.max(0, actualScore.average / idealScore * 100)
        worstPct = Math.max(0, actualScore.worst / idealScore * 100)
        break
      }

      case relicPotentialCases.NORMAL: {
        bestPct = Math.max(0, futureScore.best / percentToScore)
        averagePct = Math.max(0, futureScore.average / percentToScore)
        worstPct = Math.max(0, futureScore.worst / percentToScore)
        break
      }

      default:
        console.error('unknown handling case encountered in scoreRelicPotential')
        break
    }
    return {
      bestPct,
      averagePct,
      worstPct,
      meta: futureScore.meta,
    }
  }
}

function countPairs(arr: string[]) {
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

/**
 * calculates the appropriate bonus score for the part-mainstat pairing, scales with stat weight if non-optimal mainstat
 */
function mainStatBonus(part: Parts, mainStat: MainStats, scoringMetadata: ScoringMetadata) {
  const stats = scoringMetadata.stats
  const parts = scoringMetadata.parts
  if (part == Constants.Parts.Body || part == Constants.Parts.Feet || part == Constants.Parts.PlanarSphere || part == Constants.Parts.LinkRope) {
    const multiplier = parts[part].includes(mainStat) ? 1 : stats[mainStat]// TODO: add scaling of mainstatBonus to explainer text
    return mainStatBonuses[part][mainStat] * minRollValue * multiplier
  }
  return 0
}

/**
 * creates a fake relic that can be submitted for scoring
 * @param grade relic rarity
 * @param enhance relic level
 * @param part relic slot
 * @param mainstat relic primary stat
 * @param substats array of substats, recommended to obtain via generateSubStats()
 */
function fakeRelic(grade: RelicGrade, enhance: RelicEnhance, part: string, mainstat: string, substats: substat[]): Relic {
  return {
    weights: undefined,
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
}

/**
 * used to generate substats for fakeRelic() more easily
 * @param grade relic rarity
 * @param subn substat line n
 * @returns array of substats for a relic
 */
function generateSubStats(grade: RelicGrade, sub1: Stat, sub2: Stat, sub3: Stat, sub4: Stat): substat[] {
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

enum relicPotentialCases {
  SINGLE_STAT,
  HP,
  ATK,
  DEF,
  NORMAL,
}
/**
 * Analyses the scoringMetadata to determine in which way it should be handled
 * @param scoringMetadata The scoring metadata for the character
 */
function getHandlingCase(scoringMetadata: ScoringMetadata) {
  const substats = scoringMetadata.sortedSubstats
  if (substats[1][1] == 0) return relicPotentialCases.SINGLE_STAT
  const HP = [Constants.Stats.HP, Constants.Stats.HP_P]
  const ATK = [Constants.Stats.ATK, Constants.Stats.ATK_P]
  const DEF = [Constants.Stats.DEF, Constants.Stats.DEF_P]
  if (HP.includes(substats[1][0]) && HP.includes(substats[0][0]) && substats[2][1] == 0) return relicPotentialCases.HP
  if (ATK.includes(substats[1][0]) && ATK.includes(substats[0][0]) && substats[2][1] == 0) return relicPotentialCases.ATK
  if (DEF.includes(substats[1][0]) && DEF.includes(substats[0][0]) && substats[2][1] == 0) return relicPotentialCases.DEF
  return relicPotentialCases.NORMAL
}

/**
 * @param substats array of substats to search across
 * @param scoringMetadata character scoring metadata
 * @returns lowest index in the substats array of highest weight substat
 */
function findHighestWeight(substats: substat[] | Stat[], scoringMetadata: ScoringMetadata) {
  let index = 0
  let weight = 0
  let stat = ''
  for (let i = 0; i < substats.length; i++) {
    const newWeight = scoringMetadata.stats[substats[i].stat]
    if (newWeight > weight || i == 0) {
      weight = newWeight
      index = i
      stat = substats[i].stat
    }
  }
  return {
    index,
    weight,
    stat,
  }
}

/**
 * @param substats array of substats to search across
 * @param scoringMetadata character scoring metadata
 * @returns lowest index in the substats array of lowest weight substat
 */
function findLowestWeight(substats: substat[] | Stat[], scoringMetadata: ScoringMetadata) {
  let index = 0
  let weight = 1
  let stat = ''
  for (let i = 0; i < substats.length; i++) {
    const newWeight = scoringMetadata.stats[substats[i].stat]
    if (newWeight < weight || i == 0) {
      weight = newWeight
      index = i
      stat = substats[i].stat
    }
  }
  return {
    index,
    weight,
    stat,
  }
}

/**
 * converts grade to (max) enhance while preserving type check compliance
 */
function maxEnhance(grade: 2 | 3 | 4 | 5) {
  switch (grade) {
    case 2:
      return 6
    case 3:
      return 9
    case 4:
      return 12
    default:
      return 15
  }
}

function scoreToRating(score: number) {
  // TODO: implement this
  return score.toFixed(1)
}

// Hands/Head have no weight. Optimal main stats are 1.0 weight, and anything else inherits the substat weight.
function getMainStatWeight(relic: Relic, scoringMetadata: ScoringMetadata) {
  if (!Utils.hasMainStat(relic.part)) {
    return 0
  }
  if (scoringMetadata.parts[relic.part].includes(relic.main.stat)) {
    return 1
  }
  return scoringMetadata.stats[relic.main.stat]
}
