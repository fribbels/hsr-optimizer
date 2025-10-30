import i18next from 'i18next'
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
  teamCharacterIds,
  teammateCharacterIds,
} from 'lib/conditionals/conditionalUtils'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  PathNames,
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
import {
  AGLAEA,
  ANAXA,
  CAELUS_REMEMBRANCE,
  CASTORICE,
  CERYDRA,
  CIPHER,
  CYRENE,
  EVERNIGHT,
  HYACINE,
  HYSILENS,
  MYDEI,
  PERMANSOR_TERRAE,
  PHAINON,
  STELLE_REMEMBRANCE,
  TRIBBIE,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Cyrene')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')

  // TODO: Confirm memo scaling
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.ULT_TALENT_MEMO_SKILL_3_SKILL_BASIC_MEMO_TALENT_5
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
  } = Source.character('1415')

  const basicScaling = basic(e, 0.50, 0.55)
  const basicEnhancedScaling = basic(e, 0.30, 0.33)

  const skillTrueDmgBuff = skill(e, 0.24, 0.264)
  const ultCrBuff = ult(e, 0.50, 0.55)
  const talentDmgBuff = talent(e, 0.20, 0.22)

  const memoSkillDmgScaling = memoSkill(e, 0.60, 0.66)
  const memoSkillDmgBuff = memoSkill(e, 0.40, 0.44)
  const memoTalentHpBuff = memoTalent(e, 0.24, 0.264)

  const memoSkillTrailblazerAtkScaling = memoSkill(e, 0.16, 0.176)
  const memoSkillTrailblazerCrScaling = memoSkill(e, 0.72, 0.792)

  const memoSkillAglaeaDmgBuff = memoSkill(e, 0.72, 0.792)
  const memoSkillAglaeaDefPen = memoSkill(e, 0.36, 0.396)

  const memoSkillTribbieDefPen = memoSkill(e, 0.12, 0.132)

  const memoSkillMydeiCd = memoSkill(e, 0.60, 0.66)

  const memoSkillCastoriceMulti = memoSkill(e, 0.0024, 0.00264)

  const memoSkillAnaxaSkillDmg = memoSkill(e, 0.40, 0.44)
  const memoSkillAnaxaAtkBuff = memoSkill(e, 0.60, 0.66)

  const memoSkillHyacineHealValue = memoSkill(e, 0.72, 0.792)

  const memoSkillCipherDmgBuff = memoSkill(e, 0.36, 0.396)
  const memoSkillCipherDefPen = memoSkill(e, 0.20, 0.22)

  const memoSkillPhainonCr = memoSkill(e, 0.16, 0.176)
  const memoSkillPhainonAdditionalDmg = memoSkill(e, 0.30, 0.33)

  const memoSkillHysilensDmgBuff = memoSkill(e, 1.20, 1.32)
  const memoSkillHysilensBasicDetonation = memoSkill(e, 0.60, 0.66)
  const memoSkillHysilensSkillDetonation = memoSkill(e, 0.80, 0.88)

  const memoSkillCerydraCdBuff = memoSkill(e, 0.30, 0.33)

  const memoSkillEvernightDmgBuff = memoSkill(e, 0.18, 0.198)
  const memoSkillEvernightCdBuff = memoSkill(e, 0.12, 0.132)

  const memoSkillDenHengDmgBuff = memoSkill(e, 0.16, 0.176)
  const memoSkillDenHengShieldAdditionalDmg = memoSkill(e, 0.80, 0.88)

  const memoSkillMemoDmgScaling = memoSkill(e, 0.50, 0.55)

  const chrysosHeirs: Record<string, boolean> = {
    [CYRENE]: true,
    [MYDEI]: true,
    [PHAINON]: true,
    [CASTORICE]: true,
    [ANAXA]: true,
    [CIPHER]: true,
    [AGLAEA]: true,
    [HYACINE]: true,
    [TRIBBIE]: true,
    [HYSILENS]: true,
    [CERYDRA]: true,
    [PERMANSOR_TERRAE]: true,
    [EVERNIGHT]: true,
    [CAELUS_REMEMBRANCE]: true,
    [STELLE_REMEMBRANCE]: true,
  }

  const defaults = {
    buffPriority: BUFF_PRIORITY_SELF,
    enhancedBasic: true,
    enhancedMemoSkill: true,
    zoneActive: true,
    crBuff: true,
    talentDmgBuff: true,
    hpBuff: true,
    traceSpdBasedBuff: true,
    e2TrueDmgStacks: 2,
    e4BounceStacks: 24,
    e6DefPen: true,
  }

  const teammateDefaults = {
    zoneActive: true,
    cyreneSpdDmg: true,
    specialEffect: true,
    talentDmgBuff: true,
    cyreneHp: 10000,
    cyreneCr: 1.00,
    e2TrueDmgStacks: 2,
    e6DefPen: true,
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
      text: `Enhanced Basic`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    enhancedMemoSkill: {
      id: 'enhancedMemoSkill',
      formItem: 'switch',
      text: `Enhanced Memo Skill`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    zoneActive: {
      id: 'zoneActive',
      formItem: 'switch',
      text: `Zone active`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    crBuff: {
      id: 'crBuff',
      formItem: 'switch',
      text: `CR buff`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: `Talent DMG buff`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    hpBuff: {
      id: 'hpBuff',
      formItem: 'switch',
      text: `HP buff`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    traceSpdBasedBuff: {
      id: 'traceSpdBasedBuff',
      formItem: 'switch',
      text: `SPD based buffs`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e2TrueDmgStacks: {
      id: 'e2TrueDmgStacks',
      formItem: 'slider',
      text: 'E2 True DMG stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 4,
      disabled: e < 2,
    },
    e4BounceStacks: {
      id: 'e4BounceStacks',
      formItem: 'slider',
      text: 'E4 bounce stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 24,
      disabled: e < 4,
    },
    e6DefPen: {
      id: 'e6DefPen',
      formItem: 'switch',
      text: `E6 DEF PEN`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    zoneActive: content.zoneActive,
    talentDmgBuff: content.talentDmgBuff,
    specialEffect: {
      id: 'specialEffect',
      formItem: 'switch',
      text: `Cyrene special effect`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    cyreneSpdDmg: {
      id: 'cyreneSpdDmg',
      formItem: 'switch',
      text: `Cyrene 180 SPD DMG boost`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    cyreneHp: {
      id: 'cyreneHp',
      formItem: 'slider',
      text: `Cyrene's Memo combat HP`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 20000,
    },
    cyreneCr: {
      id: 'cyreneCr',
      formItem: 'slider',
      text: `Cyrene's Memo combat CR`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 1.00,
      percent: true,
    },
    e2TrueDmgStacks: content.e2TrueDmgStacks,
    e6DefPen: content.e6DefPen,
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
      x.CR.buffBaseDual((r.crBuff) ? ultCrBuff : 0, SOURCE_ULT)
      x.HP_P.buffBaseDual((r.hpBuff) ? memoTalentHpBuff : 0, SOURCE_MEMO)

      x.MEMO_BASE_SPD_FLAT.buff(0, SOURCE_MEMO)
      x.MEMO_BASE_HP_SCALING.buff(1.00, SOURCE_MEMO)
      x.MEMO_BASE_ATK_SCALING.buff(1, SOURCE_MEMO)
      x.MEMO_BASE_DEF_SCALING.buff(1, SOURCE_MEMO)

      x.BASIC_HP_SCALING.buff((r.enhancedBasic) ? basicEnhancedScaling * 2 : basicScaling, SOURCE_BASIC)

      const memosprites = countTeamPath(context, PathNames.Remembrance)
      const memoSkillScalingIndividual = memoSkillDmgScaling + (e >= 4 ? r.e4BounceStacks * 0.06 : 0)
      const memoSkillScalingTotal = memoSkillScalingIndividual + memoSkillScalingIndividual
          * (r.enhancedMemoSkill
            ? (memosprites + 3 + (e >= 1 ? 12 : 0)) / context.enemyCount
            : 0)
      x.m.MEMO_SKILL_HP_SCALING.buff(memoSkillScalingTotal, SOURCE_MEMO)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(10, SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buffTeam((m.talentDmgBuff) ? talentDmgBuff : 0, SOURCE_TALENT)
      x.TRUE_DMG_MODIFIER.buffTeam((m.zoneActive) ? skillTrueDmgBuff : 0, SOURCE_SKILL)
      x.TRUE_DMG_MODIFIER.buffTeam((e >= 2 && m.zoneActive) ? m.e2TrueDmgStacks * 0.06 : 0, SOURCE_E2)

      x.DEF_PEN.buffTeam((e >= 6 && m.e6DefPen) ? 0.20 : 0, SOURCE_E6)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buff((t.cyreneSpdDmg) ? 0.20 : 0, SOURCE_TRACE)

      if (t.specialEffect) {
        if (!chrysosHeirs[context.characterId]) {
          x.ELEMENTAL_DMG.buffSingle((t.specialEffect) ? memoSkillDmgBuff : 0, SOURCE_MEMO)
        } else if (context.characterId == STELLE_REMEMBRANCE || context.characterId == CAELUS_REMEMBRANCE) {
          // Cannot be inlined with the main character conditional because of the cyreneHp dependency

          const atkBuff = memoSkillTrailblazerAtkScaling * t.cyreneHp
          x.ATK.buffBaseDual(atkBuff, SOURCE_MEMO)
          x.UNCONVERTIBLE_ATK_BUFF.buffBaseDual(atkBuff, SOURCE_MEMO)

          const crBuff = memoSkillTrailblazerCrScaling * t.cyreneCr
          x.CR.buffBaseDual(crBuff, SOURCE_MEMO)
          x.UNCONVERTIBLE_CR_BUFF.buffBaseDual(crBuff, SOURCE_MEMO)

          // TODO: Effective for the entire battle. When used on Trailblazer (Remembrance), increases Trailblazer (Remembrance)'s ATK by a value equal to 16% of ███'s Max HP, and increases Trailblazer (Remembrance)'s CRIT Rate by a value equal to 60%72% of ███'s CRIT Rate. This effect also applies to Mem. After Trailblazer (Remembrance) uses Enhanced Basic ATK in this battle, ███ immediately gains 1 extra turn and automatically uses "Minuet of Blooms and Plumes." If the target was defeated before this ability is used, it will be used on newly appeared enemy targets instead.
          // ----------------------------------------------------------------------------------------------
        }
      }
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (x.a[Key.SPD] >= 180 && r.traceSpdBasedBuff) {
        x.ELEMENTAL_DMG.buffBaseDual(0.20, SOURCE_TRACE)
        x.ICE_RES_PEN.buffBaseDual(Math.floor(Math.min(60, x.a[Key.SPD] - 180)) * 0.02, SOURCE_TRACE)
      }
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (x.SPD >= 180 && ${wgslTrue(r.traceSpdBasedBuff)}) {
  x.ELEMENTAL_DMG += 0.20;
  m.ELEMENTAL_DMG += 0.20;
  
  let penBuff = floor(min(60, x.SPD - 180)) * 0.02;
  x.ICE_RES_PEN += penBuff;
  m.ICE_RES_PEN += penBuff;
}
`
    },
  }
}
