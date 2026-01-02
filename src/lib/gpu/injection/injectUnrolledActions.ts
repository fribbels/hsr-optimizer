import { GpuConstants } from 'lib/gpu/webgpuTypes'
import {
  StatKey,
  StatKeyType,
  StatKeyValue,
} from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY } from 'lib/optimization/engine/config/tag'
import {
  ComputedStatsContainerConfig,
  EntityType,
  OptimizerEntity,
} from 'lib/optimization/engine/container/computedStatsContainer'
import { Form } from 'types/form'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function injectUnrolledActions(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  let unrolledActionsWgsl = ''

  for (let i = 0; i < context.defaultActions.length; i++) {
    const action = context.defaultActions[i]

    let unrolledAction = generateTemplate(i, action, context)

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
function generateTemplate(index: number, action: OptimizerAction, context: OptimizerContext) {
  return `
    { // Action ${index} - ${action.actionName} 
      var action: Action = action${index};
      var computedStatsContainer: array<ComputedStats, calculationsPerAction> = computedStatsX${index};
      let p_container = &computedStatsContainer;

      let setConditionals = action.setConditionals;
      var state = ConditionalState();
      state.actionIndex = ${index};

      let p_sets = &sets;
      let p_state = &state;

      let slotsPerEntity = maxHitsCount + 1;
      for (var entityIndex = 0; entityIndex < maxEntitiesCount; entityIndex++) {
        // Set the Action-scope stats, to be added to the Hit-scope stats later

        let actionSlotIndex = entityIndex * slotsPerEntity;
        computedStatsContainer[actionSlotIndex].ATK += diffATK;
        computedStatsContainer[actionSlotIndex].DEF += diffDEF;
        computedStatsContainer[actionSlotIndex].HP  += diffHP;
        computedStatsContainer[actionSlotIndex].SPD += diffSPD;
        computedStatsContainer[actionSlotIndex].CD  += diffCD;
        computedStatsContainer[actionSlotIndex].CR  += diffCR;
        computedStatsContainer[actionSlotIndex].EHR += diffEHR;
        computedStatsContainer[actionSlotIndex].RES += diffRES;
        computedStatsContainer[actionSlotIndex].BE  += diffBE;
        computedStatsContainer[actionSlotIndex].ERR += diffERR;
        computedStatsContainer[actionSlotIndex].OHB += diffOHB;

        computedStatsContainer[actionSlotIndex].ATK += computedStatsContainer[actionSlotIndex].ATK_P * baseATK;
        computedStatsContainer[actionSlotIndex].DEF += computedStatsContainer[actionSlotIndex].DEF_P * baseDEF;
        computedStatsContainer[actionSlotIndex].HP  += computedStatsContainer[actionSlotIndex].HP_P * baseHP;
        computedStatsContainer[actionSlotIndex].SPD += computedStatsContainer[actionSlotIndex].SPD_P * baseSPD;
      }
    
      if (p2(sets.AmphoreusTheEternalLand) >= 1 && setConditionals.enabledAmphoreusTheEternalLand == true && computedStatsContainer[${getActionIndex(SELF_ENTITY, StatKey.MEMOSPRITE, action.config)}] >= 1) {
        ${actionBuff(StatKey.SPD_P, 0.08, action, context)}
        ${actionBuffMemo(StatKey.SPD_P, 0.08, action, context)}
      }
    }
  `
}

type EntityFilter = (entity: OptimizerEntity) => boolean

function actionBuffFiltered(
  statKey: StatKeyValue,
  value: number,
  action: OptimizerAction,
  context: OptimizerContext,
  filter: EntityFilter,
) {
  let wgsl = ''
  for (let entityIndex = 0; entityIndex < action.config.entitiesLength; entityIndex++) {
    const entity = action.config.entitiesArray[entityIndex]

    if (filter(entity)) {
      const index = getActionIndex(entityIndex, statKey, action.config)
      wgsl += `\
computedStatsContainer[${index}] += ${value};
`
    }
  }
  return wgsl
}

const Filters = {
  primaryOrPet: (e: OptimizerEntity) => Boolean(e.primary || e.pet),
  memo: (e: OptimizerEntity) => e.memosprite,
  all: () => true,
  summon: (e: OptimizerEntity) => e.pet || e.memosprite,
} as const

const actionBuff = (
  statKey: StatKeyValue,
  value: number,
  action: OptimizerAction,
  context: OptimizerContext,
) => actionBuffFiltered(statKey, value, action, context, Filters.primaryOrPet)

const actionBuffMemo = (
  statKey: StatKeyValue,
  value: number,
  action: OptimizerAction,
  context: OptimizerContext,
) => actionBuffFiltered(statKey, value, action, context, Filters.memo)

// Usage
// actionBuffFiltered(statKey, value, action, context, Filters.primaryOrPet);
// actionBuffFiltered(statKey, value, action, context, Filters.memo);
// actionBuffFiltered(statKey, value, action, context, (e) => e.primary && !e.pet); // custom

function perHit(action: OptimizerAction, context: OptimizerContext) {
  let wgsl = ''
  for (let entityIndex = 0; entityIndex < action.config.entitiesLength; entityIndex++) {
    const entity = action.config.entitiesArray[entityIndex]

    for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
      const hit = action.hits![hitIndex]
    }
  }
  return `

  `
}

export function injectUnrolledActionHelpers() {
  return `

  `
}

function getActionIndex(entityIndex: number, statIndex: number, config: ComputedStatsContainerConfig): number {
  return entityIndex * (config.statsLength * (config.hitsLength + 1))
    + statIndex
}

function getHitIndex(entityIndex: number, hitIndex: number, statIndex: number, config: ComputedStatsContainerConfig): number {
  return entityIndex * (config.statsLength * (config.hitsLength + 1))
    + (hitIndex + 1) * config.statsLength
    + statIndex
}

// public getValue(key: StatKeyValue, hitIndex: number) {
//   const hit = this.config.hits[hitIndex]
//   const sourceEntityIndex = hit.sourceEntityIndex ?? 0
//
//   const actionValue = this.a[this.getActionIndex(sourceEntityIndex, key)]
//   const hitValue = this.a[this.getHitIndex(sourceEntityIndex, hitIndex, key)]
//
//   return actionValue + hitValue
// }
//
// function getActionValue(key: StatKeyValue, entityIndex: number, config: ComputedStatsContainerConfig): number {
//   return this.a[this.getActionIndex(entityIndex, key)]
// }

// public getActionValueByIndex(key: StatKeyValue, entityIndex: number): number {
//   return this.a[this.getActionIndex(entityIndex, key)]
// }
//
// public getHitValue(key: StatKeyValue, hitIndex: number) {
//   const hit = this.config.hits[hitIndex]
//   const sourceEntityIndex = hit.sourceEntityIndex ?? 0
//
//   return this.a[this.getHitIndex(sourceEntityIndex, hitIndex, key)]
// }
