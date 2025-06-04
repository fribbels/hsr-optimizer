import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
  DOT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkP,
  gpuBoostAshblazingAtkP,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  buffAbilityDmg,
  buffAbilityVulnerability,
  Target,
} from 'lib/optimization/calculateBuffs'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import i18next from 'i18next'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Stats,
} from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  wgslFalse,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Kafka')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1005')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 0.80, 0.864)
  const fuaScaling = talent(e, 1.40, 1.596)
  const dotScaling = ult(e, 2.90, 3.183)

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.15 + 2 * 0.15 + 3 * 0.15 + 4 * 0.15 + 5 * 0.15 + 6 * 0.25)

  const defaults = {
    ehrBasedBuff: true,
    e1DotDmgReceivedDebuff: true,
    e2TeamDotDmg: true,
  }

  const teammateDefaults = {
    ehrBasedBuff: true,
    e1DotDmgReceivedDebuff: true,
    e2TeamDotDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ehrBasedBuff: {
      id: 'ehrBasedBuff',
      formItem: 'switch',
      text: 'EHR to DMG buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1DotDmgReceivedDebuff: {
      id: 'e1DotDmgReceivedDebuff',
      formItem: 'switch',
      text: t('Content.e1DotDmgReceivedDebuff.text'),
      content: t('Content.e1DotDmgReceivedDebuff.content'),
      disabled: e < 1,
    },
    e2TeamDotDmg: {
      id: 'e2TeamDotDmg',
      formItem: 'switch',
      text: 'E2 DOT Dmg',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ehrBasedBuff: content.ehrBasedBuff,
    e1DotDmgReceivedDebuff: content.e1DotDmgReceivedDebuff,
    e2TeamDotDmg: content.e2TeamDotDmg,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_ULT)

      x.DOT_ATK_SCALING.buff((e >= 6) ? 1.56 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      x.DOT_CHANCE.set(1.00, SOURCE_TRACE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, DOT_DMG_TYPE, (e >= 1 && m.e1DotDmgReceivedDebuff) ? 0.30 : 0, SOURCE_E1, Target.TEAM)
      buffAbilityDmg(x, DOT_DMG_TYPE, (e >= 2 && m.e2TeamDotDmg) ? 0.33 : 0, SOURCE_E2, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.ehrBasedBuff && x.a[Key.EHR] >= 0.75) {
        x.ATK.buff(1.00 * context.baseATK, SOURCE_TRACE)
      }

      boostAshblazingAtkP(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return gpuBoostAshblazingAtkP(hitMulti) + `
if (${wgslTrue(r.ehrBasedBuff)} && x.EHR >= 0.75) {
  (*p_x).ATK += 1.00 * baseATK;
}
`
    },
    teammateDynamicConditionals: [
      {
        id: 'KafkaEhrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.EHR],
        chainsTo: [],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.a[Key.EHR] >= 0.75
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          if (!r.ehrBasedBuff) {
            return
          }

          if (x.a[Key.EHR] >= 0.75) {
            x.ATK.buff(1.00 * context.baseATK, SOURCE_TRACE)
          }
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>

          return conditionalWgslWrapper(
            this,
            `
if (${wgslFalse(r.ehrBasedBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).${this.id};

if (x.EHR >= 0.75 && stateValue == 0) {
  (*p_x).ATK += 1.00 * baseATK;
  (*p_state).${this.id} = 1;
}
        `,
          )
        },
      },
    ],
  }
}
