import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Chorus')

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    inBattleAtkBuff: true,
  }

  const teammateDefaults = {
    inBattleAtkBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    inBattleAtkBuff: {
      lc: true,
      id: 'inBattleAtkBuff',
      formItem: 'switch',
      text: t('Content.inBattleAtkBuff.text'),
      content: t('Content.inBattleAtkBuff.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    inBattleAtkBuff: content.inBattleAtkBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => ({
      inBattleAtkBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.ATK_P.buff((m.inBattleAtkBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
