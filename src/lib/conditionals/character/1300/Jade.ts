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

export const JadeEntities = createEnum('Jade')
export const JadeAbilities = createEnum('BASIC', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jade')
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
  } = Source.character('1314')

  const basicScaling = basic(e, 0.90, 0.99)
  // Assuming jade is not the debt collector - skill disabled
  const skillScaling = skill(e, 0.25, 0.27)
  const ultScaling = ult(e, 2.40, 2.64)
  const ultFuaScalingBuff = ult(e, 0.80, 0.88)
  const fuaScaling = talent(e, 1.20, 1.32)
  const pawnedAssetCdScaling = talent(e, 0.024, 0.0264)

  const unenhancedHitMultiByTargets: Record<number, number> = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.25 + 2 * 0.25 + 3 * 0.25 + 4 * 0.25), // 0.15
    3: ASHBLAZING_ATK_STACK * (2 * 0.25 + 5 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.345
    5: ASHBLAZING_ATK_STACK * (3 * 0.25 + 8 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.405
  }

  const enhancedHitMultiByTargets: Record<number, number> = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.10 + 2 * 0.10 + 3 * 0.10 + 4 * 0.10 + 5 * 0.60), // 0.24
    3: ASHBLAZING_ATK_STACK * (2 * 0.10 + 5 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.426
    5: ASHBLAZING_ATK_STACK * (3 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.45
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return r.enhancedFollowUp
      ? enhancedHitMultiByTargets[context.enemyCount]
      : unenhancedHitMultiByTargets[context.enemyCount]
  }

  const defaults = {
    enhancedFollowUp: true,
    pawnedAssetStacks: 50,
    e1FuaDmgBoost: true,
    e2CrBuff: true,
    e4DefShredBuff: true,
    e6ResShredBuff: true,
  }

  const teammateDefaults = {
    debtCollectorSpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedFollowUp: {
      id: 'enhancedFollowUp',
      formItem: 'switch',
      text: t('Content.enhancedFollowUp.text'),
      content: t('Content.enhancedFollowUp.content', { ultFuaScalingBuff: TsUtils.precisionRound(100 * ultFuaScalingBuff) }),
    },
    pawnedAssetStacks: {
      id: 'pawnedAssetStacks',
      formItem: 'slider',
      text: t('Content.pawnedAssetStacks.text'),
      content: t('Content.pawnedAssetStacks.content', { pawnedAssetCdScaling: TsUtils.precisionRound(100 * pawnedAssetCdScaling) }),
      min: 0,
      max: 50,
    },
    e1FuaDmgBoost: {
      id: 'e1FuaDmgBoost',
      formItem: 'switch',
      text: t('Content.e1FuaDmgBoost.text'),
      content: t('Content.e1FuaDmgBoost.content'),
      disabled: e < 1,
    },
    e2CrBuff: {
      id: 'e2CrBuff',
      formItem: 'switch',
      text: t('Content.e2CrBuff.text'),
      content: t('Content.e2CrBuff.content'),
      disabled: e < 2,
    },
    e4DefShredBuff: {
      id: 'e4DefShredBuff',
      formItem: 'switch',
      text: t('Content.e4DefShredBuff.text'),
      content: t('Content.e4DefShredBuff.content'),
      disabled: e < 4,
    },
    e6ResShredBuff: {
      id: 'e6ResShredBuff',
      formItem: 'switch',
      text: t('Content.e6ResShredBuff.text'),
      content: t('Content.e6ResShredBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    debtCollectorSpdBuff: {
      id: 'debtCollectorSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.debtCollectorSpdBuff.text'),
      content: t('TeammateContent.debtCollectorSpdBuff.content'),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(JadeEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [JadeEntities.Jade]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(JadeAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [JadeAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [JadeAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [JadeAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Quantum)
              .atkScaling(fuaScaling + (r.enhancedFollowUp ? ultFuaScalingBuff : 0))
              .toughnessDmg(10)
              .build(),
          ],
        },
        [JadeAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, r.pawnedAssetStacks * pawnedAssetCdScaling, x.source(SOURCE_TALENT))
      x.buff(StatKey.ATK_P, r.pawnedAssetStacks * 0.005, x.source(SOURCE_TRACE))
      x.buff(StatKey.CR, (e >= 2 && r.e2CrBuff && r.pawnedAssetStacks >= 15) ? 0.18 : 0, x.source(SOURCE_E2))

      x.buff(StatKey.DMG_BOOST, (e >= 1 && r.e1FuaDmgBoost) ? 0.32 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E1))
      x.buff(StatKey.DEF_PEN, (e >= 4 && r.e4DefShredBuff) ? 0.12 : 0, x.source(SOURCE_E4))
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6ResShredBuff) ? 0.20 : 0, x.elements(ElementTag.Quantum).source(SOURCE_E6))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.SPD, (t.debtCollectorSpdBuff) ? 30 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_SKILL))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, getHitMulti(action, context))
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(getHitMulti(action, context), action)
    },
  }
}