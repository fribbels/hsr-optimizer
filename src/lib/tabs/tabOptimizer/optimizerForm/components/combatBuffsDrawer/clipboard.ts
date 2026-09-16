import {
  isAKeyValue,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
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
import { DamageTagSelect } from './DamageTagSelect'
import { ElementTagSelect } from './ElementTagSelect'
import { TargetTagSelect } from './TargetTagSelect'

export enum ClipboardError {
  NotAllowed,
  NotFound,
  SyntaxError,
}

// Clipboard types exist mostly to serve as a readable representation of the clipboard serialization
type ClipboardBuff = ClipboardStatBuff | ClipboardActionModifier | ClipboardBuffGroup
type ClipboardStatBuff = CombatStatBuff
type ClipboardActionModifier = { type: CombatBuffType.ActionModifier }
interface ClipboardBuffGroup {
  type: CombatBuffType.Group
  name: string
  buffs: Array<CombatStatBuff | CombatActionModifier>
}

export interface ParsedBuffGroup {
  group: CombatBuffGroup
  buffs: Record<string, CombatBuff>
  type: CombatBuffType.Group
}

export async function writeBuffToClipboard(buff: CombatBuff): Promise<
  boolean | ClipboardError.NotAllowed
>
export async function writeBuffToClipboard(buff: CombatBuffGroup, buffs: Map<string, CombatBuff>): Promise<
  boolean | ClipboardError.NotAllowed
>
export async function writeBuffToClipboard(buff: CombatBuff | CombatBuffGroup, buffs?: Map<string, CombatBuff>): Promise<
  boolean | ClipboardError.NotAllowed
> {
  let blob: ClipboardBuff
  switch (buff.type) {
    case CombatBuffType.StatBuff:
      blob = buff
      break
    case CombatBuffType.ActionModifier:
      blob = { type: CombatBuffType.ActionModifier }
      break
    case CombatBuffType.Group:
      blob = {
        ...buff,
        buffs: buff.buffs.map((id) => buffs!.get(id)!),
      }
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
  ClipboardError | CombatStatBuff | CombatActionModifier | ParsedBuffGroup | null
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

function parseStatBuff(obj: unknown): ClipboardStatBuff | null {
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
  }
}

const mapFilterBuffs = mapFilter((item) => parseStatBuff(item) ?? parseActionModifier(item))(ArrayFilters.nonNullable)
function parseGroup(obj: unknown): ParsedBuffGroup | null {
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

  const buffMap: ParsedBuffGroup['buffs'] = {}

  mapFilterBuffs(buffs).forEach((buff) => {
    buffMap[uuid()] = buff
  })

  return {
    type,
    buffs: buffMap,
    group: {
      type,
      disabled,
      name,
      buffs: Object.keys(buffMap),
    },
  }
}

function parseActionModifier(obj: unknown): CombatActionModifier | null {
  if (typeof obj !== 'object' || obj === null) return null
  return null
}
