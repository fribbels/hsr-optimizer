import { Stats } from 'lib/constants'
import { baseComputedStatsObject, BASIC_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityResShred } from 'lib/optimizer/calculateBuffs'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const righteousHeartStackMax = (e >= 1) ? 10 : 6
  const outroarStackCdValue = skill(e, 0.12, 0.132)
  const righteousHeartDmgValue = talent(e, 0.10, 0.11)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhanced1Scaling = basic(e, 2.60, 2.86)
  const basicEnhanced2Scaling = basic(e, 3.80, 4.18)
  const basicEnhanced3Scaling = basic(e, 5.00, 5.50)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 3.00, 3.24)

  const content: ContentItem[] = [{
    formItem: 'slider',
    id: 'basicEnhanced',
    name: 'basicEnhanced',
    text: 'Basic enhancements',
    title: 'Basic enhancements',
    content: `0 stack(s): Uses a 2-hit attack and deals Imaginary DMG equal to ${precisionRound(basicScaling * 100)}% ATK to a single enemy target.
    ::BR::1 stack(s): Uses a 3-hit attack and deals Imaginary DMG equal to ${precisionRound(basicEnhanced1Scaling * 100)}% ATK to a single enemy target.
    ::BR::2 stack(s): Uses a 5-hit attack and deals Imaginary DMG equal to ${precisionRound(basicEnhanced2Scaling * 100)}% ATK to a single enemy target and reduced DMG to adjacent targets.
    ::BR::3 stack(s): Uses a 7-hit attack and deals Imaginary DMG equal to ${precisionRound(basicEnhanced3Scaling * 100)}% ATK to a single enemy target and reduced DMG to adjacent targets.`,
    min: 0,
    max: 3,
  }, {
    formItem: 'slider',
    id: 'skillOutroarStacks',
    name: 'skillOutroarStacks',
    text: 'Outroar stacks',
    title: 'Outroar stacks',
    content: `Divine Spear or Fulgurant Leap, starting from the fourth hit, 1 stack of Outroar is gained before every hit. 
    Each stack of Outroar increases Dan Heng • Imbibitor Lunae's CRIT DMG by ${precisionRound(outroarStackCdValue * 100)}%, for a max of 4 stacks. (applied to all hits)`,
    min: 0,
    max: 4,
  }, {
    formItem: 'slider',
    id: 'talentRighteousHeartStacks',
    name: 'talentRighteousHeartStacks',
    text: 'Righteous Heart stacks',
    title: 'Righteous Heart stacks',
    content: `After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains 1 stack of Righteous Heart, increasing his DMG by ${precisionRound(righteousHeartDmgValue * 100)}%. (applied to all hits)`,
    min: 0,
    max: righteousHeartStackMax,
  }, {
    formItem: 'slider',
    id: 'e6ResPenStacks',
    name: 'e6ResPenStacks',
    text: 'E6 RES PEN stacks',
    title: 'E6 RES PEN stacks',
    content: `E6: After any other ally uses their Ultimate, the Imaginary RES PEN of Dan Heng • Imbibitor Lunae's next Fulgurant Leap attack increases by 20%, up to 3 stacks.`,
    min: 0,
    max: 3,
    disabled: e < 6,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      basicEnhanced: 3,
      skillOutroarStacks: 4,
      talentRighteousHeartStacks: righteousHeartStackMax,
      e6ResPenStacks: 3,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CD] += (request.enemyElementalWeak) ? 0.24 : 0
      x[Stats.CD] += r.skillOutroarStacks * outroarStackCdValue

      // Scaling
      x.BASIC_SCALING += {
        0: basicScaling,
        1: basicEnhanced1Scaling,
        2: basicEnhanced2Scaling,
        3: basicEnhanced3Scaling,
      }[r.basicEnhanced] || 0
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += r.talentRighteousHeartStacks * righteousHeartDmgValue
      buffAbilityResShred(x, BASIC_TYPE, 0.20 * r.e6ResPenStacks, (e >= 6 && r.basicEnhanced == 3))

      x.BASIC_TOUGHNESS_DMG += 30 + 30 * r.basicEnhanced
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
