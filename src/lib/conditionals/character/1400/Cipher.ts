import {
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
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
import {
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_2P_SPEED_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  CIPHER,
  FEIXIAO,
  FLOWING_NIGHTGLOW,
  I_VENTURE_FORTH_TO_HUNT,
  PERMANSOR_TERRAE,
  ROBIN,
  THOUGH_WORLDS_APART,
} from 'lib/simulations/tests/testMetadataConstants'
import {
  DEFAULT_FUA,
  NULL_TURN_ABILITY_NAME,
  DEFAULT_ULT,
  WHOLE_BASIC,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { CharacterConfig } from 'types/characterConfig'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const CipherEntities = createEnum('Cipher')
export const CipherAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Cipher.Content')
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
  } = Source.character('1406')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const skillAtkBuff = skill(e, 0.30, 0.33)

  const ultScaling = ult(e, 1.20, 1.32)
  const ultSecondaryScaling = ult(e, 0.40, 0.44)

  const fuaScaling = talent(e, 1.50, 1.65)

  const defaults = {
    vulnerability: true,
    skillAtkBuff: true,
    fuaCdBoost: true,
    spdBasedBuffs: true,
    cyreneSpecialEffect: true,
    e1AtkBuff: true,
    e2Vulnerability: true,
    e4AdditionalDmg: true,
    e6FuaDmg: true,
  }

  const teammateDefaults = {
    vulnerability: true,
    cyreneSpecialEffect: true,
    e2Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    vulnerability: {
      id: 'vulnerability',
      formItem: 'switch',
      text: t('vulnerability.text'),
      content: t('vulnerability.content'),
    },
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: t('skillAtkBuff.text'),
      content: t('skillAtkBuff.content'),
    },
    fuaCdBoost: {
      id: 'fuaCdBoost',
      formItem: 'switch',
      text: t('fuaCdBoost.text'),
      content: t('fuaCdBoost.content'),
    },
    spdBasedBuffs: {
      id: 'spdBasedBuffs',
      formItem: 'switch',
      text: t('spdBasedBuffs.text'),
      content: t('spdBasedBuffs.content'),
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('cyreneSpecialEffect.text'),
      content: t('cyreneSpecialEffect.content'),
    },
    e1AtkBuff: {
      id: 'e1AtkBuff',
      formItem: 'switch',
      text: t('e1AtkBuff.text'),
      content: t('e1AtkBuff.content'),
      disabled: e < 1,
    },
    e2Vulnerability: {
      id: 'e2Vulnerability',
      formItem: 'switch',
      text: t('e2Vulnerability.text'),
      content: t('e2Vulnerability.content'),
      disabled: e < 2,
    },
    e4AdditionalDmg: {
      id: 'e4AdditionalDmg',
      formItem: 'switch',
      text: t('e4AdditionalDmg.text'),
      content: t('e4AdditionalDmg.content'),
      disabled: e < 4,
    },
    e6FuaDmg: {
      id: 'e6FuaDmg',
      formItem: 'switch',
      text: t('e6FuaDmg.text'),
      content: t('e6FuaDmg.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    vulnerability: content.vulnerability,
    cyreneSpecialEffect: content.cyreneSpecialEffect,
    e2Vulnerability: content.e2Vulnerability,
  }

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.20 + 2 * 0.10 + 3 * 0.10 + 4 * 0.60)

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(CipherEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [CipherEntities.Cipher]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(CipherAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e4AdditionalScaling = (e >= 4 && r.e4AdditionalDmg) ? 0.50 : 0

      return {
        [CipherAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(e4AdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(e4AdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [CipherAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(e4AdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(e4AdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [CipherAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling + ultSecondaryScaling)
              .toughnessDmg(30)
              .build(),
            ...(e4AdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(e4AdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [CipherAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Quantum)
              .atkScaling(fuaScaling)
              .toughnessDmg(20)
              .build(),
            ...(e4AdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(e4AdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [CipherAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skill ATK% buff
      x.buff(StatKey.ATK_P, r.skillAtkBuff ? skillAtkBuff : 0, x.source(SOURCE_SKILL))

      // Trace: FUA CD boost (+100%)
      x.buff(StatKey.CD, r.fuaCdBoost ? 1.00 : 0, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))

      // E1 ATK% buff
      x.buff(StatKey.ATK_P, (e >= 1 && r.e1AtkBuff) ? 0.80 : 0, x.source(SOURCE_E1))

      // E6 FUA DMG boost
      x.buff(StatKey.DMG_BOOST, (e >= 6 && r.e6FuaDmg) ? 3.50 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E6))

      // Cyrene special effect - DMG boost
      const cyreneDmgBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.396 : 0.36)
        : 0
      x.buff(StatKey.DMG_BOOST, r.cyreneSpecialEffect ? cyreneDmgBuff : 0, x.source(Source.odeTo(CIPHER)))
    },

    precomputeMutualEffectsContainer: (
      x: ComputedStatsContainer,
      action: OptimizerAction,
      context: OptimizerContext,
      originalCharacterAction?: OptimizerAction,
    ) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace vulnerability (full team)
      x.buff(StatKey.VULNERABILITY, m.vulnerability ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // E2 vulnerability (full team)
      x.buff(StatKey.VULNERABILITY, (e >= 2 && m.e2Vulnerability) ? 0.30 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      // Cyrene special effect - DEF PEN (full team)
      const cyreneDefPen = cyreneActionExists(originalCharacterAction!)
        ? (cyreneSpecialEffectEidolonUpgraded(originalCharacterAction!) ? 0.22 : 0.20)
        : 0
      x.buff(StatKey.DEF_PEN, m.cyreneSpecialEffect ? cyreneDefPen : 0, x.targets(TargetTag.FullTeam).source(Source.odeTo(CIPHER)))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMulti, action)
    },

    dynamicConditionals: [
      {
        id: 'CipherSpdActivation140',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.CR],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.spdBasedBuffs && x.getActionValue(StatKey.SPD, CipherEntities.Cipher) >= 140
        },
        effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
          const r = action.characterConditionals as Conditionals<typeof content>
          const spd = x.getActionValue(StatKey.SPD, CipherEntities.Cipher)

          x.buffDynamic(StatKey.CR, (r.spdBasedBuffs && spd >= 140) ? 0.25 : 0, action, context, x.source(SOURCE_TRACE))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (
  (*p_state).CipherSpdActivation140${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} >= 140.0 &&
  ${wgslTrue(r.spdBasedBuffs)}
) {
  (*p_state).CipherSpdActivation140${action.actionIdentifier} = 1.0;
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, action.config)} += 0.25;
}
          `,
          )
        },
      },
      {
        id: 'CipherSpdActivation170',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.CR],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.spdBasedBuffs && x.getActionValue(StatKey.SPD, CipherEntities.Cipher) >= 170
        },
        effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
          const r = action.characterConditionals as Conditionals<typeof content>
          const spd = x.getActionValue(StatKey.SPD, CipherEntities.Cipher)

          x.buffDynamic(StatKey.CR, (r.spdBasedBuffs && spd >= 170) ? 0.25 : 0, action, context, x.source(SOURCE_TRACE))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (
  (*p_state).CipherSpdActivation170${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} >= 170.0 &&
  ${wgslTrue(r.spdBasedBuffs)}
) {
  (*p_state).CipherSpdActivation170${action.actionIdentifier} = 1.0;
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, action.config)} += 0.25;
}
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
      Stats.Quantum_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.ATK_P,
    Stats.CR,
    Stats.CD,
    Stats.ATK,
    Stats.EHR,
  ],
  breakpoints: {
    [Stats.EHR]: 0.19,
  },
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    DEFAULT_ULT,
    WHOLE_SKILL,
    DEFAULT_FUA,
    WHOLE_SKILL,
    DEFAULT_FUA,
    WHOLE_BASIC,
    DEFAULT_FUA,
  ],
  deprioritizeBuffs: true,
  comboDot: 0,
  errRopeEidolon: 0,
  relicSets: [
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.InertSalsotto,
    Sets.DuranDynastyOfRunningWolves,
    Sets.FirmamentFrontlineGlamoth,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: FEIXIAO,
      lightCone: I_VENTURE_FORTH_TO_HUNT,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: ROBIN,
      lightCone: FLOWING_NIGHTGLOW,
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
    [Stats.ATK]: 0.75,
    [Stats.ATK_P]: 0.75,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.EHR]: 0.50,
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
      Stats.Quantum_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.PioneerDiverOfDeadWaters]: 1,
    [Sets.GeniusOfBrilliantStars]: 1,
    [Sets.MessengerTraversingHackerspace]: 1,

    ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  },
  presets: [
    PresetEffects.fnAshblazingSet(4),
    PresetEffects.fnPioneerSet(4),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [SortOption.DOT],
  simulation,
}

const display = {
  imageCenter: {
    x: 1050,
    y: 900,
    z: 1,
  },
  showcaseColor: '#5962ff',
}

export const Cipher: CharacterConfig = {
  id: '1406',
  info: {},
  conditionals,
  scoring,
  display,
}
