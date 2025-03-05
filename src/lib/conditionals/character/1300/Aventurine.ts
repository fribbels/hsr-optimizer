import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aventurine')
  const tShield = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.ShieldAbility')
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
  } = Source.character('1304')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.70, 2.916)
  const ultCdBoost = ult(e, 0.15, 0.162)

  const talentDmgScaling = talent(e, 0.25, 0.275)
  const talentResScaling = talent(e, 0.50, 0.55)

  const fuaHits = (e >= 4) ? 10 : 7

  const skillShieldScaling = skill(e, 0.24, 0.256)
  const skillShieldFlat = skill(e, 320, 356)

  const traceShieldScaling = 0.07
  const traceShieldFlat = 96

  const defaults = {
    shieldAbility: SKILL_DMG_TYPE,
    defToCrBoost: true,
    fuaHitsOnTarget: fuaHits,
    fortifiedWagerBuff: true,
    enemyUnnervedDebuff: true,
    e2ResShred: true,
    e4DefBuff: true,
    e6ShieldStacks: 3,
  }

  const teammateDefaults = {
    fortifiedWagerBuff: true,
    enemyUnnervedDebuff: true,
    e2ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    shieldAbility: {
      id: 'shieldAbility',
      formItem: 'select',
      text: tShield('Text'),
      content: tShield('Content'),
      options: [
        { display: tShield('Skill'), value: SKILL_DMG_TYPE, label: tShield('Skill') },
        { display: tShield('Trace'), value: NONE_TYPE, label: tShield('Trace') },
      ],
      fullWidth: true,
    },
    defToCrBoost: {
      id: 'defToCrBoost',
      formItem: 'switch',
      text: t('Content.defToCrBoost.text'),
      content: t('Content.defToCrBoost.content'),
    },
    fortifiedWagerBuff: {
      id: 'fortifiedWagerBuff',
      formItem: 'switch',
      text: t('Content.fortifiedWagerBuff.text'),
      content: t('Content.fortifiedWagerBuff.content', { talentResScaling: TsUtils.precisionRound(100 * talentResScaling) }),
    },
    enemyUnnervedDebuff: {
      id: 'enemyUnnervedDebuff',
      formItem: 'switch',
      text: t('Content.enemyUnnervedDebuff.text'),
      content: t('Content.enemyUnnervedDebuff.content', { ultCdBoost: TsUtils.precisionRound(100 * ultCdBoost) }),
    },
    fuaHitsOnTarget: {
      id: 'fuaHitsOnTarget',
      formItem: 'slider',
      text: t('Content.fuaHitsOnTarget.text'),
      content: t('Content.fuaHitsOnTarget.content', { talentDmgScaling: TsUtils.precisionRound(100 * talentDmgScaling) }),
      min: 0,
      max: fuaHits,
    },
    e2ResShred: {
      id: 'e2ResShred',
      formItem: 'switch',
      text: t('Content.e2ResShred.text'),
      content: t('Content.e2ResShred.content'),
      disabled: e < 2,
    },
    e4DefBuff: {
      id: 'e4DefBuff',
      formItem: 'switch',
      text: t('Content.e4DefBuff.text'),
      content: t('Content.e4DefBuff.content'),
      disabled: e < 4,
    },
    e6ShieldStacks: {
      id: 'e6ShieldStacks',
      formItem: 'slider',
      text: t('Content.e6ShieldStacks.text'),
      content: t('Content.e6ShieldStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    fortifiedWagerBuff: content.fortifiedWagerBuff,
    enemyUnnervedDebuff: content.enemyUnnervedDebuff,
    e2ResShred: content.e2ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.DEF_P.buff((e >= 4 && r.e4DefBuff) ? 0.40 : 0, SOURCE_E4)
      x.ELEMENTAL_DMG.buff((e >= 6) ? Math.min(1.50, 0.50 * r.e6ShieldStacks) : 0, SOURCE_E6)

      x.BASIC_DEF_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_DEF_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_DEF_SCALING.buff(talentDmgScaling * r.fuaHitsOnTarget, SOURCE_TALENT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10 / 3 * r.fuaHitsOnTarget, SOURCE_TALENT)

      if (r.shieldAbility == SKILL_DMG_TYPE) {
        x.SHIELD_SCALING.buff(skillShieldScaling, SOURCE_SKILL)
        x.SHIELD_FLAT.buff(skillShieldFlat, SOURCE_SKILL)
      }
      if (r.shieldAbility == 0) {
        x.SHIELD_SCALING.buff(traceShieldScaling, SOURCE_SKILL)
        x.SHIELD_FLAT.buff(traceShieldFlat, SOURCE_SKILL)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((m.fortifiedWagerBuff) ? talentResScaling : 0, SOURCE_TALENT)
      x.CD.buffTeam((m.enemyUnnervedDebuff) ? ultCdBoost : 0, SOURCE_ULT)
      x.CD.buffTeam((e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0, SOURCE_E1)
      x.RES_PEN.buffTeam((e >= 2 && m.e2ResShred) ? 0.12 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardDefShieldFinalizer(),
    dynamicConditionals: [{
      id: 'AventurineConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.DEF],
      chainsTo: [Stats.CR],
      condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.defToCrBoost && x.a[Key.DEF] > 1600
      },
      effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        dynamicStatConversion(Stats.DEF, Stats.CR, this, x, action, context,
          (convertibleValue) => Math.min(0.48, 0.02 * Math.floor((convertibleValue - 1600) / 100)),
        )
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return gpuDynamicStatConversion(Stats.DEF, Stats.CR, this, action, context,
          `min(0.48, 0.02 * floor((convertibleValue - 1600) / 100))`,
          `${wgslTrue(r.defToCrBoost)} && x.DEF > 1600`,
        )
      },
    }],
  }
}
