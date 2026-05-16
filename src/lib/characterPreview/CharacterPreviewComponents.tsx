import { type CSSProperties } from 'react'
import componentClasses from './CharacterPreviewComponents.module.css'

export enum ShowcaseSource {
  CHARACTER_TAB,
  SHOWCASE_TAB,
  BUILDS_MODAL,
}

const showcaseShadowDefault = 'none'
const showcaseShadowInsetDefault = ''

// Use CSS custom properties so the debug slider panel can override these
export const showcaseShadow = `var(--showcase-shadow, ${showcaseShadowDefault})`
export const showcaseShadowInsetAddition = `var(--showcase-shadow-inset, ${showcaseShadowInsetDefault})`
export const showcaseTransition = 'background-color 0.35s, border-color 0.25s'
export const showcaseOutlineLight = 'rgba(255, 255, 255, 0.20) solid 1px'
export const showcaseButtonStyle: CSSProperties = {
  flex: 'auto',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  visibility: 'hidden',
}

const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII='
const BASE_RADIUS = 6

export enum ShadowRingSide {
  INNER = 'inner',
  OUTER = 'outer',
}

interface ShadowRingDef {
  inset: number
  color: string
  side: ShadowRingSide
}

const SHADOW_RING_CONFIG: ShadowRingDef[] = [
  { inset: 0, color: 'rgba(255, 255, 255, 0.10)', side: ShadowRingSide.INNER },
  { inset: 1, color: 'rgba(0, 0, 0, 0.30)', side: ShadowRingSide.OUTER },
  { inset: 2, color: 'rgba(0, 0, 0, 0.15)', side: ShadowRingSide.OUTER },
  { inset: 3, color: 'rgba(0, 0, 0, 0.05)', side: ShadowRingSide.OUTER },
]

const INNER_RINGS = SHADOW_RING_CONFIG.filter((r) => r.side === ShadowRingSide.INNER)
const OUTER_RINGS = SHADOW_RING_CONFIG.filter((r) => r.side === ShadowRingSide.OUTER)

function getRings(side?: ShadowRingSide) {
  if (side === ShadowRingSide.INNER) return INNER_RINGS
  if (side === ShadowRingSide.OUTER) return OUTER_RINGS
  return SHADOW_RING_CONFIG
}

interface ShadowRingsProps {
  side?: ShadowRingSide
}

export function ShadowRings({ side }: ShadowRingsProps = {}) {
  return getRings(side).map((ring, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        inset: ring.side === ShadowRingSide.INNER ? 0 : -ring.inset,
        borderRadius: BASE_RADIUS + ring.inset - 1,
        ...(ring.side === ShadowRingSide.INNER
          ? { border: `1px solid ${ring.color}` }
          : { outline: `1px solid ${ring.color}` }
        ),
        backgroundImage: `url('${TRANSPARENT_PNG}')`,
        backgroundSize: '100% 100%',
        pointerEvents: 'none',
      }}
    />
  ))
}

const BORDER_INSET_ADJUST = 1

export function OuterShadowRingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      {OUTER_RINGS.map((ring, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: -(ring.inset - BORDER_INSET_ADJUST),
            borderRadius: BASE_RADIUS + ring.inset - 1,
            outline: `1px solid ${ring.color}`,
            backgroundImage: `url('${TRANSPARENT_PNG}')`,
            backgroundSize: '100% 100%',
            pointerEvents: 'none',
          }}
        />
      ))}
      {children}
    </div>
  )
}

export function OverlayText({ text, top }: {
  text: string,
  top: number,
}) {
  return (
    <div
      className={componentClasses.overlayOuter}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', top }}
    >
      <div className={componentClasses.overlayLabel}>
        {text}
      </div>
    </div>
  )
}
