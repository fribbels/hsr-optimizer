import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { DEFAULT_CONFIG, type CardColorConfig } from 'lib/characterPreview/color/colorPipelineConfig'

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
  { label: 'Row Height', cssVar: '--cr-row-height', min: 36, max: 90, step: 1, defaultValue: 73, unit: 'px' },
  { label: 'Row Gap', cssVar: '--cr-row-gap', min: 0, max: 8, step: 1, defaultValue: 1, unit: 'px' },
  { label: 'Portrait X', cssVar: '--cr-portrait-x', min: 20, max: 150, step: 1, defaultValue: 40, unit: '%' },
  { label: 'Portrait Y', cssVar: '--cr-portrait-y', min: 10, max: 60, step: 1, defaultValue: 31, unit: '%' },
  { label: 'Portrait Scale', cssVar: '--cr-portrait-scale', min: 25, max: 175, step: 5, defaultValue: 70, unit: '%' },
  { label: 'LC Icon Size', cssVar: '--cr-lc-size', min: 14, max: 56, step: 1, defaultValue: 48, unit: 'px' },
  { label: 'LC Right Pad', cssVar: '--cr-lc-right-pad', min: 0, max: 24, step: 1, defaultValue: 1, unit: 'px' },
  { label: 'LC Strip Width', cssVar: '--cr-lc-strip-width', min: 30, max: 120, step: 1, defaultValue: 52, unit: 'px' },
]

const FROST_SLIDERS: SliderConfig[] = [
  { label: 'Frost Blur', cssVar: '--cr-frost-blur', min: 0, max: 24, step: 0.5, defaultValue: 16, unit: 'px' },
  { label: 'Frost Brightness', cssVar: '--cr-frost-brightness', min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.8, unit: '' },
  { label: 'Frost Saturate', cssVar: '--cr-frost-saturate', min: 0.5, max: 2.0, step: 0.05, defaultValue: 1.2, unit: '' },
  { label: 'Frost Tint', cssVar: '--cr-frost-tint', min: 0, max: 0.5, step: 0.01, defaultValue: 0.2, unit: '' },
  { label: 'Frost Fade Start', cssVar: '--cr-frost-fade-start', min: 0, max: 100, step: 1, defaultValue: 27, unit: '%' },
  { label: 'Frost Fade End', cssVar: '--cr-frost-fade-end', min: 0, max: 100, step: 1, defaultValue: 42, unit: '%' },
]


export type HoverEffect = 'lift-bright'

type HoverPreset = {
  label: string
  value: HoverEffect
  vars: Record<string, string>
}

const HOVER_PRESETS: HoverPreset[] = [
  {
    label: 'Lift + Bright',
    value: 'lift-bright',
    vars: {
      '--cr-hover-rest-brightness': '1',
      '--cr-hover-rest-saturate': '1',
      '--cr-hover-brightness': '1.05',
      '--cr-hover-saturate': '1.05',
      '--cr-hover-lift': '-2px',
      '--cr-hover-shadow': '0 4px 12px rgba(0, 0, 0, 0.4)',
    },
  },
]

export type ActionBtnStyle = 'bright'

type ActionBtnPreset = {
  label: string
  value: ActionBtnStyle
  vars: Record<string, string>
}

const ACTION_BTN_PRESETS: ActionBtnPreset[] = [
  {
    label: 'Bright',
    value: 'bright',
    vars: {
      '--cr-action-bg': 'rgba(80, 80, 90, 0.45)',
      '--cr-action-color': '#fff',
      '--cr-action-blur': 'none',
      '--cr-action-border': '1px solid rgba(255, 255, 255, 0.08)',
    },
  },
]

export type ScrimMode = 'frosted'
export type LcStyle = 'none' | 'pill' | 'frosted' | 'shadow'

export const EQUIP_DOT_COLORS = {
  partial: '#b89040',
  empty: '#903040',
  size: 5,
}

export const SCRIM_MODES: { value: ScrimMode; label: string }[] = [
  { value: 'frosted', label: 'Frosted' },
]

export const LC_STYLES: { value: LcStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pill', label: 'Dark Pill' },
  { value: 'frosted', label: 'Frosted' },
  { value: 'shadow', label: 'Shadow' },
]

export type DebugToggles = {
  showRank: boolean
  showPortrait: boolean
  showActionButtons: boolean
  showEidolon: boolean
  showLightCone: boolean
  showContainerBorder: boolean
  showLcStrip: boolean
  nameShadow: boolean
  scrimMode: ScrimMode
  lcStyle: LcStyle
  hoverEffect: HoverEffect
  actionBtnStyle: ActionBtnStyle
  showEquipIndicator: boolean
}

