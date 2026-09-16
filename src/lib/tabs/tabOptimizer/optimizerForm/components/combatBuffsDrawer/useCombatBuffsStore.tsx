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
  buffs: Map<string, CombatBuff>
  groups: Map<string, CombatBuffGroup>
  groupedBuffs: Map<string, CombatBuff>
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
  loadBuffFromClipboard: () => void
  // stat buff builder methods
  setStat: (stat: CombatBuffStoreState['stat']) => void
  setValue: (value: CombatBuffStoreState['value']) => void
  setTargetTag: (targetTags: CombatBuffStoreState['targetTag']) => void
  setDamageTags: (damageTags: CombatBuffStoreState['damageTags']) => void
  setElementTags: (elementTags: CombatBuffStoreState['elementTags']) => void
}

type CombatBuffStore = CombatBuffStoreActions & CombatBuffStoreState

function initialStoreState(): CombatBuffStoreState {
  const { buffs, groups, groupedBuffs } = deriveBuffStateFromOptimizerRequestState(useOptimizerRequestStore.getState())
  return {
    buffBuilderMode: CombatBuffType.StatBuff,
    buffs,
    groups,
    groupedBuffs,
    stat: null,
    value: 0,
    damageTags: [],
    elementTags: [],
    targetTag: null,
  }
}

export const useCombatBuffStore = create<CombatBuffStore>()((set, get) => ({
  ...initialStoreState(),
  // general methods
  setBuffBuilderMode: (mode) => set({ buffBuilderMode: mode }),
  loadBuffFromClipboard: () => loadBuffFromClipboard(set),
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

async function loadBuffFromClipboard(set: { (partial: Partial<CombatBuffStore>): void }) {
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
          return set({ stat, value, damageTags, targetTag, buffBuilderMode: CombatBuffType.StatBuff })
        }
        case CombatBuffType.Group: {
          const { buffs, group } = buff
          const combatBuffs = {
            ...useOptimizerRequestStore.getState().combatBuffs,
            ...buffs,
            [uuid()]: group,
          }
          useOptimizerRequestStore.setState({ combatBuffs })
        }
      }
  }
}

useOptimizerRequestStore.subscribe((state, prev) => {
  if (state.combatBuffs === prev.combatBuffs) return

  // sub because need metadata on buffs to enable selection state handling
  // CombatBuffsDrawer uses this store's values rather than those in useOptimizerRequestStore
  const { buffs, groups, groupedBuffs } = deriveBuffStateFromOptimizerRequestState(state)

  useCombatBuffStore.setState({ buffs, groups, groupedBuffs })
})

function deriveBuffStateFromOptimizerRequestState(state: OptimizerRequestState) {
  const buffs: CombatBuffStoreState['buffs'] = new Map()
  const groups: CombatBuffStoreState['groups'] = new Map()
  const grouped = new Set<string>()

  Object.entries(state.combatBuffs).forEach(([id, buff]) => {
    if (buff.type === CombatBuffType.Group) {
      groups.set(id, buff)
      buff.buffs.forEach((buffId) => {
        grouped.add(buffId)
        buffs.delete(buffId)
      })
    } else {
      if (!grouped.has(id)) buffs.set(id, buff)
    }
  })
  const groupedBuffs: CombatBuffStoreState['groupedBuffs'] = new Map(
    grouped
      .values()
      .map((id) => [id, state.combatBuffs[id] as CombatBuff]),
  )
  return { buffs, groups, groupedBuffs }
}
