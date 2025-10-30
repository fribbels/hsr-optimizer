import {
  AbilityType,
  BUFF_PRIORITY_MEMO,
  BUFF_PRIORITY_SELF,
  SKILL_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  gpuStandardHpHealFinalizer,
  standardHpHealFinalizer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  wgslFalse,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hyacine.Content')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.ULT_BASIC_MEMO_SKILL_3_SKILL_TALENT_MEMO_TALENT_5
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
  } = Source.character('1409')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillHealScaling = skill(e, 0.08, 0.088)
  const skillHealFlat = skill(e, 160, 178)

  const ultHealScaling = ult(e, 0.10, 0.11)
  const ultHealFlat = ult(e, 200, 222.5)

  const ultHpBuffPercent = ult(e, 0.30, 0.33)
  const ultHpBuffFlat = ult(e, 600, 667.5)

  const talentHealingDmgStackValue = talent(e, 0.80, 0.88)

  // TODO: Heal tally

  const defaults = {
    healAbility: SKILL_DMG_TYPE,
    buffPriority: BUFF_PRIORITY_MEMO,
    clearSkies: true,
    healTargetHp50: true,
    resBuff: true,
    spd200HpBuff: true,
    healingDmgStacks: 3,
    e1HpBuff: true,
    e2SpdBuff: true,
    e4CdBuff: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    clearSkies: true,
    e1HpBuff: true,
    e2SpdBuff: true,
    e6ResPen: true,
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
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
      ],
      fullWidth: true,
    },
    healTargetHp50: {
      id: 'healTargetHp50',
      formItem: 'switch',
      text: t('healTargetHp50.text'),
      content: t('healTargetHp50.content'),
    },
    resBuff: {
      id: 'resBuff',
      formItem: 'switch',
      text: t('resBuff.text'),
      content: t('resBuff.content'),
    },
    spd200HpBuff: {
      id: 'spd200HpBuff',
      formItem: 'switch',
      text: t('spd200HpBuff.text'),
      content: t('spd200HpBuff.content'),
    },
    clearSkies: {
      id: 'clearSkies',
      formItem: 'switch',
      text: t('clearSkies.text'),
      content: t('clearSkies.content', {
        UltHpBuffScaling: TsUtils.precisionRound(100 * ultHpBuffPercent),
        UltHpBuffFlat: TsUtils.precisionRound(ultHpBuffFlat),
      }),
    },
    healingDmgStacks: {
      id: 'healingDmgStacks',
      formItem: 'slider',
      text: t('healingDmgStacks.text'),
      content: t('healingDmgStacks.content', {
        TalentDmgBuff: TsUtils.precisionRound(100 * talentHealingDmgStackValue),
      }),
      min: 0,
      max: 3,
    },
    e1HpBuff: {
      id: 'e1HpBuff',
      formItem: 'switch',
      text: t('e1HpBuff.text'),
      content: t('e1HpBuff.content'),
      disabled: e < 1,
    },
    e2SpdBuff: {
      id: 'e2SpdBuff',
      formItem: 'switch',
      text: t('e2SpdBuff.text'),
      content: t('e2SpdBuff.content'),
      disabled: e < 2,
    },
    e4CdBuff: {
      id: 'e4CdBuff',
      formItem: 'switch',
      text: t('e4CdBuff.text'),
      content: t('e4CdBuff.content'),
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: t('e6ResPen.text'),
      content: t('e6ResPen.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    clearSkies: content.clearSkies,
    e1HpBuff: content.e1HpBuff,
    e2SpdBuff: content.e2SpdBuff,
    e6ResPen: content.e6ResPen,
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

      x.CR.buffBaseDual(1.00, SOURCE_TRACE)
      x.OHB.buffBaseDual((r.healTargetHp50) ? 0.25 : 0, SOURCE_TRACE)
      x.RES.buff((r.resBuff) ? 0.50 : 0, SOURCE_TRACE)

      x.MEMO_BASE_ATK_SCALING.buff(1, SOURCE_MEMO)
      x.MEMO_BASE_DEF_SCALING.buff(1, SOURCE_MEMO)
      x.MEMO_BASE_HP_SCALING.buff(0.50, SOURCE_MEMO)
      x.MEMO_BASE_HP_FLAT.buff(0, SOURCE_MEMO)
      x.MEMO_BASE_SPD_SCALING.buff(0, SOURCE_MEMO)
      x.MEMO_BASE_SPD_FLAT.buff(0, SOURCE_MEMO)

      x.m.ELEMENTAL_DMG.buff((r.healingDmgStacks) * talentHealingDmgStackValue, SOURCE_TALENT)

      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_MEMO)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == ULT_DMG_TYPE) {
        x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_ULT)
        x.HEAL_SCALING.buff(ultHealScaling, SOURCE_ULT)
        x.HEAL_FLAT.buff(ultHealFlat, SOURCE_ULT)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(10, SOURCE_MEMO)

      // Cyrene
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.HP.buffTeam((m.clearSkies) ? ultHpBuffFlat : 0, SOURCE_ULT)
      x.HP_P.buffTeam((m.clearSkies) ? ultHpBuffPercent : 0, SOURCE_ULT)
      x.HP_P.buffTeam((e >= 1 && m.e1HpBuff && m.clearSkies) ? 0.50 : 0, SOURCE_E1)

      x.SPD_P.buffTeam((e >= 2 && m.e2SpdBuff) ? 0.30 : 0, SOURCE_E2)
      x.RES_PEN.buffTeam((e >= 6 && m.e6ResPen) ? 0.20 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return gpuStandardHpHealFinalizer()
    },
    dynamicConditionals: [
      {
        id: 'HyacineSpdActivation',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.HP],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.spd200HpBuff && x.a[Key.SPD] >= 200
        },
        effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
          const r = action.characterConditionals as Conditionals<typeof content>

          x.HP.buffDynamic((r.spd200HpBuff && x.a[Key.SPD] >= 200) ? 0.20 * x.a[Key.BASE_HP] : 0, SOURCE_TRACE, action, context)
          x.m.HP.buffDynamic((r.spd200HpBuff && x.a[Key.SPD] >= 200) ? 0.20 * x.m.a[Key.BASE_HP] : 0, SOURCE_TRACE, action, context)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return conditionalWgslWrapper(
            this,
            `
if (
  (*p_state).HyacineSpdActivation == 0.0 &&
  x.SPD >= 200 &&
  ${wgslTrue(r.spd200HpBuff)}
) {
  (*p_state).HyacineSpdActivation = 1.0;
  (*p_x).HP += 0.20 * baseHP;
  (*p_m).HP += 0.20 * (*p_m).BASE_HP;
}
    `,
          )
        },
      },
      {
        id: 'HyacineSpdConversion',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.OHB],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.spd200HpBuff && x.a[Key.SPD] > 200
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.spd200HpBuff) {
            return
          }

          const statValue = x.a[Key.SPD]
          const unconvertibleValue = x.a[Key.UNCONVERTIBLE_SPD_BUFF] ?? 0

          const stateValue = action.conditionalState[this.id] ?? 0
          const convertibleValue = Math.min(400, statValue - unconvertibleValue)

          if (convertibleValue <= 0) return

          const buffFull = Math.max(0, 0.01 * Math.floor(convertibleValue - 200))
          const buffDelta = buffFull - stateValue

          action.conditionalState[this.id] = buffFull

          x.UNCONVERTIBLE_OHB_BUFF.buffBaseDual(buffDelta, SOURCE_TRACE)
          x.OHB.buffBaseDualDynamic(buffDelta, SOURCE_TRACE, action, context)

          if (e >= 4 && r.e4CdBuff) {
            x.UNCONVERTIBLE_CD_BUFF.buffBaseDual(buffDelta * 2, SOURCE_E4)
            x.CD.buffBaseDualDynamic(buffDelta * 2, SOURCE_E4, action, context)
          }
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(
            this,
            `
if (${wgslFalse(r.spd200HpBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).${this.id};
let convertibleValue: f32 = min(400, floor(x.SPD - x.UNCONVERTIBLE_SPD_BUFF));

if (convertibleValue <= 0) {
  return;
}

let buffFull = max(0, 0.01 * (convertibleValue - 200));
let buffDelta = buffFull - stateValue;

(*p_state).${this.id} = buffFull;

(*p_x).UNCONVERTIBLE_OHB_BUFF += buffDelta;
(*p_x).OHB += buffDelta;

if (${wgslTrue(e >= 4 && r.e4CdBuff)}) {
  (*p_x).UNCONVERTIBLE_CD_BUFF += buffDelta * 2;
  (*p_x).CD += buffDelta * 2;
}
    `,
          )
        },
      },
    ],
  }
}
