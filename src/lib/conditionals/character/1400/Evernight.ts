import {
  AbilityType,
  BUFF_PRIORITY_MEMO,
  BUFF_PRIORITY_SELF,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamPath,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/conditionalUtils'
import {
  ConditionalActivation,
  ConditionalType,
  PathNames,
  Stats,
} from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { EVERNIGHT } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Evernight')
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
  } = Source.character('1413')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillCdScaling = skill(e, 0.24, 0.264)

  const ultMemoScaling = ult(e, 2.00, 2.20)
  const ultVulnScaling = ult(e, 0.30, 0.33)
  const ultDmgBoostScaling = ult(e, 0.60, 0.66)

  const talentCdScaling = talent(e, 0.60, 0.66)

  const memoSkillScaling = memoSkill(e, 0.50, 0.55)
  const memoSkillAdditionalScaling = memoSkill(e, 0.10, 0.11)
  const memoSkillEnhancedScaling = memoSkill(e, 0.12, 0.132)

  const memoTalentDmgBoost = memoTalent(e, 0.50, 0.55)

  const defaults = {
    buffPriority: BUFF_PRIORITY_MEMO,
    memoTalentDmgBuff: true,
    traceCritBuffs: true,
    skillMemoCdBuff: true,
    talentMemoCdBuff: true,
    memoriaStacks: 16,
    enhancedState: true,
    cyreneSpecialEffect: true,
    e1FinalDmg: true,
    e2CdBuff: true,
    e4Buffs: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    enhancedState: true,
    cyreneSpecialEffect: true,
    skillMemoCdBuff: true,
    evernightCombatCD: 2.50,
    e1FinalDmg: true,
    e4Buffs: true,
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
    memoTalentDmgBuff: {
      id: 'memoTalentDmgBuff',
      formItem: 'switch',
      text: t('Content.memoTalentDmgBuff.text'),
      content: t('Content.memoTalentDmgBuff.content', {
        MemoTalentDmgBuff: TsUtils.precisionRound(100 * memoTalentDmgBoost),
      }),
    },
    traceCritBuffs: {
      id: 'traceCritBuffs',
      formItem: 'switch',
      text: t('Content.traceCritBuffs.text'),
      content: t('Content.traceCritBuffs.content'),
    },
    skillMemoCdBuff: {
      id: 'skillMemoCdBuff',
      formItem: 'switch',
      text: t('Content.skillMemoCdBuff.text'),
      content: t('Content.skillMemoCdBuff.content', {
        SkillMemoCdBuff: TsUtils.precisionRound(100 * skillCdScaling),
      }),
    },
    talentMemoCdBuff: {
      id: 'talentMemoCdBuff',
      formItem: 'switch',
      text: t('Content.talentMemoCdBuff.text'),
      content: t('Content.talentMemoCdBuff.content', {
        TalentCdScaling: TsUtils.precisionRound(100 * talentCdScaling),
      }),
    },
    memoriaStacks: {
      id: 'memoriaStacks',
      formItem: 'slider',
      text: t('Content.memoriaStacks.text'),
      content: t('Content.memoriaStacks.content', {
        MemoSkillScaling: TsUtils.precisionRound(100 * memoSkillScaling),
        MemoSkillAdditionalScaling: TsUtils.precisionRound(100 * memoSkillAdditionalScaling),
        MemoSkillEnhancedScaling: TsUtils.precisionRound(100 * memoSkillEnhancedScaling),
      }),
      min: 0,
      max: 40,
    },
    enhancedState: {
      id: 'enhancedState',
      formItem: 'switch',
      text: t('Content.enhancedState.text'),
      content: t('Content.enhancedState.content', {
        UltVulnScaling: TsUtils.precisionRound(100 * ultVulnScaling),
        UltDmgBoostScaling: TsUtils.precisionRound(100 * ultDmgBoostScaling),
      }),
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('Content.cyreneSpecialEffect.text'),
      content: t('Content.cyreneSpecialEffect.content'),
    },
    e1FinalDmg: {
      id: 'e1FinalDmg',
      formItem: 'switch',
      text: t('Content.e1FinalDmg.text'),
      content: t('Content.e1FinalDmg.content'),
      disabled: e < 1,
    },
    e2CdBuff: {
      id: 'e2CdBuff',
      formItem: 'switch',
      text: t('Content.e2CdBuff.text'),
      content: t('Content.e2CdBuff.content'),
      disabled: e < 2,
    },
    e4Buffs: {
      id: 'e4Buffs',
      formItem: 'switch',
      text: t('Content.e4Buffs.text'),
      content: t('Content.e4Buffs.content'),
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: t('Content.e6ResPen.text'),
      content: t('Content.e6ResPen.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enhancedState: content.enhancedState,
    cyreneSpecialEffect: content.cyreneSpecialEffect,
    skillMemoCdBuff: {
      id: 'skillMemoCdBuff',
      formItem: 'switch',
      text: t('TeammateContent.skillMemoCdBuff.text'),
      content: t('TeammateContent.skillMemoCdBuff.content', { SkillCdScaling: TsUtils.precisionRound(100 * skillCdScaling) }),
    },
    evernightCombatCD: {
      id: 'evernightCombatCD',
      formItem: 'slider',
      text: t('TeammateContent.evernightCombatCD.text'),
      content: t('TeammateContent.evernightCombatCD.content', { SkillCdScaling: TsUtils.precisionRound(100 * skillCdScaling) }),
      min: 0,
      max: 5.00,
      percent: true,
    },
    e1FinalDmg: content.e1FinalDmg,
    e4Buffs: content.e4Buffs,
    e6ResPen: content.e6ResPen,
  }

  const e1FinalDmgMap: Record<number, number> = {
    5: 0.20,
    4: 0.20,
    3: 0.25,
    2: 0.30,
    1: 0.50,
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

      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.m.ULT_HP_SCALING.buff(ultMemoScaling, SOURCE_MEMO)

      x.CR.buffBaseDual((r.traceCritBuffs) ? 0.35 : 0, SOURCE_TRACE)
      x.CD.buffBaseDual((r.traceCritBuffs) ? 0.15 : 0, SOURCE_TRACE)
      x.CD.buffBaseDual((r.talentMemoCdBuff) ? talentCdScaling : 0, SOURCE_TALENT)
      x.ELEMENTAL_DMG.buffBaseDual((r.enhancedState) ? ultDmgBoostScaling : 0, SOURCE_ULT)
      x.ELEMENTAL_DMG.buffBaseDual((r.memoTalentDmgBuff) ? memoTalentDmgBoost : 0, SOURCE_MEMO)

      x.MEMO_BASE_SPD_FLAT.buff(160, SOURCE_MEMO)
      x.MEMO_BASE_HP_SCALING.buff(0.50, SOURCE_MEMO)
      x.MEMO_BASE_ATK_SCALING.buff(1, SOURCE_MEMO)
      x.MEMO_BASE_DEF_SCALING.buff(1, SOURCE_MEMO)

      x.CD.buffBaseDual((e >= 2 && r.e2CdBuff) ? 0.40 : 0, SOURCE_E2)
      x.m.BREAK_EFFICIENCY_BOOST.buff((e >= 4 && r.e4Buffs) ? 0.25 : 0, SOURCE_E4)

      if (r.memoriaStacks >= 16) {
        x.m.MEMO_SKILL_HP_SCALING.buff(memoSkillEnhancedScaling * r.memoriaStacks, SOURCE_MEMO)
        x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(10, SOURCE_MEMO)
      } else {
        x.m.MEMO_SKILL_HP_SCALING.buff(memoSkillScaling + Math.floor(TsUtils.precisionRound(r.memoriaStacks / 4)) * memoSkillAdditionalScaling, SOURCE_MEMO)
        x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(30, SOURCE_MEMO)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(90, SOURCE_ULT)

      // Cyrene
      const cyreneMemoSkillDmgBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.198 : 0.18)
        : 0
      x.MEMO_SKILL_DMG_BOOST.buff((r.cyreneSpecialEffect) ? cyreneMemoSkillDmgBuff : 0, Source.odeTo(EVERNIGHT))
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((m.enhancedState) ? ultVulnScaling : 0, SOURCE_ULT)
      x.m.FINAL_DMG_BOOST.buffTeam((e >= 1 && m.e1FinalDmg) ? e1FinalDmgMap[context.enemyCount] : 0, SOURCE_E1)
      x.m.BREAK_EFFICIENCY_BOOST.buffTeam((e >= 4 && m.e4Buffs) ? 0.25 : 0, SOURCE_E4)

      const memosprites = countTeamPath(context, PathNames.Remembrance)
      if (memosprites == 1) x.m.CD.buffTeam(0.05, SOURCE_TRACE)
      if (memosprites == 2) x.m.CD.buffTeam(0.15, SOURCE_TRACE)
      if (memosprites == 3) x.m.CD.buffTeam(0.50, SOURCE_TRACE)
      if (memosprites == 4) x.m.CD.buffTeam(0.65, SOURCE_TRACE)

      x.RES_PEN.buffTeam((e >= 6 && m.e6ResPen) ? 0.20 : 0, SOURCE_E6)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.m.CD.buff(t.skillMemoCdBuff ? skillCdScaling * t.evernightCombatCD : 0, SOURCE_SKILL)
      x.m.UNCONVERTIBLE_CD_BUFF.buff(t.skillMemoCdBuff ? skillCdScaling * t.evernightCombatCD : 0, SOURCE_SKILL)

      if (t.cyreneSpecialEffect && cyreneActionExists(originalCharacterAction!)) {
        const cyreneAdditionalCdScaling = cyreneSpecialEffectEidolonUpgraded(originalCharacterAction!) ? 0.132 : 0.12
        x.m.CD.buff(t.skillMemoCdBuff ? cyreneAdditionalCdScaling * t.evernightCombatCD : 0, Source.odeTo(EVERNIGHT))
        x.m.UNCONVERTIBLE_CD_BUFF.buff(t.skillMemoCdBuff ? cyreneAdditionalCdScaling * t.evernightCombatCD : 0, Source.odeTo(EVERNIGHT))
      }
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    dynamicConditionals: [
      {
        id: 'EvernightCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.skillMemoCdBuff) {
            return
          }
          if (!x.a[Key.MEMOSPRITE]) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x.a[Key.CD] - x.a[Key.UNCONVERTIBLE_CD_BUFF]

          let ownCdBuffScaling = skillCdScaling
          let odeCdBuffScaling = 0
          if (cyreneActionExists(action)) {
            odeCdBuffScaling += cyreneSpecialEffectEidolonUpgraded(action) ? 0.132 : 0.12
          }

          const ownBuffCD = ownCdBuffScaling * convertibleCdValue
          const ownStateBuffCD = ownCdBuffScaling * stateValue

          const odeBuffCD = odeCdBuffScaling * convertibleCdValue
          const odeStateBuffCD = odeCdBuffScaling * stateValue

          action.conditionalState[this.id] = convertibleCdValue

          const ownFinalBuffCd = Math.max(0, ownBuffCD - (stateValue ? ownStateBuffCD : 0))
          const odeFinalBuffCd = Math.max(0, odeBuffCD - (stateValue ? odeStateBuffCD : 0))
          x.m.UNCONVERTIBLE_CD_BUFF.buff(ownFinalBuffCd, SOURCE_SKILL)
          x.m.UNCONVERTIBLE_CD_BUFF.buff(odeFinalBuffCd, Source.odeTo(EVERNIGHT))

          x.m.CD.buffDynamic(ownFinalBuffCd, SOURCE_SKILL, action, context)
          x.m.CD.buffDynamic(odeFinalBuffCd, Source.odeTo(EVERNIGHT), action, context)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          let cdBuffScaling = skillCdScaling
          if (cyreneActionExists(action)) {
            cdBuffScaling += cyreneSpecialEffectEidolonUpgraded(action) ? 0.132 : 0.12
          }

          return conditionalWgslWrapper(
            this,
            `
if (${wgslFalse(r.skillMemoCdBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).EvernightCdConditional;
let convertibleCdValue: f32 = (*p_x).CD - (*p_x).UNCONVERTIBLE_CD_BUFF;

var buffCD: f32 = ${cdBuffScaling} * convertibleCdValue;
var stateBuffCD: f32 = ${cdBuffScaling} * stateValue;

(*p_state).EvernightCdConditional = (*p_x).CD;

let finalBuffCd = max(0.0, buffCD - select(0.0, stateBuffCD, stateValue > 0.0));
(*p_m).UNCONVERTIBLE_CD_BUFF += finalBuffCd;

(*p_m).CD += finalBuffCd;
`,
          )
        },
      },
    ],
  }
}
