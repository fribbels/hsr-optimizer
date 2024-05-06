import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const skillCrBuffValue = skill(e, 0.12, 0.132)
  const skillHpBuffValue = skill(e, 0.06, 0.066)
  const talentDmgReductionValue = talent(e, 0.18, 0.196)

  const basicScaling = basic(e, 0.50, 0.55)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 1.00, 1.08)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'talentActive',
    name: 'talentActive',
    text: 'Team DMG reduction',
    title: 'Team DMG reduction',
    content: `While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take ${precisionRound(talentDmgReductionValue * 100)}% less DMG.`,
  }, {
    formItem: 'switch',
    id: 'skillActive',
    name: 'skillActive',
    text: 'Skill active',
    title: 'Skill active',
    content: `Activates Matrix of Prescience, via which other team members will Distribute 65% of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for 3 turn(s).
    While affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by ${precisionRound(skillHpBuffValue * 100)}% of Fu Xuan's Max HP, 
    and increases CRIT Rate by ${precisionRound(skillCrBuffValue * 100)}%.`,
  }, {
    formItem: 'slider',
    id: 'e6TeamHpLostPercent',
    name: 'e6TeamHpLostPercent',
    text: 'E6 team HP lost',
    title: 'E6 team HP lost',
    content: `E6: Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. Fu Xuan's Ultimate DMG will increase by 200% of this tally of HP loss. This tally is also capped at 120% of Fu Xuan's Max HP.`,
    min: 0,
    max: 1.2,
    percent: true,
    disabled: e < 6,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'talentActive'),
    findContentId(content, 'skillActive'),
    {
      formItem: 'slider',
      id: 'teammateHPValue',
      name: 'teammateHPValue',
      text: `Fu Xuan's HP`,
      title: 'Known by Stars, Shown by Hearts',
      content: `While affected by Matrix of Prescience, all team members gain the Knowledge effect, which increases their respective Max HP by ${precisionRound(skillHpBuffValue * 100)}% of Fu Xuan's Max HP`,
      min: 0,
      max: 10000,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      skillActive: true,
      talentActive: true,
      e6TeamHpLostPercent: 1.2,
    }),
    teammateDefaults: () => ({
      skillActive: true,
      talentActive: true,
      teammateHPValue: 8000,
    }),
    precomputeEffects: (_request: Form) => {
      const x = Object.assign({}, baseComputedStatsObject)

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.CR] += (m.skillActive) ? skillCrBuffValue : 0
      x[Stats.CD] += (e >= 1 && m.skillActive) ? 0.30 : 0

      // Talent ehp buff is shared
      x.DMG_RED_MULTI *= (m.talentActive) ? (1 - talentDmgReductionValue) : 1
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.HP] += (t.skillActive) ? skillHpBuffValue * t.teammateHPValue : 0

      // Skill ehp buff only applies to teammates
      x.DMG_RED_MULTI *= (t.skillActive) ? (1 - 0.65) : 1
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      x[Stats.HP] += (r.skillActive) ? skillHpBuffValue * x[Stats.HP] : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.HP]
      x.ULT_DMG += (e >= 6) ? 2.00 * r.e6TeamHpLostPercent * x[Stats.HP] : 0
    },
  }
}
