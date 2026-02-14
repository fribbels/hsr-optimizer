import { evaluateDependencyOrder } from 'lib/conditionals/evaluation/dependencyEvaluator'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Constants } from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  getActionIndex,
  wgslDebugActionRegister,
} from 'lib/gpu/injection/injectUtils'
import {
  indent,
  wgsl,
  wgslFalse,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { GpuConstants } from 'lib/gpu/webgpuTypes'
import {
  AKey,
  AKeyValue,
  HKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  OutputTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import {
  buff,
  matchesTargetTag,
} from 'lib/optimization/engine/container/gpuBuffBuilder'
import { getDamageFunction } from 'lib/optimization/engine/damage/damageCalculator'
import { SortOption, SortOptionKey } from 'lib/optimization/sortOptions'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import {
  CharacterConditionalsController,
  LightConeConditionalsController,
} from 'types/conditionals'
import { Form } from 'types/form'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function injectUnrolledActions(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  let unrolledActionCallsWgsl = '\n    var comboDmg: f32 = 0;\n'
  let unrolledActionFunctionsWgsl = ''

  // Execute default actions (don't add to comboDmg)
  for (let i = 0; i < context.defaultActions.length; i++) {
    const action = context.defaultActions[i]

    const { actionCall, actionFunction } = unrollAction(i, action, context, gpuParams, false)

    unrolledActionCallsWgsl += actionCall
    unrolledActionFunctionsWgsl += actionFunction

    // Combat stat filters execute after the first default action (includes EHP calculation)
    if (i === 0) {
      unrolledActionCallsWgsl += generateCombatStatFilters(request, context, gpuParams)
    }

    // DEBUG: Copy entire container0 (after combat stat filters for EHP), then copy registers from other actions
    if (gpuParams.DEBUG) {
      if (i === 0) {
        // Copy entire container0 to get all action stats and hit stats (after EHP calculation)
        unrolledActionCallsWgsl += `\n    var debugContainer: array<f32, ${context.maxContainerArrayLength}> = container0;\n\n`
      } else {
        // Copy only registers from actions 1+
        unrolledActionCallsWgsl += generateRegisterCopy(i, action, context)
      }
    }
  }

  // Execute rotation actions (add to comboDmg)
  for (let i = 0; i < context.rotationActions.length; i++) {
    const action = context.rotationActions[i]
    const actionIndex = context.defaultActions.length + i

    const { actionCall, actionFunction } = unrollAction(actionIndex, action, context, gpuParams, true)

    unrolledActionCallsWgsl += actionCall
    unrolledActionFunctionsWgsl += actionFunction

    // DEBUG: Copy registers after execution
    if (gpuParams.DEBUG) {
      unrolledActionCallsWgsl += generateRegisterCopy(actionIndex, action, context)
    }
  }

  if (!gpuParams.DEBUG) {
    unrolledActionCallsWgsl += generateSortOptionReturn(request, context)
  } else {
    unrolledActionCallsWgsl += `
    results[index] = debugContainer;
`
  }

  wgsl = wgsl.replace(
    '/* INJECT UNROLLED ACTIONS */',
    unrolledActionCallsWgsl,
  )

  wgsl = wgsl.replace(
    '/* INJECT UNROLLED ACTION FUNCTIONS */',
    unrolledActionFunctionsWgsl,
  )

  return wgsl
}

const SortOptionToAKey: Partial<Record<SortOptionKey, AKeyValue>> = {
  ATK: AKey.ATK,
  DEF: AKey.DEF,
  HP: AKey.HP,
  SPD: AKey.SPD,
  CR: AKey.CR,
  CD: AKey.CD,
  EHR: AKey.EHR,
  RES: AKey.RES,
  BE: AKey.BE,
  ERR: AKey.ERR,
  OHB: AKey.OHB,
}

// Stats that need their corresponding BOOST key added for sorting/display
const SortOptionBoostKey: Partial<Record<SortOptionKey, AKeyValue>> = {
  CR: AKey.CR_BOOST,
  CD: AKey.CD_BOOST,
}

/**
 * Generates WGSL code to output the result based on the selected sort option.
 * Currently handles: basic stats + COMBO
 */
function generateSortOptionReturn(request: Form, context: OptimizerContext): string {
  const sortOption = SortOption[request.resultSort!]
  const sortOptionGpu = sortOption.gpuProperty
  const sortKey = sortOption.key

  // Basic stats (not isComputedRating)
  // - statDisplay == 1 (basic mode): use c.{property}
  // - statDisplay == 0 (combat mode): use container0[stat index]
  if (!sortOption.isComputedRating) {
    const aKey = SortOptionToAKey[sortKey]
    if (aKey === undefined) {
      throw new Error(`GPU sort: no AKey mapping for basic stat '${sortKey}'`)
    }

    const config = context.defaultActions[0].config
    const statIndex = getActionIndex(SELF_ENTITY_INDEX, aKey, config)
    const boostKey = SortOptionBoostKey[sortKey]
    const boostExpr = boostKey !== undefined
      ? ` + container0[${getActionIndex(SELF_ENTITY_INDEX, boostKey, config)}]`
      : ''

    return `
    if (statDisplay == 1) {
      if (c.${sortOptionGpu} > threshold) {
        results[index] = c.${sortOptionGpu};
        failures = 1;
      } else {
        results[index] = -failures; failures = failures + 1;
      }
    } else {
      let sortValue = container0[${statIndex}]${boostExpr};
      if (sortValue > threshold) {
        results[index] = sortValue;
        failures = 1;
      } else {
        results[index] = -failures; failures = failures + 1;
      }
    }
`
  }

  if (sortKey === SortOption.COMBO.key) {
    return `
    if (comboDmg > threshold) {
      results[index] = comboDmg;
      failures = 1;
    } else {
      results[index] = -failures; failures = failures + 1;
    }
`
  }

  if (sortKey === SortOption.EHP.key) {
    return `
    if (ehp0 > threshold) {
      results[index] = ehp0;
      failures = 1;
    } else {
      results[index] = -failures; failures = failures + 1;
    }
`
  }

  // Ability damage sorts - find matching default action
  const matchingIndex = context.defaultActions.findIndex((action) => {
    return action.actionType === sortKey
  })

  if (matchingIndex >= 0) {
    return `
    if (dmg${matchingIndex} > threshold) {
      results[index] = dmg${matchingIndex};
      failures = 1;
    } else {
      results[index] = -failures; failures = failures + 1;
    }
`
  }

  // TODO: Handle other computed ratings (ELEMENTAL_DMG)
  throw new Error(`GPU sort: unsupported sort option '${sortKey}'`)
}

function generateRegisterCopy(actionIndex: number, action: OptimizerAction, context: OptimizerContext): string {
  const registersOffset = context.maxContainerArrayLength - (context.allActions.length + context.outputRegistersLength)
  const actionRegisterOffset = registersOffset
  const hitRegisterOffset = registersOffset + context.allActions.length

  let code = `    // Copy action ${actionIndex} registers to debug container\n`

  // Copy action register
  const actionRegIdx = actionRegisterOffset + action.registerIndex
  code += `  debugContainer[${actionRegIdx}] = container${actionIndex}[${actionRegIdx}];\n`

  // Copy all hit registers
  if (action.hits) {
    for (let hitIndex = 0; hitIndex < action.hits.length; hitIndex++) {
      const hit = action.hits[hitIndex]
      const hitRegIdx = hitRegisterOffset + hit.registerIndex
      code += `  debugContainer[${hitRegIdx}] = container${actionIndex}[${hitRegIdx}];\n`
    }
  }

  code += '\n'
  return code
}

// dprint-ignore
function unrollAction(index: number, action: OptimizerAction, context: OptimizerContext, gpuParams: GpuConstants, addToComboDmg: boolean) {
  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(context)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(context)

  let characterConditionalWgsl = "// Character conditionals\n"
  let lightConeConditionalWgsl = '// Light cone conditionals\n'

  if (characterConditionals.newGpuFinalizeCalculations) {
    characterConditionalWgsl += indent(characterConditionals.newGpuFinalizeCalculations(action, context), 3)
  }
  if (lightConeConditionals.newGpuFinalizeCalculations) {
    lightConeConditionalWgsl += indent(lightConeConditionals.newGpuFinalizeCalculations(action, context), 3)
  }

  //////////

  let basicConditionalsWgsl = "// Basic Character conditionals\n"

  if (characterConditionals.newGpuCalculateBasicEffects) {
    basicConditionalsWgsl += indent(characterConditionals.newGpuCalculateBasicEffects(action, context), 1)
  }
  if (lightConeConditionals.newGpuCalculateBasicEffects) {
    basicConditionalsWgsl += indent(lightConeConditionals.newGpuCalculateBasicEffects(action, context), 1)
  }

  //////////

  const damageCalculationWgsl = indent(unrollDamageCalculations(index, action, context, gpuParams), 1)

  //////////

  function generateConditionalExecution(conditional: DynamicConditional) {
    return `evaluate${conditional.id}${action.actionIdentifier}(p_container, p_sets, p_state);`
  }

  const { conditionalSequence, terminalConditionals } = evaluateDependencyOrder(action.conditionalRegistry)
  let conditionalSequenceWgsl = '\n'
  conditionalSequenceWgsl += conditionalSequence.map(generateConditionalExecution).map((wgsl) => indent(wgsl, 1)).join('\n') + '\n'

  conditionalSequenceWgsl += '\n'
  conditionalSequenceWgsl += terminalConditionals.map(generateConditionalExecution).map((wgsl) => indent(wgsl, 1)).join('\n') + '\n'

  //////////

  const actionCall = `
    var container${index}: array<f32, ${context.maxContainerArrayLength}> = precomputedStats[${index}];
    let dmg${index} = unrolledAction${index}(
      &container${index},
      &sets,
      &c,
      diffATK,
      diffDEF,
      diffHP,
      diffSPD,
      diffCD,
      diffCR,
      diffEHR,
      diffRES,
      diffBE,
      diffERR,
      diffOHB,
    );
${addToComboDmg ? `    comboDmg += dmg${index} * ${getDotComboMultiplier(action, context)};\n` : ''}`
  
  const actionFunction = `
fn unrolledAction${index}(
  p_container: ptr<function, array<f32, ${context.maxContainerArrayLength}>>,
  p_sets: ptr<function, Sets>,
  p_c: ptr<function, BasicStats>,
  diffATK: f32,
  diffDEF: f32,
  diffHP: f32,
  diffSPD: f32,
  diffCD: f32,
  diffCR: f32,
  diffEHR: f32,
  diffRES: f32,
  diffBE: f32,
  diffERR: f32,
  diffOHB: f32,
) -> f32 { // Action ${index} - ${action.actionName} 
  let setConditionals = action${index}.setConditionals;
  var state = ConditionalState();
  let p_state = &state;
  state.actionIndex = ${index};

  var comboDmg = 0.0;
  var comboHeal = 0.0;
  var comboShield = 0.0;

  if (
    p2((*p_sets).CelestialDifferentiator) >= 1
    && setConditionals.enabledCelestialDifferentiator == true
    && (*p_c).CD >= 1.20
  ) {
    ${buff.action(AKey.CR, 0.60).wgsl(action, 2)}
  }

  if (p4((*p_sets).PoetOfMourningCollapse) >= 1) {
    let crValue = select(0.0, 0.20, (*p_c).SPD < 110.0) + select(0.0, 0.12, (*p_c).SPD < 95.0);
    ${buff.action(AKey.CR, 'crValue').targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
  }

  // ===== SPD BUFFS =====

  if (
    p4((*p_sets).MessengerTraversingHackerspace) >= 1
    && setConditionals.enabledMessengerTraversingHackerspace == true
  ) {
    ${buff.action(AKey.SPD_P, 0.12).targets(TargetTag.FullTeam).wgsl(action, 2)}
  }

  if (
    p4((*p_sets).HeroOfTriumphantSong) >= 1
    && setConditionals.enabledHeroOfTriumphantSong == true
  ) {
    ${buff.action(AKey.SPD_P, 0.06).wgsl(action, 2)}
    ${buff.action(AKey.CD, 0.30).targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
  }

  if (
    p4((*p_sets).WarriorGoddessOfSunAndThunder) >= 1
    && setConditionals.enabledWarriorGoddessOfSunAndThunder == true
  ) {
    ${buff.action(AKey.SPD_P, 0.06).wgsl(action, 4)}
    ${buff.action(AKey.CD, 0.15).targets(TargetTag.FullTeam).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).AmphoreusTheEternalLand) >= 1
    && setConditionals.enabledAmphoreusTheEternalLand == true
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.MEMOSPRITE, action.config)} >= 1
  ) {
    ${buff.action(AKey.SPD_P, 0.08).targets(TargetTag.FullTeam).wgsl(action, 2)}
  }

  // ===== ATK BUFFS =====

  if (p4((*p_sets).ChampionOfStreetwiseBoxing) >= 1) {
    ${buff.action(AKey.ATK_P, `0.05 * f32(setConditionals.valueChampionOfStreetwiseBoxing)`).wgsl(action, 2)}
  }

  if (
    p4((*p_sets).BandOfSizzlingThunder) >= 1
    && setConditionals.enabledBandOfSizzlingThunder == true
  ) {
    ${buff.action(AKey.ATK_P, 0.20).wgsl(action, 2)}
  }

  if (p2((*p_sets).TheAshblazingGrandDuke) >= 1) {
    ${buff.hit(HKey.DMG_BOOST, 0.20).damageType(DamageTag.FUA).wgsl(action, 2)}
    if (p4((*p_sets).TheAshblazingGrandDuke) >= 1) {
      ${buff.action(AKey.ATK_P, `0.06 * f32(setConditionals.valueTheAshblazingGrandDuke)`).wgsl(action, 3)}
    }
  }

  if (
    p4((*p_sets).WavestriderCaptain) >= 1
    && setConditionals.enabledWavestriderCaptain == true
  ) {
    ${buff.action(AKey.ATK_P, 0.48).wgsl(action, 2)}
  }

  // ===== HP BUFFS =====

  if (
    p4((*p_sets).WorldRemakingDeliverer) >= 1
    && setConditionals.enabledWorldRemakingDeliverer == true
  ) {
    ${buff.action(AKey.HP_P, 0.24).targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
    ${buff.action(AKey.DMG_BOOST, 0.15).targets(TargetTag.FullTeam).wgsl(action, 2)}
  }

  // ===== CD BUFFS =====

  if (
    p4((*p_sets).HunterOfGlacialForest) >= 1
    && setConditionals.enabledHunterOfGlacialForest == true
  ) {
    ${buff.action(AKey.CD, 0.25).wgsl(action, 2)}
  }

  if (p4((*p_sets).WastelanderOfBanditryDesert) >= 1) {
    if (setConditionals.valueWastelanderOfBanditryDesert > 0) {
      ${buff.action(AKey.CR_BOOST, 0.10).wgsl(action, 3)}
    }
    if (setConditionals.valueWastelanderOfBanditryDesert == 2) {
      ${buff.action(AKey.CD_BOOST, 0.20).wgsl(action, 3)}
    }
  }

  if (p2((*p_sets).PioneerDiverOfDeadWaters) >= 1 && setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
    ${buff.action(AKey.DMG_BOOST, 0.12).wgsl(action, 2)}
    if (p4((*p_sets).PioneerDiverOfDeadWaters) >= 1) {
      ${buff.action(AKey.CD_BOOST, `getPioneerSetValue(setConditionals.valuePioneerDiverOfDeadWaters)`).wgsl(action, 3)}
      if (setConditionals.valuePioneerDiverOfDeadWaters > 2) {
        ${buff.action(AKey.CR, 0.04).wgsl(action, 4)}
      }
    }
  }

  if (p2((*p_sets).SigoniaTheUnclaimedDesolation) >= 1) {
    ${buff.action(AKey.CD, `0.04 * f32(setConditionals.valueSigoniaTheUnclaimedDesolation)`).wgsl(action, 2)}
  }

  if (p2((*p_sets).DuranDynastyOfRunningWolves) >= 1) {
    ${buff.hit(HKey.DMG_BOOST, `0.05 * f32(setConditionals.valueDuranDynastyOfRunningWolves)`).damageType(DamageTag.FUA).wgsl(action, 2)}
    if (setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
      ${buff.action(AKey.CD, 0.25).wgsl(action, 3)}
    }
  }

  if (
    p2((*p_sets).TheWondrousBananAmusementPark) >= 1
    && setConditionals.enabledTheWondrousBananAmusementPark == true
  ) {
    ${buff.action(AKey.CD, 0.32).wgsl(action, 2)}
  }

  if (p4((*p_sets).SacerdosRelivedOrdeal) >= 1) {
    ${buff.action(AKey.CD, `0.18 * f32(setConditionals.valueSacerdosRelivedOrdeal)`).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).TengokuLivestream) >= 1
    && setConditionals.enabledTengokuLivestream == true
  ) {
    ${buff.action(AKey.CD, 0.32).wgsl(action, 2)}
  }

  // ===== CR BUFFS =====

  if (p4((*p_sets).LongevousDisciple) >= 1) {
    ${buff.action(AKey.CR, `0.08 * f32(setConditionals.valueLongevousDisciple)`).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).IzumoGenseiAndTakamaDivineRealm) >= 1
    && setConditionals.enabledIzumoGenseiAndTakamaDivineRealm == true
  ) {
    ${buff.action(AKey.CR, 0.12).wgsl(action, 2)}
  }

  // ===== BE BUFFS =====

  if (
    p4((*p_sets).WatchmakerMasterOfDreamMachinations) >= 1
    && setConditionals.enabledWatchmakerMasterOfDreamMachinations == true
  ) {
    ${buff.action(AKey.BE, 0.30).targets(TargetTag.FullTeam).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).ForgeOfTheKalpagniLantern) >= 1
    && setConditionals.enabledForgeOfTheKalpagniLantern == true
  ) {
    ${buff.action(AKey.BE, 0.40).wgsl(action, 2)}
  }

  // ===== ABILITY DMG BOOSTS =====

  if (p4((*p_sets).MusketeerOfWildWheat) >= 1) {
    ${buff.hit(HKey.DMG_BOOST, 0.10).damageType(DamageTag.BASIC).wgsl(action, 2)}
  }

  if (p4((*p_sets).FiresmithOfLavaForging) >= 1) {
    ${buff.hit(HKey.DMG_BOOST, 0.12).damageType(DamageTag.SKILL).wgsl(action, 2)}
    if (setConditionals.enabledFiresmithOfLavaForging == true) {
      ${buff.action(AKey.FIRE_DMG_BOOST, 0.12).wgsl(action, 3)}
    }
  }

  if (p4((*p_sets).TheWindSoaringValorous) >= 1) {
    ${buff.hit(HKey.DMG_BOOST, `0.36 * f32(setConditionals.enabledTheWindSoaringValorous)`).damageType(DamageTag.ULT).wgsl(action, 2)}
  }

  if (p4((*p_sets).ScholarLostInErudition) >= 1) {
    ${buff.hit(HKey.DMG_BOOST, 0.20).damageType(DamageTag.SKILL | DamageTag.ULT).wgsl(action, 2)}
    if (setConditionals.enabledScholarLostInErudition == true) {
      ${buff.hit(HKey.DMG_BOOST, 0.25).damageType(DamageTag.SKILL).wgsl(action, 3)}
    }
  }

  // ===== OTHER BOOSTS =====

  if (p4((*p_sets).GeniusOfBrilliantStars) >= 1) {
    ${buff.action(AKey.DEF_PEN, `select(0.10, 0.20, setConditionals.enabledGeniusOfBrilliantStars == true)`).wgsl(action, 2)}
  }

  if (p4((*p_sets).PrisonerInDeepConfinement) >= 1) {
    ${buff.action(AKey.DEF_PEN, `0.06 * f32(setConditionals.valuePrisonerInDeepConfinement)`).wgsl(action, 2)}
  }

  if (p2((*p_sets).GuardOfWutheringSnow) >= 1) {
    ${buff.actionMultiplicativeComplement(AKey.DMG_RED, 0.08).wgsl(action, 2)}
  }

  if (p4((*p_sets).KnightOfPurityPalace) >= 1) {
    ${buff.hit(HKey.DMG_BOOST, 0.20).outputType(OutputTag.SHIELD).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).PenaconyLandOfTheDreams) >= 1
    && setConditionals.enabledPenaconyLandOfTheDreams == true
  ) {
    ${buff.action(AKey.DMG_BOOST, 0.10).targets(TargetTag.MemospritesOnly).wgsl(action, 2)}
  }

  if (p2((*p_sets).ArcadiaOfWovenDreams) >= 1) {
    let arcadiaBuffValue = getArcadiaOfWovenDreamsValue(setConditionals.valueArcadiaOfWovenDreams);
    ${buff.action(AKey.DMG_BOOST, 'arcadiaBuffValue').targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
  }

  if (p2((*p_sets).SelfEnshroudedRecluse) >= 1) {
    ${buff.hit(HKey.DMG_BOOST, 0.10).outputType(OutputTag.SHIELD).wgsl(action, 2)}
    if (p4((*p_sets).SelfEnshroudedRecluse) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.12).outputType(OutputTag.SHIELD).wgsl(action, 3)}
      if (setConditionals.enabledSelfEnshroudedRecluse == true) {
        ${buff.action(AKey.CD, 0.15).targets(TargetTag.FullTeam).wgsl(action, 4)}
      }
    }
  }

  // Set the Action-scope stats, to be added to the Hit-scope stats later
  ${unrollEntityBaseStats(action)}

  ${basicConditionalsWgsl}
  
  ${conditionalSequenceWgsl}
  
  ${characterConditionalWgsl}
  
  ${lightConeConditionalWgsl}

  if (
    p2((*p_sets).FirmamentFrontlineGlamoth) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.SPD, action.config)} >= 135.0
  ) {
    ${buff.action(AKey.DMG_BOOST, `select(0.12, 0.18, ${containerActionVal(SELF_ENTITY_INDEX, AKey.SPD, action.config)} >= 160.0)`).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).RutilantArena) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.CR, action.config)} >= 0.70
  ) {
    ${buff.hit(HKey.DMG_BOOST, 0.20).damageType(DamageTag.BASIC | DamageTag.SKILL).wgsl(action, 2)}
  }

  if (
    p2((*p_sets).InertSalsotto) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.CR, action.config)} >= 0.50
  ) {
    ${buff.hit(HKey.DMG_BOOST, 0.15).damageType(DamageTag.ULT | DamageTag.FUA).wgsl(action, 2)}
  }

  if (p2((*p_sets).RevelryByTheSea) >= 1) {
    if (${containerActionVal(SELF_ENTITY_INDEX, AKey.ATK, action.config)} >= 3600.0) {
      ${buff.hit(HKey.DMG_BOOST, 0.24).damageType(DamageTag.DOT).wgsl(action, 3)}
    } else if (${containerActionVal(SELF_ENTITY_INDEX, AKey.ATK, action.config)} >= 2400.0) {
      ${buff.hit(HKey.DMG_BOOST, 0.12).damageType(DamageTag.DOT).wgsl(action, 3)}
    }
  }

  if (
    p4((*p_sets).IronCavalryAgainstTheScourge) >= 1
    && ${containerActionVal(SELF_ENTITY_INDEX, AKey.BE, action.config)} >= 1.50
  ) {
    ${buff.hit(HKey.DEF_PEN, 0.10).damageType(DamageTag.BREAK).wgsl(action, 2)}
    ${buff.hit(HKey.DEF_PEN, `select(0.0, 0.15, ${containerActionVal(SELF_ENTITY_INDEX, AKey.BE, action.config)} >= 2.50)`).damageType(DamageTag.SUPER_BREAK).wgsl(action, 2)}
  }
  
  ${damageCalculationWgsl}
  
  // Combat stat filters
  
  // Basic stat filters
  
  // Rating stat filters
  
  // Return value
  
  return comboDmg + comboHeal + comboShield;
}
  `

  return { actionCall, actionFunction }
}

function unrollDamageCalculations(index: number, action: OptimizerAction, context: OptimizerContext, gpuParams: GpuConstants) {
  let code = ''

  for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
    const hit = action.hits![hitIndex]
    const damageFunction = getDamageFunction(hit.damageFunctionType)
    code += damageFunction.wgsl(action, hitIndex, context)
  }

  if (gpuParams.DEBUG) {
    // Set action register with total combo damage
    code += wgslDebugActionRegister(action, context, 'comboDmg + comboHeal + comboShield') + '\n'
  }

  return wgsl`
${code}
`
}

function unrollEntityBaseStats(action: OptimizerAction, targetTag: TargetTag = TargetTag.FullTeam) {
  const config = action.config
  const lines: string[] = ['']
  for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
    const entity = config.entitiesArray[entityIndex]
    if (matchesTargetTag(entity, targetTag)) {
      const entityName = entity.name ?? `Entity ${entityIndex}`
      const baseIndex = getActionIndex(entityIndex, AKey.HP_P, config)
      // dprint-ignore
      lines.push(
        `\
  // Entity ${entityIndex}: ${entityName} | Base index: ${baseIndex}
  ${containerActionVal(entityIndex, AKey.BASE_ATK, config)} = ${entity.memoBaseAtkScaling ?? 1} * baseATK;
  ${containerActionVal(entityIndex, AKey.BASE_DEF, config)} = ${entity.memoBaseDefScaling ?? 1} * baseDEF;
  ${containerActionVal(entityIndex, AKey.BASE_HP, config)} = ${entity.memoBaseHpScaling ?? 1} * baseHP;
  ${containerActionVal(entityIndex, AKey.BASE_SPD, config)} = ${entity.memoBaseSpdScaling ?? 1} * baseSPD;

  ${containerActionVal(entityIndex, AKey.ATK, config)} += diffATK * ${entity.memoBaseAtkScaling ?? 1} + ${entity.memoBaseAtkFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.DEF, config)} += diffDEF * ${entity.memoBaseDefScaling ?? 1} + ${entity.memoBaseDefFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.HP, config)} += diffHP * ${entity.memoBaseHpScaling ?? 1} + ${entity.memoBaseHpFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.SPD, config)} += diffSPD * ${entity.memoBaseSpdScaling ?? 1} + ${entity.memoBaseSpdFlat ?? 0};
  ${containerActionVal(entityIndex, AKey.CD, config)} += diffCD;
  ${containerActionVal(entityIndex, AKey.CR, config)} += diffCR;
  ${containerActionVal(entityIndex, AKey.EHR, config)} += diffEHR;
  ${containerActionVal(entityIndex, AKey.RES, config)} += diffRES;
  ${containerActionVal(entityIndex, AKey.BE, config)} += diffBE;
  ${containerActionVal(entityIndex, AKey.ERR, config)} += diffERR;
  ${containerActionVal(entityIndex, AKey.OHB, config)} += diffOHB;
        
  ${containerActionVal(entityIndex, AKey.ATK, config)} += ${containerActionVal(entityIndex, AKey.ATK_P, config)} * ${containerActionVal(entityIndex, AKey.BASE_ATK, config)};
  ${containerActionVal(entityIndex, AKey.DEF, config)} += ${containerActionVal(entityIndex, AKey.DEF_P, config)} * ${containerActionVal(entityIndex, AKey.BASE_DEF, config)};
  ${containerActionVal(entityIndex, AKey.HP, config)} += ${containerActionVal(entityIndex, AKey.HP_P, config)} * ${containerActionVal(entityIndex, AKey.BASE_HP, config)};
  ${containerActionVal(entityIndex, AKey.SPD, config)} += ${containerActionVal(entityIndex, AKey.SPD_P, config)} * ${containerActionVal(entityIndex, AKey.BASE_SPD, config)};
        
  ${containerActionVal(entityIndex, AKey.PHYSICAL_DMG_BOOST, config)} += (*p_c).PHYSICAL_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.FIRE_DMG_BOOST, config)} += (*p_c).FIRE_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.ICE_DMG_BOOST, config)} += (*p_c).ICE_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.LIGHTNING_DMG_BOOST, config)} += (*p_c).LIGHTNING_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.WIND_DMG_BOOST, config)} += (*p_c).WIND_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.QUANTUM_DMG_BOOST, config)} += (*p_c).QUANTUM_DMG_BOOST;
  ${containerActionVal(entityIndex, AKey.IMAGINARY_DMG_BOOST, config)} += (*p_c).IMAGINARY_DMG_BOOST;
`,
      )
    }
  }
  return lines.join('\n')
}

