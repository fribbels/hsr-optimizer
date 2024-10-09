import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

const SilverWolf = (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const skillResShredValue = skill(e, 0.10, 0.105)
  const talentDefShredDebuffValue = talent(e, 0.08, 0.088)
  const ultDefShredValue = ult(e, 0.45, 0.468)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.96, 2.156)
  const ultScaling = ult(e, 3.80, 4.104)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.SilverWolf.Content')
    return [{
      formItem: 'switch',
      id: 'skillResShredDebuff',
      name: 'skillResShredDebuff',
      text: t('skillResShredDebuff.text'),
      title: t('skillResShredDebuff.title'),
      content: t('skillResShredDebuff.content', { skillResShredValue: TsUtils.precisionRound(100 * skillResShredValue) }),
    }, {
      formItem: 'switch',
      id: 'skillWeaknessResShredDebuff',
      name: 'skillWeaknessResShredDebuff',
      text: t('skillWeaknessResShredDebuff.text'),
      title: t('skillWeaknessResShredDebuff.title'),
      content: t('skillWeaknessResShredDebuff.content'),
    }, {
    // TODO: should be talent
      formItem: 'switch',
      id: 'talentDefShredDebuff',
      name: 'talentDefShredDebuff',
      text: t('talentDefShredDebuff.text'),
      title: t('talentDefShredDebuff.title'),
      content: t('talentDefShredDebuff.content', { talentDefShredDebuffValue: TsUtils.precisionRound(100 * talentDefShredDebuffValue) }),
    }, {
      formItem: 'switch',
      id: 'ultDefShredDebuff',
      name: 'ultDefShredDebuff',
      text: t('ultDefShredDebuff.text'),
      title: t('ultDefShredDebuff.title'),
      content: t('ultDefShredDebuff.content', { ultDefShredValue: TsUtils.precisionRound(100 * ultDefShredValue) }),
    }, {
      formItem: 'slider',
      id: 'targetDebuffs',
      name: 'targetDebuffs',
      text: t('targetDebuffs.text'),
      title: t('targetDebuffs.title'),
      content: t('targetDebuffs.content'),
      min: 0,
      max: 5,
    }]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'skillResShredDebuff'),
      findContentId(content, 'skillWeaknessResShredDebuff'),
      findContentId(content, 'talentDefShredDebuff'),
      findContentId(content, 'ultDefShredDebuff'),
      findContentId(content, 'targetDebuffs'),
    ]
  })()

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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

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

export default SilverWolf
