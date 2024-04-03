import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, calculateAshblazingSet, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const skillDmgBoostValue = skill(e, 0.66, 0.726)
  const ultAtkBoostValue = ult(e, 0.55, 0.594)
  const ultCdBoostValue = ult(e, 0.16, 0.168)
  const ultCdBoostBaseValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.0, 1.1)
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'teamDmgBuff',
    name: 'teamDmgBuff',
    text: 'Team DMG buff',
    title: 'Trace: Military Might',
    content: `When Bronya is on the field, all allies deal 10% more DMG.`,
  }, {
    formItem: 'switch',
    id: 'battleStartDefBuff',
    name: 'battleStartDefBuff',
    text: 'Initial DEF buff',
    title: 'Trace: Battlefield',
    content: `At the start of the battle, all allies' DEF increases by 20% for 2 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'techniqueBuff',
    name: 'techniqueBuff',
    text: 'Technique ATK buff',
    title: 'Technique: Banner of Command',
    content: `After using Bronya's Technique, at the start of the next battle, all allies' ATK increases by 15% for 2 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'skillBuff',
    name: 'skillBuff',
    text: 'Skill DMG buff',
    title: 'Skill: Combat Redeployment',
    content: `Dispels a debuff from a single ally, allows them to immediately take action, and increases their DMG by ${precisionRound(skillDmgBoostValue * 100)}% for 1 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult ATK/CD buffs',
    title: 'Ultimate: The Belobog March',
    content: `Increases the ATK of all allies by ${precisionRound(ultAtkBoostValue * 100)}% and CRIT DMG by ${precisionRound(ultCdBoostValue * 100)}% of Bronya's CRIT DMG plus ${precisionRound(ultCdBoostBaseValue * 100)}% for 2 turns.`,
  }, {
    formItem: 'switch',
    id: 'e2SkillSpdBuff',
    name: 'e2SkillSpdBuff',
    text: 'E2 skill SPD buff',
    title: 'E2: Quick March',
    content: `When using Skill, the target ally's SPD increases by 30% after taking action, lasting for 1 turn.`,
    disabled: e < 2,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'teamDmgBuff'),
    findContentId(content, 'battleStartDefBuff'),
    findContentId(content, 'techniqueBuff'),
    findContentId(content, 'skillBuff'),
    findContentId(content, 'ultBuff'),
    {
      formItem: 'slider',
      id: 'teammateCDValue',
      name: 'teammateCDValue',
      text: `Bronya's CD`,
      title: 'Ultimate: The Belobog March',
      content: `Increases the ATK of all allies by ${precisionRound(ultAtkBoostValue * 100)}% and CRIT DMG by ${precisionRound(ultCdBoostValue * 100)}% of Bronya's CRIT DMG plus ${precisionRound(ultCdBoostBaseValue * 100)}% for 2 turns.`,
      min: 0,
      max: 3.00,
      percent: true,
    },
    findContentId(content, 'e2SkillSpdBuff'),
  ]

  const defaults = {
    teamDmgBuff: true,
    techniqueBuff: false,
    battleStartDefBuff: true,
    skillBuff: true,
    ultBuff: true,
    e2SkillSpdBuff: false,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      ...defaults,
      ...{
        teammateCDValue: 2.50,
      },
    }),
    precomputeEffects: (_request: Form) => {
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x.BASIC_CR_BOOST += 1.00

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.FUA_SCALING += (e >= 4) ? fuaScaling : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.DEF_P] += (m.battleStartDefBuff) ? 0.20 : 0
      x[Stats.SPD_P] += (m.e2SkillSpdBuff) ? 0.30 : 0
      x[Stats.ATK_P] += (m.techniqueBuff) ? 0.15 : 0
      x[Stats.ATK_P] += (m.ultBuff) ? ultAtkBoostValue : 0

      x.ELEMENTAL_DMG += (m.teamDmgBuff) ? 0.10 : 0
      x.ELEMENTAL_DMG += (m.skillBuff) ? skillDmgBoostValue : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.CD] += (t.ultBuff) ? ultCdBoostValue * t.teammateCDValue : 0
      x[Stats.CD] += (t.ultBuff) ? ultCdBoostBaseValue : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      // Order matters?
      x[Stats.CD] += (r.ultBuff) ? ultCdBoostValue * x[Stats.CD] : 0
      x[Stats.CD] += (r.ultBuff) ? ultCdBoostBaseValue : 0

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    },
  }
}
