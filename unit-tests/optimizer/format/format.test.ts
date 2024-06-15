import { deserialize, serialize } from 'lib/optimizer/new/format'
import { ObjectMapper } from 'lib/optimizer/new/format/serializer'
import { OptimizationRequest } from 'lib/optimizer/new/request'
import { BasicPercentageStats } from 'lib/optimizer/new/stats/basicStat'
import { Trait } from 'lib/optimizer/new/stats/context'
import { StatAggregator } from 'lib/optimizer/new/stats/stat'
import { describe, expect, test } from 'vitest'
import { limited } from '../jingliu'

describe('serialization', () => {

  test('basicPercentageClass', () => {
    const zero = new BasicPercentageStats(90, {
      atk: 900,
      hp: 800,
      def: 700,
      speed: 600,
    })

    expect(JSON.stringify(JSON.parse(serialize(zero)), null, 4), 'serialization should be stable').toMatchSnapshot()

    expect(zero.atk).toEqual(deserialize<BasicPercentageStats>(serialize(zero)).atk)
  })

  test('statCollector', () => {
    const zero = StatAggregator.zero({
      basic: {
        lv: 90,
        base: {
          atk: 900,
          hp: 800,
          def: 700,
          speed: 600,
        },
      },
      traits: [Trait.DOT_BLEED, Trait.FOLLOW_UP, Trait.NORMAL],
      maxEnergy: 120,
      targetBaseDef: 200 + 10 * 95,
    })
    zero.add({
      basic: {
        percent: {
          atk: 0.37,
        },
      },
    })

    expect(serialize(zero), 'serialized form should contain class name metadata').toContain('__serializable_name')

    expect(zero, 'serialization should be invariant')
      .toMatchObject<StatAggregator>(deserialize(serialize(zero)))
  })

  test('Optimization Request', () => {
    const optimizationRequest = limited
    const newReq = deserialize<OptimizationRequest>(structuredClone(serialize(optimizationRequest)))
    expect(
      newReq.formula.calculate([], [], []),
      `optimization request should be safe passing through structuredClone`,
    ).toMatchObject(optimizationRequest.formula.calculate([], [], []))
  })

  test('ObjectMapper Class', () => {
    const mapper = new ObjectMapper()
    mapper.support(limited)
    const serialized = mapper.serialize(limited)

    expect(serialized, 'ObjectMapper support should works with deserialization').toMatchObject(serialize(limited))
  })
})
