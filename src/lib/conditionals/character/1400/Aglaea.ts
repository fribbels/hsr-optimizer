import { BUFF_PRIORITY_MEMO, BUFF_PRIORITY_SELF } from 'lib/conditionals/conditionalConstants'
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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aglaea')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.SKILL_BASIC_MEMO_TALENT_3_ULT_TALENT_MEMO_SKILL_5

  const basicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicScaling = basic(e, 2.00, 2.20)

  const ultSpdBoost = ult(e, 0.15, 0.16)

  const memoHpScaling = talent(e, 0.66, 0.704)
  const memoHpFlat = talent(e, 720, 828)
  const talentAdditionalDmg = talent(e, 0.30, 0.336)

  const memoSkillScaling = memoSkill(e, 1.10, 1.21)
  const memoTalentSpd = memoTalent(e, 55, 57.2)

  const memoSpdStacksMax = e >= 4 ? 7 : 6

  const defaults = {
    buffPriority: BUFF_PRIORITY_SELF,
    supremeStanceState: true,
    seamStitch: true,
    memoSpdStacks: memoSpdStacksMax,
    e1Vulnerability: true,
    e2DefShredStacks: 3,
    e6Buffs: true,
  }

  const teammateDefaults = {
    seamStitch: true,
    e1Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffPriority: {
      id: 'buffPriority',
      formItem: 'select',
      text: tBuff('Text'),
      content: tBuff('Content'),
      options: [
        { display: tBuff('Self'), value: BUFF_PRIORITY_SELF, label: tBuff('Self') },
        { display: tBuff('Memo'), value: BUFF_PRIORITY_MEMO, label: tBuff('Memo') },
      ],
      fullWidth: true,
    },
    supremeStanceState: {
      id: 'supremeStanceState',
      formItem: 'switch',
      text: t('Content.supremeStanceState.text'),
      content: t('Content.supremeStanceState.content', { SpdBuff: TsUtils.precisionRound(ultSpdBoost * 100) }),
    },
    seamStitch: {
      id: 'seamStitch',
      formItem: 'switch',
      text: t('Content.seamStitch.text'),
      content: t('Content.seamStitch.content', { Scaling: TsUtils.precisionRound(talentAdditionalDmg * 100) }),
    },
    memoSpdStacks: {
      id: 'memoSpdStacks',
      formItem: 'slider',
      text: t('Content.memoSpdStacks.text'),
      content: t('Content.memoSpdStacks.content', { SpdBuff: memoTalentSpd, StackLimit: memoSpdStacksMax }),
      min: 0,
      max: memoSpdStacksMax,
    },
    e1Vulnerability: {
      id: 'e1Vulnerability',
      formItem: 'switch',
      text: t('Content.e1Vulnerability.text'),
      content: t('Content.e1Vulnerability.content'),
      disabled: e < 1,
    },
    e2DefShredStacks: {
      id: 'e2DefShredStacks',
      formItem: 'slider',
      text: t('Content.e2DefShredStacks.text'),
      content: t('Content.e2DefShredStacks.content'),
      min: 1,
      max: 3,
      disabled: e < 2,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    seamStitch: content.seamStitch,
    e1Vulnerability: content.e1Vulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.MEMO_BUFF_PRIORITY.set(r.buffPriority == BUFF_PRIORITY_SELF ? BUFF_PRIORITY_SELF : BUFF_PRIORITY_MEMO, Source.NONE)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff((r.supremeStanceState) ? enhancedBasicScaling : basicScaling, Source.NONE)
      x.m.BASIC_SCALING.buff(enhancedBasicScaling, Source.NONE)

      x.SPD_P.buff((r.supremeStanceState) ? ultSpdBoost * r.memoSpdStacks : 0, Source.NONE)

      x.MEMO_HP_SCALING.buff(memoHpScaling, Source.NONE)
      x.MEMO_HP_FLAT.buff(memoHpFlat, Source.NONE)
      x.MEMO_SPD_SCALING.buff(0.35, Source.NONE)
      x.MEMO_DEF_SCALING.buff(1, Source.NONE)
      x.MEMO_ATK_SCALING.buff(1, Source.NONE)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.seamStitch) ? talentAdditionalDmg : 0, Source.NONE)

      x.m.MEMO_SKILL_SCALING.buff(memoSkillScaling, Source.NONE)

      x.m.SPD.buff(r.memoSpdStacks * memoTalentSpd, Source.NONE)

      x.DEF_PEN.buff((e >= 2) ? 0.14 * r.e2DefShredStacks : 0, Source.NONE)
      x.m.DEF_PEN.buff((e >= 2) ? 0.14 * r.e2DefShredStacks : 0, Source.NONE)

      x.LIGHTNING_RES_PEN.buff((e >= 6 && r.e6Buffs && r.supremeStanceState) ? 0.20 : 0, Source.NONE)
      x.m.LIGHTNING_RES_PEN.buff((e >= 6 && r.e6Buffs && r.supremeStanceState) ? 0.20 : 0, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((e >= 1 && m.seamStitch && m.e1Vulnerability) ? 0.15 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (e >= 6 && r.supremeStanceState && r.e6Buffs) {
        let jointBoost = 0
        if (x.a[Key.SPD] > 320 || x.m.a[Key.SPD] >= 320) {
          jointBoost = 0.60
        } else if (x.a[Key.SPD] > 240 || x.m.a[Key.SPD] >= 240) {
          jointBoost = 0.30
        } else if (x.a[Key.SPD] > 160 || x.m.a[Key.SPD] >= 160) {
          jointBoost = 0.10
        }

        x.BASIC_BOOST.buff(jointBoost, Source.NONE)
        x.m.BASIC_BOOST.buff(jointBoost, Source.NONE)
      }

      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
      x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.ATK], Source.NONE)
      x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.ATK], Source.NONE)
      x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * x.a[Key.ATK], Source.NONE)
      x.DOT_DMG.buff(x.a[Key.DOT_SCALING] * x.a[Key.ATK], Source.NONE)

      x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * x.a[Key.ATK], Source.NONE)

      x.m.BASIC_DMG.buff(x.m.a[Key.BASIC_SCALING] * x.m.a[Key.ATK], Source.NONE)
      x.m.MEMO_SKILL_DMG.buff(x.m.a[Key.MEMO_SKILL_SCALING] * x.m.a[Key.ATK], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(e >= 6 && r.supremeStanceState && r.e6Buffs)}) {
  if (x.SPD > 320 || m.SPD > 320) {
    x.BASIC_BOOST += 0.60;
    m.BASIC_BOOST += 0.60;
  } else if (x.SPD > 240 || m.SPD > 240) {
    x.BASIC_BOOST += 0.30;
    m.BASIC_BOOST += 0.30;
  } else if (x.SPD > 160 || m.SPD > 160) {
    x.BASIC_BOOST += 0.10;
    m.BASIC_BOOST += 0.10;
  }
}

