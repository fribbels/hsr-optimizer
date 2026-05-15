import { describe, expect, it } from 'vitest'
import {
  INSET_OPACITY,
  NATURAL_PRESET,
  SHADOW_OPACITY,
  SHINE_PRESET,
} from './debugVisualConfigStore'
import { showcaseShadow } from './CharacterPreviewComponents'

describe('showcase shadow defaults', () => {
  it('uses a soft shadow opacity so mobile WebKit does not render black halos', () => {
    expect(SHADOW_OPACITY).toBe(0.25)
    expect(SHINE_PRESET.shadowOpacity).toBe(SHADOW_OPACITY)
    expect(NATURAL_PRESET.shadowOpacity).toBe(SHADOW_OPACITY)
  })

  it('keeps the CSS variable fallback translucent', () => {
    expect(showcaseShadow).toContain('rgba(0, 0, 0, 0.25)')
    expect(showcaseShadow).not.toContain('rgb(0, 0, 0) 1px')
  })

  it('keeps the inner highlight visible without making it the primary shadow', () => {
    expect(INSET_OPACITY).toBe(0.30)
  })
})
