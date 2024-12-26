import i18next from 'i18next'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aglaea')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const enhancedBasicScaling = basic(e, 2.20, 2.42)

  const defaults = {
    WIP: true,
  }

  const teammateDefaults = {
    e4Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    WIP: {
      id: 'WIP',
      formItem: 'switch',
      text: 'WIP',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4Vulnerability: {
      lc: true,
      id: 'e4Vulnerability',
      formItem: 'switch',
      text: 'E4 vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff(enhancedBasicScaling, Source.NONE)
      x.BASIC_MEMO_JOINT_SCALING.buff(enhancedBasicScaling, Source.NONE)

      x.m.BASIC_SCALING.buff(enhancedBasicScaling, Source.NONE)

      x.MEMO_HP_SCALING.buff(0.66, Source.NONE)
      x.MEMO_HP_FLAT.buff(720, Source.NONE)
      x.MEMO_SPD_SCALING.buff(0.35, Source.NONE)
      x.MEMO_DEF_SCALING.buff(1, Source.NONE)
      x.MEMO_ATK_SCALING.buff(1, Source.NONE)

      x.m.HP_P.buff(1.00, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((e >= 4 && m.e4Vulnerability) ? 0.08 : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
      x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.ATK], Source.NONE)
      x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.ATK], Source.NONE)
      x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * x.a[Key.ATK], Source.NONE)
      x.DOT_DMG.buff(x.a[Key.DOT_SCALING] * x.a[Key.ATK], Source.NONE)

      x.m.BASIC_DMG.buff(x.m.a[Key.BASIC_SCALING] * x.m.a[Key.ATK], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * x.ATK;
x.DOT_DMG += x.DOT_SCALING * x.ATK;

m.BASIC_DMG += m.BASIC_SCALING * m.ATK;
`
    },
  }
}
