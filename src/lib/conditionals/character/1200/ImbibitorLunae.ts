import { AbilityType, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityResPen } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Beneficent Lotus

Basic ATK+1+20

Uses a 2-hit attack and deals Imaginary DMG equal to 100% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target.

 Single 10

Lv6

Transcendence

Basic ATK-1+30

Uses a 3-hit attack and deals Imaginary DMG equal to 260% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target.

 Single 20

Lv6

Divine Spear

Basic ATK-2+35

Uses a 5-hit attack and deals Imaginary DMG equal to 380% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. From the fourth hit onward, simultaneously deals Imaginary DMG equal to 60% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets.

 Single 30 | Other 10

Lv6

Fulgurant Leap

Basic ATK-3+40

Uses a 7-hit attack and deals Imaginary DMG equal to 500% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. From the fourth hit onward, simultaneously deal Imaginary DMG equal to 180% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets.

 Single 40 | Other 20

Lv6

Dracore Libre

Skill

Enhances Basic ATK. Enhancements may be applied up to 3 times consecutively. Using this ability does not consume Skill Points and is not considered as using a Skill.
Enhanced once, Beneficent Lotus becomes Transcendence.
Enhanced twice, Beneficent Lotus becomes Divine Spear.
Enhanced thrice, Beneficent Lotus becomes Fulgurant Leap.
When using Divine Spear or Fulgurant Leap, starting from the fourth hit, 1 stack of Outroar is gained before every hit. Each stack of Outroar increases Dan Heng • Imbibitor Lunae's CRIT DMG by 12%, for a max of 4 stacks. These stacks last until the end of his turn.

Lv10

Azure's Aqua Ablutes All

Ultimate140+5

Uses a 3-hit attack and deals Imaginary DMG equal to 300% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. At the same time, deals Imaginary DMG equal to 140% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets. Then, obtains 2 Squama Sacrosancta.
It's possible to hold up to 3 Squama Sacrosancta, which can be used to offset Dan Heng • Imbibitor Lunae's consumption of skill points. Consuming Squama Sacrosancta is considered equivalent to consuming skill points.

 Single 20 | Other 20

Lv10

Righteous Heart

Talent

After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains 1 stack of Righteous Heart, increasing his DMG by 10%. This effect can stack up to 6 time(s), lasting until the end of his turn.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Heaven-Quelling Prismadrakon

Technique

After using his Technique, Dan Heng • Imbibitor Lunae enters the Leaping Dragon state for 20 seconds. While in the Leaping Dragon state, using his attack enables him to move forward rapidly for a set distance, attacking all enemies he touches and blocking all incoming attacks. After entering combat via attacking enemies in the Leaping Dragon state, Dan Heng • Imbibitor Lunae deals Imaginary DMG equal to 120% of his ATK to all enemies, and gains 1 Squama Sacrosancta.


Cancel

Skill

Cancel Enhancement


Stat Boosts

 +22.4% Imaginary DMG Boost
 +12.0% CRIT Rate
 +10.0% HP

Star Veil

At the start of the battle, immediately regenerates 15 Energy.


Aqua Reign

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Jolt Anew

When dealing DMG to enemy targets with Imaginary Weakness, CRIT DMG increases by 24%.



1 Tethered to Sky

Increases the stackable Righteous Heart count by 4, and gains 1 extra stack of Righteous Heart for each hit during an attack.



2 Imperium On Cloud Nine

After using his Ultimate, Dan Heng • Imbibitor Lunae's action advances by 100% and gains 1 extra "Squama Sacrosancta."



3 Clothed in Clouds

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Zephyr's Bliss

The buff effect granted by "Outroar" lasts until the end of this unit's next turn.



5 Fall is the Pride

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Reign, Returned

After another ally character uses their Ultimate, the Imaginary RES PEN of Dan Heng • Imbibitor Lunae's next "Fulgurant Leap" attack increases by 20%. This effect can stack up to 3 time(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.ImbibitorLunae')
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
  } = Source.character('1213')

  const righteousHeartStackMax = (e >= 1) ? 10 : 6
  const outroarStackCdValue = skill(e, 0.12, 0.132)
  const righteousHeartDmgValue = talent(e, 0.10, 0.11)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhanced1Scaling = basic(e, 2.60, 2.86)
  const basicEnhanced2Scaling = basic(e, 3.80, 4.18)
  const basicEnhanced3Scaling = basic(e, 5.00, 5.50)
  const ultScaling = ult(e, 3.00, 3.24)

  const defaults = {
    basicEnhanced: 3,
    skillOutroarStacks: 4,
    talentRighteousHeartStacks: righteousHeartStackMax,
    e6ResPenStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'slider',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content', {
        basicScaling: TsUtils.precisionRound(100 * basicScaling),
        basicEnhanced1Scaling: TsUtils.precisionRound(100 * basicEnhanced1Scaling),
        basicEnhanced2Scaling: TsUtils.precisionRound(100 * basicEnhanced2Scaling),
        basicEnhanced3Scaling: TsUtils.precisionRound(100 * basicEnhanced3Scaling),
      }),
      min: 0,
      max: 3,
    },
    skillOutroarStacks: {
      id: 'skillOutroarStacks',
      formItem: 'slider',
      text: t('Content.skillOutroarStacks.text'),
      content: t('Content.skillOutroarStacks.content', { outroarStackCdValue: TsUtils.precisionRound(100 * outroarStackCdValue) }),
      min: 0,
      max: 4,
    },
    talentRighteousHeartStacks: {
      id: 'talentRighteousHeartStacks',
      formItem: 'slider',
      text: t('Content.talentRighteousHeartStacks.text'),
      content: t('Content.talentRighteousHeartStacks.content', { righteousHeartDmgValue: TsUtils.precisionRound(100 * righteousHeartDmgValue) }),
      min: 0,
      max: righteousHeartStackMax,
    },
    e6ResPenStacks: {
      id: 'e6ResPenStacks',
      formItem: 'slider',
      text: t('Content.e6ResPenStacks.text'),
      content: t('Content.e6ResPenStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CD.buff((context.enemyElementalWeak) ? 0.24 : 0, SOURCE_TRACE)
      x.CD.buff(r.skillOutroarStacks * outroarStackCdValue, SOURCE_SKILL)

      // Scaling
      const basicScalingValue = {
        0: basicScaling,
        1: basicEnhanced1Scaling,
        2: basicEnhanced2Scaling,
        3: basicEnhanced3Scaling,
      }[r.basicEnhanced] ?? 0
      x.BASIC_ATK_SCALING.buff(basicScalingValue, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      x.ELEMENTAL_DMG.buff(r.talentRighteousHeartStacks * righteousHeartDmgValue, SOURCE_TALENT)
      buffAbilityResPen(x, BASIC_DMG_TYPE, (e >= 6 && r.basicEnhanced == 3) ? 0.20 * r.e6ResPenStacks : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10 + 10 * r.basicEnhanced, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
