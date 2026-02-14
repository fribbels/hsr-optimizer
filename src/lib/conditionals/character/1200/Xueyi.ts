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
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const XueyiEntities = createEnum('Xueyi')
export const XueyiAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Xueyi')
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
  } = Source.character('1214')

  const ultBoostMax = ult(e, 0.60, 0.648)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 2.50, 2.70)
  const fuaScaling = talent(e, 0.90, 0.99)

  const hitMultiByFuaHits: NumberToNumberMap = {
    0: 0,
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    2: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2), // 0.09
    3: ASHBLAZING_ATK_STACK * (1 * 1 / 3 + 2 * 1 / 3 + 3 * 1 / 3), // 0.12
  }

  const defaults = {
    beToDmgBoost: true,
    enemyToughness50: true,
    toughnessReductionDmgBoost: ultBoostMax,
    fuaHits: 3,
    e4BeBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    beToDmgBoost: {
      id: 'beToDmgBoost',
      formItem: 'switch',
      text: t('Content.beToDmgBoost.text'),
      content: t('Content.beToDmgBoost.content'),
    },
    enemyToughness50: {
      id: 'enemyToughness50',
      formItem: 'switch',
      text: t('Content.enemyToughness50.text'),
      content: t('Content.enemyToughness50.content'),
    },
    toughnessReductionDmgBoost: {
      id: 'toughnessReductionDmgBoost',
      formItem: 'slider',
      text: t('Content.toughnessReductionDmgBoost.text'),
      content: t('Content.toughnessReductionDmgBoost.content', { ultBoostMax: TsUtils.precisionRound(100 * ultBoostMax) }),
      min: 0,
      max: ultBoostMax,
      percent: true,
    },
    fuaHits: {
      id: 'fuaHits',
      formItem: 'slider',
      text: t('Content.fuaHits.text'),
      content: t('Content.fuaHits.content', { fuaScaling: TsUtils.precisionRound(100 * fuaScaling) }),
      min: 0,
      max: 3,
    },
    e4BeBuff: {
      id: 'e4BeBuff',
      formItem: 'switch',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
      disabled: (e < 4),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(XueyiEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [XueyiEntities.Xueyi]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(XueyiAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [XueyiAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [XueyiAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [XueyiAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(40)
              .build(),
          ],
        },
        [XueyiAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Quantum)
              .atkScaling(fuaScaling * r.fuaHits)
              .toughnessDmg(5 * r.fuaHits)
              .build(),
          ],
        },
        [XueyiAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E4: BE buff
      x.buff(StatKey.BE, (e >= 4 && r.e4BeBuff) ? 0.40 : 0, x.source(SOURCE_E4))

      // ULT: Toughness reduction DMG boost
      x.buff(StatKey.DMG_BOOST, r.toughnessReductionDmgBoost, x.damageType(DamageTag.ULT).source(SOURCE_ULT))

      // Trace: ULT DMG boost when enemy toughness < 50%
      x.buff(StatKey.DMG_BOOST, (r.enemyToughness50) ? 0.10 : 0, x.damageType(DamageTag.ULT).source(SOURCE_TRACE))

      // E1: FUA DMG boost
      x.buff(StatKey.DMG_BOOST, (e >= 1) ? 0.40 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E1))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace: BE to DMG boost (max 240%)
      const be = x.getActionValue(StatKey.BE, XueyiEntities.Xueyi)
      x.buff(StatKey.DMG_BOOST, (r.beToDmgBoost) ? Math.min(2.40, be) : 0, x.source(SOURCE_TRACE))

      boostAshblazingAtkContainer(x, action, hitMultiByFuaHits[r.fuaHits])
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.beToDmgBoost)}) {
  let dmgBuff = min(2.40, ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BE, action.config)});
  ${buff.action(AKey.DMG_BOOST, 'dmgBuff').wgsl(action)}
}
      ` + gpuBoostAshblazingAtkContainer(hitMultiByFuaHits[r.fuaHits], action)
    },
  }
}
