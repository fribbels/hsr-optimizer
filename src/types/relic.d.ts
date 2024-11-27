import { MainStats, Parts, Sets, StatsValues, SubStats } from 'lib/constants/constants'
import { AugmentedStats } from 'lib/relics/relicAugmenter'
import { RelicScoringWeights } from 'lib/tabs/tabRelics/RelicFilterBar'

export type RelicId = string
export type RelicGrade = number
export type RelicEnhance = number

export type Relic = {
  /*
   * refactor?
   * augmentedCaseWeight?: any;
   */
  weights?: RelicScoringWeights
  weightScore: number

  enhance: RelicEnhance
  equippedBy: string | undefined
  grade: RelicGrade
  id: RelicId
  verified?: boolean
  ageIndex?: number

  main: {
    stat: MainStats
    value: number
  }
  condensedStats?: [string, number][]
  augmentedStats?: AugmentedStats
  part: Parts
  set: Sets
  substats: {
    stat: SubStats
    value: number
    rolls?: StatRolls
    addedRolls?: number
  }[]
}

type StatRolls = {
  high: number
  mid: number
  low: number
}

export type Stat = {
  stat: StatsValues
  value: number
}
