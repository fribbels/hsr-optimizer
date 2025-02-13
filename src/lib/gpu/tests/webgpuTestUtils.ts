import { COMPUTE_ENGINE_GPU_STABLE, SetsOrnaments, SetsRelics, Stats } from 'lib/constants/constants'
import { WebgpuTest } from 'lib/gpu/tests/webgpuTestGenerator'
import { debugWebgpuComputedStats } from 'lib/gpu/webgpuDebugger'
import { destroyPipeline, generateExecutionPass, initializeGpuPipeline } from 'lib/gpu/webgpuInternals'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import { ComputedStatsObjectExternal, Key, KeyToStat } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { SortOption } from 'lib/optimization/sortOptions'
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

  const gpuComputedStats: ComputedStatsObjectExternal = debugWebgpuComputedStats(array)
  // @ts-ignore
  const x = calculateBuild(request, {
    Head: relics.Head[0],
    Hands: relics.Hands[0],
    Body: relics.Body[0],
    Feet: relics.Feet[0],
    PlanarSphere: relics.PlanarSphere[0],
    LinkRope: relics.LinkRope[0],
  })
  const cpuComputedStats = x.toComputedStatsObject()
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
  cpu: string
  gpu: string
  deltaValue: number
  deltaString: string
  precision: number
  pass: boolean
}

function deltaComputedStats(cpu: ComputedStatsObjectExternal, gpu: ComputedStatsObjectExternal): StatDeltaAnalysis {
  const statDeltas: StatDeltas = {}
  let allPass = true

  function analyze(stat: keyof ComputedStatsObjectExternal, precision: number) {
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

  analyze('HP%', P_2)
  analyze('ATK%', P_2)
  analyze('DEF%', P_2)
  analyze('SPD%', P_2)
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
  // GPU handles DMG boosts differently
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
  analyze('BREAK_BOOST', P_2)
  analyze('ADDITIONAL_BOOST', P_2)
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
  analyze('BASIC_DMG', P_0)
  analyze('SKILL_DMG', P_0)
  analyze('ULT_DMG', P_0)
  analyze('FUA_DMG', P_0)
  analyze('DOT_DMG', P_0)
  analyze('BREAK_DMG', P_0)
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
  analyze('BASIC_TOUGHNESS_DMG', P_2)
  analyze('SKILL_TOUGHNESS_DMG', P_2)
  analyze('ULT_TOUGHNESS_DMG', P_2)
  analyze('FUA_TOUGHNESS_DMG', P_2)
  analyze('TRUE_DMG_MODIFIER', P_2)
  analyze('BASIC_FINAL_DMG_BOOST', P_2)
  analyze('SKILL_FINAL_DMG_BOOST', P_2)
  analyze('ULT_FINAL_DMG_BOOST', P_2)
  analyze('BASIC_BREAK_DMG_MODIFIER', P_2)
  analyze('ULT_ADDITIONAL_DMG_CR_OVERRIDE', P_2)
  analyze('ULT_ADDITIONAL_DMG_CD_OVERRIDE', P_2)
  analyze('SKILL_OHB', P_2)
  analyze('ULT_OHB', P_2)
  analyze('HEAL_TYPE', P_2)
  analyze('HEAL_FLAT', P_2)
  analyze('HEAL_SCALING', P_2)
  analyze('HEAL_VALUE', P_2)
  analyze('SHIELD_FLAT', P_2)
  analyze('SHIELD_SCALING', P_2)
  analyze('SHIELD_VALUE', P_2)
  analyze('BASIC_ADDITIONAL_DMG_SCALING', P_2)
  analyze('SKILL_ADDITIONAL_DMG_SCALING', P_2)
  analyze('ULT_ADDITIONAL_DMG_SCALING', P_2)
  analyze('FUA_ADDITIONAL_DMG_SCALING', P_2)
  analyze('BASIC_ADDITIONAL_DMG', P_2)
  analyze('SKILL_ADDITIONAL_DMG', P_2)
  analyze('ULT_ADDITIONAL_DMG', P_2)
  analyze('FUA_ADDITIONAL_DMG', P_2)
  analyze('MEMO_BUFF_PRIORITY', P_2)
  analyze('DEPRIORITIZE_BUFFS', P_2)
  analyze('MEMO_BASE_HP_SCALING', P_2)
  analyze('MEMO_BASE_HP_FLAT', P_2)
  analyze('MEMO_BASE_DEF_SCALING', P_2)
  analyze('MEMO_BASE_DEF_FLAT', P_2)
  analyze('MEMO_BASE_ATK_SCALING', P_2)
  analyze('MEMO_BASE_ATK_FLAT', P_2)
  analyze('MEMO_BASE_SPD_SCALING', P_2)
  analyze('MEMO_BASE_SPD_FLAT', P_2)
  analyze('MEMO_SKILL_SCALING', P_2)
  analyze('MEMO_TALENT_SCALING', P_2)
  analyze('MEMO_SKILL_DMG', P_2)
  analyze('MEMO_TALENT_DMG', P_2)
  analyze('UNCONVERTIBLE_HP_BUFF', P_2)
  analyze('UNCONVERTIBLE_ATK_BUFF', P_2)
  analyze('UNCONVERTIBLE_DEF_BUFF', P_2)
  analyze('UNCONVERTIBLE_SPD_BUFF', P_2)
  analyze('UNCONVERTIBLE_CR_BUFF', P_2)
  analyze('UNCONVERTIBLE_CD_BUFF', P_2)
  analyze('UNCONVERTIBLE_EHR_BUFF', P_2)
  analyze('UNCONVERTIBLE_BE_BUFF', P_2)
  analyze('UNCONVERTIBLE_OHB_BUFF', P_2)
  analyze('UNCONVERTIBLE_RES_BUFF', P_2)
  analyze('UNCONVERTIBLE_ERR_BUFF', P_2)
  analyze('BREAK_EFFICIENCY_BOOST', P_2)
  analyze('BASIC_BREAK_EFFICIENCY_BOOST', P_2)
  analyze('ULT_BREAK_EFFICIENCY_BOOST', P_2)
  analyze('BASIC_DMG_TYPE', EXACT)
  analyze('SKILL_DMG_TYPE', EXACT)
  analyze('ULT_DMG_TYPE', EXACT)
  analyze('FUA_DMG_TYPE', EXACT)
  analyze('DOT_DMG_TYPE', EXACT)
  analyze('BREAK_DMG_TYPE', EXACT)
  analyze('SUPER_BREAK_DMG_TYPE', EXACT)
  analyze('MEMO_DMG_TYPE', EXACT)
  analyze('ADDITIONAL_DMG_TYPE', EXACT)

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
