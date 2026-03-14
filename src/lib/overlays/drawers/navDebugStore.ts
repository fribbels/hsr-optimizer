import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NavDebugConfig {
  // Dimensions
  iconSize: number
  fontSize: number
  groupLabelSize: number
  itemVPadding: number
  itemHPadding: number
  iconLabelGap: number
  sidebarWidth: number
  itemGap: number

  // Active Indicator
  indicatorPosition: 'left' | 'right' | 'background' | 'none'
  indicatorThickness: number
  gradientStrength: number
  indicatorSpeed: number
  activeGlow: boolean
  activeGlowStrength: number

  // Hover
  hoverBg: boolean
  hoverBgOpacity: number
  hoverShift: number

  // Typography
  groupLabelCase: 'uppercase' | 'titlecase' | 'hidden'
  labelWeight: number
  activeLabelWeight: number
  groupLabelSpacing: number

  // Shape
  itemRadius: number
  itemInsetMargin: number
  groupDividers: boolean
  dividerStyle: 'solid' | 'dashed' | 'gradient'
  bottomPinnedLinks: boolean

  // Icon Treatment
  iconContainer: 'none' | 'circle' | 'rounded-square'
  iconContainerSize: number
  iconContainerOpacity: number

  // Sidebar Panel
  panelBgOpacity: number
  panelBorder: boolean
  panelShadow: 'none' | 'subtle' | 'medium' | 'strong'
  panelBlur: number

  // Colors
  accentHue: number
  accentSaturation: number
}

export const NAV_DEBUG_DEFAULTS: NavDebugConfig = {
  iconSize: 17,
  fontSize: 13,
  groupLabelSize: 10,
  itemVPadding: 8,
  itemHPadding: 16,
  iconLabelGap: 9,
  sidebarWidth: 185,
  itemGap: 1,

  indicatorPosition: 'left',
  indicatorThickness: 3,
  gradientStrength: 18,
  indicatorSpeed: 150,
  activeGlow: false,
  activeGlowStrength: 8,

  hoverBg: true,
  hoverBgOpacity: 5,
  hoverShift: 0,

  groupLabelCase: 'uppercase',
  labelWeight: 400,
  activeLabelWeight: 500,
  groupLabelSpacing: 0.08,

  itemRadius: 0,
  itemInsetMargin: 0,
  groupDividers: true,
  dividerStyle: 'gradient',
  bottomPinnedLinks: false,

  iconContainer: 'rounded-square',
  iconContainerSize: 28,
  iconContainerOpacity: 10,

  panelBgOpacity: 100,
  panelBorder: true,
  panelShadow: 'none',
  panelBlur: 0,

  accentHue: 252,
  accentSaturation: 50,
}

