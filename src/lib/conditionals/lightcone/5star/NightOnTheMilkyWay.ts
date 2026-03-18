import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NightOnTheMilkyWay')
  const { SOURCE_LC } = Source.lightCone(NightOnTheMilkyWay.id)

  const sValuesAtk = [0.09, 0.105, 0.12, 0.135, 0.15]
  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const defaults = {
    enemyCountAtkBuff: true,
    enemyWeaknessBreakDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyCountAtkBuff: {
      lc: true,
      id: 'enemyCountAtkBuff',
      formItem: 'switch',
      text: t('Content.enemyCountAtkBuff.text'),
      content: t('Content.enemyCountAtkBuff.content', { AtkBuff: precisionRound(100 * sValuesAtk[s]) }),
    },
    enemyWeaknessBreakDmgBuff: {
      lc: true,
      id: 'enemyWeaknessBreakDmgBuff',
      formItem: 'switch',
      text: t('Content.enemyWeaknessBreakDmgBuff.text'),
      content: t('Content.enemyWeaknessBreakDmgBuff.content', { DmgBuff: precisionRound(100 * sValuesDmg[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.enemyCountAtkBuff) ? context.enemyCount * sValuesAtk[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (r.enemyWeaknessBreakDmgBuff) ? sValuesDmg[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const NightOnTheMilkyWay: LightConeConfig = {
  id: '23000',
  conditionals,
}
