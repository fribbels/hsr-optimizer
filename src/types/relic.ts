import {
  MainStats,
  Parts,
  Sets,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import { AugmentedStats } from 'lib/relics/relicAugmenter'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { RelicScoringWeights } from 'lib/tabs/tabRelics/RelicFilterBar'
import { CharacterId } from 'types/character'

export type RelicId = string
export type RelicGrade = number
export type RelicEnhance = number

export type UnaugmentedRelic = Pick<Relic, 'main' | 'substats' | 'grade' | 'enhance' | 'augmentedStats' | 'part' | 'verified' | 'initialRolls'> & {
  id?: Relic['id'],
}

export type Relic = {
  /*
   * refactor?
   * augmentedCaseWeight?: any;
   */
  weights?: RelicScoringWeights,
  weightScore: number,

  enhance: RelicEnhance,
  equippedBy: CharacterId | undefined,
  grade: RelicGrade,
  id: RelicId,
  verified?: boolean,
  ageIndex?: number,
  scoringResult?: RelicScoringResult,

  main: {
    stat: MainStats,
    value: number,
  },
  condensedStats?: [number, number][],
  augmentedStats?: AugmentedStats,
  part: Parts,
  set: Sets,
  substats: RelicSubstatMetadata[],
  initialRolls?: number,
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
