import { Parts, Sets, SubStats } from 'lib/constants'
import { GUID } from './Common'
import { AugmentedStats } from 'lib/relicAugmenter'
import { RelicScoringWeights } from 'components/RelicFilterBar'

export type RelicGrade = 2 | 3 | 4 | 5
export type RelicEnhance = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

export type Relic = {
  /*
   * refactor?
   * augmentedCaseWeight?: any;
   */
  weights?: RelicScoringWeights
  weightScore: number

  enhance: number
  equippedBy: string | undefined
  grade: number
  id: GUID
  verified?: boolean
  ageIndex?: number

  main: {
    stat: string
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
  stat: string
  value: number
}
