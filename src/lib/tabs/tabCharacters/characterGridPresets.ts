import type { CSSProperties } from 'react'

export type CharacterGridDensity = 'default' | 'compact'

export type CharacterGridPreset = {
  listWidth: number,
  rowHeight: number,
  rowGap: number,
  padding: number,
  innerGap: number,
  portraitScale: number,
  portraitX: number,
  portraitY: number,
  lcSize: number,
  lcStripWidth: number,
  fontSize: number,
  lineHeight: number,
  subtitleGap: number,
  subtitleFontFamily: string,
  subtitleFontSize: number,
  subtitleLineHeight: number,
  frostFadeStart: number,
  frostFadeEnd: number,
}

export const characterGridPresets: Record<CharacterGridDensity, CharacterGridPreset> = {
  default: {
    listWidth: 300,
    rowHeight: 68,
    rowGap: 1,
    padding: 8,
    innerGap: 10,
    portraitScale: 66,
    portraitX: 40,
    portraitY: 30,
    lcSize: 52,
    lcStripWidth: 54,
    fontSize: 13,
    lineHeight: 1.4,
    subtitleGap: 1,
    subtitleFontFamily: 'Consolas, Menlo, Monaco, monospace',
    subtitleFontSize: 12,
    subtitleLineHeight: 1.4,
    frostFadeStart: 27,
    frostFadeEnd: 42,
  },
  compact: {
    listWidth: 300,
    rowHeight: 48,
    rowGap: 0,
    padding: 8,
    innerGap: 8,
    portraitScale: 50,
    portraitX: 40,
    portraitY: 32,
    lcSize: 48,
    lcStripWidth: 52,
    fontSize: 12,
    lineHeight: 1.4,
    subtitleGap: 0,
    subtitleFontFamily: 'Consolas, Menlo, Monaco, monospace',
    subtitleFontSize: 11,
    subtitleLineHeight: 1.2,
    frostFadeStart: 30,
    frostFadeEnd: 54,
  },
}

function presetToCssVars(preset: CharacterGridPreset): CSSProperties {
  return {
    '--cr-list-width': `${preset.listWidth}px`,
    '--cr-row-height': `${preset.rowHeight}px`,
    '--cr-row-gap': `${preset.rowGap}px`,
    '--cr-padding': `${preset.padding}px`,
    '--cr-gap': `${preset.innerGap}px`,
    '--cr-portrait-scale': `${preset.portraitScale}%`,
    '--cr-portrait-x': `${preset.portraitX}%`,
    '--cr-portrait-y': `${preset.portraitY}%`,
    '--cr-lc-size': `${preset.lcSize}px`,
    '--cr-lc-strip-width': `${preset.lcStripWidth}px`,
    '--cr-font-size': `${preset.fontSize}px`,
    '--cr-line-height': `${preset.lineHeight}`,
    '--cr-subtitle-gap': `${preset.subtitleGap}px`,
    '--cr-subtitle-font-family': preset.subtitleFontFamily,
    '--cr-subtitle-font-size': `${preset.subtitleFontSize}px`,
    '--cr-subtitle-line-height': `${preset.subtitleLineHeight}`,
    '--cr-frost-fade-start': `${preset.frostFadeStart}%`,
    '--cr-frost-fade-end': `${preset.frostFadeEnd}%`,
  } as CSSProperties
}

export const precomputedCssVars: Record<CharacterGridDensity, CSSProperties> = {
  default: presetToCssVars(characterGridPresets.default),
  compact: presetToCssVars(characterGridPresets.compact),
}
