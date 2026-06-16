import { Tooltip } from '@mantine/core'
import { TIMELINE_RULER_Y } from 'lib/tabs/tabAvVisualizer/constants'

type InterventionMarkerProps = {
  triggerAv: number
  count: number          // 该 AV 处的干预条数
  leftPercent: number    // 已由父组件换算好的水平位置
  onClick: (triggerAv: number) => void
}

const MARKER_SIZE = 18
// 金色圆圈，与角色行动标记的槽位颜色区分
const MARKER_COLOR = '#f5c842'

export function InterventionMarker({ triggerAv, count, leftPercent, onClick }: InterventionMarkerProps) {
  return (
    <Tooltip
      label={`AV ${triggerAv.toFixed(1)} · ${count} 条干预`}
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
