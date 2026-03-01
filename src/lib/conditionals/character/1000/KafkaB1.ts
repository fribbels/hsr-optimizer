import { ASHBLAZING_ATK_STACK, } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkContainer, gpuBoostAshblazingAtkContainer, } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ConditionalActivation, ConditionalType, Parts, Sets, Stats, } from 'lib/constants/constants'
import { newConditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslFalse, wgslTrue, } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey, } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, SELF_ENTITY_INDEX, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  DEFAULT_DOT,
  DEFAULT_SKILL,
  END_DOT,
  DEFAULT_FUA,
  START_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_2P_ATK_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  RELICS_2P_SPEED,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  BLACK_SWAN_B1,
  REFORGED_REMEMBRANCE,
  HYSILENS,
  WHY_DOES_THE_OCEAN_SING,
  PERMANSOR_TERRAE,
  THOUGH_WORLDS_APART,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const KafkaB1Entities = createEnum('KafkaB1')
export const KafkaB1Abilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'DOT', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.KafkaB1.Content')
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
  } = Source.character('1005b1')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 0.80, 0.864)
  const fuaScaling = talent(e, 1.40, 1.596)
  const dotScaling = ult(e, 2.90, 3.183)

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.15 + 2 * 0.15 + 3 * 0.15 + 4 * 0.15 + 5 * 0.15 + 6 * 0.25)

  const defaults = {
    ehrBasedBuff: true,
    e1DotDmgReceivedDebuff: true,
    e2TeamDotDmg: true,
  }

  const teammateDefaults = {
    ehrBasedBuff: true,
    e1DotDmgReceivedDebuff: true,
    e2TeamDotDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ehrBasedBuff: {
      id: 'ehrBasedBuff',
      formItem: 'switch',
      text: t('ehrBasedBuff.text'),
      content: t('ehrBasedBuff.content'),
    },
    e1DotDmgReceivedDebuff: {
      id: 'e1DotDmgReceivedDebuff',
      formItem: 'switch',
      text: t('e1DotDmgReceivedDebuff.text'),
      content: t('e1DotDmgReceivedDebuff.content'),
      disabled: e < 1,
    },
    e2TeamDotDmg: {
      id: 'e2TeamDotDmg',
      formItem: 'switch',
      text: t('e2TeamDotDmg.text'),
      content: t('e2TeamDotDmg.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ehrBasedBuff: content.ehrBasedBuff,
    e1DotDmgReceivedDebuff: content.e1DotDmgReceivedDebuff,
    e2TeamDotDmg: content.e2TeamDotDmg,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(KafkaB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [KafkaB1Entities.KafkaB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(KafkaB1Abilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      // E6: DoT scaling bonus
      const dotTotalScaling = dotScaling + ((e >= 6) ? 1.56 : 0)

      return {
        [KafkaB1Abilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [KafkaB1Abilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [KafkaB1Abilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [KafkaB1Abilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Lightning)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [KafkaB1Abilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Lightning)
              .dotBaseChance(1.00)
              .atkScaling(dotTotalScaling)
              .build(),
          ],
        },
        [KafkaB1Abilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // E1: DoT Vulnerability +30% (team)
      x.buff(StatKey.VULNERABILITY, (e >= 1 && m.e1DotDmgReceivedDebuff) ? 0.30 : 0, x.damageType(DamageTag.DOT).targets(TargetTag.FullTeam).source(SOURCE_E1))

      // E2: DoT DMG +33% (team)
      x.buff(StatKey.DMG_BOOST, (e >= 2 && m.e2TeamDotDmg) ? 0.33 : 0, x.damageType(DamageTag.DOT).targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace: EHR >= 75% grants +100% base ATK
      const ehrValue = x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX)
      if (r.ehrBasedBuff && ehrValue >= 0.75) {
        x.buff(StatKey.ATK, 1.00 * context.baseATK, x.source(SOURCE_TRACE))
      }

      boostAshblazingAtkContainer(x, action, hitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.ehrBasedBuff)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, action.config)} >= 0.75) {
  ${buff.action(AKey.ATK, `1.00 * baseATK`).wgsl(action)}
}
      ` + gpuBoostAshblazingAtkContainer(hitMulti, action)
    },

    teammateDynamicConditionals: [
      {
        id: 'KafkaEhrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.EHR],
        chainsTo: [],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          return x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX) >= 0.75
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          if (!r.ehrBasedBuff) {
            return
          }

          const ehrValue = x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX)
          if (ehrValue >= 0.75) {
            x.buff(StatKey.ATK, 1.00 * context.baseATK, x.source(SOURCE_TRACE))
          }
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const stateKey = `${this.id}${action.actionIdentifier}`

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${wgslFalse(r.ehrBasedBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).${stateKey};
let ehrValue: f32 = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, action.config)};

if (ehrValue >= 0.75 && stateValue == 0) {
  ${buff.action(AKey.ATK, `1.00 * baseATK`).wgsl(action)}
  (*p_state).${stateKey} = 1;
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
      Stats.ATK_P,
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
    ],
  },
  substats: [
    Stats.ATK_P,
    Stats.ATK,
    Stats.EHR,
    Stats.CR,
    Stats.CD,
  ],
  breakpoints: {
    [Stats.EHR]: 0.75,
  },
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_DOT,
    DEFAULT_SKILL,
    END_DOT,
    DEFAULT_FUA,
    START_SKILL,
    END_DOT,
    DEFAULT_FUA,
    START_SKILL,
    END_DOT,
    DEFAULT_FUA,
  ],
  comboDot: 16,
  errRopeEidolon: 0,
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
    RELICS_2P_SPEED,
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RevelryByTheSea,
    Sets.FirmamentFrontlineGlamoth,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
    ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
  ],
  teammates: [
    {
      characterId: BLACK_SWAN_B1,
      lightCone: REFORGED_REMEMBRANCE,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: HYSILENS,
      lightCone: WHY_DOES_THE_OCEAN_SING,
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
    [Stats.ATK]: 1,
    [Stats.ATK_P]: 1,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 1,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
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
    ...SPREAD_RELICS_2P_ATK_WEIGHTS,
    [Sets.PrisonerInDeepConfinement]: 1,
    [Sets.BandOfSizzlingThunder]: T2_WEIGHT,

    [Sets.RevelryByTheSea]: 1,
    [Sets.FirmamentFrontlineGlamoth]: 1,
    [Sets.SpaceSealingStation]: 1,
  },
  presets: [
    PresetEffects.PRISONER_SET,
    PresetEffects.fnAshblazingSet(6),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.DOT,
  hiddenColumns: [],
  simulation,
}

const display = {
  imageCenter: {
    x: 1000,
    y: 950,
    z: 1.1,
  },
  showcaseColor: '#ea8abc',
}

export const KafkaB1: CharacterConfig = {
  id: '1005b1',
  info: {},
  conditionals,
  scoring,
  display,
}
