import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TimeWaitsForNoOne')

  const sValuesBonusMultiplier = [0.36, 0.42, 0.48, 0.54, 0.6]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'healingBasedDmgProc',
      formItem: 'switch',
      text: t('Content.healingBasedDmgProc.text'),
      content: t('Content.healingBasedDmgProc.content', { Multiplier: TsUtils.precisionRound(sValuesBonusMultiplier[s] * 100) }), // getContentFromLCRanks(s, lcRank),
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      healingBasedDmgProc: false,
    }),
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
    },
  }
}
