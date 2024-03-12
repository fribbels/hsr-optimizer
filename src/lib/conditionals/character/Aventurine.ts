import { AbilityEidolon, findContentId } from 'lib/conditionals/utils'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants.ts'

const betaUpdate = 'All calculations are subject to change. Last updated 03-03-2024.'

// 3-ult basic
// 5-skill talent
const Aventurine = (e: Eidolon): CharacterConditional => {
  const { basic, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.70, 2.916)
  const ultCdScaling = ult(e, 0.15, 0.162)

  const talentDmgScaling = talent(e, 0.25, 0.275)
  const talentResScaling = talent(e, 0.50, 0.55)

  const fuaHits = (e >= 4) ? 8 : 7

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'defToCrBoost',
      name: 'defToCrBoost',
      text: 'DEF to CR boost',
      title: 'DEF to CR boost',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'fortifiedWagerBuff',
      name: 'fortifiedWagerBuff',
      text: 'Fortified Wager buff',
      title: 'Fortified Wager buff',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'enemyUnnervedDebuff',
      name: 'enemyUnnervedDebuff',
      text: 'Enemy Unnerved debuff',
      title: 'Enemy Unnerved debuff',
      content: betaUpdate,
    },
    {
      formItem: 'slider',
      id: 'fuaHitsOnTarget',
      name: 'fuaHitsOnTarget',
      text: 'FUA hits on target',
      title: 'FUA hits on target',
      content: betaUpdate,
      min: 0,
      max: fuaHits,
    },
    {
      formItem: 'switch',
      id: 'e2ResShred',
      name: 'e2ResShred',
      text: 'E2 RES shred',
      title: 'E2 RES shred',
      content: betaUpdate,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4DefBuff',
      name: 'e4DefBuff',
      text: 'E4 DEF buff',
      title: 'E4 DEF buff',
      content: betaUpdate,
      disabled: e < 4,
    },
    {
      formItem: 'slider',
      id: 'e6ShieldStacks',
      name: 'e6ShieldStacks',
      text: 'E6 shield stacks',
      title: 'E6 shield stacks',
      content: betaUpdate,
      min: 0,
      max: 4,
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
      e6ShieldStacks: 4,
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

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.CD] += (m.enemyUnnervedDebuff) ? ultCdScaling : 0
      x[Stats.CD] += (e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0
      x[Stats.RES] += (m.fortifiedWagerBuff) ? talentResScaling : 0
      x.RES_PEN += (e >= 2 && m.e2ResShred) ? 0.12 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x']

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.DEF]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.DEF]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.DEF]
      x.FUA_DMG += x.FUA_SCALING * x[Stats.DEF]

      x[Stats.CR] += (r.defToCrBoost && x[Stats.DEF] > 1600) ? Math.min(0.48, 0.02 * Math.floor((x[Stats.DEF] - 1600) / 100)) : 0
    },
  }
}
Aventurine.label = 'Aventurine'

export default Aventurine
