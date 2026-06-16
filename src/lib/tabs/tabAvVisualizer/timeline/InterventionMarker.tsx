import { Tooltip } from '@mantine/core'
import { TIMELINE_RULER_Y } from 'lib/tabs/tabAvVisualizer/constants'
import { useTranslation } from 'react-i18next'

type InterventionMarkerProps = {
  triggerAv: number
  count: number          // Number of interventions at this AV
  leftPercent: number    // Horizontal position, already computed by the parent
  onClick: (triggerAv: number) => void
}

const MARKER_SIZE = 18
// Gold circle, visually distinct from the per-slot colors used by action markers
const MARKER_COLOR = '#f5c842'

export function InterventionMarker({ triggerAv, count, leftPercent, onClick }: InterventionMarkerProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  return (
    <Tooltip
      label={tAv('Marker.InterventionTooltip', { av: triggerAv.toFixed(1), count })}
      position='top'
      withArrow
      openDelay={100}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          onClick(triggerAv)
        }}
        style={{
          position: 'absolute',
          left: `${leftPercent}%`,
          top: TIMELINE_RULER_Y - MARKER_SIZE / 2,
          transform: 'translateX(-50%)',
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          borderRadius: '50%',
          backgroundColor: MARKER_COLOR,
          border: '2px solid rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          fontSize: 10,
          fontWeight: 700,
          color: '#000',
          userSelect: 'none',
        }}
      >
        {count}
      </div>
    </Tooltip>
  )
}
