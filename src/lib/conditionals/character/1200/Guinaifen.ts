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

export const GuinaifenEntities = createEnum('Guinaifen')
export const GuinaifenAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Guinaifen')
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
  } = Source.character('1210')

  const talentDebuffDmgIncreaseValue = talent(e, 0.07, 0.076)
  const talentDebuffMax = (e >= 6) ? 4 : 3

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 1.20, 1.296)
  const dotScaling = skill(e, 2.182, 2.40)

  const defaults = {
    talentDebuffStacks: talentDebuffMax,
    enemyBurned: true,
    skillDot: true,
    e1EffectResShred: true,
    e2BurnMultiBoost: true,
  }

  const teammateDefaults = {
    talentDebuffStacks: talentDebuffMax,
    e1EffectResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentDebuffStacks: {
      id: 'talentDebuffStacks',
      formItem: 'slider',
      text: t('Content.talentDebuffStacks.text'),
      content: t('Content.talentDebuffStacks.content', {
        talentDebuffDmgIncreaseValue: TsUtils.precisionRound(talentDebuffDmgIncreaseValue),
        talentDebuffMax,
      }),
      min: 0,
      max: talentDebuffMax,
    },
    enemyBurned: {
      id: 'enemyBurned',
      formItem: 'switch',
      text: t('Content.enemyBurned.text'),
      content: t('Content.enemyBurned.content'),
    },
    skillDot: {
      id: 'skillDot',
      formItem: 'switch',
      text: t('Content.skillDot.text'),
      content: t('Content.skillDot.content'),
    },
    e1EffectResShred: {
      id: 'e1EffectResShred',
      formItem: 'switch',
      text: t('Content.e1EffectResShred.text'),
      content: t('Content.e1EffectResShred.content'),
      disabled: e < 1,
    },
    e2BurnMultiBoost: {
      id: 'e2BurnMultiBoost',
      formItem: 'switch',
      text: t('Content.e2BurnMultiBoost.text'),
      content: t('Content.e2BurnMultiBoost.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentDebuffStacks: content.talentDebuffStacks,
    e1EffectResShred: content.e1EffectResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(GuinaifenEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [GuinaifenEntities.Guinaifen]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(GuinaifenAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate DoT scaling with E2 bonus
      const dotAtkScaling = dotScaling + ((e >= 2 && r.e2BurnMultiBoost) ? 0.40 : 0)
      // DoT chance: 100% from skill, 80% from trace
      const dotChance = r.skillDot ? 1.00 : 0.80

      return {
        [GuinaifenAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [GuinaifenAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [GuinaifenAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [GuinaifenAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Fire)
              .dotBaseChance(dotChance)
              .atkScaling(dotAtkScaling)
              .build(),
          ],
        },
        [GuinaifenAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace - DMG boost when enemy is burned
      x.buff(StatKey.DMG_BOOST, (r.enemyBurned) ? 0.20 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Talent - Firekiss vulnerability debuff
      x.buff(StatKey.VULNERABILITY, m.talentDebuffStacks * talentDebuffDmgIncreaseValue, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      // E1 - Effect RES shred
      x.buff(StatKey.EFFECT_RES_PEN, (e >= 1 && m.e1EffectResShred) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
