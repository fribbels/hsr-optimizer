import i18next from 'i18next'
import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { AstraYao } from 'lib/conditionals/character/1500/AstraYao'
import { RobinSummeretto } from 'lib/conditionals/character/1500/RobinSummeretto'
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
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { NoShiftsOnRainyDays } from 'lib/conditionals/lightcone/5star/NoShiftsOnRainyDays'
import { RiseAndSing } from 'lib/conditionals/lightcone/5star/RiseAndSing'
import { ShineBrightLikeHer } from 'lib/conditionals/lightcone/5star/ShineBrightLikeHer'
import {
  CURRENT_DATA_VERSION,
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
  DEFAULT_UNIQUE,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
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

// A Basic becomes Ice Sea Diving at this many charges
export const ELLEN_DIVE_MIN_CHARGES = 3

export const EllenEntities = createEnum('Ellen', 'Sharkboo')
export const EllenAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.UNIQUE,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
  const {
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TRACE,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1514')

  const basicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicScaling = basic(e, 4.00, 4.40)
  const enhancedBasicRandomScaling = basic(e, 3.20, 3.52)
  const skillScaling = skill(e, 4.00, 4.40)
  const skillVulnerability = skill(e, 0.50, 0.55)
  const ultScaling = ult(e, 4.00, 4.40)
  const ultMarkedScaling = ult(e, 3.20, 3.52)
  const ultEnhancedBasicBoost = ult(e, 4.00, 4.40)
  const fuaScaling = talent(e, 6.00, 6.60)

  // Joint attacks and extra turns are not triggered automatically.

  const defaults = {
    sharkBiteCharges: 6,
    biteMark: true,
    ultEnhancedBasicBuff: true,
    roamingModeBuffProviders: 2,
    e1DefPen: true,
    e2CritDmg: true,
    e4ResPen: true,
    e6Buffs: true,
  }
  const teammateDefaults = { biteMark: true }

  const content: ContentDefinition<typeof defaults> = {
    sharkBiteCharges: {
      id: 'sharkBiteCharges',
      formItem: 'slider',
      text: 'Basic charges',
      content: betaContent,
      min: 0,
      max: 6,
    },
    biteMark: {
      id: 'biteMark',
      formItem: 'switch',
      text: 'Bite Mark',
      content: betaContent,
    },
    ultEnhancedBasicBuff: {
      id: 'ultEnhancedBasicBuff',
      formItem: 'switch',
      text: 'Ult enhanced Basic boost',
      content: betaContent,
    },
    roamingModeBuffProviders: {
      id: 'roamingModeBuffProviders',
      formItem: 'slider',
      text: 'Teammate buff providers',
      content: betaContent,
      min: 0,
      max: 2,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: 'E1 Basic DEF PEN',
      content: betaContent,
      disabled: e < 1,
    },
    e2CritDmg: {
      id: 'e2CritDmg',
      formItem: 'switch',
      text: 'E2 Basic CD',
      content: betaContent,
      disabled: e < 2,
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: 'E4 Basic RES PEN',
      content: betaContent,
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: 'E6 buffs',
      content: betaContent,
      disabled: e < 6,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = { biteMark: content.biteMark }

  function getBasicState(action: OptimizerAction, freeDive = action.actionType === AbilityKind.UNIQUE) {
    const r = action.characterConditionals as Conditionals<typeof content>

    const charges = r.sharkBiteCharges
    const enhanced = freeDive || charges >= ELLEN_DIVE_MIN_CHARGES
    const consumed = (enhanced && !freeDive) ? charges : 0

    const e6Active = e >= 6 && r.e6Buffs
    const randomHits = enhanced ? Math.max(0, consumed - 3) + (e6Active ? 3 : 0) : 0

    return { enhanced, consumed, randomHits }
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,
    entityDeclaration: () => Object.values(EllenEntities),
    entityDefinition: () => ({
      [EllenEntities.Ellen]: {
        primary: true,
        summon: false,
        memosprite: false,
        pet: false,
      },
      [EllenEntities.Sharkboo]: {
        primary: false,
        summon: true,
        memosprite: false,
        pet: true,
      },
    }),
    actionDeclaration: () => [...EllenAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const { enhanced, randomHits } = getBasicState(action, false)
      const { randomHits: freeDiveRandomHits } = getBasicState(action, true)

      // Random dive hits prioritize the primary target and its adjacent targets
      const randomTargetPool = Math.min(3, context.enemyCount)

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling((enhanced ? enhancedBasicScaling : basicScaling) + enhancedBasicRandomScaling * randomHits / randomTargetPool)
              .toughnessDmg(enhanced ? 20 : 10)
              .build(),
          ],
        },
        [AbilityKind.UNIQUE]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(enhancedBasicScaling + enhancedBasicRandomScaling * freeDiveRandomHits / randomTargetPool)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Ice)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .atkScaling(ultScaling + (r.biteMark ? ultMarkedScaling : 0))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .sourceEntity(EllenEntities.Sharkboo)
              .damageElement(ElementTag.Ice)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [HitDefinitionBuilder.standardBreak(ElementTag.Ice).build()],
        },
      }
    },
    actionModifiers: () => [],
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const { enhanced, consumed } = getBasicState(action)
      const buffProviders = r.roamingModeBuffProviders

      // Trace CD and DMG buffs
      x.buff(StatKey.CD, buffProviders * 0.64, x.source(SOURCE_TRACE))
      x.buff(StatKey.BOOST, (buffProviders >= 2) ? 0.48 : 0, x.source(SOURCE_TRACE))

      // Ult enhanced Basic DMG boost
      x.buff(
        StatKey.BOOST,
        (enhanced && r.ultEnhancedBasicBuff) ? ultEnhancedBasicBoost : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).source(SOURCE_ULT),
      )

      // E1 Basic DEF PEN at 6 charges
      x.buff(
        StatKey.DEF_PEN,
        (e >= 1 && enhanced && consumed === 6 && r.e1DefPen) ? 0.30 : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).source(SOURCE_E1),
      )

      // E2 Basic CD buff (+50%)
      x.buff(
        StatKey.CD,
        (e >= 2 && enhanced && r.e2CritDmg) ? 0.50 : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).source(SOURCE_E2),
      )

      // E4 Basic RES PEN per charge (+2%)
      x.buff(
        StatKey.RES_PEN,
        (e >= 4 && enhanced && r.e4ResPen) ? consumed * 0.02 : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).elements(ElementTag.Ice).source(SOURCE_E4),
      )

      // E6 Basic RES PEN (+20%)
      x.buff(
        StatKey.RES_PEN,
        (e >= 6 && enhanced && r.e6Buffs) ? 0.20 : 0,
        x.target(EllenEntities.Ellen).damageType(DamageTag.BASIC).elements(ElementTag.Ice).source(SOURCE_E6),
      )
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Skill Basic vulnerability
      x.buff(
        StatKey.VULNERABILITY,
        m.biteMark ? skillVulnerability : 0,
        x.targets(TargetTag.FullTeam).damageType(DamageTag.BASIC).source(SOURCE_SKILL),
      )
    },
    precomputeTeammateEffectsContainer: () => {},
    // Ashblazing: one-hit placeholder until Sharkboo's hit weights are available.
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, ASHBLAZING_ATK_STACK)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(ASHBLAZING_ATK_STACK, action)
    },
    dynamicConditionals: [],
  }
}

