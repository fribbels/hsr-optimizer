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
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Stats,
} from 'lib/constants/constants'
import {
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import {
  wgsl,
  wgslFalse,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import i18next from 'i18next'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const TrailblazerRemembranceAbilities = createEnum(
  'BASIC',
  'ULT',
  'MEMO_SKILL',
  'BREAK',
)

export const TrailblazerRemembranceEntities = createEnum(
  'Trailblazer',
  'Mem',
)

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
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { Scaling: TsUtils.precisionRound(100 * enhancedBasicScaling) }),
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
    entityDeclaration: () => Object.values(TrailblazerRemembranceEntities),
    actionDeclaration: () => Object.values(TrailblazerRemembranceAbilities),

    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [TrailblazerRemembranceEntities.Trailblazer]: {
          primary: true,
          summon: false,
          memosprite: false,
        },
        [TrailblazerRemembranceEntities.Mem]: {
          memoBaseHpScaling: memoHpScaling,
          memoBaseHpFlat: memoHpFlat,
          memoBaseSpdFlat: 130,
          memoBaseDefScaling: 1,
          memoBaseAtkScaling: 1,
          primary: false,
          summon: true,
          memosprite: true,
        },
      }
    },

    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const basicAbility = {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Ice)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      }

      const enhancedBasicAbility = {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Ice)
            .atkScaling(enhancedBasicScaling)
            .toughnessDmg(10)
            .build(),
          HitDefinitionBuilder.crit()
            .sourceEntity(TrailblazerRemembranceEntities.Mem)
            .damageType(DamageTag.BASIC | DamageTag.MEMO)
            .damageElement(ElementTag.Ice)
            .atkScaling(enhancedBasicScaling)
            .directHit(true)
            .build(),
        ],
      }

      return {
        [TrailblazerRemembranceAbilities.BASIC]: r.enhancedBasic ? enhancedBasicAbility : basicAbility,
        [TrailblazerRemembranceAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .sourceEntity(TrailblazerRemembranceEntities.Mem)
              .damageType(DamageTag.ULT | DamageTag.MEMO)
              .damageElement(ElementTag.Ice)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [TrailblazerRemembranceAbilities.MEMO_SKILL]: {
          hits: [
            HitDefinitionBuilder.crit()
              .sourceEntity(TrailblazerRemembranceEntities.Mem)
              .damageType(DamageTag.MEMO)
              .damageElement(ElementTag.Ice)
              .atkScaling(r.memoSkillHits * memoSkillHitScaling + memoSkillFinalScaling)
              .toughnessDmg(15)
              .directHit(true)
              .build(),
          ],
        },
        [TrailblazerRemembranceAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },

    actionModifiers() {
      return []
    },


    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.set(StatKey.SUMMONS, 1, x.source(SOURCE_TALENT))
      x.set(StatKey.MEMOSPRITE, 1, x.source(SOURCE_TALENT))
      x.set(StatKey.MEMO_BUFF_PRIORITY, r.buffPriority == BUFF_PRIORITY_SELF ? BUFF_PRIORITY_SELF : BUFF_PRIORITY_MEMO, x.source(SOURCE_TALENT))
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: Ult CR boost
      x.buff(
        StatKey.CR,
        (e >= 6 && r.e6UltCrBoost) ? 1.00 : 0,
        x.target(TrailblazerRemembranceEntities.Mem).damageType(DamageTag.ULT).source(SOURCE_E6),
      )
    },


    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      if (m.memsSupport) {
        const energyTrueDmg = Math.min(0.20, m.energyTrueDmgValue ? Math.max((context.baseEnergy - 100) / 10, 0) * 2 * 0.01 : 0)
        const trueDmg = trueDmgScaling
          + energyTrueDmg
          + (e >= 4 && m.e4TrueDmgBoost ? 0.06 : 0)

        if (e >= 1) {
          x.buff(StatKey.CR, (m.e1CrBuff) ? 0.10 : 0, x.targets(TargetTag.SelfAndMemosprite).deferrable().source(SOURCE_E1))
          x.buff(StatKey.TRUE_DMG_MODIFIER, trueDmg, x.targets(TargetTag.SelfAndMemosprite).deferrable().source(SOURCE_MEMO))
        } else {
          x.buff(StatKey.TRUE_DMG_MODIFIER, trueDmg, x.targets(TargetTag.SingleTarget).source(SOURCE_MEMO))
        }
      }
    },



    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const teamCDBuff = t.teamCdBuff ? memoTalentCdBuffScaling * t.memCDValue + memoTalentCdBuffFlat : 0
      x.buff(StatKey.CD, teamCDBuff, x.targets(TargetTag.FullTeam).source(SOURCE_MEMO))
      x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, teamCDBuff, x.targets(TargetTag.FullTeam).source(SOURCE_MEMO))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },


    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return wgsl``
    },

    dynamicConditionals: [
      {
        id: 'TrailblazerRemembranceCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.teamCdBuff) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x.getActionValue(StatKey.CD, TrailblazerRemembranceEntities.Mem)
            - x.getActionValue(StatKey.UNCONVERTIBLE_CD_BUFF, TrailblazerRemembranceEntities.Mem)

          const buffCD = memoTalentCdBuffScaling * convertibleCdValue + memoTalentCdBuffFlat
          const stateBuffCD = memoTalentCdBuffScaling * stateValue + memoTalentCdBuffFlat

          action.conditionalState[this.id] = convertibleCdValue

          const finalBuffCd = Math.max(0, buffCD - (stateValue ? stateBuffCD : 0))

          x.buffDynamic(StatKey.UNCONVERTIBLE_CD_BUFF, finalBuffCd, action, context, x.target(TrailblazerRemembranceEntities.Mem).source(SOURCE_MEMO))
          x.buffDynamic(StatKey.CD, finalBuffCd, action, context, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_MEMO))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const config = action.config
          const memoEntityIndex = config.entityRegistry.getIndex(TrailblazerRemembranceEntities.Mem)

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${wgslFalse(r.teamCdBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).TrailblazerRemembranceCdConditional${action.actionIdentifier};
let convertibleCdValue: f32 = ${containerActionVal(memoEntityIndex, StatKey.CD, config)} - ${
              containerActionVal(memoEntityIndex, StatKey.UNCONVERTIBLE_CD_BUFF, config)
            };

var buffCD: f32 = ${memoTalentCdBuffScaling} * convertibleCdValue + ${memoTalentCdBuffFlat};
var stateBuffCD: f32 = ${memoTalentCdBuffScaling} * stateValue + ${memoTalentCdBuffFlat};

(*p_state).TrailblazerRemembranceCdConditional${action.actionIdentifier} = convertibleCdValue;

let finalBuffCd = max(0.0, buffCD - select(0.0, stateBuffCD, stateValue > 0.0));
${p_containerActionVal(memoEntityIndex, StatKey.UNCONVERTIBLE_CD_BUFF, config)} += finalBuffCd;

${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, config)} += finalBuffCd;
${p_containerActionVal(memoEntityIndex, StatKey.CD, config)} += finalBuffCd;
`,
          )
        },
      },
    ],
  }
}
