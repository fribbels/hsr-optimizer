import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { AbilityEidolon, findContentId } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

const betaUpdate = 'All calculations are subject to change. Last updated 03-26-2024.'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_ULT_3_BASIC_TALENT_5

  const skillDmgBuffValue = skill(e, 0.50, 0.55)
  const talentCdBuffValue = talent(e, 0.20, 0.23)
  const ultAtkBuffScalingValue = ult(e, 0.228, 0.2432)
  const ultAtkBuffFlatValue = ult(e, 200, 230)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = basic(e, 1.20, 1.296)

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
      id: 'e1UltScalingBoost',
      name: 'e1UltScalingBoost',
      text: 'E1 Ult scaling boost',
      title: 'E1 Ult scaling boost',
      content: betaUpdate,
      disabled: e < 1,
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
      id: 'e6Buffs',
      name: 'e6Buffs',
      text: 'E6 buffs',
      title: 'E6 buffs',
      content: betaUpdate,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'concertoActive'),
    findContentId(content, 'skillDmgBuff'),
    findContentId(content, 'talentCdBuff'),
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
    {
      formItem: 'switch',
      id: 'talentFuaCdBoost',
      name: 'talentFuaCdBoost',
      text: 'FUA CD boost',
      title: 'FUA CD boost',
      content: betaUpdate,
    },
    {
      formItem: 'slider',
      id: 'e1OrnamentStacks',
      name: 'e1OrnamentStacks',
      text: 'E1 Ornament SPD stacks',
      title: 'E1 Ornament SPD stacks',
      content: betaUpdate,
      min: 0,
      max: 2,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e6ResShredBuff',
      name: 'e6ResShredBuff',
      text: 'E6 RES shred buff',
      title: 'E6 E6 RES shred buff',
      content: betaUpdate,
      disabled: e < 6,
    },
  ]

  const defaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    e1UltScalingBoost: true,
    e4TeamResBuff: true,
    e6Buffs: true,
  }

  // TODO: Is her trace +FUA CD or +FUA Crit DMG multi?
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
      e1OrnamentStacks: 0,
      e4TeamResBuff: true,
      e6ResShredBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += (r.concertoActive) ? ultScaling : 0
      x.ULT_SCALING += (e >= 1 && r.concertoActive && r.e1UltScalingBoost) ? 0.72 : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.CD] += (m.talentCdBuff) ? talentCdBuffValue : 0
      x[Stats.CD] += (e >= 2 && m.talentCdBuff) ? 0.20 : 0
      x[Stats.RES] += (e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0

      x.ELEMENTAL_DMG += (m.skillDmgBuff) ? skillDmgBuffValue : 0
      x.FUA_CD_BOOST += (m.concertoActive) ? 0.10 : 0
      x.RES_PEN += (e >= 6 && m.concertoActive && m.e6ResShredBuff) ? 0.20 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.ATK_P] += (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0
      x[Stats.SPD_P] += (e >= 1 && t.concertoActive) ? 0.15 * t.e1OrnamentStacks : 0

      x.FUA_CD_BOOST += (t.talentFuaCdBoost) ? 0.10 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x']

      x[Stats.ATK] += (r.concertoActive) ? x[Stats.ATK] * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0

      x.ULT_CR_BOOST += 1.00
      x.ULT_CD_OVERRIDE = (e >= 6 && r.concertoActive && r.e6Buffs) ? 3.50 : 1.50

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
