import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityCd, buffAbilityCr } from 'lib/optimizer/calculateBuffs'

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
      content: `While in the Concerto state, increases all allies' ATK by ${precisionRound(ultAtkBuffScalingValue * 100)}% of Robin's ATK plus ${ultAtkBuffFlatValue}. Moreover, after every attack by allies, Robin deals Additional Physical DMG equal to ${precisionRound(ultScaling * 100)}% of her ATK for 1 time, with a fixed CRIT Rate for this damage set at 100% and fixed CRIT DMG set at 150%.`,
    },
    {
      formItem: 'switch',
      id: 'skillDmgBuff',
      name: 'skillDmgBuff',
      text: 'Skill DMG buff',
      title: 'Skill DMG buff',
      content: `Increase DMG dealt by all allies by ${precisionRound(skillDmgBuffValue * 100)}%, lasting for 3 turn(s).`,
    },
    {
      formItem: 'switch',
      id: 'talentCdBuff',
      name: 'talentCdBuff',
      text: 'Talent CD buff',
      title: 'Talent CD buff',
      content: `Increase all allies' CRIT DMG by ${precisionRound(talentCdBuffValue * 100)}%.`,
    },
    {
      formItem: 'switch',
      id: 'e1UltResPen',
      name: 'e1UltResPen',
      text: 'E1 Ult RES PEN',
      title: 'E1 Ult RES PEN',
      content: `While the Concerto state is active, all allies' All-Type RES PEN increases by 24%.`,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4TeamResBuff',
      name: 'e4TeamResBuff',
      text: 'E4 RES team buff',
      title: 'E4 RES team buff',
      content: `When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the Concerto state, increases the Effect RES of all allies by 50%.`,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6UltCDBoost',
      name: 'e6UltCDBoost',
      text: 'E6 Ult DMG CD boost',
      title: 'E6 Ult DMG CD boost',
      content: `While the Concerto state is active, the CRIT DMG for the Additional Physical DMG caused by the Ultimate increases by 450%. The effect of Moonless Midnight can trigger up to 8 time(s). And the trigger count resets each time the Ultimate is used.`,
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
      text: `Robin's Combat ATK`,
      title: 'Robin\'s Combat ATK',
      content: `While in the Concerto state, increases all allies' ATK by ${precisionRound(ultAtkBuffScalingValue * 100)}% of Robin's ATK plus ${ultAtkBuffFlatValue}`,
      min: 0,
      max: 8000,
    },
    findContentId(content, 'talentCdBuff'),
    {
      formItem: 'switch',
      id: 'traceFuaCdBoost',
      name: 'traceFuaCdBoost',
      text: 'FUA CD boost',
      title: 'FUA CD boost',
      content: `While the Concerto state is active, the CRIT DMG dealt when all allies launch follow-up attacks increases by 25%.`,
    },
    findContentId(content, 'e1UltResPen'),
    {
      formItem: 'switch',
      id: 'e2UltSpdBuff',
      name: 'e2UltSpdBuff',
      text: 'E2 Ult SPD buff',
      title: 'E2 Ult SPD buff',
      content: `While the Concerto state is active, all allies' SPD increases by 16%.`,
      disabled: e < 2,
    },
  ]

  const defaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    e1UltResPen: true,
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
      teammateATKValue: 5000,
      traceFuaCdBoost: true,
      e1UltResPen: true,
      e2UltSpdBuff: false,
      e4TeamResBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += (r.concertoActive) ? ultScaling : 0
      x.ULT_BOOSTS_MULTI = 0 // Her ult doesn't apply dmg boosts since its additional dmg

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.CD] += (m.talentCdBuff) ? talentCdBuffValue : 0
      x[Stats.RES] += (e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0

      x.ELEMENTAL_DMG += (m.skillDmgBuff) ? skillDmgBuffValue : 0
      x.RES_PEN += (e >= 1 && m.concertoActive && m.e1UltResPen) ? 0.24 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.ATK] += (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0
      x.RATIO_BASED_ATK_BUFF += (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue : 0

      x[Stats.SPD_P] += (e >= 2 && t.concertoActive && t.e2UltSpdBuff) ? 0.16 : 0
      buffAbilityCd(x, FUA_TYPE, 0.25, (t.traceFuaCdBoost && t.concertoActive))
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      x[Stats.ATK] += (r.concertoActive) ? x[Stats.ATK] * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0

      buffAbilityCr(x, ULT_TYPE, 1.00)
      x.ULT_CD_OVERRIDE = (e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
