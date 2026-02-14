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
import { DamageTag, ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const JingliuEntities = createEnum('Jingliu')
export const JingliuAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jingliu')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1212')

  const talentCrBuff = talent(e, 0.50, 0.52)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedScaling = skill(e, 2.50, 2.75)
  const ultScaling = ult(e, 3.00, 3.24)

  const talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98) + ((e >= 4) ? 0.30 : 0)

  const defaults = {
    talentEnhancedState: true,
    talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
    e1CdBuff: true,
    e2SkillDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentEnhancedState: {
      id: 'talentEnhancedState',
      formItem: 'switch',
      text: t('Content.talentEnhancedState.text'),
      content: t('Content.talentEnhancedState.content', { talentCrBuff: TsUtils.precisionRound(100 * talentCrBuff) }),
    },
    talentHpDrainAtkBuff: {
      id: 'talentHpDrainAtkBuff',
      formItem: 'slider',
      text: t('Content.talentHpDrainAtkBuff.text'),
      content: t('Content.talentHpDrainAtkBuff.content', { talentHpDrainAtkBuffMax: TsUtils.precisionRound(100 * talentHpDrainAtkBuffMax) }),
      min: 0,
      max: talentHpDrainAtkBuffMax,
      percent: true,
    },
    e1CdBuff: {
      id: 'e1CdBuff',
      formItem: 'switch',
      text: t('Content.e1CdBuff.text'),
      content: t('Content.e1CdBuff.content'),
      disabled: e < 1,
    },
    e2SkillDmgBuff: {
      id: 'e2SkillDmgBuff',
      formItem: 'switch',
      text: t('Content.e2SkillDmgBuff.text'),
      content: t('Content.e2SkillDmgBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(JingliuEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [JingliuEntities.Jingliu]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(JingliuAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const singleTarget = context.enemyCount == 1

      // Calculate skill scaling based on enhanced state and E1
      const skillAtkScaling = (r.talentEnhancedState)
        ? skillEnhancedScaling + ((e >= 1 && singleTarget) ? 1 : 0)
        : skillScaling

      // Calculate ult scaling with E1 single target bonus
      const ultAtkScaling = ultScaling + ((e >= 1 && singleTarget) ? 1 : 0)

      return {
        [JingliuAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [JingliuAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Ice)
              .atkScaling(skillAtkScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [JingliuAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .atkScaling(ultAtkScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [JingliuAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Talent - Enhanced State buffs
      x.buff(StatKey.CR, (r.talentEnhancedState) ? talentCrBuff : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.ATK_P, (r.talentEnhancedState) ? r.talentHpDrainAtkBuff : 0, x.source(SOURCE_TALENT))

      // Traces
      x.buff(StatKey.RES, (r.talentEnhancedState) ? 0.35 : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (r.talentEnhancedState) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_TRACE))

      // Eidolons
      x.buff(StatKey.CD, (e >= 1 && r.e1CdBuff) ? 0.24 : 0, x.source(SOURCE_E1))
      x.buff(StatKey.DMG_BOOST, (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_E2))
      x.buff(StatKey.CD, (e >= 6 && r.talentEnhancedState) ? 0.50 : 0, x.source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
