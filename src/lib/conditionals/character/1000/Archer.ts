import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Phainon.Content')
  const { basic, skill, talent, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1015')

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 4.00, 4.40)
  const skillEnhancedExtraScaling = skill(e, 1.00, 1.08)

  const ultScaling = skill(e, 12.00, 12.96)

  const fuaScaling = talent(e, 2.40, 2.64)

  const defaults = {
    cdBuff: true,
    skillEnhances: e >= 6 ? 3 : 2,
    e2UltDmgBoost: true,
    e4QuantumResPen: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    e4QuantumResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cdBuff: {
      id: 'cdBuff',
      formItem: 'switch',
      text: 'CD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    skillEnhances: {
      id: 'skillEnhances',
      formItem: 'slider',
      text: 'Skill enhances',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: e >= 6 ? 3 : 2,
    },
    e2UltDmgBoost: {
      id: 'e2UltDmgBoost',
      formItem: 'switch',
      text: 'E2 Ult DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    e4QuantumResPen: {
      id: 'e4QuantumResPen',
      formItem: 'switch',
      text: 'E4 Quantum RES PEN (force weakness break)',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: 'E6 buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4QuantumResPen: content.e4QuantumResPen
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (e >= 4 && r.e4QuantumResPen) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff(r.cdBuff ? 0.60 : 0, SOURCE_TRACE)

      x.ULT_DMG_BOOST.buff((e >= 2 && r.e2UltDmgBoost) ? 1.20 : 0, SOURCE_E2)

      x.SKILL_DEF_PEN.buff((e >= 6 && r.e6Buffs) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff(r.skillEnhances * skillEnhancedExtraScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.QUANTUM_RES_PEN.buffTeam((e >= 4 && m.e4QuantumResPen) ? 0.10 : 0, SOURCE_E4)
    },
    finalizeCalculations: () => {
    },
    gpuFinalizeCalculations: () => '',
  }
}