export const DEFAULT_TOGGLES: DebugToggles = {
  showRank: true,
  showPortrait: true,
  showActionButtons: true,
  showEidolon: true,
  showLightCone: true,
  showContainerBorder: true,
  showLcStrip: true,
  nameShadow: true,
  scrimMode: 'frosted',
  lcStyle: 'shadow',
  hoverEffect: 'lift-bright',
  actionBtnStyle: 'bright',
  showEquipIndicator: true,
}

type BooleanToggleKeys = Exclude<keyof DebugToggles, 'scrimMode' | 'lcStyle' | 'hoverEffect' | 'actionBtnStyle'>

const TOGGLE_LABELS: Record<BooleanToggleKeys, string> = {
  showRank: 'Rank',
  showPortrait: 'Portrait',
  showActionButtons: 'Actions',
  showEidolon: 'Eidolon',
  showLightCone: 'Light Cone',
  showContainerBorder: 'List Border',
  showLcStrip: 'LC Strip',
  nameShadow: 'Name Shadow',
  showEquipIndicator: 'Equip Dot',
}

const OKLCH_SLIDERS: { key: keyof CardColorConfig; label: string; min: number; max: number; step: number }[] = [
  { key: 'targetL', label: 'Target L', min: 0.05, max: 0.70, step: 0.01 },
  { key: 'chromaScale', label: 'Chroma Scale', min: 0.1, max: 2.0, step: 0.05 },
  { key: 'maxC', label: 'Max Chroma', min: 0.01, max: 0.25, step: 0.005 },
  { key: 'minC', label: 'Min Chroma', min: 0.0, max: 0.10, step: 0.005 },
  { key: 'alpha', label: 'Alpha', min: 0.0, max: 1.0, step: 0.05 },
  { key: 'lInputScale', label: 'L Input Scale', min: 0.0, max: 0.3, step: 0.01 },
]

export const CharacterGridDebugPanel = memo(function CharacterGridDebugPanel({ targetRef, toggles, onTogglesChange, listColorConfig, onListColorConfigChange }: {
  targetRef: React.RefObject<HTMLDivElement | null>
  toggles: DebugToggles
  onTogglesChange: (toggles: DebugToggles) => void
  listColorConfig: CardColorConfig
  onListColorConfigChange: (cfg: CardColorConfig) => void
}) {
  const [collapsed, setCollapsed] = useState(true)
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const s of [...SLIDERS, ...FROST_SLIDERS]) init[s.cssVar] = s.defaultValue
    return init
  })

  // Drag state
  const [pos, setPos] = useState({ x: window.innerWidth - 310, y: 50 })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const applyVars = useCallback((newValues: Record<string, number>, hoverEffect?: HoverEffect) => {
    const el = targetRef.current
    if (!el) return
    for (const s of [...SLIDERS, ...FROST_SLIDERS]) {
      const val = newValues[s.cssVar] ?? s.defaultValue
      el.style.setProperty(s.cssVar, `${val}${s.unit}`)
    }
    const hoverPreset = HOVER_PRESETS.find((p) => p.value === (hoverEffect ?? toggles.hoverEffect))
    if (hoverPreset) {
      for (const [k, v] of Object.entries(hoverPreset.vars)) {
        el.style.setProperty(k, v)
      }
    }
    const actionPreset = ACTION_BTN_PRESETS.find((p) => p.value === toggles.actionBtnStyle)
    if (actionPreset) {
      for (const [k, v] of Object.entries(actionPreset.vars)) {
        el.style.setProperty(k, v)
      }
    }
  }, [targetRef, toggles.hoverEffect, toggles.actionBtnStyle])

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
    applyVars(init, DEFAULT_TOGGLES.hoverEffect)
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
    borderRadius: 6,
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
    borderRadius: 6,
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
    borderRadius: 2,
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

          {/* OKLCH List BG */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#999', fontSize: 10, fontWeight: 600 }}>OKLCH LIST BG</span>
              <span
                style={{ color: '#7c5cfc', fontSize: 10, cursor: 'pointer' }}
                onClick={() => onListColorConfigChange({ ...DEFAULT_CONFIG.characterListBg })}
              >
                Reset
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {OKLCH_SLIDERS.map((s) => (
                <div key={s.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                    <span style={{ color: '#999' }}>{s.label}</span>
                    <span style={{ color: '#7c5cfc' }}>{(listColorConfig[s.key] as number).toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={listColorConfig[s.key] as number}
                    onChange={(e) => onListColorConfigChange({ ...listColorConfig, [s.key]: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: '#7c5cfc', height: 14 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Frost tuning */}
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
})
