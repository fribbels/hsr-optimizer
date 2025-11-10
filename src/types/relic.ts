import {
  MainStats,
  Parts,
  Sets,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import { AugmentedStats } from 'lib/relics/relicAugmenter'
import { CharacterId } from 'types/character'

export type RelicId = string
export type RelicGrade = number
export type RelicEnhance = number

export type UnaugmentedRelic =
  & Pick<Relic, 'main' | 'substats' | 'grade' | 'enhance' | 'part' | 'verified'>
  & Partial<Pick<Relic, 'id' | 'augmentedStats' | 'initialRolls'>>

export type Relic = {
  /*
   * refactor?
   * augmentedCaseWeight?: any;
   */
  weightScore: number, // optimiser

  enhance: RelicEnhance,
  equippedBy: CharacterId | undefined,
  grade: RelicGrade,
  id: RelicId,
  verified?: boolean,
  ageIndex: number,

  main: {
    stat: MainStats,
    value: number,
  },
  condensedStats?: [number, number][], // optimiser
  augmentedStats: AugmentedStats, // optimiser + relicsGrid cv getter
  part: Parts,
  set: Sets,
  substats: RelicSubstatMetadata[],
  initialRolls: number,
}

export type RelicSubstatMetadata = {
  stat: SubStats,
  value: number,
  rolls?: StatRolls,
  addedRolls?: number,
}

export type StatRolls = {
  high: number,
  mid: number,
  low: number,
}

export type Stat = {
  stat: StatsValues,
  value: number,
}
