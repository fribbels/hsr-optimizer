import { OrnamentSetToIndex, RelicSetToIndex, SetsOrnaments, SetsRelics, Stats } from '../constants'
import { BufferPacker } from '../bufferPacker.js'
import { baseCharacterStats, calculateBaseStats, calculateComputedStats, calculateElementalStats, calculateRelicStats, calculateSetCounts } from 'lib/optimizer/calculateStats'
import { calculateBaseMultis, calculateDamage } from 'lib/optimizer/calculateDamage'
import { SortOption } from 'lib/optimizer/sortOptions'
import { Form } from 'types/Form'
import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { CharacterMetadata, OptimizerAction, OptimizerContext } from 'types/Optimizer'
import { calculateContextConditionalRegistry, wrapTeammateDynamicConditional } from 'lib/optimizer/calculateConditionals'
import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'

const relicSetCount = Object.values(SetsRelics).length
const ornamentSetCount = Object.values(SetsOrnaments).length
let isFirefox = false

type OptimizerEventData = {
  relics: {
    LinkRope: any[]
    PlanarSphere: any[]
    Feet: any[]
    Body: any[]
    Hands: any[]
    Head: any[]
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

  const relics = data.relics
  const arr = new Float64Array(data.buffer)

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
  let passCount = 0

  isFirefox = data.isFirefox

  const {
    failsBasicFilter,
    failsCombatFilter,
    // @ts-ignore
  } = generateResultMinFilter(request, combatDisplay)

  for (const action of context.actions) {
    calculateContextConditionalRegistry(action, context)
  }

  context.characterConditionalController = CharacterConditionals.get(context)
  context.lightConeConditionalController = LightConeConditionals.get(context)

  function calculateTeammateDynamicConditionals(action: OptimizerAction, teammateMetadata: CharacterMetadata, index: number) {
    if (teammateMetadata?.characterId) {
      const teammateCharacterConditionalController = CharacterConditionals.get(teammateMetadata)
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
  }

  const limit = Math.min(data.permutations, data.WIDTH)

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

    const setH = RelicSetToIndex[head.set]
    const setG = RelicSetToIndex[hands.set]
    const setB = RelicSetToIndex[body.set]
    const setF = RelicSetToIndex[feet.set]
    const setP = OrnamentSetToIndex[planarSphere.set]
    const setL = OrnamentSetToIndex[linkRope.set]

    const relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
    const ornamentSetIndex = setP + setL * ornamentSetCount

    // Exit early if sets don't match
    if (relicSetSolutions[relicSetIndex] != 1 || ornamentSetSolutions[ornamentSetIndex] != 1) {
      continue
    }

    const c: BasicStatsObject = { ...baseCharacterStats } as BasicStatsObject

    c.relicSetIndex = relicSetIndex
    c.ornamentSetIndex = ornamentSetIndex
    // @ts-ignore
    c.x = {}

    calculateRelicStats(c, head, hands, body, feet, planarSphere, linkRope)
    calculateSetCounts(c, setH, setG, setB, setF, setP, setL)
    calculateBaseStats(c, context)
    calculateElementalStats(c, context)

    // Exit early on base display filters failing
    if (baseDisplay) {
      if (failsBasicFilter(c)) {
        continue
      }

      const fail
        = c[Stats.SPD] < request.minSpd || c[Stats.SPD] > request.maxSpd
        || c[Stats.HP] < request.minHp || c[Stats.HP] > request.maxHp
        || c[Stats.ATK] < request.minAtk || c[Stats.ATK] > request.maxAtk
        || c[Stats.DEF] < request.minDef || c[Stats.DEF] > request.maxDef
        || c[Stats.CR] < request.minCr || c[Stats.CR] > request.maxCr
        || c[Stats.CD] < request.minCd || c[Stats.CD] > request.maxCd
        || c[Stats.EHR] < request.minEhr || c[Stats.EHR] > request.maxEhr
        || c[Stats.RES] < request.minRes || c[Stats.RES] > request.maxRes
        || c[Stats.BE] < request.minBe || c[Stats.BE] > request.maxBe
        || c[Stats.ERR] < request.minErr || c[Stats.ERR] > request.maxErr
      if (fail) {
        continue
      }
    }

    let combo = 0
    for (let i = context.actions.length - 1; i >= 0; i--) {
      const action = setupAction(c, i, context)
      const ax = action.precomputedX

      calculateComputedStats(c, ax, action, context)
      calculateBaseMultis(ax, action, context)
      calculateDamage(ax, action, context)

      if (action.actionType === 'BASIC') {
        combo += ax.BASIC_DMG
      }
      if (action.actionType === 'SKILL') {
        combo += ax.SKILL_DMG
      }
      if (action.actionType === 'ULT') {
        combo += ax.ULT_DMG
      }
      if (action.actionType === 'FUA') {
        combo += ax.FUA_DMG
      }

      if (i === 0) {
        combo += context.comboDot * ax.DOT_DMG + context.comboBreak * ax.BREAK_DMG
        c.x = ax
      }
    }

    c.x.COMBO_DMG = combo
    let x = c.x

    if (failsCombatFilter(x)) {
      continue
    }

    // Since we exited early on the c comparisons, we only need to check against x stats here
    // Combat filters
    if (combatDisplay) {
      const fail
        = x[Stats.HP] < request.minHp || x[Stats.HP] > request.maxHp
        || x[Stats.ATK] < request.minAtk || x[Stats.ATK] > request.maxAtk
        || x[Stats.DEF] < request.minDef || x[Stats.DEF] > request.maxDef
        || x[Stats.SPD] < request.minSpd || x[Stats.SPD] > request.maxSpd
        || x[Stats.CR] < request.minCr || x[Stats.CR] > request.maxCr
        || x[Stats.CD] < request.minCd || x[Stats.CD] > request.maxCd
        || x[Stats.EHR] < request.minEhr || x[Stats.EHR] > request.maxEhr
        || x[Stats.RES] < request.minRes || x[Stats.RES] > request.maxRes
        || x[Stats.BE] < request.minBe || x[Stats.BE] > request.maxBe
        || x[Stats.ERR] < request.minErr || x[Stats.ERR] > request.maxErr
      if (fail) {
        continue
      }
    }

    // Rating filters
    const fail = x.EHP < request.minEhp || x.EHP > request.maxEhp
      || x.BASIC_DMG < request.minBasic || x.BASIC_DMG > request.maxBasic
      || x.SKILL_DMG < request.minSkill || x.SKILL_DMG > request.maxSkill
      || x.ULT_DMG < request.minUlt || x.ULT_DMG > request.maxUlt
      || x.FUA_DMG < request.minFua || x.FUA_DMG > request.maxFua
      || x.DOT_DMG < request.minDot || x.DOT_DMG > request.maxDot
      || x.BREAK_DMG < request.minBreak || x.BREAK_DMG > request.maxBreak
    if (fail) {
      continue
    }

    // Pack the passing results into the ArrayBuffer to return
    c.id = index
    BufferPacker.packCharacter(arr, passCount, c)
    passCount++
  }

  self.postMessage({
    rows: [],
    buffer: data.buffer,
  }, [data.buffer])
}

function generateResultMinFilter(request: Form, combatDisplay: string) {
  // @ts-ignore
  const filter = request.resultMinFilter
  // @ts-ignore
  const sortOption = SortOption[request.resultSort]
  const isComputedRating = sortOption.isComputedRating

  // Combat and basic filters apply at different places in the loop
  // Computed ratings (EHP, DMG, WEIGHT) only apply to the computed x values independent of the stat display
  if (combatDisplay || isComputedRating) {
    const property = sortOption.combatProperty
    return {
      failsBasicFilter: () => false,
      failsCombatFilter: (candidate) => {
        return candidate[property] < filter
      },
    }
  } else {
    const property = sortOption.basicProperty
    return {
      failsBasicFilter: (candidate) => {
        return candidate[property] < filter
      },
      failsCombatFilter: () => false,
    }
  }
}

function setupAction(c: BasicStatsObject, i: number, context: OptimizerContext) {
  const originalAction = context.actions[i]
  const ax = cloneX(originalAction)
  ax.sets = c.x.sets
  const action = {
    characterConditionals: originalAction.characterConditionals,
    lightConeConditionals: originalAction.characterConditionals,
    teammate0: originalAction.teammate0,
    teammate1: originalAction.teammate1,
    teammate2: originalAction.teammate2,
    teammateDynamicConditionals: originalAction.teammateDynamicConditionals,
    setConditionals: originalAction.setConditionals,
    conditionalRegistry: originalAction.conditionalRegistry,
    actionType: originalAction.actionType,
    precomputedX: ax,
    conditionalState: {}
  } as OptimizerAction

  return action
}

function cloneX(originalAction: OptimizerAction) {
  const x = originalAction.precomputedX
  return isFirefox ? Object.assign({}, x) : { ...x }
}