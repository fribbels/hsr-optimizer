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
import { DamageTag, ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const MozeEntities = createEnum('Moze')
export const MozeAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Moze')
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
  } = Source.character('1223')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 2.70, 2.916)

  const fuaScaling = talent(e, 1.60, 1.76)
  const additionalDmgScaling = talent(e, 0.30, 0.33)

  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.08 + 2 * 0.08 + 3 * 0.08 + 4 * 0.08 + 5 * 0.08 + 6 * 0.6)

  const defaults = {
    preyMark: true,
    e2CdBoost: true,
    e4DmgBuff: true,
    e6MultiplierIncrease: true,
  }

  const teammateDefaults = {
    preyMark: true,
    e2CdBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    preyMark: {
      id: 'preyMark',
      formItem: 'switch',
      text: t('Content.preyMark.text'),
      content: t('Content.preyMark.content', {
        PreyAdditionalMultiplier: TsUtils.precisionRound(100 * additionalDmgScaling),
        FuaScaling: TsUtils.precisionRound(100 * fuaScaling),
      }),
    },
    e2CdBoost: {
      id: 'e2CdBoost',
      formItem: 'switch',
      text: t('Content.e2CdBoost.text'),
      content: t('Content.e2CdBoost.content'),
      disabled: e < 2,
    },
    e4DmgBuff: {
      id: 'e4DmgBuff',
      formItem: 'switch',
      text: t('Content.e4DmgBuff.text'),
      content: t('Content.e4DmgBuff.content'),
      disabled: e < 4,
    },
    e6MultiplierIncrease: {
      id: 'e6MultiplierIncrease',
      formItem: 'switch',
      text: t('Content.e6MultiplierIncrease.text'),
      content: t('Content.e6MultiplierIncrease.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    preyMark: content.preyMark,
    e2CdBoost: content.e2CdBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(MozeEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [MozeEntities.Moze]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(MozeAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e6FuaScaling = (e >= 6 && r.e6MultiplierIncrease) ? 0.25 : 0

      return {
        [MozeAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(
              (r.preyMark)
                ? [
                    HitDefinitionBuilder.standardAdditional()
                      .damageElement(ElementTag.Lightning)
                      .atkScaling(additionalDmgScaling)
                      .build(),
                  ]
                : []
            ),
          ],
        },
        [MozeAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(
              (r.preyMark)
                ? [
                    HitDefinitionBuilder.standardAdditional()
                      .damageElement(ElementTag.Lightning)
                      .atkScaling(additionalDmgScaling)
                      .build(),
                  ]
                : []
            ),
          ],
        },
        [MozeAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageType(DamageTag.ULT | DamageTag.FUA)
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
            ...(
              (r.preyMark)
                ? [
                    HitDefinitionBuilder.standardAdditional()
                      .damageElement(ElementTag.Lightning)
                      .atkScaling(additionalDmgScaling)
                      .build(),
                  ]
                : []
            ),
          ],
        },
        [MozeAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Lightning)
              .atkScaling(fuaScaling + e6FuaScaling)
              .toughnessDmg(10)
              .build(),
            ...(
              (r.preyMark)
                ? [
                    HitDefinitionBuilder.standardAdditional()
                      .damageElement(ElementTag.Lightning)
                      .atkScaling(additionalDmgScaling)
                      .build(),
                  ]
                : []
            ),
          ],
        },
        [MozeAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (e >= 4 && r.e4DmgBuff) ? 0.30 : 0, x.source(SOURCE_E4))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.preyMark) ? 0.25 : 0, x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.CD, (e >= 2 && m.preyMark && m.e2CdBoost) ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, fuaHitCountMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(fuaHitCountMulti, action)
    },
  }
}
