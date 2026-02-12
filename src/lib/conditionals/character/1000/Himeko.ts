import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
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
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const HimekoEntities = createEnum('Himeko')
export const HimekoAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Himeko')
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
  } = Source.character('1003')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const ultScaling = ult(e, 2.30, 2.484)
  const fuaScaling = talent(e, 1.40, 1.54)
  const dotScaling = 0.30

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40), // 0.168
    3: ASHBLAZING_ATK_STACK * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.372
    5: ASHBLAZING_ATK_STACK * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.42
  }

  const defaults = {
    targetBurned: true,
    selfCurrentHp80Percent: true,
    e1TalentSpdBuff: false,
    e2EnemyHp50DmgBoost: true,
    e6UltExtraHits: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetBurned: {
      id: 'targetBurned',
      formItem: 'switch',
      text: t('Content.targetBurned.text'),
      content: t('Content.targetBurned.content'),
    },
    selfCurrentHp80Percent: {
      id: 'selfCurrentHp80Percent',
      formItem: 'switch',
      text: t('Content.selfCurrentHp80Percent.text'),
      content: t('Content.selfCurrentHp80Percent.content'),
    },
    e1TalentSpdBuff: {
      id: 'e1TalentSpdBuff',
      formItem: 'switch',
      text: t('Content.e1TalentSpdBuff.text'),
      content: t('Content.e1TalentSpdBuff.content'),
      disabled: e < 1,
    },
    e2EnemyHp50DmgBoost: {
      id: 'e2EnemyHp50DmgBoost',
      formItem: 'switch',
      text: t('Content.e2EnemyHp50DmgBoost.text'),
      content: t('Content.e2EnemyHp50DmgBoost.content'),
      disabled: e < 2,
    },
    e6UltExtraHits: {
      id: 'e6UltExtraHits',
      formItem: 'slider',
      text: t('Content.e6UltExtraHits.text'),
      content: t('Content.e6UltExtraHits.content'),
      min: 0,
      max: 2,
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(HimekoEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [HimekoEntities.Himeko]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(HimekoAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e6UltScaling = (e >= 6) ? r.e6UltExtraHits * ultScaling * 0.40 : 0

      return {
        [HimekoAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [HimekoAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [HimekoAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .atkScaling(ultScaling + e6UltScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [HimekoAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Fire)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [HimekoAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(0.50)
              .damageElement(ElementTag.Fire)
              .atkScaling(dotScaling)
              .build(),
          ],
        },
        [HimekoAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.selfCurrentHp80Percent) ? 0.15 : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.SPD_P, (e >= 1 && r.e1TalentSpdBuff) ? 0.20 : 0, x.source(SOURCE_E1))

      x.buff(StatKey.DMG_BOOST, (r.targetBurned) ? 0.20 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (e >= 2 && r.e2EnemyHp50DmgBoost) ? 0.15 : 0, x.source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMultiByTargets[context.enemyCount])
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMultiByTargets[context.enemyCount], action)
    },
  }
}
