import {
  AbilityType,
  DamageType,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  DamageFunctionType,
  DefaultDamageFunction,
  DotDamageFunction,
} from 'lib/optimization/engine/damage/damageCalculator'
import { HYSILENS } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { Hit } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const HysilensAbilities = createEnum(
  'BASIC',
  'SKILL',
  'ULT',
  'DOT',
  'BREAK',
)

export const HysilensEntities = createEnum(
  'Hysilens',
)

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hysilens')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character(HYSILENS)

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 1.40, 1.54)
  const skillVulnScaling = skill(e, 0.20, 0.22)

  const ultScaling = ult(e, 2.00, 2.16)
  const ultDefPenScaling = ult(e, 0.25, 0.27)
  const ultDotScaling = ult(e, 0.80, 0.88)

  const talentDotScaling = talent(e, 0.25, 0.275)
  const talentDotAtkLimitScaling = talent(e, 0.25, 0.275)

  const maxUltDotInstances = e >= 6 ? 12 : 8

  const defaults = {
    skillVulnerability: true,
    ultZone: true,
    ultDotStacks: maxUltDotInstances,
    ehrToDmg: true,
    dotDetonation: false,
    cyreneSpecialEffect: true,
    e1Buffs: true,
    e4ResPen: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    skillVulnerability: true,
    ultZone: true,
    e1Buffs: true,
    e2TeammateEhr: 1.20,
    e4ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillVulnerability: {
      id: 'skillVulnerability',
      formItem: 'switch',
      text: t('Content.skillVulnerability.text'),
      content: t('Content.skillVulnerability.content', { SkillVuln: TsUtils.precisionRound(100 * skillVulnScaling) }),
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: t('Content.ultZone.text'),
      content: t('Content.ultZone.content', { ZoneDefShred: TsUtils.precisionRound(100 * ultDefPenScaling) }),
    },
    ultDotStacks: {
      id: 'ultDotStacks',
      formItem: 'slider',
      text: t('Content.ultDotStacks.text'),
      content: t('Content.ultDotStacks.content', {}),
      min: 0,
      max: maxUltDotInstances,
    },
    ehrToDmg: {
      id: 'ehrToDmg',
      formItem: 'switch',
      text: t('Content.ehrToDmg.text'),
      content: t('Content.ehrToDmg.content', {}),
    },
    dotDetonation: {
      id: 'dotDetonation',
      formItem: 'switch',
      text: t('Content.dotDetonation.text'),
      content: t('Content.dotDetonation.content', {}),
      disabled: true,
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('Content.cyreneSpecialEffect.text'),
      content: t('Content.cyreneSpecialEffect.content'),
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: t('Content.e1Buffs.text'),
      content: t('Content.e1Buffs.content', {}),
      disabled: e < 1,
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: t('Content.e4ResPen.text'),
      content: t('Content.e4ResPen.content', {}),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content', {}),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillVulnerability: content.skillVulnerability,
    ultZone: content.ultZone,
    e1Buffs: content.e1Buffs,
    e2TeammateEhr: {
      id: 'e2TeammateEhr',
      formItem: 'slider',
      text: t('TeammateContent.e2TeammateEhr.text'),
      content: t('TeammateContent.e2TeammateEhr.content'),
      disabled: e < 2,
      min: 0,
      max: 1.20,
      percent: true,
    },
    e4ResPen: content.e4ResPen,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(HysilensEntities),
    actionDeclaration: () => Object.values(HysilensAbilities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [HysilensEntities.Hysilens]: {
          primary: true,
          summon: false,
          memosprite: false,
        },
      }
    },
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      
      const talentDot = talentDotScaling
      const updatedUltDotScaling = (e >= 6 && r.e6Buffs) ? ultDotScaling + 0.20 : ultDotScaling
      const ultDot = r.ultDotStacks * updatedUltDotScaling

      let actualUltDot = 0
      let actualTalentDot = 0
      if (r.dotDetonation) {
        // Triggers ult proc
        actualUltDot += ultDot
        // Detonates at 1.5x
        actualTalentDot = talentDot * 1.5
        // E1 doubles the talent and also detonates at 1.5x
        actualTalentDot += (e >= 1 && r.e1Buffs) ? talentDot * 1.5 : 0
      } else {
        actualUltDot += ultDot
        actualTalentDot += talentDot
        actualTalentDot += (e >= 1 && r.e1Buffs) ? talentDot : 0
      }

      return {
        [HysilensAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [HysilensAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [HysilensAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [HysilensAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Fire)
              .atkScaling(actualTalentDot)
              .build(),
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Wind)
              .atkScaling(actualTalentDot)
              .build(),
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Lightning)
              .atkScaling(actualTalentDot)
              .build(),
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Physical)
              .atkScaling(actualTalentDot)
              .build(),
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Physical)
              .atkScaling(actualUltDot)
              .build(),
          ],
        },
        [HysilensAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers() {
      return [
        // {
        //   modify: (action: OptimizerAction, context: OptimizerContext) => {
        //     const hits = action.hits!
        //     const len = hits.length
        //     for (let i = 0; i < len; i++) {
        //       const hit = hits[i]
        //
        //       if (hit.directHit) {
        //         const trueDmgHit = {
        //           damageFunctionType: DamageFunctionType.Default,
        //           damageType: DamageType.DOT,
        //           damageElement: ElementTag.Physical,
        //           directHit: false,
        //         }
        //
        //         hits.push(trueDmgHit as Hit)
        //       }
        //
        //       if (hit.toughnessDmg) {
        //         const superBreakHit = {
        //           damageFunctionType: DamageFunctionType.Default,
        //           damageType: DamageType.SUPER_BREAK,
        //           damageElement: ElementTag.Physical,
        //           directHit: false,
        //           toughnessDmg: hit.toughnessDmg,
        //         }
        //
        //         hits.push(superBreakHit as Hit)
        //       }
        //     }
        //   },
        // },
      ]
    },
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Cyrene
      const cyreneDmgBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 1.32 : 1.20)
        : 0
      x.buff(StatKey.DMG_BOOST, (r.cyreneSpecialEffect) ? cyreneDmgBuff : 0, x.source(Source.odeTo(HYSILENS)))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(
        StatKey.DMG_BOOST,
        (e >= 2)
          ? Math.max(0, Math.min(0.90, 0.15 * Math.floor(TsUtils.precisionRound((t.e2TeammateEhr - 0.60) / 0.10))))
          : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_E2),
      )
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.FINAL_DMG_BOOST, (e >= 1 && m.e1Buffs) ? 0.16 : 0, x.targets(TargetTag.FullTeam).damageType(DamageTag.DOT).source(SOURCE_E1))
      x.buff(StatKey.VULNERABILITY, (m.skillVulnerability) ? skillVulnScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.DEF_PEN, (m.ultZone) ? ultDefPenScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.RES_PEN, (e >= 4 && m.e4ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // x.buff(
      //   ActionKey.ELEMENTAL_DMG,
      //   (r.ehrToDmg) ? Math.max(0, Math.min(0.90, 0.15 * Math.floor((x.a[ActionKey.EHR] - 0.60) / 0.10))) : 0,
      //   Source.NONE,
      //   EntityType.SELF,
      //   EntityType.SELF,
      // )

      const ehrValue = x.getActionValue(StatKey.EHR, HysilensEntities.Hysilens)
      const ehrBoost = (r.ehrToDmg) ? Math.max(0, Math.min(0.90, 0.15 * Math.floor((ehrValue - 0.60) / 0.10))) : 0

      x.buff(StatKey.DMG_BOOST, ehrBoost, x.source(SOURCE_TRACE))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.ehrToDmg)}) {
  let dmgBuff = min(0.90, 0.15 * floor((${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, action.config)} - 0.60) / 0.10));
  ${buff.action(AKey.DMG_BOOST, 'dmgBuff').wgsl(action)}
}
`
    },
  }
}
