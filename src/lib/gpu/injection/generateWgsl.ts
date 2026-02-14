import { evaluateDependencyOrder } from 'lib/conditionals/evaluation/dependencyEvaluator'
import {
  Constants,
  PathNames,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { injectComputedStats } from 'lib/gpu/injection/injectComputedStats'
import { generateDynamicConditionals } from 'lib/gpu/injection/injectConditionals'
import { injectSettings } from 'lib/gpu/injection/injectSettings'
import { injectUnrolledActions } from 'lib/gpu/injection/injectUnrolledActions'
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
  wgsl = injectRelicIndexStrategy(wgsl, relics)
  wgsl = injectBasicFilters(wgsl, request, context, gpuParams)
  // wgsl = injectRatingFilters(wgsl, request, gpuParams)
  wgsl = injectSetFilters(wgsl, gpuParams)
  wgsl = injectComputedStats(wgsl, gpuParams)
  // wgsl = injectSuppressions(wgsl, request, context, gpuParams)

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

  // Buffer declaration (added to actionsDefinition)
  const bufferDeclaration = `
@group(1) @binding(3) var<storage> precomputedStats : array<array<f32, ${containerLength}>, ${actionLength}>;
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

  // function generateConditionalExecution(conditional: DynamicConditional) {
  //   return `evaluate${conditional.id}(p_container, p_sets, p_state);`
  // }

  // const { conditionalSequence, terminalConditionals } = evaluateDependencyOrder(context.defaultActions[0].conditionalRegistry)
  // let conditionalSequenceWgsl = '\n'
  // conditionalSequenceWgsl += conditionalSequence.map(generateConditionalExecution).map((wgsl) => indent(wgsl, 0)).join('\n') + '\n'

  // conditionalSequenceWgsl += '\n'
  // conditionalSequenceWgsl += terminalConditionals.map(generateConditionalExecution).map((wgsl) => indent(wgsl, 0)).join('\n') + '\n'

  // wgsl = wgsl.replace(
  //   '/* INJECT COMBAT CONDITIONALS */',
  //   conditionalSequenceWgsl,
  // )

  return wgsl
}

function injectSuppressions(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  if (context.path != PathNames.Remembrance) {
    wgsl = suppress(wgsl, 'COPY MEMOSPRITE BASIC STATS')
    wgsl = suppress(wgsl, 'MEMOSPRITE DAMAGE CALCS')
    wgsl = suppress(wgsl, 'MC ASSIGNMENT')
  }

  if (context.resultSort != SortOption.EHP.key && !gpuParams.DEBUG && request.minEhp == 0 && request.maxEhp == Constants.MAX_INT) {
    wgsl = suppress(wgsl, 'EHP CALC')
  }

  if (context.resultSort != SortOption.COMBO.key && !gpuParams.DEBUG) {
    if (context.resultSort != SortOption.DOT.key && request.minDot == 0 && request.maxDot == Constants.MAX_INT) wgsl = suppress(wgsl, 'DOT CALC')
    if (context.resultSort != SortOption.BASIC.key && request.minBasic == 0 && request.maxBasic == Constants.MAX_INT) wgsl = suppress(wgsl, 'BASIC CALC')
    if (context.resultSort != SortOption.SKILL.key && request.minSkill == 0 && request.maxSkill == Constants.MAX_INT) wgsl = suppress(wgsl, 'SKILL CALC')
    if (context.resultSort != SortOption.ULT.key && request.minUlt == 0 && request.maxUlt == Constants.MAX_INT) wgsl = suppress(wgsl, 'ULT CALC')
    if (context.resultSort != SortOption.FUA.key && request.minFua == 0 && request.maxFua == Constants.MAX_INT) wgsl = suppress(wgsl, 'FUA CALC')
    if (context.resultSort != SortOption.MEMO_SKILL.key && request.minMemoSkill == 0 && request.maxMemoSkill == Constants.MAX_INT) {
      wgsl = suppress(wgsl, 'MEMO_SKILL CALC')
    }
    if (context.resultSort != SortOption.MEMO_TALENT.key && request.minMemoTalent == 0 && request.maxMemoTalent == Constants.MAX_INT) {
      wgsl = suppress(wgsl, 'MEMO_TALENT CALC')
    }
  }

  return wgsl
}

function suppress(wgsl: string, label: string) {
  wgsl = wgsl.replace(`START ${label} */`, `═════════════════════════════════════════ DISABLED ${label} ═════════════════════════════════════════╗`)
  wgsl = wgsl.replace(`/* END ${label}`, `════════════════════════════════════════════ DISABLED ${label} ═════════════════════════════════════════╝`)

  return wgsl
}

function injectComputeShader(wgsl: string) {
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

function injectSetFilters(wgsl: string, gpuParams: GpuConstants) {
  // CTRL+ F: RESULTS ASSIGNMENT
  return wgsl.replace(
    '/* INJECT SET FILTERS */',
    indent(
      `
if (relicSetSolutionsMatrix[relicSetIndex] < 1 || ornamentSetSolutionsMatrix[ornamentSetIndex] < 1) {
  ${gpuParams.DEBUG ? '' : 'results[index] = -failures; failures = failures + 1'};
  continue;
}
  `,
      2,
    ),
  )
}

