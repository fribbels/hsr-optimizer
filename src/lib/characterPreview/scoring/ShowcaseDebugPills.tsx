import { memo } from 'react'
import classes from './ShowcaseSubstatRolls.module.css'
import { useShowcaseDebugVizStore } from './showcaseDebugVizStore'

const SET_BONUS_MODES = [
  { key: 'b1', label: 'Split' },
  { key: 'b3', label: 'Cool' },
  { key: 'b2', label: 'Basic' },
  { key: 'b4', label: 'Dense' },
  { key: 'b5', label: 'Tight' },
  { key: 'b6', label: 'Plain' },
  { key: 'b7', label: 'Sep' },
  { key: 'b12', label: 'SepFde' },
]

const COLOR_MODES = [
  { key: 'c1', label: 'A' },
  { key: 'c2', label: 'B' },
  { key: 'c3', label: 'C' },
  { key: 'c4', label: 'D' },
  { key: 'c5', label: 'E' },
  { key: 'c6', label: 'F' },
  { key: 'c7', label: 'G' },
  { key: 'c8', label: 'H' },
  { key: 'c9', label: 'I' },
  { key: 'c10', label: 'J' },
  { key: 'c11', label: 'K' },
  { key: 'c12', label: 'L' },
]

const SUBSTAT_ROLLS_MODES = [
  { key: 's1', label: 'Tiers' },
  { key: 's2', label: 'Steps' },
  { key: 's3', label: 'Chunky' },
  { key: 's4', label: 'Skyline' },
  { key: 's5', label: 'Stripe' },
  { key: 's6', label: 'Zones' },
]

export const ShowcaseDebugPills = memo(function ShowcaseDebugPills() {
  const setBonusMode = useShowcaseDebugVizStore((s) => s.setBonusMode)
  const substatRollsMode = useShowcaseDebugVizStore((s) => s.substatRollsMode)
  const setsOnTop = useShowcaseDebugVizStore((s) => s.setsOnTop)
  const showScore = useShowcaseDebugVizStore((s) => s.showScore)
  const colorMode = useShowcaseDebugVizStore((s) => s.colorMode)
  const setSetBonusMode = useShowcaseDebugVizStore((s) => s.setSetBonusMode)
  const setSubstatRollsMode = useShowcaseDebugVizStore((s) => s.setSubstatRollsMode)
  const setColorMode = useShowcaseDebugVizStore((s) => s.setColorMode)
  const toggleSetsOnTop = useShowcaseDebugVizStore((s) => s.toggleSetsOnTop)
  const toggleShowScore = useShowcaseDebugVizStore((s) => s.toggleShowScore)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#888', minWidth: 50 }}>Order</span>
        <div className={classes.debugPills}>
          <button
            className={`${classes.pill} ${setsOnTop ? classes.pillActive : ''}`}
            onClick={() => { if (!setsOnTop) toggleSetsOnTop() }}
          >
            Sets first
          </button>
          <button
            className={`${classes.pill} ${!setsOnTop ? classes.pillActive : ''}`}
            onClick={() => { if (setsOnTop) toggleSetsOnTop() }}
          >
            Rolls first
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#888', minWidth: 50 }}>Score</span>
        <div className={classes.debugPills}>
          <button
            className={`${classes.pill} ${showScore ? classes.pillActive : ''}`}
            onClick={() => { if (!showScore) toggleShowScore() }}
          >
            Show
          </button>
          <button
            className={`${classes.pill} ${!showScore ? classes.pillActive : ''}`}
            onClick={() => { if (showScore) toggleShowScore() }}
          >
            Hide
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#888', minWidth: 50 }}>Sets</span>
        <div className={classes.debugPills}>
          {SET_BONUS_MODES.map((mode) => (
            <button
              key={mode.key}
              className={`${classes.pill} ${setBonusMode === mode.key ? classes.pillActive : ''}`}
              onClick={() => setSetBonusMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#888', minWidth: 50 }}>Rolls</span>
        <div className={classes.debugPills}>
          {SUBSTAT_ROLLS_MODES.map((mode) => (
            <button
              key={mode.key}
              className={`${classes.pill} ${substatRollsMode === mode.key ? classes.pillActive : ''}`}
              onClick={() => setSubstatRollsMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#888', minWidth: 50 }}>Colors</span>
        <div className={classes.debugPills}>
          {COLOR_MODES.map((mode) => (
            <button
              key={mode.key}
              className={`${classes.pill} ${colorMode === mode.key ? classes.pillActive : ''}`}
              onClick={() => setColorMode(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})
