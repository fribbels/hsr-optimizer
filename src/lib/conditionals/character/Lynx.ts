import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'
import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { buffStat, conditionalWgslWrapper } from "lib/gpu/conditionals/newConditionals";
import { ConditionalActivation, ConditionalType } from "lib/gpu/conditionals/setConditionals";

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
    precomputeEffects: (_request: Form) => {
      const x = Object.assign({}, baseComputedStatsObject)

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
    calculateStatConditionals: (c: PrecomputedCharacterConditional, request: Form, params: OptimizerParams) => {
      const r = request.characterConditionals
      const x = c.x

      // evaluateConditional(LynxConversionConditional, x, request, params)
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      // x[Stats.HP] += (r.skillBuff) ? skillHpPercentBuff * x[Stats.HP] : 0
      // x[Stats.HP] += (r.skillBuff) ? skillHpFlatBuff : 0
      // x[Stats.HP] += (e >= 6 && r.skillBuff) ? 0.06 * x[Stats.HP] : 0
      // x[Stats.ATK] += (e >= 4 && r.skillBuff) ? 0.03 * x[Stats.HP] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
    },
    gpu: (request: Form, _params: OptimizerParams) => {
      const r = request.characterConditionals

      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
      `
    },
    gpuConditionals: [{
      id: 'LynxConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.HP],
      condition: function () {
        return true
      },
      effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
        const r = request.characterConditionals
        if (!r.skillBuff) {
          return;
        }

        const stateValue = params.conditionalState[this.id] || 0
        let buffHP = 0
        let buffATK = 0
        let stateBuffHP = 0
        let stateBuffATK = 0

        buffHP += skillHpPercentBuff * x[Stats.HP] + skillHpFlatBuff
        stateBuffHP += skillHpPercentBuff * stateValue + skillHpFlatBuff
        if (e >= 6) {
          buffHP += 0.06 * x[Stats.HP]
          stateBuffHP += 0.06 * stateValue
        }

        if (e >= 4) {
          buffATK += 0.03 * x[Stats.HP]
          stateBuffATK += 0.03 * stateValue
        }

        params.conditionalState[this.id] = x[Stats.HP]
        buffStat(x, request, params, Stats.HP, buffHP - stateBuffHP)
        buffStat(x, request, params, Stats.ATK, buffATK - stateBuffATK)
      },
      gpu: function (request: Form, params: OptimizerParams) {
        return conditionalWgslWrapper(this, `
// let def = (*p_x).DEF;
// let stateValue: f32 = (*p_state).LynxConversionConditional;
// let buffValue: f32 = 0.35 * def;
//
// (*p_state).LynxConversionConditional = buffValue;
// buffDynamicATK(buffValue - stateValue, p_x, p_state);
    `)
      }
    }]
  }
}
