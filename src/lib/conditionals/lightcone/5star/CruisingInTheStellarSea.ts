import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesCr = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesAtk = [0.20, 0.25, 0.30, 0.35, 0.40]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.CruisingInTheStellarSea.Content')
    return [{
      lc: true,
      id: 'enemyHp50CrBoost',
      name: 'enemyHp50CrBoost',
      formItem: 'switch',
      text: t('enemyHp50CrBoost.text'),
      title: t('enemyHp50CrBoost.title'),
      content: t('enemyHp50CrBoost.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCr[s]) }),
    }, {
      lc: true,
      id: 'enemyDefeatedAtkBuff',
      name: 'enemyDefeatedAtkBuff',
      formItem: 'switch',
      text: t('enemyDefeatedAtkBuff.text'),
      title: t('enemyDefeatedAtkBuff.title'),
      content: t('enemyDefeatedAtkBuff.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      enemyHp50CrBoost: false,
      enemyDefeatedAtkBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.enemyHp50CrBoost) ? sValuesCr[s] : 0
      x[Stats.ATK_P] += (r.enemyDefeatedAtkBuff) ? sValuesAtk[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
