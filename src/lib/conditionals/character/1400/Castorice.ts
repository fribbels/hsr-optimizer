import { AbilityType, BUFF_PRIORITY_MEMO, BUFF_PRIORITY_SELF } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*
Sanctuary of Mooncocoon

After obtaining Castorice or when Castorice is in the current team, receive the following effect: In battle, when an ally character receives a killing blow, all ally characters that received a killing blow in this action enter the "Mooncocoon" state. Characters in "Mooncocoon" temporarily delay becoming downed and can take actions normally. After the action and before the start of the next turn, if their current HP increases or they gain a Shield, "Mooncocoon" is removed. Otherwise, they will be downed immediately. This effect can only trigger once per battle.
Hidden Stat: 0.1


Doomshriek, Dawn's Chime

Ultimate

Summons the memosprite Netherwing and advances its action by 100%. At the same time, deploys the Territory "Lost Netherland," which decreases all enemies' All-Type RES by 20%. If Castorice has the DMG Boost effect from her Talent, then this effect spreads to Netherwing. Netherwing has an initial SPD of 165 and a set Max HP equal to 100% of max "Newbud."
After Netherwing experiences 3 turns or when its HP is 0, it disappears and dispels the Territory "Lost Netherland."
Hidden Stat: 0

Summon Memosprite
Summon the memosprite to the field. If the memosprite is already on the field, dispels all Crowd Control debuffs the memosprite is afflicted with.

Territory
Territory effects are unique in the battle. While it exists, other abilities with Territory effects cannot be used.

Lv10

Claw Splits the Veil

Memosprite Skill

Deals Quantum DMG equal to 40% of Castorice's Max HP to all enemies.

 All 10

Lv6

Breath Scorches the Shadow

Memosprite Skill

Launching "Breath Scorches the Shadow" will consume 25% of Netherwing's Max HP to deal Quantum DMG equal to 24% of Castorice's Max HP to all enemies.
In one attack, "Breath Scorches the Shadow" can be launched repeatedly, with the DMG multiplier increased progressively to 28% / 34%. After reaching 34%, it will not increase further. The DMG Multiplier Boost effect will not decrease before Netherwing disappears.
When Netherwing's current HP is equal to or less than 25% of its Max HP, launching this ability will actively reduce HP down to 1, and then trigger the ability effect equal to that of the Talent "Wings Sweep the Ruins."

 All 10

Lv6

Mooncocoon Shrouds the Form

Memosprite Talent

When Netherwing is on the field, it acts as backup for allies. When allies take DMG or consume HP, their current HP can be reduced down to a minimum of 1, after which Netherwing will bear the HP loss. But Netherwing consumes HP equal to 500% of the original value. This lasts until Netherwing disappears.

Backup
Enemies cannot actively target backup units. Allies' Blast-type abilities cannot Blast to backup units.

Lv6

Roar Rumbles the Realm

Memosprite Talent

When Netherwing is summoned, increases DMG dealt by all allies by 10%, lasting for 3 turn(s).

Lv6

Wings Sweep the Ruins

Memosprite Talent

When Netherwing disappears, deals 6 instance(s) of DMG, with each instance dealing Quantum DMG equal to 40% of Castorice's Max HP to one random enemy. At the same time, restores HP by an amount equal to 6% of Castorice's Max HP plus 800 for all allies.

 Single 5

Lv6

Breath Scorches the Shadow

Memosprite Skill


Hidden Stat: 0.25

 All 10

Lv6

Breath Scorches the Shadow

Memosprite Skill


Hidden Stat: 0.25

 All 10

Lv6

Wings Sweep the Ruins

Memosprite Skill

Consumes all HP and deals 6 instance(s) of DMG, with each instance dealing Quantum DMG equal to 40% of Castorice's Max HP to one random enemy. At the same time, restores HP by an amount equal to 6% of Castorice's Max HP plus 800 for all allies.

 Single 5

Lv6

Lament, Nethersea's Ripple

Basic ATK+1

Deals Quantum DMG equal to 50% of Castorice's Max HP to one designated enemy.

 Single 10

Lv6

Silence, Wraithfly's Caress

Skill

