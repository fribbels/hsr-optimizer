import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesSkillUltDmg = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesFuaDmg = [0.48, 0.56, 0.64, 0.72, 0.80]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.BeforeDawn.Content')
    return [{
      lc: true,
      id: 'fuaDmgBoost',
      name: 'fuaDmgBoost',
      formItem: 'switch',
      text: t('fuaDmgBoost.text'),
      title: t('fuaDmgBoost.title'),
      content: t('fuaDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesFuaDmg[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      fuaDmgBoost: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, SKILL_TYPE | ULT_TYPE, sValuesSkillUltDmg[s])
      buffAbilityDmg(x, FUA_TYPE, sValuesFuaDmg[s], (r.fuaDmgBoost))
    },
    finalizeCalculations: () => {
    },
  }
}
