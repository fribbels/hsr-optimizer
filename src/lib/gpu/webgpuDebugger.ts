import { ElementNames } from 'lib/constants/constants'
import { type GpuExecutionContext } from 'lib/gpu/webgpuTypes'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  OutputTag,
  SELF_ENTITY_INDEX,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { logRegisters } from 'lib/simulations/registerLogger'
import { gridStore } from 'lib/stores/gridStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { precisionRound } from 'lib/utils/mathUtils'
import { type OptimizerContext } from 'types/optimizer'

export function debugWebgpuOutput(gpuContext: GpuExecutionContext, arrayBuffer: ArrayBuffer) {
  const array = new Float32Array(arrayBuffer)
  console.log(array.slice(0, 1000))

  debugPrintWebgpuArray(array)
  debugPinOptimizerWebgpuArray(array)
}

/*
 ED: array[22],
 BASIC: array[69],
 SKILL: array[70],
 ULT: array[71],
 FUA: array[72],
 DOT: array[73],
 BREAK: array[74],
 COMBO: array[75],
 EHP: array[77],
 HEAL: array[102],
 SHIELD: array[105],
 xHP: array[4],
 xATK: array[5],
 xDEF: array[6],
 xSPD: array[7],
 xCR: array[8],
 xCD: array[9],
 xEHR: array[10],
 xRES: array[11],
 xBE: array[12],
 xERR: array[13],
 xOHB: array[14],
 xELEMENTAL_DMG: array[22],
 */

/**
 * Extracts action damage values from default actions and maps them to standardized fields.
 * Also computes COMBO damage from rotation actions.
 * Extracts HEAL and SHIELD values from rotation action hit registers based on outputTag.
 */
function extractActionDamageFields(x: ComputedStatsContainer, context: OptimizerContext) {
  const fields: Record<string, number> = {
    BASIC: 0,
    SKILL: 0,
    ULT: 0,
    FUA: 0,
    MEMO_SKILL: 0,
    MEMO_TALENT: 0,
    ELATION_SKILL: 0,
    DOT: 0,
    BREAK: 0,
    COMBO: 0,
    HEAL: 0,
    SHIELD: 0,
  }

  // Map default actions to fields (includes damage, heal, and shield actions)
  for (const action of context.defaultActions) {
    const field = action.actionName
    if (field) {
      const value = x.getActionRegisterValue(action.registerIndex)
      fields[field] = (fields[field] ?? 0) + value
    }
  }

  // Extract values from rotation actions
  for (const action of context.rotationActions) {
    // Extract per-hit values from hit registers
    if (action.hits) {
      for (const hit of action.hits) {
        const hitValue = x.getHitRegisterValue(hit.registerIndex)
        if (hit.outputTag === OutputTag.DAMAGE && hit.recorded !== false) {
          fields.COMBO += hitValue
        } else if (hit.outputTag === OutputTag.HEAL) {
          fields.HEAL += hitValue
        } else if (hit.outputTag === OutputTag.SHIELD) {
          fields.SHIELD += hitValue
        }
      }
    }
  }

  return fields
}

