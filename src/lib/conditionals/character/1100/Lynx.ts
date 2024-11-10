import { NONE_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpFinalizer, gpuStandardHpHealFinalizer, standardHpFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse, wgslTrue } from 'lib/gpu/injection/wgslUtils'
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
        { display: tHeal('Skill'), value: SKILL_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_TYPE, label: tHeal('Ult') },
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
    healAbility: ULT_TYPE,
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

      if (r.healAbility == SKILL_TYPE) {
        x.HEAL_TYPE.set(SKILL_TYPE, Source.NONE)
        x.HEAL_SCALING.buff(skillHealScaling, Source.NONE)
        x.HEAL_FLAT.buff(skillHealFlat, Source.NONE)
      }
      if (r.healAbility == ULT_TYPE) {
        x.HEAL_TYPE.set(ULT_TYPE, Source.NONE)
        x.HEAL_SCALING.buff(ultHealScaling, Source.NONE)
        x.HEAL_FLAT.buff(ultHealFlat, Source.NONE)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, Source.NONE)
        x.HEAL_SCALING.buff(talentHealScaling, Source.NONE)
        x.HEAL_FLAT.buff(talentHealFlat, Source.NONE)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buff((e >= 6 && m.skillBuff) ? 0.30 : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.HP.buff((t.skillBuff) ? skillHpPercentBuff * t.teammateHPValue : 0, Source.NONE)
      x.HP.buff((e >= 6 && t.skillBuff) ? 0.06 * t.teammateHPValue : 0, Source.NONE)
      x.HP.buff((t.skillBuff) ? skillHpFlatBuff : 0, Source.NONE)

      const atkBuffValue = (e >= 4 && t.skillBuff) ? 0.03 * t.teammateHPValue : 0
      x.ATK.buff(atkBuffValue, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpFinalizer(x)
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardHpFinalizer() + gpuStandardHpHealFinalizer()
    },
    dynamicConditionals: [{
      id: 'LynxConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.HP],
      ratioConversion: true,
      condition: function () {
        return true
      },
      effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        if (!r.skillBuff) {
          return
        }

        const stateValue = action.conditionalState[this.id] || 0
        let buffHP = 0
        let buffATK = 0
        let stateBuffHP = 0
        let stateBuffATK = 0

        const convertibleHpValue = x.a[Key.HP] - x.a[Key.RATIO_BASED_HP_BUFF]
        buffHP += skillHpPercentBuff * convertibleHpValue + skillHpFlatBuff
        stateBuffHP += skillHpPercentBuff * stateValue + skillHpFlatBuff

        if (e >= 4) {
          buffATK += 0.03 * convertibleHpValue
          stateBuffATK += 0.03 * stateValue
        }

        if (e >= 6) {
          buffHP += 0.06 * convertibleHpValue
          stateBuffHP += 0.06 * stateValue
        }

        action.conditionalState[this.id] = x.a[Key.HP]

        const finalBuffHp = buffHP - (stateValue ? stateBuffHP : 0)
        const finalBuffAtk = buffATK - (stateValue ? stateBuffATK : 0)
        x.RATIO_BASED_HP_BUFF.buff(finalBuffHp, Source.NONE)

        x.HP.buffDynamic(finalBuffHp, Source.NONE, action, context)
        x.ATK.buffDynamic(finalBuffAtk, Source.NONE, action, context)
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return conditionalWgslWrapper(this, `
if (${wgslFalse(r.skillBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).LynxConversionConditional;
let convertibleHpValue: f32 = (*p_x).HP - (*p_x).RATIO_BASED_HP_BUFF;

var buffATK: f32 = 0;
var stateBuffATK: f32 = 0;

var buffHP: f32 = ${skillHpPercentBuff} * convertibleHpValue + ${skillHpFlatBuff};
var stateBuffHP: f32 = ${skillHpPercentBuff} * stateValue + ${skillHpFlatBuff};

if (${wgslTrue(e >= 4)}) {
  buffATK += 0.03 * convertibleHpValue;
  stateBuffATK += 0.03 * stateValue;
}

if (${wgslTrue(e >= 6)}) {
  buffHP += 0.06 * convertibleHpValue;
  stateBuffHP += 0.06 * stateValue;
}

(*p_state).LynxConversionConditional = (*p_x).HP;

let finalBuffHp = buffHP - select(0, stateBuffHP, stateValue > 0);
let finalBuffAtk = buffATK - select(0, stateBuffATK, stateValue > 0);
(*p_x).RATIO_BASED_HP_BUFF += finalBuffHp;

buffNonRatioDynamicHP(finalBuffHp, p_x, p_state);
buffDynamicATK(finalBuffAtk, p_x, p_state);
    `)
      },
    }],
  }
}