Consumes 30% of all allies' current HP. Deals Quantum DMG equal to 50% of Castorice's Max HP to one designated enemy and Quantum DMG equal to 30% of Castorice's Max HP to adjacent targets.
If the current HP is insufficient, reduces the current HP down to 1.
If Netherwing is on the battlefield, the Skill becomes "Boneclaw, Doomdrake's Embrace" instead.

 Single 20 | Other 10

Lv10

Boneclaw, Doomdrake's Embrace

Skill

Consumes 40% of the current HP of all allies (except Netherwing). Castorice and Netherwing launch Joint ATK on the targets, dealing Quantum DMG equal to 30% and 50% of Castorice's Max HP to all enemies.
If the current HP is insufficient, reduces the current HP down to 1.

Joint Attack
Multiple targets respectively use attacks on enemy targets in one action.

 All 20

Lv10

Doomshriek, Dawn's Chime

Ultimate

Summons the memosprite Netherwing and advances its action by 100%. At the same time, deploys the Territory "Lost Netherland," which decreases all enemies' All-Type RES by 20%. If Castorice has the DMG Boost effect from her Talent, then this effect spreads to Netherwing. Netherwing has an initial SPD of 165 and a set Max HP equal to 100% of max "Newbud."
After Netherwing experiences 3 turns or when its HP is 0, it disappears and dispels the Territory "Lost Netherland."
Hidden Stat: 0

Summon Memosprite
Summon the memosprite to the field. If the memosprite is already on the field, dispels all Crowd Control debuffs the memosprite is afflicted with.

Territory
Territory effects are unique in the battle. While it exists, other abilities with Territory effects cannot be used.

Lv10

Desolation Across Palms

Talent

The maximum limit of "Newbud" is related to the levels of all characters on the battlefield. For every 1 point of HP lost by all allies, Castorice gains 1 point of "Newbud." When "Newbud" reaches its maximum limit, can activate the Ultimate. When allies lose HP, Castorice's and Netherwing's DMG dealt increases by 20%. This effect can stack up to 3 time(s), lasting for 3 turn(s).
When Netherwing is on the field, "Newbud" cannot be gained through Talent, and every 1 point of HP lost by all allies (except Netherwing) will be converted to an equal amount of HP for Netherwing.
Hidden Stat: 0

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Wail, Death's Herald

Technique

After using Technique, enters the "Netherveil" state that lasts for 20 seconds. While "Netherveil" is active, enemies are unable to actively approach Castorice.
During "Netherveil," active attacks will cause all enemies within range to enter combat. At the same time, summons the memosprite Netherwing, advances its action by 100%, and deploys the Territory "Lost Netherland." Netherwing has its current HP equal to 50% of max "Newbud." After entering battle, consumes 40% of the current HP of all allies (except Netherwing).
If Netherwing is not summoned after entering battle, Castorice gains "Newbud" by an amount equal to 30% of max "Newbud."


Stat Boosts

 +18.7% CRIT Rate
 +14.4% Quantum DMG Boost
 +13.3% CRIT DMG

Contained Dark Tide

After ally targets (excluding Netherwing) receive healing, converts 100% of the healed amount into "Newbud." If Netherwing is on the field, this is converted to Netherwing's HP instead. Each ally target can accumulate a conversion amount up to 12% of the max "Newbud." After any unit takes action, all units reset their accumulated conversion amount.


Inverted Torch

When Castorice's current HP is higher than or equal to 50% of her Max HP, her SPD increases by 40%. When Netherwing uses "Breath Scorches the Shadow" and deals fatal damage to all enemies on the field or brings them to a point where their HP cannot be reduced further, Netherwing's SPD increases by 100%, lasting for 1 turn.


Where The West Wind Dwells

Each time Netherwing uses "Breath Scorches the Shadow," the DMG dealt increases by 30%. This effect stacks up to 6 time(s) and lasts until the end of this turn.



1 Snowbound Maiden, Memory to Tomb

When the enemy target's current HP is 80%/50% of Max HP or lower, the DMG dealt to it by "Boneclaw, Doomdrake's Embrace," "Claw Splits the Veil," "Breath Scorches the Shadow," and "Wings Sweep the Ruins" is 120%/140% of the original DMG respectively.



2 Crown on Wings of Bloom

