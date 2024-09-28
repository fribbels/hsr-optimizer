import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.IShallBeMyOwnSword')
  const sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24]
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'eclipseStacks',
      name: 'eclipseStacks',
      formItem: 'slider',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesStackDmg[s]) }),
      min: 0,
      max: 3,
    },
    {
      lc: true,
      id: 'maxStackDefPen',
      name: 'maxStackDefPen',
      formItem: 'switch',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
    },
  ]

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
