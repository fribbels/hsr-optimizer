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
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'

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

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0, x.target(TopazEntities.Numby).source(SOURCE_ULT))
      x.buff(StatKey.RES_PEN, (e >= 6) ? 0.10 : 0, x.target(TopazEntities.Numby).source(SOURCE_E6))

      x.buff(StatKey.DMG_BOOST, (context.enemyElementalWeak) ? 0.15 : 0, x.source(SOURCE_TRACE))
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

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = action.actionType === AbilityKind.BASIC
        ? basicHitCountMulti
        : (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      boostAshblazingAtkContainer(x, action, hitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = action.actionType === AbilityKind.BASIC
        ? basicHitCountMulti
        : (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      return gpuBoostAshblazingAtkContainer(hitMulti, action)
    },
  }
}
