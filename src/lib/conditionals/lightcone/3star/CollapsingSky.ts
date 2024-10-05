import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.CollapsingSky')
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  const content: ContentItem[] = [{
    lc: true,
    id: 'basicSkillDmgBuff',
    name: 'basicSkillDmgBuff',
    formItem: 'switch',
    text: t('Content.basicSkillDmgBuff.text'),
    title: t('Content.basicSkillDmgBuff.title'),
    content: t('Content.basicSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      basicSkillDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, sValues[s], (r.basicSkillDmgBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
