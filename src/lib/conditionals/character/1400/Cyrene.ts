import {
  AbilityType,
  BUFF_PRIORITY_MEMO,
  BUFF_PRIORITY_SELF,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { AKey, HKey, StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
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

export const CyreneEntities = createEnum('Cyrene', 'Demiurge')
export const CyreneAbilities = createEnum('BASIC', 'MEMO_SKILL', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Cyrene')
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
    memospriteActive: true,
    zoneActive: true,
    talentDmgBuff: true,
    traceSpdBasedBuff: true,
    odeToEgoExtraBounces: 3,
    e1ExtraBounces: 12,
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
    memospriteActive: {
      id: 'memospriteActive',
      formItem: 'switch',
      text: t('Content.memospriteActive.text'),
      content: t('Content.memospriteActive.content', {
        CRBuff: TsUtils.precisionRound(100 * ultCrBuff),
        HPBuff: TsUtils.precisionRound(100 * memoTalentHpBuff),
      }),
    },
    zoneActive: {
      id: 'zoneActive',
      formItem: 'switch',
      text: t('Content.zoneActive.text'),
      content: t('Content.zoneActive.content', { TrueDmg: TsUtils.precisionRound(100 * skillTrueDmgBuff) }),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * talentDmgBuff) }),
    },
    traceSpdBasedBuff: {
      id: 'traceSpdBasedBuff',
      formItem: 'switch',
      text: t('Content.traceSpdBasedBuff.text'),
      content: t('Content.traceSpdBasedBuff.content'),
    },
    odeToEgoExtraBounces: {
      id: 'odeToEgoExtraBounces',
      formItem: 'slider',
      text: t('Content.odeToEgoExtraBounces.text'),
      content: t('Content.odeToEgoExtraBounces.content'),
      min: 0,
      max: 6,
    },
    e1ExtraBounces: {
      id: 'e1ExtraBounces',
      formItem: 'slider',
      text: t('Content.e1ExtraBounces.text'),
      content: t('Content.e1ExtraBounces.content'),
      min: 0,
      max: 12,
      disabled: e < 1,
    },
    e2TrueDmgStacks: {
      id: 'e2TrueDmgStacks',
      formItem: 'slider',
      text: t('Content.e2TrueDmgStacks.text'),
      content: t('Content.e2TrueDmgStacks.content'),
      min: 0,
      max: 4,
      disabled: e < 2,
    },
    e4BounceStacks: {
      id: 'e4BounceStacks',
      formItem: 'slider',
      text: t('Content.e4BounceStacks.text'),
      content: t('Content.e4BounceStacks.content'),
      min: 0,
      max: 24,
      disabled: e < 4,
    },
    e6DefPen: {
      id: 'e6DefPen',
      formItem: 'switch',
      text: t('Content.e6DefPen.text'),
      content: t('Content.e6DefPen.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    zoneActive: content.zoneActive,
    talentDmgBuff: content.talentDmgBuff,
    specialEffect: {
      id: 'specialEffect',
      formItem: 'switch',
      text: t('TeammateContent.specialEffect.text'),
      content: t('TeammateContent.specialEffect.content', { DmgBuff: TsUtils.precisionRound(100 * memoSkillDmgBuff) }),
    },
    cyreneSpdDmg: {
      id: 'cyreneSpdDmg',
      formItem: 'switch',
      text: t('TeammateContent.cyreneSpdDmg.text'),
      content: t('TeammateContent.cyreneSpdDmg.content'),
    },
    cyreneHp: {
      id: 'cyreneHp',
      formItem: 'slider',
      text: t('TeammateContent.cyreneHp.text'),
      content: t('TeammateContent.cyreneHp.content', { ConversionRate: TsUtils.precisionRound(100 * memoSkillTrailblazerAtkScaling) }),
      min: 0,
      max: 20000,
    },
    cyreneCr: {
      id: 'cyreneCr',
      formItem: 'slider',
      text: t('TeammateContent.cyreneCr.text'),
      content: t('TeammateContent.cyreneCr.content', { ConversionRate: TsUtils.precisionRound(100 * memoSkillTrailblazerCrScaling) }),
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

    entityDeclaration: () => Object.values(CyreneEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [CyreneEntities.Cyrene]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
      [CyreneEntities.Demiurge]: {
        memoBaseSpdFlat: 0,
        memoBaseHpScaling: 1.00,
        memoBaseAtkScaling: 1,
        memoBaseDefScaling: 1,
        primary: false,
        summon: true,
        memosprite: true,
      },
    }),

    actionDeclaration: () => Object.values(CyreneAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // BASIC: Enhanced (2 hits) vs normal scaling
      const basicHpScaling = r.memospriteActive ? basicEnhancedScaling * 2 : basicScaling
      const basicToughness = r.memospriteActive ? 15 : 10

      // MEMO_SKILL: Complex bounce calculation
      const memoSkillScalingIndividual = memoSkillDmgScaling + (e >= 4 ? r.e4BounceStacks * 0.06 : 0)
      const memoSkillTotalHpScaling = memoSkillDmgScaling
        + r.odeToEgoExtraBounces * memoSkillScalingIndividual
        + r.e1ExtraBounces * memoSkillScalingIndividual
      const memoSkillToughness = 10
        + 5 / 3 * r.e1ExtraBounces
        + 5 / 3 * r.odeToEgoExtraBounces

      return {
        [CyreneAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .hpScaling(basicHpScaling)
              .toughnessDmg(basicToughness)
              .build(),
          ],
        },
        [CyreneAbilities.MEMO_SKILL]: {
          hits: [
            HitDefinitionBuilder.crit()
              .sourceEntity(CyreneEntities.Demiurge)
              .damageType(DamageTag.MEMO)
              .damageElement(ElementTag.Ice)
              .hpScaling(memoSkillTotalHpScaling)
              .toughnessDmg(memoSkillToughness)
              .directHit(true)
              .build(),
          ],
        },
        [CyreneAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.set(StatKey.SUMMONS, 1, x.source(SOURCE_TALENT))
      x.set(StatKey.MEMOSPRITE, 1, x.source(SOURCE_TALENT))
      x.set(StatKey.MEMO_BUFF_PRIORITY, r.buffPriority == BUFF_PRIORITY_SELF ? BUFF_PRIORITY_SELF : BUFF_PRIORITY_MEMO, x.source(SOURCE_TALENT))
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // ULT CR buff (self + memosprite)
      x.buff(StatKey.CR, r.memospriteActive ? ultCrBuff : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_ULT))

      // Memo talent HP% buff (self + memosprite)
      x.buff(StatKey.HP_P, r.memospriteActive ? memoTalentHpBuff : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_MEMO))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Talent DMG boost (full team)
      x.buff(StatKey.DMG_BOOST, m.talentDmgBuff ? talentDmgBuff : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      // Skill zone TRUE_DMG_MODIFIER (full team)
      x.buff(StatKey.TRUE_DMG_MODIFIER, m.zoneActive ? skillTrueDmgBuff : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // E2 TRUE_DMG_MODIFIER stacks (full team)
      x.buff(StatKey.TRUE_DMG_MODIFIER, (e >= 2 && m.zoneActive) ? m.e2TrueDmgStacks * 0.06 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      // E6 DEF PEN (full team)
      x.buff(StatKey.DEF_PEN, (e >= 6 && m.e6DefPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace SPD-based DMG buff
      x.buff(StatKey.DMG_BOOST, t.cyreneSpdDmg ? 0.20 : 0, x.source(SOURCE_TRACE))

      if (t.specialEffect) {
        if (!chrysosHeirs[context.characterId]) {
          // Non-chrysosHeirs get DMG buff to single target (follows memo buff priority)
          x.buff(StatKey.DMG_BOOST, t.specialEffect ? memoSkillDmgBuff : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_MEMO))
        } else if (context.characterId == STELLE_REMEMBRANCE || context.characterId == CAELUS_REMEMBRANCE) {
          // Trailblazers get ATK and CR conversion buffs (self + memosprite)
          const atkBuff = memoSkillTrailblazerAtkScaling * t.cyreneHp
          x.buff(StatKey.ATK, atkBuff, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(context.characterId)))
          x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, atkBuff, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(context.characterId)))

          const crBuff = memoSkillTrailblazerCrScaling * t.cyreneCr
          x.buff(StatKey.CR, crBuff, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(context.characterId)))
          x.buff(StatKey.UNCONVERTIBLE_CR_BUFF, crBuff, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(context.characterId)))
        }
      }
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const spd = x.getActionValue(StatKey.SPD, CyreneEntities.Cyrene)

      if (spd >= 180 && r.traceSpdBasedBuff) {
        x.buff(StatKey.DMG_BOOST, 0.20, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))
        x.buff(StatKey.RES_PEN, Math.floor(Math.min(60, spd - 180)) * 0.02, x.elements(ElementTag.Ice).targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))
      }
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
if (${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} >= 180.0 && ${wgslTrue(r.traceSpdBasedBuff)}) {
  ${buff.action(AKey.DMG_BOOST, 0.20).targets(TargetTag.SelfAndMemosprite).wgsl(action)}

  let penBuff = floor(min(60.0, ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} - 180.0)) * 0.02;
  ${buff.hit(HKey.RES_PEN, 'penBuff').elements(ElementTag.Ice).targets(TargetTag.SelfAndMemosprite).wgsl(action)}
}
      `
    },
  }
}
