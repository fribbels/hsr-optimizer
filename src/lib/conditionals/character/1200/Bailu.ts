import { Castorice } from 'lib/conditionals/character/1400/Castorice'
import { Cipher } from 'lib/conditionals/character/1400/Cipher'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { LiesAflutterInTheWind } from 'lib/conditionals/lightcone/5star/LiesAflutterInTheWind'
import { MakeFarewellsMoreBeautiful } from 'lib/conditionals/lightcone/5star/MakeFarewellsMoreBeautiful'
import { TimeWaitsForNoOne } from 'lib/conditionals/lightcone/5star/TimeWaitsForNoOne'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_HEAL,
  SPREAD_RELICS_4P_HEAL,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'

import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'

import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

import {
  AbilityKind,
  DEFAULT_SKILL_HEAL,
  DEFAULT_TALENT_HEAL,
  DEFAULT_ULT_HEAL,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
export const BailuEntities = createEnum('Bailu')
export const BailuAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL_HEAL,
  AbilityKind.ULT_HEAL,
  AbilityKind.TALENT_HEAL,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bailu')
  const tHeal = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1211')

  const basicScaling = basic(e, 1.0, 1.1)

  const skillHealScaling = skill(e, 0.117, 0.1248)
  const skillHealFlat = skill(e, 312, 347.1)

  const ultHealScaling = ult(e, 0.135, 0.144)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.054, 0.0576)
  const talentHealFlat = talent(e, 144, 160.2)

  const defaults = {
    healingMaxHpBuff: true,
    talentDmgReductionBuff: true,
    e2UltHealingBuff: true,
    e4SkillHealingDmgBuffStacks: 0,
  }

  const teammateDefaults = {
    healingMaxHpBuff: true,
    talentDmgReductionBuff: true,
    e4SkillHealingDmgBuffStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    healingMaxHpBuff: {
      id: 'healingMaxHpBuff',
      formItem: 'switch',
      text: t('Content.healingMaxHpBuff.text'),
      content: t('Content.healingMaxHpBuff.content'),
    },
    talentDmgReductionBuff: {
      id: 'talentDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.talentDmgReductionBuff.text'),
      content: t('Content.talentDmgReductionBuff.content'),
    },
    e2UltHealingBuff: {
      id: 'e2UltHealingBuff',
      formItem: 'switch',
      text: t('Content.e2UltHealingBuff.text'),
      content: t('Content.e2UltHealingBuff.content'),
      disabled: e < 2,
    },
    e4SkillHealingDmgBuffStacks: {
      id: 'e4SkillHealingDmgBuffStacks',
      formItem: 'slider',
      text: t('Content.e4SkillHealingDmgBuffStacks.text'),
      content: t('Content.e4SkillHealingDmgBuffStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    healingMaxHpBuff: content.healingMaxHpBuff,
    talentDmgReductionBuff: content.talentDmgReductionBuff,
    e4SkillHealingDmgBuffStacks: content.e4SkillHealingDmgBuffStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(BailuEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BailuEntities.Bailu]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...BailuAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
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
        [AbilityKind.SKILL_HEAL]: {
          hits: [
            HitDefinitionBuilder.skillHeal()
              .hpScaling(skillHealScaling)
              .flatHeal(skillHealFlat)
              .build(),
          ],
        },
        [AbilityKind.ULT_HEAL]: {
          hits: [
            HitDefinitionBuilder.ultHeal()
              .hpScaling(ultHealScaling)
              .flatHeal(ultHealFlat)
              .build(),
          ],
        },
        [AbilityKind.TALENT_HEAL]: {
          hits: [
            HitDefinitionBuilder.heal()
              .hpScaling(talentHealScaling)
              .flatHeal(talentHealFlat)
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

      // Stats
      x.buff(StatKey.OHB, (e >= 2 && r.e2UltHealingBuff) ? 0.15 : 0, x.source(SOURCE_E2))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.HP_P, (m.healingMaxHpBuff) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.BOOST, (e >= 4) ? m.e4SkillHealingDmgBuffStacks * 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
      x.multiplicativeComplement(StatKey.DMG_RED, (m.talentDmgReductionBuff) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

const healSimulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [Stats.OHB],
    [Parts.Feet]: [Stats.SPD, Stats.HP_P],
    [Parts.PlanarSphere]: [Stats.HP_P],
    [Parts.LinkRope]: [Stats.HP_P],
  },
  substats: [
    Stats.HP_P,
    Stats.HP,
    Stats.SPD,
    Stats.RES,
    Stats.DEF_P,
  ],
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    DEFAULT_SKILL_HEAL,
    DEFAULT_TALENT_HEAL,
    DEFAULT_ULT_HEAL,
  ],
  relicSets: [
    [Sets.WarriorGoddessOfSunAndThunder, Sets.WarriorGoddessOfSunAndThunder],
    ...SPREAD_RELICS_4P_HEAL,
  ],
  ornamentSets: [
    Sets.LushakaTheSunkenSeas,
    ...SPREAD_ORNAMENTS_2P_HEAL,
  ],
  teammates: [
    {
      characterId: Castorice.id,
      lightCone: MakeFarewellsMoreBeautiful.id,
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
      characterId: Cipher.id,
      lightCone: LiesAflutterInTheWind.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
  deprioritizeBuffs: true,
})

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 1,
    [Stats.HP_P]: 1,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0.50,
    [Stats.BE]: 0,
  },
  flatMainstatBoost: {
    [Stats.HP]: true,
  },
  parts: {
    [Parts.Body]: [
      Stats.OHB,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.HP_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.WARRIOR_SET,
  ],
  sortOption: SortOption.TALENT_HEAL,
  addedColumns: [SortOption.OHB],
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.ULT,
    SortOption.FUA,
    SortOption.DOT,
  ],
  healSimulation: healSimulation(),
  eidolonImage: 4,
})

const display = {
  imageCenter: {
    x: 1050,
    y: 950,
    z: 1.05,
  },
  disableSpine: true,
  showcaseColor: '#6282b3',
}

export const Bailu: CharacterConfig = {
  id: '1211',
  defaultLightCone: TimeWaitsForNoOne.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
