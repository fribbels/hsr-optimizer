import { uniformDistribution } from 'lib/relics/estTbp/convolution'
import { expect, test } from 'vitest'

test('uniform distribution adds up to 1', () => {
  const dist = uniformDistribution([1, 2, 3])
  const p = [...dist.values()].reduce((acc, cur) => acc + cur)
  expect(p).toBeCloseTo(1.0)
})
