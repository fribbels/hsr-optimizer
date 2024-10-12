import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.SilverWolf')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const skillResShredValue = skill(e, 0.10, 0.105)
  const talentDefShredDebuffValue = talent(e, 0.08, 0.088)
  const ultDefShredValue = ult(e, 0.45, 0.468)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.96, 2.156)
  const ultScaling = ult(e, 3.80, 4.104)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'skillResShredDebuff',
    name: 'skillResShredDebuff',
    text: t('Content.skillResShredDebuff.text'),
    title: t('Content.skillResShredDebuff.title'),
    content: t('Content.skillResShredDebuff.content', { skillResShredValue: TsUtils.precisionRound(100 * skillResShredValue) }),
  }, {
    formItem: 'switch',
    id: 'skillWeaknessResShredDebuff',
    name: 'skillWeaknessResShredDebuff',
    text: t('Content.skillWeaknessResShredDebuff.text'),
    title: t('Content.skillWeaknessResShredDebuff.title'),
    content: t('Content.skillWeaknessResShredDebuff.content'),
  }, {
    // TODO: should be talent
    formItem: 'switch',
    id: 'talentDefShredDebuff',
    name: 'talentDefShredDebuff',
    text: t('Content.talentDefShredDebuff.text'),
    title: t('Content.talentDefShredDebuff.title'),
    content: t('Content.talentDefShredDebuff.content', { talentDefShredDebuffValue: TsUtils.precisionRound(100 * talentDefShredDebuffValue) }),
  }, {
    formItem: 'switch',
    id: 'ultDefShredDebuff',
    name: 'ultDefShredDebuff',
    text: t('Content.ultDefShredDebuff.text'),
    title: t('Content.ultDefShredDebuff.title'),
    content: t('Content.ultDefShredDebuff.content', { ultDefShredValue: TsUtils.precisionRound(100 * ultDefShredValue) }),
  }, {
    formItem: 'slider',
    id: 'targetDebuffs',
    name: 'targetDebuffs',
    text: t('Content.targetDebuffs.text'),
    title: t('Content.targetDebuffs.title'),
    content: t('Content.targetDebuffs.content'),
    min: 0,
    max: 5,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillResShredDebuff'),
    findContentId(content, 'skillWeaknessResShredDebuff'),
    findContentId(content, 'talentDefShredDebuff'),
    findContentId(content, 'ultDefShredDebuff'),
    findContentId(content, 'targetDebuffs'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      skillWeaknessResShredDebuff: false,
      skillResShredDebuff: true,
      talentDefShredDebuff: true,
      ultDefShredDebuff: true,
      targetDebuffs: 5,
    }),
    teammateDefaults: () => ({
      skillWeaknessResShredDebuff: false,
      skillResShredDebuff: true,
      talentDefShredDebuff: true,
      ultDefShredDebuff: true,
      targetDebuffs: 5,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 4) ? r.targetDebuffs * 0.20 : 0

      // Boost
      x.ELEMENTAL_DMG += (e >= 6) ? r.targetDebuffs * 0.20 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x.RES_PEN += (m.skillWeaknessResShredDebuff) ? 0.20 : 0
      x.RES_PEN += (m.skillResShredDebuff) ? skillResShredValue : 0
      x.RES_PEN += (m.skillResShredDebuff && m.targetDebuffs >= 3) ? 0.03 : 0
      x.DEF_PEN += (m.ultDefShredDebuff) ? ultDefShredValue : 0
      x.DEF_PEN += (m.talentDefShredDebuff) ? talentDefShredDebuffValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
