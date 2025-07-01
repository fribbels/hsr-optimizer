import i18next from 'i18next'
import {
  AbilityType,
  FUA_DMG_TYPE,
  SKILL_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversion,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import {
  HYSILENS,
  PHAINON,
} from 'lib/simulations/tests/testMetadataConstants'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hysilens.Content')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character(HYSILENS)

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 1.40, 1.54)
  const skillVulnScaling = skill(e, 0.20, 0.22)

  const ultScaling = ult(e, 3.00, 3.24)
  const ultDefPenScaling = ult(e, 0.25, 0.27)
  const ultDotScaling = ult(e, 0.80, 0.88)

  const talentDotScaling = talent(e, 0.25, 0.275)
  const talentDotAtkLimitScaling = talent(e, 0.25, 0.275)

  const maxUltDotInstances = e >= 6 ? 12 : 8

  const defaults = {
    skillVulnerability: true,
    ultZone: true,
    ultDotStacks: maxUltDotInstances,
    ehrToDmg: true,
    e1DotDetonation: false,
    e2ResPen: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    skillVulnerability: true,
    ultZone: true,
    e2ResPen: true,
    e4MaxDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillVulnerability: {
      id: 'skillVulnerability',
      formItem: 'switch',
      text: 'Skill Vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: 'Ult zone active',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    ultDotStacks: {
      id: 'ultDotStacks',
      formItem: 'slider',
      text: 'Ult DOT trigger stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: maxUltDotInstances,
    },
    ehrToDmg: {
      id: 'ehrToDmg',
      formItem: 'switch',
      text: 'EHR to DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1DotDetonation: {
      id: 'e1DotDetonation',
      formItem: 'switch',
      text: 'E1 DOT detonation (Automatic activation)',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: true,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: 'E2 RES PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
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
    skillVulnerability: content.skillVulnerability,
    ultZone: content.ultZone,
    e2ResPen: content.e2ResPen,
    e4MaxDmgBoost: {
      id: 'e4MaxDmgBoost',
      formItem: 'switch',
      text: 'E4 DMG boost maxed',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray) => {
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Currently adds together, but they should be separate damage elements
      // E6 doubles the talent proc
      const talentDot = talentDotScaling * 3 + talentDotAtkLimitScaling
      const ultDot = r.ultDotStacks * ultDotScaling
      if (e < 1) {
        if (r.e1DotDetonation) {
          // Preprocessor to disable detonation's dot instance
          x.DOT_ATK_SCALING.buff(0, Source.NONE)
        } else {
          x.DOT_ATK_SCALING.buff(talentDot, SOURCE_TALENT)
          x.DOT_ATK_SCALING.buff(ultDot, SOURCE_ULT)
        }
      } else {
        if (r.e1DotDetonation) {
          // Triggers ult proc
          x.DOT_ATK_SCALING.buff(ultDot, SOURCE_ULT)
          // Detonates at 1.5x
          x.DOT_ATK_SCALING.buff(talentDot * 1.5, SOURCE_TALENT)
          // E6 doubles the talent and also detonates at 1.5x
          x.DOT_ATK_SCALING.buff((e >= 6 && r.e6Buffs) ? talentDot * 1.5 : 0, SOURCE_E6)
        } else {
          x.DOT_ATK_SCALING.buff(ultDot, SOURCE_ULT)
          x.DOT_ATK_SCALING.buff(talentDot, SOURCE_TALENT)
          x.DOT_ATK_SCALING.buff((e >= 6 && r.e6Buffs) ? talentDot : 0, SOURCE_E6)
        }
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(1.00, SOURCE_TALENT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam(m.skillVulnerability ? skillVulnScaling : 0, SOURCE_SKILL)
      x.DEF_PEN.buffTeam(m.ultZone ? ultDefPenScaling : 0, SOURCE_ULT)
      x.RES_PEN.buffTeam((e >= 2 && m.e2ResPen) ? 0.20 : 0, SOURCE_E2)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buffTeam(e >= 4 && t.e4MaxDmgBoost ? 0.90 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.ehrToDmg) ? Math.max(0, Math.min(0.90, 0.15 * Math.floor((x.a[Key.EHR] - 0.60) / 0.10))) : 0, SOURCE_TRACE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.ehrToDmg)}) {
  x.ELEMENTAL_DMG += min(0.90, 0.15 * floor((x.EHR - 0.60) / 0.10));
}
`
    },
  }
}
