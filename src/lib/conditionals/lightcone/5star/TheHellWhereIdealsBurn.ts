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
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheHellWhereIdealsBurn.Content')
  const { SOURCE_LC } = Source.lightCone(TheHellWhereIdealsBurn.id)

  const sValuesAtk = [0.40, 0.50, 0.60, 0.70, 0.80]
  const sValuesAtkStacks = [0.10, 0.125, 0.15, 0.175, 0.20]

  const defaults = {
    spAtkBuff: true,
    atkBuffStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    spAtkBuff: {
      lc: true,
      id: 'spAtkBuff',
      formItem: 'switch',
      text: t('spAtkBuff.text'),
      content: t('spAtkBuff.content', { SPAtkBuff: precisionRound(100 * sValuesAtk[s]) }),
    },
    atkBuffStacks: {
      lc: true,
      id: 'atkBuffStacks',
      formItem: 'slider',
      text: t('atkBuffStacks.text'),
      content: t('atkBuffStacks.content', { ScalingAtkBuff: precisionRound(100 * sValuesAtkStacks[s]) }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.spAtkBuff) ? sValuesAtk[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.ATK_P, r.atkBuffStacks * sValuesAtkStacks[s], x.source(SOURCE_LC))
    },
  }
}

export const TheHellWhereIdealsBurn: LightConeConfig = {
  id: '23046',
  conditionals,
}