After summoning the memosprite Netherwing, Castorice gains 2 stack(s) of "Ardent Will." "Ardent Will" can stack up to 2 time(s) and can be used to offset the HP cost of Netherwing's Memosprite Skill, "Breath Scorches the Shadow" and advance Castorice's action by 100%. When using the next Enhanced Skill, Castorice gains "Newbud" by an amount equal to 30% of max "Newbud."



3 Pious Pilgrim, Dance in Doom

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.
Memosprite Talent Lv. +1, up to a maximum of Lv. 10.



4 Rest in Songs of Gloom

While Castorice is on the field, all allies' HP restored when receiving healing increases by 20%.



5 Pristine Pages, Prophecy as Plume

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.
Memosprite Skill Lv. +1, up to a maximum of Lv. 10.



6 Await for Years to Loom

When Castorice or Netherwing deals DMG, increases Quantum RES PEN by 20%. During Netherwing's attacks, can reduce enemy Toughness regardless of Weakness Types. When breaking Weaknesses, triggers the Quantum Weakness Break effect. And the number of Bounces for Netherwing's Talent "Wings Sweep the Ruins" additionally increases by 3.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Castorice.Content')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.ULT_BASIC_MEMO_TALENT_3_SKILL_TALENT_MEMO_SKILL_5
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
  } = Source.character('1407')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillScaling = skill(e, 0.50, 0.55)
  const skillEnhancedScaling1 = skill(e, 0.30, 0.33)
  const skillEnhancedScaling2 = skill(e, 0.50, 0.55)

  const talentDmgBoost = talent(e, 0.20, 0.22)
  const ultTerritoryResPen = ult(e, 0.20, 0.22)

  const memoSkillScaling1 = memoSkill(e, 0.24, 0.264)
  const memoSkillScaling2 = memoSkill(e, 0.28, 0.308)
  const memoSkillScaling3 = memoSkill(e, 0.34, 0.374)

  const memoTalentScaling = memoTalent(e, 0.40, 0.44)

  const defaults = {
    buffPriority: BUFF_PRIORITY_MEMO,
    memospriteActive: true,
    spdBuff: true,
    talentDmgStacks: 3,
    memoSkillEnhances: 3,
    memoTalentHits: e >= 6 ? 9 : 6,
    teamDmgBoost: true,
    memoDmgStacks: 3,
    e1EnemyHp50: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    memospriteActive: true,
    teamDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffPriority: {
      id: 'buffPriority',
      formItem: 'select',
      text: tBuff('Text'),
      content: tBuff('Content'),
      options: [
        { display: tBuff('Self'), value: BUFF_PRIORITY_SELF, label: tBuff('Self') },
        { display: tBuff('Memo'), value: BUFF_PRIORITY_MEMO, label: tBuff('Memo') },
      ],
      fullWidth: true,
    },
    memospriteActive: {
      id: 'memospriteActive',
      formItem: 'switch',
      text: t('memospriteActive.text'),
      content: t('memospriteActive.content', { ResDown: TsUtils.precisionRound(100 * ultTerritoryResPen) }),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: t('spdBuff.text'),
      content: t('spdBuff.content'),
    },
    teamDmgBoost: {
      id: 'teamDmgBoost',
      formItem: 'switch',
      text: t('teamDmgBoost.text'),
      content: t('teamDmgBoost.content'),
    },
    talentDmgStacks: {
      id: 'talentDmgStacks',
      formItem: 'slider',
      text: t('talentDmgStacks.text'),
      content: t('talentDmgStacks.content', { DmgBuff: TsUtils.precisionRound(100 * talentDmgBoost) }),
      min: 0,
      max: 3,
    },
    memoSkillEnhances: {
      id: 'memoSkillEnhances',
      formItem: 'slider',
      text: t('memoSkillEnhances.text'),
      content: t('memoSkillEnhances.content', {
        Multiplier1Enhance: TsUtils.precisionRound(100 * memoSkillScaling2),
        Multiplier2Enhance: TsUtils.precisionRound(100 * memoSkillScaling3),
      }),
      min: 1,
      max: 3,
    },
    memoDmgStacks: {
      id: 'memoDmgStacks',
      formItem: 'slider',
      text: t('memoDmgStacks.text'),
      content: t('memoDmgStacks.content'),
      min: 0, // Set to 0 for rotation preprocessor
      max: 6,
    },
    memoTalentHits: {
      id: 'memoTalentHits',
      formItem: 'slider',
      text: t('memoTalentHits.text'),
      content: t('memoTalentHits.content', {
        BounceCount: e >= 6 ? 9 : 6,
        Scaling: TsUtils.precisionRound(100 * memoTalentScaling),
      }),
      min: 0,
      max: e >= 6 ? 9 : 6,
    },
    e1EnemyHp50: {
      id: 'e1EnemyHp50',
      formItem: 'switch',
      text: t('e1EnemyHp50.text'),
      content: t('e1EnemyHp50.content'),
      disabled: e < 1,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('e6Buffs.text'),
      content: t('e6Buffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    memospriteActive: content.memospriteActive,
    teamDmgBoost: content.teamDmgBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.MEMO_SKILL, AbilityType.MEMO_TALENT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
      x.MEMOSPRITE.set(1, SOURCE_TALENT)
      x.MEMO_BUFF_PRIORITY.set(r.buffPriority == BUFF_PRIORITY_SELF ? BUFF_PRIORITY_SELF : BUFF_PRIORITY_MEMO, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SPD_P.buff((r.spdBuff) ? 0.40 : 0, SOURCE_TRACE)

      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_HP_SCALING.buff((r.memospriteActive) ? skillEnhancedScaling1 : skillScaling, SOURCE_SKILL)
      x.m.SKILL_SPECIAL_SCALING.buff((r.memospriteActive) ? skillEnhancedScaling2 : 0, SOURCE_SKILL)

      x.ELEMENTAL_DMG.buffBaseDual(talentDmgBoost * r.talentDmgStacks, SOURCE_TALENT)
      if (e >= 1) {
        x.m.FINAL_DMG_BOOST.buff((r.e1EnemyHp50) ? 0.40 : 0.20, SOURCE_E1)
      }

      x.QUANTUM_RES_PEN.buffBaseDual((e >= 6 && r.e6Buffs) ? 0.20 : 0, SOURCE_E6)

      x.MEMO_BASE_SPD_FLAT.buff(165, SOURCE_MEMO)
      x.MEMO_BASE_HP_FLAT.buff(34000, SOURCE_MEMO)

      x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 1 ? memoSkillScaling1 : 0, SOURCE_MEMO)
      x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 2 ? memoSkillScaling2 : 0, SOURCE_MEMO)
      x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 3 ? memoSkillScaling3 : 0, SOURCE_MEMO)
      x.m.MEMO_TALENT_SPECIAL_SCALING.buff(r.memoTalentHits * memoTalentScaling, SOURCE_MEMO)

      x.m.ELEMENTAL_DMG.buff(0.30 * r.memoDmgStacks, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_BASIC)
      x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(10, SOURCE_MEMO)
      x.m.MEMO_TALENT_TOUGHNESS_DMG.buff(5 * (r.memoTalentHits), SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES_PEN.buffTeam((m.memospriteActive) ? ultTerritoryResPen : 0, SOURCE_ULT)
      x.ELEMENTAL_DMG.buffTeam((m.teamDmgBoost) ? 0.10 : 0, SOURCE_MEMO)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // Scales off of Castorice's HP not the memo
      x.m.SKILL_DMG.buff(x.m.a[Key.SKILL_SPECIAL_SCALING] * x.a[Key.HP], Source.NONE)
      x.m.MEMO_SKILL_DMG.buff(x.m.a[Key.MEMO_SKILL_SPECIAL_SCALING] * x.a[Key.HP], Source.NONE)
      x.m.MEMO_TALENT_DMG.buff(x.m.a[Key.MEMO_TALENT_SPECIAL_SCALING] * x.a[Key.HP], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return ` 
m.SKILL_DMG += m.SKILL_SPECIAL_SCALING * x.HP;
m.MEMO_SKILL_DMG += m.MEMO_SKILL_SPECIAL_SCALING * x.HP;
m.MEMO_TALENT_DMG += m.MEMO_TALENT_SPECIAL_SCALING * x.HP;
`
    },
  }
}
