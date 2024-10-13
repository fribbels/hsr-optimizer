import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BaptismOfPureThought')
  const sValuesCd = [0.08, 0.09, 0.10, 0.11, 0.12]
  const sValuesDmg = [0.36, 0.42, 0.48, 0.54, 0.60]
  const sValuesFuaPen = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [{
    lc: true,
    formItem: 'slider',
    id: 'debuffCdStacks',
    name: 'debuffCdStacks',
    text: t('Content.debuffCdStacks.text'),
    title: t('Content.debuffCdStacks.title'),
    content: t('Content.debuffCdStacks.content', { DmgStep: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    min: 0,
    max: 3,
  }, {
    lc: true,
    formItem: 'switch',
    id: 'postUltBuff',
    name: 'postUltBuff',
    text: t('Content.postUltBuff.text'),
    title: t('Content.postUltBuff.title'),
    content: t('Content.postUltBuff.content', { DmgStep: TsUtils.precisionRound(100 * sValuesDmg[s]), DefIgnore: TsUtils.precisionRound(100 * sValuesFuaPen[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      debuffCdStacks: 3,
      postUltBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CD] += r.debuffCdStacks * sValuesCd[s]
      x.ELEMENTAL_DMG += r.postUltBuff ? sValuesDmg[s] : 0

      buffAbilityDefPen(x, FUA_TYPE, sValuesFuaPen[s], (r.postUltBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
