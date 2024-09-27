import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.CruisingInTheStellarSea')
  const sValuesCr = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesAtk = [0.20, 0.25, 0.30, 0.35, 0.40]

  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHp50CrBoost',
    name: 'enemyHp50CrBoost',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { HPThreshold: 0.5, CritBuff: TsUtils.precisionRound(100 * sValuesCr[s]) }),
  }, {
    lc: true,
    id: 'enemyDefeatedAtkBuff',
    name: 'enemyDefeatedAtkBuff',
    formItem: 'switch',
    text: t('Content.1.text'),
    title: t('Content.1.title'),
    content: t('Content.1.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), Duration: 2 }),
  }]

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
