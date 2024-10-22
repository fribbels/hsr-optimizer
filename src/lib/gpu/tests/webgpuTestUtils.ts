import { Form } from 'types/Form'
import { COMPUTE_ENGINE_GPU_EXPERIMENTAL, SetsOrnaments, SetsRelics } from 'lib/constants'
import { destroyPipeline, generateExecutionPass, initializeGpuPipeline } from 'lib/gpu/webgpuInternals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { debugWebgpuComputedStats } from 'lib/gpu/webgpuDebugger'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { WebgpuTest } from 'lib/gpu/tests/webgpuTestGenerator'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { generateContext } from 'lib/optimizer/context/calculateContext'
import { SortOption } from 'lib/optimizer/sortOptions'

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
    COMPUTE_ENGINE_GPU_EXPERIMENTAL,
    relicSetSolutions,
    ornamentSetSolutions,
    true,
  )

  const gpuReadBuffer = generateExecutionPass(gpuContext, 0)
  await gpuReadBuffer.mapAsync(GPUMapMode.READ)
  const arrayBuffer = gpuReadBuffer.getMappedRange()
  const array = new Float32Array(arrayBuffer)

  const gpuComputedStats: ComputedStatsObject = debugWebgpuComputedStats(array)
  // @ts-ignore
  const cpuComputedStats: ComputedStatsObject = calculateBuild(request, {
    Head: relics.Head[0],
    Hands: relics.Hands[0],
    Body: relics.Body[0],
    Feet: relics.Feet[0],
    PlanarSphere: relics.PlanarSphere[0],
    LinkRope: relics.LinkRope[0],
  }).x

  const deltas = deltaComputedStats(cpuComputedStats, gpuComputedStats)

  // console.log('CPU', cpuComputedStats)
  // console.log('GPU', gpuComputedStats)

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
  cpu: number
  gpu: number
  deltaValue: number
  deltaString: string
  precision: number
  pass: boolean
}

