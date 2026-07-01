import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'

type CutoffMarkerProps = {
  av: number
  rowStart: number
  rowSize: number
  // See Playhead's own doc comment — lets the marker/overlay span the row's actual full height instead
  // of stopping at the ruler's fixed band.
  topOffset: number
  totalHeight: number
}

const CUTOFF_COLOR = '#9e9e9e'

// Marks where a Wave (混沌回忆换面) was cut — unlike the Playhead, this is fixed (not draggable) and
// permanent: it records a fact about this Wave's own history, not the current viewing position. Renders
// a dashed grey line at the cut point, plus a translucent grey overlay covering everything after it in
// this row — that AV range no longer exists in this Wave (the next Wave continues from here instead).
export function CutoffMarker({ av, rowStart, rowSize, topOffset, totalHeight }: CutoffMarkerProps) {
  const leftPercent = AvVisualTabController.avToRowPercent(av, rowStart, rowSize)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${leftPercent}%`,
          top: -topOffset,
          height: totalHeight,
          width: 0,
          zIndex: 14,
          pointerEvents: 'none',
          borderLeft: `2px dashed ${CUTOFF_COLOR}`,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${leftPercent}%`,
          top: -topOffset,
          right: 0,
          height: totalHeight,
          zIndex: 13,
          pointerEvents: 'none',
          backgroundColor: CUTOFF_COLOR,
          opacity: 0.3,
        }}
      />
    </>
  )
}
