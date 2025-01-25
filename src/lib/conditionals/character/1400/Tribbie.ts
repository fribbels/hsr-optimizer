import i18next from 'i18next'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.x')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

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
    e2DefPen: true,
    e4AdditionalDmg: true,
    e6FuaScaling: true,
  }

  const teammateDefaults = {
    numinosity: true,
    ultZone: true,
    e1TrueDmg: true,
    e2DefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    numinosity: {
      id: 'numinosity',
      formItem: 'switch',
      text: 'Numinosity',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: 'Ult Zone active',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    alliesMaxHp: {
      id: 'alliesMaxHp',
      formItem: 'slider',
      text: 'Allies max HP',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 50000,
    },
    talentFuaStacks: {
      id: 'talentFuaStacks',
      formItem: 'slider',
      text: 'FUA stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3,
    },
    e1TrueDmg: {
      id: 'e1TrueDmg',
      formItem: 'switch',
      text: 'E1 True DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e2DefPen: {
      id: 'e2DefPen',
      formItem: 'switch',
      text: 'E2 DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    e4AdditionalDmg: {
      id: 'e4AdditionalDmg',
      formItem: 'switch',
      text: 'E4 Additional DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6FuaScaling: {
      id: 'e6FuaScaling',
      formItem: 'switch',
      text: 'E6 FUA DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    numinosity: content.numinosity,
    ultZone: content.ultZone,
    e1TrueDmg: content.e1TrueDmg,
    e2DefPen: content.e2DefPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.FUA_SCALING.buff(talentScaling, Source.NONE)

      const additionalScaling = (r.ultZone ? ultAdditionalDmgScaling : 0)
        * ((e >= 4 && r.e4AdditionalDmg) ? 1.20 * 2 : 1)
      x.BASIC_ADDITIONAL_DMG_SCALING.buff(additionalScaling, Source.NONE)
      x.ULT_ADDITIONAL_DMG_SCALING.buff(additionalScaling, Source.NONE)
      x.FUA_ADDITIONAL_DMG_SCALING.buff(additionalScaling, Source.NONE)

      x.ELEMENTAL_DMG.buff(r.talentFuaStacks * 0.72, Source.NONE)

      x.FUA_BOOST.buff((e >= 6 && r.e6FuaScaling) ? 7.29 : 0, Source.NONE)

      x.HP.buff((r.ultZone) ? 0.09 * r.alliesMaxHp : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(15, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES_PEN.buffTeam((m.numinosity ? skillResPen : 0), Source.NONE)
      x.VULNERABILITY.buffTeam((m.ultZone ? ultVulnerability : 0), Source.NONE)

      x.TRUE_DMG_MODIFIER.buffTeam((e >= 1 && m.ultZone && m.e1TrueDmg ? 0.24 : 0), Source.NONE)

      x.DEF_PEN.buffTeam((e >= 2 && m.numinosity && m.e2DefPen) ? 0.18 : 0, Source.NONE)
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
