import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.InTheNameOfTheWorld')
  const sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesAtk = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesEhr = [0.18, 0.21, 0.24, 0.27, 0.3]

  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyDebuffedDmgBoost',
    name: 'enemyDebuffedDmgBoost',
    formItem: 'switch',
    text: t('Content.enemyDebuffedDmgBoost.text'),
    title: t('Content.enemyDebuffedDmgBoost.title'),
    content: t('Content.enemyDebuffedDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
  }, {
    lc: true,
    id: 'skillAtkBoost',
    name: 'skillAtkBoost',
    formItem: 'switch',
    text: t('Content.skillAtkBoost.text'),
    title: t('Content.skillAtkBoost.title'),
    content: t('Content.skillAtkBoost.content', { EhrBuff: TsUtils.precisionRound(100 * sValuesEhr[s]), AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyDebuffedDmgBoost: true,
      skillAtkBoost: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyDebuffedDmgBoost) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
