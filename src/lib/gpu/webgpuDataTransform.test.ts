import {
  Parts,
  Sets,
  type Sets as SetId,
} from 'lib/constants/constants'
import { mergeRelicsIntoArray } from 'lib/gpu/webgpuDataTransform'
import {
  SetsOrnamentsNames,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import { type Relic } from 'types/relic'
import {
  describe,
  expect,
  it,
} from 'vitest'

function makeSerializableRelic(part: Relic['part'], set: SetId): Relic {
  return {
    part,
    set,
    condensedStats: [],
  } as unknown as Relic
}

describe('GPU relic set serialization', () => {
  it('serializes valid relic and ornament sets into their unchanged family-local indices', () => {
    const relicSet = Sets.PasserbyOfWanderingCloud
    const ornamentSet = Sets.SpaceSealingStation
    const serialized = mergeRelicsIntoArray({
      Head: [makeSerializableRelic(Parts.Head, relicSet)],
      Hands: [],
      Body: [],
      Feet: [],
      PlanarSphere: [makeSerializableRelic(Parts.PlanarSphere, ornamentSet)],
      LinkRope: [],
    })

    expect(serialized).toHaveLength(48)
    expect(serialized.at(22)).toBe(SetsRelicsNames.indexOf(relicSet))
    expect(serialized.at(46)).toBe(SetsOrnamentsNames.indexOf(ornamentSet))
  })
})
