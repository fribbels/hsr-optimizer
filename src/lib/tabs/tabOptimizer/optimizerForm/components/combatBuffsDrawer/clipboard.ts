import {
  isAKeyValue,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import {
  ArrayFilters,
  mapFilter,
} from 'lib/utils/arrayUtils'
import { uuid } from 'lib/utils/miscUtils'
import {
  type CombatActionModifier,
  type CombatBuff,
  type CombatBuffGroup,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import { AbilitySelect } from './ActionModifierBuilder/AbilitySelect'
import { CritModifier } from './ActionModifierBuilder/ActionModifierBuilder'
import { DamageElementSelect } from './ActionModifierBuilder/DamageElementSelect'
import { DamageTagSelect } from './common/DamageTagSelect'
import { ElementTagSelect } from './StatBuffBuilder/ElementTagSelect'
import { TargetTagSelect } from './StatBuffBuilder/TargetTagSelect'

export enum ClipboardError {
  NotAllowed,
  NotFound,
  SyntaxError,
}

type ClipboardBuff = CombatBuff | CombatBuffGroup

export async function writeBuffToClipboard(buff: CombatBuff | CombatBuffGroup): Promise<
  boolean | ClipboardError.NotAllowed
> {
  let blob: ClipboardBuff
  switch (buff.type) {
    case CombatBuffType.StatBuff:
      blob = buff
      break
    case CombatBuffType.ActionModifier:
      blob = buff
      break
    case CombatBuffType.Group:
      blob = buff
  }
  return await navigator.clipboard.writeText(JSON.stringify(blob))
    .then(() => {
      return true
    })
    .catch((e: DOMException) => {
      if (e.name === 'NotAllowedError') {
        return ClipboardError.NotAllowed
      } else {
        console.error(e)
        return false
      }
    })
}

export async function readBuffFromClipboard(): Promise<
  ClipboardError | CombatStatBuff | CombatActionModifier | CombatBuffGroup | null
> {
  const result = await navigator.clipboard.readText()
    .then(JSON.parse)
    .then((str) => {
      return parseStatBuff(str) ?? parseGroup(str) ?? parseActionModifier(str)
    })
    .then((buff) => {
      switch (buff?.type) {
        case undefined:
          break
        case CombatBuffType.StatBuff: {
          return buff
        }
        case CombatBuffType.Group: {
          return buff
        }
        case CombatBuffType.ActionModifier: {
          return buff
        }
      }
      return null
    })
    .catch((e: DOMException | SyntaxError) => {
      if (e instanceof SyntaxError) {
        return ClipboardError.SyntaxError
      }
      if (e instanceof DOMException) {
        switch (e.name) {
          case 'NotAllowedError':
            return ClipboardError.NotAllowed
          case 'NotFoundError':
            return ClipboardError.NotFound
        }
      }
      throw e
    })
  return result
}

function parseStatBuff(obj: unknown): CombatStatBuff | null {
  if (typeof obj !== 'object' || obj === null) return null

  if (
    !(
      'type' in obj
      && 'statKey' in obj
      && 'value' in obj
      && 'damageTags' in obj
      && 'elementTags' in obj
      && 'targetTag' in obj
      && 'disabled' in obj
    )
  ) return null

  const { type, statKey, value, damageTags, elementTags, targetTag, disabled } = obj

  if (type !== CombatBuffType.StatBuff) return null

  if (typeof disabled !== 'boolean') return null

  if (typeof value !== 'number' || !isFinite(value)) return null

  if (!Array.isArray(damageTags) || !damageTags.every(DamageTagSelect.isValidTag)) return null

  if (!Array.isArray(elementTags) || !elementTags.every(ElementTagSelect.isValidTag)) return null

  if (!TargetTagSelect.isValidTag(targetTag)) return null

  if (!isAKeyValue(statKey) || (damageTags.length && !isHitAKey(statKey))) return null

  return {
    type,
    disabled,
    value,
    elementTags,
    damageTags,
    targetTag,
    statKey,
    id: uuid(),
  }
}

const mapFilterBuffs = mapFilter((item) => parseStatBuff(item) ?? parseActionModifier(item))(ArrayFilters.nonNullable)
function parseGroup(obj: unknown): CombatBuffGroup | null {
  if (typeof obj !== 'object' || obj === null) return null

  if (
    !(
      'type' in obj
      && 'name' in obj
      && 'buffs' in obj
      && 'disabled' in obj
    )
  ) return null

  const { type, name, buffs, disabled } = obj

  if (type !== CombatBuffType.Group) return null

  if (typeof name !== 'string') return null

  if (typeof disabled !== 'boolean') return null

  if (!Array.isArray(buffs)) return null

  const parsedBuffs: CombatBuffGroup['buffs'] = mapFilterBuffs(buffs)

  return {
    type,
    disabled,
    name,
    buffs: parsedBuffs,
    id: uuid(),
  }
}

function parseActionModifier(obj: unknown): CombatActionModifier | null {
  if (typeof obj !== 'object' || obj === null) return null
  if (
    !(
      'type' in obj
      && 'kind' in obj
      && 'element' in obj
      && 'abilities' in obj
      && 'disabled' in obj
    )
  ) return null

  const { type, kind, element, abilities, disabled } = obj

  if (!Array.isArray(abilities) || !abilities.every(AbilitySelect.isValidTag)) return null
  if (!DamageElementSelect.isValidTag(element)) return null
  if (typeof disabled !== 'boolean') return null

  if (type !== CombatBuffType.ActionModifier) return null
  switch (kind) {
    case DamageFunctionType.Crit: {
      if (
        !(
          'critDamageType' in obj
          && 'critScalingStat' in obj
          && 'critScalingValue' in obj
        )
      ) return null
      const { critDamageType, critScalingStat, critScalingValue } = obj
      if (!Array.isArray(critDamageType) || !critDamageType.every(CritModifier.isValidDamageType)) return null
      if (!CritModifier.isScalingStat(critScalingStat)) return null
      if (typeof critScalingValue !== 'number') return null
      return {
        type,
        kind,
        element,
        abilities,
        disabled,
        id: uuid(),
        critDamageType,
        critScalingStat,
        critScalingValue,
      }
    }
    case DamageFunctionType.Break: {
      if (!('breakScaling' in obj)) return null
      const { breakScaling } = obj
      if (typeof breakScaling !== 'number') return null
      return {
        type,
        kind,
        element,
        abilities,
        disabled,
        id: uuid(),
        breakScaling,
      }
    }
    case DamageFunctionType.Elation: {
      if (
        !(
          'elationScaling' in obj
          && 'punchlineStacks' in obj
        )
      ) return null
      const { elationScaling, punchlineStacks } = obj
      if (typeof elationScaling !== 'number') return null
      if (typeof punchlineStacks !== 'number') return null
      return {
        type,
        kind,
        element,
        abilities,
        disabled,
        id: uuid(),
        elationScaling,
        punchlineStacks,
      }
    }
    default:
      return null
  }
}
