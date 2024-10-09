import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesDmgBoost = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesStacks = [0.04, 0.05, 0.06, 0.07, 0.08]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TheSeriousnessOfBreakfast.Content')
    return [{
      lc: true,
      id: 'dmgBoost',
      name: 'dmgBoost',
      formItem: 'switch',
      text: t('dmgBoost.text'),
      title: t('dmgBoost.title'),
      content: t('dmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    }, {
      lc: true,
      id: 'defeatedEnemyAtkStacks',
      name: 'defeatedEnemyAtkStacks',
      formItem: 'slider',
      text: t('defeatedEnemyAtkStacks.text'),
      title: t('defeatedEnemyAtkStacks.title'),
      content: t('defeatedEnemyAtkStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesStacks[s]) }),
      min: 0,
      max: 3,
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      dmgBoost: true,
      defeatedEnemyAtkStacks: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.defeatedEnemyAtkStacks * sValuesStacks[s]
      x.ELEMENTAL_DMG += (r.dmgBoost) ? sValuesDmgBoost[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
