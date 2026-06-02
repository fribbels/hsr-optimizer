import i18next from 'i18next'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  CURRENT_DATA_VERSION,
  Parts,
  Stats,
} from 'lib/constants/constants'
import { AStarThatLightsTheNight } from 'lib/conditionals/lightcone/5star/AStarThatLightsTheNight'
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
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
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

  const defaults = {
    navigatorsSemaphore: true,
    assistSkillBuff: true,
    talentWeaknessBreak: true,
    sourceEnergyStacks: 3,
    e4ResPen: true,
    e6: true,
  }

  const teammateDefaults = {
    navigatorsSemaphore: true,
    assistSkillBuff: true,
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
    talentWeaknessBreak: {
      id: 'talentWeaknessBreak',
      formItem: 'switch',
      text: 'Talent Weakness Break',
      content: betaContent,
    },
    sourceEnergyStacks: {
      id: 'sourceEnergyStacks',
      formItem: 'slider',
      text: 'Source Energy consumed by Orbital',
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
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BOOST, m.navigatorsSemaphore ? skillDmgBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.BOOST, (e >= 2 && m.assistSkillBuff) ? 0.24 : 0, x.damageType(DamageTag.SKILL).targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (e >= 4 && m.e4ResPen && m.assistSkillBuff) ? talentResPenValue : 0, x.source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [],
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {},
  substats: [],
  comboTurnAbilities: [NULL_TURN_ABILITY_NAME],
  relicSets: [],
  ornamentSets: [],
  teammates: [],
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
    [Parts.Body]: [Stats.CR, Stats.CD],
    [Parts.Feet]: [Stats.ATK_P, Stats.SPD],
    [Parts.PlanarSphere]: [Stats.ATK_P, Stats.Fire_DMG],
    [Parts.LinkRope]: [Stats.ATK_P],
  },
  presets: [],
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
