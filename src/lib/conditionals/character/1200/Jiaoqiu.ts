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
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
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

export const JiaoqiuEntities = createEnum('Jiaoqiu')
export const JiaoqiuAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jiaoqiu')
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
  } = Source.character('1218')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultVulnerabilityScaling = ult(e, 0.15, 0.162)

  const talentVulnerabilityBase = talent(e, 0.15, 0.165)
  const talentVulnerabilityScaling = talent(e, 0.05, 0.055)

  const talentDotScaling = talent(e, 1.80, 1.98)

  const maxAshenRoastStacks = e >= 6 ? 9 : 5

  const defaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    ehrToAtkBoost: true,
    e1DmgBoost: true,
    e2Dot: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    e1DmgBoost: true,
    e6ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ashenRoastStacks: {
      id: 'ashenRoastStacks',
      formItem: 'slider',
      text: t('Content.ashenRoastStacks.text'),
      content: t('Content.ashenRoastStacks.content', {
        AshenRoastInitialVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityBase),
        AshenRoastAdditionalVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityScaling),
        AshenRoastDotMultiplier: TsUtils.precisionRound(100 * talentDotScaling),
      }),
      min: 0,
      max: maxAshenRoastStacks,
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', {
        UltScaling: TsUtils.precisionRound(100 * ultScaling),
        UltVulnerability: TsUtils.precisionRound(100 * ultVulnerabilityScaling),
        ZoneDebuffChance: TsUtils.precisionRound(100 * ult(e, 0.6, 0.62)),
      }),
    },
    ehrToAtkBoost: {
      id: 'ehrToAtkBoost',
      formItem: 'switch',
      text: t('Content.ehrToAtkBoost.text'),
      content: t('Content.ehrToAtkBoost.content'),
    },
    e1DmgBoost: {
      id: 'e1DmgBoost',
      formItem: 'switch',
      text: t('Content.e1DmgBoost.text'),
      content: t('Content.e1DmgBoost.content'),
      disabled: e < 1,
    },
    e2Dot: {
      id: 'e2Dot',
      formItem: 'switch',
      text: t('Content.e2Dot.text'),
      content: t('Content.e2Dot.content'),
      disabled: e < 2,
    },
    e6ResShred: {
      id: 'e6ResShred',
      formItem: 'switch',
      text: t('Content.e6ResShred.text'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ashenRoastStacks: content.ashenRoastStacks,
    ultFieldActive: content.ultFieldActive,
    e1DmgBoost: content.e1DmgBoost,
    e6ResShred: content.e6ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(JiaoqiuEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [JiaoqiuEntities.Jiaoqiu]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(JiaoqiuAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate DoT scaling based on stacks and E2
      const dotAtkScaling = (r.ashenRoastStacks > 0)
        ? talentDotScaling + ((e >= 2 && r.e2Dot) ? 3.00 : 0)
        : 0

      return {
        [JiaoqiuAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [JiaoqiuAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [JiaoqiuAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [JiaoqiuAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Fire)
              .dotBaseChance(1.0)
              .atkScaling(dotAtkScaling)
              .build(),
          ],
        },
        [JiaoqiuAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Ult field vulnerability (ULT damage type only)
      x.buff(
        StatKey.VULNERABILITY,
        (m.ultFieldActive) ? ultVulnerabilityScaling : 0,
        x.damageType(DamageTag.ULT).targets(TargetTag.FullTeam).source(SOURCE_ULT),
      )

      // Ashen Roast vulnerability (all damage)
      x.buff(StatKey.VULNERABILITY, (m.ashenRoastStacks > 0) ? talentVulnerabilityBase : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
      x.buff(StatKey.VULNERABILITY, Math.max(0, m.ashenRoastStacks - 1) * talentVulnerabilityScaling, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      // E1: DMG boost when enemies have Ashen Roast
      x.buff(StatKey.DMG_BOOST, (e >= 1 && m.e1DmgBoost && m.ashenRoastStacks > 0) ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))

      // E6: RES shred based on stacks
      x.buff(StatKey.RES_PEN, (e >= 6 && m.e6ResShred) ? m.ashenRoastStacks * 0.03 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [{
      id: 'JiaoqiuConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.EHR],
      chainsTo: [Stats.ATK],
      condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.ehrToAtkBoost && x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX) > 0.80
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
          (convertibleValue) => Math.min(2.40, 0.60 * Math.floor((convertibleValue - 0.80) / 0.15)) * context.baseATK,
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
          `min(2.40, 0.60 * floor((convertibleValue - 0.80) / 0.15)) * baseATK`,
          `${wgslTrue(r.ehrToAtkBoost)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, config)} > 0.80`,
        )
      },
    }],
  }
}
