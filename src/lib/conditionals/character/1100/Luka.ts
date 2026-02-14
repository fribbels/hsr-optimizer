import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
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

export const LukaEntities = createEnum('Luka')
export const LukaAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luka')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1111')

  const basicEnhancedHitValue = basic(e, 0.20, 0.22)
  const targetUltDebuffDmgTakenValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.20 * 3 + 0.80, 0.22 * 3 + 0.88)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 3.30, 3.564)
  const dotScaling = skill(e, 3.38, 3.718)

  const defaults = {
    basicEnhanced: true,
    targetUltDebuffed: true,
    e1TargetBleeding: true,
    basicEnhancedExtraHits: 3,
    e4TalentStacks: 4,
  }

  const teammateDefaults = {
    targetUltDebuffed: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content'),
    },
    targetUltDebuffed: {
      id: 'targetUltDebuffed',
      formItem: 'switch',
      text: t('Content.targetUltDebuffed.text'),
      content: t('Content.targetUltDebuffed.content', { targetUltDebuffDmgTakenValue: TsUtils.precisionRound(100 * targetUltDebuffDmgTakenValue) }),
    },
    basicEnhancedExtraHits: {
      id: 'basicEnhancedExtraHits',
      formItem: 'slider',
      text: t('Content.basicEnhancedExtraHits.text'),
      content: t('Content.basicEnhancedExtraHits.content'),
      min: 0,
      max: 3,
    },
    e1TargetBleeding: {
      id: 'e1TargetBleeding',
      formItem: 'switch',
      text: t('Content.e1TargetBleeding.text'),
      content: t('Content.e1TargetBleeding.content'),
      disabled: e < 1,
    },
    e4TalentStacks: {
      id: 'e4TalentStacks',
      formItem: 'slider',
      text: t('Content.e4TalentStacks.text'),
      content: t('Content.e4TalentStacks.content'),
      min: 0,
      max: 4,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetUltDebuffed: content.targetUltDebuffed,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(LukaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [LukaEntities.Luka]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(LukaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const basicAtkScaling = (r.basicEnhanced)
        ? basicEnhancedScaling + r.basicEnhancedExtraHits * basicEnhancedHitValue
        : basicScaling

      return {
        [LukaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicAtkScaling)
              .toughnessDmg((r.basicEnhanced) ? 20 : 10)
              .build(),
          ],
        },
        [LukaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [LukaAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [LukaAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Physical)
              .atkScaling(dotScaling)
              .dotBaseChance(1.00)
              .build(),
          ],
        },
        [LukaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (e >= 4) ? r.e4TalentStacks * 0.05 : 0, x.source(SOURCE_E4))
      x.buff(StatKey.DMG_BOOST, (e >= 1 && r.e1TargetBleeding) ? 0.15 : 0, x.source(SOURCE_E1))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
