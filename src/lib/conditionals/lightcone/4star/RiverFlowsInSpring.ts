import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.RiverFlowsInSpring')
  const { SOURCE_LC } = Source.lightCone('21024')

  const sValuesSpd = [0.08, 0.09, 0.10, 0.11, 0.12]
  const sValuesDmg = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    spdDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    spdDmgBuff: {
      lc: true,
      id: 'spdDmgBuff',
      formItem: 'switch',
      text: t('Content.spdDmgBuff.text'),
      content: t('Content.spdDmgBuff.content', {
        SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]),
        DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.SPD_P.buff((r.spdDmgBuff) ? sValuesSpd[s] : 0, SOURCE_LC)
      x.ELEMENTAL_DMG.buff((r.spdDmgBuff) ? sValuesDmg[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
