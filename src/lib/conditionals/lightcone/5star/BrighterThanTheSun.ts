import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BrighterThanTheSun')
  const { SOURCE_LC } = Source.lightCone('23015')

  const sValuesAtk = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesErr = [0.06, 0.07, 0.08, 0.09, 0.10]

  const defaults = {
    dragonsCallStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    dragonsCallStacks: {
      lc: true,
      id: 'dragonsCallStacks',
      formItem: 'slider',
      text: t('Content.dragonsCallStacks.text'),
      content: t('Content.dragonsCallStacks.content', {
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]),
        RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]),
      }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ATK_P.buff(r.dragonsCallStacks * sValuesAtk[s], SOURCE_LC)
      x.ERR.buff(r.dragonsCallStacks * sValuesErr[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
