import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Chorus')
  const { SOURCE_LC } = Source.lightCone(Chorus.id)

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    inBattleAtkBuff: true,
  }

  const teammateDefaults = {
    inBattleAtkBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    inBattleAtkBuff: {
      lc: true,
      id: 'inBattleAtkBuff',
      formItem: 'switch',
      text: t('Content.inBattleAtkBuff.text'),
      content: t('Content.inBattleAtkBuff.content', { AtkBuff: precisionRound(100 * sValues[s]) }),
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    inBattleAtkBuff: content.inBattleAtkBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ATK_P, (m.inBattleAtkBuff) ? sValues[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const Chorus: LightConeConfig = {
  id: '20005',
  conditionals,
}
