import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

const SilverWolf = (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const skillResShredValue = skill(e, 0.10, 0.105)
  const talentDefShredDebuffValue = talent(e, 0.08, 0.088)
  const ultDefShredValue = ult(e, 0.45, 0.468)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.96, 2.156)
  const ultScaling = ult(e, 3.80, 4.104)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'skillResShredDebuff',
    name: 'skillResShredDebuff',
    text: 'Skill All-Type RES shred',
    title: 'Skill: Allow Changes? RES Shred',
    content: `Decreases the target's All-Type RES of the enemy by ${precisionRound(skillResShredValue * 100)}% for 2 turn(s).
    ::BR::If there are 3 or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%.`,
  }, {
    formItem: 'switch',
    id: 'skillWeaknessResShredDebuff',
    name: 'skillWeaknessResShredDebuff',
    text: 'Skill weakness implanted RES shred',
    title: 'Skill weakness implanted RES shred',
    content: `There is a chance to add 1 Weakness of an on-field character's Type to the target enemy. This also reduces the enemy's DMG RES to that Weakness Type by 20% for 2 turn(s). If the enemy already has that Type Weakness, the effect of DMG RES reduction to that Weakness Type will not be triggered.`,
  }, {
    // TODO: should be talent
    formItem: 'switch',
    id: 'talentDefShredDebuff',
    name: 'talentDefShredDebuff',
    text: 'Bug DEF shred',
    title: 'Talent: Awaiting System Response... DEF shred',
    content: `Silver Wolf's bug reduces the target's DEF by ${precisionRound(talentDefShredDebuffValue * 100)}% for 3 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'ultDefShredDebuff',
    name: 'ultDefShredDebuff',
    text: 'Ult DEF shred',
    title: 'Ult: User Banned DEF shred',
    content: `Decreases the target's DEF by ${precisionRound(ultDefShredValue * 100)}% for 3 turn(s).`,
  }, {
    formItem: 'slider',
    id: 'targetDebuffs',
    name: 'targetDebuffs',
    text: 'Target debuffs',
    title: 'Target debuffs',
    content: `
      If there are 3 or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%.
      ::BR::
      E4: After using her Ultimate to attack enemies, deals Additional Quantum DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of 5 time(s) during each use of her Ultimate.
      ::BR::
      E6: For every debuff the target enemy has, the DMG dealt by Silver Wolf increases by 20%, up to a limit of 100%.
    `,
    min: 0,
    max: 5,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillResShredDebuff'),
    findContentId(content, 'skillWeaknessResShredDebuff'),
    findContentId(content, 'talentDefShredDebuff'),
    findContentId(content, 'ultDefShredDebuff'),
    findContentId(content, 'targetDebuffs'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      skillWeaknessResShredDebuff: false,
      skillResShredDebuff: true,
      talentDefShredDebuff: true,
      ultDefShredDebuff: true,
      targetDebuffs: 5,
    }),
    teammateDefaults: () => ({
      skillWeaknessResShredDebuff: false,
      skillResShredDebuff: true,
      talentDefShredDebuff: true,
      ultDefShredDebuff: true,
      targetDebuffs: 5,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 4) ? r.targetDebuffs * 0.20 : 0

      // Boost
      x.ELEMENTAL_DMG += (e >= 6) ? r.targetDebuffs * 0.20 : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.RES_PEN += (m.skillWeaknessResShredDebuff) ? 0.20 : 0
      x.RES_PEN += (m.skillResShredDebuff) ? skillResShredValue : 0
      x.RES_PEN += (m.skillResShredDebuff && m.targetDebuffs >= 3) ? 0.03 : 0
      x.DEF_SHRED += (m.ultDefShredDebuff) ? ultDefShredValue : 0
      x.DEF_SHRED += (m.talentDefShredDebuff) ? talentDefShredDebuffValue : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}

export default SilverWolf
