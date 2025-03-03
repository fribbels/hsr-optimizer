import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Asta')
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
  } = Source.character('1009')

  const ultSpdBuffValue = ult(e, 50, 52.8)
  const talentStacksAtkBuff = talent(e, 0.14, 0.154)
  const talentStacksDefBuff = 0.06
  const skillExtraDmgHitsMax = (e >= 1) ? 5 : 4

  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0.50, 0.55)
  const dotScaling = basic(e, 0.50, 0.55)

  const defaults = {
    talentBuffStacks: 5,
    skillExtraDmgHits: skillExtraDmgHitsMax,
    ultSpdBuff: true,
    fireDmgBoost: true,
  }

  const teammateDefaults = {
    talentBuffStacks: 5,
    ultSpdBuff: true,
    fireDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillExtraDmgHits: {
      id: 'skillExtraDmgHits',
      formItem: 'slider',
      text: t('Content.skillExtraDmgHits.text'),
      content: t('Content.skillExtraDmgHits.content', { skillScaling: TsUtils.precisionRound(skillScaling * 100), skillExtraDmgHitsMax }),
      min: 0,
      max: skillExtraDmgHitsMax,
    },
    talentBuffStacks: {
      id: 'talentBuffStacks',
      formItem: 'slider',
      text: t('Content.talentBuffStacks.text'),
      content: t('Content.talentBuffStacks.content', { talentStacksAtkBuff: TsUtils.precisionRound(100 * talentStacksAtkBuff) }),
      min: 0,
      max: 5,
    },
    ultSpdBuff: {
      id: 'ultSpdBuff',
      formItem: 'switch',
      text: t('Content.ultSpdBuff.text'),
      content: t('Content.ultSpdBuff.content', { ultSpdBuffValue }),
    },
    fireDmgBoost: {
      id: 'fireDmgBoost',
      formItem: 'switch',
      text: t('Content.fireDmgBoost.text'),
      content: t('Content.fireDmgBoost.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentBuffStacks: content.talentBuffStacks,
    ultSpdBuff: content.ultSpdBuff,
    fireDmgBoost: content.fireDmgBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.DEF_P.buff((r.talentBuffStacks) * talentStacksDefBuff, SOURCE_TRACE)
      x.ERR.buff((e >= 4 && r.talentBuffStacks >= 2) ? 0.15 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling + r.skillExtraDmgHits * skillScaling, SOURCE_SKILL)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 + 5 * r.skillExtraDmgHits, SOURCE_SKILL)

      x.DOT_CHANCE.set(0.8, SOURCE_TRACE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD.buffTeam((m.ultSpdBuff) ? ultSpdBuffValue : 0, SOURCE_ULT)
      x.ATK_P.buffTeam((m.talentBuffStacks) * talentStacksAtkBuff, SOURCE_TALENT)

      x.FIRE_DMG_BOOST.buffTeam((m.fireDmgBoost) ? 0.18 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
