import type { TFunction } from 'i18next'
import { type SubStats } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { Renderer } from 'lib/rendering/renderer'
import { isFlat } from 'lib/utils/statUtils'
import React, { memo } from 'react'
import iconClasses from 'style/icons.module.css'
import type {
  Relic,
  StatRolls,
} from 'types/relic'
import styles from './RelicStatRow.module.css'

export type SubstatDetails = {
  stat: SubStats,
  value: number,
  rolls?: StatRolls,
  addedRolls?: number,
}

export const RelicStatRow = memo(
  function RelicStatRow({ stat, main, relic, isPreview = false, t }: { stat: SubstatDetails, main: boolean, relic: Relic, isPreview?: boolean, t: TFunction }) {
    if (!stat?.stat || stat.value == null) {
      return (
        <img
          src={Assets.getBlank()}
          className={iconClasses.statIcon}
        />
      )
    }

    let displayValue
    if (main) {
      displayValue = Renderer.renderMainStatNumber(stat)
    } else {
      displayValue = Renderer.renderSubstatNumber(stat, relic)
    }
    displayValue += isFlat(stat.stat) ? '' : '%'

    return (
      <div className={styles.row} style={isPreview ? { opacity: 0.4 } : undefined}>
        <div className={styles.statLabel}>
          <img
            src={Assets.getStatIcon(stat.stat)}
            className={iconClasses.statIcon}
          />
          {t(`ReadableStats.${stat.stat}`)}
        </div>
        {!main
          ? (
            <div className={styles.substatValue}>
              <div className={styles.rollsContainer}>
                {generateRolls(stat)}
              </div>
              {displayValue}
            </div>
          )
          : <>{displayValue}</>}
      </div>
    )
  },
)

// Pre-computed SVG chevrons
const chevronStyle = { opacity: 0.75 }
const chevronPath = <path fill='none' stroke='currentColor' strokeLinecap='round' strokeWidth='3' d='M8 12L15 5M8 12L15 19' />
const scale = 10 / 24

const CHEVRON_SVGS: Record<number, React.JSX.Element> = {
  1: (
    <svg xmlns='http://www.w3.org/2000/svg' width={10} height={10} viewBox='0 0 10 10' style={chevronStyle}>
      <g transform={`scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
    </svg>
  ),
  2: (
    <svg xmlns='http://www.w3.org/2000/svg' width={15} height={10} viewBox='0 0 15 10' style={chevronStyle}>
      <g transform={`translate(0 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(5 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
    </svg>
  ),
  3: (
    <svg xmlns='http://www.w3.org/2000/svg' width={20} height={10} viewBox='0 0 20 10' style={chevronStyle}>
      <g transform={`translate(0 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(5 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(10 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
    </svg>
  ),
  4: (
    <svg xmlns='http://www.w3.org/2000/svg' width={25} height={10} viewBox='0 0 25 10' style={chevronStyle}>
      <g transform={`translate(0 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(5 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(10 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(15 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
    </svg>
  ),
  5: (
    <svg xmlns='http://www.w3.org/2000/svg' width={30} height={10} viewBox='0 0 30 10' style={chevronStyle}>
      <g transform={`translate(0 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(5 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(10 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(15 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
      <g transform={`translate(20 0) scale(${scale})`}>
        <g transform='translate(24 1) scale(-1 1)'>{chevronPath}</g>
      </g>
    </svg>
  ),
}

function generateRolls(stat: SubstatDetails) {
  return stat.addedRolls ? CHEVRON_SVGS[stat.addedRolls] : null
}
