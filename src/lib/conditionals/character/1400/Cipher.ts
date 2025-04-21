import i18next from 'i18next'
import { AbilityType, ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, CURRENT_DATA_VERSION, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Cipher')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1406')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const skillAtkBuff = skill(e, 0.30, 0.33)

  const ultScaling = ult(e, 1.20, 1.296)
  const ultSecondaryScaling = ult(e, 0.40, 0.432)

  const fuaScaling = talent(e, 2.50, 2.75)

  const defaults = {
    vulnerability: true,
    skillAtkBuff: true,
    fuaCdBoost: true,
    spdBasedBuffs: true,
    e1AtkBuff: true,
    e2Vulnerability: true,
    e4AdditionalDmg: true,
    e6FuaDmg: true,
  }

  const teammateDefaults = {
    vulnerability: true,
    e2Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    vulnerability: {
      id: 'vulnerability',
      formItem: 'switch',
      text: 'Team Vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: 'Skill ATK buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    fuaCdBoost: {
      id: 'fuaCdBoost',
      formItem: 'switch',
      text: 'Fua CD boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    spdBasedBuffs: {
      id: 'spdBasedBuffs',
      formItem: 'switch',
      text: 'SPD based buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1AtkBuff: {
      id: 'e1AtkBuff',
      formItem: 'switch',
      text: 'E1 ATK buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e2Vulnerability: {
      id: 'e2Vulnerability',
      formItem: 'switch',
      text: 'E2 vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    e4AdditionalDmg: {
      id: 'e4AdditionalDmg',
      formItem: 'switch',
      text: 'E4 Additional DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6FuaDmg: {
      id: 'e6FuaDmg',
      formItem: 'switch',
      text: 'E6 Fua DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    vulnerability: content.vulnerability,
    e2Vulnerability: content.e2Vulnerability,
  }

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.20 + 2 * 0.10 + 3 * 0.10 + 4 * 0.60)

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ATK_P.buff((r.skillAtkBuff) ? skillAtkBuff : 0, SOURCE_SKILL)
      x.FUA_CD_BOOST.buff(1.00, SOURCE_TRACE)

      x.ATK_P.buff((e >= 1 && r.e1AtkBuff) ? 0.80 : 0, SOURCE_E1)
      x.FUA_DMG_BOOST.buff((e >= 6 && r.e6FuaDmg) ? 3.50 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff(ultSecondaryScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)

      if (e >= 4) {
        x.BASIC_ADDITIONAL_DMG_SCALING.buff(0.50, SOURCE_E4)
        x.SKILL_ADDITIONAL_DMG_SCALING.buff(0.50, SOURCE_E4)
        x.ULT_ADDITIONAL_DMG_SCALING.buff(0.50, SOURCE_E4)
        x.FUA_ADDITIONAL_DMG_SCALING.buff(0.50, SOURCE_E4)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(20, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((m.vulnerability) ? 0.40 : 0, SOURCE_TRACE)
      x.VULNERABILITY.buffTeam((e >= 2 && m.e2Vulnerability) ? 0.30 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // TODO: Recorded value

      boostAshblazingAtkP(x, action, context, hitMulti)
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardAdditionalDmgAtkFinalizer() + gpuBoostAshblazingAtkP(hitMulti)
    },
    dynamicConditionals: [
      {
        id: 'CipherSpdActivation140',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.CR],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.spdBasedBuffs && x.a[Key.SPD] >= 140
        },
        effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
          const r = action.characterConditionals as Conditionals<typeof content>

          x.CR.buffDynamic((r.spdBasedBuffs && x.a[Key.SPD] >= 140) ? 0.25 : 0, SOURCE_TRACE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return conditionalWgslWrapper(this, `
if (
  (*p_state).CipherSpdActivation140 == 0.0 &&
  x.SPD >= 140 &&
  ${wgslTrue(r.spdBasedBuffs)}
) {
  (*p_state).CipherSpdActivation140 = 1.0;
  (*p_x).CR += 0.25;
}
    `)
        },
      },
      {
        id: 'CipherSpdActivation170',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.CR],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.spdBasedBuffs && x.a[Key.SPD] >= 170
        },
        effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
          const r = action.characterConditionals as Conditionals<typeof content>

          x.CR.buffDynamic((r.spdBasedBuffs && x.a[Key.SPD] >= 170) ? 0.25 : 0, SOURCE_TRACE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return conditionalWgslWrapper(this, `
if (
  (*p_state).CipherSpdActivation170 == 0.0 &&
  x.SPD >= 170 &&
  ${wgslTrue(r.spdBasedBuffs)}
) {
  (*p_state).CipherSpdActivation170 = 1.0;
  (*p_x).CR += 0.25;
}
    `)
        },
      },
    ],
  }
}
