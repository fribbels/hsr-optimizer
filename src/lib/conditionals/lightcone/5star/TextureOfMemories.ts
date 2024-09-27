import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TextureOfMemories')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesShieldHp = [0.16, 0.2, 0.24, 0.28, 0.32]

  const content: ContentItem[] = [{
    lc: true,
    id: 'activeShieldDmgDecrease',
    name: 'activeShieldDmgDecrease',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { ShieldHp: TsUtils.precisionRound(100 * sValuesShieldHp[s]), Duration: 2, Cooldown: 3, DmgReduction: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

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
