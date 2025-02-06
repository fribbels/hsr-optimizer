import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.SilverWolf')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1006')

  const skillResShredValue = skill(e, 0.10, 0.105)
  const talentDefShredDebuffValue = talent(e, 0.08, 0.088)
  const ultDefShredValue = ult(e, 0.45, 0.468)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.96, 2.156)
  const ultScaling = ult(e, 3.80, 4.104)

  const defaults = {
    skillWeaknessResShredDebuff: false,
    skillResShredDebuff: true,
    talentDefShredDebuff: true,
    ultDefShredDebuff: true,
    targetDebuffs: 5,
  }

  const teammateDefaults = {
    skillWeaknessResShredDebuff: false,
    skillResShredDebuff: true,
    talentDefShredDebuff: true,
    ultDefShredDebuff: true,
    targetDebuffs: 5,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillResShredDebuff: {
      id: 'skillResShredDebuff',
      formItem: 'switch',
      text: t('Content.skillResShredDebuff.text'),
      content: t('Content.skillResShredDebuff.content', { skillResShredValue: TsUtils.precisionRound(100 * skillResShredValue) }),
    },
    skillWeaknessResShredDebuff: {
      id: 'skillWeaknessResShredDebuff',
      formItem: 'switch',
      text: t('Content.skillWeaknessResShredDebuff.text'),
      content: t('Content.skillWeaknessResShredDebuff.content', { implantChance: TsUtils.precisionRound(skill(e, 85, 87)) }),
    },
    talentDefShredDebuff: {
      id: 'talentDefShredDebuff',
      formItem: 'switch',
      text: t('Content.talentDefShredDebuff.text'),
      content: t('Content.talentDefShredDebuff.content', { talentDefShredDebuffValue: TsUtils.precisionRound(100 * talentDefShredDebuffValue) }),
    },
    ultDefShredDebuff: {
      id: 'ultDefShredDebuff',
      formItem: 'switch',
      text: t('Content.ultDefShredDebuff.text'),
      content: t('Content.ultDefShredDebuff.content', { ultDefShredValue: TsUtils.precisionRound(100 * ultDefShredValue) }),
    },
    targetDebuffs: {
      id: 'targetDebuffs',
      formItem: 'slider',
      text: t('Content.targetDebuffs.text'),
      content: t('Content.targetDebuffs.content'),
      min: 0,
      max: 5,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillResShredDebuff: content.skillResShredDebuff,
    skillWeaknessResShredDebuff: content.skillWeaknessResShredDebuff,
    talentDefShredDebuff: content.talentDefShredDebuff,
    ultDefShredDebuff: content.ultDefShredDebuff,
    targetDebuffs: content.targetDebuffs,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((e >= 4) ? r.targetDebuffs * 0.20 : 0, SOURCE_E4)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 6) ? r.targetDebuffs * 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(30, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(60, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(90, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES_PEN.buffTeam((m.skillWeaknessResShredDebuff) ? 0.20 : 0, SOURCE_SKILL)
      x.RES_PEN.buffTeam((m.skillResShredDebuff) ? skillResShredValue : 0, SOURCE_SKILL)
      x.RES_PEN.buffTeam((m.skillResShredDebuff && m.targetDebuffs >= 3) ? 0.03 : 0, SOURCE_TRACE)
      x.DEF_PEN.buffTeam((m.ultDefShredDebuff) ? ultDefShredValue : 0, SOURCE_ULT)
      x.DEF_PEN.buffTeam((m.talentDefShredDebuff) ? talentDefShredDebuffValue : 0, SOURCE_TALENT)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * x.a[Key.ATK], SOURCE_ULT)

      return standardAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return `
x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * x.ATK;
        ` + gpuStandardAtkFinalizer()
    },
  }
}
