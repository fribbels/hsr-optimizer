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
  createEnum,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  PathNames,
  Stats,
} from 'lib/constants/constants'
import {
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { EVERNIGHT } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const EvernightEntities = createEnum(
  'Evernight',
  'Evey',
)

export const EvernightAbilities = createEnum(
  'BASIC',
  'ULT',
  'MEMO_SKILL',
  'BREAK',
)

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

    entityDeclaration: () => Object.values(EvernightEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [EvernightEntities.Evernight]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
      [EvernightEntities.Evey]: {
        memoBaseSpdFlat: 160,
        memoBaseHpScaling: 0.50,
        memoBaseAtkScaling: 1,
        memoBaseDefScaling: 1,
        primary: false,
        summon: true,
        memosprite: true,
      },
    }),

    actionDeclaration: () => Object.values(EvernightAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // MEMO_SKILL scaling varies based on memoriaStacks
      const memoSkillHpScaling = r.memoriaStacks >= 16
        ? memoSkillEnhancedScaling * r.memoriaStacks
        : memoSkillScaling + Math.floor(TsUtils.precisionRound(r.memoriaStacks / 4)) * memoSkillAdditionalScaling
      const memoSkillToughness = r.memoriaStacks >= 16 ? 10 : 30

      return {
        [EvernightAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .hpScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [EvernightAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .sourceEntity(EvernightEntities.Evey)
              .damageType(DamageTag.ULT | DamageTag.MEMO)
              .damageElement(ElementTag.Ice)
              .hpScaling(ultMemoScaling)
              .toughnessDmg(90)
              .build(),
          ],
        },
        [EvernightAbilities.MEMO_SKILL]: {
          hits: [
            HitDefinitionBuilder.crit()
              .sourceEntity(EvernightEntities.Evey)
              .damageType(DamageTag.MEMO)
              .damageElement(ElementTag.Ice)
              .hpScaling(memoSkillHpScaling)
              .toughnessDmg(memoSkillToughness)
              .directHit(true)
              .build(),
          ],
        },
        [EvernightAbilities.BREAK]: {
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

      // Trace crit buffs (self and memosprite)
      x.buff(StatKey.CR, (r.traceCritBuffs) ? 0.35 : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))
      x.buff(StatKey.CD, (r.traceCritBuffs) ? 0.15 : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))

      // Talent CD buff (self and memosprite)
      x.buff(StatKey.CD, (r.talentMemoCdBuff) ? talentCdScaling : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TALENT))

      // Enhanced state DMG boost (self and memosprite)
      x.buff(StatKey.DMG_BOOST, (r.enhancedState) ? ultDmgBoostScaling : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_ULT))

      // Memo talent DMG boost (self and memosprite)
      x.buff(StatKey.DMG_BOOST, (r.memoTalentDmgBuff) ? memoTalentDmgBoost : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_MEMO))

      // E2 CD buff (self and memosprite)
      x.buff(StatKey.CD, (e >= 2 && r.e2CdBuff) ? 0.40 : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_E2))

      // E4 Break Efficiency (memosprite only)
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (e >= 4 && r.e4Buffs) ? 0.25 : 0, x.targets(TargetTag.MemospritesOnly).source(SOURCE_E4))

      // Cyrene special effect - MEMO_SKILL DMG boost
      const cyreneMemoSkillDmgBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.198 : 0.18)
        : 0
      x.buff(
        StatKey.DMG_BOOST,
        (r.cyreneSpecialEffect) ? cyreneMemoSkillDmgBuff : 0,
        x.actionKind(EvernightAbilities.MEMO_SKILL).target(EvernightEntities.Evey).source(Source.odeTo(EVERNIGHT)),
      )
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Ult vulnerability (full team)
      x.buff(StatKey.VULNERABILITY, (m.enhancedState) ? ultVulnScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // E1 Final DMG boost (memosprites only, team-wide)
      x.buff(StatKey.FINAL_DMG_BOOST, (e >= 1 && m.e1FinalDmg) ? e1FinalDmgMap[context.enemyCount] : 0, x.targets(TargetTag.MemospritesOnly).source(SOURCE_E1))

      // E4 Break Efficiency (memosprites only, team-wide)
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (e >= 4 && m.e4Buffs) ? 0.25 : 0, x.targets(TargetTag.MemospritesOnly).source(SOURCE_E4))

      // Trace: Team memosprite CD buff based on Remembrance path count
      const memosprites = countTeamPath(context, PathNames.Remembrance)
      if (memosprites == 1) x.buff(StatKey.CD, 0.05, x.targets(TargetTag.MemospritesOnly).source(SOURCE_TRACE))
      if (memosprites == 2) x.buff(StatKey.CD, 0.15, x.targets(TargetTag.MemospritesOnly).source(SOURCE_TRACE))
      if (memosprites == 3) x.buff(StatKey.CD, 0.50, x.targets(TargetTag.MemospritesOnly).source(SOURCE_TRACE))
      if (memosprites == 4) x.buff(StatKey.CD, 0.65, x.targets(TargetTag.MemospritesOnly).source(SOURCE_TRACE))

      // E6 RES PEN (full team)
      x.buff(StatKey.RES_PEN, (e >= 6 && m.e6ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    precomputeTeammateEffectsContainer: (
      x: ComputedStatsContainer,
      action: OptimizerAction,
      context: OptimizerContext,
      originalCharacterAction?: OptimizerAction,
    ) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Skill CD buff to teammate's memosprite
      x.buff(StatKey.CD, t.skillMemoCdBuff ? skillCdScaling * t.evernightCombatCD : 0, x.targets(TargetTag.MemospritesOnly).source(SOURCE_SKILL))
      x.buff(
        StatKey.UNCONVERTIBLE_CD_BUFF,
        t.skillMemoCdBuff ? skillCdScaling * t.evernightCombatCD : 0,
        x.targets(TargetTag.MemospritesOnly).source(SOURCE_SKILL),
      )

      // Cyrene additional CD buff
      if (t.cyreneSpecialEffect && cyreneActionExists(originalCharacterAction!)) {
        const cyreneAdditionalCdScaling = cyreneSpecialEffectEidolonUpgraded(originalCharacterAction!) ? 0.132 : 0.12
        x.buff(
          StatKey.CD,
          t.skillMemoCdBuff ? cyreneAdditionalCdScaling * t.evernightCombatCD : 0,
          x.targets(TargetTag.MemospritesOnly).source(Source.odeTo(EVERNIGHT)),
        )
        x.buff(
          StatKey.UNCONVERTIBLE_CD_BUFF,
          t.skillMemoCdBuff ? cyreneAdditionalCdScaling * t.evernightCombatCD : 0,
          x.targets(TargetTag.MemospritesOnly).source(Source.odeTo(EVERNIGHT)),
        )
      }
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'EvernightCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.skillMemoCdBuff) {
            return
          }

          const memosprite = x.getActionValue(StatKey.MEMOSPRITE, EvernightEntities.Evernight)
          if (!memosprite) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x.getActionValue(StatKey.CD, EvernightEntities.Evernight)
            - x.getActionValue(StatKey.UNCONVERTIBLE_CD_BUFF, EvernightEntities.Evernight)

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

          x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, ownFinalBuffCd, x.targets(TargetTag.MemospritesOnly).source(SOURCE_SKILL))
          x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, odeFinalBuffCd, x.targets(TargetTag.MemospritesOnly).source(Source.odeTo(EVERNIGHT)))

          x.buffDynamic(StatKey.CD, ownFinalBuffCd, action, context, x.targets(TargetTag.MemospritesOnly).source(SOURCE_SKILL))
          x.buffDynamic(StatKey.CD, odeFinalBuffCd, action, context, x.targets(TargetTag.MemospritesOnly).source(Source.odeTo(EVERNIGHT)))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          let cdBuffScaling = skillCdScaling
          if (cyreneActionExists(action)) {
            cdBuffScaling += cyreneSpecialEffectEidolonUpgraded(action) ? 0.132 : 0.12
          }

          const config = action.config
          const memoEntityIndex = config.entityRegistry.getIndex(EvernightEntities.Evey)

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${wgslFalse(r.skillMemoCdBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).EvernightCdConditional${action.actionIdentifier};
let convertibleCdValue: f32 = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, config)} - ${
              containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_CD_BUFF, config)
            };

var buffCD: f32 = ${cdBuffScaling} * convertibleCdValue;
var stateBuffCD: f32 = ${cdBuffScaling} * stateValue;

(*p_state).EvernightCdConditional${action.actionIdentifier} = convertibleCdValue;

let finalBuffCd = max(0.0, buffCD - select(0.0, stateBuffCD, stateValue > 0.0));
${p_containerActionVal(memoEntityIndex, StatKey.UNCONVERTIBLE_CD_BUFF, config)} += finalBuffCd;
${p_containerActionVal(memoEntityIndex, StatKey.CD, config)} += finalBuffCd;
`,
          )
        },
      },
    ],
  }
}
