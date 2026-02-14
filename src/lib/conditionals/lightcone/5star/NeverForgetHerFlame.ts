import { Conditionals, ContentDefinition, } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { NEVER_FORGET_HER_FLAME } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NeverForgetHerFlame.Content')
  const { SOURCE_LC } = Source.lightCone(NEVER_FORGET_HER_FLAME)

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
      content: t('breakDmgBuff.content', { BreakBoost: TsUtils.precisionRound(100 * sValuesBreakDmg[s]) }),
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
