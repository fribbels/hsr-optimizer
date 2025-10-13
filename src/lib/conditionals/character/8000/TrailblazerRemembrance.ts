import {
  AbilityType,
  BUFF_PRIORITY_MEMO,
  BUFF_PRIORITY_SELF,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import {
  ConditionalActivation,
  ConditionalType, CURRENT_DATA_VERSION,
  Stats,
} from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
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
import i18next from "i18next";

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerRemembrance')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.SKILL_TALENT_MEMO_TALENT_3_ULT_BASIC_MEMO_SKILL_5
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
  } = Source.character('8008')

  const basicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicScaling = basic(e, 1.20, 1.32)

  const ultScaling = ult(e, 2.40, 2.64)

  const memoHpScaling = talent(e, 0.80, 0.86)
  const memoHpFlat = talent(e, 640, 688)

  const memoSkillHitScaling = memoSkill(e, 0.36, 0.396)
  const memoSkillFinalScaling = memoSkill(e, 0.90, 0.99)

  const memoTalentCdBuffScaling = memoTalent(e, 0.12, 0.132)
  const memoTalentCdBuffFlat = memoTalent(e, 0.24, 0.264)

  const trueDmgScaling = memoSkill(e, 0.28, 0.30)
  // When the Max Energy of the ally target that has "Mem's Support" exceeds 100, for every 10 excess Energy,
  // additionally increases the multiplier of the True DMG dealt via "Mem's Support" by 2%, up to a max increase of 20%.

  const defaults = {
    buffPriority: BUFF_PRIORITY_SELF,
    enhancedBasic: false,
    memoSkillHits: 4,
    teamCdBuff: true,
    memsSupport: false,
    energyTrueDmgValue: false,
    e1CrBuff: false,
    e4TrueDmgBoost: false,
    e6UltCrBoost: true,
  }

  const teammateDefaults = {
    teamCdBuff: true,
    memCDValue: 2.50,
    memsSupport: true,
    energyTrueDmgValue: true,
    e1CrBuff: true,
    e4TrueDmgBoost: false,
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
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: 'Enhanced Basic',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    memoSkillHits: {
      id: 'memoSkillHits',
      formItem: 'slider',
      text: t('Content.memoSkillHits.text'),
      content: t('Content.memoSkillHits.content', {
        SingleScaling: TsUtils.precisionRound(memoSkillHitScaling * 100),
        AoeScaling: TsUtils.precisionRound(memoSkillFinalScaling * 100),
      }),
      min: 0,
      max: 4,
    },
    teamCdBuff: {
      id: 'teamCdBuff',
      formItem: 'switch',
      text: t('Content.teamCdBuff.text'),
      content: t('Content.teamCdBuff.content', {
        ScalingBuff: TsUtils.precisionRound(memoTalentCdBuffScaling * 100),
        FlatBuff: TsUtils.precisionRound(memoTalentCdBuffFlat * 100),
      }),
    },
    memsSupport: {
      id: 'memsSupport',
      formItem: 'switch',
      text: t('Content.memsSupport.text'),
      content: t('Content.memsSupport.content', { TrueDmgScaling: TsUtils.precisionRound(trueDmgScaling * 100) }),
    },
    energyTrueDmgValue: {
      id: 'energyTrueDmgValue',
      formItem: 'switch',
      text: t('Content.energyTrueDmgValue.text'),
      content: t('Content.energyTrueDmgValue.content'),
    },
    e1CrBuff: {
      id: 'e1CrBuff',
      formItem: 'switch',
      text: t('Content.e1CrBuff.text'),
      content: t('Content.e1CrBuff.content'),
      disabled: e < 1,
    },
    e4TrueDmgBoost: {
      id: 'e4TrueDmgBoost',
      formItem: 'switch',
      text: t('Content.e4TrueDmgBoost.text'),
      content: t('Content.e4TrueDmgBoost.content'),
      disabled: e < 4,
    },
    e6UltCrBoost: {
      id: 'e6UltCrBoost',
      formItem: 'switch',
      text: t('Content.e6UltCrBoost.text'),
      content: t('Content.e6UltCrBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamCdBuff: content.teamCdBuff,
    memCDValue: {
      id: 'memCDValue',
      formItem: 'slider',
      text: t('TeammateContent.memCDValue.text'),
      content: t('TeammateContent.memCDValue.content', {
        ScalingBuff: TsUtils.precisionRound(memoTalentCdBuffScaling * 100),
        FlatBuff: TsUtils.precisionRound(memoTalentCdBuffFlat * 100),
      }),
      min: 0,
      max: 4.00,
      percent: true,
    },
    memsSupport: content.memsSupport,
    energyTrueDmgValue: content.energyTrueDmgValue,
    e1CrBuff: content.e1CrBuff,
    e4TrueDmgBoost: content.e4TrueDmgBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.MEMO_SKILL],
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

      if (r.enhancedBasic) {
        x.BASIC_ATK_SCALING.buff(enhancedBasicScaling, SOURCE_BASIC)
        x.m.BASIC_ATK_SCALING.buff(enhancedBasicScaling, SOURCE_MEMO)
      } else {
        x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      }

      x.MEMO_BASE_HP_SCALING.buff(memoHpScaling, SOURCE_MEMO)
      x.MEMO_BASE_HP_FLAT.buff(memoHpFlat, SOURCE_MEMO)
      x.MEMO_BASE_SPD_SCALING.buff(0, SOURCE_MEMO)
      x.MEMO_BASE_SPD_FLAT.buff(130, SOURCE_MEMO)
      x.MEMO_BASE_DEF_SCALING.buff(1, SOURCE_MEMO)
      x.MEMO_BASE_ATK_SCALING.buff(1, SOURCE_MEMO)

      x.m.MEMO_SKILL_ATK_SCALING.buff(r.memoSkillHits * memoSkillHitScaling + memoSkillFinalScaling, SOURCE_MEMO)
      x.m.ULT_ATK_SCALING.buff(ultScaling, SOURCE_MEMO)

      x.m.ULT_CR_BOOST.buff((e >= 6 && r.e6UltCrBoost) ? 1.00 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(15, SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      if (m.memsSupport) {
        const energyTrueDmg = Math.min(0.20, m.energyTrueDmgValue ? Math.max((context.baseEnergy - 100) / 10, 0) * 2 * 0.01 : 0)
        const trueDmg = trueDmgScaling
          + energyTrueDmg
          + (e >= 4 && m.e4TrueDmgBoost ? 0.06 : 0)

        if (e >= 1) {
          x.CR.buffDual((m.e1CrBuff) ? 0.10 : 0, SOURCE_E1)
          x.TRUE_DMG_MODIFIER.buffDual(trueDmg, SOURCE_MEMO)
        } else {
          x.TRUE_DMG_MODIFIER.buffSingle(trueDmg, SOURCE_MEMO)
        }
      }
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const teamCDBuff = t.teamCdBuff ? memoTalentCdBuffScaling * t.memCDValue + memoTalentCdBuffFlat : 0
      x.CD.buffTeam(teamCDBuff, SOURCE_MEMO)
      x.UNCONVERTIBLE_CD_BUFF.buffTeam(teamCDBuff, SOURCE_MEMO)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    dynamicConditionals: [
      {
        id: 'TrailblazerRemembranceCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.teamCdBuff) {
            return
          }
          if (x.a[Key.MEMOSPRITE]) {
            return this.effect(x.m, action, context)
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x.a[Key.CD] - x.a[Key.UNCONVERTIBLE_CD_BUFF]

          const buffCD = memoTalentCdBuffScaling * convertibleCdValue + memoTalentCdBuffFlat
          const stateBuffCD = memoTalentCdBuffScaling * stateValue + memoTalentCdBuffFlat

          action.conditionalState[this.id] = convertibleCdValue

          const finalBuffCd = Math.max(0, buffCD - (stateValue ? stateBuffCD : 0))
          x.UNCONVERTIBLE_CD_BUFF.buff(finalBuffCd, SOURCE_MEMO)

          x.CD.buffDynamic(finalBuffCd, SOURCE_MEMO, action, context)
          x.summoner().CD.buffDynamic(finalBuffCd, SOURCE_MEMO, action, context)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(
            this,
            `
if (${wgslFalse(r.teamCdBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).TrailblazerRemembranceCdConditional;
let convertibleCdValue: f32 = (*p_m).CD - (*p_m).UNCONVERTIBLE_CD_BUFF;

var buffCD: f32 = ${memoTalentCdBuffScaling} * convertibleCdValue + ${memoTalentCdBuffFlat};
var stateBuffCD: f32 = ${memoTalentCdBuffScaling} * stateValue + ${memoTalentCdBuffFlat};

(*p_state).TrailblazerRemembranceCdConditional = (*p_m).CD;

let finalBuffCd = max(0.0, buffCD - select(0.0, stateBuffCD, stateValue > 0.0));
(*p_m).UNCONVERTIBLE_CD_BUFF += finalBuffCd;

(*p_m).CD += finalBuffCd;
(*p_x).CD += finalBuffCd;
`,
          )
        },
      },
    ],
  }
}
