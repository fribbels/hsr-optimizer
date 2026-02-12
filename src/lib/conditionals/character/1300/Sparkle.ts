import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamElement,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  ElementNames,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SparkleEntities = createEnum('Sparkle')
export const SparkleAbilities = createEnum('BASIC', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sparkle')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1306')

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.10, 0.108)
  const talentBaseStackBoost = talent(e, 0.06, 0.066)

  const basicScaling = basic(e, 1.00, 1.10)

  const atkBoostByQuantumAllies: Record<number, number> = {
    0: 0,
    1: 0.05,
    2: 0.15,
    3: 0.30,
    4: 0.30,
  }

  const defaults = {
    skillCdBuff: false,
    cipherBuff: true,
    talentStacks: 3,
    quantumAlliesAtkBuff: true,
  }

  const teammateDefaults = {
    ...defaults,
    skillCdBuff: true,
    teammateCDValue: 2.5,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillCdBuff: {
      id: 'skillCdBuff',
      formItem: 'switch',
      text: t('Content.skillCdBuff.text'),
      content: t('Content.skillCdBuff.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
    },
    cipherBuff: {
      id: 'cipherBuff',
      formItem: 'switch',
      text: t('Content.cipherBuff.text'),
      content: t('Content.cipherBuff.content', { cipherTalentStackBoost: TsUtils.precisionRound(100 * cipherTalentStackBoost) }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentBaseStackBoost: TsUtils.precisionRound(100 * talentBaseStackBoost) }),
      min: 0,
      max: 3,
    },
    quantumAlliesAtkBuff: {
      id: 'quantumAlliesAtkBuff',
      formItem: 'switch',
      text: t('Content.quantumAlliesAtkBuff.text'),
      content: t('Content.quantumAlliesAtkBuff.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillCdBuff: content.skillCdBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
      min: 0,
      max: 3.50,
      percent: true,
    },
    cipherBuff: content.cipherBuff,
    talentStacks: content.talentStacks,
    quantumAlliesAtkBuff: content.quantumAlliesAtkBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SparkleEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SparkleEntities.Sparkle]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SparkleAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SparkleAbilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Quantum)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [SparkleAbilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skill CD buff (base portion - the scaling portion is handled in dynamicConditionals)
      if (r.skillCdBuff) {
        x.buff(StatKey.CD, skillCdBuffBase, x.source(SOURCE_SKILL))
        x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, skillCdBuffBase, x.source(SOURCE_SKILL))
      }
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace: Team ATK +15%
      x.buff(StatKey.ATK_P, 0.15, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // Trace: Additional ATK for Quantum-Type allies based on Quantum ally count
      x.buff(
        StatKey.ATK_P,
        context.element == ElementNames.Quantum && m.quantumAlliesAtkBuff
          ? atkBoostByQuantumAllies[countTeamElement(context, ElementNames.Quantum)]
          : 0,
        x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE),
      )

      // E1: ATK +40% when cipher active
      x.buff(StatKey.ATK_P, (e >= 1 && m.cipherBuff) ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))

      // Talent: DMG boost based on stacks (with cipher bonus if active)
      x.buff(
        StatKey.DMG_BOOST,
        (m.cipherBuff)
          ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost)
          : m.talentStacks * talentBaseStackBoost,
        x.targets(TargetTag.FullTeam).source(SOURCE_TALENT),
      )

      // E2: DEF PEN +8% per talent stack
      x.buff(StatKey.DEF_PEN, (e >= 2) ? 0.08 * m.talentStacks : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Skill CD buff with scaling from teammate's CD value
      const cdBuff = t.skillCdBuff
        ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue
        : 0

      // E6: CD buff applies to whole team, otherwise single target
      if (e >= 6) {
        x.buff(StatKey.CD, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
        x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      } else {
        x.buff(StatKey.CD, cdBuff, x.targets(TargetTag.SingleTarget).source(SOURCE_SKILL))
        x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, cdBuff, x.targets(TargetTag.SingleTarget).source(SOURCE_SKILL))
      }
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'SparkleCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.skillCdBuff
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.CD,
            Stats.CD,
            this,
            x,
            action,
            context,
            SOURCE_SKILL,
            (convertibleValue) => convertibleValue * (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.CD,
            Stats.CD,
            this,
            action,
            context,
            `${skillCdBuffScaling + (e >= 6 ? 0.30 : 0)} * convertibleValue`,
            `${wgslTrue(r.skillCdBuff)}`,
          )
        },
      },
    ],
  }
}