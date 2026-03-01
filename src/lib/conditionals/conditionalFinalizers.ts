import { wgsl } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { relic4p } from 'lib/optimization/calculateStats'
import { SetKeys } from 'lib/optimization/config/setsConfig'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { OptimizerAction } from 'types/optimizer'

export function boostAshblazingAtkContainer(x: ComputedStatsContainer, action: OptimizerAction, hitMulti: number) {
  if (relic4p(SetKeys.TheAshblazingGrandDuke, x.c.sets)) {
    const stacks = action.setConditionals.valueTheAshblazingGrandDuke
    const delta = hitMulti - 0.06 * stacks
    const baseATK = x.config.selfEntity.baseAtk
    x.buff(StatKey.ATK, delta * baseATK, x.damageType(DamageTag.FUA).source(Source.TheAshblazingGrandDuke))
  }
}

export function gpuBoostAshblazingAtkContainer(hitMulti: number, action: OptimizerAction) {
  const config = action.config
  return wgsl`
if (relic4p(*p_sets, SET_TheAshblazingGrandDuke) >= 1) {
  let ashblazingDelta = ${hitMulti} - 0.06 * f32(setConditionals.valueTheAshblazingGrandDuke);
  let ashblazingBaseATK = ${config.selfEntity.baseAtk};
  ${buff.hit(HKey.ATK, 'ashblazingDelta * ashblazingBaseATK').damageType(DamageTag.FUA).wgsl(action)}
}
`
}