import { Castorice } from 'lib/conditionals/character/1400/Castorice'
import { Evernight } from 'lib/conditionals/character/1400/Evernight'
import { Hyacine } from 'lib/conditionals/character/1400/Hyacine'
import {
  TrailblazerRemembranceCaelus,
  TrailblazerRemembranceStelle,
} from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { BuffPriority } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
  findTeamAction,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { MakeFarewellsMoreBeautiful } from 'lib/conditionals/lightcone/5star/MakeFarewellsMoreBeautiful'
import { MayRainbowsRemainInTheSky } from 'lib/conditionals/lightcone/5star/MayRainbowsRemainInTheSky'
import { ToEvernightsStars } from 'lib/conditionals/lightcone/5star/ToEvernightsStars'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  wgsl,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  HKey,
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
  DEFAULT_MEMO_SKILL,
  DEFAULT_ULT,
  NULL_TURN_ABILITY_NAME,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { relics2pByStats } from 'lib/sets/setConfigRegistry'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { floorSafe } from 'lib/utils/mathUtils'
import {
  type CharacterId,
  type Eidolon,
} from 'types/character'
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

export const CHRYSOS_HEIR_IDS = [
  '1402', // Aglaea
  '1403', // Tribbie
  '1404', // Mydei
  '1405', // Anaxa
  '1406', // Cipher
  '1407', // Castorice
  '1408', // Phainon
  '1409', // Hyacine
  '1410', // Hysilens
  '1412', // Cerydra
  '1413', // Evernight
  '1414', // PermansorTerrae
  '1415', // Cyrene
  '8007', // TrailblazerRemembranceCaelus
  '8008', // TrailblazerRemembranceStelle
] as const satisfies readonly CharacterId[]

export type ChrysosHeirId = (typeof CHRYSOS_HEIR_IDS)[number]
const chrysosHeirs = new Set<CharacterId>(CHRYSOS_HEIR_IDS)

