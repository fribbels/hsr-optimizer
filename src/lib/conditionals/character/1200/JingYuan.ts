import { AbilityType, ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE, FUA_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, buffAbilityDmg, buffAbilityVulnerability } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Glistening Light

Basic ATK+1+20

Jing Yuan deals Lightning DMG equal to 100% of his ATK to a single enemy.

 Single 10

Lv6

Rifting Zenith

Skill-1+30

Deals Lightning DMG equal to 100% of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by 2 for the next turn.

 All 10

Lv10

Lightbringer

Ultimate130+5

Deals Lightning DMG equal to 200% of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by 3 for the next turn.

 All 20

Lv10

Prana Extirpated

Talent

Summons Lightning-Lord at the start of the battle. Lightning-Lord has 60 base SPD and 3 base Hits Per Action. When the Lightning-Lord takes action, its hits are considered as Follow-up ATKs, with each hit dealing Lightning DMG equal to 66% of Jing Yuan's ATK to a random single enemy, and enemies adjacent to it also receive Lightning DMG equal to 25% of the DMG dealt to the primary target enemy.
The Lightning-Lord's Hits Per Action can reach a max of 10. Every time Lightning-Lord's Hits Per Action increases by 1, its SPD increases by 10. After the Lightning-Lord's action ends, its SPD and Hits Per Action return to their base values.
When Jing Yuan is knocked down, the Lightning-Lord will disappear.
When Jing Yuan is affected by Crowd Control debuff, the Lightning-Lord is unable to take action.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.

 Single 5

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Spiritus Invocation

Technique

After the Technique is used, the Lightning-Lord's Hits Per Action in the first turn increases by 3 at the start of the next battle.


Stat Boosts

 +28.0% ATK
 +12.0% CRIT Rate
 +12.5% DEF

Battalia Crush

If the Lightning-Lord's Hits Per Action is greater or equal to 6 in the next turn, its CRIT DMG increases by 25% for the next turn.


Savant Providence

At the start of the battle, immediately regenerates 15 Energy.


War Marshal

After the Skill is used, the CRIT Rate increases by 10% for 2 turn(s).



1 Slash, Seas Split

When Lightning-Lord attacks, the DMG multiplier on enemies adjacent to the target enemy increases by an extra amount equal to 25% of the DMG multiplier against the primary target enemy.



2 Swing, Skies Squashed

After Lightning-Lord takes action, DMG dealt by Jing Yuan's Basic ATK, Skill, and Ultimate increases by 20%, lasting for 2 turn(s).



3 Strike, Suns Subdued

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Spin, Stars Sieged

For each hit performed by the Lightning-Lord when it takes action, Jing Yuan regenerates 2 Energy.



5 Stride, Spoils Seized

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Sweep, Souls Slain

Each hit performed by the Lightning-Lord when it takes action will make the target enemy Vulnerable.
While Vulnerable, enemies receive 12% more DMG until the end of the Lightning-Lord's current turn, stacking up to 3 time(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.JingYuan')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1204')

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
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      r.talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)

      // Stats
      x.CR.buff((r.skillCritBuff) ? 0.10 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling * r.talentAttacks, SOURCE_TALENT)

      // Boost
      buffAbilityCd(x, FUA_DMG_TYPE, (r.talentHitsPerAction >= 6) ? 0.25 : 0, SOURCE_TRACE)
      buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE | ULT_DMG_TYPE, (e >= 2 && r.e2DmgBuff) ? 0.20 : 0, SOURCE_E2)
      buffAbilityVulnerability(x, FUA_DMG_TYPE, (e >= 6) ? r.e6FuaVulnerabilityStacks * 0.12 : 0, SOURCE_E6)

      // Lightning lord calcs
      const hits = r.talentAttacks

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(5 * hits, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(getHitMulti(action, context)),
  }
}
