import { Stats } from 'lib/constants'
import { AbilityEidolon, findContentId, precisionRound } from '../utils'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'

import { Eidolon } from 'types/Character'
import { Form } from 'types/Form'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillExtraHitsMax = (e >= 6) ? 3 : 2

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.72, 0.792)
  const ultScaling = ult(e, 1.50, 1.62)
  const talentScaling = talent(e, 0.60, 0.66)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'enemyDmgTakenDebuff',
    name: 'enemyDmgTakenDebuff',
    text: 'Ult vulnerability debuff',
    title: 'Retribution',
    content: 'When using Ultimate, there is a 100% base chance to increase the DMG received by the targets by 12% for 2 turn(s).',
  }, {
    formItem: 'switch',
    id: 'enemySlowed',
    name: 'enemySlowed',
    text: 'Enemy slowed',
    title: 'Time Distortion',
    content: `When hitting an enemy that is already Slowed, Welt deals Additional Imaginary DMG equal to ${precisionRound(talentScaling * 100)}% of his ATK to the enemy.`,
  }, {
    formItem: 'slider',
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: 'Skill extra hits on target',
    title: 'Edge of the Void',
    content: `Deals Imaginary DMG equal to ${precisionRound(skillScaling * 100)}% of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to ${precisionRound(skillScaling * 100)}% of Welt's ATK to a random enemy.`,
    min: 0,
    max: skillExtraHitsMax,
  }, {
    formItem: 'switch',
    id: 'e1EnhancedState',
    name: 'e1EnhancedState',
    text: 'E1 enhanced state',
    title: 'E1 Legacy of Honor',
    content: "E1: After Welt uses his Ultimate, his abilities are enhanced. The next 2 time(s) he uses his Basic ATK or Skill, deals Additional DMG to the target equal to 50% of his Basic ATK's DMG multiplier or 80% of his Skill's DMG multiplier respectively.",
    disabled: (e < 1),
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'enemyDmgTakenDebuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      enemySlowed: true,
      enemyDmgTakenDebuff: true,
      skillExtraHits: skillExtraHitsMax,
      e1EnhancedState: true,
    }),
    teammateDefaults: () => ({
      enemyDmgTakenDebuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_SCALING += (r.enemySlowed) ? talentScaling : 0
      x.SKILL_SCALING += (r.enemySlowed) ? talentScaling : 0
      x.ULT_SCALING += (r.enemySlowed) ? talentScaling : 0

      x.BASIC_SCALING += (e >= 1 && r.e1EnhancedState) ? 0.50 * basicScaling : 0
      x.SKILL_SCALING += (e >= 1 && r.e1EnhancedState) ? 0.80 * skillScaling : 0

      x.SKILL_SCALING += r.skillExtraHits * skillScaling

      // Boost
      x.ELEMENTAL_DMG += (request.enemyWeaknessBroken) ? 0.20 : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.DMG_TAKEN_MULTI += (m.enemyDmgTakenDebuff) ? 0.12 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
