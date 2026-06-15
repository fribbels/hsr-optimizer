import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type LightConeConditionalsController } from 'types/conditionals'
import {
  type LightConeId,
  type SuperImpositionLevel,
} from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const A_STAR_THAT_LIGHTS_THE_NIGHT_ID = '23060' as unknown as LightConeId

const conditionals = (s: SuperImpositionLevel, _withContent: boolean): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(A_STAR_THAT_LIGHTS_THE_NIGHT_ID)

  const sValuesDefPen = [0.20, 0.25, 0.30, 0.35, 0.40]
  const sValuesSailDmg = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    sailStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    sailStacks: {
      lc: true,
      id: 'sailStacks',
      formItem: 'slider',
      text: 'Sail stacks',
      content: betaContent,
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, _context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, sValuesDefPen[s], x.source(SOURCE_LC))
      x.buff(StatKey.BOOST, r.sailStacks * sValuesSailDmg[s], x.damageType(DamageTag.ASSIST).source(SOURCE_LC))
      x.buff(StatKey.BOOST, r.sailStacks === 3 ? r.sailStacks * sValuesSailDmg[s] : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
    },
  }
}

export const AStarThatLightsTheNight: LightConeConfig = {
  id: A_STAR_THAT_LIGHTS_THE_NIGHT_ID,
  conditionals,
}
