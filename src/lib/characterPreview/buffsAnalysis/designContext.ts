import { BUFF_TYPE } from 'lib/optimization/buffSource'
import type { DamageTag } from 'lib/optimization/engine/config/tag'
import type React from 'react'
import { createContext } from 'react'

const cardShadow = 'var(--shadow-card)'

type DesignOptions = {
  rowHeight: number,
  iconSize: number,
  tintIntensity: number,
  panelWidth: number,
  rowPaddingX: number,
  fontSize: number,
  borderColor: string,
  cardPadding: number,
}

const BORDER_RADIUS = 6
export const GROUP_SPACING = 10

export const TEXT_DIM = '#ffffff40'
export const TEXT_SECONDARY = '#ffffff73'
export const TEXT_PRIMARY = '#ffffffd9'

export const GROUP_ORDER: BUFF_TYPE[] = [
  BUFF_TYPE.PRIMARY,
  BUFF_TYPE.SETS,
  BUFF_TYPE.CHARACTER,
  BUFF_TYPE.LIGHTCONE,
]

export const PILL_SIZE = { padding: '0 4px', fontSize: 9, lineHeight: '16px' } as const

export const DEFAULT_OPTIONS: DesignOptions = {
  rowHeight: 26,
  iconSize: 48,
  tintIntensity: 15,
  panelWidth: 600,
  rowPaddingX: 6,
  fontSize: 12,
  borderColor: '#ffffff0f',
  cardPadding: 3,
}

export const DesignContext = createContext<DesignOptions>(DEFAULT_OPTIONS)
export const FilterContext = createContext<DamageTag | null>(null)
export const FilterChangeContext = createContext<((f: DamageTag | null) => void) | null>(null)

export const ellipsisStyle = (fontSize: number): React.CSSProperties => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textWrap: 'nowrap',
  fontSize,
})

export function getCardStyle(options: DesignOptions, token: { colorBgContainer: string }): React.CSSProperties {
  return {
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    padding: options.cardPadding,
    backgroundColor: token.colorBgContainer,
    boxShadow: cardShadow,
  }
}

export function getRowBaseStyle(options: DesignOptions): React.CSSProperties {
  return {
    padding: `0 ${options.rowPaddingX}px`,
    height: options.rowHeight,
    lineHeight: `${options.rowHeight}px`,
  }
}

export function getIconStyle(options: DesignOptions): React.CSSProperties {
  return {
    width: options.iconSize,
    height: options.iconSize,
    flexShrink: 0,
    objectFit: 'cover',
    margin: '0 4px',
  }
}

export function getSourceLabelStyle(options: DesignOptions): React.CSSProperties {
  return {
    marginLeft: 'auto',
    color: TEXT_SECONDARY,
    fontSize: options.fontSize,
    textWrap: 'nowrap',
    flexShrink: 0,
  }
}
