import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet, precisionRound } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const enhancedStateDmgBoost = skill(e, 0.40, 0.456)
  const hpPercentLostTotalMax = 0.90

  const basicScaling = basic(e, 1.0, 1.1)
  const basicEnhancedAtkScaling = skill(e, 0.40, 0.44)
  const basicEnhancedHpScaling = skill(e, 1.00, 1.10)
  const ultAtkScaling = ult(e, 0.40, 0.432)
  const ultHpScaling = ult(e, 1.00, 1.08)
  const ultLostHpScaling = ult(e, 1.00, 1.08)
  const fuaAtkScaling = talent(e, 0.44, 0.484)
  const fuaHpScaling = talent(e, 1.10, 1.21)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.33 + 2 * 0.33 + 3 * 0.34),
    3: ASHBLAZING_ATK_STACK * (2 * 0.33 + 5 * 0.33 + 8 * 0.34),
    5: ASHBLAZING_ATK_STACK * (3 * 0.33 + 8 * 0.33 + 8 * 0.34),
  }

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'enhancedStateActive',
    name: 'enhancedStateActive',
    text: 'Hellscape state',
    title: 'Hellscape state',
    content: `
      Increases DMG by ${precisionRound(enhancedStateDmgBoost * 100)}% and his Basic ATK Shard Sword is enhanced to Forest of Swords for 3 turn(s).
      ::BR::
      E2: Increases CRIT Rate by ${precisionRound(0.15 * 100)}%.
    `,
  }, {
    formItem: 'slider',
    id: 'hpPercentLostTotal',
    name: 'hpPercentLostTotal',
    text: 'HP% lost total',
    title: 'HP% lost total',
    content: `Ultimate DMG scales off of the tally of Blade's HP loss in the current battle. 
    The tally of Blade's HP loss in the current battle is capped at ${precisionRound(hpPercentLostTotalMax * 100)}% of his Max HP.`,
    min: 0,
    max: hpPercentLostTotalMax,
    percent: true,
  }, {
    formItem: 'slider',
    id: 'e4MaxHpIncreaseStacks',
    name: 'e4MaxHpIncreaseStacks',
    text: 'E4 max HP stacks',
    title: 'E4 max HP stacks',
    content: `E4: Increases HP by ${precisionRound(0.20 * 100)}%, stacks up to 2 times.`,
    min: 0,
    max: 2,
    disabled: e < 4,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enhancedStateActive: true,
      hpPercentLostTotal: hpPercentLostTotalMax,
      e4MaxHpIncreaseStacks: 2,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.CR] += (e >= 2 && r.enhancedStateActive) ? 0.15 : 0
      x[Stats.HP_P] += (e >= 4) ? r.e4MaxHpIncreaseStacks * 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      // Rest of the scalings are calculated dynamically

      // Boost
      x.ELEMENTAL_DMG += r.enhancedStateActive ? enhancedStateDmgBoost : 0
      buffAbilityDmg(x, FUA_TYPE, 0.20)

      x.BASIC_TOUGHNESS_DMG += (r.enhancedStateActive) ? 60 : 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      if (r.enhancedStateActive) {
        x.BASIC_DMG += basicEnhancedAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicEnhancedHpScaling * x[Stats.HP]
      } else {
        x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      }

      x.ULT_DMG += ultAtkScaling * x[Stats.ATK]
      x.ULT_DMG += ultHpScaling * x[Stats.HP]
      x.ULT_DMG += ultLostHpScaling * r.hpPercentLostTotal * x[Stats.HP]
      x.ULT_DMG += (e >= 1 && request.enemyCount == 1) ? 1.50 * r.hpPercentLostTotal * x[Stats.HP] : 0

      const hitMulti = hitMultiByTargets[request.enemyCount]
      const ashblazingAtk = calculateAshblazingSet(x, request, hitMulti)
      x.FUA_DMG += fuaAtkScaling * (x[Stats.ATK] + ashblazingAtk)

      x.FUA_DMG += fuaHpScaling * x[Stats.HP]
      x.FUA_DMG += (e >= 6) ? 0.50 * x[Stats.HP] : 0
    },
    gpuFinalizeCalculations: (request: Form) => {
      const r = request.characterConditionals

      return `
if (${wgslTrue(r.enhancedStateActive)}) {
  x.BASIC_DMG += ${basicEnhancedAtkScaling} * x.ATK;
  x.BASIC_DMG += ${basicEnhancedHpScaling} * x.HP;
} else {
  x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
}

x.ULT_DMG += ${ultAtkScaling} * x.ATK;
x.ULT_DMG += ${ultHpScaling} * x.HP;
x.ULT_DMG += ${ultLostHpScaling * r.hpPercentLostTotal} * x.HP;

if (${wgslTrue(e >= 1 && request.enemyCount == 1)}) {
  x.ULT_DMG += 1.50 * ${r.hpPercentLostTotal} * x.HP;
}

x.FUA_DMG += ${fuaAtkScaling} * (x.ATK + calculateAshblazingSet(p_x, p_state, ${hitMultiByTargets[request.enemyCount]}));
x.FUA_DMG += ${fuaHpScaling} * x.HP;

if (e >= 6) {
  x.FUA_DMG += 0.50 * x.HP;
}
    `
    },
  }
}
