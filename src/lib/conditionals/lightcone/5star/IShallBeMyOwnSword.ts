import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24]
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.IShallBeMyOwnSword.Content')
    return [
      {
        lc: true,
        id: 'eclipseStacks',
        name: 'eclipseStacks',
        formItem: 'slider',
        text: t('eclipseStacks.text'),
        title: t('eclipseStacks.title'),
        content: t('eclipseStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesStackDmg[s]) }),
        min: 0,
        max: 3,
      },
      {
        lc: true,
        id: 'maxStackDefPen',
        name: 'maxStackDefPen',
        formItem: 'switch',
        text: t('maxStackDefPen.text'),
        title: t('maxStackDefPen.title'),
        content: t('maxStackDefPen.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
      },
    ]
  })()

  return {
    content: () => content,
    defaults: () => ({
      eclipseStacks: 3,
      maxStackDefPen: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals
      x.ELEMENTAL_DMG += r.eclipseStacks * sValuesStackDmg[s]
      x.DEF_PEN += (r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
