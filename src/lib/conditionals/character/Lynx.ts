import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lynx')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillHpPercentBuff = skill(e, 0.075, 0.08)
  const skillHpFlatBuff = skill(e, 200, 223)

  const basicScaling = basic(e, 0.50, 0.55)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'skillBuff',
    name: 'skillBuff',
    text: t('Content.skillBuff.text'),
    title: t('Content.skillBuff.title'),
    content: t('Content.skillBuff.content', { skillHpPercentBuff: TsUtils.precisionRound(100 * skillHpPercentBuff), skillHpFlatBuff: skillHpFlatBuff }),
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillBuff'),
    {
      formItem: 'slider',
      id: 'teammateHPValue',
      name: 'teammateHPValue',
      text: t('TeammateContent.teammateHPValue.text'),
      title: t('TeammateContent.teammateHPValue.title'),
      content: t('TeammateContent.teammateHPValue.content', { skillHpPercentBuff: TsUtils.precisionRound(100 * skillHpPercentBuff), skillHpFlatBuff: skillHpFlatBuff }),
      min: 0,
      max: 10000,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      skillBuff: true,
    }),
    teammateDefaults: () => ({
      skillBuff: true,
      teammateHPValue: 6000,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.RES] += (e >= 6 && m.skillBuff) ? 0.30 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.HP] += (t.skillBuff) ? skillHpPercentBuff * t.teammateHPValue : 0
      x[Stats.HP] += (e >= 6 && t.skillBuff) ? 0.06 * t.teammateHPValue : 0
      x[Stats.HP] += (t.skillBuff) ? skillHpFlatBuff : 0

      const atkBuffValue = (e >= 4 && t.skillBuff) ? 0.03 * t.teammateHPValue : 0
      x[Stats.ATK] += atkBuffValue
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      return `
x.BASIC_DMG += x.BASIC_SCALING * x.HP;
      `
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
      effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals
        if (!r.skillBuff) {
          return
        }

        const stateValue = action.conditionalState[this.id] || 0
        let buffHP = 0
        let buffATK = 0
        let stateBuffHP = 0
        let stateBuffATK = 0

        const convertibleHpValue = x[Stats.HP] - x.RATIO_BASED_HP_BUFF
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

        action.conditionalState[this.id] = x[Stats.HP]

        const finalBuffHp = buffHP - (stateValue ? stateBuffHP : 0)
        const finalBuffAtk = buffATK - (stateValue ? stateBuffATK : 0)
        x.RATIO_BASED_HP_BUFF += finalBuffHp

        buffStat(x, Stats.HP, finalBuffHp, action, context)
        buffStat(x, Stats.ATK, finalBuffAtk, action, context)
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals

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
