import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesShieldHp = [0.16, 0.2, 0.24, 0.28, 0.32]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TextureOfMemories.Content')
    return [{
      lc: true,
      id: 'activeShieldDmgDecrease',
      name: 'activeShieldDmgDecrease',
      formItem: 'switch',
      text: t('activeShieldDmgDecrease.text'),
      title: t('activeShieldDmgDecrease.title'),
      content: t('activeShieldDmgDecrease.content', { ShieldHp: TsUtils.precisionRound(100 * sValuesShieldHp[s]), DmgReduction: TsUtils.precisionRound(100 * sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      activeShieldDmgDecrease: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.DMG_RED_MULTI *= (r.activeShieldDmgDecrease) ? (1 - sValues[s]) : 1
    },
    finalizeCalculations: () => {
    },
  }
}
