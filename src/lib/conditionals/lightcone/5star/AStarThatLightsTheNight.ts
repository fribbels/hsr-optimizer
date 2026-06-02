import {
  type Conditionals,
  type ContentDefinition,
  countTeamTrailblazeCompanion,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { precisionRound } from 'lib/utils/mathUtils'
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
  const { SOURCE_LC } = Source.lightCone(A_STAR_THAT_LIGHTS_THE_NIGHT_ID)

  const sValuesAtk = [0.40, 0.50, 0.60, 0.70, 0.80]
  const sValuesDefPen = [0.20, 0.25, 0.30, 0.35, 0.40]
  const sValuesAssistSkillDmg = [0.20, 0.25, 0.30, 0.35, 0.40]
  const sValuesUltDmg = [0.60, 0.75, 0.90, 1.05, 1.20]
  const formatPercent = (value: number) => `${precisionRound(100 * value)}%`

  const defaults = {
    safeEscortStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    safeEscortStacks: {
      lc: true,
      id: 'safeEscortStacks',
      formItem: 'slider',
      text: 'Safe Escort stacks',
      content: `When the wearer uses an Assist Skill, they gain the "Safe Escort" state, lasting for 2 turns and stacking up to 3 times. Each stack of "Safe Escort" increases Assist Skill DMG by ${formatPercent(sValuesAssistSkillDmg[s])}. When "Safe Escort" reaches 3 stacks, each stack also increases Ultimate DMG by ${formatPercent(sValuesUltDmg[s])}.`,
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, sValuesAtk[s], x.source(SOURCE_LC))
      x.buff(StatKey.DEF_PEN, countTeamTrailblazeCompanion(context) >= 2 ? sValuesDefPen[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.BOOST, r.safeEscortStacks * sValuesAssistSkillDmg[s], x.damageType(DamageTag.SKILL).source(SOURCE_LC))
      x.buff(StatKey.BOOST, r.safeEscortStacks === 3 ? r.safeEscortStacks * sValuesUltDmg[s] : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
    },
  }
}

export const AStarThatLightsTheNight: LightConeConfig = {
  id: A_STAR_THAT_LIGHTS_THE_NIGHT_ID,
  conditionals,
}
