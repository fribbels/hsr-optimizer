import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { arrayIncludes } from 'lib/utils/arrayUtils'
import {
  type CombatActionModifier,
  CombatBuffType,
  type CombatStatBuff,
  type Form,
} from 'types/form'
import {
  AdditionalHit,
  BreakHit,
  CritHit,
  DotHit,
  ElationHit,
  SuperBreakHit,
} from 'types/hitConditionalTypes'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import { Stats } from './../../constants/constants'
import {
  getAKeyConfig,
  isHitAKey,
} from '../engine/config/keys'
import { DamageTag } from '../engine/config/tag'
import { DamageFunctionType } from '../engine/damage/damageCalculator'
import type { AbilityKind } from './turnAbilityConfig'

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
    if (buff.abilities.length && !arrayIncludes<AbilityKind>(buff.abilities, action.actionType)) return
    switch (buff.kind) {
      case DamageFunctionType.Crit: {
        let builder = HitDefinitionBuilder.crit()
          .damageType(buff.critDamageType.reduce((acc, cur) => acc |= cur, DamageTag.None))
          .damageElement(buff.element)
          .directHit(false)
        switch (buff.critScalingStat) {
          case Stats.ATK:
            builder = builder.atkScaling(buff.critScalingValue)
            break
          case Stats.DEF:
            builder = builder.defScaling(buff.critScalingValue)
            break
          case Stats.HP:
            builder = builder.hpScaling(buff.critScalingValue)
            break
        }
        action.hits!.push(builder.build() as CritHit)
        break
      }
      case DamageFunctionType.Break: {
        const hit = HitDefinitionBuilder.standardBreak(buff.element)
          .damageType(DamageTag.BREAK)
          .directHit(false)
          .specialScaling(buff.breakScaling / 100)
          .build()
        action.hits!.push(hit as BreakHit)
        break
      }
      case DamageFunctionType.Elation: {
        const hit = HitDefinitionBuilder.elation()
          .damageType(DamageTag.ELATION)
          .damageElement(buff.element)
          .directHit(false)
          .elationScaling(buff.elationScaling / 100)
          .punchlineStacks(buff.punchlineStacks)
          .build()
        action.hits!.push(hit as ElationHit)
        break
      }
    }
  }
  context.actionModifiers.push({ modify })
}
