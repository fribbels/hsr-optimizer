import { MainStats, Parts, Sets, SubStats } from "lib/constants";
import { GUID, HSRId } from "./Common";

export type RelicGrade = 2 | 3 | 4 | 5;
export type RelicEnhance = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export type Relic = {
  // refactor?
  augmentedCaseWeight?: any;
  averageCaseWeight?: number;
  bestCaseWeight?: number;
  cs?: number;
  ds?: number;
  relicsTabWeight?: number;
  ss?: number

  enhance: RelicEnhance;
  equippedBy: HSRId;
  grade: RelicGrade;
  id: GUID;

  main: {
    stat: MainStats;
    value: number;
  };
  part: Parts;
  set: Sets;
  substats: [{
    stat: SubStats;
    value: number;
    scoreMeta: {
      multiplier: number;
      score: number;
    }
  }]
};