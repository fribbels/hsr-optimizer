import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { EPOCH_ETCHED_IN_GOLDEN_BLOOD } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EpochEtchedInGoldenBlood.Content')
  const { SOURCE_LC } = Source.lightCone(EPOCH_ETCHED_IN_GOLDEN_BLOOD)

  const sValuesSkillDmg = [0.54, 0.675, 0.81, 0.945, 1.08]

  const teammateDefaults = {
    skillDmgBoost: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillDmgBoost: {
      lc: true,
      id: 'skillDmgBoost',
      formItem: 'switch',
      text: t('skillDmgBoost.text'),
      content: t('skillDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesSkillDmg[s]) }),
    },
  }

  return {
    content: () => [],
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({}),
    teammateDefaults: () => teammateDefaults,
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (t.skillDmgBoost) ? sValuesSkillDmg[s] : 0, x.damageType(DamageTag.SKILL).source(SOURCE_LC))
    },
  }
}
