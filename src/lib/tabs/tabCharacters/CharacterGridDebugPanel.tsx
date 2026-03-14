import { useState, useCallback, useRef, useEffect } from 'react'

type SliderConfig = {
  label: string
  cssVar: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit: string
}

const SLIDERS: SliderConfig[] = [
  { label: 'List Width', cssVar: '--cr-list-width', min: 200, max: 400, step: 5, defaultValue: 320, unit: 'px' },
  { label: 'Row Height', cssVar: '--cr-row-height', min: 36, max: 72, step: 1, defaultValue: 64, unit: 'px' },
  { label: 'Row Gap', cssVar: '--cr-row-gap', min: 0, max: 8, step: 1, defaultValue: 0, unit: 'px' },
  { label: 'Portrait X', cssVar: '--cr-portrait-x', min: 20, max: 150, step: 1, defaultValue: 34, unit: '%' },
  { label: 'Portrait Y', cssVar: '--cr-portrait-y', min: 10, max: 60, step: 1, defaultValue: 31, unit: '%' },
  { label: 'Portrait Scale', cssVar: '--cr-portrait-scale', min: 25, max: 175, step: 5, defaultValue: 75, unit: '%' },
  { label: 'LC Icon Size', cssVar: '--cr-lc-size', min: 14, max: 56, step: 1, defaultValue: 48, unit: 'px' },
  { label: 'Badge Size', cssVar: '--cr-badge-size', min: 10, max: 24, step: 1, defaultValue: 18, unit: 'px' },
  { label: 'Content Offset', cssVar: '--cr-content-offset', min: 0, max: 60, step: 1, defaultValue: 23, unit: '%' },
  { label: 'Name Max Width', cssVar: '--cr-name-max-width', min: 30, max: 80, step: 1, defaultValue: 55, unit: '%' },
  { label: 'LC Right Pad', cssVar: '--cr-lc-right-pad', min: 0, max: 24, step: 1, defaultValue: 4, unit: 'px' },
  { label: 'LC Strip Width', cssVar: '--cr-lc-strip-width', min: 30, max: 120, step: 1, defaultValue: 56, unit: 'px' },
  { label: 'Scrim 0%', cssVar: '--cr-scrim-0', min: 0, max: 1, step: 0.01, defaultValue: 0.94, unit: '' },
  { label: 'Scrim 40%', cssVar: '--cr-scrim-40', min: 0, max: 1, step: 0.01, defaultValue: 0.85, unit: '' },
  { label: 'Scrim 65%', cssVar: '--cr-scrim-65', min: 0, max: 1, step: 0.01, defaultValue: 0.30, unit: '' },
  { label: 'Scrim 85%', cssVar: '--cr-scrim-85', min: 0, max: 1, step: 0.01, defaultValue: 0.07, unit: '' },
  { label: 'Scrim 100%', cssVar: '--cr-scrim-100', min: 0, max: 1, step: 0.01, defaultValue: 0.17, unit: '' },
]

const FROST_SLIDERS: SliderConfig[] = [
  { label: 'Frost Blur', cssVar: '--cr-frost-blur', min: 0, max: 24, step: 0.5, defaultValue: 5, unit: 'px' },
  { label: 'Frost Brightness', cssVar: '--cr-frost-brightness', min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.85, unit: '' },
  { label: 'Frost Saturate', cssVar: '--cr-frost-saturate', min: 0.5, max: 2.0, step: 0.05, defaultValue: 1.0, unit: '' },
  { label: 'Frost Tint', cssVar: '--cr-frost-tint', min: 0, max: 0.5, step: 0.01, defaultValue: 0.25, unit: '' },
  { label: 'Frost Fade Start', cssVar: '--cr-frost-fade-start', min: 0, max: 100, step: 1, defaultValue: 25, unit: '%' },
  { label: 'Frost Fade End', cssVar: '--cr-frost-fade-end', min: 0, max: 100, step: 1, defaultValue: 55, unit: '%' },
]

export type ScrimMode = 'black' | 'themed' | 'solid-fade' | 'frosted' | 'bg-light'
export type LcStyle = 'none' | 'pill' | 'frosted' | 'shadow'