x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * x.ATK;
x.DOT_DMG += x.DOT_SCALING * x.ATK;

x.BASIC_ADDITIONAL_DMG += x.BASIC_ADDITIONAL_DMG_SCALING * x.ATK;

m.BASIC_DMG += m.BASIC_SCALING * m.ATK;
m.MEMO_SKILL_DMG += m.MEMO_SKILL_SCALING * m.ATK;
`
    },
    dynamicConditionals: [
      {
        id: 'AglaeaConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.supremeStanceState) {
            return
          }
          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = 7.20 * x.a[Key.SPD] + 3.60 * x.m.a[Key.SPD]

          action.conditionalState[this.id] = buffValue
          x.ATK.buffDynamic(buffValue - stateValue, Source.NONE, action, context)
          x.m.ATK.buffDynamic(buffValue - stateValue, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.supremeStanceState)}) {
  return;
}
let spd = (*p_x).SPD;
let memoSpd = (*p_m).SPD;
let stateValue: f32 = (*p_state).AglaeaConversionConditional;
let buffValue: f32 = 7.20 * spd + 3.60 * memoSpd;

(*p_state).AglaeaConversionConditional = buffValue;
buffDynamicATK(buffValue - stateValue, p_x, p_m, p_state);
buffMemoDynamicATK(buffValue - stateValue, p_x, p_m, p_state);
    `)
        },
      },
    ],
  }
}
