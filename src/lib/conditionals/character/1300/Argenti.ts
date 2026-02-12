import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const ArgentiEntities = createEnum('Argenti')
export const ArgentiAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Argenti')
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
  } = Source.character('1302')

  const talentMaxStacks = (e >= 4) ? 12 : 10

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 1.60, 1.728)
  const ultEnhancedScaling = ult(e, 2.80, 3.024)
  const ultEnhancedExtraHitScaling = ult(e, 0.95, 1.026)
  const talentCrStackValue = talent(e, 0.025, 0.028)

  const defaults = {
    ultEnhanced: false,
    talentStacks: talentMaxStacks,
    ultEnhancedExtraHits: 6,
    e2UltAtkBuff: true,
    enemyHp50: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultEnhanced: {
      id: 'ultEnhanced',
      formItem: 'switch',
      text: t('Content.ultEnhanced.text'),
      content: t('Content.ultEnhanced.content', {
        ultEnhancedExtraHitScaling: TsUtils.precisionRound(100 * ultEnhancedExtraHitScaling),
        ultEnhancedScaling: TsUtils.precisionRound(100 * ultEnhancedScaling),
      }),
    },
    enemyHp50: {
      id: 'enemyHp50',
      formItem: 'switch',
      text: t('Content.enemyHp50.text'),
      content: t('Content.enemyHp50.content'),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', {
        talentMaxStacks: TsUtils.precisionRound(talentMaxStacks),
        talentCrStackValue: TsUtils.precisionRound(100 * talentCrStackValue),
      }),
      min: 0,
      max: talentMaxStacks,
    },
    ultEnhancedExtraHits: {
      id: 'ultEnhancedExtraHits',
      formItem: 'slider',
      text: t('Content.ultEnhancedExtraHits.text'),
      content: t('Content.ultEnhancedExtraHits.content', { ultEnhancedExtraHitScaling: TsUtils.precisionRound(100 * ultEnhancedExtraHitScaling) }),
      min: 0,
      max: 6,
    },
    e2UltAtkBuff: {
      id: 'e2UltAtkBuff',
      formItem: 'switch',
      text: t('Content.e2UltAtkBuff.text'),
      content: t('Content.e2UltAtkBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(ArgentiEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ArgentiEntities.Argenti]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(ArgentiAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const ultAtkScaling = r.ultEnhanced
        ? ultEnhancedScaling + r.ultEnhancedExtraHits * ultEnhancedExtraHitScaling
        : ultScaling

      const ultToughnessDmg = r.ultEnhanced
        ? 20 + 5 * r.ultEnhancedExtraHits
        : 20

      return {
        [ArgentiAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ArgentiAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ArgentiAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultAtkScaling)
              .toughnessDmg(ultToughnessDmg)
              .build(),
          ],
        },
        [ArgentiAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Talent
      x.buff(StatKey.CR, r.talentStacks * talentCrStackValue, x.source(SOURCE_TALENT))

      // Trace
      x.buff(StatKey.DMG_BOOST, (r.enemyHp50) ? 0.15 : 0, x.source(SOURCE_TRACE))

      // Eidolons
      x.buff(StatKey.CD, (e >= 1) ? r.talentStacks * 0.04 : 0, x.source(SOURCE_E1))
      x.buff(StatKey.ATK_P, (e >= 2 && r.e2UltAtkBuff) ? 0.40 : 0, x.source(SOURCE_E2))
      // Argenti's e6 ult buff is actually a cast type buff, not dmg type but we'll do it like this anyways
      x.buff(StatKey.DEF_PEN, (e >= 6) ? 0.30 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
