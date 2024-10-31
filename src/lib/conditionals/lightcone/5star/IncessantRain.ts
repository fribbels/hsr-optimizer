import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { findContentId } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IncessantRain')

  const sValuesCr = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDmg = [0.12, 0.14, 0.16, 0.18, 0.20]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'enemy3DebuffsCrBoost',
      formItem: 'switch',
      text: t('Content.enemy3DebuffsCrBoost.text'),
      content: t('Content.enemy3DebuffsCrBoost.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCr[s]) }),
    },
    {
      lc: true,
      id: 'targetCodeDebuff',
      formItem: 'switch',
      text: t('Content.targetCodeDebuff.text'),
      content: t('Content.targetCodeDebuff.content', { DmgIncrease: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetCodeDebuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      enemy3DebuffsCrBoost: true,
      targetCodeDebuff: true,
    }),
    teammateDefaults: () => ({
      targetCodeDebuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CR] += (r.enemy3DebuffsCrBoost) ? sValuesCr[s] : 0
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.VULNERABILITY += (m.targetCodeDebuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
