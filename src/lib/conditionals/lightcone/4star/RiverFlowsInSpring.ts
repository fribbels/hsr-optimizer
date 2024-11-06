import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.RiverFlowsInSpring')

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
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.SPD_P.buff((r.spdDmgBuff) ? sValuesSpd[s] : 0, Source.NONE)
      x.ELEMENTAL_DMG.buff((r.spdDmgBuff) ? sValuesDmg[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
