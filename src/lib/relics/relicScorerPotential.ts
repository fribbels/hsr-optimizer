import i18next from 'i18next'
import { AllStats, Constants, MainStats, MainStatsValues, Parts, PartsMainStats, Sets, Stats, StatsValues, SubStats, SubStatValues } from 'lib/constants/constants'
import { getScoreCategory, ScoreCategory } from 'lib/scoring/scoreComparison'
import DB from 'lib/state/db'
import { arrayToMap, stringArrayToMap } from 'lib/utils/arrayUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { Character, CharacterId } from 'types/character'
import { Relic, RelicEnhance, RelicGrade, RelicId, Stat } from 'types/relic'

// FIXME HIGH

enum relicPotentialCases {
  SINGLE_STAT,
  HP,
  ATK,
  DEF,
  NORMAL,
  NONE,
}

// Define the fields we care about, until Db+dataParser are typed and can be inferred in this file
export type ScoringMetadata = {
  parts: Record<Parts, StatsValues[]>,
  stats: Record<StatsValues, number>,
  sets: Partial<Record<Sets, number>>,
  sortedSubstats: [SubStats, number][],
  // Bucketed substats
  groupedSubstats: Map<number, SubStats[]>,
  greedyHash: string,
  hash: string,
  modified?: boolean,
  category: ScoreCategory,
}

type SubStat = {
  stat: SubStats,
  value: number,
}

type SubstatScore = {
  mainStatScore: number,
  score: number,
  part: string,
  scoringMetadata: ScoringMetadata,
}

export type RelicScoringResult = {
  score: string,
  scoreNumber: number,
  rating: string,
  mainStatScore: number,
  part?: Parts,
  meta?: ScoringMetadata,
}

type FutureScoringResult = {
  current: number,
  best: number,
  average: number,
  worst: number,
  rerollAvg: number,
  idealScore: number,
  meta: {
    bestAddedStats: string[],
    bestUpgradedStats: string[],
  },
  substatScore: {
    best: number,
    average: number,
    worst: number,
  },
}

type rating = '?' | 'F' | 'F+' | 'D' | 'D+' | 'C' | 'C+' | 'B' | 'B+' | 'A' | 'A+' | 'S' | 'S+' | 'SS' | 'SS+' | 'SSS' | 'SSS+' | 'WTF' | 'WTF+'

const ratings: rating[] = ['F', 'F', 'F', 'F+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+', 'WTF', 'WTF+']

const flatStatScaling = { // placeholder values
  HP: 0.4,
  ATK: 0.4,
  DEF: 0.4,
}

export const percentToScore = 0.582 // a perfect DPS glove scores 58.2 in substat scoring, using DPS characters as a marker leads to the biggest buffs / smallest nerfs
export const minRollValue = 5.1 // Using the legacy value from OCR days without decimals, real value is 5.184

const normalization = {
  [Constants.Stats.HP_P]: 64.8 / 43.2,
  [Constants.Stats.ATK_P]: 64.8 / 43.2,
  [Constants.Stats.DEF_P]: 64.8 / 54,
  // custom weights in scoring metadata already fully adjust for value difference, adjust normalization to counteract the effect of the different values
  [Constants.Stats.HP]: (64.8 / 43.2) * SubStatValues[Constants.Stats.HP_P][5].high / SubStatValues[Constants.Stats.HP][5].high,
  [Constants.Stats.ATK]: (64.8 / 43.2) * SubStatValues[Constants.Stats.ATK_P][5].high / SubStatValues[Constants.Stats.ATK][5].high,
  [Constants.Stats.DEF]: (64.8 / 54) * SubStatValues[Constants.Stats.DEF_P][5].high / SubStatValues[Constants.Stats.DEF][5].high,
  [Constants.Stats.CR]: 64.8 / 32.4,
  [Constants.Stats.CD]: 64.8 / 64.8,
  [Constants.Stats.OHB]: 64.8 / 34.5606,
  [Constants.Stats.EHR]: 64.8 / 43.2,
  [Constants.Stats.RES]: 64.8 / 43.2,
  [Constants.Stats.SPD]: 64.8 / 25.032,
  [Constants.Stats.BE]: 64.8 / 64.8,
} as const

const dmgMainstats = [
  Stats.Physical_DMG,
  Stats.Fire_DMG,
  Stats.Ice_DMG,
  Stats.Lightning_DMG,
  Stats.Wind_DMG,
  Stats.Quantum_DMG,
  Stats.Imaginary_DMG,
]

const possibleSubstats = new Set(Constants.SubStats)

// This class has methods statically available for one-off scoring calculations, but can
// also be instantiated to batch up many scoring calculations. An instantiated RelicScorer
// should *not* be kept alive for long periods of time, as it will cache scoring metadata
// for characters (which users can edit).
// You will almost certainly want to instantiate one of these in a component rerender
// if you're doing >= 10 scorings
export class RelicScorer {
  characterRelicScoreMetas: Map<CharacterId, ScoringMetadata>
  optimalPartScore: Map<Parts, Map<string, Map<MainStats, number>>>
  currentRelicScore: Map<RelicId, Map<string, RelicScoringResult>>
  futureRelicScore: Map<RelicId, Map<string, FutureScoringResult>>

