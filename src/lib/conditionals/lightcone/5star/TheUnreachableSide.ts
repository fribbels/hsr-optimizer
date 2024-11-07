import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheUnreachableSide')

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    dmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBuff: {
      lc: true,
      id: 'dmgBuff',
      formItem: 'switch',
      text: t('Content.dmgBuff.text'),
      content: t('Content.dmgBuff.content', { DmgBuff: TsUtils.precisionRound(sValues[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((r.dmgBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
