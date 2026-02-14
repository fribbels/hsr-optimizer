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

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const FeixiaoEntities = createEnum('Feixiao')
export const FeixiaoAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Feixiao')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1220')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultScaling = ult(e, 0.60, 0.648)
  const ultBrokenScaling = ult(e, 0.30, 0.33)
  const ultFinalScaling = ult(e, 1.60, 1.728)

  const fuaScaling = talent(e, 1.10, 1.21)
  const talentDmgBuff = talent(e, 0.60, 0.66)

  const ultHitCountMulti = 1 * 0.1285 + 2 * 0.1285 + 3 * 0.1285 + 4 * 0.1285 + 5 * 0.1285 + 6 * 0.1285 + 7 * 0.2285
  const ultBrokenHitCountMulti = 1 * 0.1285 * 0.1 + 2 * 0.1285 * 0.9
    + 3 * 0.1285 * 0.1 + 4 * 0.1285 * 0.9
    + 5 * 0.1285 * 0.1 + 6 * 0.1285 * 0.9
    + 7 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.2285

  function getUltHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    return r.weaknessBrokenUlt
      ? ASHBLAZING_ATK_STACK * ultBrokenHitCountMulti
      : ASHBLAZING_ATK_STACK * ultHitCountMulti
  }

  const defaults = {
    weaknessBrokenUlt: true,
    talentDmgBuff: true,
    skillAtkBuff: true,
    e1OriginalDmgBoost: true,
    e4Buffs: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    weaknessBrokenUlt: {
      id: 'weaknessBrokenUlt',
      formItem: 'switch',
      text: t('Content.weaknessBrokenUlt.text'),
      content: t('Content.weaknessBrokenUlt.content'),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', {
        FuaMultiplier: TsUtils.precisionRound(100 * fuaScaling),
        DmgBuff: TsUtils.precisionRound(100 * talentDmgBuff),
      }),
    },
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: t('Content.skillAtkBuff.text'),
      content: t('Content.skillAtkBuff.content'),
    },
    e1OriginalDmgBoost: {
      id: 'e1OriginalDmgBoost',
      formItem: 'switch',
      text: t('Content.e1OriginalDmgBoost.text'),
      content: t('Content.e1OriginalDmgBoost.content'),
      disabled: e < 1,
    },
    e4Buffs: {
      id: 'e4Buffs',
      formItem: 'switch',
      text: t('Content.e4Buffs.text'),
      content: t('Content.e4Buffs.content'),
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

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(FeixiaoEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [FeixiaoEntities.Feixiao]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(FeixiaoAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [FeixiaoAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [FeixiaoAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [FeixiaoAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageType(DamageTag.ULT | DamageTag.FUA)
              .damageElement(ElementTag.Wind)
              .atkScaling(6 * (ultScaling + ultBrokenScaling) + ultFinalScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [FeixiaoAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageType((e >= 6 && r.e6Buffs) ? DamageTag.ULT | DamageTag.FUA : DamageTag.FUA)
              .damageElement(ElementTag.Wind)
              .atkScaling(fuaScaling + ((e >= 6 && r.e6Buffs) ? 1.40 : 0))
              .toughnessDmg(5 + ((e >= 4) ? 5 : 0))
              .build(),
          ],
        },
        [FeixiaoAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.weaknessBrokenUlt) {
        x.set(StatKey.ENEMY_WEAKNESS_BROKEN, 1, x.source(SOURCE_ULT))
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Special case where we force the weakness break on if the ult break option is disabled
      if (!r.weaknessBrokenUlt) {
        x.buff(StatKey.BREAK_EFFICIENCY_BOOST, 1.00, x.damageType(DamageTag.ULT).source(SOURCE_ULT))
      }

      // Trace: FUA CD boost
      x.buff(StatKey.CD, 0.36, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))

      // Trace: ATK buff from skill
      x.buff(StatKey.ATK_P, (r.skillAtkBuff) ? 0.48 : 0, x.source(SOURCE_TRACE))

      // Talent: DMG boost
      x.buff(StatKey.DMG_BOOST, (r.talentDmgBuff) ? talentDmgBuff : 0, x.source(SOURCE_TALENT))

      // E1: ULT Final DMG boost
      x.buff(StatKey.FINAL_DMG_BOOST, (e >= 1 && r.e1OriginalDmgBoost) ? 0.3071 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E1))

      // E4: SPD buff (note: original uses SOURCE_E1)
      if (e >= 4) {
        x.buff(StatKey.SPD_P, 0.08, x.source(SOURCE_E1))
      }

      // E6: ULT RES PEN
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6Buffs) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const fuaHitMulti = ASHBLAZING_ATK_STACK * (1 * 1.00)
      boostAshblazingAtkContainer(x, action, fuaHitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const fuaHitMulti = ASHBLAZING_ATK_STACK * (1 * 1.00)
      return gpuBoostAshblazingAtkContainer(fuaHitMulti, action)
    },
  }
}
