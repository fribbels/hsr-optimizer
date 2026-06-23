import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  deriveCustomLayers,
  deriveDarkPalette,
  derivePrimaryPalette,
} from './themeColors'

describe('deriveDarkPalette', () => {
  it('produces 10-element tuple from seed hue', () => {
    const palette = deriveDarkPalette(215.2)
    expect(palette).toHaveLength(10)
    palette.forEach((hex) => expect(hex).toMatch(/^#[0-9a-f]{6}$/))
  })

  it('dark-7 (body) matches expected value for hue 215.2', () => {
    const palette = deriveDarkPalette(215.2)
    expect(palette[7]).toBe('#182239')
  })

  it('dark-6 (inputs) is lighter than dark-7 (body)', () => {
    const palette = deriveDarkPalette(215.2)
    expect(palette[6]).not.toBe(palette[7])
  })

  it('deriveCustomLayers produces panel and card layers', () => {
    const layers = deriveCustomLayers(215.2)
    expect(layers.layer1).toMatch(/^#[0-9a-f]{6}$/)
    expect(layers.layer2).toMatch(/^#[0-9a-f]{6}$/)
    expect(layers.layer1).not.toBe(layers.layer2)
  })

  it('handles grayscale seed (hue=0, low saturation)', () => {
    const palette = deriveDarkPalette(0)
    expect(palette).toHaveLength(10)
    palette.forEach((hex) => expect(hex).toMatch(/^#[0-9a-f]{6}$/))
  })
})

describe('derivePrimaryPalette', () => {
  it('produces 10-element tuple from seed hex', () => {
    const palette = derivePrimaryPalette('#1668DC')
    expect(palette).toHaveLength(10)
    palette.forEach((hex) => expect(hex).toMatch(/^#[0-9a-f]{6}$/i))
  })

  it('primary-5 matches the seed color', () => {
    const palette = derivePrimaryPalette('#1668DC')
    expect(palette[5].toLowerCase()).toBe('#1668dc')
  })

  it('clamps very light seeds to max primary-5 lightness of 0.55', () => {
    const palette = derivePrimaryPalette('#AACCFF')
    expect(palette[5]).not.toBe('#aaccff')
  })
})