function deltaComputedStats(cpu: ComputedStatsObject, gpu: ComputedStatsObject): StatDeltaAnalysis {
  const statDeltas: StatDeltas = {}
  let allPass = true

  function analyze(stat: string, precision: number) {
    const delta = cpu[stat] - gpu[stat]
    const pass = Math.abs(delta) <= precision
    if (!pass) {
      allPass = false
    }

    statDeltas[stat] = {
      key: stat,
      cpu: cpu[stat].toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      gpu: gpu[stat].toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      deltaValue: delta,
      deltaString: delta.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
      precision: precision,
      pass: pass,
    }
  }

  const EXACT = 0
  const P_0 = 1
  const P_1 = 0.1
  const P_2 = 0.01
  const P_3 = 0.001
  const P_4 = 0.0001
  const P_5 = 0.00001
  const P_6 = 0.000001

  analyze('HP', P_2)
  analyze('ATK', P_2)
  analyze('DEF', P_2)
  analyze('SPD', P_4)
  analyze('CRIT Rate', P_4)
  analyze('CRIT DMG', P_4)
  analyze('Effect Hit Rate', P_4)
  analyze('Effect RES', P_4)
  analyze('Break Effect', P_4)
  analyze('Energy Regeneration Rate', P_4)
  analyze('Outgoing Healing Boost', P_4)
  // analyze('Physical DMG Boost', P_2)
  // analyze('Fire DMG Boost', P_2)
  // analyze('Ice DMG Boost', P_2)
  // analyze('Lightning DMG Boost', P_2)
  // analyze('Wind DMG Boost', P_2)
  // analyze('Quantum DMG Boost', P_2)
  // analyze('Imaginary DMG Boost', P_2)
  analyze('ELEMENTAL_DMG', P_4)
  analyze('BASIC_SCALING', P_2)
  analyze('SKILL_SCALING', P_2)
  analyze('ULT_SCALING', P_2)
  analyze('FUA_SCALING', P_2)
  analyze('DOT_SCALING', P_2)
  analyze('BASIC_CR_BOOST', P_2)
  analyze('SKILL_CR_BOOST', P_2)
  analyze('ULT_CR_BOOST', P_2)
  analyze('FUA_CR_BOOST', P_2)
  analyze('BASIC_CD_BOOST', P_2)
  analyze('SKILL_CD_BOOST', P_2)
  analyze('ULT_CD_BOOST', P_2)
  analyze('FUA_CD_BOOST', P_2)
  analyze('BASIC_BOOST', P_2)
  analyze('SKILL_BOOST', P_2)
  analyze('ULT_BOOST', P_2)
  analyze('FUA_BOOST', P_2)
  analyze('DOT_BOOST', P_2)
  analyze('VULNERABILITY', P_2)
  analyze('BASIC_VULNERABILITY', P_2)
  analyze('SKILL_VULNERABILITY', P_2)
  analyze('ULT_VULNERABILITY', P_2)
  analyze('FUA_VULNERABILITY', P_2)
  analyze('DOT_VULNERABILITY', P_2)
  analyze('BREAK_VULNERABILITY', P_2)
  analyze('DEF_PEN', P_2)
  analyze('BASIC_DEF_PEN', P_2)
  analyze('SKILL_DEF_PEN', P_2)
  analyze('ULT_DEF_PEN', P_2)
  analyze('FUA_DEF_PEN', P_2)
  analyze('DOT_DEF_PEN', P_2)
  analyze('BREAK_DEF_PEN', P_2)
  analyze('SUPER_BREAK_DEF_PEN', P_2)
  analyze('RES_PEN', P_2)
  analyze('PHYSICAL_RES_PEN', P_2)
  analyze('FIRE_RES_PEN', P_2)
  analyze('ICE_RES_PEN', P_2)
  analyze('LIGHTNING_RES_PEN', P_2)
  analyze('WIND_RES_PEN', P_2)
  analyze('QUANTUM_RES_PEN', P_2)
  analyze('IMAGINARY_RES_PEN', P_2)
  analyze('BASIC_RES_PEN', P_2)
  analyze('SKILL_RES_PEN', P_2)
  analyze('ULT_RES_PEN', P_2)
  analyze('FUA_RES_PEN', P_2)
  analyze('DOT_RES_PEN', P_2)
  analyze('BASIC_DMG', P_1)
  analyze('SKILL_DMG', P_1)
  analyze('ULT_DMG', P_1)
  analyze('FUA_DMG', P_1)
  analyze('DOT_DMG', P_1)
  analyze('BREAK_DMG', P_1)
  analyze('COMBO_DMG', P_0)
  analyze('DMG_RED_MULTI', P_2)
  analyze('EHP', P_2)
  analyze('DOT_CHANCE', P_2)
  analyze('EFFECT_RES_PEN', P_2)
  analyze('DOT_SPLIT', P_2)
  analyze('DOT_STACKS', P_2)
  analyze('SUMMONS', P_2)
  analyze('ENEMY_WEAKNESS_BROKEN', P_2)
  analyze('SUPER_BREAK_MODIFIER', P_2)
  analyze('BASIC_SUPER_BREAK_MODIFIER', P_2)
  analyze('SUPER_BREAK_HMC_MODIFIER', P_2)
  analyze('BASIC_TOUGHNESS_DMG', P_2)
  analyze('SKILL_TOUGHNESS_DMG', P_2)
  analyze('ULT_TOUGHNESS_DMG', P_2)
  analyze('FUA_TOUGHNESS_DMG', P_2)
  analyze('BASIC_ORIGINAL_DMG_BOOST', P_2)
  analyze('SKILL_ORIGINAL_DMG_BOOST', P_2)
  analyze('ULT_ORIGINAL_DMG_BOOST', P_2)
  analyze('BASIC_BREAK_DMG_MODIFIER', P_2)
  analyze('ULT_CD_OVERRIDE', P_2)
  analyze('ULT_BOOSTS_MULTI', P_2)
  analyze('RATIO_BASED_HP_BUFF', P_2)
  analyze('RATIO_BASED_HP_P_BUFF', P_2)
  analyze('RATIO_BASED_ATK_BUFF', P_2)
  analyze('RATIO_BASED_ATK_P_BUFF', P_2)
  analyze('RATIO_BASED_DEF_BUFF', P_2)
  analyze('RATIO_BASED_DEF_P_BUFF', P_2)
  analyze('RATIO_BASED_SPD_BUFF', P_2)
  analyze('RATIO_BASED_CD_BUFF', P_2)
  analyze('BREAK_EFFICIENCY_BOOST', P_2)
  analyze('BASIC_BREAK_EFFICIENCY_BOOST', P_2)
  analyze('ULT_BREAK_EFFICIENCY_BOOST', P_2)
  analyze('HP%', P_2)
  analyze('ATK%', P_2)
  analyze('DEF%', P_2)
  analyze('SPD%', P_2)
  analyze('BASIC_DMG_TYPE', EXACT)
  analyze('SKILL_DMG_TYPE', EXACT)
  analyze('ULT_DMG_TYPE', EXACT)
  analyze('FUA_DMG_TYPE', EXACT)
  analyze('DOT_DMG_TYPE', EXACT)
  analyze('BREAK_DMG_TYPE', EXACT)
  analyze('SUPER_BREAK_DMG_TYPE', EXACT)

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
  test.execute = () => {
    const promise = runTestRequest(request, relics, device)
    void promise.then((result) => {
      test.done = true
      test.result = result
    })

    return promise
  }

  return test as WebgpuTest
}

