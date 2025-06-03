import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerHarmony')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('8006')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultBeScaling = ult(e, 0.30, 0.33)
  const skillMaxHits = e >= 6 ? 6 : 4

  const targetsToSuperBreakMulti: Record<number, number> = {
    1: 1.60,
    3: 1.40,
    5: 1.20,
  }

  const defaults = {
    skillHitsOnTarget: skillMaxHits,
    backupDancer: true,
    superBreakDmg: true,
    e2EnergyRegenBuff: false,
  }

  const teammateDefaults = {
    backupDancer: true,
    superBreakDmg: true,
    teammateBeValue: 2.00,
  }

  const content: ContentDefinition<typeof defaults> = {
    backupDancer: {
      id: 'backupDancer',
      formItem: 'switch',
      text: t('Content.backupDancer.text'),
      content: t('Content.backupDancer.content', { ultBeScaling: TsUtils.precisionRound(100 * ultBeScaling) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    skillHitsOnTarget: {
      id: 'skillHitsOnTarget',
      formItem: 'slider',
      text: t('Content.skillHitsOnTarget.text'),
      content: t('Content.skillHitsOnTarget.content'),
      min: 0,
      max: skillMaxHits,
    },
    e2EnergyRegenBuff: {
      id: 'e2EnergyRegenBuff',
      formItem: 'switch',
      text: t('Content.e2EnergyRegenBuff.text'),
      content: t('Content.e2EnergyRegenBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    backupDancer: content.backupDancer,
    superBreakDmg: content.superBreakDmg,
    teammateBeValue: {
      id: 'teammateBeValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateBeValue.text'),
      content: t('TeammateContent.teammateBeValue.content'),
      min: 0,
      max: 4.00,
      percent: true,
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      }
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ERR.buff((e >= 2 && r.e2EnergyRegenBuff) ? 0.25 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff(r.skillHitsOnTarget * skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 * r.skillHitsOnTarget, SOURCE_SKILL)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffTeam((m.backupDancer) ? ultBeScaling : 0, SOURCE_ULT)
      x.SUPER_BREAK_MODIFIER.buffTeam(
        (m.backupDancer && m.superBreakDmg)
          ? targetsToSuperBreakMulti[context.enemyCount]
          : 0,
        SOURCE_ULT,
      )
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const beBuff = (e >= 4) ? 0.15 * t.teammateBeValue : 0
      x.BE.buffTeam(beBuff, SOURCE_E4)
      x.UNCONVERTIBLE_BE_BUFF.buffTeam(beBuff, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
  }
}
