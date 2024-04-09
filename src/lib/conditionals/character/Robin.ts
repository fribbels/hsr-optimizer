import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

const betaUpdate = 'All calculations are subject to change. Last updated 04-08-2024.'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_ULT_3_BASIC_TALENT_5

  const skillDmgBuffValue = skill(e, 0.50, 0.55)
  const talentCdBuffValue = talent(e, 0.20, 0.23)
  const ultAtkBuffScalingValue = ult(e, 0.228, 0.2432)
  const ultAtkBuffFlatValue = ult(e, 200, 230)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 1.20, 1.296)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'concertoActive',
      name: 'concertoActive',
      text: 'Concerto active',
      title: 'Concerto active',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'skillDmgBuff',
      name: 'skillDmgBuff',
      text: 'Skill DMG buff',
      title: 'Skill DMG buff',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'talentCdBuff',
      name: 'talentCdBuff',
      text: 'Talent CD buff',
      title: 'Talent CD buff',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'e4TeamResBuff',
      name: 'e4TeamResBuff',
      text: 'E4 RES team buff',
      title: 'E4 RES team buff',
      content: betaUpdate,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6UltCDBoost',
      name: 'e6UltCDBoost',
      text: 'E6 Ult DMG CD boost',
      title: 'E6 Ult DMG CD boost',
      content: betaUpdate,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'concertoActive'),
    findContentId(content, 'skillDmgBuff'),
    {
      formItem: 'slider',
      id: 'teammateATKValue',
      name: 'teammateATKValue',
      text: `Ult buff Robin's ATK`,
      title: 'Ult buff Robin\'s ATK',
      content: betaUpdate,
      min: 0,
      max: 5000,
    },
    findContentId(content, 'talentCdBuff'),
    {
      formItem: 'switch',
      id: 'talentFuaCdBoost',
      name: 'talentFuaCdBoost',
      text: 'FUA Crit DMG boost',
      title: 'FUA Crit DMG boost',
      content: betaUpdate,
    },
    {
      formItem: 'slider',
      id: 'e1UltResPenStacks',
      name: 'e1UltResPenStacks',
      text: 'E1 Ult RES PEN stacks',
      title: 'E1 Ult RES PEN stacks',
      content: betaUpdate,
      disabled: e < 1,
      min: 0,
      max: 2,
    },
  ]

  const defaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    e4TeamResBuff: false,
    e6UltCDBoost: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      concertoActive: true,
      skillDmgBuff: true,
      talentCdBuff: true,
      teammateATKValue: 4000,
      talentFuaCdBoost: true,
      e1UltResPenStacks: 2,
      e4TeamResBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += (r.concertoActive) ? ultScaling : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.CD] += (m.talentCdBuff) ? talentCdBuffValue : 0
      x[Stats.CD] += (e >= 2 && m.talentCdBuff) ? 0.20 : 0
      x[Stats.RES] += (e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0

      x.ELEMENTAL_DMG += (m.skillDmgBuff) ? skillDmgBuffValue : 0
      x.FUA_CD_BOOST += (m.concertoActive) ? 0.10 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.ATK] += (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0

      x.FUA_CD_BOOST += (t.talentFuaCdBoost) ? 0.10 : 0

      x.RES_PEN += (e >= 1 && t.concertoActive) ? 0.12 * t.e1UltResPenStacks : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      x[Stats.ATK] += (r.concertoActive) ? x[Stats.ATK] * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0

      x.ULT_CR_BOOST += 1.00
      x.ULT_CD_OVERRIDE = (e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
