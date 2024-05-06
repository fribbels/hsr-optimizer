import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants.ts'

const Aventurine = (e: Eidolon): CharacterConditional => {
  const { basic, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.70, 2.916)
  const ultCritVulnerability = ult(e, 0.15, 0.162)

  const talentDmgScaling = talent(e, 0.25, 0.275)
  const talentResScaling = talent(e, 0.50, 0.55)

  const fuaHits = (e >= 4) ? 10 : 7

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'defToCrBoost',
      name: 'defToCrBoost',
      text: 'DEF to CR boost',
      title: 'Leverage',
      content: `For every 100 of Aventurine's DEF that exceeds 1600, increases his own CRIT Rate by 2%, up to a maximum increase of 48%.`,
    },
    {
      formItem: 'switch',
      id: 'fortifiedWagerBuff',
      name: 'fortifiedWagerBuff',
      text: 'Fortified Wager buff',
      title: 'Cornerstone Deluxe',
      content: `For any single ally with Fortified Wager, their Effect RES increases by ${precisionRound(talentResScaling * 100)}%, and when they get attacked, Aventurine gains 1 point of Blind Bet.
      ::BR::
      E1: Increases CRIT DMG by 20% for allies with Fortified Wager. After using the Ultimate, provides all allies with a Fortified Wager shield, whose Shield effect is equal to 100% of the one provided by the Skill, lasting for 3 turn(s).`,
    },
    {
      formItem: 'switch',
      id: 'enemyUnnervedDebuff',
      name: 'enemyUnnervedDebuff',
      text: 'Enemy Unnerved',
      title: 'Roulette Shark',
      content: `When an ally hits an Unnerved enemy target, the CRIT DMG dealt increases by ${precisionRound(ultCritVulnerability * 100)}%.`,
    },
    {
      formItem: 'slider',
      id: 'fuaHitsOnTarget',
      name: 'fuaHitsOnTarget',
      text: 'FUA hits on target',
      title: 'Bingo!',
      content: `Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a 7-hit follow-up attack, with each hit dealing Imaginary DMG equal to ${precisionRound(talentDmgScaling * 100)}% of Aventurine's DEF to a single random enemy. Blind Bet is capped at 10 points.
      ::BR::
      E4: When triggering his Talent's follow-up attack, first increases Aventurine's DEF by 40% for 2 turn(s), and additionally increases the Hits Per Action for his talent's follow-up attack by 3.`,
      min: 0,
      max: fuaHits,
    },
    {
      formItem: 'switch',
      id: 'e2ResShred',
      name: 'e2ResShred',
      text: 'E2 RES shred',
      title: 'E2: Bounded Rationality',
      content: `E2: When using the Basic ATK, reduces the target's All-Type RES by 12% for 3 turn(s).`,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4DefBuff',
      name: 'e4DefBuff',
      text: 'E4 DEF buff',
      title: 'E4: Unexpected Hanging Paradox',
      content: `E4: When triggering his Talent's follow-up attack, first increases Aventurine's DEF by 40% for 2 turn(s)`,
      disabled: e < 4,
    },
    {
      formItem: 'slider',
      id: 'e6ShieldStacks',
      name: 'e6ShieldStacks',
      text: 'E6 shield stacks',
      title: 'E6: Stag Hunt Game',
      content: `E6: For every ally that holds a Shield, the DMG dealt by Aventurine increases by 50%, up to a maximum of 150%.`,
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'fortifiedWagerBuff'),
    findContentId(content, 'enemyUnnervedDebuff'),
    findContentId(content, 'e2ResShred'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      defToCrBoost: true,
      fuaHitsOnTarget: fuaHits,
      fortifiedWagerBuff: true,
      enemyUnnervedDebuff: true,
      e2ResShred: true,
      e4DefBuff: true,
      e6ShieldStacks: 3,
    }),
    teammateDefaults: () => ({
      fortifiedWagerBuff: true,
      enemyUnnervedDebuff: true,
      e2ResShred: true,
    }),

    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.DEF_P] += (e >= 4 && r.e4DefBuff) ? 0.40 : 0
      x.ELEMENTAL_DMG += (e >= 6) ? Math.min(1.50, 0.50 * r.e6ShieldStacks) : 0

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += talentDmgScaling * r.fuaHitsOnTarget

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 10 * r.fuaHitsOnTarget

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.CD] += (e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0
      x[Stats.RES] += (m.fortifiedWagerBuff) ? talentResScaling : 0
      x.RES_PEN += (e >= 2 && m.e2ResShred) ? 0.12 : 0
      x.CRIT_VULNERABILITY += (m.enemyUnnervedDebuff) ? ultCritVulnerability : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.DEF]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.DEF]
      x.FUA_DMG += x.FUA_SCALING * x[Stats.DEF]

      x[Stats.CR] += (r.defToCrBoost && x[Stats.DEF] > 1600) ? Math.min(0.48, 0.02 * Math.floor((x[Stats.DEF] - 1600) / 100)) : 0
    },
  }
}
Aventurine.label = 'Aventurine'

export default Aventurine
