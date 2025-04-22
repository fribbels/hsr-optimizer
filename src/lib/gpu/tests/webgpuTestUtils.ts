import { COMPUTE_ENGINE_GPU_STABLE, SetsOrnaments, SetsRelics, Stats } from 'lib/constants/constants'
import { WebgpuTest } from 'lib/gpu/tests/webgpuTestGenerator'
import { destroyPipeline, generateExecutionPass, initializeGpuPipeline } from 'lib/gpu/webgpuInternals'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { Key, KeyToStat } from 'lib/optimization/computedStatsArray'
import { baseComputedStatsObject } from 'lib/optimization/config/computedStatsConfig'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { SortOption } from 'lib/optimization/sortOptions'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import { SimulationRelicByPart } from 'lib/simulations/statSimulationTypes'
import { Form } from 'types/form'

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

  // @ts-ignore

  const relicsByPart = {
    Head: relics.Head[0],
    Hands: relics.Hands[0],
    Body: relics.Body[0],
    Feet: relics.Feet[0],
    PlanarSphere: relics.PlanarSphere[0],
    LinkRope: relics.LinkRope[0],
  }
  const x = simulateBuild(relicsByPart as unknown as SimulationRelicByPart, context, null, null)
  const deltas = arrayDelta(x.a, array)

  gpuReadBuffer.unmap()
  gpuReadBuffer.destroy()
  destroyPipeline(gpuContext)

  return deltas
}

export type StatDeltaAnalysis = {
  allPass: boolean
  statDeltas: StatDeltas
}

export type StatDeltas = {
  [key: string]: StatDelta
}

export type StatDelta = {
  key: string
  cpu: string
  gpu: string
  deltaValue: number
  deltaString: string
  precision: number
  pass: boolean
}

const EXACT = 0
const P_0 = 1
const P_1 = 0.1
const P_2 = 0.01
const P_3 = 0.001
const P_4 = 0.0001
const P_5 = 0.00001
const P_6 = 0.000001

const ignoredStats = {
  [Key.BASE_ATK]: true,
  [Key.BASE_DEF]: true,
  [Key.BASE_HP]: true,
  [Key.BASE_SPD]: true,
  [Key.PHYSICAL_DMG_BOOST]: true,
  [Key.FIRE_DMG_BOOST]: true,
  [Key.ICE_DMG_BOOST]: true,
  [Key.LIGHTNING_DMG_BOOST]: true,
  [Key.WIND_DMG_BOOST]: true,
  [Key.IMAGINARY_DMG_BOOST]: true,
  [Key.QUANTUM_DMG_BOOST]: true,
}

const overridePrecision = {
  [Key.BASIC_DMG]: P_0,
  [Key.SKILL_DMG]: P_0,
  [Key.ULT_DMG]: P_0,
  [Key.FUA_DMG]: P_0,
  [Key.DOT_DMG]: P_0,
  [Key.BREAK_DMG]: P_0,
  [Key.MEMO_SKILL_DMG]: P_0,
  [Key.MEMO_TALENT_DMG]: P_0,
  [Key.COMBO_DMG]: P_0,

  [Key.HEAL_VALUE]: P_2,
  [Key.SHIELD_VALUE]: P_2,

  [Key.HP]: P_2,
  [Key.ATK]: P_2,
  [Key.DEF]: P_2,
  [Key.EHP]: P_2,

  [Key.UNCONVERTIBLE_HP_BUFF]: P_2,
  [Key.UNCONVERTIBLE_ATK_BUFF]: P_2,
  [Key.UNCONVERTIBLE_DEF_BUFF]: P_2,

  [Key.BASIC_ADDITIONAL_DMG]: P_2,
  [Key.SKILL_ADDITIONAL_DMG]: P_2,
  [Key.ULT_ADDITIONAL_DMG]: P_2,
  [Key.FUA_ADDITIONAL_DMG]: P_2,
  [Key.DOT_ADDITIONAL_DMG]: P_2,
  [Key.BREAK_ADDITIONAL_DMG]: P_2,
  [Key.MEMO_SKILL_ADDITIONAL_DMG]: P_2,
  [Key.MEMO_TALENT_ADDITIONAL_DMG]: P_2,
}

function arrayDelta(cpu: Float32Array, gpu: Float32Array) {
  const statDeltas: StatDeltas = {}
  let allPass = true

  // console.log(cpu)
  // console.log(gpu)

  const keys = Object.keys(baseComputedStatsObject)

  function analyze(key: number, precision: number) {
    const delta = cpu[key] - gpu[key]
    const pass = Math.abs(delta) <= precision
    if (!pass) {
      allPass = false
    }

    const stat = keys[key]

    statDeltas[stat] = {
      key: stat,
      cpu: cpu[key].toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      gpu: gpu[key].toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      deltaValue: delta,
      deltaString: delta.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      precision: precision,
      pass: pass,
    }
  }

  for (let i = 0; i < Object.keys(baseComputedStatsObject).length; i++) {
    if (ignoredStats[i]) continue
    const precision = overridePrecision[i] ?? P_4
    analyze(i, precision)
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
          // @ts-ignore
          stat: KeyToStat[key],
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
          [Key.CR, 0.11016 + 0.25],
          [Key.CD, 0.10368],
          [Key.RES, 0.03456],
          [Key.BE, 0.05184],
          [Key.HP, 705.6],
        ],
        weightScore: 0,
        substats: [],
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
          [Key.HP_P, 0.03456],
          [Key.SPD, 4],
          [Key.CD, 0.2268],
          [Key.EHR, 0.03456],
          [Key.ATK, 352.8],
        ],
        weightScore: 0,
        substats: [],
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
          [Key.HP, 114.31138],
          [Key.ATK_P, 0.07344],
          [Key.DEF_P, 0.0432],
          [Key.CR, 0.081],
          [Key.CD, 0.648],
        ],
        weightScore: 0,
        substats: [],
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
          [Key.ATK, 21.16877],
          [Key.ATK_P, 0.11664],
          [Key.DEF_P, 0.0486],
          [Key.CD, 0.17496],
          [Key.SPD, 25.032],
        ],
        weightScore: 0,
        substats: [],
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
          [Key.DEF, 74.09071],
          [Key.CR, 0.05508],
          [Key.CD, 0.12312],
          [Key.EHR, 0.0432],
          [Key.ICE_DMG_BOOST, 0.388803],
        ],
        weightScore: 0,
        substats: [],
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
          [Key.HP, 80.44134],
          [Key.CR, 0.08424],
          [Key.CD, 0.10368],
          [Key.BE, 0.05832],
          [Key.ATK_P, 0.43200000000000005],
        ],
        weightScore: 0,
        substats: [],
      },
    ],
  } as RelicsByPart

  return uncondenseRelics(condensedRelics)
}
