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

export const AstaEntities = createEnum('Asta')
export const AstaAbilities = createEnum('BASIC', 'SKILL', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Asta')
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
  } = Source.character('1009')

  const ultSpdBuffValue = ult(e, 50, 52.8)
  const talentStacksAtkBuff = talent(e, 0.14, 0.154)
  const talentStacksDefBuff = 0.06
  const skillExtraDmgHitsMax = (e >= 1) ? 5 : 4

  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0.50, 0.55)
  const dotScaling = basic(e, 0.50, 0.55)

  const defaults = {
    talentBuffStacks: 5,
    skillExtraDmgHits: skillExtraDmgHitsMax,
    ultSpdBuff: true,
    fireDmgBoost: true,
  }

  const teammateDefaults = {
    talentBuffStacks: 5,
    ultSpdBuff: true,
    fireDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillExtraDmgHits: {
      id: 'skillExtraDmgHits',
      formItem: 'slider',
      text: t('Content.skillExtraDmgHits.text'),
      content: t('Content.skillExtraDmgHits.content', { skillScaling: TsUtils.precisionRound(skillScaling * 100), skillExtraDmgHitsMax }),
      min: 0,
      max: skillExtraDmgHitsMax,
    },
    talentBuffStacks: {
      id: 'talentBuffStacks',
      formItem: 'slider',
      text: t('Content.talentBuffStacks.text'),
      content: t('Content.talentBuffStacks.content', { talentStacksAtkBuff: TsUtils.precisionRound(100 * talentStacksAtkBuff) }),
      min: 0,
      max: 5,
    },
    ultSpdBuff: {
      id: 'ultSpdBuff',
      formItem: 'switch',
      text: t('Content.ultSpdBuff.text'),
      content: t('Content.ultSpdBuff.content', { ultSpdBuffValue }),
    },
    fireDmgBoost: {
      id: 'fireDmgBoost',
      formItem: 'switch',
      text: t('Content.fireDmgBoost.text'),
      content: t('Content.fireDmgBoost.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentBuffStacks: content.talentBuffStacks,
    ultSpdBuff: content.ultSpdBuff,
    fireDmgBoost: content.fireDmgBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AstaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AstaEntities.Asta]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(AstaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const totalSkillScaling = skillScaling + r.skillExtraDmgHits * skillScaling
      const skillToughness = 10 + 5 * r.skillExtraDmgHits

      return {
        [AstaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AstaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .atkScaling(totalSkillScaling)
              .toughnessDmg(skillToughness)
              .build(),
          ],
        },
        [AstaAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(0.80)
              .damageElement(ElementTag.Fire)
              .atkScaling(dotScaling)
              .build(),
          ],
        },
        [AstaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_P, r.talentBuffStacks * talentStacksDefBuff, x.source(SOURCE_TRACE))
      x.buff(StatKey.ERR, (e >= 4 && r.talentBuffStacks >= 2) ? 0.15 : 0, x.source(SOURCE_E4))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.SPD, (m.ultSpdBuff) ? ultSpdBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.ATK_P, m.talentBuffStacks * talentStacksAtkBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
      x.buff(StatKey.FIRE_DMG_BOOST, (m.fireDmgBoost) ? 0.18 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
  }
}