export function debugExportWebgpuResult(array: Float32Array) {
  const context = useOptimizerDisplayStore.getState().context!
  const x = new ComputedStatsContainer()
  const len = context.maxContainerArrayLength

  x.initializeArrays(context.maxContainerArrayLength, context)
  x.setConfig(context.rotationActions[0].config)

  // Copy full GPU array including registers
  x.a.set(array.slice(0, len))

  // Log GPU register values
  logRegisters(x, context, 'GPU')

  const elementToStatKeyBoost = {
    [ElementNames.Physical]: StatKey.PHYSICAL_DMG_BOOST,
    [ElementNames.Fire]: StatKey.FIRE_DMG_BOOST,
    [ElementNames.Ice]: StatKey.ICE_DMG_BOOST,
    [ElementNames.Lightning]: StatKey.LIGHTNING_DMG_BOOST,
    [ElementNames.Wind]: StatKey.WIND_DMG_BOOST,
    [ElementNames.Quantum]: StatKey.QUANTUM_DMG_BOOST,
    [ElementNames.Imaginary]: StatKey.IMAGINARY_DMG_BOOST,
  }

  // Extract action damages dynamically
  const actionDamages = extractActionDamageFields(x, context)

  return {
    ED: x.getActionValueByIndex(StatKey.DMG_BOOST, SELF_ENTITY_INDEX),
    ...actionDamages,
    EHP: x.getActionValueByIndex(StatKey.EHP, SELF_ENTITY_INDEX),
    xHP: x.getActionValueByIndex(StatKey.HP, SELF_ENTITY_INDEX),
    xATK: x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX),
    xDEF: x.getActionValueByIndex(StatKey.DEF, SELF_ENTITY_INDEX),
    xSPD: x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX),
    xCR: x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) + x.getActionValueByIndex(StatKey.CR_BOOST, SELF_ENTITY_INDEX),
    xCD: x.getActionValueByIndex(StatKey.CD, SELF_ENTITY_INDEX) + x.getActionValueByIndex(StatKey.CD_BOOST, SELF_ENTITY_INDEX),
    xEHR: x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX),
    xRES: x.getActionValueByIndex(StatKey.RES, SELF_ENTITY_INDEX),
    xBE: x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX),
    xERR: x.getActionValueByIndex(StatKey.ERR, SELF_ENTITY_INDEX),
    xOHB: x.getActionValueByIndex(StatKey.OHB, SELF_ENTITY_INDEX),
    xELEMENTAL_DMG: x.getActionValueByIndex(StatKey.DMG_BOOST, SELF_ENTITY_INDEX)
      + x.getActionValueByIndex(elementToStatKeyBoost[context.element], SELF_ENTITY_INDEX),
    mxHP: x.getActionValueByIndex(StatKey.HP, 1),
    mxATK: x.getActionValueByIndex(StatKey.ATK, 1),
    mxDEF: x.getActionValueByIndex(StatKey.DEF, 1),
    mxSPD: x.getActionValueByIndex(StatKey.SPD, 1),
    mxCR: x.getActionValueByIndex(StatKey.CR, 1) + x.getActionValueByIndex(StatKey.CR_BOOST, 1),
    mxCD: x.getActionValueByIndex(StatKey.CD, 1) + x.getActionValueByIndex(StatKey.CD_BOOST, 1),
    mxEHR: x.getActionValueByIndex(StatKey.EHR, 1),
    mxRES: x.getActionValueByIndex(StatKey.RES, 1),
    mxBE: x.getActionValueByIndex(StatKey.BE, 1),
    mxERR: x.getActionValueByIndex(StatKey.ERR, 1),
    mxOHB: x.getActionValueByIndex(StatKey.OHB, 1),
    mxELEMENTAL_DMG: x.getActionValueByIndex(elementToStatKeyBoost[context.element], 1),
    mxEHP: 0,
  }
}

export function debugPinOptimizerWebgpuArray(array: Float32Array) {
  const currentPinned = gridStore.optimizerGridApi()?.getGridOption('pinnedTopRowData') ?? []
  currentPinned[1] = debugExportWebgpuResult(array)

  gridStore.optimizerGridApi()?.updateGridOptions({ pinnedTopRowData: currentPinned })
}

export function debugWebgpuComputedStats(array: Float32Array): ComputedStatsObjectExternal {
  return ComputedStatsContainer.fromArrays(array, new Float32Array(0)).toComputedStatsObject()
}

export function debugPrintWebgpuArray(array: Float32Array) {
  const computedStats: ComputedStatsObjectExternal = debugWebgpuComputedStats(array)
  for (const [key, value] of Object.entries(computedStats)) {
    computedStats[key as keyof ComputedStatsObjectExternal] = fixed(value)
  }
  console.log(debugWebgpuComputedStats(array))
}

function fixed(n: number) {
  return precisionRound(n, 5)
}
