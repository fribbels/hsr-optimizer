import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, BASIC_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityCd, buffAbilityDmg, buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.JingYuan')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.66, 0.726)

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

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

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'skillCritBuff',
    name: 'skillCritBuff',
    text: t('Content.skillCritBuff.text'),
    title: t('Content.skillCritBuff.title'),
    content: t('Content.skillCritBuff.content'),
  }, {
    formItem: 'slider',
    id: 'talentHitsPerAction',
    name: 'talentHitsPerAction',
    text: t('Content.talentHitsPerAction.text'),
    title: t('Content.talentHitsPerAction.title'),
    content: t('Content.talentHitsPerAction.content'),
    min: 3,
    max: 10,
  }, {
    formItem: 'slider',
    id: 'talentAttacks',
    name: 'talentAttacks',
    text: t('Content.talentAttacks.text'),
    title: t('Content.talentAttacks.title'),
    content: t('Content.talentAttacks.content'),
    min: 0,
    max: 10,
  }, {
    formItem: 'switch',
    id: 'e2DmgBuff',
    name: 'e2DmgBuff',
    text: t('Content.e2DmgBuff.text'),
    title: t('Content.e2DmgBuff.title'),
    content: t('Content.e2DmgBuff.content'),
    disabled: e < 2,
  }, {
    formItem: 'slider',
    id: 'e6FuaVulnerabilityStacks',
    name: 'e6FuaVulnerabilityStacks',
    text: t('Content.e6FuaVulnerabilityStacks.text'),
    title: t('Content.e6FuaVulnerabilityStacks.title'),
    content: t('Content.e6FuaVulnerabilityStacks.content'),
    min: 0,
    max: 3,
    disabled: e < 6,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      skillCritBuff: true,
      talentHitsPerAction: 10,
      talentAttacks: 10,
      e2DmgBuff: true,
      e6FuaVulnerabilityStacks: 3,
    }),
    teammateDefaults: () => ({}),
    initializeConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.SUMMONS = 1
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      r.talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)

      // Stats
      x[Stats.CR] += (r.skillCritBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling * r.talentAttacks

      // Boost
      buffAbilityCd(x, FUA_TYPE, 0.25, (r.talentHitsPerAction >= 6))
      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE | ULT_TYPE, 0.20, (e >= 2 && r.e2DmgBuff))
      buffAbilityVulnerability(x, FUA_TYPE, r.e6FuaVulnerabilityStacks * 0.12, (e >= 6))

      // Lightning lord calcs
      const hits = r.talentAttacks

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 15 * hits

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // TODO: Technically E6 has a vulnerability but its kinda hard to calc
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
