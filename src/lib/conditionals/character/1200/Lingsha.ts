import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
  BREAK_DMG_TYPE,
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
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
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

export const LingshaEntities = createEnum('Lingsha', 'Fuyuan')
export const LingshaAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK', 'SKILL_HEAL', 'ULT_HEAL', 'FUA_HEAL')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lingsha')
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
  } = Source.character('1222')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.80, 0.88)
  const ultScaling = ult(e, 1.50, 1.65)
  const ultBreakVulnerability = ult(e, 0.25, 0.27)
  const fuaScaling = talent(e, 0.75, 0.825)

  const skillHealScaling = skill(e, 0.14, 0.148)
  const skillHealFlat = skill(e, 420, 467.25)

  const ultHealScaling = ult(e, 0.12, 0.128)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.12, 0.128)
  const talentHealFlat = talent(e, 360, 400.5)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 2 + 3 * 1 / 2),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 2 + 4 * 1 / 2),
  }

  const defaults = {
    beConversion: true,
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    beConversion: {
      id: 'beConversion',
      formItem: 'switch',
      text: t('Content.beConversion.text'),
      content: t('Content.beConversion.content'),
    },
    befogState: {
      id: 'befogState',
      formItem: 'switch',
      text: t('Content.befogState.text'),
      content: t('Content.befogState.content', {
        BefogVulnerability: TsUtils.precisionRound(100 * ultBreakVulnerability),
      }),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e2BeBuff: {
      id: 'e2BeBuff',
      formItem: 'switch',
      text: t('Content.e2BeBuff.text'),
      content: t('Content.e2BeBuff.content'),
      disabled: e < 2,
    },
    e6ResShred: {
      id: 'e6ResShred',
      formItem: 'switch',
      text: t('Content.e6ResShred.text'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    befogState: content.befogState,
    e1DefShred: content.e1DefShred,
    e2BeBuff: content.e2BeBuff,
    e6ResShred: content.e6ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(LingshaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [LingshaEntities.Lingsha]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
      [LingshaEntities.Fuyuan]: {
        primary: false,
        summon: true,
        memosprite: false,
        pet: true,
      },
    }),

    actionDeclaration: () => Object.values(LingshaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [LingshaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [LingshaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .atkScaling(skillScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [LingshaAbilities.SKILL_HEAL]: {
          hits: [
            HitDefinitionBuilder.skillHeal()
              .atkScaling(skillHealScaling)
              .flatHeal(skillHealFlat)
              .build(),
          ],
        },
        [LingshaAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [LingshaAbilities.ULT_HEAL]: {
          hits: [
            HitDefinitionBuilder.ultHeal()
              .atkScaling(ultHealScaling)
              .flatHeal(ultHealFlat)
              .build(),
          ],
        },
        [LingshaAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .sourceEntity(LingshaEntities.Fuyuan)
              .damageElement(ElementTag.Fire)
              .atkScaling(fuaScaling * 2 + ((e >= 6 && r.e6ResShred) ? 0.50 : 0))
              .toughnessDmg(10 * 2 + ((e >= 6) ? 5 : 0))
              .build(),
          ],
        },
        [LingshaAbilities.FUA_HEAL]: {
          hits: [
            HitDefinitionBuilder.talentHeal()
              .atkScaling(talentHealScaling)
              .flatHeal(talentHealFlat)
              .build(),
          ],
        },
        [LingshaAbilities.BREAK]: {
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
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (e >= 1) ? 0.50 : 0, x.source(SOURCE_E1))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // E1 DEF shred when enemy is weakness broken
      const isWeaknessBroken = x.getSelfValue(StatKey.ENEMY_WEAKNESS_BROKEN)
      x.buff(StatKey.DEF_PEN, (e >= 1 && m.e1DefShred && isWeaknessBroken) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))

      x.buff(StatKey.VULNERABILITY, (m.befogState) ? ultBreakVulnerability : 0, x.damageType(DamageTag.BREAK).targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.BE, (e >= 2 && m.e2BeBuff) ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
      x.buff(StatKey.RES_PEN, (e >= 6 && m.e6ResShred) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMultiByTargets[context.enemyCount])
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMultiByTargets[context.enemyCount], action)
    },

    dynamicConditionals: [
      {
        id: 'LingshaAtkConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.BE],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.beConversion
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.BE,
            Stats.ATK,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => Math.min(0.50, 0.25 * convertibleValue) * context.baseATK,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.BE,
            Stats.ATK,
            this,
            action,
            context,
            `min(0.50, 0.25 * convertibleValue) * baseATK`,
            `${wgslTrue(r.beConversion)}`,
          )
        },
      },
      {
        id: 'LingshaOhbConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.BE],
        chainsTo: [Stats.OHB],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.beConversion
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.BE,
            Stats.OHB,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => Math.min(0.20, 0.10 * convertibleValue),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.BE,
            Stats.OHB,
            this,
            action,
            context,
            `min(0.20, 0.10 * convertibleValue)`,
            `${wgslTrue(r.beConversion)}`,
          )
        },
      },
    ],
  }
}
