import i18next from 'i18next'
import {
  aoe,
  ashblazingMulti,
  single,
} from 'lib/conditionals/ashblazingCompute'
import { Saber } from 'lib/conditionals/character/1000/Saber'
import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { MortenaxBlade } from 'lib/conditionals/character/1500/MortenaxBlade'
import {
  boostUltAshblazingAtk,
  gpuBoostUltAshblazingAtk,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
  teammateMatchesId,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { AThanklessCoronation } from 'lib/conditionals/lightcone/5star/AThanklessCoronation'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { ReforgedInHellfire } from 'lib/conditionals/lightcone/5star/ReforgedInHellfire'
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
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_SKILL,
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

export const GilgameshEntities = createEnum('Gilgamesh')
export const GilgameshAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character(Gilgamesh.id)

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 2.00, 2.20) // Primary target only, adjacent Blast not modeled
  const skillDefIgnoreValue = skill(e, 0.30, 0.33)

  const ultScaling = ult(e, 4.00, 4.40)
  const ultBounceScaling = ult(e, 0.40, 0.44)

  // Gilgamesh's Lightning portion only
  const jointFuaScaling = talent(e, 2.00, 2.20)
  const talentUltDmgBuffValue = talent(e, 0.40, 0.44)

  // 1 AoE + 10 bounces
  // const ultHitMulti = ashblazingMulti([
  //   aoe(ultScaling),
  //   ...Array(ultBounceCount).fill(single(ultBounceScaling)),
  // ])

  const defaults = {
    interestStacks: 12,
    kingsAcknowledgement: true,
    kingsBurden: true,
    a6TeamBuff: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    a6TeamBuff: true,
    kingsAcknowledgement: true,
    e6ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    interestStacks: {
      id: 'interestStacks',
      formItem: 'slider',
      text: 'Interest stacks (A4: +10% CRIT DMG each)',
      content: betaContent,
      min: 0,
      max: 12,
    },
    kingsAcknowledgement: {
      id: 'kingsAcknowledgement',
      formItem: 'switch',
      text: 'King\'s Acknowledgement (ignore 30% DEF)',
      content: betaContent,
    },
    kingsBurden: {
      id: 'kingsBurden',
      formItem: 'switch',
      text: 'King\'s Burden (Ult DMG +40%)',
      content: betaContent,
    },
    a6TeamBuff: {
      id: 'a6TeamBuff',
      formItem: 'switch',
      text: 'A6 Hegemon\'s Strife (team ATK / CRIT DMG)',
      content: betaContent,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: 'E6 All-Type RES PEN (allies +20%)',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    a6TeamBuff: content.a6TeamBuff,
    kingsAcknowledgement: {
      ...content.kingsAcknowledgement,
      disabled: e < 1,
    },
    e6ResPen: content.e6ResPen,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(GilgameshEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [GilgameshEntities.Gilgamesh]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...GilgameshAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const hasSaber = teammateMatchesId(context, Saber.id) > 0
      // E2: Skill primary +30%
      const skillTotalScaling = skillScaling + (e >= 2 ? 0.30 : 0)

      // E6: Ult bounce +20%
      const ultBounceTotalScaling = ultBounceScaling + (e >= 6 ? 0.20 : 0)
      const ultTotalScaling = ultScaling + ultBounceTotalScaling * 10 / context.enemyCount
      const ultToughness = 40 + 2 * 10 / context.enemyCount

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
              .skillPointsUsed(0)
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillTotalScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultTotalScaling)
              .toughnessDmg(ultToughness)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Lightning)
              .atkScaling(hasSaber ? jointFuaScaling : 0)
              .toughnessDmg(hasSaber ? 20 : 0)
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
      const r = action.characterConditionals as Conditionals<typeof content>

      // A4: +10% CD per Interest stack
      x.buff(StatKey.CD, r.interestStacks * 0.10, x.source(SOURCE_TRACE))

      x.buff(StatKey.BOOST, (r.kingsBurden) ? talentUltDmgBuffValue : 0, x.damageType(DamageTag.ULT).source(SOURCE_TALENT))

      // Self DEF ignore below E1; at E1+ the mutual container writes FullTeam instead
      x.buff(StatKey.DEF_PEN, (e < 1 && r.kingsAcknowledgement) ? skillDefIgnoreValue : 0, x.source(SOURCE_SKILL))

      // E1: +25% ATK while skill active
      x.buff(StatKey.ATK_P, (e >= 1 && r.kingsAcknowledgement) ? 0.25 : 0, x.source(SOURCE_E1))

      x.buff(StatKey.ERR, (e >= 4) ? 0.20 : 0, x.source(SOURCE_E4))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // A6: +30% ATK/CD to team, +1% per Max Energy over 100 (capped at +100%)
      const a6EnergyBonus = Math.min(1.00, Math.max(0, context.baseEnergy - 100) * 0.01)
      x.buff(StatKey.ATK_P, (m.a6TeamBuff) ? 0.30 + a6EnergyBonus : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.CD, (m.a6TeamBuff) ? 0.30 + a6EnergyBonus : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // E1: DEF ignore extends to team
      x.buff(StatKey.DEF_PEN, (e >= 1 && m.kingsAcknowledgement) ? skillDefIgnoreValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      x.buff(StatKey.RES_PEN, (e >= 6 && m.e6ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // boostUltAshblazingAtk(x, action, ultHitMulti(context))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return ''
      // return gpuBoostUltAshblazingAtk(action, ultHitMulti(context))
    },

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
    DEFAULT_FUA,
    WHOLE_SKILL,
    WHOLE_SKILL,
    // TODO: verify rotation length
  ],
  errRopeEidolon: 0,
  relicSets: [
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.InertSalsotto,
    Sets.FirmamentFrontlineGlamoth,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Saber.id,
      lightCone: AThanklessCoronation.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: MortenaxBlade.id,
      lightCone: ReforgedInHellfire.id,
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
      Stats.Lightning_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.fnMortenaxAshblazingSet(8),
  ],
  defaultDamageType: DamageTag.ULT,
  sortOption: SortOption.ULT,
  addedColumns: [
    SortOption.FUA,
  ],
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: { x: 1102, y: 943, z: 1.11 },
  showcaseColor: '#867fb3',
}

export const Gilgamesh: CharacterConfig = {
  id: '1509',
  defaultLightCone: AThanklessCoronation.id, // TODO: swap to signature LC once added
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
