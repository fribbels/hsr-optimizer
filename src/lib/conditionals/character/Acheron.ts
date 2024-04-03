import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants.ts'

const Acheron = (e: Eidolon): CharacterConditional => {
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

  const nihilityTeammateScaling = {
    0: 0,
    1: (e >= 2) ? 0.60 : 0.15,
    2: 0.60,
  }

  const content: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'crimsonKnotStacks',
      name: 'crimsonKnotStacks',
      text: `Crimson Knot stacks`,
      title: 'Slashed Dream Cries in Red',
      content: `
      Rainblade: Deals Lightning DMG equal to ${precisionRound(ultRainbladeScaling * 100)}% of Acheron's ATK to a single target enemy and removes up to 3 stacks of Crimson Knot from the target. When Crimson Knot is removed, immediately deals Lightning DMG equal to ${precisionRound(ultCrimsonKnotScaling * 100)}% of Acheron's ATK to all enemies. For every stack of Crimson Knot removed, the DMG Multiplier for this is additionally increased.
      ::BR::
      When the Rainblade from Acheron's Ultimate hits enemy targets with Crimson Knot, her DMG increases by 30%, stacking up to 3 time(s).
      `,
      min: 0,
      max: maxCrimsonKnotStacks,
    },
    {
      formItem: 'slider',
      id: 'nihilityTeammates',
      name: 'nihilityTeammates',
      text: 'Nihility teammates',
      title: 'The Abyss',
      content: `When there are 1 or 2 Nihility characters other than Acheron in the team, the DMG dealt by Acheron's Basic ATK, Skill, and Ultimate increases to 115% or 160% of the original DMG respectively.
      ::BR::
      E2: The number of Nihility characters required for the Trace "The Abyss" to achieve its highest possible effect is reduced by 1. When this unit's turn starts, gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on the enemy with the most Crimson Knot stacks.
      `,
      min: 0,
      max: maxNihilityTeammates,
    },
    {
      formItem: 'slider',
      id: 'thunderCoreStacks',
      name: 'thunderCoreStacks',
      text: 'Thunder Core stacks',
      title: 'Thunder Core',
      content: 'When the Rainblade from Acheron\'s Ultimate hits enemy targets with Crimson Knot, her DMG increases by 30%, stacking up to 3 time(s) and lasting for 3 turn(s).',
      min: 0,
      max: 3,
    },
    {
      formItem: 'slider',
      id: 'stygianResurgeHitsOnTarget',
      name: 'stygianResurgeHitsOnTarget',
      text: 'Stygian Resurge hits',
      title: 'Thunder Core',
      content: `When Stygian Resurge triggers, additionally deals DMG for 6 times. Each time deals Lightning DMG equal to 25% of Acheron's ATK to a single random enemy and is viewed as part of the Ultimate DMG.`,
      min: 0,
      max: 6,
    },
    {
      formItem: 'switch',
      id: 'e1EnemyDebuffed',
      name: 'e1EnemyDebuffed',
      text: 'E1 CR boost',
      title: 'E1: Silenced Sky Spake Sooth',
      content: 'When dealing DMG to debuffed enemies, increases the CRIT Rate by 18%.',
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4UltVulnerability',
      name: 'e4UltVulnerability',
      text: 'E4 ult vulnerability',
      title: 'E4: Shrined Fire for Mirrored Soul',
      content: `
      When enemy targets enter combat, inflicts them with the Ultimate DMG Vulnerability, increasing the amount of Ultimate DMG they take by 8%.
      `,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6UltBuffs',
      name: 'e6UltBuffs',
      text: 'E6 ult buffs',
      title: 'E6: Apocalypse, the Emancipator',
      content: `
      Increases the All-Type RES PEN for the Ultimate DMG dealt by Acheron by 20%. The DMG dealt by Basic ATK and Skill will also be considered as Ultimate DMG and can reduce enemy toughness regardless of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect.
      `,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'e4UltVulnerability'),
  ]

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

    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = Object.assign({}, baseComputedStatsObject)

      x[Stats.CR] += (e >= 1 && r.e1EnemyDebuffed) ? 0.18 : 0

      x.ULT_RES_PEN += talentResPen
      x.ELEMENTAL_DMG += (r.thunderCoreStacks) * 0.30
      x.ULT_RES_PEN += (e >= 6 && r.e6UltBuffs) ? 0.20 : 0

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

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.ULT_VULNERABILITY += (e >= 4 && m.e4UltVulnerability) ? 0.08 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      if (e >= 6 && r.e6UltBuffs) {
        x.BASIC_BOOST += x.ULT_BOOST
        x.BASIC_CD_BOOST += x.ULT_CD_BOOST
        x.BASIC_CR_BOOST += x.ULT_CR_BOOST
        x.BASIC_VULNERABILITY = x.ULT_VULNERABILITY
        x.BASIC_DEF_PEN = x.ULT_DEF_PEN
        x.BASIC_RES_PEN = x.ULT_RES_PEN

        x.SKILL_BOOST += x.ULT_BOOST
        x.SKILL_CD_BOOST += x.ULT_CD_BOOST
        x.SKILL_CR_BOOST += x.ULT_CR_BOOST
        x.SKILL_VULNERABILITY = x.ULT_VULNERABILITY
        x.SKILL_DEF_PEN = x.ULT_DEF_PEN
        x.SKILL_RES_PEN = x.ULT_RES_PEN
      }
    },
  }
}
Acheron.label = 'Acheron'

export default Acheron
