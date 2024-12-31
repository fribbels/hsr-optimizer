import i18next from 'i18next'
import { standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, CURRENT_DATA_VERSION, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerRemembrance')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.SKILL_TALENT_MEMO_TALENT_3_ULT_BASIC_MEMO_SKILL_5

  const basicScaling = basic(e, 1.00, 1.10)

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
    memoSkillHits: {
      id: 'memoSkillHits',
      formItem: 'slider',
      text: 'Memo Skill hits',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 4,
    },
    teamCdBuff: {
      id: 'teamCdBuff',
      formItem: 'switch',
      text: 'Team CD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    memsSupport: {
      id: 'memsSupport',
      formItem: 'switch',
      text: `Mem's Support True DMG`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    energyTrueDmgValue: {
      id: 'energyTrueDmgValue',
      formItem: 'switch',
      text: 'Max energy True DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1CrBuff: {
      id: 'e1CrBuff',
      formItem: 'switch',
      text: 'E1 CR buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e4TrueDmgBoost: {
      id: 'e4TrueDmgBoost',
      formItem: 'switch',
      text: `E4 True DMG boost`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6UltCrBoost: {
      id: 'e6UltCrBoost',
      formItem: 'switch',
      text: `E6 Ult CR boost`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamCdBuff: content.teamCdBuff,
    memCDValue: {
      id: 'memCDValue',
      formItem: 'slider',
      text: `Mem's combat CD`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3.00,
      percent: true,
    },
    memsSupport: content.memsSupport,
    energyTrueDmgValue: content.energyTrueDmgValue,
    e1CrBuff: content.e1CrBuff,
    e4TrueDmgBoost: content.e4TrueDmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)

      x.MEMO_HP_SCALING.buff(memoHpScaling, Source.NONE)
      x.MEMO_HP_FLAT.buff(memoHpFlat, Source.NONE)
      x.MEMO_SPD_SCALING.buff(0, Source.NONE)
      x.MEMO_SPD_FLAT.buff(130, Source.NONE)
      x.MEMO_DEF_SCALING.buff(1, Source.NONE)
      x.MEMO_ATK_SCALING.buff(1, Source.NONE)

      x.m.MEMO_SKILL_SCALING.buff(r.memoSkillHits * memoSkillHitScaling + memoSkillFinalScaling, Source.NONE)
      x.m.ULT_SCALING.buff(ultScaling, Source.NONE)

      x.m.ULT_CR_BOOST.buff((e >= 6 && r.e6UltCrBoost) ? 1.00 : 0, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      if (m.memsSupport) {
        const energyTrueDmg = Math.min(0.20, (m.energyTrueDmgValue ? Math.max((context.baseEnergy - 100) / 10, 0) * 2 * 0.01 : 0))
        const trueDmg = trueDmgScaling
          + energyTrueDmg
          + (e >= 4 && m.e4TrueDmgBoost ? 0.06 : 0)

        if (e >= 1) {
          x.CR.buffDual((m.e1CrBuff) ? 0.10 : 0, Source.NONE)
          x.TRUE_DMG_MODIFIER.buffDual(trueDmg, Source.NONE)
        } else {
          x.TRUE_DMG_MODIFIER.buff(trueDmg, Source.NONE)
        }
      }
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buffTeam(t.teamCdBuff ? memoTalentCdBuffScaling * t.memCDValue + memoTalentCdBuffFlat : 0, Source.NONE)
      x.RATIO_BASED_CD_BUFF.buffTeam(t.teamCdBuff ? memoTalentCdBuffScaling * t.memCDValue + memoTalentCdBuffFlat : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkFinalizer(x)

      x.m.ULT_DMG.buff(x.m.a[Key.ULT_SCALING] * x.m.a[Key.ATK], Source.NONE)
      x.m.MEMO_SKILL_DMG.buff(x.m.a[Key.MEMO_SKILL_SCALING] * x.m.a[Key.ATK], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * x.ATK;
x.DOT_DMG += x.DOT_SCALING * x.ATK;

m.ULT_DMG += m.ULT_SCALING * m.ATK;
m.MEMO_SKILL_DMG += m.MEMO_SKILL_SCALING * m.ATK;
`
    },
    dynamicConditionals: [
      {
        id: 'TrailblazerRemembranceCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        ratioConversion: true,
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.teamCdBuff) {
            return
          }
          if (x.m) {
            return this.effect(x.m, action, context)
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x.a[Key.CD] - x.a[Key.RATIO_BASED_CD_BUFF]

          const buffCD = memoTalentCdBuffScaling * convertibleCdValue + memoTalentCdBuffFlat
          const stateBuffCD = memoTalentCdBuffScaling * stateValue + memoTalentCdBuffFlat

          action.conditionalState[this.id] = convertibleCdValue

          const finalBuffCd = Math.max(0, buffCD - (stateValue ? stateBuffCD : 0))
          x.RATIO_BASED_CD_BUFF.buff(finalBuffCd, Source.NONE)

          x.CD.buffDynamic(finalBuffCd, Source.NONE, action, context)
          x.summoner().CD.buffDynamic(finalBuffCd, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.teamCdBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).TrailblazerRemembranceCdConditional;
let convertibleCdValue: f32 = (*p_m).CD - (*p_m).RATIO_BASED_CD_BUFF;

var buffCD: f32 = ${memoTalentCdBuffScaling} * convertibleCdValue + ${memoTalentCdBuffFlat};
var stateBuffCD: f32 = ${memoTalentCdBuffScaling} * stateValue + ${memoTalentCdBuffFlat};

(*p_state).TrailblazerRemembranceCdConditional = (*p_m).CD;

let finalBuffCd = max(0, buffCD - select(0, stateBuffCD, stateValue > 0));
(*p_m).RATIO_BASED_CD_BUFF += finalBuffCd;

buffMemoNonRatioDynamicCD(finalBuffCd, p_x, p_m, p_state);
buffNonRatioDynamicCD(finalBuffCd, p_x, p_m, p_state);
    `)
        },
      },
    ],
  }
}
