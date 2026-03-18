import { type Conditionals, type ContentDefinition, } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag, } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext, } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NeverForgetHerFlame.Content')
  const { SOURCE_LC } = Source.lightCone(NeverForgetHerFlame.id)

  const sValuesBreakDmg = [0.32, 0.42, 0.52, 0.62, 0.72]

  const defaults = {
    breakDmgBuff: true,
  }

  const teammateDefaults = {
    breakDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakDmgBuff: {
      lc: true,
      id: 'breakDmgBuff',
      formItem: 'switch',
      text: t('breakDmgBuff.text'),
      content: t('breakDmgBuff.content', { BreakBoost: precisionRound(100 * sValuesBreakDmg[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    breakDmgBuff: content.breakDmgBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.breakDmgBuff) ? sValuesBreakDmg[s] : 0, x.damageType(DamageTag.BREAK).source(SOURCE_LC))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (t.breakDmgBuff) ? sValuesBreakDmg[s] : 0, x.damageType(DamageTag.BREAK).targets(TargetTag.SingleTarget).source(SOURCE_LC))
    },
  }
}

export const NeverForgetHerFlame: LightConeConfig = {
  id: '23050',
  conditionals,
}
