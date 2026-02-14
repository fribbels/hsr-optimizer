import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InTheNameOfTheWorld')
  const { SOURCE_LC } = Source.lightCone('23004')

  const sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesAtk = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesEhr = [0.18, 0.21, 0.24, 0.27, 0.3]

  const defaults = {
    enemyDebuffedDmgBoost: true,
    skillAtkBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyDebuffedDmgBoost: {
      lc: true,
      id: 'enemyDebuffedDmgBoost',
      formItem: 'switch',
      text: t('Content.enemyDebuffedDmgBoost.text'),
      content: t('Content.enemyDebuffedDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
    },
    skillAtkBoost: {
      lc: true,
      id: 'skillAtkBoost',
      formItem: 'switch',
      text: t('Content.skillAtkBoost.text'),
      content: t('Content.skillAtkBoost.content', {
        EhrBuff: TsUtils.precisionRound(100 * sValuesEhr[s]),
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.enemyDebuffedDmgBoost) ? sValuesDmg[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.ATK_P, (r.skillAtkBoost) ? sValuesAtk[s] : 0, x.damageType(DamageTag.SKILL).source(SOURCE_LC))
    },
  }
}
