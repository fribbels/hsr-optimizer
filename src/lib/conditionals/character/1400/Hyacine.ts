import {
  AbilityType,
  BUFF_PRIORITY_MEMO,
  BUFF_PRIORITY_SELF,
  SKILL_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { newConditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import {
  wgslFalse,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const HyacineEntities = createEnum('Hyacine', 'Ica')
export const HyacineAbilities = createEnum('BASIC', 'SKILL_HEAL', 'ULT_HEAL', 'MEMO_SKILL', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hyacine.Content')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill } = AbilityEidolon.ULT_BASIC_MEMO_SKILL_3_SKILL_TALENT_MEMO_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1409')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillHealScaling = skill(e, 0.08, 0.088)
  const skillHealFlat = skill(e, 160, 178)

  const ultHealScaling = ult(e, 0.10, 0.11)
  const ultHealFlat = ult(e, 200, 222.5)

  const ultHpBuffPercent = ult(e, 0.30, 0.33)
  const ultHpBuffFlat = ult(e, 600, 667.5)

  const talentHealingDmgStackValue = talent(e, 0.80, 0.88)

  const memoSkillScaling = memoSkill(e, 0.20, 0.22)

  const defaults = {
    healAbility: SKILL_DMG_TYPE,
    buffPriority: BUFF_PRIORITY_MEMO,
    clearSkies: true,
    healTargetHp50: true,
    resBuff: true,
    spd200HpBuff: true,
    healingDmgStacks: 3,
    healTallyMultiplier: 20,
    e1HpBuff: true,
    e2SpdBuff: true,
    e4CdBuff: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    clearSkies: true,
    e1HpBuff: true,
    e2SpdBuff: true,
    e6ResPen: true,
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
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
      ],
      fullWidth: true,
    },
    healTargetHp50: {
      id: 'healTargetHp50',
      formItem: 'switch',
      text: t('healTargetHp50.text'),
      content: t('healTargetHp50.content'),
    },
    resBuff: {
      id: 'resBuff',
      formItem: 'switch',
      text: t('resBuff.text'),
      content: t('resBuff.content'),
    },
    spd200HpBuff: {
      id: 'spd200HpBuff',
      formItem: 'switch',
      text: t('spd200HpBuff.text'),
      content: t('spd200HpBuff.content'),
    },
    clearSkies: {
      id: 'clearSkies',
      formItem: 'switch',
      text: t('clearSkies.text'),
      content: t('clearSkies.content', {
        UltHpBuffScaling: TsUtils.precisionRound(100 * ultHpBuffPercent),
        UltHpBuffFlat: TsUtils.precisionRound(ultHpBuffFlat),
      }),
    },
    healingDmgStacks: {
      id: 'healingDmgStacks',
      formItem: 'slider',
      text: t('healingDmgStacks.text'),
      content: t('healingDmgStacks.content', {
        TalentDmgBuff: TsUtils.precisionRound(100 * talentHealingDmgStackValue),
      }),
      min: 0,
      max: 3,
    },
    healTallyMultiplier: {
      id: 'healTallyMultiplier',
      formItem: 'slider',
      text: t('healTallyMultiplier.text'),
      content: t('healTallyMultiplier.content'),
      min: 1,
      max: 100,
    },
    e1HpBuff: {
      id: 'e1HpBuff',
      formItem: 'switch',
      text: t('e1HpBuff.text'),
      content: t('e1HpBuff.content'),
      disabled: e < 1,
    },
    e2SpdBuff: {
      id: 'e2SpdBuff',
      formItem: 'switch',
      text: t('e2SpdBuff.text'),
      content: t('e2SpdBuff.content'),
      disabled: e < 2,
    },
    e4CdBuff: {
      id: 'e4CdBuff',
      formItem: 'switch',
      text: t('e4CdBuff.text'),
      content: t('e4CdBuff.content'),
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: t('e6ResPen.text'),
      content: t('e6ResPen.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    clearSkies: content.clearSkies,
    e1HpBuff: content.e1HpBuff,
    e2SpdBuff: content.e2SpdBuff,
    e6ResPen: content.e6ResPen,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.MEMO_SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    // Entity declarations
    entityDeclaration: () => Object.values(HyacineEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [HyacineEntities.Hyacine]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
      [HyacineEntities.Ica]: {
        primary: false,
        summon: false,
        memosprite: true,
        memoBaseAtkScaling: 1.00,
        memoBaseDefScaling: 1.00,
        memoBaseHpScaling: 0.50,
        memoBaseHpFlat: 0,
        memoBaseSpdScaling: 0,
        memoBaseSpdFlat: 0,
      },
    }),

    // Action declarations
    actionDeclaration: () => Object.values(HyacineAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Select heal scaling based on user choice
      const healScaling = r.healAbility === SKILL_DMG_TYPE ? skillHealScaling : ultHealScaling
      const healFlat = r.healAbility === SKILL_DMG_TYPE ? skillHealFlat : ultHealFlat
      const healDamageType = r.healAbility === SKILL_DMG_TYPE ? DamageTag.SKILL : DamageTag.ULT

      return {
        [HyacineAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .hpScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [HyacineAbilities.SKILL_HEAL]: {
          hits: [
            HitDefinitionBuilder.skillHeal()
              .hpScaling(skillHealScaling)
              .flatHeal(skillHealFlat)
              .build(),
          ],
        },
        [HyacineAbilities.ULT_HEAL]: {
          hits: [
            HitDefinitionBuilder.ultHeal()
              .hpScaling(ultHealScaling)
              .flatHeal(ultHealFlat)
              .build(),
          ],
        },
        [HyacineAbilities.MEMO_SKILL]: {
          hits: [
            // Fake heal hit - computes heal value with all buffs, stores to register, but doesn't add to comboHeal
            HitDefinitionBuilder.heal()
              .damageType(healDamageType)
              .hpScaling(healScaling)
              .flatHeal(healFlat)
              .recorded(false)
              .build(),
            // Damage hit - reads from previous hit's register value
            HitDefinitionBuilder.healTally()
              .sourceEntity(HyacineEntities.Ica)
              .damageType(DamageTag.SKILL | DamageTag.MEMO)
              .damageElement(ElementTag.Wind)
              .healTallyScaling(memoSkillScaling * r.healTallyMultiplier)
              .referenceHitOffset(-1)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [HyacineAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    // Container methods
    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.set(StatKey.SUMMONS, 1, x.source(SOURCE_TALENT))
      x.set(StatKey.MEMOSPRITE, 1, x.source(SOURCE_TALENT))
      x.set(StatKey.MEMO_BUFF_PRIORITY, r.buffPriority === BUFF_PRIORITY_SELF ? BUFF_PRIORITY_SELF : BUFF_PRIORITY_MEMO, x.source(SOURCE_TALENT))
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace: 100% CR
      x.buff(StatKey.CR, 1.00, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))

      // Trace: OHB when heal target HP < 50%
      x.buff(StatKey.OHB, (r.healTargetHp50) ? 0.25 : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))

      // Trace: RES buff
      x.buff(StatKey.RES, (r.resBuff) ? 0.50 : 0, x.source(SOURCE_TRACE))

      // Talent: Memosprite elemental DMG buff from healing stacks
      x.buff(StatKey.DMG_BOOST, r.healingDmgStacks * talentHealingDmgStackValue, x.target(HyacineEntities.Ica).source(SOURCE_TALENT))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Ult: HP buff (Clear Skies)
      x.buff(StatKey.HP, (m.clearSkies) ? ultHpBuffFlat : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.HP_P, (m.clearSkies) ? ultHpBuffPercent : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // E1: Additional HP% buff when Clear Skies active
      x.buff(StatKey.HP_P, (e >= 1 && m.e1HpBuff && m.clearSkies) ? 0.50 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))

      // E2: SPD% buff
      x.buff(StatKey.SPD_P, (e >= 2 && m.e2SpdBuff) ? 0.30 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      // E6: RES PEN buff
      x.buff(StatKey.RES_PEN, (e >= 6 && m.e6ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'HyacineSpdActivation',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.HP],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.spd200HpBuff && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 200
        },
        effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
          const selfBaseHp = x.getActionValueByIndex(StatKey.BASE_HP, SELF_ENTITY_INDEX)
          const memoEntityIndex = action.config.entityRegistry.getIndex(HyacineEntities.Ica)
          const memoBaseHp = x.getActionValueByIndex(StatKey.BASE_HP, memoEntityIndex)

          x.buffDynamic(StatKey.HP, 0.20 * selfBaseHp, action, context, x.source(SOURCE_TRACE))
          x.buffDynamic(StatKey.HP, 0.20 * memoBaseHp, action, context, x.target(HyacineEntities.Ica).source(SOURCE_TRACE))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const config = action.config
          const memoEntityIndex = config.entityRegistry.getIndex(HyacineEntities.Ica)

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (
  (*p_state).HyacineSpdActivation${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 200.0 &&
  ${wgslTrue(r.spd200HpBuff)}
) {
  (*p_state).HyacineSpdActivation${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.HP, config)} += 0.20 * ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BASE_HP, config)};
  ${p_containerActionVal(memoEntityIndex, StatKey.HP, config)} += 0.20 * ${containerActionVal(memoEntityIndex, StatKey.BASE_HP, config)};
}
    `,
          )
        },
      },
      {
        id: 'HyacineSpdConversion',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.OHB],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.spd200HpBuff && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) > 200
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.spd200HpBuff) {
            return
          }

          const statValue = x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)
          const unconvertibleValue = x.getActionValueByIndex(StatKey.UNCONVERTIBLE_SPD_BUFF, SELF_ENTITY_INDEX)

          const stateValue = action.conditionalState[this.id] ?? 0
          const convertibleValue = Math.min(400, statValue - unconvertibleValue)

          if (convertibleValue <= 0) return

          const buffFull = Math.max(0, 0.01 * Math.floor(convertibleValue - 200))
          const buffDelta = buffFull - stateValue

          action.conditionalState[this.id] = buffFull

          x.buffDynamic(StatKey.UNCONVERTIBLE_OHB_BUFF, buffDelta, action, context, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))
          x.buffDynamic(StatKey.OHB, buffDelta, action, context, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))

          if (e >= 4 && r.e4CdBuff) {
            x.buffDynamic(StatKey.UNCONVERTIBLE_CD_BUFF, buffDelta * 2, action, context, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_E4))
            x.buffDynamic(StatKey.CD, buffDelta * 2, action, context, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_E4))
          }
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const config = action.config
          const memoEntityIndex = config.entityRegistry.getIndex(HyacineEntities.Ica)

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${wgslFalse(r.spd200HpBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).${this.id}${action.actionIdentifier};
let convertibleValue: f32 = min(400.0, floor(${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} - ${containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_SPD_BUFF, config)}));

if (convertibleValue <= 0.0) {
  return;
}

let buffFull = max(0.0, 0.01 * (convertibleValue - 200.0));
let buffDelta = buffFull - stateValue;

(*p_state).${this.id}${action.actionIdentifier} = buffFull;

${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_OHB_BUFF, config)} += buffDelta;
${p_containerActionVal(memoEntityIndex, StatKey.UNCONVERTIBLE_OHB_BUFF, config)} += buffDelta;
${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.OHB, config)} += buffDelta;
${p_containerActionVal(memoEntityIndex, StatKey.OHB, config)} += buffDelta;

if (${wgslTrue(e >= 4 && r.e4CdBuff)}) {
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_CD_BUFF, config)} += buffDelta * 2.0;
  ${p_containerActionVal(memoEntityIndex, StatKey.UNCONVERTIBLE_CD_BUFF, config)} += buffDelta * 2.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, config)} += buffDelta * 2.0;
  ${p_containerActionVal(memoEntityIndex, StatKey.CD, config)} += buffDelta * 2.0;
}
    `,
          )
        },
      },
    ],
  }
}
