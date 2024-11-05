import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ReforgedRemembrance')

  const sValuesAtk = [0.05, 0.06, 0.07, 0.08, 0.09]
  const sValuesDotPen = [0.072, 0.079, 0.086, 0.093, 0.10]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'prophetStacks',
      formItem: 'slider',
      text: t('Content.prophetStacks.text'),
      content: t('Content.prophetStacks.content', {
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]),
        DefIgnore: TsUtils.precisionRound(100 * sValuesDotPen[s]),
      }),
      min: 0,
      max: 4,
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      prophetStacks: 4,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.ATK_P] += r.prophetStacks * sValuesAtk[s]

      buffAbilityDefPen(x, DOT_TYPE, r.prophetStacks * sValuesDotPen[s])
    },
    finalizeCalculations: () => {
    },
  }
}
