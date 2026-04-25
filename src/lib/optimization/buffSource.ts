import {
  type SetKey,
  Sets,
} from 'lib/constants/constants'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

export enum BUFF_TYPE {
  PRIMARY = 'PRIMARY', // Not to be used on buffs - only an organizational token - used to separate target character from teammates in buffs display
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
  ELATION_SKILL = 'ElationSkill',
  UNIQUE = 'Unique',

  CYRENE_ODE_TO = 'CYRENE_ODE_TO',

  LC = 'LC',
  SETS = 'SETS',
  NONE = 'NONE',
}

const setsSourceExpansion = Object.fromEntries(
  Object.entries(Sets).map(([key, name]) => [
    key,
    { id: key, label: name, buffType: BUFF_TYPE.SETS, ability: BUFF_ABILITY.SETS },
  ]),
) as Record<SetKey, SetsBuffSource>

export type BuffSource = CharacterBuffSource | SetsBuffSource | LightConeBuffSource | NoneBuffSource | CyreneSpecialBuffSource | ExtraCombatBuffSource

type ExtraCombatBuffSource = {
  id: 'EXTRA_COMBAT_BUFFS',
  label: 'EXTRA_COMBAT_BUFFS',
  ability: BUFF_ABILITY.NONE,
  buffType: BUFF_TYPE.COMBAT_STATS,
}

type CharacterBuffSource = {
  id: CharacterId,
  label: `${CharacterId}_${Exclude<BUFF_ABILITY, BUFF_ABILITY.LC | BUFF_ABILITY.SETS | BUFF_ABILITY.NONE>}`,
  ability: Exclude<BUFF_ABILITY, BUFF_ABILITY.CYRENE_ODE_TO | BUFF_ABILITY.LC | BUFF_ABILITY.SETS | BUFF_ABILITY.NONE>,
  buffType: BUFF_TYPE.CHARACTER,
}

type SetsBuffSource = {
  id: SetKey,
  label: Sets,
  ability: BUFF_ABILITY.SETS,
  buffType: BUFF_TYPE.SETS,
}

type LightConeBuffSource = {
  id: LightConeId,
  label: `${LightConeId}_LC`,
  ability: BUFF_ABILITY.LC,
  buffType: BUFF_TYPE.LIGHTCONE,
}

type NoneBuffSource = {
  id: 'NONE',
  label: 'NONE',
  ability: BUFF_ABILITY.NONE,
  buffType: BUFF_TYPE.NONE,
}

type CyreneSpecialBuffSource = {
  id: CharacterId,
  label: `${BUFF_ABILITY.CYRENE_ODE_TO}_${CharacterId}`,
  ability: BUFF_ABILITY.CYRENE_ODE_TO,
  buffType: BUFF_TYPE.CHARACTER,
}

export const Source = {
  character(id: CharacterId) {
    function generateCharacterSource(ability: CharacterBuffSource['ability']): CharacterBuffSource {
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
      SOURCE_ELATION_SKILL: generateCharacterSource(BUFF_ABILITY.ELATION_SKILL),
      SOURCE_UNIQUE: generateCharacterSource(BUFF_ABILITY.UNIQUE),
    }
  },
  lightCone(id: LightConeId): { SOURCE_LC: LightConeBuffSource } {
    return {
      SOURCE_LC: {
        id: id,
        label: `${id}_LC`,
        ability: BUFF_ABILITY.LC,
        buffType: BUFF_TYPE.LIGHTCONE,
      },
    }
  },
  odeTo(id: CharacterId): CyreneSpecialBuffSource {
    return {
      id: id,
      label: `${BUFF_ABILITY.CYRENE_ODE_TO}_${id}`,
      ability: BUFF_ABILITY.CYRENE_ODE_TO,
      buffType: BUFF_TYPE.CHARACTER,
    }
  },
  NONE: { id: 'NONE', label: 'NONE', buffType: BUFF_TYPE.NONE, ability: BUFF_ABILITY.NONE } as NoneBuffSource,
  EXTRA_COMBAT_BUFFS: { id: 'EXTRA_COMBAT_BUFFS', label: 'EXTRA_COMBAT_BUFFS', buffType: BUFF_TYPE.COMBAT_STATS, ability: BUFF_ABILITY.NONE } as ExtraCombatBuffSource,
  ...setsSourceExpansion,
}
