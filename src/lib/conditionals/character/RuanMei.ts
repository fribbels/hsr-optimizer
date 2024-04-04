import { Stats } from 'lib/constants'
import { Eidolon } from 'types/Character'
import { Form } from 'types/Form'

import { AbilityEidolon, findContentId, precisionRound } from '../utils'

import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const fieldResPenValue = ult(e, 0.25, 0.27)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.32, 0.352)
  const talentSpdScaling = talent(e, 0.10, 0.104)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'skillOvertoneBuff',
      name: 'skillOvertoneBuff',
      text: 'Overtone buff',
      title: 'Skill: String Sings Slow Swirls',
      content: `After using her Skill, Ruan Mei gains Overtone, lasting for 3 turn(s). This duration decreases by 1 at the start of Ruan Mei's turn. When Ruan Mei has Overtone, all allies' DMG increases by ${precisionRound(skillScaling * 100)}% and Weakness Break Efficiency increases by 50%`,
    },
    {
      formItem: 'switch',
      id: 'teamBEBuff',
      name: 'teamBEBuff',
      text: 'Team BE buff',
      title: 'Trace: Inert Respiration',
      content: `Increases Break Effect by 20% for all allies.`,
    },
    {
      formItem: 'switch',
      id: 'ultFieldActive',
      name: 'ultFieldActive',
      text: 'Ult field active',
      title: 'Ultimate: Petals to Stream, Repose in Dream',
      content: `While inside the field, all allies' All-Type RES PEN increases by ${precisionRound(fieldResPenValue * 100)}%.
    ::BR::
    E1: While the Ultimate's field is deployed, the DMG dealt by all allies ignores 20% of the target's DEF.`,
    },
    {
      formItem: 'switch',
      id: 'e2AtkBoost',
      name: 'e2AtkBoost',
      text: 'E2 weakness ATK buff',
      title: 'E2: Reedside Promenade',
      content: 'E2: With Ruan Mei on the field, all allies increase their ATK by 40% when dealing DMG to enemies with Weakness Break.',
      disabled: (e < 2),
    },
    {
      formItem: 'switch',
      id: 'e4BeBuff',
      name: 'e4BeBuff',
      text: 'E4 BE buff',
      title: 'E4: Chatoyant Éclat',
      content: 'E4: When an enemy target\'s Weakness is Broken, Ruan Mei\'s Break Effect increases by 100% for 3 turn(s).',
      disabled: (e < 4),
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillOvertoneBuff'),
    {
      formItem: 'switch',
      id: 'teamSpdBuff',
      name: 'teamSpdBuff',
      text: 'Team SPD buff',
      title: 'Talent: Somatotypical Helix',
      content: `Increases SPD by ${precisionRound(talentSpdScaling * 100)}% for the team (excluding this character).`,
    },
    findContentId(content, 'teamBEBuff'),
    {
      formItem: 'slider',
      id: 'teamDmgBuff',
      name: 'teamDmgBuff',
      text: `BE to DMG buff`,
      title: 'Trace: Candle Lights on Still Waters',
      content: `In battle, for every 10% of Ruan Mei's Break Effect that exceeds 120%, her Skill additionally increases allies' DMG by 6%, up to a maximum of 36%.`,
      min: 0,
      max: 0.36,
      percent: true,
    },
    findContentId(content, 'ultFieldActive'),
    findContentId(content, 'e2AtkBoost'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      skillOvertoneBuff: true,
      teamBEBuff: true,
      ultFieldActive: true,
      e2AtkBoost: false,
      e4BeBuff: false,
    }),
    teammateDefaults: () => ({
      skillOvertoneBuff: true,
      teamSpdBuff: true,
      teamBEBuff: true,
      ultFieldActive: true,
      e2AtkBoost: false,
      teamDmgBuff: 0.36,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.BE] += (e >= 4 && r.e4BeBuff) ? 1.00 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.BE] += (m.teamBEBuff) ? 0.20 : 0
      x[Stats.ATK_P] += (e >= 2 && m.e2AtkBoost) ? 0.40 : 0

      x.ELEMENTAL_DMG += (m.skillOvertoneBuff) ? skillScaling : 0
      x.BREAK_EFFICIENCY_BOOST += (m.skillOvertoneBuff) ? 0.50 : 0

      x.RES_PEN += (m.ultFieldActive) ? fieldResPenValue : 0
      x.DEF_SHRED += (e >= 1 && m.ultFieldActive) ? 0.20 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.SPD_P] += (t.teamSpdBuff) ? talentSpdScaling : 0
      x.ELEMENTAL_DMG += t.teamDmgBuff
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      const beOver = precisionRound((x[Stats.BE] * 100 - 120) / 10)
      x.ELEMENTAL_DMG += Math.floor(Math.max(0, beOver)) * 0.06

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
    },
  }
}
