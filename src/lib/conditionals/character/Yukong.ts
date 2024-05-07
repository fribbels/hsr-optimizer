import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'
import { Stats } from 'lib/constants'
import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillAtkBuffValue = skill(e, 0.80, 0.88)
  const ultCdBuffValue = skill(e, 0.65, 0.702)
  const ultCrBuffValue = skill(e, 0.28, 0.294)
  const talentAtkScaling = talent(e, 0.80, 0.88)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 3.80, 4.104)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'teamImaginaryDmgBoost',
    name: 'teamImaginaryDmgBoost',
    text: 'Team Imaginary DMG boost',
    title: `Trace: Bowmaster`,
    content: `When Yukong is on the field, Imaginary DMG dealt by all allies increases by 12%.`,
  }, {
    formItem: 'switch',
    id: 'roaringBowstringsActive',
    name: 'roaringBowstringsActive',
    text: 'Roaring Bowstrings',
    title: `Roaring Bowstrings`,
    content: `When "Roaring Bowstrings" is active, the ATK of all allies increases by ${precisionRound(skillAtkBuffValue * 100)}%.
    ::BR::
    E4: When "Roaring Bowstrings" is active, Yukong deals 30% more DMG to enemies.`,
  }, {
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult CR/CD buffs',
    title: `Ult: Diving Kestrel`,
    content: `If "Roaring Bowstrings" is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by ${precisionRound(ultCrBuffValue * 100)}% and CRIT DMG by ${precisionRound(ultCdBuffValue * 100)}%. At the same time, deals Imaginary DMG equal to ${precisionRound(ultScaling * 100)}% of Yukong's ATK to a single enemy.`,
  }, {
    formItem: 'switch',
    id: 'initialSpeedBuff',
    name: 'initialSpeedBuff',
    text: 'E1 Initial SPD buff',
    title: 'E1 Initial SPD buff',
    content: `E1: At the start of battle, increases the SPD of all allies by 10% for 2 turn(s).`,
    disabled: e < 1,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'teamImaginaryDmgBoost'),
    findContentId(content, 'roaringBowstringsActive'),
    findContentId(content, 'ultBuff'),
    findContentId(content, 'initialSpeedBuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      teamImaginaryDmgBoost: true,
      roaringBowstringsActive: true,
      ultBuff: true,
      initialSpeedBuff: true,
    }),
    teammateDefaults: () => ({
      teamImaginaryDmgBoost: true,
      roaringBowstringsActive: true,
      ultBuff: true,
      initialSpeedBuff: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.BASIC_SCALING += talentAtkScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += (e >= 4 && r.roaringBowstringsActive) ? 0.30 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 90

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.ATK_P] += (m.roaringBowstringsActive) ? skillAtkBuffValue : 0
      x[Stats.CR] += (m.ultBuff && m.roaringBowstringsActive) ? ultCrBuffValue : 0
      x[Stats.CD] += (m.ultBuff && m.roaringBowstringsActive) ? ultCdBuffValue : 0
      x[Stats.SPD_P] += (e >= 1 && m.initialSpeedBuff) ? 0.10 : 0

      x[Stats.Imaginary_DMG] += (m.teamImaginaryDmgBoost) ? 0.12 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