  constructor() {
    this.characterRelicScoreMetas = new Map()
    this.optimalPartScore = new Map()
    this.currentRelicScore = new Map()
    this.futureRelicScore = new Map()
  }

  /**
   * returns the current score of the relic, as well as the best, worst, and average scores when at max enhance\
   * meta field includes the ideal added and/or upgraded substats for the relic
   */
  static scoreFutureRelic(relic: Relic, characterId: CharacterId, withMeta: boolean = false) {
    return new RelicScorer().getFutureRelicScore(relic, characterId, withMeta)
  }

  /**
   * returns the current score, mainstat score, and rating for the relic\
   * additionally returns the part, and scoring metadata
   */
  static scoreCurrentRelic(relic: Relic, id: CharacterId): RelicScoringResult {
    return new RelicScorer().getCurrentRelicScore(relic, id)
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
   * returns a score (number) and rating (string) for the character, and the scored equipped relics
   * @param character character object to score
   */
  static scoreCharacter(character: Character) {
    return new RelicScorer().scoreCharacter(character)
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
   * returns the scoring metadata for the given character
   * @param id id of the character who's scoring data is wanted
   */
  getRelicScoreMeta(id: CharacterId): ScoringMetadata {
    let scoringMetadata = this.characterRelicScoreMetas.get(id)
    if (scoringMetadata) return scoringMetadata

    scoringMetadata = Utils.clone(DB.getScoringMetadata(id)) as ScoringMetadata

    const defaultScoringMetadata = DB.getMetadata().characters[id].scoringMetadata
    scoringMetadata.category = getScoreCategory(defaultScoringMetadata, { stats: scoringMetadata.stats })

    scoringMetadata.stats[Constants.Stats.HP] = scoringMetadata.stats[Constants.Stats.HP_P] * flatStatScaling.HP
    scoringMetadata.stats[Constants.Stats.ATK] = scoringMetadata.stats[Constants.Stats.ATK_P] * flatStatScaling.ATK
    scoringMetadata.stats[Constants.Stats.DEF] = scoringMetadata.stats[Constants.Stats.DEF_P] * flatStatScaling.DEF

    // Object.entries strips type information down to primitive types :/  (e.g. here StatsValues becomes string)
    // @ts-ignore
    scoringMetadata.sortedSubstats = (Object.entries(scoringMetadata.stats) as [SubStats, number][])
      .filter((x) => possibleSubstats.has(x[0]))
      .sort((a, b) => {
        return b[1] * normalization[b[0]] * SubStatValues[b[0]][5].high - a[1] * normalization[a[0]] * SubStatValues[a[0]][5].high
      })
    scoringMetadata.groupedSubstats = new Map()
    for (const [stat, weight] of scoringMetadata.sortedSubstats) {
      if (!scoringMetadata.groupedSubstats.has(weight)) {
        scoringMetadata.groupedSubstats.set(weight, [])
      }
      scoringMetadata.groupedSubstats.get(weight)!.push(stat)
    }
    for (const stats of scoringMetadata.groupedSubstats.values()) {
      stats.sort()
    }
    let weightedDmgTypes = 0
    Object.entries(scoringMetadata.stats).forEach(([stat, value]) => {
      // @ts-ignore
      if (dmgMainstats.includes(stat) && value) weightedDmgTypes++
    })
    let validDmgMains = 0
    scoringMetadata.parts.PlanarSphere.forEach((mainstat) => {
      // @ts-ignore
      if (dmgMainstats.includes(mainstat)) validDmgMains++
    })
    if (weightedDmgTypes < 2 && validDmgMains < 2) {
      // if they only have 0 / 1 weighted dmg mainstat, we can cheat as their ideal orbs will all score the same
      //
      const hashParts = [
        scoringMetadata.parts.Head,
        scoringMetadata.parts.Hands,
        scoringMetadata.parts.Body,
        scoringMetadata.parts.Feet,
        // @ts-ignore
        scoringMetadata.parts.PlanarSphere.filter((x) => !dmgMainstats.includes(x)),
        scoringMetadata.parts.LinkRope,
      ]
      scoringMetadata.greedyHash = TsUtils.objectHash({ sortedSubstats: scoringMetadata.sortedSubstats, parts: hashParts })
      scoringMetadata.hash = TsUtils.objectHash({ ...scoringMetadata.stats, ...scoringMetadata.parts })
    } else {
      scoringMetadata.greedyHash = TsUtils.objectHash({ stats: scoringMetadata.stats, parts: scoringMetadata.parts })
      scoringMetadata.hash = scoringMetadata.greedyHash
    }
    this.characterRelicScoreMetas.set(id, scoringMetadata)

    return scoringMetadata
  }

  getOptimalPartScore(part: Parts, mainstat: MainStats, id: CharacterId) {
    const metaHash = this.getRelicScoreMeta(id).greedyHash
    let optimalScore = this.optimalPartScore.get(part)?.get(metaHash)?.get(mainstat)
    if (!optimalScore) {
      optimalScore = this.scoreOptimalRelic(part, mainstat, id)
      if (!this.optimalPartScore.has(part)) {
        this.optimalPartScore.set(part, new Map())
      }
      if (!this.optimalPartScore.get(part)!.has(metaHash)) {
        this.optimalPartScore.get(part)!.set(metaHash, new Map())
      }
      this.optimalPartScore.get(part)!.get(metaHash)!.set(mainstat, optimalScore)
    }
    return optimalScore
  }

  getFutureRelicScore(relic: Relic, id: CharacterId, withMeta: boolean = false) {
    const metaHash = this.getRelicScoreMeta(id).hash
    let futureScore = this.futureRelicScore.get(relic.id)?.get(metaHash)
    if (!futureScore) {
      futureScore = this.scoreFutureRelic(relic, id, withMeta)
      if (!this.futureRelicScore.has(relic.id)) {
        this.futureRelicScore.set(relic.id, new Map())
      }
      this.futureRelicScore.get(relic.id)!.set(metaHash, futureScore)
    }
    return futureScore
  }

  getCurrentRelicScore(relic: Relic, id: CharacterId) {
    if (!relic) {
      return {
        score: '0',
        rating: '',
        mainStatScore: 0,
        scoreNumber: 0,
      }
    }
    const metaHash = this.getRelicScoreMeta(id).hash
    let currentScore = this.currentRelicScore.get(relic.id)?.get(metaHash)
    if (!currentScore) {
      currentScore = this.scoreCurrentRelic(relic, id)
      if (!this.currentRelicScore.has(relic.id)) {
        this.currentRelicScore.set(relic.id, new Map())
      }
      this.currentRelicScore.get(relic.id)!.set(metaHash, currentScore)
    }
    return currentScore
  }

  /**
   * returns the substat score of the given relic, does not include mainstat bonus
   */
  substatScore(relic: Relic, id: CharacterId) {
    const scoringMetadata = this.getRelicScoreMeta(id)
    if (!scoringMetadata || !id || !relic) {
      console.warn('substatScore() called but missing 1 or more arguments. relic:', relic, 'meta:', scoringMetadata, 'id:', id)
      return {
        score: 0,
        mainStatScore: 0,
        scoringMetadata,
        part: relic?.part,
      }
    }
    const weights = scoringMetadata.stats
    let score = 0
    for (const substat of relic.substats) {
      score += substat.value * (weights[substat.stat] || 0) * normalization[substat.stat]
    }
    const mainStatScore = ((stat, grade, part, metaParts) => {
      if (part == Parts.Head || part == Parts.Hands) return 0
      let max
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
      return max * (metaParts[part].includes(stat) ? 1 : (weights[stat] ?? 0))
    })(relic.main.stat, relic.grade, relic.part, scoringMetadata.parts)
    return {
      score,
      mainStatScore,
      part: relic.part,
      scoringMetadata,
    }
  }

  /**
   * returns the substat score for the ideal relic\
   * handles special cases scoring for when only 1 stat has been weighted by the user
   */
  scoreOptimalRelic(part: Parts, mainstat: MainStats, id: CharacterId) {
    let maxScore: number = 0
    let fake: Relic
    const meta = this.getRelicScoreMeta(id)
    const handlingCase = getHandlingCase(meta)
    switch (handlingCase) {
      case relicPotentialCases.NONE:
        maxScore = Infinity // force relic potential and score to be 0 if all substats have 0 weight
        break
      case relicPotentialCases.HP:
      // falls through
      case relicPotentialCases.ATK:
      // falls through
      case relicPotentialCases.DEF:
        { // same assumption as SINGLE_STAT but needs special handling as there are technically 2 weighted stats here
          let substats: SubStat[] = []
          const stat1 = meta.sortedSubstats[0][0]
          const stat2 = meta.sortedSubstats[1][0]
          if (
            part == Constants.Parts.Head && handlingCase == relicPotentialCases.HP
            || part == Constants.Parts.Hands && handlingCase == relicPotentialCases.ATK
          ) { // we assume % will always score better than flat, hoyo pls no punish
            substats = generateSubStats(5, { stat: stat1, value: SubStatValues[stat1][5].high * 6 })
          } else {
            substats = generateSubStats(5, { stat: stat1, value: SubStatValues[stat1][5].high * 6 }, { stat: stat2, value: SubStatValues[stat2][5].high })
          }
          fake = fakeRelic(5, 15, part, Constants.Stats.HP_P, substats) // mainstat doesn't influence relevant scoring, just hardcode something in
          maxScore = this.substatScore(fake, id).score
        }
        break
      case relicPotentialCases.SINGLE_STAT:
        { // assume intended use is maximising value in singular weighted stat as substat -> score = score of 6 high rolls
          const stat = meta.sortedSubstats[0][0]
          const substats = generateSubStats(5, { stat: stat, value: SubStatValues[stat][5].high * 6 })
          maxScore = this.substatScore(fakeRelic(5, 15, part, Constants.Stats.HP_P, substats), id).score
        }
        break
      case relicPotentialCases.NORMAL:
        { // standard handling
          let mainStat = '' as MainStats
          const optimalMainStats = meta.parts[part] || []
          // list of stats, sorted by weight as mainstat in decreasing order
          if (optimalMainStats.includes(mainstat) || meta.stats[mainstat] == 1 || !Utils.hasMainStat(part)) {
            mainStat = mainstat
          } else {
            const scoreEntries = AllStats
              .map((stat) => {
                const value = meta.stats[stat] ?? 0
                if (optimalMainStats.includes(stat) || meta.stats[stat] == 1) {
                  return [stat, 1] as [StatsValues, number]
                } else return [stat, value] as [StatsValues, number]
              })
              .sort((a, b) => {
                // we give the mainstat only stats a score of 6.48 * weight simply to get them in the right area
                // the exact score does not matter as long as the final array is still sorted by weight
                // @ts-ignore
                const scoreA = !possibleSubstats.has(a[0]) ? a[1] * 6.48 : a[1] * normalization[a[0] as SubStats] * SubStatValues[a[0] as SubStats][5].high
                // @ts-ignore
                const scoreB = !possibleSubstats.has(b[0]) ? b[1] * 6.48 : b[1] * normalization[b[0] as SubStats] * SubStatValues[b[0] as SubStats][5].high
                return scoreB - scoreA
              })
            /*
             * Need the specific optimal mainstat to remove it from possible substats. Find it by
             * - finding the highest multiplier mainstat of those valid for this relic
             * - looking at all stats with this exact multiplier and biasing towards
             *   1 - ideal mainstats and
             *   2 - mainstats that can't be substats in that order
             */
            // First candidate (i.e. has the highest weight)
            const possibleMainStats = PartsMainStats[part] as MainStats[]
            // @ts-ignore typescript wants name to have the same type as the elements of possibleMainStats
            const mainStatIndex = scoreEntries.findIndex(([name, _weight]) => possibleMainStats.includes(name))
            const mainStatWeight = scoreEntries[mainStatIndex][1]
            mainStat = scoreEntries[mainStatIndex][0] as MainStats
            // Worst case, will be overwritten by true values on first loop iteration
            let isIdeal = false
            let isSubstat = true
            // look at all stats of weight equal to the highest weight stat and find any 'better' mainstats
            for (let i = mainStatIndex; i < scoreEntries.length; i++) {
              const [name, weight] = scoreEntries[i]
              if (weight != mainStatWeight) break // sorted by weight, weight no longer equal means all following will be lesser
              // @ts-ignore typescript wants name to have the same type as the elements of possibleMainStats
              if (!possibleMainStats.includes(name)) continue // check for possible mainstat
              const newIsIdeal = optimalMainStats.includes(name)
              // @ts-ignore typescript wants name to have the same type as the elements of possibleSubstats
              const newIsSubstat = possibleSubstats.has(name)
              if (isIdeal && !newIsIdeal) continue // prefer ideal mainstats
              if (!isSubstat && newIsSubstat) continue // prefer mainstats that can't be substats
              if (isIdeal === newIsIdeal && isSubstat == newIsSubstat) continue
              mainStat = name as MainStats
              isIdeal = newIsIdeal
              isSubstat = newIsSubstat
            }
          }

          const substatScoreEntries = meta.sortedSubstats.filter(([name, _]) => name !== mainStat)
          const substats = substatScoreEntries.slice(0, 4)
          const subs = generateSubStats(
            5,
            { stat: substats[0][0], value: SubStatValues[substats[0][0]][5].high * 6 },
            { stat: substats[1][0], value: SubStatValues[substats[1][0]][5].high },
            { stat: substats[2][0], value: SubStatValues[substats[2][0]][5].high },
            { stat: substats[3][0], value: SubStatValues[substats[3][0]][5].high },
          )
          fake = fakeRelic(5, 15, part, mainStat, subs)
          maxScore = this.substatScore(fake, id).score
        }
        break
    }
    return maxScore
  }

  /**
   * returns the current score of the relic, as well as the best, worst, and average scores when at max enhance\
   * meta field includes the ideal added and/or upgraded substats for the relic
   */
  scoreFutureRelic(relic: Relic, id: CharacterId, withMeta: boolean = false) {
    if (!id || !relic) {
      console.warn('scoreFutureRelic() called but lacking arguments')
      return {
        current: 0,
        best: 0,
        average: 0,
        worst: 0,
        rerollAvg: 0,
        idealScore: 1,
        meta: {
          bestAddedStats: [''],
          bestUpgradedStats: [''],
        },
        substatScore: {
          best: 0,
          average: 0,
          worst: 0,
        },
      } as FutureScoringResult
    }
    const meta = this.getRelicScoreMeta(id)
    if (!meta.sortedSubstats[0][0]) {
      return { // 0 weighted substats
        current: 0,
        best: 0,
        average: 0,
        worst: 0,
        rerollAvg: 0,
        idealScore: 1,
        meta: {
          bestAddedStats: [''],
          bestUpgradedStats: [''],
        },
        substatScore: {
          best: 0,
          average: 0,
          worst: 0,
        },
      } as FutureScoringResult
    }
    const maxMainstat = (() => {
      switch (relic.grade as 2 | 3 | 4 | 5) {
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
    const availableSubstats = meta.sortedSubstats.filter((x) => x[0] != relic.main.stat && !relic.substats.map((x) => x.stat).includes(x[0]))
    const remainingRolls = Math.ceil((maxEnhance(relic.grade as 2 | 3 | 4 | 5) - relic.enhance) / 3) - (4 - relic.substats.length)
    const mainstatBonus = mainStatBonus(relic.part, relic.main.stat, meta)
    const idealScore = this.getOptimalPartScore(relic.part, relic.main.stat, id)
    const current = Math.max(0, (this.substatScore(relic, id).score + mainstatDeduction) / idealScore * 100 * percentToScore + mainstatBonus)

    // evaluate the best possible outcome
    const bestSubstats: { stat: SubStats, value: number }[] = [{ stat: 'HP', value: 0 }, { stat: 'HP', value: 0 }, { stat: 'HP', value: 0 }, {
      stat: 'HP',
      value: 0,
    }]
    for (let i = 0; i < relic.substats.length; i++) { // we pass values instead of references to avoid accidentally modifying the actual relic
      bestSubstats[i].stat = relic.substats[i].stat
      bestSubstats[i].value = relic.substats[i].value
    } // after copying over existing lines, supplement to 4 lines if necessary
    for (let i = relic.substats.length; i < 4; i++) {
      const stat = availableSubstats[i - relic.substats.length][0]
      bestSubstats[i].stat = stat
      bestSubstats[i].value = SubStatValues[stat][5].high
    }
    const bestSub = findHighestWeight(bestSubstats, meta)
    bestSubstats[bestSub.index].value += remainingRolls * SubStatValues[bestSub.stat][relic.grade as 2 | 3 | 4 | 5].high
    let fake = fakeRelic(
      relic.grade,
      maxEnhance(relic.grade as 2 | 3 | 4 | 5),
      relic.part,
      relic.main.stat,
      generateSubStats(
        5,
        bestSubstats[0],
        bestSubstats[1],
        bestSubstats[2],
        bestSubstats[3],
      ),
    )
    const best = Math.max(0, (this.substatScore(fake, id).score + mainstatDeduction) / idealScore * 100 * percentToScore + mainstatBonus)

    // evaluate average outcome
    const averageSubstats: { stat: SubStats, value: number }[] = [{ stat: 'HP', value: 0 }, { stat: 'HP', value: 0 }, { stat: 'HP', value: 0 }, {
      stat: 'HP',
      value: 0,
    }]
    for (let i = 0; i < relic.substats.length; i++) { // we pass values instead of references to avoid accidentally modifying the actual relic
      averageSubstats[i].stat = relic.substats[i].stat
      averageSubstats[i].value = relic.substats[i].value + remainingRolls / 4 * SubStatValues[averageSubstats[i].stat][relic.grade as 2 | 3 | 4 | 5].mid
    }
    /*
     * We want to use the score() function to score relics for maximum accuracy (and easier maintainability potentially)
     * How do we score a relic with unknown substats?
     * One option would be to score all possible relics and take the average score (ew, slow, expensive)
     * Instead, we calculate the average score of the possible new line (using a mid-roll)
     * We then choose a substat to camouflage as so that the score() function is able to handle the relic
     * We divide the average score of 1 mid-roll we calculated earlier by the weight and normalization of the chosen camouflage stat
     * We then multiply this by the number of rolls our filler stat will have
     * This way, when the score() function evaluates our relic, all the additional lines will score their expected average score

     * average score of 1 mid-roll = avg(weight * normalization * mid-roll)

     * avg score = avg(weight * norm * mid roll) * rolls
     * AND
     * avg score = value * weight * scaling

     * Therefore

     * value = avg(weight * norm * mid roll) * rolls / (weight * scaling)
     * value = average score of 1 mid-roll * rolls / (weight * scaling)
     */
    let averageScore = 0
    for (const pair of availableSubstats) {
      const [stat, weight] = pair
      averageScore += SubStatValues[stat][relic.grade as 2 | 3 | 4 | 5].mid * weight * normalization[stat]
    }
    averageScore = averageScore / availableSubstats.length
    for (let i = relic.substats.length; i < 4; i++) {
      averageSubstats[i].stat = meta.sortedSubstats[0][0]
      averageSubstats[i].value = averageScore * (1 + remainingRolls / 4) / (normalization[meta.sortedSubstats[0][0]] * meta.sortedSubstats[0][1])
    }
    fake = fakeRelic(
      relic.grade,
      maxEnhance(relic.grade as 2 | 3 | 4 | 5),
      relic.part,
      relic.main.stat,
      generateSubStats(
        5,
        averageSubstats[0],
        averageSubstats[1],
        averageSubstats[2],
        averageSubstats[3],
      ),
    )
    const average = Math.max(0, (this.substatScore(fake, id).score + mainstatDeduction) / idealScore * 100 * percentToScore + mainstatBonus)

    // evaluate the worst possible outcome
    availableSubstats.reverse()
    const worstSubstats: { stat: SubStats, value: number }[] = [{ stat: 'HP', value: 0 }, { stat: 'HP', value: 0 }, { stat: 'HP', value: 0 }, {
      stat: 'HP',
      value: 0,
    }]
    for (let i = 0; i < relic.substats.length; i++) { // we pass values instead of references to avoid accidentally modifying the actual relic
      worstSubstats[i].stat = relic.substats[i].stat
      worstSubstats[i].value = relic.substats[i].value
    } // after copying over existing lines, supplement to 4 lines if necessary
    for (let i = relic.substats.length; i < 4; i++) {
      const stat = availableSubstats[i - relic.substats.length][0]
      worstSubstats[i].stat = stat
      worstSubstats[i].value = SubStatValues[stat][5].high
    }
    const worstSub = findLowestWeight(worstSubstats, meta)
    worstSubstats[worstSub.index].value += SubStatValues[worstSub.stat][relic.grade as 2 | 3 | 4 | 5].low * remainingRolls
    fake = fakeRelic(
      relic.grade,
      maxEnhance(relic.grade as 2 | 3 | 4 | 5),
      relic.part,
      relic.main.stat,
      generateSubStats(
        5,
        worstSubstats[0],
        worstSubstats[1],
        worstSubstats[2],
        worstSubstats[3],
      ),
    )
    const worst = Math.max(0, (this.substatScore(fake, id).score + mainstatDeduction) / idealScore * 100 * percentToScore + mainstatBonus)

    let levelupMetadata: {
      bestAddedStats: SubStats[],
      bestUpgradedStats: SubStats[],
    } | undefined = undefined
    if (withMeta) {
      const bestAddedStats: SubStats[] = []
      if (relic.substats.length < 4) {
        for (const [stat, weight] of availableSubstats) {
          if (weight >= availableSubstats[availableSubstats.length - 1][1]) {
            bestAddedStats.push(stat)
          }
        }
      }
      const candidateSubstats: [SubStats, number][] = meta.sortedSubstats.filter((x) => relic.main.stat !== x[0]) // All substats that could possibly exist on the relic
      const bestUpgradedStats: SubStats[] = [] // Array of all substats possibly on relic sharing highest weight

      const validUpgrades: Record<SubStats, object | true | undefined> = {
        ...arrayToMap(relic.substats, 'stat'),
        ...stringArrayToMap(bestAddedStats),
      }

      const upgradeCandidates: [SubStats, number][] = candidateSubstats.filter((candidateSubstats) => validUpgrades[candidateSubstats[0]])
      const bestWeight = upgradeCandidates[0][1]
      for (const [stat, weight] of upgradeCandidates) {
        if (validUpgrades[stat] && weight >= bestWeight) {
          bestUpgradedStats.push(stat)
        }
      }
      bestAddedStats.forEach((s, i) => bestAddedStats[i] = i18next.t(`common:Stats.${s}`))
      bestUpgradedStats.forEach((s, i) => bestUpgradedStats[i] = i18next.t(`common:Stats.${s}`))
      levelupMetadata = {
        bestAddedStats: bestAddedStats,
        bestUpgradedStats: bestUpgradedStats,
      }
    }

    let rerollValue = 0
    let rerollAvg = 0
    if (relic.grade >= 5 && relic.substats.length == 4) {
      const currentRolls = TsUtils.sumArray(relic.substats.map((x) => x.addedRolls ?? 0))
      const remainingRolls = Math.ceil((15 - relic.enhance) / 3)
      const totalRolls = Math.min(currentRolls + remainingRolls, 5)

      for (const substat of relic.substats) {
        const stat = substat.stat
        const value = SubStatValues[stat][5].mid * meta.stats[stat] * normalization[stat]
        if (stat == bestSub.stat) {
          rerollValue += value * (totalRolls + 1)
        } else {
          rerollValue += value
        }

        if (totalRolls >= 5) {
          rerollAvg += value * 2.25
        } else {
          rerollAvg += value * 2
        }
      }

      // These are reroll max potentials - Disabled for now
      // rerollValue = Math.min(rerollValue, idealScore)
      // rerollValue = (rerollValue + mainstatDeduction) / idealScore * 100 * percentToScore + mainstatBonus

      // There is a case where a stat with less than 1 weight is the main stat, in which case the reroll value will exceed the ideal score, cap it
      rerollAvg = Math.min(rerollAvg, idealScore)
      rerollAvg = (rerollAvg + mainstatDeduction) / idealScore * 100 * percentToScore + mainstatBonus
    }

    return {
      current,
      best,
      average,
      worst,
      rerollAvg,
      meta: levelupMetadata,
    } as FutureScoringResult
  }

  /**
   * returns the current score, mainstat score, and rating for the relic\
   * additionally returns the part, and scoring metadata
   */
  scoreCurrentRelic(relic: Relic, id: CharacterId): RelicScoringResult {
    if (!relic) {
      // console.warn('scoreCurrentRelic called but no relic given for character', id ?? '????')
      return {
        score: '',
        scoreNumber: 0,
        rating: '',
        mainStatScore: 0,
      }
    }
    if (!id) {
      console.warn('scoreCurrentRelic called but lacking character', relic)
      return {
        score: '',
        scoreNumber: 0,
        rating: '',
        mainStatScore: 0,
      }
    }
    const meta = this.getRelicScoreMeta(id)
    const part = relic.part
    const mainstatBonus = mainStatBonus(relic.part, relic.main.stat, meta)
    const substatScore = this.substatScore(relic, id)
    const idealScore = this.getOptimalPartScore(part, relic.main.stat, id)
    const score = substatScore.score / idealScore * 100 * percentToScore + mainstatBonus
    const rating = scoreToRating(score, substatScore, relic)
    const mainStatScore = substatScore.mainStatScore
    return {
      score: score.toFixed(1),
      scoreNumber: score,
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
  scoreCharacterWithRelics(character: Character, relics: Relic[]): {
    relics: RelicScoringResult[],
    totalScore: number,
    totalRating: string,
  } {
    if (!character?.id) {
      console.warn('scoreCharacterWithRelics called but no character given')
      return {
        relics: [],
        totalScore: 0,
        totalRating: '?',
      }
    }

    const scoredRelics = relics.map((x) => this.getCurrentRelicScore(x, character.id))
    let totalScore = 0
    for (const relic of scoredRelics) {
      totalScore += Number(relic.score) + Number(relic.mainStatScore)
    }
    const missingSets = 3 - countPairs(relics.filter((x) => x != undefined).map((x) => x.set))
    totalScore = Math.max(0, totalScore - missingSets * 3 * minRollValue)
    const totalRating = scoredRelics.length < 6 ? '?' : scoreToRating((totalScore - 4 * 64.8) / 6)
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
  scoreCharacter(character: Character): ReturnType<typeof this.scoreCharacterWithRelics> {
    if (!character) {
      return {
        relics: [],
        totalScore: 0,
        totalRating: '',
      }
    }
    const relicsById = window.store.getState().relicsById
    const relics: Relic[] = Object.values(character.equipped).map((x) => relicsById[x ?? ''])
    return this.scoreCharacterWithRelics(character, relics)
  }

  /**
   * evaluates the max, min, and avg potential optimalities of a relic
   * @param relic relic to evaluate
   * @param id id of character to evaluate against
   * @param withMeta whether or not to include the character scoringMetadata in the return
   */
  // linear relation between score and potential makes this very easy now
  scoreRelicPotential(relic: Relic, id: CharacterId, withMeta: boolean = false) {
    const meta = this.getRelicScoreMeta(id)
    const mainstatBonus = mainStatBonus(relic.part, relic.main.stat, meta)
    const futureScore = this.getFutureRelicScore(relic, id, withMeta)

    const multiplier = (meta.sets[relic.set] ?? 0.5);

    return {
      currentPct: Math.max(0, futureScore.current - mainstatBonus) / percentToScore * multiplier,
      bestPct: Math.max(0, futureScore.best - mainstatBonus) / percentToScore * multiplier,
      averagePct: Math.max(0, futureScore.average - mainstatBonus) / percentToScore * multiplier,
      worstPct: Math.max(0, futureScore.worst - mainstatBonus) / percentToScore * multiplier,
      rerollAvgPct: Math.max(0, futureScore.rerollAvg - mainstatBonus) / percentToScore * multiplier,
      meta: futureScore.meta,
    }
  }
}

function countPairs<T extends string | number | symbol>(arr: T[]) {
  let pairs = 0
  const obj: Record<T, number> = {} as Record<T, number>
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
export function mainStatBonus(part: Parts, mainStat: MainStats, scoringMetadata: ScoringMetadata) {
  const stats = scoringMetadata.stats
  const parts = scoringMetadata.parts
  if (part == Constants.Parts.Body || part == Constants.Parts.Feet || part == Constants.Parts.PlanarSphere || part == Constants.Parts.LinkRope) {
    const multiplier = parts[part].includes(mainStat) ? 1 : (stats[mainStat] ?? 0)
    // Main stat free roll == 1
    return 1 * minRollValue * multiplier
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
function fakeRelic(grade: RelicGrade, enhance: RelicEnhance, part: string, mainstat: string, substats: SubStat[]): Relic {
  return {
    enhance: enhance,
    grade: grade,
    part: part,
    main: {
      stat: mainstat,
      value: MainStatsValues[mainstat][grade].base + MainStatsValues[mainstat][grade].increment * enhance,
    },
    substats: substats,
  } as Relic
}

/**
 * used to generate substats for fakeRelic() more easily
 * @param grade relic rarity
 * @param sub1 substat line 1
 * @param sub2 substat line 2
 * @param sub3 substat line 3
 * @param sub4 substat line 4
 * @returns array of substats for a relic
 */
function generateSubStats(grade: RelicGrade, sub1: SubStat, sub2?: SubStat, sub3?: SubStat, sub4?: SubStat): SubStat[] {
  const substats = [{
    stat: sub1.stat,
    value: sub1.value,
    rolls: {
      high: SubStatValues[sub1.stat][grade as 2 | 3 | 4 | 5].high,
      mid: SubStatValues[sub1.stat][grade as 2 | 3 | 4 | 5].mid,
      low: SubStatValues[sub1.stat][grade as 2 | 3 | 4 | 5].low,
    },
    addedRolls: 0,
  }]
  if (sub2) {
    substats.push({
      stat: sub2.stat,
      value: sub2.value,
      rolls: {
        high: SubStatValues[sub2.stat][grade as 2 | 3 | 4 | 5].high,
        mid: SubStatValues[sub2.stat][grade as 2 | 3 | 4 | 5].mid,
        low: SubStatValues[sub2.stat][grade as 2 | 3 | 4 | 5].low,
      },
      addedRolls: 0,
    })
  }
  if (sub3) {
    substats.push({
      stat: sub3.stat,
      value: sub3.value,
      rolls: {
        high: SubStatValues[sub3.stat][grade as 2 | 3 | 4 | 5].high,
        mid: SubStatValues[sub3.stat][grade as 2 | 3 | 4 | 5].mid,
        low: SubStatValues[sub3.stat][grade as 2 | 3 | 4 | 5].low,
      },
      addedRolls: 0,
    })
  }
  if (sub4) {
    substats.push({
      stat: sub4.stat,
      value: sub4.value,
      rolls: {
        high: SubStatValues[sub4.stat][grade as 2 | 3 | 4 | 5].high,
        mid: SubStatValues[sub4.stat][grade as 2 | 3 | 4 | 5].mid,
        low: SubStatValues[sub4.stat][grade as 2 | 3 | 4 | 5].low,
      },
      addedRolls: 0,
    })
  }
  return substats
}

/**
 * Analyses the scoringMetadata to determine in which way it should be handled
 * @param scoringMetadata The scoring metadata for the character
 */
function getHandlingCase(scoringMetadata: ScoringMetadata) {
  const substats = scoringMetadata.sortedSubstats
  if (substats[0][1] == 0) return relicPotentialCases.NONE
  if (substats[1][1] == 0) return relicPotentialCases.SINGLE_STAT
  if (substats[2][1] > 0) return relicPotentialCases.NORMAL
  if (substats[1][0] == Stats.HP && substats[0][0] == Stats.HP_P) return relicPotentialCases.HP
  if (substats[1][0] == Stats.HP_P && substats[0][0] == Stats.HP) return relicPotentialCases.HP
  if (substats[1][0] == Stats.ATK && substats[0][0] == Stats.ATK_P) return relicPotentialCases.ATK
  if (substats[1][0] == Stats.ATK_P && substats[0][0] == Stats.ATK) return relicPotentialCases.ATK
  if (substats[1][0] == Stats.DEF && substats[0][0] == Stats.DEF_P) return relicPotentialCases.DEF
  if (substats[1][0] == Stats.DEF_P && substats[0][0] == Stats.DEF) return relicPotentialCases.DEF
  return relicPotentialCases.NORMAL
}

/**
 * @param substats array of substats to search across
 * @param scoringMetadata character scoring metadata
 * @returns lowest index in the substats array of highest weight substat
 */
function findHighestWeight(substats: SubStat[] | Stat[], scoringMetadata: ScoringMetadata) {
  let index = 0
  let weight = 0
  let stat = '' as SubStats
  for (let i = 0; i < substats.length; i++) {
    const newWeight = scoringMetadata.stats[substats[i].stat]
    if (newWeight > weight || i == 0) {
      weight = newWeight
      index = i
      stat = substats[i].stat as SubStats
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
function findLowestWeight(substats: SubStat[], scoringMetadata: ScoringMetadata) {
  let index = 0
  let weight = scoringMetadata.stats[substats[0].stat]
  let stat = substats[0].stat
  for (let i = 1; i < substats.length; i++) {
    const newWeight = scoringMetadata.stats[substats[i].stat]
    if (newWeight < weight) {
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

function scoreToRating(score: number, substatScore?: SubstatScore, relic?: Relic): rating { // + 1 rating per 0.5 low rolls of score, starting from 1 low roll of score
  if (relic && relic.grade != 5) return '?'
  const index = Math.min(Math.floor(score / (minRollValue / 2)), ratings.length - 1)
  return index < 0 || scoredMainStatInvalid(substatScore) ? '?' : ratings[index]
}

function scoredMainStatInvalid(substatScore?: SubstatScore) {
  return substatScore
    && (substatScore.part != Parts.Hands && substatScore.part != Parts.Head)
    && TsUtils.precisionRound(substatScore.mainStatScore) <= 0
}

// Hands/Head have no weight. Optimal main stats are 1.0 weight, and anything else inherits the substat weight.
function getMainStatWeight(relic: Relic, scoringMetadata: ScoringMetadata) {
  if (!Utils.hasMainStat(relic.part)) {
    return 0
  }
  if (scoringMetadata.parts[relic.part].includes(relic.main.stat)) {
    return 1
  }
  return scoringMetadata.stats[relic.main.stat] ?? 0
}
