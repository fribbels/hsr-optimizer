import i18next from 'i18next'
import {
  aoe,
  ashblazingMulti,
} from 'lib/conditionals/ashblazingCompute'
import { Archer } from 'lib/conditionals/character/1000/Archer'
import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { MortenaxBlade } from 'lib/conditionals/character/1500/MortenaxBlade'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
  teammateMatchesId,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { DanceDanceDance } from 'lib/conditionals/lightcone/4star/DanceDanceDance'
import { AStarThatLightsTheNight } from 'lib/conditionals/lightcone/5star/AStarThatLightsTheNight'
import { ButTheBattleIsntOver } from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver'
import { EarthlyEscapade } from 'lib/conditionals/lightcone/5star/EarthlyEscapade'
import { FlickeringStars } from 'lib/conditionals/lightcone/5star/FlickeringStars'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { ReforgedInHellfire } from 'lib/conditionals/lightcone/5star/ReforgedInHellfire'
import { TheHellWhereIdealsBurn } from 'lib/conditionals/lightcone/5star/TheHellWhereIdealsBurn'
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
  DEFAULT_SKILL,
  DEFAULT_UNIQUE,
  END_FUA,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
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

export const RinTohsakaEntities = createEnum('RinTohsaka')
export const RinTohsakaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.UNIQUE,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, talent, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character(RinTohsaka.id)

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 1.80, 1.98)
  const enhancedSkillAoeScaling = skill(e, 0.90, 0.99)
  const enhancedSkillBounceScaling = skill(e, 0.90, 0.99)
  const maxBounces = 33
  const maxSpConsumed = 14

  const ultScaling = ult(e, 6.00, 6.60)
  const ultVulnerabilityValue = ult(e, 0.20, 0.22)

  // Joint FUA — Rin's portion only (Archer's half scales off Archer's ATK)
  const fuaScaling = talent(e, 3.00, 3.30)
  const talentCdBuffValue = talent(e, 0.70, 0.77)

  const ultHitMulti = ashblazingMulti([aoe(1)])

  const uniqueHitMulti = ashblazingMulti(Array(5).fill(aoe(0.20)))

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    switch (action.actionType) {
      case AbilityKind.ULT:
        return ultHitMulti(context)
      default:
        return uniqueHitMulti(context)
    }
  }

  const defaults = {
    enhancedSkill: true,
    skillBounces: 10,
    enhancedSkillSpConsumed: 11,
    talentCdBuff: true,
    elegantConduct: true,
    ladylikePoise: true,
    ultDmgTakenDebuff: true,
    e2Buffs: true,
    e4TalentCdStacks: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    elegantConduct: true,
    talentCdBuff: true,
    ultDmgTakenDebuff: true,
    e2Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: 'Enhanced Skill',
      content: betaContent,
    },
    skillBounces: {
      id: 'skillBounces',
      formItem: 'slider',
      text: 'Skill bounces',
      content: betaContent,
      min: 0,
      max: maxBounces,
    },
    enhancedSkillSpConsumed: {
      id: 'enhancedSkillSpConsumed',
      formItem: 'slider',
      text: 'Enhanced Skill SP consumed',
      content: betaContent,
      min: 0,
      max: maxSpConsumed,
    },
    talentCdBuff: {
      id: 'talentCdBuff',
      formItem: 'switch',
      text: 'Talent CD buff',
      content: betaContent,
    },
    elegantConduct: {
      id: 'elegantConduct',
      formItem: 'switch',
      text: 'Elegant Conduct',
      content: betaContent,
    },
    ladylikePoise: {
      id: 'ladylikePoise',
      formItem: 'switch',
      text: 'SPD buff',
      content: betaContent,
    },
    ultDmgTakenDebuff: {
      id: 'ultDmgTakenDebuff',
      formItem: 'switch',
      text: 'Ult Vulnerability',
      content: betaContent,
    },
    e2Buffs: {
      id: 'e2Buffs',
      formItem: 'switch',
      text: 'E2 Skill DMG buffs',
      content: betaContent,
      disabled: e < 2,
    },
    e4TalentCdStacks: {
      id: 'e4TalentCdStacks',
      formItem: 'switch',
      text: 'E4 CD stacks',
      content: betaContent,
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: 'E6 RES PEN',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    elegantConduct: content.elegantConduct,
    talentCdBuff: content.talentCdBuff,
    ultDmgTakenDebuff: content.ultDmgTakenDebuff,
    e2Buffs: content.e2Buffs,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(RinTohsakaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [RinTohsakaEntities.RinTohsaka]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...RinTohsakaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Enhanced: 80% AoE + 80% per bounce (randomly distributed). Unenhanced: 160% single target.
      const skillTotalScaling = r.enhancedSkill
        ? enhancedSkillAoeScaling + enhancedSkillBounceScaling * r.skillBounces / context.enemyCount
        : skillScaling
      const skillTotalToughness = r.enhancedSkill
        ? 20 + 2 * r.skillBounces / context.enemyCount
        : 20

      const archerInTeam = teammateMatchesId(context, Archer.id)

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillTotalScaling)
              .toughnessDmg(skillTotalToughness)
              .skillPointsUsed(r.enhancedSkill ? r.enhancedSkillSpConsumed : 1)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [AbilityKind.UNIQUE]: {
          hits: archerInTeam
            ? [
              HitDefinitionBuilder.standardFua()
                .damageElement(ElementTag.Quantum)
                .atkScaling(fuaScaling)
                .toughnessDmg(20)
                .build(),
            ]
            : [],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.elegantConduct) ? 1.50 : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.RES_PEN, (r.elegantConduct) ? 0.15 : 0, x.source(SOURCE_TRACE))

      // Trace SPD +20% after Enhanced Skill
      x.buff(StatKey.SPD_P, (r.ladylikePoise) ? 0.20 : 0, x.source(SOURCE_TRACE))

      // E2 Skill DMG +30%
      x.buff(StatKey.BOOST, (e >= 2 && r.e2Buffs) ? 0.30 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_E2))

      // E4 Talent CD stacks 2x on Rin
      x.buff(StatKey.CD, (e >= 4 && r.e4TalentCdStacks && r.talentCdBuff) ? talentCdBuffValue : 0, x.source(SOURCE_E4))

      // E6 All-Type RES PEN +20%
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6ResPen) ? 0.20 : 0, x.source(SOURCE_E6))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Talent CD buff on ally SP consume/recover
      x.buff(StatKey.CD, (m.talentCdBuff) ? talentCdBuffValue : 0, x.source(SOURCE_TALENT))

      // Ult vulnerability debuff
      x.buff(StatKey.VULNERABILITY, m.ultDmgTakenDebuff ? ultVulnerabilityValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // E2 team Skill DMG becomes 130% of original
      x.multiplicativeBoost(
        StatKey.FINAL_DMG_BOOST,
        (e >= 2 && m.e2Buffs) ? 0.30 : 0,
        x.damageType(DamageTag.SKILL).targets(TargetTag.FullTeam).source(SOURCE_E2),
      )
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      if (context.characterId == Archer.id) {
        x.buff(StatKey.ATK_P, (t.elegantConduct) ? 1.50 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
        x.buff(StatKey.RES_PEN, (t.elegantConduct) ? 0.15 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      }
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, getHitMulti(action, context))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(getHitMulti(action, context), action)
    },
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
      Stats.Quantum_DMG,
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
    DEFAULT_SKILL,
    DEFAULT_UNIQUE,
    START_SKILL,
    DEFAULT_UNIQUE,
  ],
  errRopeEidolon: 0,
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.TengokuLivestream,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Archer.id,
      lightCone: TheHellWhereIdealsBurn.id,
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
      characterId: HuohuoB1.id,
      lightCone: NightOfFright.id,
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
      Stats.Quantum_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.TENGOKU_SET,
  ],
  defaultDamageType: DamageTag.SKILL,
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: { x: 1031, y: 1016, z: 1.02 },
  showcaseColor: '#bd81e1',
}

export const RinTohsaka: CharacterConfig = {
  id: '1508',
  defaultLightCone: FlickeringStars.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