export const SCRIM_MODES: { value: ScrimMode; label: string }[] = [
  { value: 'black', label: 'Black' },
  { value: 'themed', label: 'Themed' },
  { value: 'solid-fade', label: 'Solid→Fade' },
  { value: 'frosted', label: 'Frosted' },
  { value: 'bg-light', label: 'BG+Light' },
]

export const LC_STYLES: { value: LcStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pill', label: 'Dark Pill' },
  { value: 'frosted', label: 'Frosted' },
  { value: 'shadow', label: 'Shadow' },
]

export type DebugToggles = {
  showRank: boolean
  showDragGrip: boolean
  showPortrait: boolean
  showActionButtons: boolean
  showEidolon: boolean
  showLightCone: boolean
  showContainerBorder: boolean
  showLcStrip: boolean
  nameShadow: boolean
  nameConstrain: boolean
  nameBackdrop: boolean
  nameFade: boolean
  scrimMode: ScrimMode
  lcStyle: LcStyle
}

export const DEFAULT_TOGGLES: DebugToggles = {
  showRank: true,
  showDragGrip: false,
  showPortrait: true,
  showActionButtons: true,
  showEidolon: true,
  showLightCone: true,
  showContainerBorder: true,
  showLcStrip: true,
  nameShadow: false,
  nameConstrain: false,
  nameBackdrop: false,
  nameFade: false,
  scrimMode: 'frosted',
  lcStyle: 'none',
}

type BooleanToggleKeys = Exclude<keyof DebugToggles, 'scrimMode' | 'lcStyle'>

const TOGGLE_LABELS: Record<BooleanToggleKeys, string> = {
  showRank: 'Rank',
  showDragGrip: 'Drag Grip',
  showPortrait: 'Portrait',
  showActionButtons: 'Actions',
  showEidolon: 'Eidolon',
  showLightCone: 'Light Cone',
  showContainerBorder: 'List Border',
  showLcStrip: 'LC Strip',
  nameShadow: 'Name Shadow',
  nameConstrain: 'Name Constrain',
  nameBackdrop: 'Name Backdrop',
  nameFade: 'Name Fade',
}

