import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { CharacterId } from 'types/character'
import { SpinePortrait } from 'lib/spine/SpinePortrait'

// Debug flag — set to false to remove the panel
const DEBUG_BLUR = true

const DEFAULT_BLUR_OUT_MS = 1500
const DEFAULT_CURVE: [number, number, number, number] = [0.1, 0.2, 0.5, 1]
const DEFAULT_BLUR_PX = 8.5

export function LoadingBlurredSpine({
  characterId,
  style,
  onUnsupported,
}: {
  characterId: CharacterId
  style: CSSProperties
  onUnsupported?: () => void
}) {
  const styleRef = useRef(style)
  styleRef.current = style
  const charIdRef = useRef(characterId)
  charIdRef.current = characterId

  const loadedCharIdRef = useRef<CharacterId | null>(null)

  const [storedStyle, setStoredStyle] = useState<CSSProperties>(style)
  const [blur, setBlur] = useState(true)

  // Debug controls
  const [durationMs, setDurationMs] = useState(DEFAULT_BLUR_OUT_MS)
  const [blurPx, setBlurPx] = useState(DEFAULT_BLUR_PX)
  const [p1x, setP1x] = useState(DEFAULT_CURVE[0])
  const [p1y, setP1y] = useState(DEFAULT_CURVE[1])
  const [p2x, setP2x] = useState(DEFAULT_CURVE[2])
  const [p2y, setP2y] = useState(DEFAULT_CURVE[3])

  useEffect(() => {
    if (characterId === loadedCharIdRef.current) {
      setStoredStyle(styleRef.current)
      return
    }

    setBlur(true)
  }, [characterId])

  const handleReady = useCallback(() => {
    loadedCharIdRef.current = charIdRef.current
    setStoredStyle(styleRef.current)
    setBlur(false)
  }, [])

  const curveStr = `cubic-bezier(${p1x},${p1y},${p2x},${p2y})`

  return (
    <>
      <SpinePortrait
        characterId={characterId}
        style={{
          ...storedStyle,
          filter: blur ? `blur(${blurPx}px)` : 'none',
          transition: blur ? '' : `filter ${durationMs}ms ${curveStr}`,
        }}
        onReady={handleReady}
        onUnsupported={onUnsupported}
      />
      {DEBUG_BLUR && (
        <BlurDebugPanel
          durationMs={durationMs}
          setDurationMs={setDurationMs}
          blurPx={blurPx}
          setBlurPx={setBlurPx}
          p1x={p1x} setP1x={setP1x}
          p1y={p1y} setP1y={setP1y}
          p2x={p2x} setP2x={setP2x}
          p2y={p2y} setP2y={setP2y}
          curveStr={curveStr}
          blur={blur}
        />
      )}
    </>
  )
}

function BlurDebugPanel({
  durationMs, setDurationMs,
  blurPx, setBlurPx,
  p1x, setP1x,
  p1y, setP1y,
  p2x, setP2x,
  p2y, setP2y,
  curveStr,
  blur,
}: {
  durationMs: number; setDurationMs: (v: number) => void
  blurPx: number; setBlurPx: (v: number) => void
  p1x: number; setP1x: (v: number) => void
  p1y: number; setP1y: (v: number) => void
  p2x: number; setP2x: (v: number) => void
  p2y: number; setP2y: (v: number) => void
  curveStr: string
  blur: boolean
}) {
  const panelStyle: CSSProperties = {
    position: 'fixed',
    bottom: 12,
    right: 12,
    zIndex: 99999,
    background: 'rgba(0,0,0,0.85)',
    color: '#eee',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'monospace',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 280,
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.15)',
  }

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  }

  const sliderStyle: CSSProperties = { width: 120, accentColor: '#7c6ef0' }

  return (
    <div style={panelStyle}>
      <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2, color: '#7c6ef0' }}>
        Blur Debug {blur ? '🔵 BLURRED' : '🟢 CLEAR'}
      </div>

      <div style={rowStyle}>
        <span>Duration</span>
        <input type="range" min={100} max={5000} step={100} value={durationMs} onChange={(e) => setDurationMs(+e.target.value)} style={sliderStyle} />
        <span style={{ width: 50, textAlign: 'right' }}>{durationMs}ms</span>
      </div>

      <div style={rowStyle}>
        <span>Blur px</span>
        <input type="range" min={1} max={20} step={0.5} value={blurPx} onChange={(e) => setBlurPx(+e.target.value)} style={sliderStyle} />
        <span style={{ width: 50, textAlign: 'right' }}>{blurPx}px</span>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 4, marginTop: 2 }}>
        <span style={{ color: '#aaa' }}>cubic-bezier(p1x, p1y, p2x, p2y)</span>
      </div>

      <div style={rowStyle}>
        <span>p1x</span>
        <input type="range" min={0} max={1} step={0.01} value={p1x} onChange={(e) => setP1x(+e.target.value)} style={sliderStyle} />
        <span style={{ width: 50, textAlign: 'right' }}>{p1x.toFixed(2)}</span>
      </div>

      <div style={rowStyle}>
        <span>p1y</span>
        <input type="range" min={0} max={1} step={0.01} value={p1y} onChange={(e) => setP1y(+e.target.value)} style={sliderStyle} />
        <span style={{ width: 50, textAlign: 'right' }}>{p1y.toFixed(2)}</span>
      </div>

      <div style={rowStyle}>
        <span>p2x</span>
        <input type="range" min={0} max={1} step={0.01} value={p2x} onChange={(e) => setP2x(+e.target.value)} style={sliderStyle} />
        <span style={{ width: 50, textAlign: 'right' }}>{p2x.toFixed(2)}</span>
      </div>

      <div style={rowStyle}>
        <span>p2y</span>
        <input type="range" min={0} max={1} step={0.01} value={p2y} onChange={(e) => setP2y(+e.target.value)} style={sliderStyle} />
        <span style={{ width: 50, textAlign: 'right' }}>{p2y.toFixed(2)}</span>
      </div>

      <div style={{ color: '#7c6ef0', fontSize: 11, marginTop: 2 }}>
        {curveStr}
      </div>
    </div>
  )
}
