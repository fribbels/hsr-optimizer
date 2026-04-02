import i18next from 'i18next'
import { Jiaoqiu } from 'lib/conditionals/character/1200/Jiaoqiu'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { AlongThePassingShore } from 'lib/conditionals/lightcone/5star/AlongThePassingShore'
import { ThoseManySprings } from 'lib/conditionals/lightcone/5star/ThoseManySprings'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  END_SKILL,
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
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'

import type { Eidolon } from 'types/character'
import type { CharacterConfig } from 'types/characterConfig'
import type { CharacterConditionalsController } from 'types/conditionals'
import type {
  ScoringMetadata,
  SimulationMetadata,
} from 'types/metadata'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const WeltB1Entities = createEnum('WeltB1')
export const WeltB1Abilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Welt')
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
  } = Source.character(WeltB1.id)

  const skillExtraHitsMax = 4

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.72, 0.792)
  const ultScaling = ult(e, 1.50, 1.62)
  const talentScaling = talent(e, 1.00, 1.10)

  // Trace: Judge - Additional DMG on Basic (80% of Basic mult) and Skill (120% of Skill mult)
  const basicTraceAdditionalScaling = 0.80 * basicScaling
  const skillTraceAdditionalScaling = 1.20 * skillScaling

  const defaults = {
    enemySlowed: true,
    enemyWeightless: true,
    retributionDmgStacks: 15,
    ehrToAtkBoost: true,
    traceAdditionalDmg: true,
    skillExtraHits: skillExtraHitsMax,
    e1WeightlessAdditionalDmg: true,
    e4WeightlessResPen: true,
    e6SlowedCrCdBoost: true,
  }

  const teammateDefaults = {
    enemyWeightless: true,
    retributionDmgStacks: 15,
    e4WeightlessResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: betaContent,
    },
    enemyWeightless: {
      id: 'enemyWeightless',
      formItem: 'switch',
      text: 'Enemy Weightless',
      content: betaContent,
    },
    retributionDmgStacks: {
      id: 'retributionDmgStacks',
      formItem: 'slider',
      text: 'Retribution DMG stacks',
      content: betaContent,
      min: 0,
      max: 15,
    },
    ehrToAtkBoost: {
      id: 'ehrToAtkBoost',
      formItem: 'switch',
      text: 'EHR to ATK boost',
      content: betaContent,
    },
    traceAdditionalDmg: {
      id: 'traceAdditionalDmg',
      formItem: 'switch',
      text: 'Trace Additional DMG',
      content: betaContent,
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content', { skillScaling: precisionRound(100 * skillScaling) }),
      min: 0,
      max: skillExtraHitsMax,
    },
    e1WeightlessAdditionalDmg: {
      id: 'e1WeightlessAdditionalDmg',
      formItem: 'switch',
      text: 'E1 Weightless Additional DMG',
      content: betaContent,
      disabled: (e < 1),
    },
    e4WeightlessResPen: {
      id: 'e4WeightlessResPen',
      formItem: 'switch',
      text: 'E4 RES PEN',
      content: betaContent,
      disabled: (e < 4),
    },
    e6SlowedCrCdBoost: {
      id: 'e6SlowedCrCdBoost',
      formItem: 'switch',
      text: 'E6 Slowed CR/CD boost',
      content: betaContent,
      disabled: (e < 6),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyWeightless: content.enemyWeightless,
    retributionDmgStacks: content.retributionDmgStacks,
    e4WeightlessResPen: content.e4WeightlessResPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(WeltB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [WeltB1Entities.WeltB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...WeltB1Abilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Talent: Additional DMG when hitting Slowed enemy
      const talentAdditionalScaling = r.enemySlowed ? talentScaling : 0

      // E1: Skill/Ult hitting Weightless target → Additional DMG = 40% of Ult mult
      const e1AdditionalScaling = (e >= 1 && r.e1WeightlessAdditionalDmg && r.enemyWeightless) ? 0.40 * ultScaling : 0

      // Skill total scaling includes base hit + extra bounces
      const skillTotalScaling = skillScaling * (1 + r.skillExtraHits)
      const skillToughness = 10 + 10 * r.skillExtraHits

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            // Trace: Judge - Basic Additional DMG (80% of Basic mult)
            ...(r.traceAdditionalDmg
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(basicTraceAdditionalScaling)
                  .build(),
              ]
              : []),
            // Talent: Additional DMG when hitting Slowed enemy
            ...(talentAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(talentAdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(skillTotalScaling)
              .toughnessDmg(skillToughness)
              .build(),
            // Trace: Judge - Skill Additional DMG (120% of Skill mult)
            ...(r.traceAdditionalDmg
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(skillTraceAdditionalScaling)
                  .build(),
              ]
              : []),
            // Talent: Additional DMG when hitting Slowed enemy
            ...(talentAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(talentAdditionalScaling * (1 + r.skillExtraHits))
                  .build(),
              ]
              : []),
            // E1: Skill hitting Weightless target
            ...(e1AdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(e1AdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            // Talent: Additional DMG when hitting Slowed enemy
            // Ult has 2 hits (10%/90%) so the talent procs twice
            ...(talentAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(talentAdditionalScaling * 2)
                  .build(),
              ]
              : []),
            // E1: Ult hitting Weightless target
            ...(e1AdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(e1AdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: Skill/Ult hitting Slow target → CR +30%, CD +60%
      x.buff(StatKey.CR, (e >= 6 && r.e6SlowedCrCdBoost) ? 0.30 : 0, x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_E6))
      x.buff(StatKey.CD, (e >= 6 && r.e6SlowedCrCdBoost) ? 0.60 : 0, x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace: Retribution - DMG boost 6% per stack when attacking Weightless, max 15 stacks
      x.buff(StatKey.DMG_BOOST, (m.enemyWeightless) ? 0.06 * m.retributionDmgStacks : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // Talent: Weightless DEF shred 40%
      x.buff(StatKey.DEF_PEN, (m.enemyWeightless) ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      // E4: Weightless All-Type RES -30%
      x.buff(StatKey.RES_PEN, (e >= 4 && m.e4WeightlessResPen && m.enemyWeightless) ? 0.30 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // Trace: Punishment - EHR > 40% → every 10% over gives +20% ATK, max 80%
    dynamicConditionals: [{
      id: 'WeltB1EhrToAtkConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.EHR],
      chainsTo: [Stats.ATK],
      condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.ehrToAtkBoost && x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX) > 0.40
      },
      effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        dynamicStatConversionContainer(
          Stats.EHR,
          Stats.ATK,
          this,
          x,
          action,
          context,
          SOURCE_TRACE,
          (convertibleValue) => Math.min(0.80, 0.20 * Math.floor((convertibleValue - 0.40) / 0.10)) * context.baseATK,
        )
      },
      gpu: function(action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        const config = action.config

        return gpuDynamicStatConversion(
          Stats.EHR,
          Stats.ATK,
          this,
          action,
          context,
          `min(0.80, 0.20 * floor((convertibleValue - 0.40) / 0.10)) * baseATK`,
          `${wgslTrue(r.ehrToAtkBoost)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, config)} > 0.40`,
        )
      },
    }],
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
      Stats.Imaginary_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.EHR,
    Stats.ATK_P,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL,
    WHOLE_SKILL,
    WHOLE_SKILL,
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  relicSets: [
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    Sets.FirmamentFrontlineGlamoth,
    Sets.IzumoGenseiAndTakamaDivineRealm,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Acheron.id,
      lightCone: AlongThePassingShore.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Jiaoqiu.id,
      lightCone: ThoseManySprings.id,
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
    [Stats.EHR]: 1,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.CD,
      Stats.CR,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Imaginary_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.WASTELANDER_SET,
    PresetEffects.fnPioneerSet(4),
  ],
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 885,
    y: 950,
    z: 1,
  },
  disableSpine: true,
  showcaseColor: '#948ff8',
}

export const WeltB1: CharacterConfig = {
  id: '1004b1',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
