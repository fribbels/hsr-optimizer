import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from 'lib/conditionals/constants'
import { basicRev, calculateAshblazingSet, precisionRound, skillRev, ultRev } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const skillDmgBoostValue = skillRev(e, 0.66, 0.726)
  const ultAtkBoostValue = ultRev(e, 0.55, 0.594)
  const ultCdBoostValue = ultRev(e, 0.16, 0.168)
  const ultCdBoostBaseValue = ultRev(e, 0.20, 0.216)

  const basicScaling = basicRev(e, 1.0, 1.1)
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'techniqueBuff',
    name: 'techniqueBuff',
    text: 'Technique buff',
    title: 'Technique buff',
    content: `Increases all allies' ATK by ${precisionRound(0.15 * 100)}% for 2 turns at the start of the battle.`,
  }, {
    formItem: 'switch',
    id: 'battleStartDefBuff',
    name: 'battleStartDefBuff',
    text: 'Battle start DEF buff',
    title: 'Battle start DEF buff',
    content: `Increases all allies' DEF by ${precisionRound(0.20 * 100)}% for 2 turns at the start of the battle.`,
  }, {
    formItem: 'switch',
    id: 'skillBuff',
    name: 'skillBuff',
    text: 'Skill buff',
    title: 'Skill buff',
    content: `Increases DMG by ${precisionRound(skillDmgBoostValue * 100)}%.`,
  }, {
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult buff',
    title: 'Ult buff',
    content: `Increases the ATK of all allies by ${precisionRound(ultAtkBoostValue * 100)}% and CRIT DMG by ${precisionRound(ultCdBoostValue * 100)}% of Bronya's CRIT DMG plus ${precisionRound(ultCdBoostBaseValue * 100)}% for 2 turns.`,
  }, {
    formItem: 'switch',
    id: 'e2SkillSpdBuff',
    name: 'e2SkillSpdBuff',
    text: 'E2 skill SPD buff',
    title: 'E2 skill SPD buff',
    content: `E2: When using Skill, the target ally's SPD increases by ${precisionRound(0.30 * 100)}% after taking action, lasting for 1 turn.`,
    disabled: e < 2,
  }]

  return {
    content: () => content,
    defaults: () => ({
      techniqueBuff: true,
      battleStartDefBuff: true,
      skillBuff: true,
      ultBuff: true,
      e2SkillSpdBuff: false,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.DEF_P] += (r.battleStartDefBuff) ? 0.20 : 0
      x[Stats.SPD_P] += (r.e2SkillSpdBuff) ? 0.30 : 0
      x[Stats.ATK_P] += (r.techniqueBuff) ? 0.15 : 0
      x[Stats.ATK_P] += (r.ultBuff) ? ultAtkBoostValue : 0
      x.BASIC_CR_BOOST += 1.00

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.FUA_SCALING += (e >= 4) ? fuaScaling : 0

      // Boost
      x.ELEMENTAL_DMG += 0.10
      x.ELEMENTAL_DMG += (r.skillBuff) ? skillDmgBoostValue : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x']

      // Order matters?
      x[Stats.CD] += (r.ultBuff) ? ultCdBoostValue * x[Stats.CD] : 0
      x[Stats.CD] += (r.ultBuff) ? ultCdBoostBaseValue : 0

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    },
  }
}
