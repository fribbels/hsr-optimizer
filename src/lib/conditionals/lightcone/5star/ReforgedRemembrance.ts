import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ReforgedRemembrance')
  const sValuesAtk = [0.05, 0.06, 0.07, 0.08, 0.09]
  const sValuesDotPen = [0.072, 0.079, 0.086, 0.093, 0.10]
  const content: ContentItem[] = [{
    lc: true,
    id: 'prophetStacks',
    name: 'prophetStacks',
    formItem: 'slider',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { StackLimit: 4, AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), DefIgnore: TsUtils.precisionRound(100 * sValuesDotPen[s]) }),
    min: 0,
    max: 4,
  }]

  return {
    content: () => content,
    defaults: () => ({
      prophetStacks: 4,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.prophetStacks * sValuesAtk[s]

      buffAbilityDefPen(x, DOT_TYPE, r.prophetStacks * sValuesDotPen[s])
    },
    finalizeCalculations: () => {
    },
  }
}
