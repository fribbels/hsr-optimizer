import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SilverWolfEntities = createEnum('SilverWolf')
export const SilverWolfAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

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
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SilverWolfEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SilverWolfEntities.SilverWolf]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SilverWolfAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E4: ULT additional damage scaling (0.20 per debuff)
      const ultAdditionalScaling = (e >= 4) ? r.targetDebuffs * 0.20 : 0

      return {
        [SilverWolfAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [SilverWolfAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [SilverWolfAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
            ...(ultAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(ultAdditionalScaling)
                  .build(),
              ]
              : []
            ),
          ],
        },
        [SilverWolfAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: Elemental DMG boost (0.20 per debuff)
      x.buff(StatKey.DMG_BOOST, (e >= 6) ? r.targetDebuffs * 0.20 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (m.skillWeaknessResShredDebuff) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.RES_PEN, (m.skillResShredDebuff) ? skillResShredValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.RES_PEN, (m.skillResShredDebuff && m.targetDebuffs >= 3) ? 0.03 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.DEF_PEN, (m.ultDefShredDebuff) ? ultDefShredValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.DEF_PEN, (m.talentDefShredDebuff) ? talentDefShredDebuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
