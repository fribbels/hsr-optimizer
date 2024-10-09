import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants'
import { buffAbilityResPen, buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
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

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Acheron.Content')
    return [
      {
        formItem: 'slider',
        id: 'crimsonKnotStacks',
        name: 'crimsonKnotStacks',
        text: t('crimsonKnotStacks.text'),
        title: t('crimsonKnotStacks.title'),
        content: t('crimsonKnotStacks.content', { RainbladeScaling: TsUtils.precisionRound(100 * ultRainbladeScaling), CrimsonKnotScaling: TsUtils.precisionRound(100 * ultCrimsonKnotScaling) }),
        min: 0,
        max: maxCrimsonKnotStacks,
      },
      {
        formItem: 'slider',
        id: 'nihilityTeammates',
        name: 'nihilityTeammates',
        text: t('nihilityTeammates.text'),
        title: t('nihilityTeammates.title'),
        content: t('nihilityTeammates.content'),
        min: 0,
        max: maxNihilityTeammates,
      },
      {
        formItem: 'slider',
        id: 'thunderCoreStacks',
        name: 'thunderCoreStacks',
        text: t('thunderCoreStacks.text'),
        title: t('thunderCoreStacks.title'),
        content: t('thunderCoreStacks.content'),
        min: 0,
        max: 3,
      },
      {
        formItem: 'slider',
        id: 'stygianResurgeHitsOnTarget',
        name: 'stygianResurgeHitsOnTarget',
        text: t('stygianResurgeHitsOnTarget.text'),
        title: t('stygianResurgeHitsOnTarget.title'),
        content: t('stygianResurgeHitsOnTarget.content'),
        min: 0,
        max: 6,
      },
      {
        formItem: 'switch',
        id: 'e1EnemyDebuffed',
        name: 'e1EnemyDebuffed',
        text: t('e1EnemyDebuffed.text'),
        title: t('e1EnemyDebuffed.title'),
        content: t('e1EnemyDebuffed.content'),
        disabled: e < 1,
      },
      {
        formItem: 'switch',
        id: 'e4UltVulnerability',
        name: 'e4UltVulnerability',
        text: t('e4UltVulnerability.text'),
        title: t('e4UltVulnerability.title'),
        content: t('e4UltVulnerability.content'),
        disabled: e < 4,
      },
      {
        formItem: 'switch',
        id: 'e6UltBuffs',
        name: 'e6UltBuffs',
        text: t('e6UltBuffs.text'),
        title: t('e6UltBuffs.title'),
        content: t('e6UltBuffs.content'),
        disabled: e < 6,
      },
    ]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'e4UltVulnerability'),
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      crimsonKnotStacks: maxCrimsonKnotStacks,
      nihilityTeammates: maxNihilityTeammates,
      e1EnemyDebuffed: true,
      thunderCoreStacks: 3,
      stygianResurgeHitsOnTarget: 6,
      e4UltVulnerability: true,
      e6UltBuffs: true,
    }),
    teammateDefaults: () => ({
      e4UltVulnerability: true,
    }),
    initializeConfigurations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      if (e >= 6 && r.e6UltBuffs) {
        x.BASIC_DMG_TYPE = ULT_TYPE | BASIC_TYPE
        x.SKILL_DMG_TYPE = ULT_TYPE | SKILL_TYPE
      }
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.CR] += (e >= 1 && r.e1EnemyDebuffed) ? 0.18 : 0

      x.ELEMENTAL_DMG += (r.thunderCoreStacks) * 0.30
      buffAbilityResPen(x, ULT_TYPE, talentResPen)
      buffAbilityResPen(x, ULT_TYPE, 0.20, (e >= 6 && r.e6UltBuffs))

      const originalDmgBoost = nihilityTeammateScaling[r.nihilityTeammates]
      x.BASIC_ORIGINAL_DMG_BOOST += originalDmgBoost
      x.SKILL_ORIGINAL_DMG_BOOST += originalDmgBoost
      x.ULT_ORIGINAL_DMG_BOOST += originalDmgBoost

      x.BASIC_SCALING = basicScaling
      x.SKILL_SCALING = skillScaling
      // Each ult is 3 rainblades, 3 base crimson knots, and then 1 crimson knot per stack, then 1 stygian resurge, and 6 thunder cores from trace
      x.ULT_SCALING += 3 * ultRainbladeScaling
      x.ULT_SCALING += 3 * ultCrimsonKnotScaling
      x.ULT_SCALING += ultCrimsonKnotScaling * (r.crimsonKnotStacks)
      x.ULT_SCALING += ultStygianResurgeScaling
      x.ULT_SCALING += r.stygianResurgeHitsOnTarget * ultThunderCoreScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 105

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, ULT_TYPE, 0.08, (e >= 4 && m.e4UltVulnerability))
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
