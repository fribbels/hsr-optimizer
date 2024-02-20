import { basic3, findContentId, skill5, talent5, ult3 } from 'lib/conditionals/utils'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants.ts'

const Acheron = (e: Eidolon): CharacterConditional => {
  const basicScaling = basic3(e, 1.00, 1.10)
  const skillScaling = skill5(e, 1.60, 1.76)

  const ultRainbladeScaling = ult3(e, 0.24, 0.2592)
  const ultCrimsonKnotScaling = ult3(e, 0.15, 0.162)
  const ultStygianResurgeScaling = ult3(e, 1.20, 1.296)
  const ultThunderCoreScaling = 0.25
  const talentResPen = talent5(e, 0.2, 0.22)

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
      content: `Crimson Knot stacks`,
      min: 0,
      max: maxCrimsonKnotStacks,
    },
    {
      formItem: 'slider',
      id: 'nihilityTeammates',
      name: 'nihilityTeammates',
      text: 'Nihility teammates',
      title: 'Nihility teammates',
      content: `Nihility teammates`,
      min: 0,
      max: maxNihilityTeammates,
    },
    {
      formItem: 'slider',
      id: 'thunderCoreStacks',
      name: 'thunderCoreStacks',
      text: 'Thunder core stacks',
      title: 'Thunder core stacks',
      content: `Thunder core stacks`,
      min: 0,
      max: 3,
    },
    {
      formItem: 'switch',
      id: 'e1EnemyDebuffed',
      name: 'e1EnemyDebuffed',
      text: 'E1 enemy debuffed',
      title: 'E1 enemy debuffed',
      content: `E1 enemy debuffed`,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4UltVulnerability',
      name: 'e4UltVulnerability',
      text: 'E4 ult vulnerability',
      title: 'E4 ult vulnerability',
      content: `E4 ult vulnerability`,
      disabled: e < 4,
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
      thunderCoreStacks: 3, // 0 -> 3
      e4UltVulnerability: true,
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
      x.ELEMENTAL_DMG += nihilityTeammateScaling[r.nihilityTeammates as number] // TODO: Is this elemental damage or a separate scaling?
      x.ULT_CD_BOOST += (e >= 6) ? 0.60 : 0

      x.BASIC_SCALING = basicScaling
      x.SKILL_SCALING = skillScaling
      x.ULT_SCALING += 3 * ultRainbladeScaling
      x.ULT_SCALING += ultCrimsonKnotScaling * (r.crimsonKnotStacks as number)
      x.ULT_SCALING += ultStygianResurgeScaling
      x.ULT_SCALING += 6 * ultThunderCoreScaling

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.ULT_VULNERABILITY += (e >= 4 && m.e4UltVulnerability) ? 0.12 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x']

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK] // TODO: E6 turns everything into an ult
    },
  }
}
Acheron.label = 'Acheron'

export default Acheron
