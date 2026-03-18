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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.HeyOverHere')
  const { SOURCE_LC } = Source.lightCone(HeyOverHere.id)

  const sValues = [0.16, 0.19, 0.22, 0.25, 0.28]

  const defaults = {
    postSkillHealBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postSkillHealBuff: {
      lc: true,
      id: 'postSkillHealBuff',
      formItem: 'switch',
      text: t('Content.postSkillHealBuff.text'),
      content: t('Content.postSkillHealBuff.content', { HealingBoost: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.OHB, (r.postSkillHealBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const HeyOverHere: LightConeConfig = {
  id: '22001',
  conditionals,
}
