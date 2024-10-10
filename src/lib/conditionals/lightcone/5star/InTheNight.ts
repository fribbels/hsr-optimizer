import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { buffAbilityCd, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesDmg = [0.06, 0.07, 0.08, 0.09, 0.10]
  const sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.InTheNight.Content')
    return [{
      lc: true,
      id: 'spdScalingBuffs',
      name: 'spdScalingBuffs',
      formItem: 'switch',
      text: t('spdScalingBuffs.text'),
      title: t('spdScalingBuffs.title'),
      content: t('spdScalingBuffs.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      spdScalingBuffs: true,
    }),
    precomputeEffects: () => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals
      const stacks = Math.max(0, Math.min(6, Math.floor((x[Stats.SPD] - 100) / 10)))

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, stacks * sValuesDmg[s], (r.spdScalingBuffs))
      buffAbilityCd(x, ULT_TYPE, stacks * sValuesCd[s], (r.spdScalingBuffs))
    },
    gpuFinalizeCalculations: (request: Form) => {
      const r = request.lightConeConditionals

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
