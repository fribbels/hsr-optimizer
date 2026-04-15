import { useState } from 'react'

type SliderDef = { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }
type SliderGroup = { title: string, sliders: SliderDef[] }
type DebugPreset = { label: string, apply: () => void }
type PillGroup = { title: string, active: string, options: { label: string, value: string, apply: () => void }[] }
type PresetGroup = { title: string, presets: DebugPreset[] }

export type { DebugPreset, PillGroup, PresetGroup, SliderDef, SliderGroup }

const pillStyle: React.CSSProperties = {
  padding: '3px 10px',
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid #555',
  background: 'rgba(255,255,255,0.08)',
  color: '#ccc',
  userSelect: 'none',
}

const pillActiveStyle: React.CSSProperties = {
  ...pillStyle,
  border: '1px solid #88f',
  background: 'rgba(100,100,255,0.25)',
  color: '#fff',
}

export { pillActiveStyle, pillStyle }

// Debug slider panel for tuning card visuals — shown by default, click [x] to hide
export function DebugSliderPanel({ groups, savedPresetGroups, pillGroups }: {
  groups: SliderGroup[],
  savedPresetGroups?: PresetGroup[],
  pillGroups?: PillGroup[],
}) {
  const [open, setOpen] = useState(true)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          borderRadius: 6,
          padding: '4px 10px',
          color: '#ddd',
          fontSize: 16,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        +
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        borderRadius: 8,
        padding: '14px 20px',
        color: '#ddd',
        fontSize: 13,
        width: 600,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Card Debug Sliders</span>
        <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', padding: '0 4px' }}>x</span>
      </div>
      {savedPresetGroups && savedPresetGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {savedPresetGroups.map((group) => (
            <div key={group.title} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#888', minWidth: 110, fontWeight: 500 }}>{group.title}</span>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {group.presets.map((p) => (
                  <span
                    key={p.label}
                    onClick={() => {
                      p.apply()
                      setActivePreset(p.label)
                    }}
                    style={activePreset === p.label ? pillActiveStyle : pillStyle}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {pillGroups && pillGroups.map((pg) => (
        <div key={pg.title} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 2, marginTop: 4 }}>{pg.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {pg.options.map((o) => <span key={o.label} onClick={o.apply} style={pg.active === o.value ? pillActiveStyle : pillStyle}>{o.label}</span>)}
          </div>
        </div>
      ))}
      {groups.map((g) => (
        <div key={g.title} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 2, marginTop: 4 }}>{g.title}</div>
          {g.sliders.map((s) => (
            <label key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ minWidth: 100 }}>{s.label}</span>
              <span style={{ minWidth: 40, textAlign: 'right', fontFamily: 'monospace' }}>{s.value.toFixed(2)}</span>
              <input
                type='range'
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.onChange(Number(e.target.value))}
                style={{ width: 300 }}
              />
            </label>
          ))}
        </div>
      ))}
    </div>
  )
}
