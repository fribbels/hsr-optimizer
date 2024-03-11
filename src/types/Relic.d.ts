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
    optimalityAllAll: number
    optimalityOwnedAll: number
  }
  cs?: number
  ds?: number
  ss?: number

  enhance: RelicEnhance
  equippedBy: DataMineId
  grade: RelicGrade
  id: GUID

  main: {
    stat: MainStats
    value: number
  }
  part: Parts
  set: Sets
  substats: {
    stat: SubStats
    value: number
  }[]
}
