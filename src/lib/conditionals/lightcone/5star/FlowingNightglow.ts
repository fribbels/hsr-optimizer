import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { findContentId } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlowingNightglow')

  const sValuesErr = [0.03, 0.035, 0.04, 0.045, 0.05]
  const sValuesAtkBuff = [0.48, 0.60, 0.72, 0.84, 0.96]
  const sValuesDmgBuff = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'cadenzaActive',
      formItem: 'switch',
      text: t('Content.cadenzaActive.text'),
      content: t('Content.cadenzaActive.content', {
        RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]),
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]),
        DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBuff[s]),
      }),
    },
    {
      lc: true,
      id: 'cantillationStacks',
      formItem: 'slider',
      text: t('Content.cantillationStacks.text'),
      content: t('Content.cantillationStacks.content', {
        RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]),
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]),
        DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBuff[s]),
      }),
      min: 0,
      max: 5,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [
      findContentId(content, 'cadenzaActive'),
    ],
    defaults: () => ({
      cantillationStacks: 5,
      cadenzaActive: true,
    }),
    teammateDefaults: () => ({
      cadenzaActive: true,
    }),
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals

      x.ELEMENTAL_DMG += (t.cadenzaActive) ? sValuesDmgBuff[s] : 0
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.ERR] += r.cantillationStacks * sValuesErr[s]
      x[Stats.ATK_P] += (r.cadenzaActive) ? sValuesAtkBuff[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
