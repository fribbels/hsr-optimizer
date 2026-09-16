import { Source } from 'lib/optimization/buffSource'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  type CombatBuff,
  CombatBuffType,
  type Form,
} from 'types/form'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import {
  getAKeyConfig,
  isHitAKey,
} from '../engine/config/keys'

export function precomputeExtraCombatBuffs(x: ComputedStatsContainer, request: Form): void {
  const buffs = parseBuffsFromRequest(request)
  buffs.forEach((buff) => {
    if (buff.type !== CombatBuffType.StatBuff) return

    const { statKey, value: preValue, targetTag, damageTags } = buff
    const value = getAKeyConfig(statKey).flat ? preValue : (preValue / 100)
    if (damageTags.length && isHitAKey(statKey)) {
      const config = x
        .damageType(damageTags.reduce((acc, cur) => acc |= cur))
        .targets(targetTag)
        .source(Source.EXTRA_COMBAT_BUFFS)
      x.buff(statKey, value, config)
    } else {
      const config = x
        .targets(targetTag)
        .source(Source.EXTRA_COMBAT_BUFFS)
      x.buff(statKey, value, config)
    }
  })
}

export function precomputeExtraActionModifiers(request: Form, context: OptimizerContext) {
  const buffs = parseBuffsFromRequest(request)
  buffs.forEach((buff) => {
    if (buff.type !== CombatBuffType.ActionModifier) return
    const modify = (action: OptimizerAction, context: OptimizerContext) => {
      // TODO:
    }
    context.actionModifiers.push({ modify })
  })
}

function parseBuffsFromRequest(request: Form) {
  const disabled = new Set<string>()
  const enabled = new Map<string, CombatBuff>()
  const buffs = Object.entries(request.combatBuffs)
  buffs.forEach(([id, buff]) => {
    switch (buff.type) {
      case CombatBuffType.Group:
        if (buff.disabled) {
          buff.buffs.forEach((id) => {
            disabled.add(id)
            enabled.delete(id)
          })
        }
        return
      case CombatBuffType.StatBuff:
      case CombatBuffType.ActionModifier:
        if (disabled.has(id)) return
        enabled.set(id, buff)
    }
  })
  return enabled.values()
}
