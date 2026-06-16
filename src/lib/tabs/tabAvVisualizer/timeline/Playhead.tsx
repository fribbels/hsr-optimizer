import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'

type PlayheadProps = {
  av: number
  rowStart: number
  rowSize: number
}

const PLAYHEAD_COLOR = '#ff4d4f'
const HANDLE_SIZE = 10

// The persistent scrubber line (à la video-editing software). Purely presentational — drag/click/keyboard
// handling that updates the underlying AV lives in TimelineRow / AvVisualizerTab.
export function Playhead({ av, rowStart, rowSize }: PlayheadProps) {
  const leftPercent = AvVisualTabController.avToRowPercent(av, rowStart, rowSize)

  return (
    <div
      style={{
        position: 'absolute',
        left: `${leftPercent}%`,
        top: 0,
        bottom: 0,
        width: 0,
        transform: 'translateX(-50%)',
        zIndex: 15,
        pointerEvents: 'none',
      }}
    >
      {/* Handle */}
      <div style={{
        position: 'absolute',
        top: -HANDLE_SIZE / 2,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: `${HANDLE_SIZE / 2}px solid transparent`,
        borderRight: `${HANDLE_SIZE / 2}px solid transparent`,
        borderTop: `${HANDLE_SIZE}px solid ${PLAYHEAD_COLOR}`,
      }} />

      {/* Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 2,
        marginLeft: -1,
        backgroundColor: PLAYHEAD_COLOR,
        opacity: 0.85,
      }} />
    </div>
  )
}
