import { isHitAKey } from 'lib/optimization/engine/config/keys'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  CombatActionModifier,
  CombatBuffType,
  type CombatStatBuff,
  ElationActionModifier,
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
  modifierKind: CombatActionModifier['kind'] | null
  damageElement: CombatActionModifier['element'] | null
  abilityTargets: CombatActionModifier['abilities']
  // elation action modifier
  elationScaling: ElationActionModifier['elationScaling'] | string
  punchlineStacks: ElationActionModifier['punchlineStacks'] | string
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
  // actiom modifier builder methods
  setModifierKind: (modifierKind: CombatBuffStoreState['modifierKind']) => void
  setDamageElement: (damageElement: CombatBuffStoreState['damageElement']) => void
  setAbilityTargets: (abilityTargets: CombatBuffStoreState['abilityTargets']) => void
  // elation action modifier
  setElationScaling: (elationScaling: CombatBuffStoreState['elationScaling']) => void
  setPunchlineStacks: (elationScaling: CombatBuffStoreState['punchlineStacks']) => void
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
    modifierKind: DamageFunctionType.Crit,
    damageElement: null,
    abilityTargets: [],
    elationScaling: '',
    punchlineStacks: '',
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
  setModifierKind: (modifierKind) => set({ modifierKind }),
  setDamageElement: (damageElement) => set({ damageElement }),
  setAbilityTargets: (abilityTargets) => set({ abilityTargets }),
  // elation action modifier
  setElationScaling: (elationScaling) => set({ elationScaling }),
  setPunchlineStacks: (punchlineStacks) => set({ punchlineStacks }),
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
          const combatBuffs = [
            ...useOptimizerRequestStore.getState().combatBuffs,
            buff,
          ]
          useOptimizerRequestStore.setState({ combatBuffs })
        }
      }
  }
}
