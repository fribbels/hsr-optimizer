import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesStackDmg = [0.04, 0.05, 0.06, 0.07, 0.08]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ConcertForTwo.Content')
    return [
      {
        lc: true,
        id: 'teammateShieldStacks',
        name: 'teammateShieldStacks',
        formItem: 'slider',
        text: t('teammateShieldStacks.text'),
        title: t('teammateShieldStacks.title'),
        content: t('teammateShieldStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesStackDmg[s]) }),
        min: 0,
        max: 4,
      },
    ]
  })()

  return {
    content: () => content,
    defaults: () => ({
      teammateShieldStacks: 4,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.teammateShieldStacks) * sValuesStackDmg[s]
    },
    finalizeCalculations: () => {
    },
  }
}
