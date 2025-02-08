import { Sets } from 'lib/constants/constants'

export enum BUFF_TYPE {
  CHARACTER = 'CHARACTER',
  LIGHTCONE = 'LIGHTCONE',
  SETS = 'SETS',
  BASIC_STATS = 'BASIC_STATS',
  COMBAT_STATS = 'COMBAT_STATS',
  NONE = 'NONE',
}

const setsSourceExpansion = Object.fromEntries(
  Object.entries(Sets).map(([key, name]) => [
    key,
    { id: key, label: name, buffType: BUFF_TYPE.SETS },
  ]),
) as Record<keyof typeof Sets, BuffSource>

export type BuffSource = {
  id: string
  label: string
  buffType: BUFF_TYPE
}

export const Source = {
  character(id: string) {
    function generateCharacterSource(label: string) {
      return {
        id: id,
        label: `${id}_${label}`,
        buffType: BUFF_TYPE.CHARACTER,
      }
    }

    return {
      SOURCE_BASIC: generateCharacterSource('BASIC'),
      SOURCE_SKILL: generateCharacterSource('SKILL'),
      SOURCE_ULT: generateCharacterSource('ULT'),
      SOURCE_TALENT: generateCharacterSource('TALENT'),
      SOURCE_TECHNIQUE: generateCharacterSource('TECHNIQUE'),
      SOURCE_TRACE: generateCharacterSource('TRACE'),
      SOURCE_MEMO: generateCharacterSource('MEMO'),
      SOURCE_E1: generateCharacterSource('E1'),
      SOURCE_E2: generateCharacterSource('E2'),
      SOURCE_E4: generateCharacterSource('E4'),
      SOURCE_E6: generateCharacterSource('E6'),
    }
  },
  lightCone(id: string) {
    return {
      SOURCE_LC: {
        id: id,
        label: `${id}_LC`,
        buffType: BUFF_TYPE.LIGHTCONE,
      },
    }
  },
  NONE: { id: 'NONE', label: 'NONE', buffType: BUFF_TYPE.NONE },
  ...setsSourceExpansion,
}
