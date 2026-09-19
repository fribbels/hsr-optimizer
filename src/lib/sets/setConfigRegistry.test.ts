import {
  type Sets,
  type SetKey,
  ConditionalDataType,
} from 'lib/constants/constants'
import {
  assertSetConfigCountCapacity,
  assertValidSetConfigList,
  assertValidSetConfigRegistry,
  MAX_ORNAMENT_SET_COUNT,
  MAX_RELIC_SET_COUNT,
} from 'lib/sets/setConfigRegistry'
import { type SetConfig, SetType } from 'types/setConfig'
import {
  describe,
  expect,
  it,
} from 'vitest'

function makeConfig(
  setKey: string,
  id: string,
  index: number,
  setType: SetType = SetType.RELIC,
): SetConfig {
  return {
    id: id as unknown as Sets,
    setKey: setKey as unknown as SetKey,
    info: {
      index,
      setType,
      ingameId: String(index),
      twoPieceStatTag: null,
    },
    conditionals: {},
    display: {
      conditionalType: ConditionalDataType.BOOLEAN,
      defaultValue: false,
    },
  }
}

describe('assertValidSetConfigList', () => {
  it('accepts a list with unique setKeys, unique ids, and contiguous indices from 0', () => {
    const configs = [
      makeConfig('KeyA', 'IdA', 0),
      makeConfig('KeyB', 'IdB', 1),
      makeConfig('KeyC', 'IdC', 2),
    ]
    expect(() => assertValidSetConfigList(configs, 'TEST', SetType.RELIC)).not.toThrow()
  })

  it('accepts a list regardless of input order, as long as indices are contiguous from 0', () => {
    const configs = [
      makeConfig('KeyC', 'IdC', 2),
      makeConfig('KeyA', 'IdA', 0),
      makeConfig('KeyB', 'IdB', 1),
    ]
    expect(() => assertValidSetConfigList(configs, 'TEST', SetType.RELIC)).not.toThrow()
  })

  it('rejects a duplicate setKey', () => {
    const configs = [
      makeConfig('KeyA', 'IdA', 0),
      makeConfig('KeyA', 'IdB', 1),
    ]
    expect(() => assertValidSetConfigList(configs, 'TEST', SetType.RELIC)).toThrow(/duplicate setKey/)
  })

  it('rejects a duplicate id', () => {
    const configs = [
      makeConfig('KeyA', 'IdA', 0),
      makeConfig('KeyB', 'IdA', 1),
    ]
    expect(() => assertValidSetConfigList(configs, 'TEST', SetType.RELIC)).toThrow(/duplicate id/)
  })

  it('rejects a duplicate index', () => {
    const configs = [
      makeConfig('KeyA', 'IdA', 0),
      makeConfig('KeyB', 'IdB', 0),
    ]
    expect(() => assertValidSetConfigList(configs, 'TEST', SetType.RELIC)).toThrow(/duplicate index/)
  })

  it('rejects a gap in the index sequence', () => {
    const configs = [
      makeConfig('KeyA', 'IdA', 0),
      makeConfig('KeyB', 'IdB', 1),
      makeConfig('KeyC', 'IdC', 3),
    ]
    expect(() => assertValidSetConfigList(configs, 'TEST', SetType.RELIC)).toThrow(/contiguous from 0/)
  })

  it('rejects indices that do not start at 0', () => {
    const configs = [
      makeConfig('KeyA', 'IdA', 1),
      makeConfig('KeyB', 'IdB', 2),
      makeConfig('KeyC', 'IdC', 3),
    ]
    expect(() => assertValidSetConfigList(configs, 'TEST', SetType.RELIC)).toThrow(/contiguous from 0/)
  })

  it('accepts an empty list', () => {
    expect(() => assertValidSetConfigList([], 'TEST', SetType.RELIC)).not.toThrow()
  })

  it('rejects a member whose setType does not match its family', () => {
    const configs = [makeConfig('KeyA', 'IdA', 0, SetType.ORNAMENT)]
    expect(() => assertValidSetConfigList(configs, 'TEST_RELICS', SetType.RELIC)).toThrow(
      /has setType 'ornament', expected 'relic'/,
    )
  })

})

describe('assertValidSetConfigRegistry', () => {
  it('rejects a cross-family setKey collision', () => {
    const relics = [makeConfig('SharedKey', 'RelicId', 0)]
    const ornaments = [makeConfig('SharedKey', 'OrnamentId', 0, SetType.ORNAMENT)]
    expect(() => assertValidSetConfigRegistry(relics, ornaments)).toThrow(/duplicate setKey.*across families/)
  })

  it('rejects a cross-family id collision', () => {
    const relics = [makeConfig('RelicKey', 'SharedId', 0)]
    const ornaments = [makeConfig('OrnamentKey', 'SharedId', 0, SetType.ORNAMENT)]
    expect(() => assertValidSetConfigRegistry(relics, ornaments)).toThrow(/duplicate id.*across families/)
  })
})

describe('assertSetConfigCountCapacity', () => {
  it('accepts the largest counts below a flattened filter length of 2^32', () => {
    expect(() => assertSetConfigCountCapacity(MAX_RELIC_SET_COUNT, MAX_ORNAMENT_SET_COUNT)).not.toThrow()
  })

  it('rejects a relic count requiring a flattened filter length of 2^32', () => {
    expect(() => assertSetConfigCountCapacity(MAX_RELIC_SET_COUNT + 1, 0)).toThrow(/Relic set count 256 exceeds maximum 255/)
  })

  it('rejects an ornament count requiring a flattened filter length of 2^32', () => {
    expect(() => assertSetConfigCountCapacity(0, MAX_ORNAMENT_SET_COUNT + 1)).toThrow(
      /Ornament set count 65536 exceeds maximum 65535/,
    )
  })
})
