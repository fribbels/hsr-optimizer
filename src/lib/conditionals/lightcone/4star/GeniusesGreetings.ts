import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.GeniusesGreetings')
  const { SOURCE_LC } = Source.lightCone('21051')

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    basicDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicDmgBoost: {
      lc: true,
      id: 'basicDmgBoost',
      formItem: 'switch',
      text: t('Content.basicDmgBoost.text'),
      content: t('Content.basicDmgBoost.content', { DmgBuff: TsUtils.precisionRound(sValues[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.basicDmgBoost) ? sValues[s] : 0, x.damageType(DamageTag.BASIC).targets(TargetTag.SelfAndMemosprite).source(SOURCE_LC))
    },
  }
}
