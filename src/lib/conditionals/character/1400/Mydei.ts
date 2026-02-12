import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversion,
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  wgsl,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { MYDEI } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const MydeiEntities = createEnum('Mydei')
export const MydeiAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Mydei.Content')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
  } = Source.character('1404')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillScaling = skill(e, 0.90, 0.99)
  const skillEnhanced1Scaling = skill(e, 1.10, 1.21)
  const skillEnhanced2Scaling = skill(e, 2.80, 3.08)

  const ultScaling = ult(e, 1.60, 1.728)

  const defaults = {
    skillEnhances: 2,
    vendettaState: true,
    hpToCrConversion: true,
    cyreneSpecialEffect: false,
    e1EnhancedSkillBuff: true,
    e2DefPen: true,
    e4CdBuff: true,
  }

  const teammateDefaults = {}

  const content: ContentDefinition<typeof defaults> = {
    skillEnhances: {
      id: 'skillEnhances',
      formItem: 'slider',
      text: t('skillEnhances.text'),
      content: t('skillEnhances.content', {
        SkillPrimaryScaling: TsUtils.precisionRound(skillScaling * 100),
        SkillAdjacentScaling: TsUtils.precisionRound(skill(e, 50, 55)),
        EnhancedSkillPrimaryScaling: TsUtils.precisionRound(skillEnhanced1Scaling * 100),
        EnhancedSkillAdjacentScaling: TsUtils.precisionRound(skill(e, 66, 72.6)),
        EnhancedSkill2PrimaryScaling: TsUtils.precisionRound(skillEnhanced2Scaling * 100),
        EnhancedSkill2AdjacentScaling: TsUtils.precisionRound(skill(e, 168, 184.8)),
      }),
      min: 0,
      max: 2,
    },
    vendettaState: {
      id: 'vendettaState',
      formItem: 'switch',
      text: t('vendettaState.text'),
      content: t('vendettaState.content', { HpRestoration: TsUtils.precisionRound(talent(e, 25, 27)) }),
    },
    hpToCrConversion: {
      id: 'hpToCrConversion',
      formItem: 'switch',
      text: t('hpToCrConversion.text'),
      content: t('hpToCrConversion.content'),
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('cyreneSpecialEffect.text'),
      content: t('cyreneSpecialEffect.content'),
    },
    e1EnhancedSkillBuff: {
      id: 'e1EnhancedSkillBuff',
      formItem: 'switch',
      text: t('e1EnhancedSkillBuff.text'),
      content: t('e1EnhancedSkillBuff.content'),
      disabled: e < 1,
    },
    e2DefPen: {
      id: 'e2DefPen',
      formItem: 'switch',
      text: t('e2DefPen.text'),
      content: t('e2DefPen.content'),
      disabled: e < 2,
    },
    e4CdBuff: {
      id: 'e4CdBuff',
      formItem: 'switch',
      text: t('e4CdBuff.text'),
      content: t('e4CdBuff.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {}

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(MydeiEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [MydeiEntities.Mydei]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(MydeiAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate skill scaling based on enhance level
      let skillHpScaling: number = skillScaling
      if (r.skillEnhances == 1) skillHpScaling = skillEnhanced1Scaling
      if (r.skillEnhances == 2) skillHpScaling = skillEnhanced2Scaling

      // E1 adds 0.30 HP scaling to enhanced skill 2
      if (e >= 1 && r.e1EnhancedSkillBuff && r.skillEnhances == 2) {
        skillHpScaling += 0.30
      }

      return {
        [MydeiAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .hpScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [MydeiAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Imaginary)
              .hpScaling(skillHpScaling)
              .toughnessDmg((r.skillEnhances > 1) ? 30 : 20)
              .build(),
          ],
        },
        [MydeiAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .hpScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [MydeiAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, (e >= 2 && r.e2DefPen && r.vendettaState) ? 0.15 : 0, x.source(SOURCE_E2))
      x.buff(StatKey.CD, (e >= 4 && r.e4CdBuff) ? 0.30 : 0, x.source(SOURCE_E4))

      // Cyrene
      const cyreneSkillCdBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 2.20 : 2.00)
        : 0
      x.buff(StatKey.CD, (r.skillEnhances > 0 && r.cyreneSpecialEffect) ? cyreneSkillCdBuff : 0, x.damageType(DamageTag.SKILL).source(Source.odeTo(MYDEI)))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    newCalculateBasicEffects: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const crBuff = (r.hpToCrConversion) ? Math.max(0, Math.min(0.48, 0.016 * Math.floor((x.c.a[Key.HP] - 5000) / 100))) : 0
      x.buff(StatKey.UNCONVERTIBLE_CR_BUFF, crBuff, x.source(SOURCE_TRACE))
      x.buff(StatKey.CR, crBuff, x.source(SOURCE_TRACE))
    },
    newGpuCalculateBasicEffects: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.hpToCrConversion)}) {
  let buffValue: f32 = max(0, min(0.48, 0.016 * floor(((*p_c).HP - 5000) / 100)));
  ${buff.action(AKey.CR, 'buffValue').wgsl(action)}
  ${buff.action(AKey.UNCONVERTIBLE_CR_BUFF, 'buffValue').wgsl(action)}
}
`
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // DEF becomes 0 in Vendetta State
      if (r.vendettaState) {
        x.set(StatKey.DEF, 0, x.source(SOURCE_TALENT))
      }
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.vendettaState)}) {
  ${buff.actionSet(AKey.DEF, '0.0').wgsl(action)}
}
`
    },

    dynamicConditionals: [
      {
        id: 'MydeiHpConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.vendettaState
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(Stats.HP, Stats.HP, this, x, action, context, SOURCE_TALENT, (convertibleValue) => convertibleValue * 0.50)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.HP, Stats.HP, this, action, context, `0.50 * convertibleValue`, `${wgslTrue(r.vendettaState)}`)
        },
      },
    ],
  }
}
