import {
  BuffPriority,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/conditionalUtils'

import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { newConditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import {
  wgsl,
  wgslFalse,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  HKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  MATCH_2P_WEIGHT,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  AGLAEA,
  CYRENE,
  PERMANSOR_TERRAE,
  SUNDAY,
  THIS_LOVE_FOREVER,
  THOUGH_WORLDS_APART,
  A_GROUNDED_ASCENT,
} from 'lib/simulations/tests/testMetadataConstants'
import {
  DEFAULT_MEMO_SKILL,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { CharacterConfig } from 'types/characterConfig'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { AbilityDefinition } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const AglaeaAbilities = createEnum(
  'BASIC',
  'MEMO_SKILL',
  'BREAK',
)

export const AglaeaEntities = createEnum(
  'Aglaea',
  'Garmentmaker',
)

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
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

  const memoBaseHpScaling = talent(e, 0.66, 0.704)
  const memoBaseHpFlat = talent(e, 720, 828)
  const talentAdditionalDmg = talent(e, 0.30, 0.336)

  const memoSkillScaling = memoSkill(e, 1.10, 1.21)
  const memoTalentSpd = memoTalent(e, 55, 57.2)

  const memoSpdStacksMax = e >= 4 ? 7 : 6

  const defaults = {
    buffPriority: BuffPriority.SELF,
    supremeStanceState: true,
    seamStitch: true,
    memoSpdStacks: memoSpdStacksMax,
    cyreneSpecialEffect: true,
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
        { display: tBuff('Self'), value: BuffPriority.SELF, label: tBuff('Self') },
        { display: tBuff('Memo'), value: BuffPriority.MEMO, label: tBuff('Memo') },
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
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('Content.cyreneSpecialEffect.text'),
      content: t('Content.cyreneSpecialEffect.content'),
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
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    entityDeclaration: () => Object.values(AglaeaEntities),
    actionDeclaration: () => Object.values(AglaeaAbilities),

    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      return {
        [AglaeaEntities.Aglaea]: {
          primary: true,
          summon: false,
          memosprite: false,
          memoBuffPriority: r.buffPriority !== BuffPriority.SELF,
        },
        [AglaeaEntities.Garmentmaker]: {
          memoBaseHpScaling,
          memoBaseHpFlat,
          memoBaseSpdScaling: 0.35,
          primary: false,
          summon: true,
          memosprite: true,
        },
      }
    },
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const basicAbility: AbilityDefinition = {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Lightning)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      }

      const enhancedBasicAbility: AbilityDefinition = {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Lightning)
            .atkScaling(enhancedBasicScaling)
            .toughnessDmg(20)
            .build(),
          HitDefinitionBuilder.crit()
            .sourceEntity(AglaeaEntities.Garmentmaker)
            .damageType(DamageTag.BASIC | DamageTag.MEMO)
            .damageElement(ElementTag.Lightning)
            .atkScaling(enhancedBasicScaling)
            .directHit(true)
            .build(),
        ],
      }

      if (r.seamStitch) {
        const additionalDmgHit = HitDefinitionBuilder.standardAdditional()
          .damageElement(ElementTag.Lightning)
          .atkScaling(talentAdditionalDmg)
          .build()

        basicAbility.hits.push(additionalDmgHit)
        enhancedBasicAbility.hits.push(additionalDmgHit)
      }

      return {
        [AglaeaAbilities.BASIC]: (r.supremeStanceState) ? enhancedBasicAbility : basicAbility,
        [AglaeaAbilities.MEMO_SKILL]: {
          hits: [
            HitDefinitionBuilder.crit()
              .sourceEntity(AglaeaEntities.Garmentmaker)
              .damageType(DamageTag.MEMO)
              .damageElement(ElementTag.Lightning)
              .atkScaling(memoSkillScaling)
              .toughnessDmg(10)
              .directHit(true)
              .build(),
          ],
        },
        [AglaeaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers() {
      return []
    },
    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>



    },
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, (r.supremeStanceState) ? ultSpdBoost * r.memoSpdStacks : 0, x.source(SOURCE_ULT))
      x.buff(StatKey.SPD, r.memoSpdStacks * memoTalentSpd, x.target(AglaeaEntities.Garmentmaker).source(SOURCE_MEMO))

      x.buff(StatKey.DEF_PEN, (e >= 2) ? 0.14 * r.e2DefShredStacks : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_E2))

      x.buff(
        StatKey.RES_PEN,
        (e >= 6 && r.e6Buffs && r.supremeStanceState) ? 0.20 : 0,
        x.elements(ElementTag.Lightning).targets(TargetTag.SelfAndMemosprite).source(SOURCE_E6),
      )

      // Cyrene
      const cyreneDmgBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.792 : 0.72)
        : 0
      const cyreneDefPenBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.396 : 0.36)
        : 0

      x.buff(StatKey.DMG_BOOST, (r.cyreneSpecialEffect) ? cyreneDmgBuff : 0, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(AGLAEA)))
      x.buff(StatKey.DEF_PEN, (r.cyreneSpecialEffect) ? cyreneDefPenBuff : 0, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(AGLAEA)))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (e >= 1 && m.seamStitch && m.e1Vulnerability) ? 0.15 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (e >= 6 && r.supremeStanceState && r.e6Buffs) {
        let jointBoost = 0

        const aglaeaSpd = x.getActionValue(StatKey.SPD, AglaeaEntities.Aglaea)
        const garmentmakerSpd = x.getActionValue(StatKey.SPD, AglaeaEntities.Garmentmaker)

        if (aglaeaSpd > 320 || garmentmakerSpd >= 320) {
          jointBoost = 0.60
        } else if (aglaeaSpd > 240 || garmentmakerSpd >= 240) {
          jointBoost = 0.30
        } else if (aglaeaSpd > 160 || garmentmakerSpd >= 160) {
          jointBoost = 0.10
        }

        x.buff(StatKey.DMG_BOOST, jointBoost, x.damageType(DamageTag.BASIC).targets(TargetTag.SelfAndMemosprite).source(SOURCE_E6))
      }
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(e >= 6 && r.supremeStanceState && r.e6Buffs)}) {
  if (
    ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} > 320 || 
    ${containerActionVal(action.config.entityRegistry.getIndex(AglaeaEntities.Garmentmaker), StatKey.SPD, action.config)} > 320
  ) {
    ${
        buff.hit(HKey.DMG_BOOST, 0.60)
          .damageType(DamageTag.BASIC)
          .targets(TargetTag.SelfAndMemosprite)
          .wgsl(action, 2)
      }
  } else if (
    ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} > 240 || 
    ${containerActionVal(action.config.entityRegistry.getIndex(AglaeaEntities.Garmentmaker), StatKey.SPD, action.config)} > 240
  ) {
    ${
        buff.hit(HKey.DMG_BOOST, 0.30)
          .damageType(DamageTag.BASIC)
          .targets(TargetTag.SelfAndMemosprite)
          .wgsl(action, 2)
      }
  } else if (
    ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} > 160 || 
    ${containerActionVal(action.config.entityRegistry.getIndex(AglaeaEntities.Garmentmaker), StatKey.SPD, action.config)} > 160
  ) {
    ${
        buff.hit(HKey.DMG_BOOST, 0.10)
          .damageType(DamageTag.BASIC)
          .targets(TargetTag.SelfAndMemosprite)
          .wgsl(action, 2)
      }
  }
}
      `
    },
    dynamicConditionals: [
      {
        id: 'AglaeaConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          // TODO
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.supremeStanceState) {
            return
          }
          const stateValue = action.conditionalState[this.id] || 0
          const aglaeaSpd = x.getActionValue(StatKey.SPD, AglaeaEntities.Aglaea)
          const memoSpd = x.getActionValue(StatKey.SPD, AglaeaEntities.Garmentmaker)
          const buffValue = 7.20 * aglaeaSpd + 3.60 * memoSpd

          action.conditionalState[this.id] = buffValue

          x.buffDynamic(StatKey.ATK, buffValue - stateValue, action, context, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_E2))
          x.buffDynamic(StatKey.UNCONVERTIBLE_ATK_BUFF, buffValue - stateValue, action, context, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_E2))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const config = action.config
          const memoEntityIndex = config.entityRegistry.getIndex(AglaeaEntities.Garmentmaker)

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${wgslFalse(r.supremeStanceState)}) {
  return;
}
let spd = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)};
let memoSpd = ${containerActionVal(memoEntityIndex, StatKey.SPD, config)};
let stateValue: f32 = (*p_state).AglaeaConversionConditional${action.actionIdentifier};
let buffValue: f32 = 7.20 * spd + 3.60 * memoSpd;

(*p_state).AglaeaConversionConditional${action.actionIdentifier} = buffValue;
${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, config)} += buffValue - stateValue;
${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_ATK_BUFF, config)} += buffValue - stateValue;
${p_containerActionVal(memoEntityIndex, StatKey.ATK, config)} += buffValue - stateValue;
${p_containerActionVal(memoEntityIndex, StatKey.UNCONVERTIBLE_ATK_BUFF, config)} += buffValue - stateValue;
`,
          )
        },
      },
    ],
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Lightning_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.ATK_P,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_BASIC,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    WHOLE_BASIC,
    WHOLE_BASIC,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    WHOLE_BASIC,
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  relicSets: [
    [Sets.HeroOfTriumphantSong, Sets.HeroOfTriumphantSong],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.TheWondrousBananAmusementPark,
    Sets.RutilantArena,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SUNDAY,
      lightCone: A_GROUNDED_ASCENT,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: CYRENE,
      lightCone: THIS_LOVE_FOREVER,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: PERMANSOR_TERRAE,
      lightCone: THOUGH_WORLDS_APART,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
}

const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0.5,
    [Stats.ATK_P]: 0.5,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Lightning_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.BandOfSizzlingThunder]: MATCH_2P_WEIGHT,
    [Sets.HeroOfTriumphantSong]: 1,
    [Sets.ScholarLostInErudition]: 1,

    [Sets.TheWondrousBananAmusementPark]: 1,
    [Sets.RutilantArena]: 1,
    [Sets.FirmamentFrontlineGlamoth]: 1,
  },
  presets: [
    PresetEffects.BANANA_SET,
    PresetEffects.WARRIOR_SET,
  ],
  sortOption: SortOption.BASIC,
  hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
  addedColumns: [SortOption.MEMO_SKILL, SortOption.MEMO_TALENT],
  simulation,
}

const display = {
  imageCenter: {
    x: 1200,
    y: 750,
    z: 1.10,
  },
  showcaseColor: '#86bdf1',
}

export const Aglaea: CharacterConfig = {
  id: '1402',
  info: {},
  conditionals,
  scoring,
  display,
}
