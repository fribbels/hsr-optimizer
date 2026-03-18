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
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IncessantRain')
  const { SOURCE_LC } = Source.lightCone(IncessantRain.id)

  const sValuesCr = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDmg = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    enemy3DebuffsCrBoost: true,
    targetCodeDebuff: true,
  }

  const teammateDefaults = {
    targetCodeDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemy3DebuffsCrBoost: {
      lc: true,
      id: 'enemy3DebuffsCrBoost',
      formItem: 'switch',
      text: t('Content.enemy3DebuffsCrBoost.text'),
      content: t('Content.enemy3DebuffsCrBoost.content', { CritBuff: precisionRound(100 * sValuesCr[s]) }),
    },
    targetCodeDebuff: {
      lc: true,
      id: 'targetCodeDebuff',
      formItem: 'switch',
      text: t('Content.targetCodeDebuff.text'),
      content: t('Content.targetCodeDebuff.content', { DmgIncrease: precisionRound(100 * sValuesDmg[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetCodeDebuff: content.targetCodeDebuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.enemy3DebuffsCrBoost) ? sValuesCr[s] : 0, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.targetCodeDebuff) ? sValuesDmg[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const IncessantRain: LightConeConfig = {
  id: '23007',
  conditionals,
}
