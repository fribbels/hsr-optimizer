import { AbilityType } from 'lib/conditionals/conditionalConstants'
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
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const GepardEntities = createEnum('Gepard')
export const GepardAbilities = createEnum('BASIC', 'SKILL', 'ULT_SHIELD', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gepard')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1104')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultShieldScaling = ult(e, 0.45, 0.48)
  const ultShieldFlat = ult(e, 600, 667.5)

  const defaults = {
    e4TeamResBuff: true,
  }

  const teammateDefaults = {
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(GepardEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [GepardEntities.Gepard]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(GepardAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [GepardAbilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Ice)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [GepardAbilities.SKILL]: {
        hits: [
          HitDefinitionBuilder.standardSkill()
            .damageElement(ElementTag.Ice)
            .atkScaling(skillScaling)
            .toughnessDmg(20)
            .build(),
        ],
      },
      [GepardAbilities.ULT_SHIELD]: {
        hits: [
          HitDefinitionBuilder.ultShield()
            .defScaling(ultShieldScaling)
            .flatShield(ultShieldFlat)
            .build(),
        ],
      },
      [GepardAbilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES, (e >= 4 && m.e4TeamResBuff) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'GepardConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.DEF],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(Stats.DEF, Stats.ATK, this, x, action, context, SOURCE_TRACE, (convertibleValue) => convertibleValue * 0.35)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          return gpuDynamicStatConversion(Stats.DEF, Stats.ATK, this, action, context, `0.35 * convertibleValue`, `true`)
        },
      },
    ],
  }
}
