import { MainStats, Parts, Sets, SubStats } from 'lib/constants'
import { DataMineId, GUID } from './Common'

export type RelicGrade = 2 | 3 | 4 | 5
export type RelicEnhance = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

export type Relic = {
  /*
   * refactor?
   * augmentedCaseWeight?: any;
   */
  weights?: {
    current: number
    average: number
    best: number
    potentialAllAll: number
  }

  enhance: RelicEnhance
  equippedBy: DataMineId
  grade: RelicGrade
  id: GUID
  verified?: boolean

  main: {
    stat: MainStats
    value: number
  }
  augmentedStats: {
    mainStat: string
    [key: string]: number
  }
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
