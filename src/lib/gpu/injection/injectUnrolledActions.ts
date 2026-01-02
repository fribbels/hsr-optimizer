import {
  actionBuff,
  actionBuffMemo,
  containerActionRef,
  EntityFilter,
  EntityFilters,
  getActionIndex,
} from 'lib/gpu/injection/injectUtils'
import { GpuConstants } from 'lib/gpu/webgpuTypes'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { Form } from 'types/form'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

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
  return `
    { // Action ${index} - ${action.actionName} 
      var action: Action = action${index};
      var computedStatsContainer: array<f32, ${context.maxContainerArrayLength}> = computedStatsX${index};
      let p_container = &computedStatsContainer;

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
        && ${containerActionRef(SELF_ENTITY_INDEX, StatKey.MEMOSPRITE, action.config)} >= 1
      ) {
        ${actionBuff(StatKey.SPD_P, 0.08, action, context)}
        ${actionBuffMemo(StatKey.SPD_P, 0.08, action, context)}
      }
    }
  `
}

function unrollEntityBaseStats(action: OptimizerAction, filter: EntityFilter = EntityFilters.all) {
  const config = action.config
  const lines: string[] = ['']
  for (let entityIndex = 0; entityIndex < config.entitiesLength; entityIndex++) {
    const entity = config.entitiesArray[entityIndex]
    if (filter(entity)) {
      const entityName = entity.name ?? `Entity ${entityIndex}`
      const baseIndex = getActionIndex(entityIndex, 0, config)
      lines.push(
        `\
        // Entity ${entityIndex}: ${entityName} | Base index: ${baseIndex}
        ${containerActionRef(entityIndex, StatKey.ATK, config)} += diffATK;
        ${containerActionRef(entityIndex, StatKey.DEF, config)} += diffDEF;
        ${containerActionRef(entityIndex, StatKey.HP, config)} += diffHP;
        ${containerActionRef(entityIndex, StatKey.SPD, config)} += diffSPD;
        ${containerActionRef(entityIndex, StatKey.CD, config)} += diffCD;
        ${containerActionRef(entityIndex, StatKey.CR, config)} += diffCR;
        ${containerActionRef(entityIndex, StatKey.EHR, config)} += diffEHR;
        ${containerActionRef(entityIndex, StatKey.RES, config)} += diffRES;
        ${containerActionRef(entityIndex, StatKey.BE, config)} += diffBE;
        ${containerActionRef(entityIndex, StatKey.ERR, config)} += diffERR;
        ${containerActionRef(entityIndex, StatKey.OHB, config)} += diffOHB;
        ${containerActionRef(entityIndex, StatKey.ATK, config)} += ${containerActionRef(SELF_ENTITY_INDEX, StatKey.ATK, config)} * baseATK;
        ${containerActionRef(entityIndex, StatKey.DEF, config)} += ${containerActionRef(SELF_ENTITY_INDEX, StatKey.DEF, config)} * baseDEF;
        ${containerActionRef(entityIndex, StatKey.HP, config)} += ${containerActionRef(SELF_ENTITY_INDEX, StatKey.HP, config)} * baseHP;
        ${containerActionRef(entityIndex, StatKey.SPD, config)} += ${containerActionRef(SELF_ENTITY_INDEX, StatKey.SPD, config)} * baseSPD;`,
      )
    }
  }
  return lines.join('\n')
}
