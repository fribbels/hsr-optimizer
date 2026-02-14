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

export const AventurineEntities = createEnum('Aventurine')
export const AventurineAbilities = createEnum('BASIC', 'ULT', 'FUA', 'SKILL_SHIELD', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aventurine')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1304')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.70, 2.916)
  const ultCdBoost = ult(e, 0.15, 0.162)

  const talentDmgScaling = talent(e, 0.25, 0.275)
  const talentResScaling = talent(e, 0.50, 0.55)

  const fuaHits = (e >= 4) ? 10 : 7

  const skillShieldScaling = skill(e, 0.24, 0.256)
  const skillShieldFlat = skill(e, 320, 356)

  const traceShieldScaling = 0.07
  const traceShieldFlat = 96

  const defaults = {
    defToCrBoost: true,
    fuaHitsOnTarget: fuaHits,
    fortifiedWagerBuff: true,
    enemyUnnervedDebuff: true,
    e2ResShred: true,
    e4DefBuff: true,
    e6ShieldStacks: 3,
  }

  const teammateDefaults = {
    fortifiedWagerBuff: true,
    enemyUnnervedDebuff: true,
    e2ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defToCrBoost: {
      id: 'defToCrBoost',
      formItem: 'switch',
      text: t('Content.defToCrBoost.text'),
      content: t('Content.defToCrBoost.content'),
    },
    fortifiedWagerBuff: {
      id: 'fortifiedWagerBuff',
      formItem: 'switch',
      text: t('Content.fortifiedWagerBuff.text'),
      content: t('Content.fortifiedWagerBuff.content', { talentResScaling: TsUtils.precisionRound(100 * talentResScaling) }),
    },
    enemyUnnervedDebuff: {
      id: 'enemyUnnervedDebuff',
      formItem: 'switch',
      text: t('Content.enemyUnnervedDebuff.text'),
      content: t('Content.enemyUnnervedDebuff.content', { ultCdBoost: TsUtils.precisionRound(100 * ultCdBoost) }),
    },
    fuaHitsOnTarget: {
      id: 'fuaHitsOnTarget',
      formItem: 'slider',
      text: t('Content.fuaHitsOnTarget.text'),
      content: t('Content.fuaHitsOnTarget.content', { talentDmgScaling: TsUtils.precisionRound(100 * talentDmgScaling) }),
      min: 0,
      max: fuaHits,
    },
    e2ResShred: {
      id: 'e2ResShred',
      formItem: 'switch',
      text: t('Content.e2ResShred.text'),
      content: t('Content.e2ResShred.content'),
      disabled: e < 2,
    },
    e4DefBuff: {
      id: 'e4DefBuff',
      formItem: 'switch',
      text: t('Content.e4DefBuff.text'),
      content: t('Content.e4DefBuff.content'),
      disabled: e < 4,
    },
    e6ShieldStacks: {
      id: 'e6ShieldStacks',
      formItem: 'slider',
      text: t('Content.e6ShieldStacks.text'),
      content: t('Content.e6ShieldStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    fortifiedWagerBuff: content.fortifiedWagerBuff,
    enemyUnnervedDebuff: content.enemyUnnervedDebuff,
    e2ResShred: content.e2ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AventurineEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AventurineEntities.Aventurine]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(AventurineAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [AventurineAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .defScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AventurineAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .defScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [AventurineAbilities.FUA]: {
          hits: [
            // FUA damage hit (multiplied scaling based on fuaHitsOnTarget)
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Imaginary)
              .defScaling(talentDmgScaling * r.fuaHitsOnTarget)
              .toughnessDmg(10 / 3 * r.fuaHitsOnTarget)
              .build(),
            // Trace shield hit (triggered on FUA)
            HitDefinitionBuilder.shield()
              .defScaling(traceShieldScaling)
              .flatShield(traceShieldFlat)
              .build(),
          ],
        },
        [AventurineAbilities.SKILL_SHIELD]: {
          hits: [
            HitDefinitionBuilder.skillShield()
              .defScaling(skillShieldScaling)
              .flatShield(skillShieldFlat)
              .build(),
          ],
        },
        [AventurineAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_P, (e >= 4 && r.e4DefBuff) ? 0.40 : 0, x.source(SOURCE_E4))
      x.buff(StatKey.DMG_BOOST, (e >= 6) ? Math.min(1.50, 0.50 * r.e6ShieldStacks) : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES, (m.fortifiedWagerBuff) ? talentResScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
      x.buff(StatKey.CD, (m.enemyUnnervedDebuff) ? ultCdBoost : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.CD, (e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
      x.buff(StatKey.RES_PEN, (e >= 2 && m.e2ResShred) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [{
      id: 'AventurineConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.DEF],
      chainsTo: [Stats.CR],
      condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.defToCrBoost && x.getActionValueByIndex(StatKey.DEF, SELF_ENTITY_INDEX) > 1600
      },
      effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        dynamicStatConversionContainer(
          Stats.DEF,
          Stats.CR,
          this,
          x,
          action,
          context,
          SOURCE_TRACE,
          (convertibleValue) => Math.min(0.48, 0.02 * Math.floor((convertibleValue - 1600) / 100)),
        )
      },
      gpu: function(action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        const config = action.config

        return gpuDynamicStatConversion(
          Stats.DEF,
          Stats.CR,
          this,
          action,
          context,
          `min(0.48, 0.02 * floor((convertibleValue - 1600) / 100))`,
          `${wgslTrue(r.defToCrBoost)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.DEF, config)} > 1600`,
        )
      },
    }],
  }
}
