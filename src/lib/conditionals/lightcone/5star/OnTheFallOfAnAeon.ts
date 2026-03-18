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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.OnTheFallOfAnAeon')
  const { SOURCE_LC } = Source.lightCone(OnTheFallOfAnAeon.id)

  const sValuesAtkStacks = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesDmgBuff = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    atkBoostStacks: 4,
    weaknessBreakDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkBoostStacks: {
      lc: true,
      id: 'atkBoostStacks',
      formItem: 'slider',
      text: t('Content.atkBoostStacks.text'),
      content: t('Content.atkBoostStacks.content', { AtkBuff: precisionRound(100 * sValuesAtkStacks[s]) }),
      min: 0,
      max: 4,
    },
    weaknessBreakDmgBuff: {
      lc: true,
      id: 'weaknessBreakDmgBuff',
      formItem: 'switch',
      text: t('Content.weaknessBreakDmgBuff.text'),
      content: t('Content.weaknessBreakDmgBuff.content', { DmgBuff: precisionRound(100 * sValuesDmgBuff[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, r.atkBoostStacks * sValuesAtkStacks[s], x.source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (r.weaknessBreakDmgBuff) ? sValuesDmgBuff[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const OnTheFallOfAnAeon: LightConeConfig = {
  id: '24000',
  conditionals,
}