export const NAV_DEBUG_PRESETS: Record<string, Partial<NavDebugConfig>> = {
  current: {},
  spacious: {
    iconSize: 20, fontSize: 14, itemVPadding: 11, itemHPadding: 16,
    sidebarWidth: 200, hoverBg: true, hoverBgOpacity: 6, groupDividers: true,
    groupLabelSize: 11, iconLabelGap: 10, itemGap: 2,
  },
  pill: {
    itemRadius: 6, itemInsetMargin: 6, hoverBg: true, hoverBgOpacity: 8,
    itemGap: 2, indicatorPosition: 'background', iconSize: 18,
    gradientStrength: 12, sidebarWidth: 190,
  },
  bold: {
    iconSize: 22, labelWeight: 500, activeLabelWeight: 700,
    indicatorThickness: 4, gradientStrength: 28, fontSize: 14,
    sidebarWidth: 190, itemVPadding: 10,
  },
  compact: {
    iconSize: 14, fontSize: 13, itemVPadding: 5, sidebarWidth: 148,
    groupLabelSize: 9, iconLabelGap: 7, itemGap: 0,
  },
  glass: {
    panelBlur: 12, panelBgOpacity: 60, panelShadow: 'medium',
    hoverBg: true, hoverBgOpacity: 8, itemRadius: 4, itemInsetMargin: 4,
    iconSize: 18, sidebarWidth: 190, accentHue: 220, accentSaturation: 50,
  },
  minimal: {
    indicatorPosition: 'none', groupLabelCase: 'hidden',
    iconSize: 18, fontSize: 13, hoverBg: true, hoverBgOpacity: 4,
    itemVPadding: 9, sidebarWidth: 170, groupDividers: true,
    dividerStyle: 'gradient',
  },
  elevated: {
    iconContainer: 'rounded-square', iconContainerSize: 30, iconContainerOpacity: 12,
    iconSize: 16, fontSize: 14, itemVPadding: 8, sidebarWidth: 200,
    panelShadow: 'strong', hoverBg: true, activeGlow: true,
    itemGap: 2, groupDividers: true,
  },
  stripe: {
    iconSize: 18, fontSize: 14, labelWeight: 500, sidebarWidth: 210,
    itemVPadding: 10, itemHPadding: 18, groupDividers: true, dividerStyle: 'gradient',
    groupLabelSize: 11, hoverBg: true, hoverBgOpacity: 5, itemGap: 2,
    indicatorThickness: 3, gradientStrength: 14,
  },
  neon: {
    accentHue: 280, accentSaturation: 70, activeGlow: true, activeGlowStrength: 12,
    gradientStrength: 30, indicatorThickness: 3, hoverBg: true, hoverBgOpacity: 10,
    iconSize: 18, sidebarWidth: 180, panelShadow: 'medium', itemVPadding: 9,
  },
  warm: {
    accentHue: 25, accentSaturation: 55, itemRadius: 8, itemInsetMargin: 6,
    hoverBg: true, hoverBgOpacity: 8, iconSize: 18, sidebarWidth: 190,
    itemVPadding: 9, groupDividers: true, dividerStyle: 'gradient', itemGap: 2,
  },
  ocean: {
    accentHue: 200, accentSaturation: 50, iconSize: 18, sidebarWidth: 195,
    hoverBg: true, hoverBgOpacity: 6, labelWeight: 500,
    groupDividers: true, dividerStyle: 'solid', itemVPadding: 9,
    panelShadow: 'subtle', indicatorThickness: 3,
  },
  mono: {
    accentSaturation: 12, iconSize: 17, fontSize: 13, sidebarWidth: 175,
    hoverBg: true, hoverBgOpacity: 4, groupLabelCase: 'hidden',
    indicatorPosition: 'background', gradientStrength: 8, itemVPadding: 9,
  },
  dashboard: {
    iconContainer: 'rounded-square', iconContainerSize: 32, iconContainerOpacity: 12,
    iconSize: 17, fontSize: 14, sidebarWidth: 215, itemVPadding: 10,
    itemHPadding: 16, panelShadow: 'subtle', hoverBg: true, hoverBgOpacity: 6,
    groupDividers: true, itemGap: 3, groupLabelSize: 11, labelWeight: 500,
    bottomPinnedLinks: true,
  },
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function configToCssVars(c: NavDebugConfig): React.CSSProperties {
  const h = c.accentHue
  const s = c.accentSaturation
  const colorsChanged = h !== NAV_DEBUG_DEFAULTS.accentHue || s !== NAV_DEBUG_DEFAULTS.accentSaturation

  const vars: Record<string, string> = {
    // Dimensions
    '--dbg-icon-size': `${c.iconSize}px`,
    '--dbg-font-size': `${c.fontSize}px`,
    '--dbg-group-font-size': `${c.groupLabelSize}px`,
    '--dbg-item-v-pad': `${c.itemVPadding}px`,
    '--dbg-item-h-pad': `${c.itemHPadding}px`,
    '--dbg-icon-gap': `${c.iconLabelGap}px`,
    '--dbg-item-gap': `${c.itemGap}px`,
    '--dbg-item-radius': `${c.itemRadius}px`,
    '--dbg-item-inset': `${c.itemInsetMargin}px`,
    '--dbg-indicator-thickness': `${c.indicatorThickness}px`,
    '--dbg-indicator-speed': `${c.indicatorSpeed}ms`,
    '--dbg-group-spacing': `${c.groupLabelSpacing}em`,
    '--dbg-label-weight': String(c.labelWeight),
    '--dbg-active-weight': String(c.activeLabelWeight),
    '--dbg-hover-shift': `${c.hoverShift}px`,
    '--dbg-icon-container-size': `${c.iconContainerSize}px`,

    // Computed colors (always needed for gradients/effects)
    '--dbg-indicator-bg': c.indicatorPosition === 'none'
      ? 'none'
      : `linear-gradient(90deg, hsla(${h}, ${s}%, 55%, ${c.gradientStrength / 100}), hsla(${h}, ${s}%, 55%, ${c.gradientStrength / 300}))`,
    '--dbg-indicator-bg-reverse': `linear-gradient(270deg, hsla(${h}, ${s}%, 55%, ${c.gradientStrength / 100}), hsla(${h}, ${s}%, 55%, ${c.gradientStrength / 300}))`,
    '--dbg-hover-bg': c.hoverBg
      ? `hsla(${h}, ${s}%, 55%, ${c.hoverBgOpacity / 100})`
      : 'transparent',
    '--dbg-icon-container-bg': c.iconContainer !== 'none'
      ? `hsla(${h}, 30%, 50%, ${c.iconContainerOpacity / 100})`
      : 'transparent',
    '--dbg-glow-color': c.activeGlow
      ? `hsla(${h}, ${s}%, 55%, 0.25)`
      : 'transparent',
    '--dbg-glow-strength': `${c.activeGlowStrength}px`,
    '--dbg-divider-gradient': `linear-gradient(90deg, transparent, hsla(${h}, ${clamp(s - 10, 10, 100)}%, 40%, 0.3), transparent)`,
  }

  // Only override nav color tokens when user has changed hue/saturation,
  // so the Mantine primary palette vars from tokens.css are used at defaults
  if (colorsChanged) {
    vars['--nav-accent'] = `hsl(${h}, ${clamp(s, 10, 100)}%, 55%)`
    vars['--nav-accent-subtle'] = `hsl(${h}, ${clamp(s, 10, 100)}%, 44%)`
    vars['--nav-text-muted'] = `hsl(${h}, ${clamp(s * 0.4, 10, 100)}%, 57%)`
    vars['--nav-text-hover'] = `hsl(${h}, ${clamp(s * 1.15, 10, 100)}%, 82%)`
    vars['--nav-text-active'] = `hsl(${h}, ${clamp(s * 0.4, 10, 100)}%, 89%)`
    vars['--nav-group-label'] = `hsl(${h}, ${clamp(s * 0.4, 10, 100)}%, 39%)`
    vars['--nav-separator'] = `hsl(${h}, ${clamp(s * 0.3, 10, 100)}%, 15%)`
  }

  return vars as React.CSSProperties
}

export function configToDataAttrs(c: NavDebugConfig): Record<string, string | undefined> {
  return {
    'data-indicator': c.indicatorPosition,
    'data-group-case': c.groupLabelCase,
    'data-dividers': c.groupDividers ? c.dividerStyle : undefined,
    'data-icon-container': c.iconContainer !== 'none' ? c.iconContainer : undefined,
    'data-active-glow': c.activeGlow ? '' : undefined,
    'data-bottom-pinned': c.bottomPinnedLinks ? '' : undefined,
  }
}

export function generateCSSExport(c: NavDebugConfig): string {
  const d = NAV_DEBUG_DEFAULTS
  const lines: string[] = []
  const px = (key: keyof NavDebugConfig, varName: string) => {
    if (c[key] !== d[key]) lines.push(`  ${varName}: ${c[key]}px;`)
  }

  lines.push('/* Nav Design — exported from debug panel */')
  lines.push(':root {')
  px('iconSize', '--nav-icon-size')
  px('fontSize', '--nav-font-size')
  px('groupLabelSize', '--nav-group-font-size')
  px('itemVPadding', '--nav-item-v-padding')
  px('itemHPadding', '--nav-item-h-padding')
  px('iconLabelGap', '--nav-icon-gap')
  px('sidebarWidth', '--nav-sidebar-width')
  px('itemGap', '--nav-item-gap')
  px('indicatorThickness', '--nav-indicator-thickness')
  px('itemRadius', '--nav-item-radius')
  px('itemInsetMargin', '--nav-item-inset')
  if (c.labelWeight !== d.labelWeight) lines.push(`  --nav-label-weight: ${c.labelWeight};`)
  if (c.activeLabelWeight !== d.activeLabelWeight) lines.push(`  --nav-active-weight: ${c.activeLabelWeight};`)
  if (c.accentHue !== d.accentHue || c.accentSaturation !== d.accentSaturation) {
    const h = c.accentHue
    const s = c.accentSaturation
    lines.push(`  --nav-accent: hsl(${h}, ${s}%, 55%);`)
    lines.push(`  --nav-accent-subtle: hsl(${h}, ${s}%, 44%);`)
  }
  lines.push('}')
  return lines.length > 3 ? lines.join('\n') : '/* No changes from defaults */'
}

type NavDebugStore = NavDebugConfig & {
  set: (partial: Partial<NavDebugConfig>) => void
  applyPreset: (name: string) => void
  reset: () => void
  randomize: () => void
}

export const useNavDebugStore = create<NavDebugStore>()(
  persist(
    (set) => ({
      ...NAV_DEBUG_DEFAULTS,
      set: (partial) => set(partial),
      applyPreset: (name) => {
        const preset = NAV_DEBUG_PRESETS[name]
        if (preset) set({ ...NAV_DEBUG_DEFAULTS, ...preset })
      },
      reset: () => set({ ...NAV_DEBUG_DEFAULTS }),
      randomize: () => {
        const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min))
        const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
        set({
          iconSize: rand(14, 24),
          fontSize: rand(12, 16),
          groupLabelSize: rand(9, 14),
          itemVPadding: rand(5, 14),
          itemHPadding: rand(10, 24),
          iconLabelGap: rand(6, 16),
          sidebarWidth: rand(150, 220),
          itemGap: rand(0, 4),
          indicatorPosition: pick(['left', 'right', 'background', 'none']),
          indicatorThickness: rand(1, 4),
          gradientStrength: rand(5, 35),
          indicatorSpeed: rand(80, 350),
          activeGlow: Math.random() > 0.5,
          activeGlowStrength: rand(4, 16),
          hoverBg: Math.random() > 0.3,
          hoverBgOpacity: rand(3, 15),
          hoverShift: rand(0, 4),
          groupLabelCase: pick(['uppercase', 'titlecase', 'hidden']),
          labelWeight: pick([400, 500, 600]),
          activeLabelWeight: pick([500, 600, 700]),
          groupLabelSpacing: Number((Math.random() * 0.12).toFixed(2)),
          itemRadius: rand(0, 8),
          itemInsetMargin: rand(0, 8),
          groupDividers: Math.random() > 0.4,
          dividerStyle: pick(['solid', 'dashed', 'gradient']),
          bottomPinnedLinks: Math.random() > 0.6,
          iconContainer: pick(['none', 'none', 'circle', 'rounded-square']),
          iconContainerSize: rand(26, 34),
          iconContainerOpacity: rand(6, 20),
          panelBgOpacity: rand(60, 100),
          panelBorder: Math.random() > 0.3,
          panelShadow: pick(['none', 'none', 'subtle', 'medium', 'strong']),
          panelBlur: rand(0, 10),
          accentHue: rand(0, 360),
          accentSaturation: rand(20, 70),
        })
      },
    }),
    {
      name: 'nav-debug-config-v2',
      merge: (persisted, current) => ({ ...current, ...(persisted as object) }),
    },
  ),
)