export const CyreneEntities = createEnum('Cyrene', 'Demiurge')
export const CyreneAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.MEMO_SKILL,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Cyrene')
  const tBuff = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')

  // TODO: Confirm memo scaling
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.ULT_TALENT_MEMO_SKILL_3_SKILL_BASIC_MEMO_TALENT_5
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
  } = Source.character('1415')

  const basicScaling = basic(e, 0.50, 0.55)
  const basicEnhancedScaling = basic(e, 0.30, 0.33)

  const skillTrueDmgBuff = skill(e, 0.24, 0.264)
  const ultCrBuff = ult(e, 0.50, 0.55)
  const talentDmgBuff = talent(e, 0.20, 0.22)

  const memoSkillDmgScaling = memoSkill(e, 0.60, 0.66)
  const memoSkillDmgBuff = memoSkill(e, 0.40, 0.44)
  const memoTalentHpBuff = memoTalent(e, 0.24, 0.264)

  const memoSkillTrailblazerAtkScaling = memoSkill(e, 0.16, 0.176)
  const memoSkillTrailblazerCrScaling = memoSkill(e, 0.72, 0.792)

  const defaults = {
    buffPriority: BuffPriority.SELF,
    memospriteActive: true,
    zoneActive: true,
    talentDmgBuff: true,
    traceSpdBasedBuff: true,
    odeToEgoExtraBounces: 3,
    e1ExtraBounces: 12,
    e2TrueDmgStacks: 2,
    e4BounceStacks: 24,
    e6DefPen: true,
  }

  const teammateDefaults = {
    zoneActive: true,
    cyreneSpdDmg: true,
    specialEffect: true,
    talentDmgBuff: true,
    cyreneHp: 10000,
    cyreneCr: 1.00,
    e2TrueDmgStacks: 2,
    e6DefPen: true,
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
      text: t('Content.memospriteActive.text'),
      content: t('Content.memospriteActive.content', {
        CRBuff: precisionRound(100 * ultCrBuff),
        HPBuff: precisionRound(100 * memoTalentHpBuff),
      }),
    },
    zoneActive: {
      id: 'zoneActive',
      formItem: 'switch',
      text: t('Content.zoneActive.text'),
      content: t('Content.zoneActive.content', { TrueDmg: precisionRound(100 * skillTrueDmgBuff) }),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', { DmgBuff: precisionRound(100 * talentDmgBuff) }),
    },
    traceSpdBasedBuff: {
      id: 'traceSpdBasedBuff',
      formItem: 'switch',
      text: t('Content.traceSpdBasedBuff.text'),
      content: t('Content.traceSpdBasedBuff.content'),
    },
    odeToEgoExtraBounces: {
      id: 'odeToEgoExtraBounces',
      formItem: 'slider',
      text: t('Content.odeToEgoExtraBounces.text'),
      content: t('Content.odeToEgoExtraBounces.content'),
      min: 0,
      max: 6,
    },
    e1ExtraBounces: {
      id: 'e1ExtraBounces',
      formItem: 'slider',
      text: t('Content.e1ExtraBounces.text'),
      content: t('Content.e1ExtraBounces.content'),
      min: 0,
      max: 12,
      disabled: e < 1,
    },
    e2TrueDmgStacks: {
      id: 'e2TrueDmgStacks',
      formItem: 'slider',
      text: t('Content.e2TrueDmgStacks.text'),
      content: t('Content.e2TrueDmgStacks.content'),
      min: 0,
      max: 4,
      disabled: e < 2,
    },
    e4BounceStacks: {
      id: 'e4BounceStacks',
      formItem: 'slider',
      text: t('Content.e4BounceStacks.text'),
      content: t('Content.e4BounceStacks.content'),
      min: 0,
      max: 24,
      disabled: e < 4,
    },
    e6DefPen: {
      id: 'e6DefPen',
      formItem: 'switch',
      text: t('Content.e6DefPen.text'),
      content: t('Content.e6DefPen.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    zoneActive: content.zoneActive,
    talentDmgBuff: content.talentDmgBuff,
    specialEffect: {
      id: 'specialEffect',
      formItem: 'switch',
      text: t('TeammateContent.specialEffect.text'),
      content: t('TeammateContent.specialEffect.content', { DmgBuff: precisionRound(100 * memoSkillDmgBuff) }),
    },
    cyreneSpdDmg: {
      id: 'cyreneSpdDmg',
      formItem: 'switch',
      text: t('TeammateContent.cyreneSpdDmg.text'),
      content: t('TeammateContent.cyreneSpdDmg.content'),
    },
    cyreneHp: {
      id: 'cyreneHp',
      formItem: 'slider',
      text: t('TeammateContent.cyreneHp.text'),
      content: t('TeammateContent.cyreneHp.content', { ConversionRate: precisionRound(100 * memoSkillTrailblazerAtkScaling) }),
      min: 0,
      max: 20000,
    },
    cyreneCr: {
      id: 'cyreneCr',
      formItem: 'slider',
      text: t('TeammateContent.cyreneCr.text'),
      content: t('TeammateContent.cyreneCr.content', { ConversionRate: precisionRound(100 * memoSkillTrailblazerCrScaling) }),
      min: 0,
      max: 1.50,
      percent: true,
    },
    e2TrueDmgStacks: content.e2TrueDmgStacks,
    e6DefPen: content.e6DefPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(CyreneEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      return {
        [CyreneEntities.Cyrene]: {
          primary: true,
          summon: false,
          memosprite: false,
          memoBuffPriority: r.buffPriority !== BuffPriority.SELF,
        },
        [CyreneEntities.Demiurge]: {
          memoBaseSpdFlat: 0,
          memoBaseHpScaling: 1.00,
          memoBaseAtkScaling: 1,
          memoBaseDefScaling: 1,
          primary: false,
          summon: true,
          memosprite: true,
        },
      }
    },

    actionDeclaration: () => [...CyreneAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // BASIC: Enhanced (2 hits) vs normal scaling
      const basicHpScaling = r.memospriteActive ? basicEnhancedScaling * 2 : basicScaling
      const basicToughness = r.memospriteActive ? 15 : 10

      // MEMO_SKILL: Complex bounce calculation
      const memoSkillScalingIndividual = memoSkillDmgScaling + (e >= 4 ? r.e4BounceStacks * 0.06 : 0)
      const memoSkillTotalHpScaling = memoSkillDmgScaling
        + r.odeToEgoExtraBounces * memoSkillScalingIndividual
        + r.e1ExtraBounces * memoSkillScalingIndividual
      const memoSkillToughness = 10
        + 5 / 3 * r.odeToEgoExtraBounces
        + (e >= 1 ? 5 / 3 * r.e1ExtraBounces : 0)

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .hpScaling(basicHpScaling)
              .toughnessDmg(basicToughness)
              .build(),
          ],
        },
        [AbilityKind.MEMO_SKILL]: {
          hits: [
            HitDefinitionBuilder.crit()
              .sourceEntity(CyreneEntities.Demiurge)
              .damageType(DamageTag.MEMO)
              .damageElement(ElementTag.Ice)
              .hpScaling(memoSkillTotalHpScaling)
              .toughnessDmg(memoSkillToughness)
              .directHit(true)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
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

      // ULT CR buff (self + memosprite)
      x.buff(StatKey.CR, r.memospriteActive ? ultCrBuff : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_ULT))

      // Memo talent HP% buff (self + memosprite)
      x.buff(StatKey.HP_P, r.memospriteActive ? memoTalentHpBuff : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_MEMO))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Talent DMG boost (full team)
      x.buff(StatKey.DMG_BOOST, m.talentDmgBuff ? talentDmgBuff : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      // Skill zone TRUE_DMG_MODIFIER (full team)
      x.buff(StatKey.TRUE_DMG_MODIFIER, m.zoneActive ? skillTrueDmgBuff : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // E2 TRUE_DMG_MODIFIER stacks (full team)
      x.buff(StatKey.TRUE_DMG_MODIFIER, (e >= 2 && m.zoneActive) ? m.e2TrueDmgStacks * 0.06 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      // E6 DEF PEN (full team)
      x.buff(StatKey.DEF_PEN, (e >= 6 && m.e6DefPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    precomputeTeammateEffectsContainer: (
      x: ComputedStatsContainer,
      action: OptimizerAction,
      context: OptimizerContext,
      originalCharacterAction?: OptimizerAction,
    ) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace SPD-based DMG buff
      x.buff(StatKey.DMG_BOOST, t.cyreneSpdDmg ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      if (t.specialEffect) {
        if (!chrysosHeirs.has(context.characterId)) {
          // Non-chrysosHeirs get DMG buff to single target (follows memo buff priority)
          x.buff(StatKey.DMG_BOOST, t.specialEffect ? memoSkillDmgBuff : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_MEMO))
        } else if (context.characterId == TrailblazerRemembranceStelle.id || context.characterId == TrailblazerRemembranceCaelus.id) {
          // Trailblazers get ATK and CR conversion buffs (self + memosprite)
          const atkBuff = memoSkillTrailblazerAtkScaling * t.cyreneHp
          x.buff(StatKey.ATK, atkBuff, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(context.characterId)))
          x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, atkBuff, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(context.characterId)))

          const crBuff = memoSkillTrailblazerCrScaling * t.cyreneCr
          x.buff(StatKey.CR, crBuff, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(context.characterId)))
          x.buff(StatKey.UNCONVERTIBLE_CR_BUFF, crBuff, x.targets(TargetTag.SelfAndMemosprite).source(Source.odeTo(context.characterId)))
        }
      }
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const spd = x.getActionValue(StatKey.SPD, CyreneEntities.Cyrene)

      if (spd >= 180 && r.traceSpdBasedBuff) {
        x.buff(StatKey.DMG_BOOST, 0.20, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))
        x.buff(
          StatKey.RES_PEN,
          floorSafe(Math.min(60, spd - 180)) * 0.02,
          x.elements(ElementTag.Ice).targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE),
        )
      }
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
if (${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} >= 180.0 && ${wgslTrue(r.traceSpdBasedBuff)}) {
  ${buff.action(AKey.DMG_BOOST, 0.20).targets(TargetTag.SelfAndMemosprite).wgsl(action)}

  let penBuff = floorSafe(min(60.0, ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} - 180.0)) * 0.02;
  ${buff.hit(HKey.RES_PEN, 'penBuff').elements(ElementTag.Ice).targets(TargetTag.SelfAndMemosprite).wgsl(action)}
}
      `
    },
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
      Stats.Ice_DMG,
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
    Stats.SPD,
  ],
  breakpoints: { [Stats.SPD]: 180 },
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    DEFAULT_ULT,
    DEFAULT_MEMO_SKILL,
    WHOLE_BASIC,
    DEFAULT_MEMO_SKILL,
    WHOLE_BASIC,
    DEFAULT_MEMO_SKILL,
  ],
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.WorldRemakingDeliverer, Sets.WorldRemakingDeliverer],
    relics2pByStats(Stats.SPD_P),
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.BoneCollectionsSereneDemesne,
    Sets.AmphoreusTheEternalLand,
    Sets.ArcadiaOfWovenDreams,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Castorice.id,
      lightCone: MakeFarewellsMoreBeautiful.id,
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
    [Stats.SPD]: 1,
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.HP_P,
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.Ice_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  presets: [
    PresetEffects.BANANA_SET,
  ],
  sortOption: SortOption.MEMO_SKILL,
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.FUA,
    SortOption.ULT,
    SortOption.DOT,
  ],
  addedColumns: [
    SortOption.MEMO_SKILL,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1044,
    y: 1230,
    z: 1.65,
  },
  spineCenter: {
    x: 971,
    y: 1215,
    z: 1.7,
  },
  showcaseColor: '#a888f0',
}

export function getCyreneAction(action: OptimizerAction) {
  return findTeamAction(action, Cyrene.id)
}

export function cyreneActionExists(action: OptimizerAction) {
  return !!getCyreneAction(action)
}

export function cyreneSpecialEffectEidolonUpgraded(action: OptimizerAction) {
  return getCyreneAction(action)!.actorEidolon >= 3
}

export const Cyrene: CharacterConfig = {
  id: '1415',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
