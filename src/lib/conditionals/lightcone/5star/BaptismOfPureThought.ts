import { FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDefPen } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BaptismOfPureThought')
  const { SOURCE_LC } = Source.lightCone('23020')

  const sValuesCd = [0.08, 0.09, 0.10, 0.11, 0.12]
  const sValuesDmg = [0.36, 0.42, 0.48, 0.54, 0.60]
  const sValuesFuaPen = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    debuffCdStacks: 3,
    postUltBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    debuffCdStacks: {
      lc: true,
      id: 'debuffCdStacks',
      formItem: 'slider',
      text: t('Content.debuffCdStacks.text'),
      content: t('Content.debuffCdStacks.content', { DmgStep: TsUtils.precisionRound(100 * sValuesCd[s]) }),
      min: 0,
      max: 3,
    },
    postUltBuff: {
      lc: true,
      id: 'postUltBuff',
      formItem: 'switch',
      text: t('Content.postUltBuff.text'),
      content: t('Content.postUltBuff.content', {
        DmgStep: TsUtils.precisionRound(100 * sValuesDmg[s]),
        DefIgnore: TsUtils.precisionRound(100 * sValuesFuaPen[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.CD.buff(r.debuffCdStacks * sValuesCd[s], SOURCE_LC)
      x.ELEMENTAL_DMG.buff(r.postUltBuff ? sValuesDmg[s] : 0, SOURCE_LC)

      buffAbilityDefPen(x, FUA_DMG_TYPE, (r.postUltBuff) ? sValuesFuaPen[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
