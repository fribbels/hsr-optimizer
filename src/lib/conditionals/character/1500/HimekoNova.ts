import i18next from 'i18next'
import {
  aoe,
  ashblazingMulti,
  bounce,
} from 'lib/conditionals/ashblazingCompute'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  boostUltAshblazingAtk,
  gpuBoostUltAshblazingAtk,
} from 'lib/conditionals/conditionalFinalizers'
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
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.HimekoNova.Content')
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

  const ultBeamScaling = ult(e, 0.32, 0.352)
  const ultOrbitalAoeScaling = ult(e, 0.20, 0.22)
  const ultOrbitalRandomScaling = ult(e, 0.30, 0.33)
  const ultFinalHitScaling = ult(e, 0.80, 0.88)
  const ultE6OrbitalScaling = 1.60

  const skillDmgBuffValue = skill(e, 0.20, 0.22)

  const talentCdBuffValue = talent(e, 0.80, 0.88)
  const talentResPenValue = talent(e, 0.20, 0.22)

  const selfAssistAoeScaling = skill(e, 2.00, 2.20)
  const selfAssistRandomScaling = skill(e, 0.32, 0.348)
  const allyAssistAoeScaling = skill(e, 1.60, 1.76)
  const allyAssistRandomScaling = skill(e, 0.24, 0.264)
  const verdictDmgBoostValue = skill(e, 1.00, 1.10)
  const verdictUltCdValue = skill(e, 1.00, 1.10)
  const decimationCdValue = skill(e, 1.00, 1.10)
  const decimationSkillCdValue = skill(e, 1.00, 1.10)

  // const maxSourceEnergy = e >= 6 ? 6 : 3
  const sourceEnergy = e >= 6 ? 6 : 3 // Math.min(r.sourceEnergyStacks, maxSourceEnergy)

  // Himenova ult sequence is
  // Orbital Annihilation Pulse - AOE(ultOrbitalAoeScaling) + Bounce(sourceEnergy * ultOrbitalRandomScaling)
  // Hyperluminal Particle Beam - AOE(ultBeamScaling)
  // Hyperluminal Particle Beam - AOE(ultBeamScaling)
  // Hyperluminal Particle Beam - AOE(ultBeamScaling)
  // Orbital Annihilation Pulse - AOE(ultOrbitalAoeScaling) + Bounce(sourceEnergy * ultOrbitalRandomScaling)
  // Hyperluminal Particle Beam - AOE(ultBeamScaling)
  // Hyperluminal Particle Beam - AOE(ultBeamScaling)
  // Hyperluminal Particle Beam - AOE(ultBeamScaling)
  // Orbital Annihilation Pulse - AOE(ultOrbitalAoeScaling) + Bounce(sourceEnergy * ultOrbitalRandomScaling)
  // Final hit                  - Bounce 3 * ultFinalHitScaling

  // for E6 Himeko:
  // sequencing is reliant on getting 3 external sourceEnergy between each ult, not guaranteed but should be consistent
  // Pulses get an extra AOE hit:
  //   When launching "Orbital Annihilation Pulse," if the current "Source Energy" is 6 point(s) or more,
  //   additionally deals Fire DMG equal to 160% of Himeko • Nova's ATK to all enemies 1 time.

  const pulseHits = [
    aoe(ultOrbitalAoeScaling),
    bounce(ultOrbitalRandomScaling, sourceEnergy),
  ]
  if (e >= 6) pulseHits.push(aoe(ultE6OrbitalScaling))

  const beamHit = aoe(ultBeamScaling)

  const finalHitHit = bounce(ultFinalHitScaling, 3)

  const ultHitMulti = ashblazingMulti([
    ...pulseHits,
    beamHit,
    beamHit,
    beamHit,
    ...pulseHits,
    beamHit,
    beamHit,
    beamHit,
    ...pulseHits,
    finalHitHit,
  ])

  const defaults = {
    navigatorsSemaphore: true,
    selfUseAssistSkill: true,
    assistSkillBuff: true,
    companionVerdict: true,
    companionDecimation: false,
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
      text: t('navigatorsSemaphore.text'),
      content: t('navigatorsSemaphore.content', { SemaphoreDmgBoost: precisionRound(100 * skillDmgBuffValue) }),
    },
    selfUseAssistSkill: {
      id: 'selfUseAssistSkill',
      formItem: 'switch',
      text: t('selfUseAssistSkill.text'),
      content: t('selfUseAssistSkill.content'),
    },
    assistSkillBuff: {
      id: 'assistSkillBuff',
      formItem: 'switch',
      text: t('assistSkillBuff.text'),
      content: t('assistSkillBuff.content', {
        AssistSkillResPen: precisionRound(100 * talentResPenValue),
        AssistSkillCdBUff: precisionRound(100 * talentCdBuffValue),
      }),
    },
    companionVerdict: {
      id: 'companionVerdict',
      formItem: 'switch',
      text: t('companionVerdict.text'),
      content: t('companionVerdict.content', {
        VerdictDmgBuff: precisionRound(100 * verdictDmgBoostValue),
        VeridctUltDmgBuff: precisionRound(100 * verdictUltCdValue),
      }),
    },
    companionDecimation: {
      id: 'companionDecimation',
      formItem: 'switch',
      text: t('companionDecimation.text'),
      content: t('companionDecimation.content', {
        DecimationCdBuff: precisionRound(100 * decimationCdValue),
        DecimationSkillCdBuff: precisionRound(100 * decimationSkillCdValue),
      }),
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: t('e4ResPen.text'),
      content: t('e4ResPen.content'),
      disabled: e < 4,
    },
    e6: {
      id: 'e6',
      formItem: 'switch',
      text: t('e6.text'),
      content: t('e6.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    navigatorsSemaphore: content.navigatorsSemaphore,
    assistSkillBuff: content.assistSkillBuff,
    companionDecimation: content.companionDecimation,
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
      const a6Multiplier = sourceEnergy >= 3 ? 0.30 : 0

      const pulseScaling = ultOrbitalAoeScaling
        + (ultOrbitalRandomScaling + a6Multiplier) * sourceEnergy / context.enemyCount
        + (e >= 6 && r.e6 && sourceEnergy >= 6 ? ultE6OrbitalScaling : 0)
      const beamScaling = ultBeamScaling
      const finalHitScaling = ultFinalHitScaling * 3 / context.enemyCount

      const ultAtkScaling = finalHitScaling
        + pulseScaling * 3
        + beamScaling * 6

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
              .atkScaling(
                r.selfUseAssistSkill
                  ? (selfAssistAoeScaling + selfAssistRandomScaling * 4 / context.enemyCount)
                  : (allyAssistAoeScaling + allyAssistRandomScaling * 3 / context.enemyCount),
              )
              .toughnessDmg(
                r.selfUseAssistSkill
                  ? (10 + 5 * 4 / context.enemyCount)
                  : (10 + 5 * 3 / context.enemyCount),
              )
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

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, r.assistSkillBuff ? talentCdBuffValue : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.RES_PEN, r.assistSkillBuff ? talentResPenValue : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.RES_PEN, (e >= 4 && r.e4ResPen && r.assistSkillBuff) ? 0.10 : 0, x.source(SOURCE_E4))
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6) ? 0.20 : 0, x.elements(ElementTag.Fire).source(SOURCE_E6))
      x.buff(StatKey.BOOST, (e >= 6 && r.e6) ? 0.75 : 0, x.damageType(DamageTag.ASSIST).source(SOURCE_E6))

      // E2: Ult and Assist Skill DMG becomes 130% of original
      x.multiplicativeBoost(StatKey.FINAL_DMG_BOOST, (e >= 2) ? 0.30 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E2))
      x.multiplicativeBoost(StatKey.FINAL_DMG_BOOST, (e >= 2) ? 0.30 : 0, x.damageType(DamageTag.ASSIST).source(SOURCE_E2))

      // Verdict: DMG +100%, Ult CD +100%
      x.buff(StatKey.BOOST, r.companionVerdict ? verdictDmgBoostValue : 0, x.source(SOURCE_UNIQUE))
      x.buff(StatKey.CD, r.companionVerdict ? verdictUltCdValue : 0, x.damageType(DamageTag.ULT).source(SOURCE_UNIQUE))

      // Decimation: CD +100%, Skill CD +100%
      x.buff(StatKey.CD, r.companionDecimation ? decimationCdValue : 0, x.source(SOURCE_UNIQUE))
      x.buff(StatKey.CD, r.companionDecimation ? decimationSkillCdValue : 0, x.damageType(DamageTag.SKILL).source(SOURCE_UNIQUE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BOOST, m.navigatorsSemaphore ? skillDmgBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (e >= 4 && m.e4ResPen && m.assistSkillBuff) ? talentResPenValue : 0, x.source(SOURCE_E4))

      // Decimation: team CD +100%, Skill CD +100%
      x.buff(StatKey.CD, m.companionDecimation ? decimationCdValue : 0, x.source(SOURCE_UNIQUE))
      x.buff(StatKey.CD, m.companionDecimation ? decimationSkillCdValue : 0, x.damageType(DamageTag.SKILL).source(SOURCE_UNIQUE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostUltAshblazingAtk(x, action, ultHitMulti(context))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostUltAshblazingAtk(action, ultHitMulti(context))
    },

    dynamicConditionals: [],
  }
}

const simulation = (): SimulationMetadata => ({
  leaderboardEnabled: false,
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
      lightConeSuperimposition: 5,
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
  showcaseColor: '#b498d3',
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
