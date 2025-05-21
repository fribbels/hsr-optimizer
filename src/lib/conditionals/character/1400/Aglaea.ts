import { AbilityType, BUFF_PRIORITY_MEMO, BUFF_PRIORITY_SELF } from 'lib/conditionals/conditionalConstants'
import { basicAdditionalDmgAtkFinalizer, gpuBasicAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Rosy-Fingered

Talent+10

The memosprite Garmentmaker has an initial SPD equal to 35% of Aglaea's SPD and a Max HP equal to 66% of Aglaea's Max HP plus 720. While Garmentmaker is on the field, Aglaea's attacks inflict the target with the "Seam Stitch" state. After attacking enemies in the "Seam Stitch" state, further deals Lightning Additional DMG equal to 30% of Aglaea's ATK. "Seam Stitch" only takes effect on the most recently inflicted target.
Hidden Stat: 0
Hidden Stat: 0

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Thorned Snare

Memosprite Skill+10

Deals Lightning DMG equal to 110% ATK to one enemy and Lightning DMG equal to 66% ATK to adjacent targets.
Hidden Stat: 1

 Single 10 | Other 5

Lv6

A Body Brewed by Tears

Memosprite Talent

After attacking an enemy afflicted with "Seam Stitch," increases this unit's SPD by 55, stacking up to 6 time(s). During Garmentmaker's turn, automatically uses "Thorned Snare," prioritizing enemies under the "Seam Stitch" state.
Hidden Stat: 3

Lv6

The Speeding Summer

Memosprite Talent

When Garmentmaker is summoned, this unit's action advances by 100%.

Lv6

Bloom of Drying Grass

Memosprite Talent

When Garmentmaker disappears, regenerates 20 Energy for Aglaea.

Lv6

Thorned Nectar

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Aglaea's ATK to one designated enemy.
Hidden Stat: 1

 Single 10

Lv6

Rise, Exalted Renown

Skill-1+20

Restores HP to Garmentmaker by 50% of its Max HP. If Garmentmaker is absent, summons the memosprite Garmentmaker and this unit immediately takes action.
Hidden Stat: 0
Hidden Stat: 5

Summon Memosprite
Summon the memosprite to the field. If the memosprite is already on the field, dispels all Crowd Control debuffs the memosprite is afflicted with.

Lv10

Dance, Destined Weaveress

Ultimate350+5

Summons the memosprite Garmentmaker. If Garmentmaker is already on the field, then restores its HP to max. Aglaea enters the "Supreme Stance" state and immediately takes action.
While in the "Supreme Stance" state, Aglaea gains the SPD Boost stacks from Garmentmaker's Memosprite Talent, with each stack increasing her SPD by 15%. Enhances Basic ATK to "Slash by a Thousandfold Kiss," and cannot use Skill. Garmentmaker is immune to Crowd Control debuffs.
A countdown appears on the Action Order, with its own SPD set at 100. Using Ultimate again when the countdown is on the Action Order will reset the countdown. When the countdown's turn starts, Garmentmaker self-destructs. When Garmentmaker disappears, Aglaea's "Supreme Stance" state is dispelled.
Hidden Stat: 0
Hidden Stat: 0
Hidden Stat: 0
Hidden Stat: 0

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.

Lv10

Rosy-Fingered

Talent+10

The memosprite Garmentmaker has an initial SPD equal to 35% of Aglaea's SPD and a Max HP equal to 66% of Aglaea's Max HP plus 720. While Garmentmaker is on the field, Aglaea's attacks inflict the target with the "Seam Stitch" state. After attacking enemies in the "Seam Stitch" state, further deals Lightning Additional DMG equal to 30% of Aglaea's ATK. "Seam Stitch" only takes effect on the most recently inflicted target.
Hidden Stat: 0
Hidden Stat: 0

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Meteoric Sunder

Technique

Summons the memosprite Garmentmaker and launches a forward joint attack. After entering battle, regenerates 30 Energy and deals Lightning DMG equal to 100% of Aglaea's ATK to all enemy targets. Then, randomly inflicts the "Seam Stitch" state to a random enemy target.

 Single 20


Rise, Exalted Renown

Skill-1+20


Hidden Stat: 0.5

Lv10

Slash by a Thousandfold Kiss

Basic ATK+20

Aglaea and Garmentmaker launch a Joint ATK on the target, respectively dealing Lightning DMG equal to 200% of Aglaea's ATK and 200% of Garmentmaker's ATK to the target. Also, deal Lightning DMG equal to 90% of Aglaea's ATK and 90% of Garmentmaker's ATK to adjacent targets.
"Slash by a Thousandfold Kiss" cannot recover Skill Points.

Joint Attack
Multiple targets respectively use attacks on enemy targets in one action.

 Single 20 | Other 10

Lv6

Stat Boosts

 +22.4% Lightning DMG Boost
 +12.0% CRIT Rate
 +12.5% DEF

The Myopic's Doom

While in "Supreme Stance," increases Aglaea and Garmentmaker's ATK by an amount equal to 720% of Aglaea's SPD plus 360% of Garmentmaker's SPD.


Last Thread of Fate

When Garmentmaker disappears, up to 1 stack(s) of the SPD Boost from the Memosprite Talent can be retained. When Garmentmaker is summoned again, gains the corresponding number of SPD Boost stacks.


The Speeding Sol

At the start of battle, if this unit's Energy is lower than 50%, regenerates this unit's Energy until 50%.



1 Drift at the Whim of Venus

Enemies afflicted with "Seam Stitch" take 15% increased DMG. After Aglaea or Garmentmaker attacks this target, Aglaea additionally regenerates 20 Energy.



2 Sail on the Raft of Eyelids

When Aglaea or Garmentmaker takes action, the DMG dealt by Aglaea and Garmentmaker ignores 14% of the target's DEF. This effect stacks up to 3 time(s) and lasts until any unit, other than Aglaea or Garmentmaker, actively uses an ability.



3 Bequeath in the Coalescence of Dew

Skill Lv. +2, up to a maximum of Lv. 15. Basic ATK Lv. +1, up to a maximum of Lv. 10. Memosprite Talent Lv. +1, up to a maximum of Lv. 10.



4 Flicker Below the Surface of Marble

The SPD Boost effect from the Memosprite Talent has its max stack limit increased by 1. After Aglaea uses an attack, Garmentmaker can also gain the SPD Boost effect from the Memosprite Talent.
Hidden Stat: 2.0



5 Weave Under the Shroud of Woe

Ultimate Lv. +2, up to a maximum of Lv. 15. Talent Lv. +2, up to a maximum of Lv. 15. Memosprite Skill Lv. +1, up to a maximum of Lv. 10.



6 Fluctuate in the Tapestry of Fates

While Aglaea is in "Supreme Stance," increases her and Garmentmaker's Lightning RES PEN by 20%. When Aglaea or Garmentmaker's SPD is greater than 160/240/320, the DMG dealt by Joint ATK increases by 10%/30%/60%.

Joint Attack
Multiple targets respectively use attacks on enemy targets in one action.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aglaea')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.SKILL_BASIC_MEMO_TALENT_3_ULT_TALENT_MEMO_SKILL_5
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
  } = Source.character('1402')

  const basicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicScaling = basic(e, 2.00, 2.20)

  const ultSpdBoost = ult(e, 0.15, 0.16)

  const memoHpScaling = talent(e, 0.66, 0.704)
  const memoHpFlat = talent(e, 720, 828)
  const talentAdditionalDmg = talent(e, 0.30, 0.336)

  const memoSkillScaling = memoSkill(e, 1.10, 1.21)
  const memoTalentSpd = memoTalent(e, 55, 57.2)

  const memoSpdStacksMax = e >= 4 ? 7 : 6

  const defaults = {
    buffPriority: BUFF_PRIORITY_SELF,
    supremeStanceState: true,
    seamStitch: true,
    memoSpdStacks: memoSpdStacksMax,
    e1Vulnerability: true,
    e2DefShredStacks: 3,
    e6Buffs: true,
  }

  const teammateDefaults = {
    seamStitch: true,
    e1Vulnerability: true,
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
    supremeStanceState: {
      id: 'supremeStanceState',
      formItem: 'switch',
      text: t('Content.supremeStanceState.text'),
      content: t('Content.supremeStanceState.content', { SpdBuff: TsUtils.precisionRound(ultSpdBoost * 100) }),
    },
    seamStitch: {
      id: 'seamStitch',
      formItem: 'switch',
      text: t('Content.seamStitch.text'),
      content: t('Content.seamStitch.content', { Scaling: TsUtils.precisionRound(talentAdditionalDmg * 100) }),
    },
    memoSpdStacks: {
      id: 'memoSpdStacks',
      formItem: 'slider',
      text: t('Content.memoSpdStacks.text'),
      content: t('Content.memoSpdStacks.content', { SpdBuff: memoTalentSpd, StackLimit: memoSpdStacksMax }),
      min: 0,
      max: memoSpdStacksMax,
    },
    e1Vulnerability: {
      id: 'e1Vulnerability',
      formItem: 'switch',
      text: t('Content.e1Vulnerability.text'),
      content: t('Content.e1Vulnerability.content'),
      disabled: e < 1,
    },
    e2DefShredStacks: {
      id: 'e2DefShredStacks',
      formItem: 'slider',
      text: t('Content.e2DefShredStacks.text'),
      content: t('Content.e2DefShredStacks.content'),
      min: 1,
      max: 3,
      disabled: e < 2,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    seamStitch: content.seamStitch,
    e1Vulnerability: content.e1Vulnerability,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.MEMO_SKILL],
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

      x.BASIC_ATK_SCALING.buff((r.supremeStanceState) ? enhancedBasicScaling : basicScaling, SOURCE_BASIC)
      x.m.BASIC_ATK_SCALING.buff(enhancedBasicScaling, SOURCE_MEMO)

      x.SPD_P.buff((r.supremeStanceState) ? ultSpdBoost * r.memoSpdStacks : 0, SOURCE_ULT)

      x.MEMO_BASE_HP_SCALING.buff(memoHpScaling, SOURCE_MEMO)
      x.MEMO_BASE_HP_FLAT.buff(memoHpFlat, SOURCE_MEMO)
      x.MEMO_BASE_SPD_SCALING.buff(0.35, SOURCE_MEMO)
      x.MEMO_BASE_DEF_SCALING.buff(1, SOURCE_MEMO)
      x.MEMO_BASE_ATK_SCALING.buff(1, SOURCE_MEMO)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.seamStitch) ? talentAdditionalDmg : 0, SOURCE_TALENT)

      x.m.MEMO_SKILL_ATK_SCALING.buff(memoSkillScaling, SOURCE_MEMO)

      x.m.SPD.buff(r.memoSpdStacks * memoTalentSpd, SOURCE_MEMO)

      x.DEF_PEN.buff((e >= 2) ? 0.14 * r.e2DefShredStacks : 0, SOURCE_E2)
      x.m.DEF_PEN.buff((e >= 2) ? 0.14 * r.e2DefShredStacks : 0, SOURCE_E2)

      x.LIGHTNING_RES_PEN.buff((e >= 6 && r.e6Buffs && r.supremeStanceState) ? 0.20 : 0, SOURCE_E6)
      x.m.LIGHTNING_RES_PEN.buff((e >= 6 && r.e6Buffs && r.supremeStanceState) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff((r.supremeStanceState) ? 20 : 10, SOURCE_BASIC)
      x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(10, SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((e >= 1 && m.seamStitch && m.e1Vulnerability) ? 0.15 : 0, SOURCE_E1)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (e >= 6 && r.supremeStanceState && r.e6Buffs) {
        let jointBoost = 0
        if (x.a[Key.SPD] > 320 || x.m.a[Key.SPD] >= 320) {
          jointBoost = 0.60
        } else if (x.a[Key.SPD] > 240 || x.m.a[Key.SPD] >= 240) {
          jointBoost = 0.30
        } else if (x.a[Key.SPD] > 160 || x.m.a[Key.SPD] >= 160) {
          jointBoost = 0.10
        }

        x.BASIC_DMG_BOOST.buff(jointBoost, SOURCE_E6)
        x.m.BASIC_DMG_BOOST.buff(jointBoost, SOURCE_E6)
      }

      basicAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(e >= 6 && r.supremeStanceState && r.e6Buffs)}) {
  if (x.SPD > 320 || m.SPD > 320) {
    x.BASIC_DMG_BOOST += 0.60;
    m.BASIC_DMG_BOOST += 0.60;
  } else if (x.SPD > 240 || m.SPD > 240) {
    x.BASIC_DMG_BOOST += 0.30;
    m.BASIC_DMG_BOOST += 0.30;
  } else if (x.SPD > 160 || m.SPD > 160) {
    x.BASIC_DMG_BOOST += 0.10;
    m.BASIC_DMG_BOOST += 0.10;
  }
}

${gpuBasicAdditionalDmgAtkFinalizer()}
`
    },
    dynamicConditionals: [
      {
        id: 'AglaeaConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.supremeStanceState) {
            return
          }
          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = 7.20 * x.a[Key.SPD] + 3.60 * x.m.a[Key.SPD]

          action.conditionalState[this.id] = buffValue
          x.ATK.buffDynamic(buffValue - stateValue, SOURCE_TRACE, action, context)
          x.m.ATK.buffDynamic(buffValue - stateValue, SOURCE_TRACE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.supremeStanceState)}) {
  return;
}
let spd = x.SPD;
let memoSpd = (*p_m).SPD;
let stateValue: f32 = (*p_state).AglaeaConversionConditional;
let buffValue: f32 = 7.20 * spd + 3.60 * memoSpd;

(*p_state).AglaeaConversionConditional = buffValue;
(*p_x).ATK += buffValue - stateValue;
(*p_m).ATK += buffValue - stateValue;
    `)
        },
      },
    ],
  }
}
