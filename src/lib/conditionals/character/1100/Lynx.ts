import { NONE_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpFinalizer, gpuStandardHpHealFinalizer, standardHpFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lynx')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillHpPercentBuff = skill(e, 0.075, 0.08)
  const skillHpFlatBuff = skill(e, 200, 223)

  const basicScaling = basic(e, 0.50, 0.55)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const skillHealScaling = skill(e, 0.12, 0.128)
  const skillHealFlat = skill(e, 320, 356)

  const ultHealScaling = ult(e, 0.135, 0.144)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.036, 0.0384)
  const talentHealFlat = talent(e, 96, 106.8)

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content', {
        skillHpPercentBuff: TsUtils.precisionRound(100 * skillHpPercentBuff),
        skillHpFlatBuff: skillHpFlatBuff,
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillBuff: content.skillBuff,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateHPValue.text'),
      content: t('TeammateContent.teammateHPValue.content', {
        skillHpPercentBuff: TsUtils.precisionRound(100 * skillHpPercentBuff),
        skillHpFlatBuff: skillHpFlatBuff,
      }),
      min: 0,
      max: 10000,
    },
  }

  const defaults = {
    healAbility: ULT_DMG_TYPE,
    skillBuff: true,
  }

  const teammateDefaults = {
    skillBuff: true,
    teammateHPValue: 6000,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, Source.NONE)
        x.HEAL_SCALING.buff(skillHealScaling, Source.NONE)
        x.HEAL_FLAT.buff(skillHealFlat, Source.NONE)
      }
      if (r.healAbility == ULT_DMG_TYPE) {
        x.HEAL_TYPE.set(ULT_DMG_TYPE, Source.NONE)
        x.HEAL_SCALING.buff(ultHealScaling, Source.NONE)
        x.HEAL_FLAT.buff(ultHealFlat, Source.NONE)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, Source.NONE)
        x.HEAL_SCALING.buff(talentHealScaling, Source.NONE)
        x.HEAL_FLAT.buff(talentHealFlat, Source.NONE)
      }

      if (r.skillBuff) {
        x.HP.buff(skillHpFlatBuff, Source.NONE)
        x.RATIO_BASED_HP_BUFF.buff(skillHpFlatBuff, Source.NONE)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((e >= 6 && m.skillBuff) ? 0.30 : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.HP.buffTeam((t.skillBuff) ? skillHpPercentBuff * t.teammateHPValue : 0, Source.NONE)
      x.HP.buffTeam((e >= 6 && t.skillBuff) ? 0.06 * t.teammateHPValue : 0, Source.NONE)
      x.HP.buffTeam((t.skillBuff) ? skillHpFlatBuff : 0, Source.NONE)

      const atkBuffValue = (e >= 4 && t.skillBuff) ? 0.03 * t.teammateHPValue : 0
      x.ATK.buffTeam(atkBuffValue, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpFinalizer(x)
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardHpFinalizer() + gpuStandardHpHealFinalizer()
    },
    dynamicConditionals: [
      {
        id: 'LynxHpConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP, Stats.ATK],
        ratioConversion: true,
        supplementalState: ['LynxAtkConversionConditional'],
        condition: function () {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.skillBuff) {
            return
          }
          const supplementalStateId = this.supplementalState![0]

          const hpBuffPercent = skillHpPercentBuff + (e >= 6 ? 0.06 : 0)
          const atkBuffPercent = (e >= 4 ? 0.03 : 0)

          const stateValue = action.conditionalState[this.id] || 0
          const supplementalStateValue = action.conditionalState[this.id] || 0
          const convertibleHpValue = x.a[Key.HP] - x.a[Key.RATIO_BASED_HP_BUFF]

          const buffHP = hpBuffPercent * convertibleHpValue
          const finalBuffHP = buffHP - stateValue

          const buffATK = atkBuffPercent * convertibleHpValue
          const finalBuffATK = buffATK - supplementalStateValue

          action.conditionalState[this.id] = (action.conditionalState[this.id] ?? 0) + finalBuffHP
          action.conditionalState[supplementalStateId] = (action.conditionalState[supplementalStateId] ?? 0) + finalBuffATK

          x.RATIO_BASED_HP_BUFF.buff(finalBuffHP, Source.NONE)

          x.HP.buffDynamic(finalBuffHP, Source.NONE, action, context)
          x.ATK.buffDynamic(finalBuffATK, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.skillBuff)}) {
  return;
}

let hpBuffPercent = ${skillHpPercentBuff + (e >= 6 ? 0.06 : 0)};
let atkBuffPercent = ${(e >= 4 ? 0.03 : 0)};

let stateValue: f32 = (*p_state).LynxHpConversionConditional;
let supplementalStateValue: f32 = (*p_state).LynxAtkConversionConditional;
let convertibleHpValue: f32 = (*p_x).HP - (*p_x).RATIO_BASED_HP_BUFF;

let buffHP = hpBuffPercent * convertibleHpValue;
let finalBuffHP = buffHP - stateValue;

let buffATK = atkBuffPercent * convertibleHpValue;
let finalBuffATK = buffATK - supplementalStateValue;

(*p_state).LynxHpConversionConditional += finalBuffHP;
(*p_state).LynxAtkConversionConditional += finalBuffATK;

(*p_x).RATIO_BASED_HP_BUFF += finalBuffHP;

(*p_x).HP += finalBuffHP;
(*p_x).ATK += finalBuffATK;
    `)
        },
      },
    ],
  }
}
