import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ConcertForTwo')

  const sValuesStackDmg = [0.04, 0.05, 0.06, 0.07, 0.08]

  const defaults = {
    teammateShieldStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    teammateShieldStacks: {
      lc: true,
      id: 'teammateShieldStacks',
      formItem: 'slider',
      text: t('Content.teammateShieldStacks.text'),
      content: t('Content.teammateShieldStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesStackDmg[s]) }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((r.teammateShieldStacks) * sValuesStackDmg[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
