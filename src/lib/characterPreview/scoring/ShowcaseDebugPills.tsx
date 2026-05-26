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
  { key: 'b14', label: 'Mid' },
  { key: 'b13', label: 'Combo' },
  { key: 'b0', label: 'None' },
]

const ALPHA_MODES = [
  { key: 0.50, label: '.50' },
  { key: 0.60, label: '.60' },
  { key: 0.70, label: '.70' },
  { key: 0.75, label: '.75' },
  { key: 0.80, label: '.80' },
  { key: 0.85, label: '.85' },
  { key: 0.90, label: '.90' },
  { key: 0.95, label: '.95' },
  { key: 1.00, label: '1.0' },
]

const COLOR_MODES = [
  { key: 'c2', label: 'Vivid' },
  { key: 'c11', label: 'Shift' },
  { key: 'c6', label: 'Spread' },
  { key: 'c3', label: 'Soft' },
  { key: 'c3a', label: 'Softer' },
  { key: 'c3c', label: 'Pastel' },
  { key: 'c3b', label: 'Whispr' },
  { key: 'c3d', label: 'Ghost' },
  { key: 'c9', label: 'Tinted' },
  { key: 'c10', label: 'Steep' },
  { key: 'c12', label: 'Fade' },
  { key: 'c8', label: 'Punch' },
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
  const colorAlpha = useShowcaseDebugVizStore((s) => s.colorAlpha)
  const setSetBonusMode = useShowcaseDebugVizStore((s) => s.setSetBonusMode)
  const setSubstatRollsMode = useShowcaseDebugVizStore((s) => s.setSubstatRollsMode)
  const setColorMode = useShowcaseDebugVizStore((s) => s.setColorMode)
  const setColorAlpha = useShowcaseDebugVizStore((s) => s.setColorAlpha)
  const toggleSetsOnTop = useShowcaseDebugVizStore((s) => s.toggleSetsOnTop)
  const toggleShowScore = useShowcaseDebugVizStore((s) => s.toggleShowScore)
  const show4pc = useShowcaseDebugVizStore((s) => s.show4pc)
  const toggleShow4pc = useShowcaseDebugVizStore((s) => s.toggleShow4pc)

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
        <span style={{ fontSize: 11, color: '#888', minWidth: 50 }}>4P</span>
        <div className={classes.debugPills}>
          <button
            className={`${classes.pill} ${show4pc ? classes.pillActive : ''}`}
            onClick={() => { if (!show4pc) toggleShow4pc() }}
          >
            On
          </button>
          <button
            className={`${classes.pill} ${!show4pc ? classes.pillActive : ''}`}
            onClick={() => { if (show4pc) toggleShow4pc() }}
          >
            Off
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#888', minWidth: 50 }}>Alpha</span>
        <div className={classes.debugPills}>
          {ALPHA_MODES.map((mode) => (
            <button
              key={mode.key}
              className={`${classes.pill} ${colorAlpha === mode.key ? classes.pillActive : ''}`}
              onClick={() => setColorAlpha(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})
