import { Source } from 'lib/optimization/buffSource'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  type CombatActionModifier,
  CombatBuffType,
  type CombatStatBuff,
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
  request.combatBuffs.forEach((buff) => {
    if (buff.disabled) return
    if (buff.type === CombatBuffType.StatBuff) applyStatBuff(x, buff)
    if (buff.type === CombatBuffType.Group) {
      buff.buffs.forEach((buff) => {
        if (buff.disabled) return
        if (buff.type === CombatBuffType.StatBuff) applyStatBuff(x, buff)
      })
    }
  })
}

function applyStatBuff(x: ComputedStatsContainer, buff: CombatStatBuff) {
  const { statKey, value: preValue, targetTag, damageTags, elementTags } = buff
  const value = getAKeyConfig(statKey).flat ? preValue : (preValue / 100)
  if (damageTags.length && isHitAKey(statKey)) {
    const config = x
      .damageType(damageTags.reduce((acc, cur) => acc |= cur))
      .elements(elementTags.reduce((acc, cur) => acc |= cur))
      .targets(targetTag)
      .source(Source.EXTRA_COMBAT_BUFFS)
    x.buff(statKey, value, config)
  } else {
    const config = x
      .targets(targetTag)
      .source(Source.EXTRA_COMBAT_BUFFS)
    x.buff(statKey, value, config)
  }
}

export function precomputeExtraActionModifiers(request: Form, context: OptimizerContext) {
  request.combatBuffs.forEach((buff) => {
    if (buff.disabled) return
    if (buff.type === CombatBuffType.ActionModifier) applyActionModifier(context, buff)
    if (buff.type === CombatBuffType.Group) {
      buff.buffs.forEach((buff) => {
        if (buff.disabled) return
        if (buff.type === CombatBuffType.ActionModifier) applyActionModifier(context, buff)
      })
    }
  })
}

function applyActionModifier(context: OptimizerContext, buff: CombatActionModifier) {
  const modify = (action: OptimizerAction, context: OptimizerContext) => {
    // TODO:
  }
  context.actionModifiers.push({ modify })
}
