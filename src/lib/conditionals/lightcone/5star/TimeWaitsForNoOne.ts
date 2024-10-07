import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TimeWaitsForNoOne')
  const sValuesBonusMultiplier = [0.36, 0.42, 0.48, 0.54, 0.6]
  const content: ContentItem[] = [{
    lc: true,
    id: 'healingBasedDmgProc',
    name: 'healingBasedDmgProc',
    formItem: 'switch',
    text: t('Content.healingBasedDmgProc.text'),
    title: t('Content.healingBasedDmgProc.title'),
    content: t('Content.healingBasedDmgProc.content', { Multiplier: TsUtils.precisionRound(sValuesBonusMultiplier[s] * 100) }), // getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    defaults: () => ({
      healingBasedDmgProc: false,
    }),
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
    },
  }
}
