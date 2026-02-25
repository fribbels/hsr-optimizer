import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { p4 } from 'lib/optimization/calculateStats'
import { SetKeys } from 'lib/optimization/config/setsConfig'
import { HKey, StatKey, } from 'lib/optimization/engine/config/keys'
import { DamageTag, SELF_ENTITY_INDEX, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { OptimizerAction } from 'types/optimizer'

export function boostAshblazingAtkContainer(x: ComputedStatsContainer, action: OptimizerAction, hitMulti: number) {
  if (p4(SetKeys.TheAshblazingGrandDuke, x.c.sets)) {
    const stacks = action.setConditionals.valueTheAshblazingGrandDuke
    const delta = hitMulti - 0.06 * stacks
    const baseATK = x.getSelfValue(StatKey.BASE_ATK)
    x.buff(StatKey.ATK, delta * baseATK, x.damageType(DamageTag.FUA).source(Source.TheAshblazingGrandDuke))
  }
}

export function gpuBoostAshblazingAtkContainer(hitMulti: number, action: OptimizerAction) {
  const config = action.config
  return wgsl`
if (p4((*p_sets).TheAshblazingGrandDuke) >= 1) {
  let ashblazingDelta = ${hitMulti} - 0.06 * f32(setConditionals.valueTheAshblazingGrandDuke);
  let ashblazingBaseATK = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BASE_ATK, config)};
  ${buff.hit(HKey.ATK, 'ashblazingDelta * ashblazingBaseATK').damageType(DamageTag.FUA).wgsl(action)}
}
`
}