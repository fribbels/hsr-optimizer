import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamPath,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { PathNames } from 'lib/constants/constants'
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

export const AcheronEntities = createEnum('Acheron')
export const AcheronAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Acheron')
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
  } = Source.character('1308')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)

  const ultRainbladeScaling = ult(e, 0.24, 0.2592)
  const ultCrimsonKnotScaling = ult(e, 0.15, 0.162)
  const ultStygianResurgeScaling = ult(e, 1.20, 1.296)
  const ultThunderCoreScaling = 0.25
  const talentResPen = talent(e, 0.2, 0.22)

  const maxCrimsonKnotStacks = 9

  const nihilityTeammateScaling: Record<number, number> = {
    0: 0,
    1: (e >= 2) ? 0.60 : 0.15,
    2: 0.60,
    3: 0.60,
    4: 0.60,
  }

  const defaults = {
    crimsonKnotStacks: maxCrimsonKnotStacks,
    nihilityTeammatesBuff: true,
    e1EnemyDebuffed: true,
    thunderCoreStacks: 3,
    stygianResurgeHitsOnTarget: 6,
    e4UltVulnerability: true,
    e6UltBuffs: true,
  }

  const teammateDefaults = {
    e4UltVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    crimsonKnotStacks: {
      id: 'crimsonKnotStacks',
      formItem: 'slider',
      text: t('Content.crimsonKnotStacks.text'),
      content: t('Content.crimsonKnotStacks.content', {
        RainbladeScaling: TsUtils.precisionRound(100 * ultRainbladeScaling),
        CrimsonKnotScaling: TsUtils.precisionRound(100 * ultCrimsonKnotScaling),
      }),
      min: 0,
      max: maxCrimsonKnotStacks,
    },
    nihilityTeammatesBuff: {
      id: 'nihilityTeammatesBuff',
      formItem: 'switch',
      text: t('Content.nihilityTeammatesBuff.text'),
      content: t('Content.nihilityTeammatesBuff.content'),
    },
    thunderCoreStacks: {
      id: 'thunderCoreStacks',
      formItem: 'slider',
      text: t('Content.thunderCoreStacks.text'),
      content: t('Content.thunderCoreStacks.content'),
      min: 0,
      max: 3,
    },
    stygianResurgeHitsOnTarget: {
      id: 'stygianResurgeHitsOnTarget',
      formItem: 'slider',
      text: t('Content.stygianResurgeHitsOnTarget.text'),
      content: t('Content.stygianResurgeHitsOnTarget.content'),
      min: 0,
      max: 6,
    },
    e1EnemyDebuffed: {
      id: 'e1EnemyDebuffed',
      formItem: 'switch',
      text: t('Content.e1EnemyDebuffed.text'),
      content: t('Content.e1EnemyDebuffed.content'),
      disabled: e < 1,
    },
    e4UltVulnerability: {
      id: 'e4UltVulnerability',
      formItem: 'switch',
      text: t('Content.e4UltVulnerability.text'),
      content: t('Content.e4UltVulnerability.content'),
      disabled: e < 4,
    },
    e6UltBuffs: {
      id: 'e6UltBuffs',
      formItem: 'switch',
      text: t('Content.e6UltBuffs.text'),
      content: t('Content.e6UltBuffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4UltVulnerability: content.e4UltVulnerability,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AcheronEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AcheronEntities.Acheron]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(AcheronAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Each ult is 3 rainblades, 3 base crimson knots, and then 1 crimson knot per stack, then 1 stygian resurge, and thunder cores from trace
      const ultAtkScaling = 3 * ultRainbladeScaling
        + 3 * ultCrimsonKnotScaling
        + ultCrimsonKnotScaling * r.crimsonKnotStacks
        + ultStygianResurgeScaling
        + r.stygianResurgeHitsOnTarget * ultThunderCoreScaling

      // E6: Basic and Skill also count as ULT damage type
      const e6Active = e >= 6 && r.e6UltBuffs

      return {
        [AcheronAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageType(e6Active ? DamageTag.BASIC | DamageTag.ULT : DamageTag.BASIC)
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AcheronAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageType(e6Active ? DamageTag.SKILL | DamageTag.ULT : DamageTag.SKILL)
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AcheronAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultAtkScaling)
              .toughnessDmg(35)
              .build(),
          ],
        },
        [AcheronAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR_BOOST, (e >= 1 && r.e1EnemyDebuffed) ? 0.18 : 0, x.source(SOURCE_E1))

      x.buff(StatKey.DMG_BOOST, r.thunderCoreStacks * 0.30, x.source(SOURCE_TRACE))
      x.buff(StatKey.RES_PEN, talentResPen, x.damageType(DamageTag.ULT).source(SOURCE_TALENT))
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6UltBuffs) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E6))

      const originalDmgBoost = r.nihilityTeammatesBuff
        ? nihilityTeammateScaling[countTeamPath(context, PathNames.Nihility) - 1]
        : 0
      x.buff(StatKey.FINAL_DMG_BOOST, originalDmgBoost, x.damageType(DamageTag.BASIC | DamageTag.SKILL | DamageTag.ULT).source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (e >= 4 && m.e4UltVulnerability) ? 0.08 : 0, x.damageType(DamageTag.ULT).targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
