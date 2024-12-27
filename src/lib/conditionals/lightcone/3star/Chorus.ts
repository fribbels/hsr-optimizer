import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
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
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((m.inBattleAtkBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
