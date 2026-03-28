import { BlackSwanB1 } from 'lib/conditionals/character/1300/BlackSwanB1'
import { Hysilens } from 'lib/conditionals/character/1400/Hysilens'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ReforgedRemembrance } from 'lib/conditionals/lightcone/5star/ReforgedRemembrance'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import { WhyDoesTheOceanSing } from 'lib/conditionals/lightcone/5star/WhyDoesTheOceanSing'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { newConditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  wgsl,
  wgslFalse,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  AbilityKind,
  DEFAULT_DOT,
  DEFAULT_FUA,
  DEFAULT_SKILL,
  END_DOT,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  RELICS_2P_SPEED,
  SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const KafkaB1Entities = createEnum('KafkaB1')
export const KafkaB1Abilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.DOT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.KafkaB1.Content')
  const tDot = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.DotTickCoefficient')
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
  } = Source.character(KafkaB1.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 0.80, 0.864)
  const fuaScaling = talent(e, 1.40, 1.596)
  const dotScaling = ult(e, 2.90, 3.183)

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.15 + 2 * 0.15 + 3 * 0.15 + 4 * 0.15 + 5 * 0.15 + 6 * 0.25)

  const defaults = {
    dotTickCoefficient: 4,
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
    dotTickCoefficient: {
      id: 'dotTickCoefficient',
      formItem: 'slider',
      text: tDot('Text'),
      content: tDot('Content'),
      min: 0,
      max: 20,
      percent: true,
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

    actionDeclaration: () => [...KafkaB1Abilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: DoT scaling bonus
      const dotTotalScaling = dotScaling + ((e >= 6) ? 1.56 : 0)

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Lightning)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Lightning)
              .dotBaseChance(1.00)
              .atkScaling(dotTotalScaling)
              .dotTickCoefficient(r.dotTickCoefficient)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
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

const simulation = (): SimulationMetadata => ({
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
      characterId: BlackSwanB1.id,
      lightCone: ReforgedRemembrance.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Hysilens.id,
      lightCone: WhyDoesTheOceanSing.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: PermansorTerrae.id,
      lightCone: ThoughWorldsApart.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
})

const scoring = (): ScoringMetadata => ({
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
  presets: [
    PresetEffects.PRISONER_SET,
    PresetEffects.fnAshblazingSet(6),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.DOT,
  hiddenColumns: [],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1000,
    y: 950,
    z: 1.25,
  },
  showcaseColor: '#d976be',
}

export const KafkaB1: CharacterConfig = {
  id: '1005b1',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
