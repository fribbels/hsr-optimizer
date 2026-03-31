import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InTheNameOfTheWorld')
  const { SOURCE_LC } = Source.lightCone(InTheNameOfTheWorld.id)

  const sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesAtk = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesEhr = [0.18, 0.21, 0.24, 0.27, 0.3]

  const defaults = {
    enemyDebuffedDmgBoost: true,
    skillAtkBoost: true,
    skillEhrBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyDebuffedDmgBoost: {
      lc: true,
      id: 'enemyDebuffedDmgBoost',
      formItem: 'switch',
      text: t('Content.enemyDebuffedDmgBoost.text'),
      content: t('Content.enemyDebuffedDmgBoost.content', { DmgBuff: precisionRound(100 * sValuesDmg[s]) }),
    },
    skillAtkBoost: {
      lc: true,
      id: 'skillAtkBoost',
      formItem: 'switch',
      text: t('Content.skillAtkBoost.text'),
      content: t('Content.skillAtkBoost.content', {
        EhrBuff: precisionRound(100 * sValuesEhr[s]),
        AtkBuff: precisionRound(100 * sValuesAtk[s]),
      }),
    },
    skillEhrBoost: {
      lc: true,
      id: 'skillEhrBoost',
      formItem: 'switch',
      text: 'Skill EHR boost',
      content: t('Content.skillAtkBoost.content', {
        EhrBuff: precisionRound(100 * sValuesEhr[s]),
        AtkBuff: precisionRound(100 * sValuesAtk[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.enemyDebuffedDmgBoost) ? sValuesDmg[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.ATK_P, (r.skillAtkBoost) ? sValuesAtk[s] : 0, x.actionKind(AbilityKind.SKILL).source(SOURCE_LC))
      x.buff(StatKey.EHR, (r.skillEhrBoost) ? sValuesEhr[s] : 0, x.actionKind(AbilityKind.SKILL).source(SOURCE_LC))
    },
  }
}

export const InTheNameOfTheWorld: LightConeConfig = {
  id: '23004',
  conditionals,
}
