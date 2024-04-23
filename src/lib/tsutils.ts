import { Constants, MainStats } from './constants'
import { RelicEnhance, RelicGrade } from '../types/Relic'

export const calculateRelicMainStatValue = (mainStatType: MainStats,
  grade: RelicGrade,
  enhance: RelicEnhance): number =>
  Constants.MainStatsValues[mainStatType][grade].base
  + Constants.MainStatsValues[mainStatType][grade].increment * enhance
