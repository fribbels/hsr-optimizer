import { Constants } from 'lib/constants/constants'
import { injectComputedStats } from 'lib/gpu/injection/injectComputedStats'
import { generateDynamicConditionals } from 'lib/gpu/injection/injectConditionals'
import { injectSettings } from 'lib/gpu/injection/injectSettings'
import { injectUnrolledActions } from 'lib/gpu/injection/injectUnrolledActions'
import { generateSetBitConstants } from 'lib/gpu/injection/setIndexMap'
import { indent } from 'lib/gpu/injection/wgslUtils'
import {
  GpuConstants,
  RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import computeShader from 'lib/gpu/wgsl/computeShader.wgsl?raw'
import structs from 'lib/gpu/wgsl/structs.wgsl?raw'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { Form } from 'types/form'
import {
  OptimizerContext,
  ShaderVariables,
} from 'types/optimizer'

export function generateShaderVariables(context: OptimizerContext, request: Form, gpuParams: GpuConstants) {
  // All sort options need all actions generated for proper stat computation
  const actionLength = context.defaultActions.length + context.rotationActions.length

  // EHP is needed for filtering, sorting, or debug mode
  const needsEhpFilter = request.minEhp > 0 || request.maxEhp < Constants.MAX_INT
  const needsEhpSort = request.resultSort === SortOption.EHP.key
  const needsEhp = needsEhpFilter || needsEhpSort || gpuParams.DEBUG

  const shaderVariables: ShaderVariables = {
    actionLength,
    needsEhp,
  }

  return shaderVariables
}

export function generateWgsl(context: OptimizerContext, request: Form, relics: RelicsByPart, gpuParams: GpuConstants) {
  let wgsl = ''

  context.shaderVariables = generateShaderVariables(context, request, gpuParams)

  wgsl = injectSettings(wgsl, context, request, relics)
  wgsl = injectComputeShader(wgsl)
  wgsl = injectUnrolledActions(wgsl, request, context, gpuParams)
  wgsl = injectConditionalsNew(wgsl, request, context, gpuParams)
  wgsl = injectGpuParams(wgsl, request, context, gpuParams)
  wgsl = injectBasicFilters(wgsl, request, context, gpuParams)
  wgsl = injectSetFilters(wgsl, request, gpuParams)
  wgsl = injectComputedStats(wgsl, gpuParams)

  return wgsl
}

function injectConditionalsNew(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const actionLength = context.shaderVariables.actionLength
  const containerLength = context.maxContainerArrayLength
  const calculationsPerAction = containerLength / Object.values(newStatsConfig).length

  const statsLength = Object.values(newStatsConfig).length

  // Generate precomputed stats buffer data
  const precomputedStatsData = new Float32Array(actionLength * containerLength)

  for (let i = 0; i < actionLength; i++) {
    const action = i < context.defaultActions.length
      ? context.defaultActions[i]
      : context.rotationActions[i - context.defaultActions.length]

    const offset = i * containerLength
    // Copy full container (stats + registers)
    precomputedStatsData.set(action.precomputedStats.a.subarray(0, containerLength), offset)
  }

  // Store for later use in pipeline creation
  context.precomputedStatsData = precomputedStatsData

  // Buffer declaration
  const bufferDeclaration = `
@group(1) @binding(3) var<uniform> precomputedStats : array<array<f32, ${containerLength}>, ${actionLength}>;
`

  let actionsDefinition = `
const actionCount = ${actionLength};
const calculationsPerAction = ${calculationsPerAction};
const maxEntitiesCount = ${context.maxEntitiesCount};
const maxHitsCount = ${context.maxHitsCount};
const statsLength = ${statsLength};
`

  for (let i = 0; i < actionLength; i++) {
    const action = i < context.defaultActions.length ? context.defaultActions[i] : context.rotationActions[i - context.defaultActions.length]

    actionsDefinition += `
const action${i} = Action( // ${action.actionIndex} ${action.actionName}
  0,
  SetConditionals(
    ${action.setConditionals.enabledHunterOfGlacialForest},${gpuParams.DEBUG ? ' // enabledHunterOfGlacialForest' : ''}
    ${action.setConditionals.enabledFiresmithOfLavaForging},${gpuParams.DEBUG ? ' // enabledFiresmithOfLavaForging' : ''}
    ${action.setConditionals.enabledGeniusOfBrilliantStars},${gpuParams.DEBUG ? ' // enabledGeniusOfBrilliantStars' : ''}
    ${action.setConditionals.enabledBandOfSizzlingThunder},${gpuParams.DEBUG ? ' // enabledBandOfSizzlingThunder' : ''}
    ${action.setConditionals.enabledMessengerTraversingHackerspace},${gpuParams.DEBUG ? ' // enabledMessengerTraversingHackerspace' : ''}
    ${action.setConditionals.enabledCelestialDifferentiator},${gpuParams.DEBUG ? ' // enabledCelestialDifferentiator' : ''}
    ${action.setConditionals.enabledWatchmakerMasterOfDreamMachinations},${gpuParams.DEBUG ? ' // enabledWatchmakerMasterOfDreamMachinations' : ''}
    ${action.setConditionals.enabledPenaconyLandOfTheDreams},${gpuParams.DEBUG ? ' // enabledPenaconyLandOfTheDreams' : ''}
    ${action.setConditionals.enabledIzumoGenseiAndTakamaDivineRealm},${gpuParams.DEBUG ? ' // enabledIzumoGenseiAndTakamaDivineRealm' : ''}
    ${action.setConditionals.enabledForgeOfTheKalpagniLantern},${gpuParams.DEBUG ? ' // enabledForgeOfTheKalpagniLantern' : ''}
    ${action.setConditionals.enabledTheWindSoaringValorous},${gpuParams.DEBUG ? ' // enabledTheWindSoaringValorous' : ''}
    ${action.setConditionals.enabledTheWondrousBananAmusementPark},${gpuParams.DEBUG ? ' // enabledTheWondrousBananAmusementPark' : ''}
    ${action.setConditionals.enabledScholarLostInErudition},${gpuParams.DEBUG ? ' // enabledScholarLostInErudition' : ''}
    ${action.setConditionals.enabledHeroOfTriumphantSong},${gpuParams.DEBUG ? ' // enabledHeroOfTriumphantSong' : ''}
    ${action.setConditionals.enabledWarriorGoddessOfSunAndThunder},${gpuParams.DEBUG ? ' // enabledWarriorGoddessOfSunAndThunder' : ''}
    ${action.setConditionals.enabledWavestriderCaptain},${gpuParams.DEBUG ? ' // enabledWavestriderCaptain' : ''}
    ${action.setConditionals.enabledWorldRemakingDeliverer},${gpuParams.DEBUG ? ' // enabledWorldRemakingDeliverer' : ''}
    ${action.setConditionals.enabledSelfEnshroudedRecluse},${gpuParams.DEBUG ? ' // enabledSelfEnshroudedRecluse' : ''}
    ${action.setConditionals.enabledDivinerOfDistantReach},${gpuParams.DEBUG ? ' // enabledDivinerOfDistantReach' : ''}
    ${action.setConditionals.enabledAmphoreusTheEternalLand},${gpuParams.DEBUG ? ' // enabledAmphoreusTheEternalLand' : ''}
    ${action.setConditionals.enabledTengokuLivestream},${gpuParams.DEBUG ? ' // enabledTengokuLivestream' : ''}
    ${action.setConditionals.valueChampionOfStreetwiseBoxing},${gpuParams.DEBUG ? ' // valueChampionOfStreetwiseBoxing' : ''}
    ${action.setConditionals.valueWastelanderOfBanditryDesert},${gpuParams.DEBUG ? ' // valueWastelanderOfBanditryDesert' : ''}
    ${action.setConditionals.valueLongevousDisciple},${gpuParams.DEBUG ? ' // valueLongevousDisciple' : ''}
    ${action.setConditionals.valueTheAshblazingGrandDuke},${gpuParams.DEBUG ? ' // valueTheAshblazingGrandDuke' : ''}
    ${action.setConditionals.valuePrisonerInDeepConfinement},${gpuParams.DEBUG ? ' // valuePrisonerInDeepConfinement' : ''}
    ${action.setConditionals.valuePioneerDiverOfDeadWaters},${gpuParams.DEBUG ? ' // valuePioneerDiverOfDeadWaters' : ''}
    ${action.setConditionals.valueSigoniaTheUnclaimedDesolation},${gpuParams.DEBUG ? ' // valueSigoniaTheUnclaimedDesolation' : ''}
    ${action.setConditionals.valueDuranDynastyOfRunningWolves},${gpuParams.DEBUG ? ' // valueDuranDynastyOfRunningWolves' : ''}
    ${action.setConditionals.valueSacerdosRelivedOrdeal},${gpuParams.DEBUG ? ' // valueSacerdosRelivedOrdeal' : ''}
    ${action.setConditionals.valueArcadiaOfWovenDreams},${gpuParams.DEBUG ? ' // valueArcadiaOfWovenDreams' : ''}
    ${action.setConditionals.valueEverGloriousMagicalGirl},${gpuParams.DEBUG ? ' // valueEverGloriousMagicalGirl' : ''}
  ),
);`
  }

  wgsl = wgsl.replace('/* INJECT ACTIONS DEFINITION */', bufferDeclaration + actionsDefinition)

  // Combat conditionals

  wgsl += generateDynamicConditionals(request, context)

  return wgsl
}


function injectComputeShader(wgsl: string) {
  wgsl += generateSetBitConstants()
  wgsl += `
${computeShader}

${structs}
  `
  return wgsl
}

function filterFn(request: Form) {
  return (text: string) => {
    if (text.length == 0) return text
    const [variable, stat, threshold] = text.split(/[><]/).flatMap((x) => x.split('.')).map((x) => x.trim())
    const min = threshold.includes('min')
    const max = threshold.includes('max')

    if (max && request[threshold as keyof Form] == Constants.MAX_INT) return ''
    if (min && request[threshold as keyof Form] == 0) return ''

    return text
  }
}

function format(text: string, levels: number = 2) {
  return indent(text.length > 0 ? text : 'false', levels)
}

function injectSetFilters(wgsl: string, request: Form, gpuParams: GpuConstants) {
  const hasRelicFilter = (request.relicSets?.length ?? 0) > 0
  const hasOrnamentFilter = (request.ornamentSets?.length ?? 0) > 0

  // Strip unused binding declarations so auto layout doesn't expect them
  if (!hasRelicFilter) {
    wgsl = wgsl.replace('@group(1) @binding(2) var<storage> relicSetSolutionsMatrix : array<i32>;', '')
  }
  if (!hasOrnamentFilter) {
    wgsl = wgsl.replace('@group(1) @binding(1) var<storage> ornamentSetSolutionsMatrix : array<i32>;', '')
  }

  if (!hasRelicFilter && !hasOrnamentFilter) {
    return wgsl.replace('/* INJECT SET FILTERS */', '')
  }

  const conditions: string[] = []
  if (hasRelicFilter) {
    conditions.push('((relicSetSolutionsMatrix[relicSetIndex >> 5u] >> (relicSetIndex & 31u)) & 1) == 0')
  }
  if (hasOrnamentFilter) {
    conditions.push('((ornamentSetSolutionsMatrix[ornamentSetIndex >> 5u] >> (ornamentSetIndex & 31u)) & 1) == 0')
  }

  // CTRL+ F: RESULTS ASSIGNMENT
  return wgsl.replace(
    '/* INJECT SET FILTERS */',
    indent(
      `
if (${conditions.join('\n || ')}) {
  continue;
}
  `,
      2,
    ),
  )
}

export function injectBasicFilters(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const sortOption = SortOption[request.resultSort!]
  const sortKey: string = sortOption.key
  const sortOptionComputed = sortOption.isComputedRating
  const filter = filterFn(request)

  // For basic stats, threshold check is here. For computed ratings (COMBO, damage types),
  // threshold check is in generateSortOptionReturn
  let sortString = ''
  if (!sortOptionComputed) {
    sortString = `c.${sortKey} < threshold`
  }

  const basicFilters = [
    filter('c.SPD < minSpd'),
    filter('c.SPD > maxSpd'),
    filter('c.HP  < minHp'),
    filter('c.HP  > maxHp'),
    filter('c.ATK < minAtk'),
    filter('c.ATK > maxAtk'),
    filter('c.DEF < minDef'),
    filter('c.DEF > maxDef'),
    filter('c.CR  < minCr'),
    filter('c.CR  > maxCr'),
    filter('c.CD  < minCd'),
    filter('c.CD  > maxCd'),
    filter('c.EHR < minEhr'),
    filter('c.EHR > maxEhr'),
    filter('c.RES < minRes'),
    filter('c.RES > maxRes'),
    filter('c.BE  < minBe'),
    filter('c.BE  > maxBe'),
    filter('c.ERR < minErr'),
    filter('c.ERR > maxErr'),
    filter(sortString),
  ].filter((str) => str.length > 0).join(' ||\n')

  // CTRL+ F: RESULTS ASSIGNMENT
  wgsl = wgsl.replace(
    '/* INJECT BASIC STAT FILTERS */',
    indent(
      `
if (statDisplay == 1) {
  if (
${format(basicFilters)}
  ) {
    continue;
  }
}
  `,
      2,
    ),
  )

  return wgsl
}

function injectGpuParams(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const cyclesPerInvocation = gpuParams.DEBUG ? 1 : gpuParams.CYCLES_PER_INVOCATION

  let debugValues = ''

  if (gpuParams.DEBUG) {
    //     debugValues = `
    // const DEBUG_BASIC_COMBO: f32 = ${request.comboTurnAbilities.filter((x) => getAbilityKind(x) == AbilityKind.BASIC).length};
    // const DEBUG_SKILL_COMBO: f32 = ${request.comboTurnAbilities.filter((x) => getAbilityKind(x) == AbilityKind.SKILL).length};
    // const DEBUG_ULT_COMBO: f32 = ${request.comboTurnAbilities.filter((x) => getAbilityKind(x) == AbilityKind.ULT).length};
    // const DEBUG_FUA_COMBO: f32 = ${request.comboTurnAbilities.filter((x) => getAbilityKind(x) == AbilityKind.FUA).length};
    // const DEBUG_DOT_COMBO: f32 = ${request.comboTurnAbilities.filter((x) => getAbilityKind(x) == AbilityKind.DOT).length};
    // const DEBUG_BREAK_COMBO: f32 = ${request.comboTurnAbilities.filter((x) => getAbilityKind(x) == AbilityKind.BREAK).length};
    // `
  }

  wgsl = wgsl.replace(
    '/* INJECT GPU PARAMS */',
    `
const WORKGROUP_SIZE = ${gpuParams.WORKGROUP_SIZE};
const BLOCK_SIZE = ${gpuParams.BLOCK_SIZE};
const CYCLES_PER_INVOCATION = ${cyclesPerInvocation};
const DEBUG = ${gpuParams.DEBUG ? 1 : 0};
const COMPACT_LIMIT = ${gpuParams.COMPACT_LIMIT}u;
${debugValues}
  `,
  )

  const compactDeclarations = `
struct CompactEntry { index: i32, value: f32 }

@group(2) @binding(1) var<storage, read_write> compactCount : atomic<u32>;
@group(2) @binding(2) var<storage, read_write> compactResults : array<CompactEntry>;`

  wgsl = wgsl.replace(
    '/* INJECT RESULTS BUFFER */',
    gpuParams.DEBUG
      ? `@group(2) @binding(0) var<storage, read_write> results : array<array<f32, ${context.maxContainerArrayLength}>>; // DEBUG${compactDeclarations}`
      : compactDeclarations,
  )

  if (context.resultSort == SortOption.COMBO.key) {
    wgsl = wgsl.replace(
      '/* INJECT ACTION ITERATOR */',
      indent(
        `
for (var actionIndex = actionCount - 1; actionIndex >= 0; actionIndex--) {
    `,
        4,
      ),
    )
  } else {
    wgsl = wgsl.replace(
      '/* INJECT ACTION ITERATOR */',
      indent(
        `
for (var actionIndex = 0; actionIndex < actionCount; actionIndex++) {
    `,
        4,
      ),
    )
  }

  return wgsl
}
