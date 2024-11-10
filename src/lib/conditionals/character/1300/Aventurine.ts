import { NONE_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardDefFinalizer, gpuStandardDefShieldFinalizer, standardDefFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aventurine')
  const tShield = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.ShieldAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

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
    shieldAbility: SKILL_TYPE,
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
        { display: tShield('Skill'), value: SKILL_TYPE, label: tShield('Skill') },
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
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.DEF_P.buff((e >= 4 && r.e4DefBuff) ? 0.40 : 0, Source.NONE)
      x.ELEMENTAL_DMG.buff((e >= 6) ? Math.min(1.50, 0.50 * r.e6ShieldStacks) : 0, Source.NONE)

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.FUA_SCALING.buff(talentDmgScaling * r.fuaHitsOnTarget, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(90, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(10 * r.fuaHitsOnTarget, Source.NONE)

      if (r.shieldAbility == SKILL_TYPE) {
        x.SHIELD_SCALING.buff(skillShieldScaling, Source.NONE)
        x.SHIELD_FLAT.buff(skillShieldFlat, Source.NONE)
      }
      if (r.shieldAbility == 0) {
        x.SHIELD_SCALING.buff(traceShieldScaling, Source.NONE)
        x.SHIELD_FLAT.buff(traceShieldFlat, Source.NONE)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buff((m.fortifiedWagerBuff) ? talentResScaling : 0, Source.NONE)
      x.CD.buff((m.enemyUnnervedDebuff) ? ultCdBoost : 0, Source.NONE)
      x.CD.buff((e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0, Source.NONE)
      x.RES_PEN.buff((e >= 2 && m.e2ResShred) ? 0.12 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardDefFinalizer(x)
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardDefFinalizer() + gpuStandardDefShieldFinalizer()
    },
    dynamicConditionals: [{
      id: 'AventurineConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.DEF],
      condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.defToCrBoost && x.a[Key.DEF] > 1600
      },
      effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const stateValue = action.conditionalState[this.id] || 0
        const buffValue = Math.min(0.48, 0.02 * Math.floor((x.a[Key.DEF] - 1600) / 100))

        action.conditionalState[this.id] = buffValue
        x.CR.buffDynamic(buffValue - stateValue, Source.NONE, action, context)

        return buffValue
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return conditionalWgslWrapper(this, `
if (${wgslFalse(r.defToCrBoost)}) {
  return;
}
let def = (*p_x).DEF;
let stateValue: f32 = (*p_state).AventurineConversionConditional;

if (def > 1600) {
  let buffValue: f32 = min(0.48, 0.02 * floor((def - 1600) / 100));

  (*p_state).AventurineConversionConditional = buffValue;
  buffDynamicCR(buffValue - stateValue, p_x, p_state);
}
    `)
      },
    }],
  }
}