export function CharacterGridDebugPanel({ targetRef, toggles, onTogglesChange }: {
  targetRef: React.RefObject<HTMLDivElement | null>
  toggles: DebugToggles
  onTogglesChange: (toggles: DebugToggles) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const s of [...SLIDERS, ...FROST_SLIDERS]) init[s.cssVar] = s.defaultValue
    return init
  })

  // Drag state
  const [pos, setPos] = useState({ x: 20, y: 100 })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const applyVars = useCallback((newValues: Record<string, number>) => {
    const el = targetRef.current
    if (!el) return
    for (const s of [...SLIDERS, ...FROST_SLIDERS]) {
      const val = newValues[s.cssVar] ?? s.defaultValue
      el.style.setProperty(s.cssVar, `${val}${s.unit}`)
    }
  }, [targetRef])

  useEffect(() => {
    applyVars(values)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback((cssVar: string, value: number) => {
    setValues((prev) => {
      const next = { ...prev, [cssVar]: value }
      applyVars(next)
      return next
    })
  }, [applyVars])

  const handleReset = useCallback(() => {
    const init: Record<string, number> = {}
    for (const s of [...SLIDERS, ...FROST_SLIDERS]) init[s.cssVar] = s.defaultValue
    setValues(init)
    applyVars(init)
    onTogglesChange({ ...DEFAULT_TOGGLES })
  }, [applyVars, onTogglesChange])

  const handleCopy = useCallback(() => {
    const allSliders = [...SLIDERS, ...FROST_SLIDERS]
    const sliderLines = allSliders.map((s) => {
      const val = values[s.cssVar] ?? s.defaultValue
      return `  ${s.cssVar}: ${val}${s.unit};`
    })
    const toggleLines = (Object.keys(toggles) as Array<keyof DebugToggles>).map((key) => {
      return `  ${key}: ${toggles[key]}`
    })
    const output = `/* Sliders */\n${sliderLines.join('\n')}\n\n/* Toggles */\n${toggleLines.join('\n')}`
    void navigator.clipboard.writeText(output)
  }, [values, toggles])

  const handleToggle = useCallback((key: BooleanToggleKeys) => {
    onTogglesChange({ ...toggles, [key]: !toggles[key] })
  }, [toggles, onTogglesChange])

  // Drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
    }
    function onMouseUp() {
      dragging.current = false
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    left: pos.x,
    top: pos.y,
    zIndex: 9999,
    background: 'rgba(20, 20, 28, 0.95)',
    border: '1px solid #555',
    borderRadius: 8,
    padding: collapsed ? 0 : 12,
    width: collapsed ? 'auto' : 290,
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#ccc',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    userSelect: 'none',
    maxHeight: '85vh',
    overflowY: 'auto',
  }

  const headerStyle: React.CSSProperties = {
    cursor: 'grab',
    padding: collapsed ? '6px 10px' : '0 0 8px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: collapsed ? 'none' : '1px solid #444',
    marginBottom: collapsed ? 0 : 8,
    fontWeight: 600,
    fontSize: 12,
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '2px 8px',
    borderRadius: 10,
    border: `1px solid ${active ? '#7c5cfc' : '#555'}`,
    background: active ? 'rgba(124, 92, 252, 0.2)' : 'rgba(255, 255, 255, 0.04)',
    color: active ? '#b8a5ff' : '#888',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 500,
    transition: 'all 0.1s',
    whiteSpace: 'nowrap' as const,
  })

  const btnStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid #666',
    color: '#aaa',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 10,
    padding: '1px 5px',
  }

  return (
    <div style={panelStyle}>
      <div style={headerStyle} onMouseDown={onMouseDown}>
        <span>Grid Debug</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={handleCopy} style={btnStyle} title="Copy CSS vars + toggles">Copy</button>
          <button onClick={handleReset} style={btnStyle} title="Reset to defaults">Reset</button>
          <button onClick={() => setCollapsed(!collapsed)} style={btnStyle}>
            {collapsed ? '+' : '−'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Toggle pills */}
          <div>
            <div style={{ color: '#999', fontSize: 10, marginBottom: 4, fontWeight: 600 }}>FEATURES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {(Object.keys(TOGGLE_LABELS) as Array<BooleanToggleKeys>).map((key) => (
                <span
                  key={key}
                  style={pillStyle(toggles[key])}
                  onClick={() => handleToggle(key)}
                >
                  {TOGGLE_LABELS[key]}
                </span>
              ))}
            </div>
          </div>

          {/* Scrim mode */}
          <div>
            <div style={{ color: '#999', fontSize: 10, marginBottom: 4, fontWeight: 600 }}>SCRIM MODE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {SCRIM_MODES.map((mode) => (
                <span
                  key={mode.value}
                  style={pillStyle(toggles.scrimMode === mode.value)}
                  onClick={() => onTogglesChange({ ...toggles, scrimMode: mode.value })}
                >
                  {mode.label}
                </span>
              ))}
            </div>
          </div>

          {/* LC style */}
          <div>
            <div style={{ color: '#999', fontSize: 10, marginBottom: 4, fontWeight: 600 }}>LC STYLE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {LC_STYLES.map((s) => (
                <span
                  key={s.value}
                  style={pillStyle(toggles.lcStyle === s.value)}
                  onClick={() => onTogglesChange({ ...toggles, lcStyle: s.value })}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Frost sliders — only visible in frosted mode */}
          {toggles.scrimMode === 'frosted' && (
            <>
              <div style={{ borderTop: '1px solid #333' }} />
              <div>
                <div style={{ color: '#999', fontSize: 10, marginBottom: 4, fontWeight: 600 }}>FROST TUNING</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {FROST_SLIDERS.map((s) => {
                    const val = values[s.cssVar] ?? s.defaultValue
                    return (
                      <div key={s.cssVar}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                          <span style={{ color: '#999' }}>{s.label}</span>
                          <span style={{ color: '#7c5cfc' }}>{val}{s.unit}</span>
                        </div>
                        <input
                          type="range"
                          min={s.min}
                          max={s.max}
                          step={s.step}
                          value={val}
                          onChange={(e) => handleChange(s.cssVar, parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: '#7c5cfc', height: 14 }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          <div style={{ borderTop: '1px solid #333' }} />

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SLIDERS.map((s) => {
              const val = values[s.cssVar] ?? s.defaultValue
              return (
                <div key={s.cssVar}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                    <span style={{ color: '#999' }}>{s.label}</span>
                    <span style={{ color: '#7c5cfc' }}>{val}{s.unit}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={val}
                    onChange={(e) => handleChange(s.cssVar, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#7c5cfc', height: 14 }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
