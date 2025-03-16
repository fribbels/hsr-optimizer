import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Constants, OrnamentSetToIndex, RelicSetToIndex, SetsOrnaments, SetsRelics } from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { BasicStatsArray, BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { BufferPacker } from 'lib/optimization/bufferPacker'
import { Source } from 'lib/optimization/buffSource'
import { calculateContextConditionalRegistry, wrapTeammateDynamicConditional } from 'lib/optimization/calculateConditionals'
import { calculateBaseMultis, calculateDamage } from 'lib/optimization/calculateDamage'
import {
  calculateBaseStats,
  calculateBasicEffects,
  calculateBasicSetEffects,
  calculateComputedStats,
  calculateElementalStats,
  calculateRelicStats,
  calculateSetCounts,
} from 'lib/optimization/calculateStats'
import { ComputedStatsArray, ComputedStatsArrayCore, Key, KeysType } from 'lib/optimization/computedStatsArray'
import { SortOption, SortOptionProperties } from 'lib/optimization/sortOptions'
import { Form } from 'types/form'
import { CharacterMetadata, OptimizerAction, OptimizerContext } from 'types/optimizer'
import { Relic } from 'types/relic'

const relicSetCount = Object.values(SetsRelics).length
const ornamentSetCount = Object.values(SetsOrnaments).length
let isFirefox = false

type OptimizerEventData = {
  relics: {
    LinkRope: Relic[]
    PlanarSphere: Relic[]
    Feet: Relic[]
    Body: Relic[]
    Hands: Relic[]
    Head: Relic[]
  }
  request: Form
  context: OptimizerContext
  buffer: ArrayBuffer
  relicSetSolutions: number[]
  ornamentSetSolutions: number[]
  permutations: number
  WIDTH: number
  skip: number
  isFirefox: boolean
}

self.onmessage = function (e: MessageEvent) {
  // console.log('Message received from main script', e.data)
  // console.log("Request received from main script", JSON.stringify(e.data.request.characterConditionals, null, 4));

  const data: OptimizerEventData = e.data
  const request: Form = data.request
  const context: OptimizerContext = data.context

  const relics: RelicsByPart = data.relics
  const arr = new Float32Array(data.buffer)

  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length
  const hSize = relics.Head.length

  const relicSetSolutions = data.relicSetSolutions
  const ornamentSetSolutions = data.ornamentSetSolutions

  const combatDisplay = request.statDisplay == 'combat'
  const baseDisplay = !combatDisplay
  const memoDisplay = request.memoDisplay == 'memo'
  const summonerDisplay = !memoDisplay
  let passCount = 0

  isFirefox = data.isFirefox

  const {
    failsBasicThresholdFilter,
    failsCombatThresholdFilter,
    // @ts-ignore
  } = generateResultMinFilter(request, combatDisplay, memoDisplay)

  for (const action of context.actions) {
    calculateContextConditionalRegistry(action, context)
  }

  context.characterConditionalController = CharacterConditionalsResolver.get(context)
  context.lightConeConditionalController = LightConeConditionalsResolver.get(context)

  function calculateTeammateDynamicConditionals(action: OptimizerAction, teammateMetadata: CharacterMetadata, index: number) {
    if (teammateMetadata?.characterId) {
      const teammateCharacterConditionalController = CharacterConditionalsResolver.get(teammateMetadata)
      const dynamicConditionals = (teammateCharacterConditionalController.teammateDynamicConditionals ?? [])
        .map((dynamicConditional: DynamicConditional) => {
          const wrapped = wrapTeammateDynamicConditional(dynamicConditional, index)
          action.teammateDynamicConditionals.push(wrapped)
          return wrapped
        })
    }
  }

  for (const action of context.actions) {
    action.teammateDynamicConditionals = []
    if (context.teammate0Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate0Metadata, 0)
    if (context.teammate1Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate1Metadata, 1)
    if (context.teammate2Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate2Metadata, 2)

    // Reconstruct arrays after transfer
    action.precomputedX.a = new Float32Array(Object.values(action.precomputedX.a))
    action.precomputedM.a = new Float32Array(Object.values(action.precomputedM.a))
  }

  const limit = Math.min(data.permutations, data.WIDTH)

  const c = new BasicStatsArrayCore(false) as BasicStatsArray
  const x = new ComputedStatsArrayCore(false) as ComputedStatsArray
  const m = x.m

  const failsCombatStatsFilter = combatStatsFilter(request)
  const failsBasicStatsFilter = basicStatsFilter(request)
  const failsRatingStatsFilter = ratingStatsFilter(request)

  for (let col = 0; col < limit; col++) {
    const index = data.skip + col

    if (index >= data.permutations) {
      break
    }

    const l = (index % lSize)
    const p = (((index - l) / lSize) % pSize)
    const f = (((index - p * lSize - l) / (lSize * pSize)) % fSize)
    const b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
    const g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
    const h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

    const head = relics.Head[h]
    const hands = relics.Hands[g]
    const body = relics.Body[b]
    const feet = relics.Feet[f]
    const planarSphere = relics.PlanarSphere[p]
    const linkRope = relics.LinkRope[l]

    const setH = RelicSetToIndex[head.set as SetsRelics]
    const setG = RelicSetToIndex[hands.set as SetsRelics]
    const setB = RelicSetToIndex[body.set as SetsRelics]
    const setF = RelicSetToIndex[feet.set as SetsRelics]
    const setP = OrnamentSetToIndex[planarSphere.set as SetsOrnaments]
    const setL = OrnamentSetToIndex[linkRope.set as SetsOrnaments]

    const relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
    const ornamentSetIndex = setP + setL * ornamentSetCount

    // Exit early if sets don't match
    if (relicSetSolutions[relicSetIndex] != 1 || ornamentSetSolutions[ornamentSetIndex] != 1) {
      continue
    }

    const sets = [setH, setG, setB, setF, setP, setL]
    const setCounts = calculateSetCounts(sets)
    c.init(relicSetIndex, ornamentSetIndex, setCounts, sets, col)

    calculateBasicSetEffects(c, context, setCounts, sets)
    calculateRelicStats(c, head, hands, body, feet, planarSphere, linkRope, true)
    calculateBaseStats(c, context)
    calculateElementalStats(c, context)

    // Exit early on base display filters failing
    if (baseDisplay && summonerDisplay && (failsBasicThresholdFilter(c.a) || failsBasicStatsFilter(c.a))) {
      continue
    }

    x.setBasic(c)
    if (x.a[Key.MEMOSPRITE]) {
      m.setBasic(c.m)
      c.initMemo()
    }

    let combo = 0
    for (let i = context.actions.length - 1; i >= 0; i--) {
      const action = setupAction(c, i, context)
      const a = x.a
      x.setPrecompute(action.precomputedX.a)
      if (x.a[Key.MEMOSPRITE]) {
        m.setPrecompute(action.precomputedM.a)
      }

      calculateBasicEffects(x, action, context)
      calculateComputedStats(x, action, context)
      calculateBaseMultis(x, action, context)

      calculateDamage(x, action, context)

      if (action.actionType === 'BASIC') {
        combo += a[Key.BASIC_DMG]
      } else if (action.actionType === 'SKILL') {
        combo += a[Key.SKILL_DMG]
      } else if (action.actionType === 'ULT') {
        combo += a[Key.ULT_DMG]
      } else if (action.actionType === 'FUA') {
        combo += a[Key.FUA_DMG]
      } else if (action.actionType === 'MEMO_SKILL') {
        combo += a[Key.MEMO_SKILL_DMG]
      } else if (action.actionType === 'MEMO_TALENT') {
        combo += a[Key.MEMO_TALENT_DMG]
      }

      if (i === 0) {
        combo += context.comboDot * a[Key.DOT_DMG] + context.comboBreak * a[Key.BREAK_DMG]
        x.COMBO_DMG.set(combo, Source.NONE)
      }
    }

    // Combat / rating filters
    if (baseDisplay && memoDisplay && (failsBasicThresholdFilter(x.m.c.a) || failsBasicStatsFilter(x.m.c.a))) {
      continue
    }
    if (combatDisplay && summonerDisplay && (failsCombatThresholdFilter(x.a) || failsCombatStatsFilter(x.a))) {
      continue
    }
    if (combatDisplay && memoDisplay && (failsCombatThresholdFilter(x.m.a) || failsCombatStatsFilter(x.m.a))) {
      continue
    }
    if (summonerDisplay && failsRatingStatsFilter(x.a)) {
      continue
    }
    if (memoDisplay && failsRatingStatsFilter(x.m.a)) {
      continue
    }

    BufferPacker.packCharacter(arr, passCount, x)
    passCount++
  }

  self.postMessage({
    rows: [],
    buffer: data.buffer,
  }, [data.buffer])
}

function addConditionIfNeeded(
  conditions: ((stats: Float32Array) => boolean)[],
  statKey: number,
  min: number,
  max: number,
) {
  if (min !== 0 || max !== Constants.MAX_INT) {
    conditions.push((stats) => stats[statKey] < min || stats[statKey] > max)
  }
}

function basicStatsFilter(request: Form) {
  const conditions: ((stats: Float32Array) => boolean)[] = []

  addConditionIfNeeded(conditions, Key.HP, request.minHp, request.maxHp)
  addConditionIfNeeded(conditions, Key.ATK, request.minAtk, request.maxAtk)
  addConditionIfNeeded(conditions, Key.DEF, request.minDef, request.maxDef)
  addConditionIfNeeded(conditions, Key.SPD, request.minSpd, request.maxSpd)
  addConditionIfNeeded(conditions, Key.CR, request.minCr, request.maxCr)
  addConditionIfNeeded(conditions, Key.CD, request.minCd, request.maxCd)
  addConditionIfNeeded(conditions, Key.EHR, request.minEhr, request.maxEhr)
  addConditionIfNeeded(conditions, Key.RES, request.minRes, request.maxRes)
  addConditionIfNeeded(conditions, Key.BE, request.minBe, request.maxBe)
  addConditionIfNeeded(conditions, Key.ERR, request.minErr, request.maxErr)

  return (stats: Float32Array) => conditions.some((condition) => condition(stats))
}

function combatStatsFilter(request: Form) {
  const conditions: ((stats: Float32Array) => boolean)[] = []

  addConditionIfNeeded(conditions, Key.HP, request.minHp, request.maxHp)
  addConditionIfNeeded(conditions, Key.ATK, request.minAtk, request.maxAtk)
  addConditionIfNeeded(conditions, Key.DEF, request.minDef, request.maxDef)
  addConditionIfNeeded(conditions, Key.SPD, request.minSpd, request.maxSpd)
  addConditionIfNeeded(conditions, Key.CR, request.minCr, request.maxCr)
  addConditionIfNeeded(conditions, Key.CD, request.minCd, request.maxCd)
  addConditionIfNeeded(conditions, Key.EHR, request.minEhr, request.maxEhr)
  addConditionIfNeeded(conditions, Key.RES, request.minRes, request.maxRes)
  addConditionIfNeeded(conditions, Key.BE, request.minBe, request.maxBe)
  addConditionIfNeeded(conditions, Key.ERR, request.minErr, request.maxErr)

  return (stats: Float32Array) => conditions.some((condition) => condition(stats))
}

function ratingStatsFilter(request: Form) {
  const conditions: ((stats: Float32Array) => boolean)[] = []

  addConditionIfNeeded(conditions, Key.EHP, request.minEhp, request.maxEhp)
  addConditionIfNeeded(conditions, Key.BASIC_DMG, request.minBasic, request.maxBasic)
  addConditionIfNeeded(conditions, Key.SKILL_DMG, request.minSkill, request.maxSkill)
  addConditionIfNeeded(conditions, Key.ULT_DMG, request.minUlt, request.maxUlt)
  addConditionIfNeeded(conditions, Key.FUA_DMG, request.minFua, request.maxFua)
  addConditionIfNeeded(conditions, Key.MEMO_SKILL_DMG, request.minMemoSkill, request.maxMemoSkill)
  addConditionIfNeeded(conditions, Key.MEMO_TALENT_DMG, request.minMemoTalent, request.maxMemoTalent)
  addConditionIfNeeded(conditions, Key.DOT_DMG, request.minDot, request.maxDot)
  addConditionIfNeeded(conditions, Key.BREAK_DMG, request.minBreak, request.maxBreak)
  addConditionIfNeeded(conditions, Key.HEAL_VALUE, request.minHeal, request.maxHeal)
  addConditionIfNeeded(conditions, Key.SHIELD_VALUE, request.minShield, request.maxShield)

  return (stats: Float32Array) => conditions.some((condition) => condition(stats))
}

function generateResultMinFilter(request: Form, combatDisplay: string) {
  const filter = request.resultMinFilter
  // @ts-ignore
  const sortOption = SortOption[request.resultSort] as SortOptionProperties
  const isComputedRating = sortOption.isComputedRating

  // Combat and basic filters apply at different places in the loop
  // Computed ratings (EHP, DMG, WEIGHT) only apply to the computed x values independent of the stat display
  if (combatDisplay || isComputedRating) {
    const key = sortOption.optimizerKey
    return {
      failsBasicThresholdFilter: () => false,
      failsCombatThresholdFilter: (candidate: Float32Array) => {
        return candidate[key] < filter
      },
    }
  } else {
    const property = sortOption.gpuProperty as KeysType
    const key = Key[property]
    return {
      failsBasicThresholdFilter: (candidate: Float32Array) => {
        return candidate[key] < filter
      },
      failsCombatThresholdFilter: () => false,
    }
  }
}

function setupAction(c: BasicStatsArray, i: number, context: OptimizerContext) {
  const originalAction = context.actions[i]
  const action = {
    characterConditionals: originalAction.characterConditionals,
    lightConeConditionals: originalAction.lightConeConditionals,
    teammate0: originalAction.teammate0,
    teammate1: originalAction.teammate1,
    teammate2: originalAction.teammate2,
    teammateDynamicConditionals: originalAction.teammateDynamicConditionals,
    setConditionals: originalAction.setConditionals,
    conditionalRegistry: originalAction.conditionalRegistry,
    actionType: originalAction.actionType,
    actionIndex: originalAction.actionIndex,
    precomputedX: originalAction.precomputedX,
    precomputedM: originalAction.precomputedM,
    conditionalState: {},
  } as OptimizerAction

  return action
}
