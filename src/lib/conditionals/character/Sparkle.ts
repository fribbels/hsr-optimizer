import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.10, 0.108)
  const talentBaseStackBoost = talent(e, 0.06, 0.066)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const atkBoostByQuantumAllies = {
    0: 0,
    1: 0.05,
    2: 0.15,
    3: 0.30,
  }

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'skillCdBuff',
    name: 'skillCdBuff',
    text: 'Skill CD buff',
    title: 'Skill: Dreamdiver',
    content: `Increases the CRIT DMG of a single ally by ${precisionRound(skillCdBuffScaling * 100)}% of Sparkle's CRIT DMG plus ${precisionRound(skillCdBuffBase * 100)}%, lasting for 1 turn(s).
    ::BR::
    E6: The CRIT DMG Boost effect of Sparkle's Skill additionally increases by 30% of Sparkle's CRIT DMG, and when she uses her Skill, the CRIT DMG Boost effect will apply to all allies currently with Cipher. When Sparkle uses her Ultimate, this effect will spread to all allies with Cipher should the allied target have the CRIT DMG increase effect provided by the Skill active on them.`,
  }, {
    formItem: 'switch',
    id: 'cipherBuff',
    name: 'cipherBuff',
    text: 'Cipher buff',
    title: 'Ultimate: The Hero with a Thousand Faces',
    content: `When allies with Cipher trigger the DMG Boost effect provided by Sparkle's Talent, each stack additionally increases its effect by ${precisionRound(cipherTalentStackBoost * 100)}%, lasting for 2 turns.
    ::BR::
    E1: The Cipher effect applied by the Ultimate lasts for 1 extra turn. All allies affected by Cipher have their ATK increased by 40%.`,
  }, {
    formItem: 'slider',
    id: 'talentStacks',
    name: 'talentStacks',
    text: 'Talent DMG stacks',
    title: 'Talent: Red Herring',
    content: `Whenever an ally consumes 1 Skill Point, all allies' DMG increases by ${precisionRound(talentBaseStackBoost * 100)}%. This effect lasts for 2 turn(s) and can stack up to 3 time(s).
    ::BR::
    E2: Each Talent stack allows allies to ignore 8% of the enemy target's DEF when dealing DMG to enemies.`,
    min: 0,
    max: 3,
  }, {
    formItem: 'slider',
    id: 'quantumAllies',
    name: 'quantumAllies',
    text: 'Quantum allies',
    title: 'Trace: Nocturne',
    content: `When there are 1/2/3 Quantum allies in your team, Quantum-Type allies' ATK are increased by 5%/15%/30%.`,
    min: 0,
    max: 3,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillCdBuff'),
    {
      formItem: 'slider',
      id: 'teammateCDValue',
      name: 'teammateCDValue',
      text: `Sparkle's Combat CD`,
      title: 'Skill: Dreamdiver',
      content: `Increases the CRIT DMG of a single ally by ${precisionRound(skillCdBuffScaling * 100)}% of Sparkle's CRIT DMG plus ${precisionRound(skillCdBuffBase * 100)}%, lasting for 1 turn(s).`,
      min: 0,
      max: 3.50,
      percent: true,
    },
    findContentId(content, 'cipherBuff'),
    findContentId(content, 'talentStacks'),
    findContentId(content, 'quantumAllies'),
  ]

  const defaults = {
    skillCdBuff: false,
    cipherBuff: true,
    talentStacks: 3,
    quantumAllies: 3,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      ...defaults,
      ...{
        skillCdBuff: true,
        teammateCDValue: 2.5,
      },
    }),
    precomputeEffects: (_request: Form) => {
      const x = Object.assign({}, baseComputedStatsObject)

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.ATK_P] += 0.15 + (request.PRIMARY_ELEMENTAL_DMG_TYPE == Stats.Quantum_DMG ? (atkBoostByQuantumAllies[m.quantumAllies] || 0) : 0)
      x[Stats.ATK_P] += (e >= 1 && m.cipherBuff) ? 0.40 : 0

      x.ELEMENTAL_DMG += (m.cipherBuff) ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost) : m.talentStacks * talentBaseStackBoost
      x.DEF_SHRED += (e >= 2) ? 0.08 * m.talentStacks : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.CD] += (t.skillCdBuff) ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      x[Stats.CD] += (r.skillCdBuff) ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * x[Stats.CD] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
