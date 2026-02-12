import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
  findMemospriteIndex,
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
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
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

export const SundayEntities = createEnum('Sunday')
export const SundayAbilities = createEnum('BASIC', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sunday')
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
  } = Source.character('1313')

  const skillDmgBoostValue = skill(e, 0.30, 0.33)
  const skillDmgBoostSummonValue = skill(e, 0.50, 0.55)
  const ultCdBoostValue = ult(e, 0.30, 0.336)
  const ultCdBoostBaseValue = ult(e, 0.12, 0.128)
  const talentCrBuffValue = talent(e, 0.20, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    skillDmgBuff: false,
    talentCrBuffStacks: 0,
    techniqueDmgBuff: false,
    e1DefPen: false,
    e2DmgBuff: false,
  }

  const teammateDefaults = {
    skillDmgBuff: true,
    talentCrBuffStacks: e < 6 ? 1 : 3,
    beatified: true,
    teammateCDValue: 2.50,
    techniqueDmgBuff: false,
    e1DefPen: true,
    e2DmgBuff: true,
    e6CrToCdConversion: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillDmgBuff: {
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t(
        'Content.skillDmgBuff.content',
        {
          DmgBoost: TsUtils.precisionRound(100 * skillDmgBoostValue),
          SummonDmgBoost: TsUtils.precisionRound(100 * skillDmgBoostSummonValue),
        },
      ),
    },
    talentCrBuffStacks: {
      id: 'talentCrBuffStacks',
      formItem: 'slider',
      text: t('Content.talentCrBuffStacks.text'),
      content: t('Content.talentCrBuffStacks.content', { CritRateBoost: TsUtils.precisionRound(100 * talentCrBuffValue) }),
      min: 0,
      max: e < 6 ? 1 : 3,
    },
    techniqueDmgBuff: {
      id: 'techniqueDmgBuff',
      formItem: 'switch',
      text: t('Content.techniqueDmgBuff.text'),
      content: t('Content.techniqueDmgBuff.content'),
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('Content.e1DefPen.text'),
      content: t('Content.e1DefPen.content'),
      disabled: e < 1,
    },
    e2DmgBuff: {
      id: 'e2DmgBuff',
      formItem: 'switch',
      text: t('Content.e2DmgBuff.text'),
      content: t('Content.e2DmgBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillDmgBuff: content.skillDmgBuff,
    talentCrBuffStacks: content.talentCrBuffStacks,
    beatified: {
      id: 'beatified',
      formItem: 'switch',
      text: t('TeammateContent.beatified.text'),
      content: t(
        'TeammateContent.beatified.content',
        {
          CritBuffScaling: TsUtils.precisionRound(100 * ultCdBoostValue),
          CritBuffFlat: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
        },
      ),
    },
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t(
        'TeammateContent.teammateCDValue.content',
        {
          CritBuffScaling: TsUtils.precisionRound(100 * ultCdBoostValue),
          CritBuffFlat: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
        },
      ),
      min: 0,
      max: 4.00,
      percent: true,
    },
    techniqueDmgBuff: content.techniqueDmgBuff,
    e1DefPen: content.e1DefPen,
    e2DmgBuff: content.e2DmgBuff,
    e6CrToCdConversion: {
      id: 'e6CrToCdConversion',
      formItem: 'switch',
      text: t('TeammateContent.e6CrToCdConversion.text'),
      content: t('TeammateContent.e6CrToCdConversion.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SundayEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SundayEntities.Sunday]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SundayAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SundayAbilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Imaginary)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [SundayAbilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // Scaling moved to actionDefinition
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>
      const hasSummons = x.getActionValueByIndex(StatKey.SUMMONS, SELF_ENTITY_INDEX) > 0

      // Talent CR buff
      x.buff(StatKey.CR, m.talentCrBuffStacks * talentCrBuffValue, x.targets(TargetTag.SelfAndSummon).deferrable().source(SOURCE_TALENT))

      // Skill DMG buffs
      x.buff(StatKey.DMG_BOOST, (m.skillDmgBuff) ? skillDmgBoostValue : 0, x.targets(TargetTag.SelfAndSummon).deferrable().source(SOURCE_SKILL))
      x.buff(StatKey.DMG_BOOST, (m.skillDmgBuff && hasSummons) ? skillDmgBoostSummonValue : 0, x.targets(TargetTag.SelfAndSummon).deferrable().source(SOURCE_SKILL))

      // Technique DMG buff
      x.buff(StatKey.DMG_BOOST, (m.techniqueDmgBuff) ? 0.50 : 0, x.targets(TargetTag.SelfAndSummon).deferrable().source(SOURCE_TECHNIQUE))

      // E1 DEF PEN - base 16% to self and summon
      x.buff(StatKey.DEF_PEN, (e >= 1 && m.e1DefPen && m.skillDmgBuff) ? 0.16 : 0, x.targets(TargetTag.SelfAndSummon).deferrable().source(SOURCE_E1))
      // E1 DEF PEN - extra 24% for summons only
      x.buff(StatKey.DEF_PEN, (e >= 1 && m.e1DefPen && m.skillDmgBuff && hasSummons) ? 0.24 : 0, x.targets(TargetTag.SummonsOnly).deferrable().source(SOURCE_E1))

      // E2 DMG buff
      x.buff(StatKey.DMG_BOOST, (e >= 2 && m.e2DmgBuff) ? 0.30 : 0, x.targets(TargetTag.SelfAndSummon).deferrable().source(SOURCE_E2))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = (t.beatified) ? ultCdBoostValue * t.teammateCDValue + ultCdBoostBaseValue : 0
      x.buff(StatKey.CD, cdBuff, x.targets(TargetTag.SelfAndSummon).deferrable().source(SOURCE_ULT))
      x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, cdBuff, x.targets(TargetTag.SelfAndSummon).deferrable().source(SOURCE_ULT))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    teammateDynamicConditionals: [
      {
        id: 'SundayMemoCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const memoIndex = findMemospriteIndex(action)
          if (memoIndex === -1) return false
          return x.getActionValueByIndex(StatKey.CR, memoIndex) > 1.00
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const deprioritize = x.getActionValueByIndex(StatKey.DEPRIORITIZE_BUFFS, SELF_ENTITY_INDEX)
          if (!(e >= 6 && r.e6CrToCdConversion && !deprioritize)) {
            return
          }

          const memoIndex = findMemospriteIndex(action)
          if (memoIndex === -1) return

          const memoCr = x.getActionValueByIndex(StatKey.CR, memoIndex)
          const memoUnconvertibleCr = x.getActionValueByIndex(StatKey.UNCONVERTIBLE_CR_BUFF, memoIndex)

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((memoCr - memoUnconvertibleCr - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          x.buffDynamic(StatKey.CD, buffValue - stateValue, action, context, x.targets(TargetTag.MemospritesOnly).source(SOURCE_E6))
          x.buffDynamic(StatKey.UNCONVERTIBLE_CD_BUFF, buffValue - stateValue, action, context, x.targets(TargetTag.MemospritesOnly).source(SOURCE_E6))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const config = action.config
          const memoIndex = findMemospriteIndex(action)

          if (memoIndex === -1) {
            return newConditionalWgslWrapper(this, action, context, `return;`)
          }

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${wgslFalse(e >= 6 && r.e6CrToCdConversion)}) {
  return;
}

if (${containerActionVal(SELF_ENTITY_INDEX, StatKey.DEPRIORITIZE_BUFFS, config)} > 0) {
  return;
}

let cr = ${containerActionVal(memoIndex, StatKey.CR, config)};
let unconvertibleCr = ${containerActionVal(memoIndex, StatKey.UNCONVERTIBLE_CR_BUFF, config)};

if (cr > 1.00) {
  let buffValue: f32 = floor((cr - unconvertibleCr - 1.00) / 0.01) * 2.00 * 0.01;
  let stateValue: f32 = (*p_state).${this.id}${action.actionIdentifier};

  (*p_state).${this.id}${action.actionIdentifier} = buffValue;
  ${p_containerActionVal(memoIndex, StatKey.CD, config)} += buffValue - stateValue;
  ${p_containerActionVal(memoIndex, StatKey.UNCONVERTIBLE_CD_BUFF, config)} += buffValue - stateValue;
}
`,
          )
        },
      },
      {
        id: 'SundayCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          return x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) > 1.00
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const deprioritize = x.getActionValueByIndex(StatKey.DEPRIORITIZE_BUFFS, SELF_ENTITY_INDEX)
          if (!(e >= 6 && r.e6CrToCdConversion && !deprioritize)) {
            return
          }

          const cr = x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX)
          const unconvertibleCr = x.getActionValueByIndex(StatKey.UNCONVERTIBLE_CR_BUFF, SELF_ENTITY_INDEX)

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((cr - unconvertibleCr - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          x.buffDynamic(StatKey.CD, buffValue - stateValue, action, context, x.source(SOURCE_E6))
          x.buffDynamic(StatKey.UNCONVERTIBLE_CD_BUFF, buffValue - stateValue, action, context, x.source(SOURCE_E6))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const config = action.config

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${wgslFalse(e >= 6 && r.e6CrToCdConversion)}) {
  return;
}

if (${containerActionVal(SELF_ENTITY_INDEX, StatKey.DEPRIORITIZE_BUFFS, config)} > 0) {
  return;
}

let cr = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, config)};
let unconvertibleCr = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_CR_BUFF, config)};

if (cr > 1.00) {
  let buffValue: f32 = floor((cr - unconvertibleCr - 1.00) / 0.01) * 2.00 * 0.01;
  let stateValue: f32 = (*p_state).${this.id}${action.actionIdentifier};

  (*p_state).${this.id}${action.actionIdentifier} = buffValue;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, config)} += buffValue - stateValue;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_CD_BUFF, config)} += buffValue - stateValue;
}
`,
          )
        },
      },
    ],
  }
}