export function injectBasicFilters(wgsl: string, request: Form, context: OptimizerContext, gpuParams: GpuConstants) {
  const sortOption = SortOption[request.resultSort!]
  const sortOptionGpu: string = sortOption.gpuProperty
  const sortOptionComputed = sortOption.isComputedRating
  const filter = filterFn(request)

  // For basic stats, threshold check is here. For computed ratings (COMBO, damage types),
  // threshold check is in generateSortOptionReturn
  let sortString = ''
  if (!sortOptionComputed) {
    sortString = `c.${sortOptionGpu} < threshold`
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
    ${gpuParams.DEBUG ? '' : 'results[index] = -failures; failures = failures + 1'};
    continue;
  }
}
  `,
      2,
    ),
  )

  return wgsl
}

function injectRatingFilters(wgsl: string, request: Form, gpuParams: GpuConstants) {
  const filter = filterFn(request)

  const ratingFilters = [
    filter('x.EHP < minEhp'),
    filter('x.EHP > maxEhp'),
    filter('x.BASIC_DMG < minBasic'),
    filter('x.BASIC_DMG > maxBasic'),
    filter('x.SKILL_DMG < minSkill'),
    filter('x.SKILL_DMG > maxSkill'),
    filter('x.ULT_DMG < minUlt'),
    filter('x.ULT_DMG > maxUlt'),
    filter('x.FUA_DMG < minFua'),
    filter('x.FUA_DMG > maxFua'),
    filter('x.MEMO_SKILL_DMG < minMemoSkill'),
    filter('x.MEMO_SKILL_DMG > maxMemoSkill'),
    filter('x.MEMO_TALENT_DMG < minMemoTalent'),
    filter('x.MEMO_TALENT_DMG > maxMemoTalent'),
    filter('x.DOT_DMG < minDot'),
    filter('x.DOT_DMG > maxDot'),
    filter('x.BREAK_DMG < minBreak'),
    filter('x.BREAK_DMG > maxBreak'),
    filter('x.HEAL_VALUE < minHeal'),
    filter('x.HEAL_VALUE > maxHeal'),
    filter('x.SHIELD_VALUE < minShield'),
    filter('x.SHIELD_VALUE > maxShield'),
  ].filter((str) => str.length > 0).join(' ||\n')

  // CTRL+ F: RESULTS ASSIGNMENT
  wgsl = wgsl.replace(
    '/* INJECT RATING STAT FILTERS */',
    indent(
      `
if (
${format(ratingFilters, 1)}
) {
  results[index] = ${gpuParams.DEBUG ? 'ComputedStats()' : '-failures; failures = failures + 1'};
  break;
}
  `,
      4,
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
${debugValues}
  `,
  )

  if (gpuParams.DEBUG) {
    wgsl = wgsl.replace(
      '/* INJECT RESULTS BUFFER */',
      `
@group(2) @binding(0) var<storage, read_write> results : array<array<f32, ${context.maxContainerArrayLength}>>; // DEBUG
    `,
    )
  } else {
    wgsl = wgsl.replace(
      '/* INJECT RESULTS BUFFER */',
      `
@group(2) @binding(0) var<storage, read_write> results : array<f32>;
    `,
    )
  }

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

/**
 * Decides which {@link https://web.archive.org/web/20250531050143/https://en.wikipedia.org/wiki/Mixed_radix mixed-radix}
 * strategy should be used for accessing the relics array slots. This is needed because, as of now,  wgsl only supports
 * 32 bit types, which can overflow if not used cautiously.
 */
function injectRelicIndexStrategy(wgsl: string, relics: RelicsByPart): string {
  const injectionLabel = '/* INJECT RELIC SLOT INDEX STRATEGY */'
  const overflows = (relics.LinkRope.length
    * relics.PlanarSphere.length
    * relics.Feet.length
    * relics.Body.length
    * relics.Hands.length) > 2147483647
  if (overflows) {
    return wgsl.replace(
      injectionLabel,
      `
    let l = (index % lSize);
    let indexCarryL = index / lSize;
    let p = (indexCarryL % pSize);
    let indexCarryP = indexCarryL / pSize;
    let f = (indexCarryP % fSize);
    let indexCarryF = indexCarryP / fSize;
    let b = (indexCarryF % bSize);
    let indexCarryB = indexCarryF / bSize;
    let g = (indexCarryB % gSize);
    let indexCarryG = indexCarryB / gSize;
    let h = (indexCarryG % hSize);
  `,
    )
  }
  return wgsl.replace(
    injectionLabel,
    `
    let l = (index % lSize);
    let p = (((index - l) / lSize) % pSize);
    let f = (((index - p * lSize - l) / (lSize * pSize)) % fSize);
    let b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
    let g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
    let h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);
  `,
  )
}
