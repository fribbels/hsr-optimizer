import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag, SELF_ENTITY_INDEX, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const RuanMeiEntities = createEnum('RuanMei')
export const RuanMeiAbilities = createEnum('BASIC', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.RuanMei')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1303')

  const fieldResPenValue = ult(e, 0.25, 0.27)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.32, 0.352)
  const talentSpdScaling = talent(e, 0.10, 0.104)

  const defaults = {
    skillOvertoneBuff: true,
    teamBEBuff: true,
    ultFieldActive: true,
    e2AtkBoost: false,
    e4BeBuff: false,
  }

  const teammateDefaults = {
    skillOvertoneBuff: true,
    teamSpdBuff: true,
    teamBEBuff: true,
    ultFieldActive: true,
    e2AtkBoost: false,
    teamDmgBuff: 0.36,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillOvertoneBuff: {
      id: 'skillOvertoneBuff',
      formItem: 'switch',
      text: t('Content.skillOvertoneBuff.text'),
      content: t('Content.skillOvertoneBuff.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    teamBEBuff: {
      id: 'teamBEBuff',
      formItem: 'switch',
      text: t('Content.teamBEBuff.text'),
      content: t('Content.teamBEBuff.content'),
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', { fieldResPenValue: TsUtils.precisionRound(100 * fieldResPenValue) }),
    },
    e2AtkBoost: {
      id: 'e2AtkBoost',
      formItem: 'switch',
      text: t('Content.e2AtkBoost.text'),
      content: t('Content.e2AtkBoost.content'),
      disabled: (e < 2),
    },
    e4BeBuff: {
      id: 'e4BeBuff',
      formItem: 'switch',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
      disabled: (e < 4),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillOvertoneBuff: content.skillOvertoneBuff,
    teamSpdBuff: {
      id: 'teamSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.teamSpdBuff.text'),
      content: t('TeammateContent.teamSpdBuff.content', { talentSpdScaling: TsUtils.precisionRound(100 * talentSpdScaling) }),
    },
    teamBEBuff: content.teamBEBuff,
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'slider',
      text: t('TeammateContent.teamDmgBuff.text'),
      content: t('TeammateContent.teamDmgBuff.content'),
      min: 0,
      max: 0.36,
      percent: true,
    },
    ultFieldActive: content.ultFieldActive,
    e2AtkBoost: content.e2AtkBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(RuanMeiEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [RuanMeiEntities.RuanMei]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(RuanMeiAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [RuanMeiAbilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Ice)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [RuanMeiAbilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E2: ATK +40%
      x.buff(StatKey.ATK_P, (e >= 2 && r.e2AtkBoost) ? 0.40 : 0, x.source(SOURCE_E2))

      // E4: BE +100%
      x.buff(StatKey.BE, (e >= 4 && r.e4BeBuff) ? 1.00 : 0, x.source(SOURCE_E4))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace: Team BE +20%
      x.buff(StatKey.BE, (m.teamBEBuff) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // Skill: Team DMG boost when overtone active
      x.buff(StatKey.DMG_BOOST, (m.skillOvertoneBuff) ? skillScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // Skill: Team Break Efficiency +50% when overtone active
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (m.skillOvertoneBuff) ? 0.50 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // Ult: Team RES PEN when field active
      x.buff(StatKey.RES_PEN, (m.ultFieldActive) ? fieldResPenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // E1: Team DEF PEN +20% when field active
      x.buff(StatKey.DEF_PEN, (e >= 1 && m.ultFieldActive) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Talent: Team SPD% buff
      x.buff(StatKey.SPD_P, (t.teamSpdBuff) ? talentSpdScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      // Trace: Team DMG boost (from BE scaling)
      x.buff(StatKey.DMG_BOOST, t.teamDmgBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // E2: Team ATK% buff
      x.buff(StatKey.ATK_P, (e >= 2 && t.e2AtkBoost) ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // Trace: DMG boost based on BE over 120%
      const be = x.getActionValue(StatKey.BE, RuanMeiEntities.RuanMei)
      const beOver = Math.floor(TsUtils.precisionRound((be * 100 - 120) / 10))
      const buffValue = Math.min(0.36, Math.max(0, beOver) * 0.06)
      x.buff(StatKey.DMG_BOOST, buffValue, x.source(SOURCE_TRACE))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return wgsl`
let beOver = (${containerActionVal(SELF_ENTITY_INDEX, StatKey.BE, action.config)} * 100.0 - 120.0) / 10.0;
let beDmgBuff = min(0.36, floor(max(0.0, beOver)) * 0.06);
${buff.action(AKey.DMG_BOOST, 'beDmgBuff').wgsl(action)}
      `
    },
  }
}
