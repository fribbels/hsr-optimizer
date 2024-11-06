import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BrighterThanTheSun')

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
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ATK_P.buff(r.dragonsCallStacks * sValuesAtk[s], Source.NONE)
      x.ERR.buff(r.dragonsCallStacks * sValuesErr[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
