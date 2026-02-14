import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InTheNight')
  const { SOURCE_LC } = Source.lightCone('23001')

  const sValuesDmg = [0.06, 0.07, 0.08, 0.09, 0.10]
  const sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    spdScalingBuffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    spdScalingBuffs: {
      lc: true,
      id: 'spdScalingBuffs',
      formItem: 'switch',
      text: t('Content.spdScalingBuffs.text'),
      content: t('Content.spdScalingBuffs.content', {
        DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]),
        CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
      const spd = x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)
      const stacks = Math.max(0, Math.min(6, Math.floor((spd - 100) / 10)))

      x.buff(StatKey.DMG_BOOST, (r.spdScalingBuffs) ? stacks * sValuesDmg[s] : 0, x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(SOURCE_LC))
      x.buff(StatKey.CD, (r.spdScalingBuffs) ? stacks * sValuesCd[s] : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.spdScalingBuffs)}) {
  let stacks = max(0.0, min(6.0, floor((${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} - 100.0) / 10.0)));
  ${buff.hit(HKey.DMG_BOOST, `stacks * ${sValuesDmg[s]}`).damageType(DamageTag.BASIC | DamageTag.SKILL).wgsl(action)}
  ${buff.hit(HKey.CD, `stacks * ${sValuesCd[s]}`).damageType(DamageTag.ULT).wgsl(action)}
}
      `
    },
  }
}
