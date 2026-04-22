import {
  Cyrene,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/character/1400/Cyrene'
import { Evernight } from 'lib/conditionals/character/1400/Evernight'
import { Hyacine } from 'lib/conditionals/character/1400/Hyacine'
import {
  BuffPriority,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { MayRainbowsRemainInTheSky } from 'lib/conditionals/lightcone/5star/MayRainbowsRemainInTheSky'
import { ThisLoveForever } from 'lib/conditionals/lightcone/5star/ThisLoveForever'
import { ToEvernightsStars } from 'lib/conditionals/lightcone/5star/ToEvernightsStars'
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
  DEFAULT_MEMO_SKILL,
  DEFAULT_MEMO_TALENT,
  DEFAULT_ULT,
  NULL_TURN_ABILITY_NAME,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type CharacterConfig } from 'types/characterConfig'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'

import { precisionRound } from 'lib/utils/mathUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConditionalsController } from 'types/conditionals'
import { type AbilityDefinition } from 'types/hitConditionalTypes'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const CastoriceEntities = createEnum(
  'Castorice',
  'Netherwing',
)

export const CastoriceAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.MEMO_SKILL,
  AbilityKind.MEMO_TALENT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Castorice.Content')
  const tBuff = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.ULT_BASIC_MEMO_TALENT_3_SKILL_TALENT_MEMO_SKILL_5
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
  } = Source.character('1407')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillScaling = skill(e, 0.50, 0.55)
  const skillEnhancedScaling1 = skill(e, 0.30, 0.33)
  const skillEnhancedScaling2 = skill(e, 0.50, 0.55)

  const talentDmgBoost = talent(e, 0.20, 0.22)
  const ultTerritoryResPen = ult(e, 0.20, 0.22)

  const memoSkillScaling1 = memoSkill(e, 0.24, 0.264)
  const memoSkillScaling2 = memoSkill(e, 0.28, 0.308)
  const memoSkillScaling3 = memoSkill(e, 0.34, 0.374)

  const memoTalentScaling = memoTalent(e, 0.40, 0.44)

  const defaults = {
    buffPriority: BuffPriority.MEMO,
    memospriteActive: true,
    spdBuff: true,
    talentDmgStacks: 3,
    memoSkillEnhances: 3,
    memoTalentHits: e >= 6 ? 9 : 6,
    teamDmgBoost: true,
    memoDmgStacks: 3,
    cyreneSpecialEffect: true,
    e1EnemyHp50: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    memospriteActive: true,
    teamDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffPriority: {
      id: 'buffPriority',
      formItem: 'select',
      text: tBuff('Text'),
      content: tBuff('Content'),
      options: [
        { display: tBuff('Self'), value: BuffPriority.SELF, label: tBuff('Self') },
        { display: tBuff('Memo'), value: BuffPriority.MEMO, label: tBuff('Memo') },
      ],
      fullWidth: true,
    },
    memospriteActive: {
      id: 'memospriteActive',
      formItem: 'switch',
      text: t('memospriteActive.text'),
      content: t('memospriteActive.content', { ResDown: precisionRound(100 * ultTerritoryResPen) }),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: t('spdBuff.text'),
      content: t('spdBuff.content'),
    },
    teamDmgBoost: {
      id: 'teamDmgBoost',
      formItem: 'switch',
      text: t('teamDmgBoost.text'),
      content: t('teamDmgBoost.content'),
    },
    talentDmgStacks: {
      id: 'talentDmgStacks',
      formItem: 'slider',
      text: t('talentDmgStacks.text'),
      content: t('talentDmgStacks.content', { DmgBuff: precisionRound(100 * talentDmgBoost) }),
      min: 0,
      max: 3,
    },
    memoSkillEnhances: {
      id: 'memoSkillEnhances',
      formItem: 'slider',
      text: t('memoSkillEnhances.text'),
      content: t('memoSkillEnhances.content', {
        Multiplier1Enhance: precisionRound(100 * memoSkillScaling2),
        Multiplier2Enhance: precisionRound(100 * memoSkillScaling3),
      }),
      min: 1,
      max: 3,
    },
    memoDmgStacks: {
      id: 'memoDmgStacks',
      formItem: 'slider',
      text: t('memoDmgStacks.text'),
      content: t('memoDmgStacks.content'),
      min: 0, // Set to 0 for rotation preprocessor
      max: 6,
    },
    memoTalentHits: {
      id: 'memoTalentHits',
      formItem: 'slider',
      text: t('memoTalentHits.text'),
      content: t('memoTalentHits.content', {
        BounceCount: e >= 6 ? 9 : 6,
        Scaling: precisionRound(100 * memoTalentScaling),
      }),
      min: 0,
      max: e >= 6 ? 9 : 6,
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('cyreneSpecialEffect.text'),
      content: t('cyreneSpecialEffect.content'),
    },
    e1EnemyHp50: {
      id: 'e1EnemyHp50',
      formItem: 'switch',
      text: t('e1EnemyHp50.text'),
      content: t('e1EnemyHp50.content'),
      disabled: e < 1,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('e6Buffs.text'),
      content: t('e6Buffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    memospriteActive: content.memospriteActive,
    teamDmgBoost: content.teamDmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(CastoriceEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      return {
        [CastoriceEntities.Castorice]: {
          primary: true,
          summon: false,
          memosprite: false,
          memoBuffPriority: r.buffPriority !== BuffPriority.SELF,
        },
        [CastoriceEntities.Netherwing]: {
          primary: false,
          summon: true,
          memosprite: true,
          memoBaseSpdFlat: 165,
          memoBaseHpFlat: 34000,
          memoBaseAtkScaling: 1,
          memoBaseDefScaling: 1,
        },
      }
    },

    actionDeclaration: () => [...CastoriceAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Compute memo skill scaling based on enhances
      const memoSkillHpScaling = r.memoSkillEnhances === 1
        ? memoSkillScaling1
        : r.memoSkillEnhances === 2
        ? memoSkillScaling2
        : memoSkillScaling3

      // Compute memo talent total scaling (includes Cyrene buff)
      const cyreneOverflowPercentAssumption = 30 // Assumes 130% overflow
      const cyreneMultiplierBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.00264 : 0.0024) * cyreneOverflowPercentAssumption * (context.enemyCount < 3 ? 3 : 1)
        : 0
      const cyreneTalentScaling = r.cyreneSpecialEffect ? cyreneMultiplierBuff : 0
      const totalMemoTalentScaling = r.memoTalentHits * (memoTalentScaling + cyreneTalentScaling)

      // Normal skill ability (no memosprite)
      const normalSkillAbility: AbilityDefinition = {
        hits: [
          HitDefinitionBuilder.standardSkill()
            .damageElement(ElementTag.Quantum)
            .hpScaling(skillScaling)
            .toughnessDmg(20)
            .skillPointsUsed(0)
            .build(),
        ],
      }

      // Enhanced skill ability (with memosprite active)
      const enhancedSkillAbility: AbilityDefinition = {
        hits: [
          // Castorice's part
          HitDefinitionBuilder.standardSkill()
            .damageElement(ElementTag.Quantum)
            .hpScaling(skillEnhancedScaling1)
            .toughnessDmg(20)
            .skillPointsUsed(0)
            .build(),
          // Netherwing's part - scales off Castorice's HP
          HitDefinitionBuilder.crit()
            .sourceEntity(CastoriceEntities.Netherwing)
            .scalingEntity(CastoriceEntities.Castorice)
            .damageType(DamageTag.SKILL | DamageTag.MEMO)
            .damageElement(ElementTag.Quantum)
            .hpScaling(skillEnhancedScaling2)
            .directHit(true)
            .build(),
        ],
      }

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .hpScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: r.memospriteActive ? enhancedSkillAbility : normalSkillAbility,
        [AbilityKind.MEMO_SKILL]: {
          hits: [
            // Netherwing's skill - scales off Castorice's HP
            HitDefinitionBuilder.crit()
              .sourceEntity(CastoriceEntities.Netherwing)
              .scalingEntity(CastoriceEntities.Castorice)
              .damageType(DamageTag.MEMO)
              .damageElement(ElementTag.Quantum)
              .hpScaling(memoSkillHpScaling)
              .toughnessDmg(10)
              .directHit(true)
              .build(),
          ],
        },
        [AbilityKind.MEMO_TALENT]: {
          hits: [
            // Netherwing's talent bounces - scales off Castorice's HP
            // Combined into single hit with total scaling
            HitDefinitionBuilder.crit()
              .sourceEntity(CastoriceEntities.Netherwing)
              .scalingEntity(CastoriceEntities.Castorice)
              .damageType(DamageTag.MEMO)
              .damageElement(ElementTag.Quantum)
              .hpScaling(totalMemoTalentScaling)
              .toughnessDmg(5 * r.memoTalentHits)
              .directHit(true)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // SPD buff
      x.buff(StatKey.SPD_P, (r.spdBuff) ? 0.40 : 0, x.source(SOURCE_TRACE))

      // Talent DMG boost (both Castorice and Netherwing)
      x.buff(StatKey.DMG_BOOST, talentDmgBoost * r.talentDmgStacks, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TALENT))

      // E1: Final DMG boost for Netherwing
      if (e >= 1) {
        x.multiplicativeBoost(StatKey.FINAL_DMG_BOOST, (r.e1EnemyHp50) ? 0.40 : 0.20, x.target(CastoriceEntities.Netherwing).source(SOURCE_E1))
      }

      // E6: Quantum RES PEN (both Castorice and Netherwing)
      x.buff(
        StatKey.RES_PEN,
        (e >= 6 && r.e6Buffs) ? 0.20 : 0,
        x.elements(ElementTag.Quantum).targets(TargetTag.SelfAndMemosprite).source(SOURCE_E6),
      )

      // Netherwing's trace DMG boost
      x.buff(StatKey.DMG_BOOST, 0.30 * r.memoDmgStacks, x.target(CastoriceEntities.Netherwing).source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (m.memospriteActive) ? ultTerritoryResPen : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.DMG_BOOST, (m.teamDmgBoost) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_MEMO))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // No longer needed - scalingEntity handles the cross-entity HP scaling
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.HP_P,
    ],
    [Parts.Feet]: [
      Stats.HP_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.Quantum_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.HP_P,
    Stats.HP,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    WHOLE_SKILL,
    WHOLE_SKILL,
    DEFAULT_ULT,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_TALENT,
  ],
  relicSets: [
    [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.BoneCollectionsSereneDemesne,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Cyrene.id,
      lightCone: ThisLoveForever.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Evernight.id,
      lightCone: ToEvernightsStars.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Hyacine.id,
      lightCone: MayRainbowsRemainInTheSky.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
})

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 1,
    [Stats.HP_P]: 1,
    [Stats.SPD]: 0,
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
      Stats.HP_P,
    ],
    [Parts.Feet]: [
      Stats.HP_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.Quantum_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  presets: [
    PresetEffects.BANANA_SET,
    PresetEffects.WARRIOR_SET,
  ],
  sortOption: SortOption.MEMO_SKILL,
  addedColumns: [SortOption.MEMO_SKILL, SortOption.MEMO_TALENT],
  hiddenColumns: [SortOption.FUA, SortOption.DOT, SortOption.ULT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 875,
    y: 950,
    z: 1.00,
  },
  spineCenter: {
    x: 962,
    y: 1039,
    z: 1.3,
  },
  showcaseColor: '#630f94',
}

export const Castorice: CharacterConfig = {
  id: '1407',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
