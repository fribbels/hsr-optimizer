import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TheBirthOfTheSelf')
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHp50FuaBuff',
    name: 'enemyHp50FuaBuff',
    formItem: 'switch',
    text: t('Content.enemyHp50FuaBuff.text'),
    title: t('Content.enemyHp50FuaBuff.title'),
    content: t('Content.enemyHp50FuaBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyHp50FuaBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, sValues[s])
      buffAbilityDmg(x, FUA_TYPE, sValues[s], (r.enemyHp50FuaBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
