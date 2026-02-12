import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamPath,
  createEnum,
  mainIsPath,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { PathNames } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const TheHertaEntities = createEnum('TheHerta')
export const TheHertaAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TheHerta')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1401')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.70, 0.77)
  const enhancedSkillScaling = skill(e, 0.80, 0.88)
  const enhancedSkillAoeScaling = skill(e, 0.40, 0.44)
  const talentStackScaling = talent(e, 0.08, 0.088)

  const ultScaling = ult(e, 2.00, 2.20)
  const ultAtkBuffScaling = ult(e, 0.80, 0.88)

  const defaults = {
    enhancedSkill: true,
    eruditionTeammate: true,
    ultAtkBuff: true,
    interpretationStacks: 42,
    totalInterpretationStacks: 99,
    e1BonusStacks: true,
    e4EruditionSpdBuff: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    eruditionTeammate: true,
    e4EruditionSpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: t('Content.enhancedSkill.text'),
      content: t('Content.enhancedSkill.content'),
    },
    eruditionTeammate: {
      id: 'eruditionTeammate',
      formItem: 'switch',
      text: t('Content.eruditionTeammate.text'),
      content: t('Content.eruditionTeammate.content', {
        PrimaryScalingBonus: TsUtils.precisionRound(talentStackScaling * 100),
        AdjacentScalingBonus: TsUtils.precisionRound(talentStackScaling * 0.5 * 100),
      }),
    },
    ultAtkBuff: {
      id: 'ultAtkBuff',
      formItem: 'switch',
      text: t('Content.ultAtkBuff.text'),
      content: t('Content.ultAtkBuff.content', { AtkBuff: TsUtils.precisionRound(ultAtkBuffScaling * 100) }),
    },
    interpretationStacks: {
      id: 'interpretationStacks',
      formItem: 'slider',
      text: t('Content.interpretationStacks.text'),
      content: t('Content.interpretationStacks.content', {
        PrimaryScalingBonus: TsUtils.precisionRound(talentStackScaling * 100),
        AdjacentScalingBonus: TsUtils.precisionRound(talentStackScaling * 0.5 * 100),
      }),
      min: 1,
      max: 42,
    },
    totalInterpretationStacks: {
      id: 'totalInterpretationStacks',
      formItem: 'slider',
      text: t('Content.totalInterpretationStacks.text'),
      content: t('Content.totalInterpretationStacks.content'),
      min: 1,
      max: 99,
    },
    e1BonusStacks: {
      id: 'e1BonusStacks',
      formItem: 'switch',
      text: t('Content.e1BonusStacks.text'),
      content: t('Content.e1BonusStacks.content'),
      disabled: e < 1,
    },
    e4EruditionSpdBuff: {
      id: 'e4EruditionSpdBuff',
      formItem: 'switch',
      text: t('Content.e4EruditionSpdBuff.text'),
      content: t('Content.e4EruditionSpdBuff.content'),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    eruditionTeammate: content.eruditionTeammate,
    e4EruditionSpdBuff: content.e4EruditionSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    entityDeclaration: () => Object.values(TheHertaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TheHertaEntities.TheHerta]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),
    actionDeclaration: () => Object.values(TheHertaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e6DamageMultiplier = context.enemyCount == 1 ? 4.00 : 1.40
      const ultAtkScaling = ultScaling + r.totalInterpretationStacks * 0.01 + (e >= 6 && r.e6Buffs ? e6DamageMultiplier : 0)

      const eruditionStackMultiplier = r.eruditionTeammate
        ? Math.min(2, countTeamPath(context, PathNames.Erudition))
        : 1
      const enhancedSkillStackScaling = talentStackScaling
        * (r.interpretationStacks + ((e >= 1 && r.e1BonusStacks) ? r.interpretationStacks * 0.5 : 0))
        * eruditionStackMultiplier

      const skillAtkScaling = r.enhancedSkill
        ? enhancedSkillScaling * 3 + enhancedSkillStackScaling + enhancedSkillAoeScaling
        : skillScaling * 3

      return {
        [TheHertaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [TheHertaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Ice)
              .atkScaling(skillAtkScaling)
              .toughnessDmg((r.enhancedSkill) ? 25 : 20)
              .build(),
          ],
        },
        [TheHertaAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .atkScaling(ultAtkScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [TheHertaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // New container methods
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.ultAtkBuff) ? ultAtkBuffScaling : 0, x.source(SOURCE_ULT))

      // Skill DMG boost when stacks >= threshold
      const stackThreshold = (e >= 1 && r.e1BonusStacks) ? 28 : 42
      x.buff(StatKey.DMG_BOOST, (r.enhancedSkill && r.interpretationStacks >= stackThreshold) ? 0.50 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_TRACE))

      // E6 Ice RES PEN
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6Buffs) ? 0.20 : 0, x.elements(ElementTag.Ice).source(SOURCE_E6))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CD, (m.eruditionTeammate && countTeamPath(context, PathNames.Erudition) >= 2) ? 0.80 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      x.buff(StatKey.SPD_P, (e >= 4 && m.e4EruditionSpdBuff && mainIsPath(context, PathNames.Erudition)) ? 0.12 : 0, x.source(SOURCE_E4))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
  }
}
