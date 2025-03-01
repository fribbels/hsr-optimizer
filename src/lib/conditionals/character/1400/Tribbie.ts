import { DOT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { allTypesExcept, buffAbilityTrueDmg, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Tribbie.Content')
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
  } = Source.character('1403')

  const basicScaling = basic(e, 0.30, 0.33)

  const skillResPen = skill(e, 0.24, 0.264)

  const ultScaling = ult(e, 0.30, 0.33)
  const ultVulnerability = ult(e, 0.30, 0.33)
  const ultAdditionalDmgScaling = ult(e, 0.12, 0.132)

  const talentScaling = talent(e, 0.18, 0.198)

  const defaults = {
    numinosity: true,
    ultZone: true,
    alliesMaxHp: 25000,
    talentFuaStacks: 3,
    e1TrueDmg: true,
    e2AdditionalDmg: true,
    e4DefPen: true,
    e6FuaScaling: true,
  }

  const teammateDefaults = {
    numinosity: true,
    ultZone: true,
    e1TrueDmg: true,
    e4DefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    numinosity: {
      id: 'numinosity',
      formItem: 'switch',
      text: t('numinosity.text'),
      content: t('numinosity.content', { ResPen: TsUtils.precisionRound(skillResPen * 100) }),
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: t('ultZone.text'),
      content: t('ultZone.content', {
        UltScaling: TsUtils.precisionRound(100 * ultScaling),
        ZoneVulnerability: TsUtils.precisionRound(100 * ultVulnerability),
        AdditionalDmgScaling: TsUtils.precisionRound(100 * ultAdditionalDmgScaling),
      }),
    },
    alliesMaxHp: {
      id: 'alliesMaxHp',
      formItem: 'slider',
      text: t('alliesMaxHp.text'),
      content: t('alliesMaxHp.content'),
      min: 0,
      max: 50000,
    },
    talentFuaStacks: {
      id: 'talentFuaStacks',
      formItem: 'slider',
      text: t('talentFuaStacks.text'),
      content: t('talentFuaStacks.content'),
      min: 0,
      max: 3,
    },
    e1TrueDmg: {
      id: 'e1TrueDmg',
      formItem: 'switch',
      text: t('e1TrueDmg.text'),
      content: t('e1TrueDmg.content'),
      disabled: e < 1,
    },
    e2AdditionalDmg: {
      id: 'e2AdditionalDmg',
      formItem: 'switch',
      text: t('e2AdditionalDmg.text'),
      content: t('e2AdditionalDmg.content'),
      disabled: e < 2,
    },
    e4DefPen: {
      id: 'e4DefPen',
      formItem: 'switch',
      text: t('e4DefPen.text'),
      content: t('e4DefPen.content'),
      disabled: e < 4,
    },
    e6FuaScaling: {
      id: 'e6FuaScaling',
      formItem: 'switch',
      text: t('e6FuaScaling.text'),
      content: t('e6FuaScaling.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    numinosity: content.numinosity,
    ultZone: content.ultZone,
    e1TrueDmg: content.e1TrueDmg,
    e4DefPen: content.e4DefPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_SCALING.buff(talentScaling, SOURCE_TALENT)

      const additionalScaling = (r.ultZone ? ultAdditionalDmgScaling : 0)
        * ((e >= 2 && r.e2AdditionalDmg) ? 1.20 * 2 : 1)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff(additionalScaling, SOURCE_ULT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff(additionalScaling, SOURCE_ULT)
      x.FUA_ADDITIONAL_DMG_SCALING.buff(additionalScaling, SOURCE_ULT)

      x.ELEMENTAL_DMG.buff(r.talentFuaStacks * 0.72, SOURCE_TRACE)

      x.FUA_BOOST.buff((e >= 6 && r.e6FuaScaling) ? 7.29 : 0, SOURCE_E6)

      x.HP.buff((r.ultZone) ? 0.09 * r.alliesMaxHp : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(30, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(60, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(15, SOURCE_TALENT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES_PEN.buffTeam((m.numinosity ? skillResPen : 0), SOURCE_SKILL)
      x.VULNERABILITY.buffTeam((m.ultZone ? ultVulnerability : 0), SOURCE_ULT)

      buffAbilityTrueDmg(x, allTypesExcept(DOT_DMG_TYPE), (e >= 1 && m.ultZone && m.e1TrueDmg ? 0.24 : 0), SOURCE_E1, Target.TEAM)

      x.DEF_PEN.buffTeam((e >= 4 && m.numinosity && m.e4DefPen) ? 0.18 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.HP], Source.NONE)
      x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.HP], Source.NONE)
      x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * x.a[Key.HP], Source.NONE)
      x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
      x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
      x.FUA_ADDITIONAL_DMG.buff(x.a[Key.FUA_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.HP;
x.ULT_DMG += x.ULT_SCALING * x.HP;
x.FUA_DMG += x.FUA_SCALING * x.HP;
x.BASIC_ADDITIONAL_DMG += x.BASIC_ADDITIONAL_DMG_SCALING * x.HP;
x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * x.HP;
x.FUA_ADDITIONAL_DMG += x.FUA_ADDITIONAL_DMG_SCALING * x.HP;
`
    },
  }
}
