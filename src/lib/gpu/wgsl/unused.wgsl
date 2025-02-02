// Here goes all the dead code and/or a wgsl scratchpad to test stuff

/*


function copy(aObject) {
  // Prevent undefined objects
  // if (!aObject) return aObject;

  const bObject = Array.isArray(aObject) ? [] : {}

  let value
  for (const key in aObject) {
    // Prevent self-references to parent object
    // if (Object.is(aObject[key], aObject)) continue;

    value = aObject[key]

    bObject[key] = (typeof value === 'object') ? copy(value) : value
  }

  return bObject
}

function startTests2() {
  const original = baseComputedStatsObject

  function measure(testFn) {
    const start = Date.now()
    testFn()
    const end = Date.now()

    return end - start
  }

  function test1() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = JSON.parse(JSON.stringify(original))
      }
    })
  }

  function test2() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = {
          ...original,
        }
      }
    })
  }

  function test3() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = cloneDeep(original)
      }
    })
  }

  function test4() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = structuredClone(original)
      }
    })
  }

  function test5() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const copy = Object.assign({}, original)
      }
    })
  }

  function test6() {
    return measure(() => {
      for (let i = 0; i < 1000000; i++) {
        const x = copy(original)
      }
    })
  }


  console.log(`${test1()}ms - Stringify`)
  console.log(`${test2()}ms - Spread`)
  console.log(`${test3()}ms - Lodash`)
  console.log(`${test4()}ms - StructuredClone`)
  console.log(`${test5()}ms - Assign`)
  console.log(`${test6()}ms - Custom`)
  console.log(`${test7()}ms - Create`)

   // Chrome
   // 6302ms - Stringify
   // 106ms - Spread
   // 7987ms - Lodash
   // 8937ms - StructuredClone
   // 2662ms - Assign
   // 3014ms - Custom
   // 17ms - N/A - Creation time

   // Firefox
   // 7191ms - Stringify
   // 1519ms - Spread
   // 4535ms - Lodash
   // 10590ms - StructuredClone
   // 241ms - Assign
   // 1060ms - Custom
   // 177ms - N/A - Creation time

   // Opera
   // 6103ms - Stringify
   // 99ms - Spread
   // 7110ms - Lodash
   // 8401ms - StructuredClone
   // 2386ms - Assign
   // 2620ms - Custom
   // 16ms - N/A - Creation time
}

export const StatToKey: Record<string, number> = {
  [Stats.ATK_P]: Key.ATK_P,
  [Stats.ATK]: Key.ATK,
  [Stats.BE]: Key.BE,
  [Stats.CD]: Key.CD,
  [Stats.CR]: Key.CR,
  [Stats.DEF_P]: Key.DEF_P,
  [Stats.DEF]: Key.DEF,
  [Stats.EHR]: Key.EHR,
  [Stats.ERR]: Key.ERR,
  [Stats.Fire_DMG]: Key.FIRE_DMG_BOOST,
  [Stats.HP_P]: Key.HP_P,
  [Stats.HP]: Key.HP,
  [Stats.Ice_DMG]: Key.ICE_DMG_BOOST,
  [Stats.Imaginary_DMG]: Key.IMAGINARY_DMG_BOOST,
  [Stats.Lightning_DMG]: Key.LIGHTNING_DMG_BOOST,
  [Stats.OHB]: Key.OHB,
  [Stats.Physical_DMG]: Key.PHYSICAL_DMG_BOOST,
  [Stats.Quantum_DMG]: Key.QUANTUM_DMG_BOOST,
  [Stats.RES]: Key.RES,
  [Stats.SPD_P]: Key.SPD_P,
  [Stats.SPD]: Key.SPD,
  [Stats.Wind_DMG]: Key.WIND_DMG_BOOST,
} as const

export const StatToOptimizerStat: Record<string, string> = {
  [Stats.ATK_P]: 'ATK_P',
  [Stats.ATK]: 'ATK',
  [Stats.BE]: 'BE',
  [Stats.CD]: 'CD',
  [Stats.CR]: 'CR',
  [Stats.DEF_P]: 'DEF_P',
  [Stats.DEF]: 'DEF',
  [Stats.EHR]: 'EHR',
  [Stats.ERR]: 'ERR',
  [Stats.Fire_DMG]: 'FIRE_DMG_BOOST',
  [Stats.HP_P]: 'HP_P',
  [Stats.HP]: 'HP',
  [Stats.Ice_DMG]: 'ICE_DMG_BOOST',
  [Stats.Imaginary_DMG]: 'IMAGINARY_DMG_BOOST',
  [Stats.Lightning_DMG]: 'LIGHTNING_DMG_BOOST',
  [Stats.OHB]: 'OHB',
  [Stats.Physical_DMG]: 'PHYSICAL_DMG_BOOST',
  [Stats.Quantum_DMG]: 'QUANTUM_DMG_BOOST',
  [Stats.RES]: 'RES',
  [Stats.SPD_P]: 'SPD_P',
  [Stats.SPD]: 'SPD',
  [Stats.Wind_DMG]: 'WIND_DMG_BOOST',
} as const


export function statSelfConversion(
  stat: ConvertibleStatsType,
  conditional: DynamicConditional,
  x: ComputedStatsArray,
  action: OptimizerAction,
  context: OptimizerContext,
  valueFn: (convertibleValue: number) => number,
) {
  const statConfig = statConversionConfig[stat]

  const statValue = x.a[statConfig.key]
  const statPreconvertedValue = x.a[statConfig.preconvertedKey!] ?? 0
  const statPreconvertedPercentValue = statConfig.percentStat ? x.a[statConfig.percentPreconvertedKey!] * context[statConfig.baseProperty!] : 0

  const stateValue = action.conditionalState[conditional.id] ?? 0
  const convertibleValue = statValue - statPreconvertedValue - statPreconvertedPercentValue

  const buffValue = valueFn(convertibleValue)
  const finalBuffValue = buffValue - stateValue

  action.conditionalState[conditional.id] = buffValue

  x[statConfig.property].buffDynamic(finalBuffValue, Source.NONE, action, context)
}


*/
