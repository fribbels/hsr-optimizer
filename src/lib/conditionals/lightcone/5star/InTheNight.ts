import { BASIC_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityCd, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InTheNight')

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
    precomputeEffects: () => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals
      const stacks = Math.max(0, Math.min(6, Math.floor((x.a[Key.SPD] - 100) / 10)))

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, (r.spdScalingBuffs) ? stacks * sValuesDmg[s] : 0, Source.NONE)
      buffAbilityCd(x, ULT_TYPE, (r.spdScalingBuffs) ? stacks * sValuesCd[s] : 0, Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      return `
if (${wgslTrue(r.spdScalingBuffs)}) {
  let stacks = max(0, min(6, floor((x.SPD - 100) / 10)));

  buffAbilityDmg(p_x, BASIC_TYPE | SKILL_TYPE, stacks * ${sValuesDmg[s]}, 1);
  buffAbilityCd(p_x, ULT_TYPE, stacks * ${sValuesCd[s]}, 1);
}
    `
    },
  }
}
