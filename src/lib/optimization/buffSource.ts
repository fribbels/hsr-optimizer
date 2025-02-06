import { Sets } from 'lib/constants/constants'

export const Source = {
  character(id: string) {
    return {
      SOURCE_BASIC: `${id}_BASIC`,
      SOURCE_SKILL: `${id}_SKILL`,
      SOURCE_ULT: `${id}_ULT`,
      SOURCE_TALENT: `${id}_TALENT`,
      SOURCE_TECHNIQUE: `${id}_TECHNIQUE`,
      SOURCE_TRACE: `${id}_TRACE`,
      SOURCE_MEMO: `${id}_MEMO`,
      SOURCE_E1: `${id}_E1`,
      SOURCE_E2: `${id}_E2`,
      SOURCE_E4: `${id}_E4`,
      SOURCE_E6: `${id}_E6`,
    }
  },
  lightCone(id: string) {
    return {
      SOURCE_LC: `${id}_LIGHTCONE`,
    }
  },
  NONE: 'NONE',
  BASIC_STATS: 'BASIC_STATS',
  COMBAT_BUFFS: 'COMBAT_BUFFS',
  ...Sets,
}
