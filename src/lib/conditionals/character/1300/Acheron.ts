import { BASIC_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityResPen, buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Acheron')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)

  const ultRainbladeScaling = ult(e, 0.24, 0.2592)
  const ultCrimsonKnotScaling = ult(e, 0.15, 0.162)
  const ultStygianResurgeScaling = ult(e, 1.20, 1.296)
  const ultThunderCoreScaling = 0.25
  const talentResPen = talent(e, 0.2, 0.22)

  const maxCrimsonKnotStacks = 9
  const maxNihilityTeammates = (e >= 2) ? 1 : 2

  const nihilityTeammateScaling: NumberToNumberMap = {
    0: 0,
    1: (e >= 2) ? 0.60 : 0.15,
    2: 0.60,
  }

  const defaults = {
    crimsonKnotStacks: maxCrimsonKnotStacks,
    nihilityTeammates: maxNihilityTeammates,
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
    nihilityTeammates: {
      id: 'nihilityTeammates',
      formItem: 'slider',
      text: t('Content.nihilityTeammates.text'),
      content: t('Content.nihilityTeammates.content'),
      min: 0,
      max: maxNihilityTeammates,
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
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (e >= 6 && r.e6UltBuffs) {
        x.BASIC_DMG_TYPE.set(ULT_TYPE | BASIC_TYPE, Source.NONE)
        x.SKILL_DMG_TYPE.set(ULT_TYPE | SKILL_TYPE, Source.NONE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CR.buff((e >= 1 && r.e1EnemyDebuffed) ? 0.18 : 0, Source.NONE)

      x.ELEMENTAL_DMG.buff((r.thunderCoreStacks) * 0.30, Source.NONE)
      buffAbilityResPen(x, ULT_TYPE, talentResPen, Source.NONE)
      buffAbilityResPen(x, ULT_TYPE, (e >= 6 && r.e6UltBuffs) ? 0.20 : 0, Source.NONE)

      const originalDmgBoost = nihilityTeammateScaling[r.nihilityTeammates]
      x.BASIC_ORIGINAL_DMG_BOOST.buff(originalDmgBoost, Source.NONE)
      x.SKILL_ORIGINAL_DMG_BOOST.buff(originalDmgBoost, Source.NONE)
      x.ULT_ORIGINAL_DMG_BOOST.buff(originalDmgBoost, Source.NONE)

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      // Each ult is 3 rainblades, 3 base crimson knots, and then 1 crimson knot per stack, then 1 stygian resurge, and 6 thunder cores from trace
      x.ULT_SCALING.buff(3 * ultRainbladeScaling, Source.NONE)
      x.ULT_SCALING.buff(3 * ultCrimsonKnotScaling, Source.NONE)
      x.ULT_SCALING.buff(ultCrimsonKnotScaling * (r.crimsonKnotStacks), Source.NONE)
      x.ULT_SCALING.buff(ultStygianResurgeScaling, Source.NONE)
      x.ULT_SCALING.buff(r.stygianResurgeHitsOnTarget * ultThunderCoreScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(105, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, ULT_TYPE, (e >= 4 && m.e4UltVulnerability) ? 0.08 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
