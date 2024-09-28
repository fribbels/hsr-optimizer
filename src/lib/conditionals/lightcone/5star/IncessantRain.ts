import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { findContentId } from 'lib/conditionals/conditionalUtils'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.IncessantRain')
  const sValuesCr = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDmg = [0.12, 0.14, 0.16, 0.18, 0.20]

  const content: ContentItem[] = [{
    lc: true,
    id: 'enemy3DebuffsCrBoost',
    name: 'enemy3DebuffsCrBoost',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCr[s]) }),
  }, {
    lc: true,
    id: 'targetCodeDebuff',
    name: 'targetCodeDebuff',
    formItem: 'switch',
    text: t('Content.1.text'),
    title: t('Content.1.title'),
    content: t('Content.1.content', { DmgIncrease: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetCodeDebuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      enemy3DebuffsCrBoost: true,
      targetCodeDebuff: true,
    }),
    teammateDefaults: () => ({
      targetCodeDebuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.enemy3DebuffsCrBoost) ? sValuesCr[s] : 0
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.VULNERABILITY += (m.targetCodeDebuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