/**
 * Generates combat stat filters that execute after the first default action.
 * Uses conditional extraction - only extracts stats that have active min/max filters.
 */
export function generateCombatStatFilters(request: Form, context: OptimizerContext, gpuParams: GpuConstants): string {
  const action = context.defaultActions[0]
  const config = action.config

  const extractions: string[] = []
  const conditions: string[] = []

  // Helper to add filter for a stat - only extracts if filter is active
  const addStatFilter = (
    varName: string,
    key: AKeyValue,
    minKey: keyof Form,
    maxKey: keyof Form,
  ) => {
    const minVal = request[minKey] as number
    const maxVal = request[maxKey] as number
    const hasMin = minVal > 0
    const hasMax = maxVal < Constants.MAX_INT

    if (hasMin || hasMax) {
      const index = getActionIndex(SELF_ENTITY_INDEX, key, config)
      extractions.push(`let ${varName} = container0[${index}];`)
      if (hasMin) conditions.push(`${varName} < ${minKey}`)
      if (hasMax) conditions.push(`${varName} > ${maxKey}`)
    }
  }

  // Helper to add filter for a stat that combines a base key + boost key
  const addBoostedStatFilter = (
    varName: string,
    key: AKeyValue,
    boostKey: AKeyValue,
    minKey: keyof Form,
    maxKey: keyof Form,
  ) => {
    const minVal = request[minKey] as number
    const maxVal = request[maxKey] as number
    const hasMin = minVal > 0
    const hasMax = maxVal < Constants.MAX_INT

    if (hasMin || hasMax) {
      const index = getActionIndex(SELF_ENTITY_INDEX, key, config)
      const boostIndex = getActionIndex(SELF_ENTITY_INDEX, boostKey, config)
      extractions.push(`let ${varName} = container0[${index}] + container0[${boostIndex}];`)
      if (hasMin) conditions.push(`${varName} < ${minKey}`)
      if (hasMax) conditions.push(`${varName} > ${maxKey}`)
    }
  }

  // Add filters for each combat stat
  addStatFilter('fSpd', AKey.SPD, 'minSpd', 'maxSpd')
  addStatFilter('fHp', AKey.HP, 'minHp', 'maxHp')
  addStatFilter('fAtk', AKey.ATK, 'minAtk', 'maxAtk')
  addStatFilter('fDef', AKey.DEF, 'minDef', 'maxDef')
  addBoostedStatFilter('fCr', AKey.CR, AKey.CR_BOOST, 'minCr', 'maxCr')
  addBoostedStatFilter('fCd', AKey.CD, AKey.CD_BOOST, 'minCd', 'maxCd')
  addStatFilter('fEhr', AKey.EHR, 'minEhr', 'maxEhr')
  addStatFilter('fRes', AKey.RES, 'minRes', 'maxRes')
  addStatFilter('fBe', AKey.BE, 'minBe', 'maxBe')
  addStatFilter('fErr', AKey.ERR, 'minErr', 'maxErr')

  // EHP calculation for all entities (needed for filtering or sorting)
  if (context.shaderVariables.needsEhp) {
    for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
      const hpIndex = getActionIndex(entityIndex, AKey.HP, config)
      const defIndex = getActionIndex(entityIndex, AKey.DEF, config)
      const dmgRedIndex = getActionIndex(entityIndex, AKey.DMG_RED, config)
      const ehpIndex = getActionIndex(entityIndex, AKey.EHP, config)

      extractions.push(`let ehpHp${entityIndex} = container0[${hpIndex}];`)
      extractions.push(`let ehpDef${entityIndex} = container0[${defIndex}];`)
      extractions.push(`let ehpDmgRed${entityIndex} = container0[${dmgRedIndex}];`)
      extractions.push(`let ehp${entityIndex} = ehpHp${entityIndex} / (1.0 - ehpDef${entityIndex} / (ehpDef${entityIndex} + 200.0 + 10.0 * f32(enemyLevel))) / (1.0 - ehpDmgRed${entityIndex});`)
      extractions.push(`container0[${ehpIndex}] = ehp${entityIndex};`)
    }

    // EHP filtering uses entity 0 (primary character)
    if (request.minEhp > 0) conditions.push(`ehp0 < minEhp`)
    if (request.maxEhp < Constants.MAX_INT) conditions.push(`ehp0 > maxEhp`)
  }

  if (extractions.length === 0) return ''

  if (conditions.length === 0) {
    return `
    // Combat stat extractions (after action 0)
    ${extractions.join('\n    ')}
`
  }

  return `
    // Combat stat filters (after action 0)
    ${extractions.join('\n    ')}
    if (
      ${conditions.join(' ||\n      ')}
    ) {
      results[index] = ${gpuParams.DEBUG ? 'debugContainer' : '-failures; failures = failures + 1'};
      continue;
    }
`
}

/**
 * Returns the compile-time combo multiplier for a rotation action.
 * DOT actions get their damage multiplied by (comboDot / dotAbilities) to represent
 * multiple ticks of DOT damage occurring during the rotation.
 * Non-DOT actions get a multiplier of 1.0.
 */
function getDotComboMultiplier(action: OptimizerAction, context: OptimizerContext): string {
  if (action.actionType === AbilityKind.DOT && context.comboDot > 0 && context.dotAbilities > 0) {
    return `${context.comboDot / context.dotAbilities}`
  }
  return '1.0'
}
