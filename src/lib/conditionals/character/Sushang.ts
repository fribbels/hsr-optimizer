import { Stats } from 'lib/constants'
import { ComputedStatsObject, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, precisionRound, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const talentSpdBuffValue = talent(e, 0.20, 0.21)
  const ultBuffedAtk = ult(e, 0.30, 0.324)
  const talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const skillExtraHitScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.20, 3.456)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuffedState',
    name: 'ultBuffedState',
    text: 'Ult buffed state',
    title: 'Ult buffed state',
    content: `Sushang's ATK increases by ${precisionRound(ultBuffedAtk * 100)}% and using her Skill has 2 extra chances to trigger Sword Stance for 2 turn(s).
    Sword Stance triggered from the extra chances deals 50% of the original DMG.`,
  }, {
    formItem: 'slider',
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: 'Skill extra hits',
    title: 'Skill extra hits',
    content: `Increases the number of Sword Stance extra hits of the Skill.`,
    min: 0,
    max: 3,
  }, {
    formItem: 'slider',
    id: 'skillTriggerStacks',
    name: 'skillTriggerStacks',
    text: 'Skill trigger stacks',
    title: 'Skill trigger stacks',
    content: `For every Sword Stance triggered, the DMG dealt by Sword Stance increases by 2.5%. Stacks up to 10 time(s).`,
    min: 0,
    max: 10,
  }, {
    formItem: 'slider',
    id: 'talentSpdBuffStacks',
    name: 'talentSpdBuffStacks',
    text: 'Talent SPD buff stacks',
    title: 'Talent SPD buff stacks',
    content: `When an enemy has their Weakness Broken on the field, Sushang's SPD increases by ${precisionRound(talentSpdBuffValue * 100)}% per stack for 2 turn(s).
    ::BR::
    E6: Talent's SPD Boost is stackable and can stack up to 2 times.`,
    min: 0,
    max: talentSpdBuffStacksMax,
  },
  {
    formItem: 'switch',
    id: 'e2DmgReductionBuff',
    name: 'e2DmgReductionBuff',
    text: 'E2 DMG reduction buff',
    title: 'E2 DMG reduction buff',
    content: `E2: After triggering Sword Stance, the DMG taken by Sushang is reduced by 20% for 1 turn.`,
    disabled: e < 2,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultBuffedState: true,
      e2DmgReductionBuff: true,
      skillExtraHits: 3,
      skillTriggerStacks: 10,
      talentSpdBuffStacks: talentSpdBuffStacksMax,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.BE] += (e >= 4) ? 0.40 : 0
      x[Stats.ATK_P] += (r.ultBuffedState) ? ultBuffedAtk : 0
      x[Stats.SPD_P] += (r.talentSpdBuffStacks) * talentSpdBuffValue

      /*
       * Scaling
       * Trace only affects stance damage not skill damage - boost this based on proportion of stance : total skill dmg
       */
      const originalSkillScaling = skillScaling
      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0
      const stanceScalingProportion = stanceSkillScaling / (stanceSkillScaling + originalSkillScaling)

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += originalSkillScaling
      x.SKILL_SCALING += stanceSkillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      buffAbilityDmg(x, SKILL_TYPE, r.skillTriggerStacks * 0.025 * stanceScalingProportion)
      x.DMG_RED_MULTI *= (e >= 2 && r.e2DmgReductionBuff) ? (1 - 0.20) : 1

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