export function uncondenseRelics(relicsByPart: RelicsByPart) {
  for (const [key, relics] of Object.entries(relicsByPart)) {
    relics.map((relic) => {
      const condensedStats = relic.condensedStats!
      relic.substats = []
      condensedStats.map(([stat, value]) => {
        relic.substats.push({
          stat,
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
          stat: 'HP',
          value: 705.6,
        },
        id: 'cd85c14c-a662-4413-a149-a379e6d538d3',
        equippedBy: '1212',
        condensedStats: [
          ['CRIT Rate', 0.11016 + 0.25],
          ['CRIT DMG', 0.10368],
          ['Effect RES', 0.03456],
          ['Break Effect', 0.05184],
          ['HP', 705.6],
        ],
      },
    ],
    Hands: [
      {
        part: 'Hands',
        set: 'Hunter of Glacial Forest',
        enhance: 15,
        grade: 5,
        main: {
          stat: 'ATK',
          value: 352.8,
        },
        id: '798657c8-5c5c-4b44-9c5f-f5f094414289',
        equippedBy: '1212',
        condensedStats: [
          ['HP%', 0.03456],
          ['SPD', 4],
          ['CRIT DMG', 0.2268],
          ['Effect Hit Rate', 0.03456],
          ['ATK', 352.8],
        ],
      },
    ],
    Body: [
      {
        part: 'Body',
        set: 'Hunter of Glacial Forest',
        enhance: 15,
        grade: 5,
        main: {
          stat: 'CRIT DMG',
          value: 64.8,
        },
        id: 'b3376a19-62f9-489e-80e6-8f98335af158',
        equippedBy: '1212',
        condensedStats: [
          ['HP', 114.31138],
          ['ATK%', 0.07344],
          ['DEF%', 0.0432],
          ['CRIT Rate', 0.081],
          ['CRIT DMG', 0.648],
        ],
      },
    ],
    Feet: [
      {
        part: 'Feet',
        set: 'Hunter of Glacial Forest',
        enhance: 15,
        grade: 5,
        main: {
          stat: 'SPD',
          value: 25.032,
        },
        id: '92c53d06-80d0-43a8-b896-2feeda419674',
        equippedBy: '1212',
        condensedStats: [
          ['ATK', 21.16877],
          ['ATK%', 0.11664],
          ['DEF%', 0.0486],
          ['CRIT DMG', 0.17496],
          ['SPD', 25.032],
        ],
      },
    ],
    PlanarSphere: [
      {
        part: 'PlanarSphere',
        set: 'Rutilant Arena',
        enhance: 15,
        grade: 5,
        main: {
          stat: 'Ice DMG Boost',
          value: 38.8803,
        },
        id: '80abbd56-b1a0-4587-a349-754c33627217',
        equippedBy: '1212',
        condensedStats: [
          ['DEF', 74.09071],
          ['CRIT Rate', 0.05508],
          ['CRIT DMG', 0.12312],
          ['Effect Hit Rate', 0.0432],
          ['Ice DMG Boost', 0.388803],
        ],
      },
    ],
    LinkRope: [
      {
        part: 'LinkRope',
        set: 'Rutilant Arena',
        enhance: 15,
        grade: 5,
        main: {
          stat: 'ATK%',
          value: 43.2,
        },
        id: 'c521dc03-6c6e-45ef-9933-811367312441',
        equippedBy: '1212',
        condensedStats: [
          ['HP', 80.44134],
          ['CRIT Rate', 0.08424],
          ['CRIT DMG', 0.10368],
          ['Break Effect', 0.05832],
          ['ATK%', 0.43200000000000005],
        ],
      },
    ],
  } as RelicsByPart

  return uncondenseRelics(condensedRelics)
}
