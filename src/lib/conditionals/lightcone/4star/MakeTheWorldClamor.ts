import { ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MakeTheWorldClamor')
  const { SOURCE_LC } = Source.lightCone('21013')

  const sValues = [0.32, 0.40, 0.48, 0.56, 0.64]
  const sValuesEnergy = [20, 23, 26, 29, 32]

  const defaults = {
    ultDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultDmgBuff: {
      lc: true,
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', {
        Energy: sValuesEnergy[s],
        DmgBuff: TsUtils.precisionRound(100 * sValues[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, ULT_DMG_TYPE, (r.ultDmgBuff) ? sValues[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
