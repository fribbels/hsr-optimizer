import { Sets } from 'lib/constants/constants'

export enum BUFF_TYPE {
  PRIMARY = 'PRIMARY', // Not to be used on buffs - only an organizational token
  CHARACTER = 'CHARACTER',
  LIGHTCONE = 'LIGHTCONE',
  SETS = 'SETS',
  BASIC_STATS = 'BASIC_STATS',
  COMBAT_STATS = 'COMBAT_STATS',
  NONE = 'NONE',
}

export enum BUFF_ABILITY {
  BASIC = 'Basic',
  SKILL = 'Skill',
  ULT = 'Ult',
  TALENT = 'Talent',
  TECHNIQUE = 'Technique',
  TRACE = 'Trace',
  MEMO = 'Memo',
  E1 = 'E1',
  E2 = 'E2',
  E4 = 'E4',
  E6 = 'E6',

  LC = 'LC',
  SETS = 'SETS',
  NONE = 'NONE',
}

const setsSourceExpansion = Object.fromEntries(
  Object.entries(Sets).map(([key, name]) => [
    key,
    { id: key, label: name, buffType: BUFF_TYPE.SETS, ability: BUFF_ABILITY.SETS },
  ]),
) as Record<keyof typeof Sets, BuffSource>

export type BuffSource = {
  id: string
  label: string
  ability: BUFF_ABILITY
  buffType: BUFF_TYPE
}

export const Source = {
  character(id: string) {
    function generateCharacterSource(ability: BUFF_ABILITY) {
      return {
        id: id,
        label: `${id}_${ability}`,
        ability: ability,
        buffType: BUFF_TYPE.CHARACTER,
      }
    }

    return {
      SOURCE_BASIC: generateCharacterSource(BUFF_ABILITY.BASIC),
      SOURCE_SKILL: generateCharacterSource(BUFF_ABILITY.SKILL),
      SOURCE_ULT: generateCharacterSource(BUFF_ABILITY.ULT),
      SOURCE_TALENT: generateCharacterSource(BUFF_ABILITY.TALENT),
      SOURCE_TECHNIQUE: generateCharacterSource(BUFF_ABILITY.TECHNIQUE),
      SOURCE_TRACE: generateCharacterSource(BUFF_ABILITY.TRACE),
      SOURCE_MEMO: generateCharacterSource(BUFF_ABILITY.MEMO),
      SOURCE_E1: generateCharacterSource(BUFF_ABILITY.E1),
      SOURCE_E2: generateCharacterSource(BUFF_ABILITY.E2),
      SOURCE_E4: generateCharacterSource(BUFF_ABILITY.E4),
      SOURCE_E6: generateCharacterSource(BUFF_ABILITY.E6),
    }
  },
  lightCone(id: string) {
    return {
      SOURCE_LC: {
        id: id,
        label: `${id}_LC`,
        ability: BUFF_ABILITY.LC,
        buffType: BUFF_TYPE.LIGHTCONE,
      },
    }
  },
  NONE: { id: 'NONE', label: 'NONE', buffType: BUFF_TYPE.NONE, ability: BUFF_ABILITY.NONE },
  ...setsSourceExpansion,
}
