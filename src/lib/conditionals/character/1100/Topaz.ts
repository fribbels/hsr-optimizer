import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
  DamageType,
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

export const TopazEntities = createEnum('Topaz', 'Numby')
export const TopazAbilities = createEnum('BASIC', 'SKILL', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Topaz')
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
  } = Source.character('1112')

  const proofOfDebtFuaVulnerability = skill(e, 0.50, 0.55)
  const enhancedStateFuaScalingBoost = ult(e, 1.50, 1.65)
  const enhancedStateFuaCdBoost = ult(e, 0.25, 0.275)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const fuaScaling = talent(e, 1.50, 1.65)

  // 0.06
  const basicHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 1)

  // 0.18
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 7 + 2 * 1 / 7 + 3 * 1 / 7 + 4 * 1 / 7 + 5 * 1 / 7 + 6 * 1 / 7 + 7 * 1 / 7)

  // 0.252
  const fuaEnhancedHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 10 + 2 * 1 / 10 + 3 * 1 / 10 + 4 * 1 / 10 + 5 * 1 / 10 + 6 * 1 / 10 + 7 * 1 / 10 + 8 * 3 / 10)

  const defaults = {
    enemyProofOfDebtDebuff: true,
    numbyEnhancedState: true,
    e1DebtorStacks: 2,
  }

  const teammateDefaults = {
    enemyProofOfDebtDebuff: true,
    e1DebtorStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyProofOfDebtDebuff: {
      id: 'enemyProofOfDebtDebuff',
      formItem: 'switch',
      text: t('Content.enemyProofOfDebtDebuff.text'),
      content: t('Content.enemyProofOfDebtDebuff.content', { proofOfDebtFuaVulnerability: TsUtils.precisionRound(100 * proofOfDebtFuaVulnerability) }),
    },
    numbyEnhancedState: {
      id: 'numbyEnhancedState',
      formItem: 'switch',
      text: t('Content.numbyEnhancedState.text'),
      content: t('Content.numbyEnhancedState.content', {
        enhancedStateFuaCdBoost: TsUtils.precisionRound(100 * enhancedStateFuaCdBoost),
        enhancedStateFuaScalingBoost: TsUtils.precisionRound(100 * enhancedStateFuaScalingBoost),
      }),
    },
    e1DebtorStacks: {
      id: 'e1DebtorStacks',
      formItem: 'slider',
      text: t('Content.e1DebtorStacks.text'),
      content: t('Content.e1DebtorStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyProofOfDebtDebuff: content.enemyProofOfDebtDebuff,
    e1DebtorStacks: content.e1DebtorStacks,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(TopazEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TopazEntities.Topaz]: {
        primary: true,
        summon: false,
        memosprite: false,
        pet: false,
      },
      [TopazEntities.Numby]: {
        primary: false,
        summon: true,
        memosprite: false,
        pet: true,
      },
    }),

    actionDeclaration: () => Object.values(TopazAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [TopazAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .damageType(DamageType.BASIC | DamageType.FUA)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [TopazAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .sourceEntity(TopazEntities.Numby)
              .damageElement(ElementTag.Fire)
              .damageType(DamageType.SKILL | DamageType.FUA)
              .atkScaling(skillScaling + (r.numbyEnhancedState ? enhancedStateFuaScalingBoost : 0))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [TopazAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .sourceEntity(TopazEntities.Numby)
              .damageElement(ElementTag.Fire)
              .atkScaling(fuaScaling + (r.numbyEnhancedState ? enhancedStateFuaScalingBoost : 0))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [TopazAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.set(StatKey.SUMMONS, 1, x.source(SOURCE_TALENT))
    },
    // initializeConfigurations: (x: ComputedStatsArray, action, context) => {
    //   x.BASIC_DMG_TYPE.set(BASIC_DMG_TYPE | FUA_DMG_TYPE, SOURCE_TRACE)
    //   x.SKILL_DMG_TYPE.set(SKILL_DMG_TYPE | FUA_DMG_TYPE, SOURCE_SKILL)
    //   x.SUMMONS.set(1, SOURCE_TALENT)
    // },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0, x.target(TopazEntities.Numby).source(SOURCE_ULT))
      x.buff(StatKey.RES_PEN, (e >= 6) ? 0.10 : 0, x.target(TopazEntities.Numby).source(SOURCE_E6))

      x.buff(StatKey.DMG_BOOST, (context.enemyElementalWeak) ? 0.15 : 0, x.source(SOURCE_TRACE))
    },

    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // // Numby buffs only applies to the skill/fua not basic, we deduct it from basic
      // buffAbilityCd(x, BASIC_DMG_TYPE, (r.numbyEnhancedState) ? -enhancedStateFuaCdBoost : 0, SOURCE_ULT)
      // buffAbilityResPen(x, BASIC_DMG_TYPE, (e >= 6) ? -0.10 : 0, SOURCE_E6)
      //
      // // Scaling
      // x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      // x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      // x.SKILL_ATK_SCALING.buff((r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0, SOURCE_ULT)
      // x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      // x.FUA_ATK_SCALING.buff((r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0, SOURCE_ULT)
      //
      // // Boost
      // x.ELEMENTAL_DMG.buff((context.enemyElementalWeak) ? 0.15 : 0, SOURCE_TRACE)
      //
      // x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      // x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      // x.FUA_TOUGHNESS_DMG.buff(20, SOURCE_TALENT)
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(
        StatKey.VULNERABILITY,
        (m.enemyProofOfDebtDebuff) ? proofOfDebtFuaVulnerability : 0,
        x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_SKILL),
      )
      x.buff(
        StatKey.CD,
        (e >= 1 && m.enemyProofOfDebtDebuff) ? 0.25 * m.e1DebtorStacks : 0,
        x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_E1),
      )
    },

    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // buffAbilityVulnerability(x, FUA_DMG_TYPE, (m.enemyProofOfDebtDebuff) ? proofOfDebtFuaVulnerability : 0, SOURCE_SKILL, Target.TEAM)
      // buffAbilityCd(x, FUA_DMG_TYPE, (e >= 1 && m.enemyProofOfDebtDebuff) ? 0.25 * m.e1DebtorStacks : 0, SOURCE_E1, Target.TEAM)
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      boostAshblazingAtkContainer(x, action, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      return gpuBoostAshblazingAtkContainer(hitMulti, action)
    },
  }
}
