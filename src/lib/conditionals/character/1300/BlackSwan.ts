import { createEnum } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ReforgedRemembrance } from 'lib/conditionals/lightcone/5star/ReforgedRemembrance'
import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { DamageTag, ElementTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import { type ScoringMetadata } from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const BlackSwanEntities = createEnum('BlackSwan')
export const BlackSwanAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),

    entityDeclaration: () => Object.values(BlackSwanEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BlackSwanEntities.BlackSwan]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...BlackSwanAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AbilityKind.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Wind)
            .atkScaling(1.00)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [AbilityKind.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 1,
    [Stats.ATK_P]: 1,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 1,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.Wind_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  presets: [
    PresetEffects.PRISONER_SET,
    PresetEffects.fnMortenaxAshblazingSet(5),
  ],
  defaultDamageType: DamageTag.BASIC,
  sortOption: SortOption.BASIC,
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.ULT,
    SortOption.FUA,
    SortOption.DOT,
  ],
})

const display = {
  imageCenter: {
    x: 964,
    y: 934,
    z: 1.3,
  },
  disableSpine: true,
  showcaseColor: '#000000', // Deprecated Novaflare - Do not change
}

// Pre-Novaflare version. See BlackSwanB1.ts for the updated variant.
export const BlackSwan: CharacterConfig = {
  id: '1307',
  defaultLightCone: ReforgedRemembrance.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
