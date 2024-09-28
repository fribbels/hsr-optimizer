import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ButTheBattleIsntOver')
  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const content: ContentItem[] = [{
    lc: true,
    id: 'postSkillDmgBuff',
    name: 'postSkillDmgBuff',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
  }]

  return {
    content: () => [],
    teammateContent: () => content,
    defaults: () => ({}),
    teammateDefaults: () => ({
      postSkillDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x.ELEMENTAL_DMG += (t.postSkillDmgBuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