const simulation = (): SimulationMetadata => ({
  leaderboardEnabled: true,
  parts: {
    [Parts.Body]: [Stats.CR, Stats.CD],
    [Parts.Feet]: [Stats.ATK_P, Stats.SPD],
    [Parts.PlanarSphere]: [Stats.ATK_P, Stats.Ice_DMG],
    [Parts.LinkRope]: [Stats.ATK_P, Stats.ERR],
  },
  substats: [
    Stats.CR,
    Stats.CD,
    Stats.ATK_P,
    Stats.ATK,
  ],
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_UNIQUE,
    END_BASIC,
    DEFAULT_FUA,
    WHOLE_SKILL,
    DEFAULT_FUA,
    WHOLE_BASIC,
    DEFAULT_FUA,
    DEFAULT_UNIQUE,
  ],
  relicSets: [
    [Sets.TheEdaciousHeretic, Sets.TheEdaciousHeretic],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: AstraYao.id,
      lightCone: ShineBrightLikeHer.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: RobinSummeretto.id,
      lightCone: RiseAndSing.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: HuohuoB1.id,
      lightCone: NightOfFright.id,
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
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [Stats.CR, Stats.CD, Stats.ATK_P],
    [Parts.Feet]: [Stats.ATK_P, Stats.SPD],
    [Parts.PlanarSphere]: [Stats.ATK_P, Stats.Ice_DMG],
    [Parts.LinkRope]: [Stats.ATK_P, Stats.ERR],
  },
  presets: [],
  defaultDamageType: DamageTag.BASIC,
  sortOption: SortOption.BASIC,
  hiddenColumns: [SortOption.DOT],
  addedColumns: [SortOption.UNIQUE],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 996,
    y: 1051,
    z: 1.4,
  },
  showcaseColor: '#8471c1',
}

export const Ellen: CharacterConfig = {
  id: '1514',
  defaultLightCone: NoShiftsOnRainyDays.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
