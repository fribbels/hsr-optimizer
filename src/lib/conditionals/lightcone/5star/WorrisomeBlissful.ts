import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.WorrisomeBlissful')
  const sValuesFuaDmg = [0.30, 0.35, 0.40, 0.45, 0.50]
  const sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]
  const content: ContentItem[] = [{
    lc: true,
    id: 'targetTameStacks',
    name: 'targetTameStacks',
    formItem: 'slider',
    text: t('Content.targetTameStacks.text'),
    title: t('Content.targetTameStacks.title'),
    content: t('Content.targetTameStacks.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }), // getContentFromLCRanks(s, lcRank2),
    min: 0,
    max: 2,
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      targetTameStacks: 2,
    }),
    teammateDefaults: () => ({
      targetTameStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, _request: Form) => {
      buffAbilityDmg(x, FUA_TYPE, sValuesFuaDmg[s])
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.CD] += m.targetTameStacks * sValuesCd[s]
    },
    finalizeCalculations: () => {
    },
  }
}
