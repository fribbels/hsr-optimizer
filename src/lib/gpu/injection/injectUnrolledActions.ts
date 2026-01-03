import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  containerActionVal,
  getActionIndex,
} from 'lib/gpu/injection/injectUtils'
import {
  indent,
  wgsl,
} from 'lib/gpu/injection/wgslUtils'
import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import {
  buff,
  matchesTargetTag,
} from 'lib/optimization/engine/container/gpuBuffBuilder'
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
  let unrolledActionsWgsl = ''

  for (let i = 0; i < context.defaultActions.length; i++) {
    const action = context.defaultActions[i]

    let unrolledAction = unrollAction(i, action, context)

    unrolledActionsWgsl += unrolledAction
  }

  for (let i = 0; i < context.rotationActions.length; i++) {
    const action = context.rotationActions[i]
  }

  wgsl = wgsl.replace(
    '/* INJECT UNROLLED ACTIONS */',
    unrolledActionsWgsl,
  )

  return wgsl
}

// dprint-ignore
function unrollAction(index: number, action: OptimizerAction, context: OptimizerContext) {
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

  const damageCalculationWgsl = unrollDamageCalculations(index, action, context)

  return `
    { // Action ${index} - ${action.actionName} 
      var action: Action = action${index};
      var container: array<f32, ${context.maxContainerArrayLength}> = computedStatsX${index};
      let p_container = &container;

      let setConditionals = action.setConditionals;
      var state = ConditionalState();
      state.actionIndex = ${index};

      let p_sets = &sets;
      let p_state = &state;

      // Set the Action-scope stats, to be added to the Hit-scope stats later
      ${unrollEntityBaseStats(action)}
    
      if (
        p2(sets.AmphoreusTheEternalLand) >= 1
        && setConditionals.enabledAmphoreusTheEternalLand == true
        && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.MEMOSPRITE, action.config)} >= 1
      ) {
        ${buff.action(StatKey.SPD_P, 0.08).targets(TargetTag.FullTeam).wgsl(action, 4)}
      }

      if (
        p2(sets.RutilantArena) >= 1
        && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, action.config)} >= 0.70
      ) {
        ${buff.hit(StatKey.DMG_BOOST, 0.20).damageType(DamageTag.BASIC | DamageTag.SKILL).wgsl(action, 4)}
      }
      
      // Dynamic conditional chain
      
      ${characterConditionalWgsl}
      
      ${lightConeConditionalWgsl}
      
      // Fix the hp/atk/spd/def bug
      
      // Damage
      
      // Add to combo
      
      // Combat stat filters
      
      // Basic stat filters
      
      // Rating stat filters
      
      // Return value
      
      results[index] = container; // DEBUG
      results[index + 1] = container; // DEBUG
    }
  `
}

function unrollDamageCalculations(index: number, action: OptimizerAction, context: OptimizerContext) {
  let code = ''

  for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
    const hit = action.hits![hitIndex]
    code += hit.damageFunction.wgsl(action, hitIndex, context)
  }

  return wgsl`\
      var damage: f32 = 0;  
`
}

function unrollEntityBaseStats(action: OptimizerAction, targetTag: TargetTag = TargetTag.FullTeam) {
  const config = action.config
  const lines: string[] = ['']
  for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
    const entity = config.entitiesArray[entityIndex]
    if (matchesTargetTag(entity, targetTag)) {
      const entityName = entity.name ?? `Entity ${entityIndex}`
      const baseIndex = getActionIndex(entityIndex, 0, config)
      lines.push(
        `\
        // Entity ${entityIndex}: ${entityName} | Base index: ${baseIndex}
        ${containerActionVal(entityIndex, StatKey.ATK, config)} += diffATK;
        ${containerActionVal(entityIndex, StatKey.DEF, config)} += diffDEF;
        ${containerActionVal(entityIndex, StatKey.HP, config)} += diffHP;
        ${containerActionVal(entityIndex, StatKey.SPD, config)} += diffSPD;
        ${containerActionVal(entityIndex, StatKey.CD, config)} += diffCD;
        ${containerActionVal(entityIndex, StatKey.CR, config)} += diffCR;
        ${containerActionVal(entityIndex, StatKey.EHR, config)} += diffEHR;
        ${containerActionVal(entityIndex, StatKey.RES, config)} += diffRES;
        ${containerActionVal(entityIndex, StatKey.BE, config)} += diffBE;
        ${containerActionVal(entityIndex, StatKey.ERR, config)} += diffERR;
        ${containerActionVal(entityIndex, StatKey.OHB, config)} += diffOHB;
        ${containerActionVal(entityIndex, StatKey.ATK, config)} += ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, config)} * baseATK;
        ${containerActionVal(entityIndex, StatKey.DEF, config)} += ${containerActionVal(SELF_ENTITY_INDEX, StatKey.DEF, config)} * baseDEF;
        ${containerActionVal(entityIndex, StatKey.HP, config)} += ${containerActionVal(SELF_ENTITY_INDEX, StatKey.HP, config)} * baseHP;
        ${containerActionVal(entityIndex, StatKey.SPD, config)} += ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} * baseSPD;`,
      )
    }
  }
  return lines.join('\n')
}
