import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesAtk = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesErr = [0.06, 0.07, 0.08, 0.09, 0.10]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.BrighterThanTheSun.Content')
    return [{
      lc: true,
      id: 'dragonsCallStacks',
      name: 'dragonsCallStacks',
      formItem: 'slider',
      text: t('dragonsCallStacks.text'),
      title: t('dragonsCallStacks.title'),
      content: t('dragonsCallStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
      min: 0,
      max: 2,
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      dragonsCallStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.dragonsCallStacks * sValuesAtk[s]
      x[Stats.ERR] += r.dragonsCallStacks * sValuesErr[s]
    },
    finalizeCalculations: () => {
    },
  }
}
