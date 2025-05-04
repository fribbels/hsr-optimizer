import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { OptimizerContext } from 'types/optimizer'

export function injectActionDamage(context: OptimizerContext) {
  let actionDamageWgsl = ''

  for (const ability of context.activeAbilities) {
    if (ability == AbilityType.BASIC) {
      actionDamageWgsl += `

  /* START BASIC CALC */
  if (abilityType == 1 || actionIndex == 0) {
    let initialDmg = calculateInitial(
      p_x,
      x.BASIC_DMG,
      x.BASIC_HP_SCALING,
      x.BASIC_DEF_SCALING,
      x.BASIC_ATK_SCALING,
      x.BASIC_ATK_P_BOOST
    );
    (*p_x).BASIC_DMG = calculateAbilityDmg(
      p_x,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      initialDmg,
      x.BASIC_DMG_BOOST,
      x.BASIC_VULNERABILITY,
      x.BASIC_DEF_PEN,
      x.BASIC_RES_PEN,
      x.BASIC_CR_BOOST,
      x.BASIC_CD_BOOST,
      x.BASIC_FINAL_DMG_BOOST,
      x.BASIC_BREAK_EFFICIENCY_BOOST,
      x.BASIC_SUPER_BREAK_MODIFIER,
      x.BASIC_BREAK_DMG_MODIFIER,
      x.BASIC_TOUGHNESS_DMG,
      x.BASIC_ADDITIONAL_DMG,
      0, // x.BASIC_ADDITIONAL_DMG_CR_OVERRIDE,
      0, // x.BASIC_ADDITIONAL_DMG_CD_OVERRIDE,
      x.BASIC_TRUE_DMG_MODIFIER,
      m.BASIC_DMG,
    );
  }
  /* END BASIC CALC */
      `
    }

    if (ability == AbilityType.SKILL) {
      actionDamageWgsl += `
  /* START SKILL CALC */
  if (abilityType == 2 || actionIndex == 0) {
    let initialDmg = calculateInitial(
      p_x,
      x.SKILL_DMG,
      x.SKILL_HP_SCALING,
      x.SKILL_DEF_SCALING,
      x.SKILL_ATK_SCALING,
      x.SKILL_ATK_P_BOOST
    );
    (*p_x).SKILL_DMG = calculateAbilityDmg(
      p_x,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      initialDmg,
      x.SKILL_DMG_BOOST,
      x.SKILL_VULNERABILITY,
      x.SKILL_DEF_PEN,
      x.SKILL_RES_PEN,
      x.SKILL_CR_BOOST,
      x.SKILL_CD_BOOST,
      x.SKILL_FINAL_DMG_BOOST,
      0, // x.SKILL_BREAK_EFFICIENCY_BOOST,
      0, // x.SKILL_SUPER_BREAK_MODIFIER,
      0, // x.SKILL_BREAK_DMG_MODIFIER,
      x.SKILL_TOUGHNESS_DMG,
      x.SKILL_ADDITIONAL_DMG,
      0, // x.SKILL_ADDITIONAL_DMG_CR_OVERRIDE,
      0, // x.SKILL_ADDITIONAL_DMG_CD_OVERRIDE,
      x.SKILL_TRUE_DMG_MODIFIER,
      m.SKILL_DMG,
    );
  }
  /* END SKILL CALC */
      `
    }

    if (ability == AbilityType.ULT) {
      actionDamageWgsl += `
  /* START ULT CALC */
  if (abilityType == 4 || actionIndex == 0) {
    let initialDmg = calculateInitial(
      p_x,
      x.ULT_DMG,
      x.ULT_HP_SCALING,
      x.ULT_DEF_SCALING,
      x.ULT_ATK_SCALING,
      x.ULT_ATK_P_BOOST
    );
    (*p_x).ULT_DMG = calculateAbilityDmg(
      p_x,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      initialDmg,
      x.ULT_DMG_BOOST,
      x.ULT_VULNERABILITY,
      x.ULT_DEF_PEN,
      x.ULT_RES_PEN,
      x.ULT_CR_BOOST,
      x.ULT_CD_BOOST,
      x.ULT_FINAL_DMG_BOOST,
      x.ULT_BREAK_EFFICIENCY_BOOST,
      0, // x.ULT_SUPER_BREAK_MODIFIER,
      0, // x.ULT_BREAK_DMG_MODIFIER,
      x.ULT_TOUGHNESS_DMG,
      x.ULT_ADDITIONAL_DMG,
      x.ULT_ADDITIONAL_DMG_CR_OVERRIDE,
      x.ULT_ADDITIONAL_DMG_CD_OVERRIDE,
      x.ULT_TRUE_DMG_MODIFIER,
      m.ULT_DMG,
    );
  }
  /* END ULT CALC */
      `
    }

    if (ability == AbilityType.FUA) {
      actionDamageWgsl += `
  /* START FUA CALC */
  if (abilityType == 8 || actionIndex == 0) {
    let initialDmg = calculateInitial(
      p_x,
      x.FUA_DMG,
      x.FUA_HP_SCALING,
      x.FUA_DEF_SCALING,
      x.FUA_ATK_SCALING,
      x.FUA_ATK_P_BOOST
    );
    (*p_x).FUA_DMG = calculateAbilityDmg(
      p_x,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      initialDmg,
      x.FUA_DMG_BOOST,
      x.FUA_VULNERABILITY,
      x.FUA_DEF_PEN,
      x.FUA_RES_PEN,
      x.FUA_CR_BOOST,
      x.FUA_CD_BOOST,
      0, // x.FUA_FINAL_DMG_BOOST,
      0, // x.FUA_BREAK_EFFICIENCY_BOOST,
      0, // x.FUA_SUPER_BREAK_MODIFIER,
      0, // x.FUA_BREAK_DMG_MODIFIER,
      x.FUA_TOUGHNESS_DMG,
      x.FUA_ADDITIONAL_DMG,
      0, // x.FUA_ADDITIONAL_DMG_CR_OVERRIDE,
      0, // x.FUA_ADDITIONAL_DMG_CD_OVERRIDE,
      x.FUA_TRUE_DMG_MODIFIER,
      0, // m.FUA_DMG,
    );
  }
  /* END FUA CALC */
      `
    }

    if (ability == AbilityType.DOT) {
      actionDamageWgsl += `
  /* START DOT CALC */
  if (abilityType == 16 || actionIndex == 0) {
    // Duplicated in computeShader.wgsl

    let dotDmgBoostMulti = baseDmgBoost + x.DOT_DMG_BOOST;
    let dotDefMulti = calculateDefMulti(baseDefPen + x.DOT_DEF_PEN);
    let dotVulnerabilityMulti = 1 + x.VULNERABILITY + x.DOT_VULNERABILITY;
    let dotResMulti = 1 - (baseResistance - x.DOT_RES_PEN);
    let dotEhrMulti = calculateEhrMulti(p_x);
    let dotTrueDmgMulti = 1 + x.TRUE_DMG_MODIFIER + x.DOT_TRUE_DMG_MODIFIER;
    let initialDmg = calculateInitial(
      p_x,
      x.DOT_DMG,
      x.DOT_HP_SCALING,
      x.DOT_DEF_SCALING,
      x.DOT_ATK_SCALING,
      x.DOT_ATK_P_BOOST
    );

    if (initialDmg > 0) {
      (*p_x).DOT_DMG = initialDmg
        * (baseUniversalMulti)
        * (dotDmgBoostMulti)
        * (dotDefMulti)
        * (dotVulnerabilityMulti)
        * (dotResMulti)
        * (dotEhrMulti)
        * (dotTrueDmgMulti);
    }
  }
  /* END DOT CALC */
      `
    }

    if (ability == AbilityType.MEMO_SKILL) {
      actionDamageWgsl += `
  /* START MEMO_SKILL CALC */
  if (abilityType == MEMO_SKILL_ABILITY_TYPE || actionIndex == 0) {
    let initialDmg = calculateInitial(
      p_x,
      x.MEMO_SKILL_DMG,
      x.MEMO_SKILL_HP_SCALING,
      x.MEMO_SKILL_DEF_SCALING,
      x.MEMO_SKILL_ATK_SCALING,
      x.MEMO_SKILL_ATK_P_BOOST
    );
    (*p_x).MEMO_SKILL_DMG = calculateAbilityDmg(
      p_x,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      initialDmg,
      x.MEMO_SKILL_DMG_BOOST,
      0, // x.MEMO_SKILL_VULNERABILITY,
      0, // x.MEMO_SKILL_DEF_PEN,
      0, // x.MEMO_SKILL_RES_PEN,
      0, // x.MEMO_SKILL_CR_BOOST,
      0, // x.MEMO_SKILL_CD_BOOST,
      0, // x.MEMO_SKILL_FINAL_DMG_BOOST,
      0, // x.MEMO_SKILL_BREAK_EFFICIENCY_BOOST,
      0, // x.MEMO_SKILL_SUPER_BREAK_MODIFIER,
      0, // x.MEMO_SKILL_BREAK_DMG_MODIFIER,
      x.MEMO_SKILL_TOUGHNESS_DMG,
      0, // x.MEMO_SKILL_ADDITIONAL_DMG,
      0, // x.MEMO_SKILL_ADDITIONAL_DMG_CR_OVERRIDE,
      0, // x.MEMO_SKILL_ADDITIONAL_DMG_CD_OVERRIDE,
      x.MEMO_SKILL_TRUE_DMG_MODIFIER,
      0, // m.MEMO_DMG,
    );

    (*p_x).MEMO_SKILL_DMG += (*p_m).MEMO_SKILL_DMG;
  }
  /* END MEMO_SKILL CALC */
      `
    }

    if (ability == AbilityType.MEMO_TALENT) {
      actionDamageWgsl += `
  /* START MEMO_TALENT CALC */
  if (abilityType == MEMO_TALENT_ABILITY_TYPE || actionIndex == 0) {
    let initialDmg = calculateInitial(
      p_x,
      x.MEMO_TALENT_DMG,
      x.MEMO_TALENT_HP_SCALING,
      x.MEMO_TALENT_DEF_SCALING,
      x.MEMO_TALENT_ATK_SCALING,
      x.MEMO_TALENT_ATK_P_BOOST
    );
    (*p_x).MEMO_TALENT_DMG = calculateAbilityDmg(
      p_x,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      initialDmg,
      x.MEMO_TALENT_DMG_BOOST,
      0, // x.MEMO_TALENT_VULNERABILITY,
      0, // x.MEMO_TALENT_DEF_PEN,
      0, // x.MEMO_TALENT_RES_PEN,
      0, // x.MEMO_TALENT_CR_BOOST,
      0, // x.MEMO_TALENT_CD_BOOST,
      0, // x.MEMO_TALENT_FINAL_DMG_BOOST,
      0, // x.MEMO_TALENT_BREAK_EFFICIENCY_BOOST,
      0, // x.MEMO_TALENT_SUPER_BREAK_MODIFIER,
      0, // x.MEMO_TALENT_BREAK_DMG_MODIFIER,
      x.MEMO_TALENT_TOUGHNESS_DMG,
      0, // x.MEMO_TALENT_ADDITIONAL_DMG,
      0, // x.MEMO_TALENT_ADDITIONAL_DMG_CR_OVERRIDE,
      0, // x.MEMO_TALENT_ADDITIONAL_DMG_CD_OVERRIDE,
      x.MEMO_TALENT_TRUE_DMG_MODIFIER,
      0, // m.MEMO_DMG,
    );

    (*p_x).MEMO_TALENT_DMG += (*p_m).MEMO_TALENT_DMG;
  }
  /* END MEMO_TALENT CALC */
      `
    }
  }

  return actionDamageWgsl
}
