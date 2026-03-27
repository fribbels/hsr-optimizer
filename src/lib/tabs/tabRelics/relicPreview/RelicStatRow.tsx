import { type SubStats } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import { Renderer } from 'lib/rendering/renderer'
import { isFlat } from 'lib/utils/statUtils'
import type { TFunction } from 'i18next'
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

export function RelicStatRow({ stat, main, relic, isPreview = false, t }: { stat: SubstatDetails; main: boolean; relic: Relic; isPreview?: boolean; t: TFunction }) {
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
}

function generateRolls(stat: SubstatDetails) {
  if (!stat.addedRolls) {
    return <div></div>
  }

  const count = stat.addedRolls
  const step = 5
  const chevronSize = 10
  const totalWidth = step * (count - 1) + chevronSize
  const scale = chevronSize / 24

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={totalWidth} height={chevronSize} viewBox={`0 0 ${totalWidth} ${chevronSize}`} style={{ opacity: 0.75 }}>
      {Array.from({ length: count }, (_, i) => (
        <g key={i} transform={`translate(${i * step} 0) scale(${scale})`}>
          <g transform="translate(24 1) scale(-1 1)">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" d="M8 12L15 5M8 12L15 19" />
          </g>
        </g>
      ))}
    </svg>
  )
}
