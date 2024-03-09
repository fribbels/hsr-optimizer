import { AbilityEidolon, findContentId } from 'lib/conditionals/utils'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants.ts'

const betaUpdate = 'All calculations are subject to change. Last updated 03-08-2024.'

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
      title: 'Crimson Knot stacks',
      content: betaUpdate,
      min: 0,
      max: maxCrimsonKnotStacks,
    },
    {
      formItem: 'slider',
      id: 'nihilityTeammates',
      name: 'nihilityTeammates',
      text: 'Nihility teammates separate multiplier',
      title: 'Nihility teammates separate multiplier',
      content: betaUpdate,
      min: 0,
      max: maxNihilityTeammates,
    },
    {
      formItem: 'slider',
      id: 'thunderCoreStacks',
      name: 'thunderCoreStacks',
      text: 'Thunder core stacks',
      title: 'Thunder core stacks',
      content: betaUpdate,
      min: 0,
      max: 3,
    },
    {
      formItem: 'switch',
      id: 'e1EnemyDebuffed',
      name: 'e1EnemyDebuffed',
      text: 'E1 enemy debuffed',
      title: 'E1 enemy debuffed',
      content: betaUpdate,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4UltVulnerability',
      name: 'e4UltVulnerability',
      text: 'E4 ult vulnerability',
      title: 'E4 ult vulnerability',
      content: betaUpdate,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6UltBuffs',
      name: 'e6UltBuffs',
      text: 'E6 ult buffs',
      title: 'E6 ult buffs',
      content: betaUpdate,
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
      e4UltVulnerability: true,
      e6UltBuffs: true,
    }),
    teammateDefaults: () => ({
      e4UltVulnerability: true,
    }),

    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.CR] += (e >= 1 && r.e1EnemyDebuffed) ? 0.18 : 0

      x.ULT_RES_PEN += talentResPen
      x.ELEMENTAL_DMG += (r.thunderCoreStacks as number) * 0.30
      x.ULT_RES_PEN += (e >= 6 && r.e6UltBuffs) ? 0.20 : 0
      x.ORIGINAL_DMG_BOOST += nihilityTeammateScaling[r.nihilityTeammates as number] // TODO: Is this elemental damage or a separate scaling?

      x.BASIC_SCALING = basicScaling
      x.SKILL_SCALING = skillScaling
      // Each ult is 3 rainblades, 3 base crimson knots, and then 1 crimson knot per stack, then 1 stygian resurge, and 6 thunder cores from trace
      x.ULT_SCALING += 3 * ultRainbladeScaling
      x.ULT_SCALING += 3 * ultCrimsonKnotScaling
      x.ULT_SCALING += ultCrimsonKnotScaling * (r.crimsonKnotStacks as number)
      x.ULT_SCALING += ultStygianResurgeScaling
      x.ULT_SCALING += 6 * ultThunderCoreScaling

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.ULT_VULNERABILITY += (e >= 4 && m.e4UltVulnerability) ? 0.08 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x']

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
