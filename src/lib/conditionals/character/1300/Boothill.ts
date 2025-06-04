import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Boothill')
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
  } = Source.character('1315')

  const standoffVulnerabilityBoost = skill(e, 0.30, 0.33)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.00, 4.32)

  const pocketTrickshotsToTalentBreakDmg: NumberToNumberMap = {
    0: 0,
    1: talent(e, 0.70, 0.77),
    2: talent(e, 1.20, 1.32),
    3: talent(e, 1.70, 1.87),
  }

  const defaults = {
    standoffActive: true,
    pocketTrickshotStacks: 3,
    beToCritBoost: true,
    talentBreakDmgScaling: true,
    e1DefShred: true,
    e2BeBuff: true,
    e4TargetStandoffVulnerability: true,
    e6AdditionalBreakDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    standoffActive: {
      id: 'standoffActive',
      formItem: 'switch',
      text: t('Content.standoffActive.text'),
      content: t('Content.standoffActive.content', { standoffVulnerabilityBoost: TsUtils.precisionRound(100 * standoffVulnerabilityBoost) }),
    },
    pocketTrickshotStacks: {
      id: 'pocketTrickshotStacks',
      formItem: 'slider',
      text: t('Content.pocketTrickshotStacks.text'),
      content: t('Content.pocketTrickshotStacks.content'),
      min: 0,
      max: 3,
    },
    beToCritBoost: {
      id: 'beToCritBoost',
      formItem: 'switch',
      text: t('Content.beToCritBoost.text'),
      content: t('Content.beToCritBoost.content'),
    },
    talentBreakDmgScaling: {
      id: 'talentBreakDmgScaling',
      formItem: 'switch',
      text: t('Content.talentBreakDmgScaling.text'),
      content: t('Content.talentBreakDmgScaling.content'),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e2BeBuff: {
      id: 'e2BeBuff',
      formItem: 'switch',
      text: t('Content.e2BeBuff.text'),
      content: t('Content.e2BeBuff.content'),
      disabled: e < 2,
    },
    e4TargetStandoffVulnerability: {
      id: 'e4TargetStandoffVulnerability',
      formItem: 'switch',
      text: t('Content.e4TargetStandoffVulnerability.text'),
      content: t('Content.e4TargetStandoffVulnerability.content'),
      disabled: e < 4,
    },
    e6AdditionalBreakDmg: {
      id: 'e6AdditionalBreakDmg',
      formItem: 'switch',
      text: t('Content.e6AdditionalBreakDmg.text'),
      content: t('Content.e6AdditionalBreakDmg.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.talentBreakDmgScaling) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BE.buff((e >= 2 && r.e2BeBuff) ? 0.30 : 0, SOURCE_E2)
      x.VULNERABILITY.buff((r.standoffActive) ? standoffVulnerabilityBoost : 0, SOURCE_SKILL)

      x.DEF_PEN.buff((e >= 1 && r.e1DefShred) ? 0.16 : 0, SOURCE_E1)
      x.VULNERABILITY.buff((e >= 4 && r.standoffActive && r.e4TargetStandoffVulnerability) ? 0.12 : 0, SOURCE_E4)

      x.BASIC_ATK_SCALING.buff((r.standoffActive) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      x.BASIC_BREAK_EFFICIENCY_BOOST.buff((r.standoffActive) ? r.pocketTrickshotStacks * 0.50 : 0, SOURCE_TALENT)

      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff((r.standoffActive) ? 20 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      // Since his toughness scaling is capped at 1600% x 30, we invert the toughness scaling on the original break dmg and apply the new scaling
      const newMaxToughness = Math.min(16.00 * 30, context.enemyMaxToughness)
      const inverseBreakToughnessMultiplier = 1 / (0.5 + context.enemyMaxToughness / 120)
      const newBreakToughnessMultiplier = 0.5 + newMaxToughness / 120
      let talentBreakDmgScaling = pocketTrickshotsToTalentBreakDmg[r.pocketTrickshotStacks]
      talentBreakDmgScaling += (e >= 6 && r.e6AdditionalBreakDmg) ? 0.40 : 0
      x.BASIC_BREAK_DMG_MODIFIER.buff(
        (r.talentBreakDmgScaling && r.standoffActive)
          ? inverseBreakToughnessMultiplier * newBreakToughnessMultiplier * talentBreakDmgScaling
          : 0,
        SOURCE_TALENT,
      )

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [{
      id: 'BoothillConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.BE],
      chainsTo: [Stats.CR, Stats.CD],
      condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return r.beToCritBoost
      },
      effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const stateValue = action.conditionalState[this.id] || 0

        const stateCrBuffValue = Math.min(0.30, 0.10 * stateValue)
        const stateCdBuffValue = Math.min(1.50, 0.50 * stateValue)

        const crBuffValue = Math.min(0.30, 0.10 * x.a[Key.BE])
        const cdBuffValue = Math.min(1.50, 0.50 * x.a[Key.BE])

        action.conditionalState[this.id] = x.a[Key.BE]

        x.CR.buffDynamic(crBuffValue - stateCrBuffValue, SOURCE_TRACE, action, context)
        x.CD.buffDynamic(cdBuffValue - stateCdBuffValue, SOURCE_TRACE, action, context)
      },
      gpu: function(action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return conditionalWgslWrapper(
          this,
          `
if (${wgslFalse(r.beToCritBoost)}) {
  return;
}

let be = x.BE;
let stateValue = (*p_state).BoothillConversionConditional;

let stateCrBuffValue = min(0.30, 0.10 * stateValue);
let stateCdBuffValue = min(1.50, 0.50 * stateValue);

let crBuffValue = min(0.30, 0.10 * be);
let cdBuffValue = min(1.50, 0.50 * be);

(*p_state).BoothillConversionConditional = be;

(*p_x).CR += crBuffValue - stateCrBuffValue;
(*p_x).CD += cdBuffValue - stateCdBuffValue;
    `,
        )
      },
    }],
  }
}
