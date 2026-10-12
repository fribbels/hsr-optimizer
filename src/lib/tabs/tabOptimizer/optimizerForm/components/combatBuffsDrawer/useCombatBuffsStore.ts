import { Stats } from 'lib/constants/constants'
import {
  AKey,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  BreakActionModifier,
  CombatActionModifier,
  CombatBuffType,
  type CombatStatBuff,
  CritActionModifier,
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
  // crit action modifier
  critDamageType: CritActionModifier['critDamageType']
  critScalingStat: CritActionModifier['critScalingStat'] | null
  critScalingValue: CritActionModifier['critScalingValue'] | string
  // break action modifier
  breakScaling: BreakActionModifier['breakScaling'] | string
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
  // crit action modifier
  setCritDamageType: (critDamageType: CombatBuffStoreState['critDamageType']) => void
  setCritScalingStat: (critScalingStat: CombatBuffStoreState['critScalingStat']) => void
  setCritScalingValue: (critScalingValue: CombatBuffStoreState['critScalingValue']) => void
  // break action modifier
  setBreakScaling: (breakScaling: CombatBuffStoreState['breakScaling']) => void
  // elation action modifier
  setElationScaling: (elationScaling: CombatBuffStoreState['elationScaling']) => void
  setPunchlineStacks: (elationScaling: CombatBuffStoreState['punchlineStacks']) => void
}

type CombatBuffStore = CombatBuffStoreActions & CombatBuffStoreState

function initialStoreState(): CombatBuffStoreState {
  return {
    buffBuilderMode: CombatBuffType.StatBuff,
    stat: AKey.CD,
    value: 0,
    damageTags: [],
    elementTags: [],
    targetTag: null,
    // action modifier builder
    modifierKind: DamageFunctionType.Crit,
    damageElement: null,
    abilityTargets: [],
    // crit action modifier
    critDamageType: [],
    critScalingStat: Stats.ATK,
    critScalingValue: 100,
    // break action modifier
    breakScaling: 100,
    // elation action modifier
    elationScaling: 30,
    punchlineStacks: 20,
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
  // crit action modifier
  setCritDamageType: (critDamageType) => set({ critDamageType }),
  setCritScalingStat: (critScalingStat) => set({ critScalingStat }),
  setCritScalingValue: (critScalingValue) => set({ critScalingValue }),
  // break action modifier
  setBreakScaling: (breakScaling) => set({ breakScaling }),
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
