import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ButTheBattleIsntOver')
  const { SOURCE_LC } = Source.lightCone(ButTheBattleIsntOver.id)

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
      content: t('Content.postSkillDmgBuff.content', { DmgBuff: precisionRound(100 * sValuesDmg[s]) }),
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

export const ButTheBattleIsntOver: LightConeConfig = {
  id: '23003',
  conditionals,
}
