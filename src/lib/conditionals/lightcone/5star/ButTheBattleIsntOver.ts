import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ButTheBattleIsntOver')
  const { SOURCE_LC } = Source.lightCone('23003')

  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const teammateDefaults = {
    postSkillDmgBuff: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    postSkillDmgBuff: {
      lc: true,
      formItem: 'switch',
      id: 'postSkillDmgBuff',
      text: t('Content.postSkillDmgBuff.text'),
      content: t('Content.postSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
    },
  }

  return {
    content: () => [],
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({}),
    teammateDefaults: () => teammateDefaults,
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (t.postSkillDmgBuff) ? sValuesDmg[s] : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_LC))
    },
  }
}
