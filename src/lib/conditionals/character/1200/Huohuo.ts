import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Banner: Stormcaller

Basic ATK+1+20

Deals Wind DMG equal to 50% of Huohuo's Max HP to a target enemy.

 Single 10

Lv6

Talisman: Protection

Skill-1+30

Dispels 1 debuff(s) from a single target ally and immediately restores this ally's HP by an amount equal to 21% of Huohuo's Max HP plus 560. At the same time, restores HP for allies that are adjacent to this target ally by an amount equal to 16.8% of Huohuo's Max HP plus 448.

Lv10

Tail: Spiritual Domination

Ultimate140+5

Regenerates Energy for all teammates (i.e., excluding this unit) by an amount equal to 20% of their respective Max Energy. At the same time, increases their ATK by 40% for 2 turn(s).

Lv10

Possession: Ethereal Metaflow

Talent

After using her Skill, Huohuo gains Divine Provision, lasting for 2 turn(s). This duration decreases by 1 turn at the start of Huohuo's every turn. If Huohuo has Divine Provision when an ally's turn starts or when an ally uses their Ultimate, restores HP for that ally by an amount equal to 4.5% of Huohuo's Max HP plus 120. At the same time, every ally with 50% HP percentage or lower receives healing once.
When Divine Provision is triggered to heal an ally, dispel 1 debuff(s) from that ally. This effect can be triggered up to 6 time(s). Using the skill again resets the effect's trigger count.
Hidden Stat: 0

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Fiend: Impeachment of Evil

Technique

Huohuo terrorizes surrounding enemies, afflicting Horror-Struck on them. Enemies in Horror-Struck will flee away from Huohuo for 10 second(s). When entering battle with enemies in Horror-Struck, there is a 100% base chance of reducing every single enemy's ATK by 25% for 2 turn(s).


Stat Boosts

 +28.0% HP
 +18.0% Effect RES
 +5.0 SPD

Fearful to Act

When battle starts, Huohuo gains Divine Provision, lasting for 1 turn(s).


The Cursed One

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Stress Reaction to Horror

When her Talent is triggered to heal allies, Huohuo regenerates 1 Energy.



1 Anchored to Vessel, Specters Nestled

The duration of Divine Provision produced by the Talent is extended by 1 turn(s). When Huohuo possesses Divine Provision, all allies' SPD increases by 12%.



2 Sealed in Tail, Wraith Subdued

If Huohuo possesses "Divine Provision" when an ally target is struck by a killing blow, the ally will not be knocked down and their HP will immediately be restored by an amount equal to 50% of their Max HP. This reduces the duration of "Divine Provision" by 1 turn. This effect can only be triggered 2 time(s) per battle.



3 Cursed by Fate, Moths to Flame

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Tied in Life, Bound to Strife

When healing a target ally via Skill or Talent, the less HP the target ally currently has, the higher the amount of healing they will receive. The maximum increase in healing provided by Huohuo is 80%.



5 Mandated by Edict, Evils Evicted

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Woven Together, Cohere Forever

When healing a target ally, increases the target ally's DMG dealt by 50% for 2 turn(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Huohuo')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, ult, skill, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1217')

  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const skillHealScaling = talent(e, 0.21, 0.224)
  const skillHealFlat = talent(e, 560, 623)

  const talentHealScaling = skill(e, 0.045, 0.048)
  const talentHealFlat = skill(e, 120, 133.5)

  const defaults = {
    healAbility: NONE_TYPE,
    ultBuff: true,
    skillBuff: true,
    e6DmgBuff: true,
  }

  const teammateDefaults = {
    ultBuff: true,
    skillBuff: true,
    e6DmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        {
          display: tHeal('Skill'),
          value: SKILL_DMG_TYPE,
          label: tHeal('Skill'),
        },
        {
          display: tHeal('Talent'),
          value: 0,
          label: tHeal('Talent'),
        },
      ],
      fullWidth: true,
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', { ultBuffValue: TsUtils.precisionRound(100 * ultBuffValue) }),
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content'),
      disabled: e < 1,
    },
    e6DmgBuff: {
      id: 'e6DmgBuff',
      formItem: 'switch',
      text: t('Content.e6DmgBuff.text'),
      content: t('Content.e6DmgBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultBuff: content.ultBuff,
    skillBuff: content.skillBuff,
    e6DmgBuff: content.e6DmgBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((m.ultBuff) ? ultBuffValue : 0, SOURCE_ULT)
      x.SPD_P.buffTeam((e >= 1 && m.skillBuff) ? 0.12 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffTeam((e >= 6 && m.e6DmgBuff) ? 0.50 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardHpHealFinalizer(),
  }
}
