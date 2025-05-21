import { AbilityType, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Cloudlancer Art: North Wind

Basic ATK+1+20

Deals Wind DMG equal to 100% of Dan Heng's ATK to a single enemy.

 Single 10

Lv6

Cloudlancer Art: Torrent

Skill-1+30

Deals Wind DMG equal to 260% of Dan Heng's ATK to a single enemy.
When DMG dealt by Skill triggers CRIT Hit, there is a 100% base chance to reduce the target's SPD by 12%, lasting for 2 turn(s).

 Single 20

Lv10

Ethereal Dream

Ultimate100+5

Deals Wind DMG equal to 400% of Dan Heng's ATK to a single target enemy. If the attacked enemy is Slowed, the multiplier for the DMG dealt by Ultimate increases by 120%.

 Single 30

Lv10

Superiority of Reach

Talent

When Dan Heng becomes the target of an ally's ability, his next attack's Wind RES PEN increases by 36%. This effect can be triggered again after 2 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Splitting Spearhead

Technique

After Dan Heng uses his Technique, his ATK increases by 40% at the start of the next battle for 3 turn(s).


Stat Boosts

 +22.4% Wind DMG Boost
 +18.0% ATK
 +12.5% DEF

Hidden Dragon

When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.
Hidden Stat: 0.5


Faster Than Light

After launching an attack, there is a 50% fixed chance to increase this unit's SPD by 20% for 2 turn(s).


High Gale

Basic ATK deals 40% more DMG to Slowed enemies.



1 The Higher You Fly, the Harder You Fall

When the target enemy's current HP percentage is greater than or equal to 50%, CRIT Rate increases by 12%.



2 Quell the Venom Octet, Quench the Vice O'Flame

Reduces Talent cooldown by 1 turn.



3 Seen and Unseen

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Roaring Dragon and Soaring Sun

When Dan Heng uses his Ultimate to defeat an enemy, he will immediately take action again.



5 A Drop of Rain Feeds a Torrent

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 The Troubled Soul Lies in Wait

The Slow state triggered by Skill reduces the enemy's SPD by an extra 8%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.DanHeng')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1002')

  const extraPenValue = talent(e, 0.36, 0.396)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.60, 2.86)
  const ultScaling = ult(e, 4.00, 4.32)
  const ultExtraScaling = ult(e, 1.20, 1.296)

  const defaults = {
    talentPenBuff: true,
    enemySlowed: true,
    spdBuff: true,
    e1EnemyHp50: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentPenBuff: {
      id: 'talentPenBuff',
      formItem: 'switch',
      text: t('Content.talentPenBuff.text'),
      content: t('Content.talentPenBuff.content', { extraPenValue: TsUtils.precisionRound(100 * extraPenValue) }),
    },
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: t('Content.enemySlowed.content'),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      content: t('Content.spdBuff.content'),
    },
    e1EnemyHp50: {
      id: 'e1EnemyHp50',
      formItem: 'switch',
      text: t('Content.e1EnemyHp50.text'),
      content: t('Content.e1EnemyHp50.content'),
      disabled: e < 1,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 1 && r.e1EnemyHp50) ? 0.12 : 0, SOURCE_E1)
      x.SPD_P.buff((r.spdBuff) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((r.enemySlowed) ? ultExtraScaling : 0, SOURCE_ULT)

      // Boost
      x.RES_PEN.buff((r.talentPenBuff) ? extraPenValue : 0, SOURCE_TALENT)
      buffAbilityDmg(x, BASIC_DMG_TYPE, (r.enemySlowed) ? 0.40 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
