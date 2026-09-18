import { isHitAKey } from 'lib/optimization/engine/config/keys'
import type { OptimizerRequestState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { uuid } from 'lib/utils/miscUtils'
import {
  type CombatActionModifier,
  type CombatBuff,
  type CombatBuffGroup,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import { create } from 'zustand'
import {
  ClipboardError,
  readBuffFromClipboard,
} from './clipboard'

export interface CombatBuffStoreState {
  // general purpose values
  buffBuilderMode: Exclude<CombatBuffType, CombatBuffType.Group>
  // stat buff builder values
  stat: CombatStatBuff['statKey'] | null
  value: CombatStatBuff['value'] | string
  targetTag: CombatStatBuff['targetTag'] | null
  damageTags: CombatStatBuff['damageTags']
  elementTags: CombatStatBuff['elementTags']
  // action modifier builder values
}

interface CombatBuffStoreActions {
  // general purpose methods
  setBuffBuilderMode: (mode: CombatBuffStoreState['buffBuilderMode']) => void
  // stat buff builder methods
  setStat: (stat: CombatBuffStoreState['stat']) => void
  setValue: (value: CombatBuffStoreState['value']) => void
  setTargetTag: (targetTags: CombatBuffStoreState['targetTag']) => void
  setDamageTags: (damageTags: CombatBuffStoreState['damageTags']) => void
  setElementTags: (elementTags: CombatBuffStoreState['elementTags']) => void
}

type CombatBuffStore = CombatBuffStoreActions & CombatBuffStoreState

function initialStoreState(): CombatBuffStoreState {
  return {
    buffBuilderMode: CombatBuffType.StatBuff,
    stat: null,
    value: 0,
    damageTags: [],
    elementTags: [],
    targetTag: null,
  }
}

export const useCombatBuffStore = create<CombatBuffStore>()((set) => ({
  ...initialStoreState(),
  // general methods
  setBuffBuilderMode: (mode) => set({ buffBuilderMode: mode }),
  // stat buff builder
  setStat(stat) {
    if (stat !== null && !isHitAKey(stat)) {
      set({ stat, damageTags: [] })
    } else set({ stat })
  },
  setValue: (value) => set({ value: value }),
  setDamageTags: (damageTags) => set({ damageTags }),
  setTargetTag: (targetTag) => set({ targetTag }),
  setElementTags: (elementTags) => set({ elementTags }),
  // action modifier builder
}))

export async function loadBuffFromClipboard() {
  const buff = await readBuffFromClipboard()
  switch (buff) {
    // TODO: Error messages
    case ClipboardError.NotAllowed:
    case ClipboardError.NotFound:
    case ClipboardError.SyntaxError:
      break
    case null:
      // TODO: valid JSON but invalid item
      break
    default:
      switch (buff.type) {
        case CombatBuffType.StatBuff: {
          const { statKey: stat, value, damageTags, targetTag } = buff
          return useCombatBuffStore.setState({ stat, value, damageTags, targetTag, buffBuilderMode: CombatBuffType.StatBuff })
        }
        case CombatBuffType.Group: {
          const { buffs, group } = buff
          const combatBuffs = [
            ...useOptimizerRequestStore.getState().combatBuffs,
            group,
            ...buffs,
          ]
          useOptimizerRequestStore.setState({ combatBuffs })
        }
      }
  }
}
