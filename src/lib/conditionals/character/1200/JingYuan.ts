import { ASHBLAZING_ATK_STACK, BASIC_TYPE, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityCd, buffAbilityDmg, buffAbilityVulnerability } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.JingYuan')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.66, 0.726)

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    let hitMulti = 0
    const stacks = r.talentHitsPerAction
    const hits = r.talentAttacks
    const stacksPerMiss = (context.enemyCount >= 3) ? 2 : 0
    const stacksPerHit = (context.enemyCount >= 3) ? 3 : 1
    const stacksPreHit = (context.enemyCount >= 3) ? 2 : 1

    // Calc stacks on miss
    let ashblazingStacks = stacksPerMiss * (stacks - hits)

    // Calc stacks on hit
    ashblazingStacks += stacksPreHit
    let atkBoostSum = 0
    for (let i = 0; i < hits; i++) {
      atkBoostSum += Math.min(8, ashblazingStacks) * (1 / hits)
      ashblazingStacks += stacksPerHit
    }

    hitMulti = atkBoostSum * ASHBLAZING_ATK_STACK

    return hitMulti
  }

  const defaults = {
    skillCritBuff: true,
    talentHitsPerAction: 10,
    talentAttacks: 10,
    e2DmgBuff: true,
    e6FuaVulnerabilityStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillCritBuff: {
      id: 'skillCritBuff',
      formItem: 'switch',
      text: t('Content.skillCritBuff.text'),
      content: t('Content.skillCritBuff.content'),
    },
    talentHitsPerAction: {
      id: 'talentHitsPerAction',
      formItem: 'slider',
      text: t('Content.talentHitsPerAction.text'),
      content: t('Content.talentHitsPerAction.content'),
      min: 3,
      max: 10,
    },
    talentAttacks: {
      id: 'talentAttacks',
      formItem: 'slider',
      text: t('Content.talentAttacks.text'),
      content: t('Content.talentAttacks.content'),
      min: 0,
      max: 10,
    },
    e2DmgBuff: {
      id: 'e2DmgBuff',
      formItem: 'switch',
      text: t('Content.e2DmgBuff.text'),
      content: t('Content.e2DmgBuff.content'),
      disabled: e < 2,
    },
    e6FuaVulnerabilityStacks: {
      id: 'e6FuaVulnerabilityStacks',
      formItem: 'slider',
      text: t('Content.e6FuaVulnerabilityStacks.text'),
      content: t('Content.e6FuaVulnerabilityStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, Source.NONE)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      r.talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)

      // Stats
      x.CR.buff((r.skillCritBuff) ? 0.10 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.FUA_SCALING.buff(fuaScaling * r.talentAttacks, Source.NONE)

      // Boost
      buffAbilityCd(x, FUA_TYPE, (r.talentHitsPerAction >= 6) ? 0.25 : 0, Source.NONE)
      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE | ULT_TYPE, (e >= 2 && r.e2DmgBuff) ? 0.20 : 0, Source.NONE)
      buffAbilityVulnerability(x, FUA_TYPE, (e >= 6) ? r.e6FuaVulnerabilityStacks * 0.12 : 0, Source.NONE)

      // Lightning lord calcs
      const hits = r.talentAttacks

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(15 * hits, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // TODO: Technically E6 has a vulnerability but its kinda hard to calc
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
