import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
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
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SparkleB1Entities = createEnum('SparkleB1')
export const SparkleB1Abilities = createEnum('BASIC', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.SparkleB1')
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
  } = Source.character('1306b1')

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.06, 0.0648)
  const talentBaseStackBoost = talent(e, 0.04, 0.044)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    skillBuffs: false,
    cipherBuff: true,
    talentStacks: 3,
    teamAtkBuff: true,
    e1SpdBuff: true,
    e2DefPen: true,
  }

  const teammateDefaults = {
    skillBuffs: true,
    cipherBuff: true,
    talentStacks: 3,
    teamAtkBuff: true,
    teammateCDValue: 2.5,
    e2DefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillBuffs: {
      id: 'skillBuffs',
      formItem: 'switch',
      text: t('Content.skillBuffs.text'),
      content: t('Content.skillBuffs.content', {
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
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
      content: t('Content.talentStacks.content', { talentStackScaling: TsUtils.precisionRound(100 * talentBaseStackBoost) }),
      min: 0,
      max: 3,
    },
    teamAtkBuff: {
      id: 'teamAtkBuff',
      formItem: 'switch',
      text: t('Content.teamAtkBuff.text'),
      content: t('Content.teamAtkBuff.content'),
    },
    e1SpdBuff: {
      id: 'e1SpdBuff',
      formItem: 'switch',
      text: t('Content.e1SpdBuff.text'),
      content: t('Content.e1SpdBuff.content'),
      disabled: e < 1,
    },
    e2DefPen: {
      id: 'e2DefPen',
      formItem: 'switch',
      text: t('Content.e2DefPen.text'),
      content: t('Content.e2DefPen.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillBuffs: content.skillBuffs,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content'),
      min: 0,
      max: 3.50,
      percent: true,
    },
    cipherBuff: content.cipherBuff,
    talentStacks: content.talentStacks,
    teamAtkBuff: content.teamAtkBuff,
    e2DefPen: content.e2DefPen,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SparkleB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SparkleB1Entities.SparkleB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SparkleB1Abilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SparkleB1Abilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Quantum)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [SparkleB1Abilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.skillBuffs) {
        x.buff(StatKey.CD, skillCdBuffBase, x.source(SOURCE_SKILL))
        x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, skillCdBuffBase, x.source(SOURCE_SKILL))
      }

      x.buff(StatKey.SPD_P, (e >= 1 && r.e1SpdBuff) ? 0.15 : 0, x.source(SOURCE_E1))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // B1: ATK_P team buff 0.45 (vs 0.15 in migrated Sparkle)
      x.buff(StatKey.ATK_P, 0.45, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // E1: ATK +40% when cipher active
      x.buff(StatKey.ATK_P, (e >= 1 && m.cipherBuff) ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))

      // B1: RES_PEN self buff when skillBuffs (unique to B1)
      x.buff(StatKey.RES_PEN, m.skillBuffs ? 0.10 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_TRACE))

      // B1: VULNERABILITY team (vs DMG_BOOST in migrated Sparkle)
      x.buff(
        StatKey.VULNERABILITY,
        (m.cipherBuff)
          ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost)
          : m.talentStacks * talentBaseStackBoost,
        x.targets(TargetTag.FullTeam).source(SOURCE_TALENT),
      )

      // E2: DEF PEN 0.10 per stack (vs 0.08 in migrated Sparkle)
      x.buff(StatKey.DEF_PEN, (e >= 2 && m.e2DefPen) ? 0.10 * m.talentStacks : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = t.skillBuffs
        ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue
        : 0
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

          return r.skillBuffs
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
            `${wgslTrue(r.skillBuffs)}`,
          )
        },
      },
    ],
  }
}
