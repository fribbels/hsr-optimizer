import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'healingMaxHpBuff',
    name: 'healingMaxHpBuff',
    text: 'Healing max HP buff',
    title: 'Healing max HP buff',
    content: `When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by ${precisionRound(0.10 * 100)}% for 2 turns.`,
  }, {
    formItem: 'switch',
    id: 'talentDmgReductionBuff',
    name: 'talentDmgReductionBuff',
    text: 'Invigoration DMG reduction',
    title: 'Invigoration DMG reduction',
    content: `Characters with Invigoration take ${precisionRound(0.10 * 100)}% less DMG.`,
  }, {
    formItem: 'switch',
    id: 'e2UltHealingBuff',
    name: 'e2UltHealingBuff',
    text: 'E2 ult healing buff',
    title: 'E2 ult healing buff',
    content: `E2: Increases healing by ${precisionRound(0.15 * 100)}% after Ultimate.`,
    disabled: e < 2,
  }, {
    formItem: 'slider',
    id: 'e4SkillHealingDmgBuffStacks',
    name: 'e4SkillHealingDmgBuffStacks',
    text: 'E4 skill healing DMG buff stacks',
    title: 'E4 skill healing DMG buff stacks',
    content: `E4: Every healing provided by Bailu's Skill makes the recipient deal ${precisionRound(0.10 * 100)}% more DMG for 2 turns. This effect can stack up to 3 times.`,
    min: 0,
    max: 3,
    disabled: e < 4,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'healingMaxHpBuff'),
    findContentId(content, 'talentDmgReductionBuff'),
    findContentId(content, 'e4SkillHealingDmgBuffStacks'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      healingMaxHpBuff: true,
      talentDmgReductionBuff: true,
      e2UltHealingBuff: true,
      e4SkillHealingDmgBuffStacks: 0,
    }),
    teammateDefaults: () => ({
      healingMaxHpBuff: true,
      talentDmgReductionBuff: true,
      e4SkillHealingDmgBuffStacks: 3,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.OHB] += (e >= 2 && r.e2UltHealingBuff) ? 0.15 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.HP_P] += (m.healingMaxHpBuff) ? 0.10 : 0

      x.ELEMENTAL_DMG += (e >= 4) ? m.e4SkillHealingDmgBuffStacks * 0.10 : 0
      x.DMG_RED_MULTI *= (m.talentDmgReductionBuff) ? (1 - 0.10) : 1
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += 0
      x.ULT_DMG += 0
      x.FUA_DMG += 0
    },
  }
}
