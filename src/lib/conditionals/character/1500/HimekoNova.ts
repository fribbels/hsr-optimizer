import i18next from 'i18next'
import { WeltB1 } from 'lib/conditionals/character/1000/WeltB1'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { DanceDanceDance } from 'lib/conditionals/lightcone/4star/DanceDanceDance'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { AStarThatLightsTheNight } from 'lib/conditionals/lightcone/5star/AStarThatLightsTheNight'
import { InTheNameOfTheWorld } from 'lib/conditionals/lightcone/5star/InTheNameOfTheWorld'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
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
  DEFAULT_SKILL,
  DEFAULT_UNIQUE,
  END_SKILL,
  END_UNIQUE,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
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

export const HimekoNovaEntities = createEnum('HimekoNova')
export const HimekoNovaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ULT,
  AbilityKind.UNIQUE,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
    SOURCE_UNIQUE,
  } = Source.character('1510')

  const basicScaling = basic(e, 1.00, 1.10)

  const ultBeamScaling = ult(e, 0.30, 0.33)
  const ultOrbitalAoeScaling = ult(e, 0.20, 0.22)
  const ultOrbitalRandomScaling = ult(e, 0.40, 0.44)
  const ultFinalHitScaling = ult(e, 1.00, 1.10)
  const ultE6OrbitalScaling = 1.20

  const skillDmgBuffValue = skill(e, 0.30, 0.33)
  const talentCdBuffValue = talent(e, 0.50, 0.54)
  const talentResPenValue = talent(e, 0.20, 0.22)

  const assistAoeScaling = skill(e, 2.50, 2.75)
  const assistRandomScaling = skill(e, 0.40, 0.44)
  const verdictUltCdValue = skill(e, 2.00, 2.20)
  const decimationCdValue = skill(e, 0.50, 0.55)

  const defaults = {
    navigatorsSemaphore: true,
    assistSkillBuff: true,
    companionVerdict: true,
    talentWeaknessBreak: true,
    sourceEnergyStacks: 3,
    e4ResPen: true,
    e6: true,
  }

  const teammateDefaults = {
    navigatorsSemaphore: true,
    assistSkillBuff: true,
    companionDecimation: true,
    e4ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    navigatorsSemaphore: {
      id: 'navigatorsSemaphore',
      formItem: 'switch',
      text: 'Navigator\'s Semaphore',
      content: betaContent,
    },
    assistSkillBuff: {
      id: 'assistSkillBuff',
      formItem: 'switch',
      text: 'Assist Skill buff',
      content: betaContent,
    },
    companionVerdict: {
      id: 'companionVerdict',
      formItem: 'switch',
      text: 'Companion Protocol: Verdict',
      content: betaContent,
    },
    talentWeaknessBreak: {
      id: 'talentWeaknessBreak',
      formItem: 'switch',
      text: 'Talent Weakness Break',
      content: betaContent,
    },
    sourceEnergyStacks: {
      id: 'sourceEnergyStacks',
      formItem: 'slider',
      text: 'Source Energy stacks',
      content: betaContent,
      min: 0,
      max: e >= 6 ? 6 : 3,
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: 'E4 team RES PEN',
      content: betaContent,
      disabled: e < 4,
    },
    e6: {
      id: 'e6',
      formItem: 'switch',
      text: 'E6 buffs',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    navigatorsSemaphore: content.navigatorsSemaphore,
    assistSkillBuff: {
      ...content.assistSkillBuff,
      disabled: e < 2,
    },
    companionDecimation: {
      id: 'companionDecimation',
      formItem: 'switch',
      text: 'Companion Protocol: Decimation',
      content: betaContent,
    },
    e4ResPen: content.e4ResPen,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(HimekoNovaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [HimekoNovaEntities.HimekoNova]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...HimekoNovaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const maxSourceEnergy = e >= 6 ? 6 : 3
      const sourceEnergy = Math.min(r.sourceEnergyStacks, maxSourceEnergy)
      const a6Multiplier = sourceEnergy >= 3 ? 1.40 : 1.00

      const ultAtkScaling = ultBeamScaling * 6
        + ultOrbitalAoeScaling * sourceEnergy
        + ultOrbitalRandomScaling * 3 * sourceEnergy * a6Multiplier / context.enemyCount
        + ultFinalHitScaling * 3 / context.enemyCount
        + ((e >= 6 && r.e6 && sourceEnergy >= 6) ? ultE6OrbitalScaling : 0)

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .atkScaling(ultAtkScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.UNIQUE]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .damageType(DamageTag.ASSIST)
              .atkScaling(assistAoeScaling + assistRandomScaling * 4 / context.enemyCount)
              .toughnessDmg(10 + 5 * 4 / context.enemyCount)
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
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.talentWeaknessBreak) {
        action.config.enemyWeaknessBroken = true
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, r.assistSkillBuff ? talentCdBuffValue : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.RES_PEN, r.assistSkillBuff ? talentResPenValue : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.RES_PEN, (e >= 4 && r.e4ResPen && r.assistSkillBuff) ? 0.10 : 0, x.source(SOURCE_E4))
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6) ? 0.20 : 0, x.elements(ElementTag.Fire).source(SOURCE_E6))

      x.buff(StatKey.CD, r.companionVerdict ? verdictUltCdValue : 0, x.damageType(DamageTag.ULT).source(SOURCE_UNIQUE))
      x.buff(StatKey.CD, !r.companionVerdict ? decimationCdValue : 0, x.source(SOURCE_UNIQUE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BOOST, m.navigatorsSemaphore ? skillDmgBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.BOOST, (e >= 2 && m.assistSkillBuff) ? 0.24 : 0, x.damageType(DamageTag.ASSIST).targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (e >= 4 && m.e4ResPen && m.assistSkillBuff) ? talentResPenValue : 0, x.source(SOURCE_E4))

      x.buff(StatKey.CD, m.companionDecimation ? decimationCdValue : 0, x.source(SOURCE_UNIQUE))
      x.buff(StatKey.CD, m.companionDecimation ? decimationCdValue : 0, x.damageType(DamageTag.SKILL).source(SOURCE_UNIQUE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [],
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.ATK_P,
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
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    DEFAULT_SKILL,
    START_ULT,
    END_UNIQUE,
    DEFAULT_UNIQUE,
    DEFAULT_UNIQUE,
  ],
  errRopeEidolon: 0,
  relicSets: [
    [Sets.AsNavigatorIseeSeesIt, Sets.AsNavigatorIseeSeesIt],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.FallenStarAnchorage,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Sunday.id,
      lightCone: AGroundedAscent.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: SparkleB1.id,
      lightCone: DanceDanceDance.id,
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
      Stats.ATK_P,
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
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.fnNavigatorSet(3),
  ],
  defaultDamageType: DamageTag.ULT,
  sortOption: SortOption.ULT,
  hiddenColumns: [SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {
  // TODO: placeholder image coordinates
  imageCenter: { x: 902, y: 928, z: 1.25 },
  showcaseColor: '#b584e8',
}

export const HimekoNova: CharacterConfig = {
  id: '1510',
  defaultLightCone: AStarThatLightsTheNight.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
