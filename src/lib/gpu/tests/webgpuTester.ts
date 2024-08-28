import { getDefaultForm } from 'lib/defaultForm'
import { Form } from 'types/Form'
import { generateParams } from 'lib/optimizer/calculateParams'
import { SetsOrnaments, SetsRelics } from 'lib/constants'
import { generateExecutionPass, getDevice, initializeGpuPipeline } from 'lib/gpu/webgpuInternals'
import { debugWebgpuComputedStats, WebgpuComputedStats } from 'lib/gpu/webgpuDebugger'
import { RelicsByPart } from 'lib/gpu/webgpuDataTransform'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export type WebgpuTest = {
  name: string
  promise: Promise<WebgpuComputedStats>
  result: WebgpuComputedStats
  expected: WebgpuComputedStats
  passed: boolean
  waiting: boolean
}

export async function runTests(device: GPUDevice) {
  const request = OptimizerTabController.fixForm(getDefaultForm({
    id: '1212',
  })) as Form

  console.debug(request)

  const params = generateParams(request)
  const relics = generateTestRelics()
  const relicSetSolutions = new Array<number>(Math.pow(Object.keys(SetsRelics).length, 4)).fill(1)
  const ornamentSetSolutions = new Array<number>(Math.pow(Object.keys(SetsOrnaments).length, 2)).fill(1)
  const permutations = 1
  uncondenseRelics(relics)

  const gpuContext = initializeGpuPipeline(
    device,
    relics,
    request,
    params,
    permutations,
    relicSetSolutions,
    ornamentSetSolutions,
    true,
  )

  const gpuReadBuffer = generateExecutionPass(gpuContext, 0)
  await gpuReadBuffer.mapAsync(GPUMapMode.READ)
  const arrayBuffer = gpuReadBuffer.getMappedRange()
  const array = new Float32Array(arrayBuffer)

  const cpuComputedStats = calculateBuild(request, {
    Head: relics.Head[0],
    Hands: relics.Hands[0],
    Body: relics.Body[0],
    Feet: relics.Feet[0],
    PlanarSphere: relics.PlanarSphere[0],
    LinkRope: relics.LinkRope[0],
  }).x

  const gpuComputedStats: WebgpuComputedStats = debugWebgpuComputedStats(array)

  console.log('CPU', cpuComputedStats)
  console.log('GPU', gpuComputedStats)

  return gpuComputedStats
}

function deltaComputedStats(c1: ComputedStatsObject, c2: ComputedStatsObject) {
  const deltas = {}
  for (const [key, value] of Object.entries(c1)) {
    if (typeof value === 'number') {
      deltas[key] = Math.abs(c1[key] - c2[key])
    }
  }

  return deltas as ComputedStatsObject
}

export async function generateTests() {
  const device = await getDevice()
  if (!device) return []

  return [
    test1(device),
    test2(device),
  ]
}

function test1(device: GPUDevice): WebgpuTest {
  const test: Partial<WebgpuTest> = {
    name: '1',
    waiting: true,
  }
  test.promise = runTests(device)
  test.promise.then((x) => {
    test.waiting = false
    test.result = x
  })

  return test as WebgpuTest
}

function test2(device: GPUDevice): WebgpuTest {
  const test: Partial<WebgpuTest> = {
    name: '2',
    waiting: true,
  }
  test.promise = runTests(device)
  test.promise.then((x) => {
    test.waiting = false
    test.result = x
  })

  return test as WebgpuTest
}

function uncondenseRelics(relicsByPart: RelicsByPart) {
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
}

function generateTestRelics() {
  return {
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
        weightScore: 42.767999999999994,
        condensedStats: [
          ['CRIT Rate', 0.11016],
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
        weightScore: 43.416,
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
        weightScore: 38.370734301091446,
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
        weightScore: 43.16174737167594,
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
        weightScore: 38.971971552257266,
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
        weightScore: 37.249627764127766,
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
}
