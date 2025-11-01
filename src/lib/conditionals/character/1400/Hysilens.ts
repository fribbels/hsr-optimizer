import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { HYSILENS } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hysilens')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character(HYSILENS)

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 1.40, 1.54)
  const skillVulnScaling = skill(e, 0.20, 0.22)

  const ultScaling = ult(e, 2.00, 2.16)
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
    dotDetonation: false,
    cyreneSpecialEffect: true,
    e1Buffs: true,
    e4ResPen: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    skillVulnerability: true,
    ultZone: true,
    e1Buffs: true,
    e2TeammateEhr: 1.20,
    e4ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillVulnerability: {
      id: 'skillVulnerability',
      formItem: 'switch',
      text: t('Content.skillVulnerability.text'),
      content: t('Content.skillVulnerability.content', { SkillVuln: TsUtils.precisionRound(100 * skillVulnScaling) }),
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: t('Content.ultZone.text'),
      content: t('Content.ultZone.content', { ZoneDefShred: TsUtils.precisionRound(100 * ultDefPenScaling) }),
    },
    ultDotStacks: {
      id: 'ultDotStacks',
      formItem: 'slider',
      text: t('Content.ultDotStacks.text'),
      content: t('Content.ultDotStacks.content', {}),
      min: 0,
      max: maxUltDotInstances,
    },
    ehrToDmg: {
      id: 'ehrToDmg',
      formItem: 'switch',
      text: t('Content.ehrToDmg.text'),
      content: t('Content.ehrToDmg.content', {}),
    },
    dotDetonation: {
      id: 'dotDetonation',
      formItem: 'switch',
      text: t('Content.dotDetonation.text'),
      content: t('Content.dotDetonation.content', {}),
      disabled: true,
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: `Cyrene special effect`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: t('Content.e1Buffs.text'),
      content: t('Content.e1Buffs.content', {}),
      disabled: e < 1,
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: t('Content.e4ResPen.text'),
      content: t('Content.e4ResPen.content', {}),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content', {}),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillVulnerability: content.skillVulnerability,
    ultZone: content.ultZone,
    e1Buffs: content.e1Buffs,
    e2TeammateEhr: {
      id: 'e2TeammateEhr',
      formItem: 'slider',
      text: t('TeammateContent.e2TeammateEhr.text'),
      content: t('TeammateContent.e2TeammateEhr.content'),
      disabled: e < 2,
      min: 0,
      max: 1.20,
      percent: true,
    },
    e4ResPen: content.e4ResPen,
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
      // E1 doubles the talent proc
      const talentDot = talentDotScaling * 3 + talentDotAtkLimitScaling
      const updatedUltDotScaling = (e >= 6 && r.e6Buffs) ? ultDotScaling + 0.20 : ultDotScaling
      const ultDot = r.ultDotStacks * updatedUltDotScaling

      if (r.dotDetonation) {
        // Triggers ult proc
        x.DOT_ATK_SCALING.buff(ultDot, SOURCE_ULT)
        // Detonates at 1.5x
        x.DOT_ATK_SCALING.buff(talentDot * 1.5, SOURCE_TALENT)
        // E1 doubles the talent and also detonates at 1.5x
        x.DOT_ATK_SCALING.buff((e >= 1 && r.e1Buffs) ? talentDot * 1.5 : 0, SOURCE_E1)
      } else {
        x.DOT_ATK_SCALING.buff(ultDot, SOURCE_ULT)
        x.DOT_ATK_SCALING.buff(talentDot, SOURCE_TALENT)
        x.DOT_ATK_SCALING.buff((e >= 1 && r.e1Buffs) ? talentDot : 0, SOURCE_E1)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(1.00, SOURCE_TALENT)

      // Cyrene
      const cyreneDmgBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 1.32 : 1.20)
        : 0
      x.ELEMENTAL_DMG.buff((r.cyreneSpecialEffect) ? cyreneDmgBuff : 0, SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DOT_FINAL_DMG_BOOST.buffTeam((e >= 1 && m.e1Buffs) ? 0.16 : 0, SOURCE_E1)
      x.VULNERABILITY.buffTeam(m.skillVulnerability ? skillVulnScaling : 0, SOURCE_SKILL)
      x.DEF_PEN.buffTeam(m.ultZone ? ultDefPenScaling : 0, SOURCE_ULT)
      x.RES_PEN.buffTeam((e >= 4 && m.e4ResPen) ? 0.20 : 0, SOURCE_E4)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buffTeam(
        (e >= 2)
          ? Math.max(0, Math.min(0.90, 0.15 * Math.floor(TsUtils.precisionRound((t.e2TeammateEhr - 0.60) / 0.10))))
          : 0,
        SOURCE_E2,
      )
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
