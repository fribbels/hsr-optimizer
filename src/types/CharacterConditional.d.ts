import { ComputedStatsObject } from "lib/character/conditionals/constants";
import { RelicSet } from "./RelicSet";

// TODO: reset type to Form from feature/typescript-v2
export type Form = {
  [key: string]: unknown
};
export type WeirdForm = Form & {
  characterConditionals: ComputedStatsObject;
};

export interface CharacterConditional {
  display: () => JSX.Element;
  defaults: () => ConditionalMap
  // TOOD: lightConeConditional.precomputeEffect mutates by ref, purify
  precomputeEffects: (request: Form) => ComputedStatsObject;

  // TODO: purify this implmeentation
  // ComputedStatsObject arg is mutated by ref
  calculateBaseMultis: (c: ComputedStatsObject, request: Form) => void;
}

export type StatsCollection = {
  x?: ComputedStatsObject;
  augmentedStats: { [key: string]: number };
  headRelics: { [key: string]: number };
  sets: { [key: string]: RelicSet };
};

export type ConditionalBuff =
  | 'arcanaStacks'
  | 'basicEnhanced'
  | 'basicEnhancedExtraHits'
  | 'basicEnhancedSpdBuff'
  | 'basicEnhancements'
  | 'battleStartDefBuff'
  | 'benedictionBuff'
  | 'buffedState'
  | 'burdenAtkBuff'
  | 'cipherBuff'
  | 'critSpdBuff'
  | 'defDecreaseDebuff'
  | 'e1CdBuff'
  | 'e1DebtorStacks'
  | 'e1DotDmgReceivedDebuff'
  | 'e1EnhancedState'
  | 'e1ResReduction'
  | 'e1TalentSpdBuff'
  | 'e1TargetBleeding'
  | 'e1TargetFrozen'
  | 'e2BurnMultiBoost'
  | 'e2DefReduction'
  | 'e2DmgBuff'
  | 'e2DmgReductionBuff'
  | 'e2SkillDmgBuff'
  | 'e2SkillSpdBuff'
  | 'e2TalentCritStacks'
  | 'e2UltAtkBuff'
  | 'e2UltHealingBuff'
  | 'e4BeBuff'
  | 'e4CurrentHp80'
  | 'e4DmgReductionBuff'
  | 'e4MaxHpIncreaseStacks'
  | 'e4SkillHealingDmgBuffStacks'
  | 'e4SkillResShred'
  | 'e4TalentAtkBuff'
  | 'e4TalentStacks'
  | 'e6DefStacks'
  | 'e6DmgBuff'
  | 'e6FuaVulnerabilityStacks'
  | 'e6ResPenStacks'
  | 'e6ResReduction'
  | 'e6TeamHpLostPercent'
  | 'e6UltAtkBuff'
  | 'e6UltDmgBoost'
  | 'e6UltExtraHits'
  | 'e6UltTargetDebuff'
  | 'enemyBurned'
  | 'enemyDebuffed'
  | 'enemyDebuffStacks'
  | 'enemyDefeatedBuff'
  | 'enemyDmgTakenDebuff'
  | 'enemyFrozen'
  | 'enemyProofOfDebtDebuff'
  | 'enemySlowed'
  | 'enemyToughness50'
  | 'enhancedBasic'
  | 'enhancedSkill'
  | 'enhancedStateActive'
  | 'enhancedUlt'
  | 'epiphanyDebuff'
  | 'fieldActive'
  | 'fuaHits'
  | 'healingMaxHpBuff'
  | 'hpPercentLostTotal'
  | 'initialSpeedBuff'
  | 'numbyEnhancedState'
  | 'quantumAllies'
  | 'roaringBowstringsActive'
  | 'selfCurrentHp80Percent'
  | 'selfCurrentHpPercent'
  | 'shieldActive'
  | 'skillActive'
  | 'skillBuff'
  | 'skillCdBuff'
  | 'skillCritBuff'
  | 'skillDefShredDebuff'
  | 'skillDmgIncreaseStacks'
  | 'skillExtraDmgHits'
  | 'skillExtraHits'
  | 'skillOutroarStacks'
  | 'skillRemovedBuff'
  | 'skillResShredDebuff'
  | 'skillSpdBuff'
  | 'skillTriggerStacks'
  | 'soulsteelBuffActive'
  | 'speedBoostStacks'
  | 'summationStacks'
  | 'talentAttacks'
  | 'talentBuffStacks'
  | 'talentDebuffStacks'
  | 'talentDmgReductionBuff'
  | 'talentEnemyMarked'
  | 'talentEnhancedState'
  | 'talentHitsPerAction'
  | 'talentHpDrainAtkBuff'
  | 'talentPenBuff'
  | 'talentRighteousHeartStacks'
  | 'talentSpdBuffStacks'
  | 'talentStacks'
  | 'targetBurdenActive'
  | 'targetBurned'
  | 'targetDebuffs'
  | 'targetDotTakenDebuff'
  | 'targetFrozen'
  | 'targetShocked'
  | 'targetUltDebuffed'
  | 'targetWindShear'
  | 'techniqueBuff'
  | 'toughnessReductionDmgBoost'
  | 'ultBuff'
  | 'ultBuffActive'
  | 'ultBuffedState'
  | 'ultDefPenDebuff'
  | 'ultDefShredDebuff'
  | 'ultDmgBuff'
  | 'ultEnhanced'
  | 'ultEnhancedExtraHits'
  | 'ultFieldActive'
  | 'ultHitsOnTarget'
  | 'ultSpdBuff';

export type ConditionalMap = {
  [key in ConditionalBuff]?: number | boolean;
};

  