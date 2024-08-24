import { ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, precisionRound, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 3.20, 3.456)

  const talentMissingHpDmgBoostMax = talent(e, 0.72, 0.792)

  const content: ContentItem[] = [{
    formItem: 'slider',
    id: 'selfCurrentHpPercent',
    name: 'selfCurrentHpPercent',
    text: 'Self current HP%',
    title: 'Self current HP%',
    content: `Increases Arlan's DMG for every percent of HP below his Max HP, up to a max of ${precisionRound(talentMissingHpDmgBoostMax * 100)}% more DMG.`,
    min: 0.01,
    max: 1.0,
    percent: true,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      selfCurrentHpPercent: 1.00,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x.ELEMENTAL_DMG += Math.min(talentMissingHpDmgBoostMax, 1 - r.selfCurrentHpPercent)

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      buffAbilityDmg(x, SKILL_TYPE, 0.10, (e >= 1 && r.selfCurrentHpPercent <= 0.50))
      buffAbilityDmg(x, ULT_TYPE, 0.20, (e >= 6 && r.selfCurrentHpPercent <= 0.50))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
