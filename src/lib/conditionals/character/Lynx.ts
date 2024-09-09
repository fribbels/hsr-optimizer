import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse, wgslTrue } from 'lib/gpu/injection/wgslUtils'

export default (e: Eidolon): CharacterConditional => {
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
    text: 'Skill max HP buff',
    title: 'Skill max HP buff',
    content: `
    Applies "Survival Response" to a single target ally and increases their Max HP by ${precisionRound(skillHpPercentBuff * 100)}% of Lynx's Max HP plus ${precisionRound(skillHpFlatBuff)}.
    ::BR::E4: When "Survival Response" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s).
    ::BR::E6: Additionally boosts the Max HP increasing effect of "Survival Response" by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%.`,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillBuff'),
    {
      formItem: 'slider',
      id: 'teammateHPValue',
      name: 'teammateHPValue',
      text: `Lynx's HP`,
      title: 'Dusk of Warm Campfire',
      content: `
      Applies "Survival Response" to a single target ally and increases their Max HP by ${precisionRound(skillHpPercentBuff * 100)}% of Lynx's Max HP plus ${precisionRound(skillHpFlatBuff)}.
      ::BR::E4: When "Survival Response" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s).
      ::BR::E6: Additionally boosts the Max HP increasing effect of "Survival Response" by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%.`,
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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.RES] += (e >= 6 && m.skillBuff) ? 0.30 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.HP] += (t.skillBuff) ? skillHpPercentBuff * t.teammateHPValue : 0
      x[Stats.HP] += (e >= 6 && t.skillBuff) ? 0.06 * t.teammateHPValue : 0
      x[Stats.HP] += (t.skillBuff) ? skillHpFlatBuff : 0

      const atkBuffValue = (e >= 4 && t.skillBuff) ? 0.03 * t.teammateHPValue : 0
      x[Stats.ATK] += atkBuffValue
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
    },
    gpuFinalizeCalculations: (request: Form, _params: OptimizerParams) => {
      const r = request.characterConditionals

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
      effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
        const r = request.characterConditionals
        if (!r.skillBuff) {
          return
        }

        const stateValue = params.conditionalState[this.id] || 0
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

        params.conditionalState[this.id] = x[Stats.HP]

        const finalBuffHp = buffHP - (stateValue ? stateBuffHP : 0)
        const finalBuffAtk = buffATK - (stateValue ? stateBuffATK : 0)
        x.RATIO_BASED_HP_BUFF += finalBuffHp

        buffStat(x, request, params, Stats.HP, finalBuffHp)
        buffStat(x, request, params, Stats.ATK, finalBuffAtk)
      },
      gpu: function (request: Form, _params: OptimizerParams) {
        const r = request.characterConditionals

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
