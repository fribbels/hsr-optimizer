import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
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

  const fuaScaling = talent(e, 4.00, 4.40)

  // TODO: Ashblazing

  // const ultHitCountMulti = (1 * 0.1285 + 2 * 0.1285 + 3 * 0.1285 + 4 * 0.1285 + 5 * 0.1285 + 6 * 0.1285 + 7 * 0.2285)
  // const ultBrokenHitCountMulti = (
  //   1 * 0.1285 * 0.1 + 2 * 0.1285 * 0.9
  //   + 3 * 0.1285 * 0.1 + 4 * 0.1285 * 0.9
  //   + 5 * 0.1285 * 0.1 + 6 * 0.1285 * 0.9
  //   + 7 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
  //   + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
  //   + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
  //   + 8 * 0.2285)

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    return 1
  }

  const defaults = {
    defPen: true,
    skillAtkBuff: true,
    spdBasedBuffs: true,
    e1Vulnerability: true,
    e2CdBuff: true,
    e4AdditionalDmg: true,
    e6FuaDmg: true,
  }

  const teammateDefaults = {
    defPen: true,
    e1Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defPen: {
      id: 'defPen',
      formItem: 'switch',
      text: 'Team DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: 'Skill ATK buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    spdBasedBuffs: {
      id: 'spdBasedBuffs',
      formItem: 'switch',
      text: 'SPD based buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1Vulnerability: {
      id: 'e1Vulnerability',
      formItem: 'switch',
      text: 'E1 vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e2CdBuff: {
      id: 'e2CdBuff',
      formItem: 'switch',
      text: 'E2 CD buff',
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
    defPen: content.defPen,
    e1Vulnerability: content.e1Vulnerability,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ATK_P.buff((r.skillAtkBuff) ? skillAtkBuff : 0, SOURCE_SKILL)

      x.CD.buff((e >= 2 && r.e2CdBuff) ? 0.80 : 0, SOURCE_E2)
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

      x.DEF_PEN.buffTeam((m.defPen) ? 0.30 : 0, SOURCE_TRACE)
      x.VULNERABILITY.buffTeam((e >= 1 && m.e1Vulnerability) ? 0.25 : 0, SOURCE_E1)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // TODO: Recorded value

      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardAdditionalDmgAtkFinalizer()
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
  (*p_state).CipherSpdActivation140 == 0.0 &&
  x.SPD >= 170 &&
  ${wgslTrue(r.spdBasedBuffs)}
) {
  (*p_state).CipherSpdActivation140 = 1.0;
  (*p_x).CR += 0.25;
}
    `)
        },
      },
    ],
  }
}
