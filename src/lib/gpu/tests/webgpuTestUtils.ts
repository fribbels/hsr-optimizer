import {
  COMPUTE_ENGINE_GPU_STABLE,
  SetsOrnaments,
  SetsRelics,
  Stats,
} from 'lib/constants/constants'
import { WebgpuTest } from 'lib/gpu/tests/webgpuTestGenerator'
import {
  destroyPipeline,
  generateExecutionPass,
  initializeGpuPipeline,
} from 'lib/gpu/webgpuInternals'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  newStatsConfig,
  STATS_LENGTH,
} from 'lib/optimization/engine/config/statsConfig'
import { OutputTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import { AugmentedStats } from 'lib/relics/relicAugmenter'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { SimulationRelicByPart } from 'lib/simulations/statSimulationTypes'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

export async function runTestRequest(request: Form, relics: RelicsByPart, device: GPUDevice) {
  request.resultSort = SortOption.COMBO.key
  const context = generateContext(request)

  const relicSetSolutions = new Array<number>(Math.pow(Object.keys(SetsRelics).length, 4)).fill(1)
  const ornamentSetSolutions = new Array<number>(Math.pow(Object.keys(SetsOrnaments).length, 2)).fill(1)
  const permutations = 1

  const gpuContext = initializeGpuPipeline(
    device,
    relics,
    request,
    context,
    permutations,
    COMPUTE_ENGINE_GPU_STABLE,
    relicSetSolutions,
    ornamentSetSolutions,
    true,
    true,
  )

  const gpuReadBuffer = generateExecutionPass(gpuContext, 0)
  await gpuReadBuffer.mapAsync(GPUMapMode.READ, 0, 10000)
  const arrayBuffer = gpuReadBuffer.getMappedRange(0, 10000)
  const array = new Float32Array(arrayBuffer)

  const relicsByPart = {
    Head: relics.Head[0],
    Hands: relics.Hands[0],
    Body: relics.Body[0],
    Feet: relics.Feet[0],
    PlanarSphere: relics.PlanarSphere[0],
    LinkRope: relics.LinkRope[0],
  }
  const { x: cpuContainer } = simulateBuild(relicsByPart as unknown as SimulationRelicByPart, context, null, null)

  // Create GPU container and copy array data into it
  const gpuContainer = new ComputedStatsContainer()
  gpuContainer.initializeArrays(context.maxContainerArrayLength, context)
  gpuContainer.setConfig(context.rotationActions[0].config)
  gpuContainer.a.set(array.slice(0, context.maxContainerArrayLength))

  const deltas = arrayDelta(cpuContainer, gpuContainer, context)

  gpuReadBuffer.unmap()
  gpuReadBuffer.destroy()
  destroyPipeline(gpuContext)

  return deltas
}

export type StatDeltaAnalysis = {
  allPass: boolean,
  statDeltas: StatDeltas,
}

export type StatDeltas = {
  [key: string]: StatDelta,
}

export type StatDelta = {
  key: string,
  cpu: string,
  gpu: string,
  deltaValue: number,
  deltaString: string,
  precision: number,
  pass: boolean,
}

const EXACT = 0
const P_0 = 1
const P_1 = 0.1
const P_2 = 0.01
const P_3 = 0.001
const P_4 = 0.0001
const P_5 = 0.00001
const P_6 = 0.000001

// Dynamic precision based on combo magnitude
// Larger values have more floating point precision loss
function getDynamicComboPrecision(value: number): number {
  const absValue = Math.abs(value)
  if (absValue > 1_000_000_000) return 6
  if (absValue > 100_000_000) return 5
  if (absValue > 10_000_000) return 4
  if (absValue > 1_000_000) return 3
  if (absValue > 100_000) return 2
  return 1
}

// Map StatKey index -> Stats string for relic conversion
const StatKeyToStat: Record<number, string> = {
  [StatKey.HP_P]: Stats.HP_P,
  [StatKey.ATK_P]: Stats.ATK_P,
  [StatKey.DEF_P]: Stats.DEF_P,
  [StatKey.SPD_P]: Stats.SPD_P,
  [StatKey.HP]: Stats.HP,
  [StatKey.ATK]: Stats.ATK,
  [StatKey.DEF]: Stats.DEF,
  [StatKey.SPD]: Stats.SPD,
  [StatKey.CR]: Stats.CR,
  [StatKey.CD]: Stats.CD,
  [StatKey.EHR]: Stats.EHR,
  [StatKey.RES]: Stats.RES,
  [StatKey.BE]: Stats.BE,
  [StatKey.ERR]: Stats.ERR,
  [StatKey.OHB]: Stats.OHB,
  [StatKey.PHYSICAL_DMG_BOOST]: Stats.Physical_DMG,
  [StatKey.FIRE_DMG_BOOST]: Stats.Fire_DMG,
  [StatKey.ICE_DMG_BOOST]: Stats.Ice_DMG,
  [StatKey.LIGHTNING_DMG_BOOST]: Stats.Lightning_DMG,
  [StatKey.WIND_DMG_BOOST]: Stats.Wind_DMG,
  [StatKey.QUANTUM_DMG_BOOST]: Stats.Quantum_DMG,
  [StatKey.IMAGINARY_DMG_BOOST]: Stats.Imaginary_DMG,
}

const ignoredStats: Record<number, boolean> = {
  [StatKey.BASE_ATK]: true,
  [StatKey.BASE_DEF]: true,
  [StatKey.BASE_HP]: true,
  [StatKey.BASE_SPD]: true,
  [StatKey.PHYSICAL_DMG_BOOST]: true,
  [StatKey.FIRE_DMG_BOOST]: true,
  [StatKey.ICE_DMG_BOOST]: true,
  [StatKey.LIGHTNING_DMG_BOOST]: true,
  [StatKey.WIND_DMG_BOOST]: true,
  [StatKey.IMAGINARY_DMG_BOOST]: true,
  [StatKey.QUANTUM_DMG_BOOST]: true,
  // COMBO_DMG is written to registers, not the stat position - use COMBO_REGISTER instead
  [StatKey.COMBO_DMG]: true,
}

const overridePrecision: Record<number, number> = {
  // Flat stats (large values, float precision issues)
  [StatKey.HP]: P_2,
  [StatKey.ATK]: P_2,
  [StatKey.DEF]: P_2,

  // Unconvertible buffs
  [StatKey.UNCONVERTIBLE_HP_BUFF]: P_2,
  [StatKey.UNCONVERTIBLE_ATK_BUFF]: P_2,
  [StatKey.UNCONVERTIBLE_DEF_BUFF]: P_2,

  [StatKey.EHP]: P_2,
}

function arrayDelta(cpuContainer: ComputedStatsContainer, gpuContainer: ComputedStatsContainer, context: OptimizerContext) {
  const statDeltas: StatDeltas = {}
  let allPass = true

  const cpu = cpuContainer.a
  const gpu = gpuContainer.a

  // console.log(cpu)
  // console.log(gpu)

  const statNames = Object.keys(newStatsConfig)

  function analyze(statName: string, cpuValue: number, gpuValue: number, precision: number) {
    const delta = cpuValue - gpuValue
    const pass = Math.abs(delta) <= precision
    if (!pass) {
      allPass = false
    }

    statDeltas[statName] = {
      key: statName,
      cpu: cpuValue.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      gpu: gpuValue.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      deltaValue: delta,
      deltaString: delta.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      precision: precision,
      pass: pass,
    }
  }

  // Compare stats array values
  for (let i = 0; i < STATS_LENGTH; i++) {
    if (ignoredStats[i]) continue
    const statName = statNames[i]
    const precision = overridePrecision[i] ?? P_4
    analyze(statName, cpu[i], gpu[i], precision)
  }

  // Compare register values for COMBO damage (sum of rotation action registers)
  // Also extract HEAL and SHIELD values from hit registers based on outputTag
  let cpuCombo = 0
  let gpuCombo = 0
  let cpuHeal = 0
  let gpuHeal = 0
  let cpuShield = 0
  let gpuShield = 0

  for (const action of context.rotationActions) {
    cpuCombo += cpuContainer.getActionRegisterValue(action.registerIndex)
    gpuCombo += gpuContainer.getActionRegisterValue(action.registerIndex)

    // Extract heal/shield values from hit registers
    if (action.hits) {
      for (const hit of action.hits) {
        const cpuHitValue = cpuContainer.getHitRegisterValue(hit.registerIndex)
        const gpuHitValue = gpuContainer.getHitRegisterValue(hit.registerIndex)
        if (hit.outputTag === OutputTag.HEAL) {
          cpuHeal += cpuHitValue
          gpuHeal += gpuHitValue
        } else if (hit.outputTag === OutputTag.SHIELD) {
          cpuShield += cpuHitValue
          gpuShield += gpuHitValue
        }
      }
    }
  }
  analyze('COMBO_REGISTER', cpuCombo, gpuCombo, getDynamicComboPrecision(Math.max(cpuCombo, gpuCombo)))
  analyze('HEAL_REGISTER', cpuHeal, gpuHeal, P_2)
  analyze('SHIELD_REGISTER', cpuShield, gpuShield, P_2)

  // Compare individual action register values
  for (const action of context.defaultActions) {
    const cpuValue = cpuContainer.getActionRegisterValue(action.registerIndex)
    const gpuValue = gpuContainer.getActionRegisterValue(action.registerIndex)
    analyze(`${action.actionName}_REGISTER`, cpuValue, gpuValue, getDynamicComboPrecision(Math.max(cpuValue, gpuValue)))
  }

  return {
    allPass,
    statDeltas: statDeltas,
  }
}

export function testWrapper(name: string, request: Form, relics: RelicsByPart, device: GPUDevice) {
  const test: Partial<WebgpuTest> = {
    name: name,
    request: request,
    relics: relics,
    done: false,
  }
  test.execute = async () => {
    const promise = runTestRequest(request, relics, device)

    const result = await promise
    test.done = true
    test.result = result

    return promise
  }

  return test as WebgpuTest
}

export function uncondenseRelics(relicsByPart: RelicsByPart) {
  for (const [_, relics] of Object.entries(relicsByPart)) {
    relics.map((relic) => {
      const condensedStats = relic.condensedStats!
      relic.substats = []
      condensedStats.map(([key, value]) => {
        relic.substats.push({
          stat: StatKeyToStat[key] as any,
          value,
        })
      })
    })
  }
  return relicsByPart
}

// Jingliu base build +25% CR for crit sets
export function generateTestRelics() {
  const condensedRelics = {
    Head: [
      {
        part: 'Head',
        set: 'Hunter of Glacial Forest',
        enhance: 15,
        grade: 5,
        main: {
          stat: Stats.HP,
          value: 705.6,
        },
        id: 'cd85c14c-a662-4413-a149-a379e6d538d3',
        equippedBy: '1212',
        condensedStats: [
          [StatKey.CR, 0.11016 + 0.25],
          [StatKey.CD, 0.10368],
          [StatKey.RES, 0.03456],
          [StatKey.BE, 0.05184],
          [StatKey.HP, 705.6],
        ],
        weightScore: 0,
        substats: [],
        ageIndex: 0,
        initialRolls: 0,
        augmentedStats: {} as AugmentedStats,
      },
    ],
    Hands: [
      {
        part: 'Hands',
        set: 'Hunter of Glacial Forest',
        enhance: 15,
        grade: 5,
        main: {
          stat: Stats.ATK,
          value: 352.8,
        },
        id: '798657c8-5c5c-4b44-9c5f-f5f094414289',
        equippedBy: '1212',
        condensedStats: [
          [StatKey.HP_P, 0.03456],
          [StatKey.SPD, 4],
          [StatKey.CD, 0.2268],
          [StatKey.EHR, 0.03456],
          [StatKey.ATK, 352.8],
        ],
        weightScore: 0,
        substats: [],
        ageIndex: 0,
        initialRolls: 0,
        augmentedStats: {} as AugmentedStats,
      },
    ],
    Body: [
      {
        part: 'Body',
        set: 'Hunter of Glacial Forest',
        enhance: 15,
        grade: 5,
        main: {
          stat: Stats.CD,
          value: 64.8,
        },
        id: 'b3376a19-62f9-489e-80e6-8f98335af158',
        equippedBy: '1212',
        condensedStats: [
          [StatKey.HP, 114.31138],
          [StatKey.ATK_P, 0.07344],
          [StatKey.DEF_P, 0.0432],
          [StatKey.CR, 0.081],
          [StatKey.CD, 0.648],
        ],
        weightScore: 0,
        substats: [],
        ageIndex: 0,
        initialRolls: 0,
        augmentedStats: {} as AugmentedStats,
      },
    ],
    Feet: [
      {
        part: 'Feet',
        set: 'Hunter of Glacial Forest',
        enhance: 15,
        grade: 5,
        main: {
          stat: Stats.SPD,
          value: 25.032,
        },
        id: '92c53d06-80d0-43a8-b896-2feeda419674',
        equippedBy: '1212',
        condensedStats: [
          [StatKey.ATK, 21.16877],
          [StatKey.ATK_P, 0.11664],
          [StatKey.DEF_P, 0.0486],
          [StatKey.CD, 0.17496],
          [StatKey.SPD, 25.032],
        ],
        weightScore: 0,
        substats: [],
        ageIndex: 0,
        initialRolls: 0,
        augmentedStats: {} as AugmentedStats,
      },
    ],
    PlanarSphere: [
      {
        part: 'PlanarSphere',
        set: 'Rutilant Arena',
        enhance: 15,
        grade: 5,
        main: {
          stat: Stats.Ice_DMG,
          value: 38.8803,
        },
        id: '80abbd56-b1a0-4587-a349-754c33627217',
        equippedBy: '1212',
        condensedStats: [
          [StatKey.DEF, 74.09071],
          [StatKey.CR, 0.05508],
          [StatKey.CD, 0.12312],
          [StatKey.EHR, 0.0432],
          [StatKey.ICE_DMG_BOOST, 0.388803],
        ],
        weightScore: 0,
        substats: [],
        ageIndex: 0,
        initialRolls: 0,
        augmentedStats: {} as AugmentedStats,
      },
    ],
    LinkRope: [
      {
        part: 'LinkRope',
        set: 'Rutilant Arena',
        enhance: 15,
        grade: 5,
        main: {
          stat: Stats.ATK_P,
          value: 43.2,
        },
        id: 'c521dc03-6c6e-45ef-9933-811367312441',
        equippedBy: '1212',
        condensedStats: [
          [StatKey.HP, 80.44134],
          [StatKey.CR, 0.08424],
          [StatKey.CD, 0.10368],
          [StatKey.BE, 0.05832],
          [StatKey.ATK_P, 0.43200000000000005],
        ],
        weightScore: 0,
        substats: [],
        ageIndex: 0,
        initialRolls: 0,
        augmentedStats: {} as AugmentedStats,
      },
    ],
  } as RelicsByPart

  return uncondenseRelics(condensedRelics)
}
