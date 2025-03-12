import { AbilityType, BUFF_PRIORITY_MEMO, BUFF_PRIORITY_SELF } from 'lib/conditionals/conditionalConstants'
import { basicAdditionalDmgAtkFinalizer, gpuBasicAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aglaea')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.SKILL_BASIC_MEMO_TALENT_3_ULT_TALENT_MEMO_SKILL_5
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
  } = Source.character('1402')

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
    activeAbilities: [AbilityType.BASIC, AbilityType.MEMO_SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
      x.MEMOSPRITE.set(1, SOURCE_TALENT)
      x.MEMO_BUFF_PRIORITY.set(r.buffPriority == BUFF_PRIORITY_SELF ? BUFF_PRIORITY_SELF : BUFF_PRIORITY_MEMO, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff((r.supremeStanceState) ? enhancedBasicScaling : basicScaling, SOURCE_BASIC)
      x.m.BASIC_ATK_SCALING.buff(enhancedBasicScaling, SOURCE_MEMO)

      x.SPD_P.buff((r.supremeStanceState) ? ultSpdBoost * r.memoSpdStacks : 0, SOURCE_ULT)

      x.MEMO_BASE_HP_SCALING.buff(memoHpScaling, SOURCE_MEMO)
      x.MEMO_BASE_HP_FLAT.buff(memoHpFlat, SOURCE_MEMO)
      x.MEMO_BASE_SPD_SCALING.buff(0.35, SOURCE_MEMO)
      x.MEMO_BASE_DEF_SCALING.buff(1, SOURCE_MEMO)
      x.MEMO_BASE_ATK_SCALING.buff(1, SOURCE_MEMO)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.seamStitch) ? talentAdditionalDmg : 0, SOURCE_TALENT)

      x.m.MEMO_SKILL_ATK_SCALING.buff(memoSkillScaling, SOURCE_MEMO)

      x.m.SPD.buff(r.memoSpdStacks * memoTalentSpd, SOURCE_MEMO)

      x.DEF_PEN.buff((e >= 2) ? 0.14 * r.e2DefShredStacks : 0, SOURCE_E2)
      x.m.DEF_PEN.buff((e >= 2) ? 0.14 * r.e2DefShredStacks : 0, SOURCE_E2)

      x.LIGHTNING_RES_PEN.buff((e >= 6 && r.e6Buffs && r.supremeStanceState) ? 0.20 : 0, SOURCE_E6)
      x.m.LIGHTNING_RES_PEN.buff((e >= 6 && r.e6Buffs && r.supremeStanceState) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff((r.supremeStanceState) ? 20 : 10, SOURCE_BASIC)
      x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(10, SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((e >= 1 && m.seamStitch && m.e1Vulnerability) ? 0.15 : 0, SOURCE_E1)
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

        x.BASIC_DMG_BOOST.buff(jointBoost, SOURCE_E6)
        x.m.BASIC_DMG_BOOST.buff(jointBoost, SOURCE_E6)
      }

      basicAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(e >= 6 && r.supremeStanceState && r.e6Buffs)}) {
  if (x.SPD > 320 || m.SPD > 320) {
    x.BASIC_DMG_BOOST += 0.60;
    m.BASIC_DMG_BOOST += 0.60;
  } else if (x.SPD > 240 || m.SPD > 240) {
    x.BASIC_DMG_BOOST += 0.30;
    m.BASIC_DMG_BOOST += 0.30;
  } else if (x.SPD > 160 || m.SPD > 160) {
    x.BASIC_DMG_BOOST += 0.10;
    m.BASIC_DMG_BOOST += 0.10;
  }
}

${gpuBasicAdditionalDmgAtkFinalizer()}
`
    },
    dynamicConditionals: [
      {
        id: 'AglaeaConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.ATK],
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
          x.ATK.buffDynamic(buffValue - stateValue, SOURCE_TRACE, action, context)
          x.m.ATK.buffDynamic(buffValue - stateValue, SOURCE_TRACE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.supremeStanceState)}) {
  return;
}
let spd = x.SPD;
let memoSpd = (*p_m).SPD;
let stateValue: f32 = (*p_state).AglaeaConversionConditional;
let buffValue: f32 = 7.20 * spd + 3.60 * memoSpd;

(*p_state).AglaeaConversionConditional = buffValue;
(*p_x).ATK += buffValue - stateValue;
(*p_m).ATK += buffValue - stateValue;
    `)
        },
      },
    ],
  }
}
