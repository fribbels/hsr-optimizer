import { Stats } from 'lib/constants'
import { Eidolon } from 'types/Character'
import { Form } from 'types/Form'

import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { RuanMeiConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.RuanMei')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const fieldResPenValue = ult(e, 0.25, 0.27)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.32, 0.352)
  const talentSpdScaling = talent(e, 0.10, 0.104)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'skillOvertoneBuff',
      name: 'skillOvertoneBuff',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    {
      formItem: 'switch',
      id: 'teamBEBuff',
      name: 'teamBEBuff',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content'),
    },
    {
      formItem: 'switch',
      id: 'ultFieldActive',
      name: 'ultFieldActive',
      text: t('Content.2.text'),
      title: t('Content.2.title'),
      content: t('Content.2.content', { fieldResPenValue: TsUtils.precisionRound(100 * fieldResPenValue) }),
    },
    {
      formItem: 'switch',
      id: 'e2AtkBoost',
      name: 'e2AtkBoost',
      text: t('Content.3.text'),
      title: t('Content.3.title'),
      content: t('Content.3.content'),
      disabled: (e < 2),
    },
    {
      formItem: 'switch',
      id: 'e4BeBuff',
      name: 'e4BeBuff',
      text: t('Content.4.text'),
      title: t('Content.4.title'),
      content: t('Content.4.content'),
      disabled: (e < 4),
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillOvertoneBuff'),
    {
      formItem: 'switch',
      id: 'teamSpdBuff',
      name: 'teamSpdBuff',
      text: t('TeammateContent.0.text'),
      title: t('TeammateContent.0.title'),
      content: t('TeammateContent.0.content', { talentSpdScaling: TsUtils.precisionRound(100 * talentSpdScaling) }),
    },
    findContentId(content, 'teamBEBuff'),
    {
      formItem: 'slider',
      id: 'teamDmgBuff',
      name: 'teamDmgBuff',
      text: t('TeammateContent.1.text'),
      title: t('TeammateContent.1.title'),
      content: t('TeammateContent.1.content'),
      min: 0,
      max: 0.36,
      percent: true,
    },
    findContentId(content, 'ultFieldActive'),
    findContentId(content, 'e2AtkBoost'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      skillOvertoneBuff: true,
      teamBEBuff: true,
      ultFieldActive: true,
      e2AtkBoost: false,
      e4BeBuff: false,
    }),
    teammateDefaults: () => ({
      skillOvertoneBuff: true,
      teamSpdBuff: true,
      teamBEBuff: true,
      ultFieldActive: true,
      e2AtkBoost: false,
      teamDmgBuff: 0.36,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.ATK_P] += (e >= 2 && r.e2AtkBoost) ? 0.40 : 0
      x[Stats.BE] += (e >= 4 && r.e4BeBuff) ? 1.00 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.BE] += (m.teamBEBuff) ? 0.20 : 0

      x.ELEMENTAL_DMG += (m.skillOvertoneBuff) ? skillScaling : 0
      x.BREAK_EFFICIENCY_BOOST += (m.skillOvertoneBuff) ? 0.50 : 0

      x.RES_PEN += (m.ultFieldActive) ? fieldResPenValue : 0
      x.DEF_PEN += (e >= 1 && m.ultFieldActive) ? 0.20 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.SPD_P] += (t.teamSpdBuff) ? talentSpdScaling : 0
      x.ELEMENTAL_DMG += t.teamDmgBuff

      x[Stats.ATK_P] += (e >= 2 && t.e2AtkBoost) ? 0.40 : 0
      x.RATIO_BASED_ATK_P_BUFF += (e >= 2 && t.e2AtkBoost) ? 0.40 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [RuanMeiConversionConditional],
  }
}
