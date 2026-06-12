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
