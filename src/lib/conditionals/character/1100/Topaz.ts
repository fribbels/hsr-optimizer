import { Feixiao } from 'lib/conditionals/character/1200/Feixiao'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import {
  ASHBLAZING_ATK_STACK,
  DamageType,
} from 'lib/conditionals/conditionalConstants'
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
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { IVentureForthToHunt } from 'lib/conditionals/lightcone/5star/IVentureForthToHunt'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_FUA,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
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
import { precisionRound } from 'lib/utils/mathUtils'

export const TopazEntities = createEnum('Topaz', 'Numby')
export const TopazAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Topaz')
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
  } = Source.character(Topaz.id)

  const proofOfDebtFuaVulnerability = skill(e, 0.50, 0.55)
  const enhancedStateFuaScalingBoost = ult(e, 1.50, 1.65)
  const enhancedStateFuaCdBoost = ult(e, 0.25, 0.275)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const fuaScaling = talent(e, 1.50, 1.65)

  // 0.06
  const basicHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 1)

  // 0.18
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 7 + 2 * 1 / 7 + 3 * 1 / 7 + 4 * 1 / 7 + 5 * 1 / 7 + 6 * 1 / 7 + 7 * 1 / 7)

  // 0.252
  const fuaEnhancedHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 10 + 2 * 1 / 10 + 3 * 1 / 10 + 4 * 1 / 10 + 5 * 1 / 10 + 6 * 1 / 10 + 7 * 1 / 10 + 8 * 3 / 10)

  const defaults = {
    enemyProofOfDebtDebuff: true,
    numbyEnhancedState: true,
    e1DebtorStacks: 2,
  }

  const teammateDefaults = {
    enemyProofOfDebtDebuff: true,
    e1DebtorStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyProofOfDebtDebuff: {
      id: 'enemyProofOfDebtDebuff',
      formItem: 'switch',
      text: t('Content.enemyProofOfDebtDebuff.text'),
      content: t('Content.enemyProofOfDebtDebuff.content', { proofOfDebtFuaVulnerability: precisionRound(100 * proofOfDebtFuaVulnerability) }),
    },
    numbyEnhancedState: {
      id: 'numbyEnhancedState',
      formItem: 'switch',
      text: t('Content.numbyEnhancedState.text'),
      content: t('Content.numbyEnhancedState.content', {
        enhancedStateFuaCdBoost: precisionRound(100 * enhancedStateFuaCdBoost),
        enhancedStateFuaScalingBoost: precisionRound(100 * enhancedStateFuaScalingBoost),
      }),
    },
    e1DebtorStacks: {
      id: 'e1DebtorStacks',
      formItem: 'slider',
      text: t('Content.e1DebtorStacks.text'),
      content: t('Content.e1DebtorStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyProofOfDebtDebuff: content.enemyProofOfDebtDebuff,
    e1DebtorStacks: content.e1DebtorStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(TopazEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TopazEntities.Topaz]: {
        primary: true,
        summon: false,
        memosprite: false,
        pet: false,
      },
      [TopazEntities.Numby]: {
        primary: false,
        summon: true,
        memosprite: false,
        pet: true,
      },
    }),

    actionDeclaration: () => [...TopazAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .damageType(DamageType.BASIC | DamageType.FUA)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .sourceEntity(TopazEntities.Numby)
              .damageElement(ElementTag.Fire)
              .damageType(DamageType.SKILL | DamageType.FUA)
              .atkScaling(skillScaling + (r.numbyEnhancedState ? enhancedStateFuaScalingBoost : 0))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .sourceEntity(TopazEntities.Numby)
              .damageElement(ElementTag.Fire)
              .atkScaling(fuaScaling + (r.numbyEnhancedState ? enhancedStateFuaScalingBoost : 0))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0, x.target(TopazEntities.Numby).source(SOURCE_ULT))
      x.buff(StatKey.RES_PEN, (e >= 6) ? 0.10 : 0, x.target(TopazEntities.Numby).source(SOURCE_E6))

      x.buff(StatKey.DMG_BOOST, (context.enemyElementalWeak) ? 0.15 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(
        StatKey.VULNERABILITY,
        (m.enemyProofOfDebtDebuff) ? proofOfDebtFuaVulnerability : 0,
        x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_SKILL),
      )
      x.buff(
        StatKey.CD,
        (e >= 1 && m.enemyProofOfDebtDebuff) ? 0.25 * m.e1DebtorStacks : 0,
        x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_E1),
      )
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = action.actionType === AbilityKind.BASIC
        ? basicHitCountMulti
        : (r.numbyEnhancedState)
        ? fuaEnhancedHitCountMulti
        : fuaHitCountMulti
      boostAshblazingAtkContainer(x, action, hitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = action.actionType === AbilityKind.BASIC
        ? basicHitCountMulti
        : (r.numbyEnhancedState)
        ? fuaEnhancedHitCountMulti
        : fuaHitCountMulti
      return gpuBoostAshblazingAtkContainer(hitMulti, action)
    },
  }
}

const simulation = (): SimulationMetadata => ({
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
      Stats.Fire_DMG,
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
  errRopeEidolon: 6,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_BASIC,
    DEFAULT_FUA,
    DEFAULT_FUA,
    WHOLE_SKILL,
    DEFAULT_FUA,
    WHOLE_BASIC,
    DEFAULT_FUA,
    WHOLE_BASIC,
    DEFAULT_FUA,
  ],
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.DuranDynastyOfRunningWolves,
    Sets.TheWondrousBananAmusementPark,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Feixiao.id,
      lightCone: IVentureForthToHunt.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Tribbie.id,
      lightCone: IfTimeWereAFlower.id,
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
    [Stats.ATK]: 0.75,
    [Stats.ATK_P]: 0.75,
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
      Stats.Fire_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.fnAshblazingSet(0),
    PresetEffects.BANANA_SET,
    PresetEffects.fnPioneerSet(4),
    PresetEffects.fnSacerdosSet(1),
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [
    SortOption.ULT,
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1041,
    y: 890,
    z: 1,
  },
  spineCenter: {
    x: 1178,
    y: 886,
    z: 1.1,
  },
  showcaseColor: '#998ef6',
}

export const Topaz: CharacterConfig = {
  id: '1112',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
