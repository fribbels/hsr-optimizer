import { useCallback, useEffect, useState } from 'react'
import {
  Accordion,
  ActionIcon,
  Button,
  Flex,
  ScrollArea,
  SegmentedControl,
  Slider,
  Switch,
  Text,
  UnstyledButton,
} from '@mantine/core'
import {
  IconAdjustments,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBold,
  IconCircle,
  IconContrast,
  IconCopy,
  IconCreditCard,
  IconDice,
  IconDroplet,
  IconFlame,
  IconLayoutDashboard,
  IconMinus,
  IconRefresh,
  IconRipple,
  IconSparkles,
  IconStack2,
  IconX,
} from '@tabler/icons-react'
import {
  generateCSSExport,
  NAV_DEBUG_DEFAULTS,
  NAV_DEBUG_PRESETS,
  type NavDebugConfig,
  useNavDebugStore,
} from './navDebugStore'
import classes from './NavDebugPanel.module.css'

// ---- Helpers ----

function SliderRow({ label, value, onChange, min, max, step = 1, suffix = 'px', configKey }: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  suffix?: string
  configKey?: keyof NavDebugConfig
}) {
  const changed = configKey != null && value !== NAV_DEBUG_DEFAULTS[configKey]
  return (
    <div className={classes.controlRow}>
      <div className={classes.controlHeader}>
        <span className={classes.controlLabel}>
          {label}
          {changed && <span className={classes.changedDot} />}
        </span>
        <span className={classes.controlValue}>{step < 1 ? value.toFixed(2) : value}{suffix}</span>
      </div>
      <Slider size="xs" min={min} max={max} step={step} value={value} onChange={onChange} />
    </div>
  )
}

function SwitchRow({ label, checked, onChange, configKey }: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  configKey?: keyof NavDebugConfig
}) {
  const changed = configKey != null && checked !== NAV_DEBUG_DEFAULTS[configKey]
  return (
    <div className={classes.controlRow}>
      <Flex justify="space-between" align="center">
        <span className={classes.controlLabel}>
          {label}
          {changed && <span className={classes.changedDot} />}
        </span>
        <Switch size="xs" checked={checked} onChange={(e) => onChange(e.currentTarget.checked)} />
      </Flex>
    </div>
  )
}

function PillRow({ label, value, onChange, data, configKey }: {
  label: string
  value: string
  onChange: (v: string) => void
  data: { label: string; value: string }[]
  configKey?: keyof NavDebugConfig
}) {
  const changed = configKey != null && value !== NAV_DEBUG_DEFAULTS[configKey]
  return (
    <div className={classes.controlRow}>
      <div className={classes.controlHeader}>
        <span className={classes.controlLabel}>
          {label}
          {changed && <span className={classes.changedDot} />}
        </span>
      </div>
      <SegmentedControl size="xs" fullWidth value={value} onChange={onChange} data={data} />
    </div>
  )
}

// ---- Section change detection ----

type CK = keyof NavDebugConfig

const SECTION_KEYS: Record<string, CK[]> = {
  dimensions: ['iconSize', 'fontSize', 'groupLabelSize', 'itemVPadding', 'itemHPadding', 'iconLabelGap', 'sidebarWidth', 'itemGap'],
  indicator: ['indicatorPosition', 'indicatorThickness', 'gradientStrength', 'indicatorSpeed', 'activeGlow', 'activeGlowStrength'],
  hover: ['hoverBg', 'hoverBgOpacity', 'hoverShift'],
  typography: ['groupLabelCase', 'labelWeight', 'activeLabelWeight', 'groupLabelSpacing'],
  shape: ['itemRadius', 'itemInsetMargin', 'groupDividers', 'dividerStyle', 'bottomPinnedLinks'],
  icons: ['iconContainer', 'iconContainerSize', 'iconContainerOpacity'],
  panel: ['panelBgOpacity', 'panelBorder', 'panelShadow', 'panelBlur'],
  colors: ['accentHue', 'accentSaturation'],
}

function SectionLabel({ name, store }: { name: string; store: NavDebugConfig }) {
  const keys = SECTION_KEYS[name]
  const changed = keys?.some((k) => store[k] !== NAV_DEBUG_DEFAULTS[k])
  return (
    <span>
      {name.charAt(0).toUpperCase() + name.slice(1)}
      {changed && <span className={classes.sectionBadge} />}
    </span>
  )
}

// ---- Preset metadata ----

const PRESET_META: Record<string, { icon: React.ReactNode; label: string; color?: string }> = {
  current: { icon: <IconRefresh size={13} />, label: 'Current' },
  spacious: { icon: <IconArrowsMaximize size={13} />, label: 'Spacious' },
  pill: { icon: <IconCircle size={13} />, label: 'Pill' },
  bold: { icon: <IconBold size={13} />, label: 'Bold' },
  compact: { icon: <IconArrowsMinimize size={13} />, label: 'Compact' },
  glass: { icon: <IconDroplet size={13} />, label: 'Glass', color: 'rgba(100, 160, 255, 0.3)' },
  minimal: { icon: <IconMinus size={13} />, label: 'Minimal' },
  elevated: { icon: <IconStack2 size={13} />, label: 'Elevated' },
  stripe: { icon: <IconCreditCard size={13} />, label: 'Stripe', color: 'rgba(99, 91, 255, 0.3)' },
  neon: { icon: <IconSparkles size={13} />, label: 'Neon', color: 'rgba(200, 80, 255, 0.3)' },
  warm: { icon: <IconFlame size={13} />, label: 'Warm', color: 'rgba(255, 140, 50, 0.3)' },
  ocean: { icon: <IconRipple size={13} />, label: 'Ocean', color: 'rgba(50, 170, 220, 0.3)' },
  mono: { icon: <IconContrast size={13} />, label: 'Mono' },
  dashboard: { icon: <IconLayoutDashboard size={13} />, label: 'Dashboard' },
}

// ---- Panel ----

export function NavDebugPanel() {
  // Reads all ~30 config fields for slider values + all actions — bare call is intentional
  const store = useNavDebugStore()
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Read store imperatively inside callbacks — stable refs, no re-subscription churn
  const handlePreset = useCallback((name: string) => {
    useNavDebugStore.getState().applyPreset(name)
    setActivePreset(name)
  }, [])

  const handleReset = useCallback(() => {
    useNavDebugStore.getState().reset()
    setActivePreset('current')
  }, [])

  const handleCopyCSS = useCallback(() => {
    const css = generateCSSExport(useNavDebugStore.getState())
    navigator.clipboard.writeText(css)
  }, [])

  const handleRandomize = useCallback(() => {
    useNavDebugStore.getState().randomize()
    setActivePreset(null)
  }, [])

  // Clear active preset when user manually tweaks
  const update = useCallback((partial: Partial<NavDebugConfig>) => {
    useNavDebugStore.getState().set(partial)
    setActivePreset(null)
  }, [])

  return (
    <>
      {/* FAB */}
      <UnstyledButton className={classes.fab} onClick={() => setOpen((o) => !o)}>
        <IconAdjustments size={20} />
      </UnstyledButton>

      {/* Panel */}
      <div className={`${classes.panel} ${!open ? classes.panelHidden : ''}`}>
        {/* Header */}
        <div className={classes.header}>
          <Text fw={600} size="sm" c="rgba(255,255,255,0.85)">Nav Design Lab</Text>
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setOpen(false)}>
            <IconX size={14} />
          </ActionIcon>
        </div>

        {/* Scrollable content */}
        <ScrollArea className={classes.content} scrollbarSize={6}>
          <div className={classes.contentInner}>

            {/* Presets */}
            <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase" lts="0.04em">Presets</Text>
            <div className={classes.presetGrid}>
              {Object.keys(NAV_DEBUG_PRESETS).map((name) => {
                const meta = PRESET_META[name]
                if (!meta) return null
                const isActive = activePreset === name
                return (
                  <UnstyledButton
                    key={name}
                    className={`${classes.presetPill} ${isActive ? classes.presetPillActive : ''}`}
                    onClick={() => handlePreset(name)}
                    style={isActive && meta.color ? { borderColor: meta.color, background: meta.color } : undefined}
                  >
                    <span className={classes.presetPillIcon}>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </UnstyledButton>
                )
              })}
              <UnstyledButton
                className={`${classes.presetPill} ${classes.presetPillRandom}`}
                onClick={handleRandomize}
              >
                <span className={classes.presetPillIcon}><IconDice size={13} /></span>
                <span>Random</span>
              </UnstyledButton>
            </div>

            {/* Accordion sections */}
            <Accordion
              className={classes.accordion}
              multiple
              defaultValue={['dimensions', 'indicator']}
              variant="separated"
            >
              {/* ---- Dimensions ---- */}
              <Accordion.Item value="dimensions">
                <Accordion.Control><SectionLabel name="dimensions" store={store} /></Accordion.Control>
                <Accordion.Panel>
                  <SliderRow label="Sidebar Width" value={store.sidebarWidth} min={140} max={240} onChange={(v) => update({ sidebarWidth: v })} configKey="sidebarWidth" />
                  <SliderRow label="Icon Size" value={store.iconSize} min={14} max={24} onChange={(v) => update({ iconSize: v })} configKey="iconSize" />
                  <SliderRow label="Label Font Size" value={store.fontSize} min={12} max={16} step={0.5} onChange={(v) => update({ fontSize: v })} configKey="fontSize" />
                  <SliderRow label="Group Label Size" value={store.groupLabelSize} min={9} max={14} onChange={(v) => update({ groupLabelSize: v })} configKey="groupLabelSize" />
                  <SliderRow label="Item V Padding" value={store.itemVPadding} min={4} max={16} onChange={(v) => update({ itemVPadding: v })} configKey="itemVPadding" />
                  <SliderRow label="Item H Padding" value={store.itemHPadding} min={8} max={28} onChange={(v) => update({ itemHPadding: v })} configKey="itemHPadding" />
                  <SliderRow label="Icon-Label Gap" value={store.iconLabelGap} min={6} max={18} onChange={(v) => update({ iconLabelGap: v })} configKey="iconLabelGap" />
                  <SliderRow label="Item Spacing" value={store.itemGap} min={0} max={6} onChange={(v) => update({ itemGap: v })} configKey="itemGap" />
                </Accordion.Panel>
              </Accordion.Item>

              {/* ---- Active Indicator ---- */}
              <Accordion.Item value="indicator">
                <Accordion.Control><SectionLabel name="indicator" store={store} /></Accordion.Control>
                <Accordion.Panel>
                  <PillRow
                    label="Position"
                    value={store.indicatorPosition}
                    onChange={(v) => update({ indicatorPosition: v as NavDebugConfig['indicatorPosition'] })}
                    data={[
                      { label: 'Left', value: 'left' },
                      { label: 'Right', value: 'right' },
                      { label: 'BG', value: 'background' },
                      { label: 'None', value: 'none' },
                    ]}
                    configKey="indicatorPosition"
                  />
                  <SliderRow label="Thickness" value={store.indicatorThickness} min={1} max={5} onChange={(v) => update({ indicatorThickness: v })} configKey="indicatorThickness" />
                  <SliderRow label="Gradient Strength" value={store.gradientStrength} min={0} max={40} onChange={(v) => update({ gradientStrength: v })} suffix="%" configKey="gradientStrength" />
                  <SliderRow label="Animation Speed" value={store.indicatorSpeed} min={50} max={500} step={10} suffix="ms" onChange={(v) => update({ indicatorSpeed: v })} configKey="indicatorSpeed" />
                  <SwitchRow label="Active Glow" checked={store.activeGlow} onChange={(v) => update({ activeGlow: v })} configKey="activeGlow" />
                  {store.activeGlow && (
                    <SliderRow label="Glow Strength" value={store.activeGlowStrength} min={4} max={20} onChange={(v) => update({ activeGlowStrength: v })} configKey="activeGlowStrength" />
                  )}
                </Accordion.Panel>
              </Accordion.Item>

              {/* ---- Hover Effects ---- */}
              <Accordion.Item value="hover">
                <Accordion.Control><SectionLabel name="hover" store={store} /></Accordion.Control>
                <Accordion.Panel>
                  <SwitchRow label="Hover Background" checked={store.hoverBg} onChange={(v) => update({ hoverBg: v })} configKey="hoverBg" />
                  {store.hoverBg && (
                    <SliderRow label="BG Opacity" value={store.hoverBgOpacity} min={2} max={20} onChange={(v) => update({ hoverBgOpacity: v })} suffix="%" configKey="hoverBgOpacity" />
                  )}
                  <SliderRow label="Hover Text Shift" value={store.hoverShift} min={0} max={6} onChange={(v) => update({ hoverShift: v })} configKey="hoverShift" />
                </Accordion.Panel>
              </Accordion.Item>

              {/* ---- Typography ---- */}
              <Accordion.Item value="typography">
                <Accordion.Control><SectionLabel name="typography" store={store} /></Accordion.Control>
                <Accordion.Panel>
                  <PillRow
                    label="Group Label Case"
                    value={store.groupLabelCase}
                    onChange={(v) => update({ groupLabelCase: v as NavDebugConfig['groupLabelCase'] })}
                    data={[
                      { label: 'UPPER', value: 'uppercase' },
                      { label: 'Title', value: 'titlecase' },
                      { label: 'Hidden', value: 'hidden' },
                    ]}
                    configKey="groupLabelCase"
                  />
                  <PillRow
                    label="Label Weight"
                    value={String(store.labelWeight)}
                    onChange={(v) => update({ labelWeight: Number(v) })}
                    data={[
                      { label: '400', value: '400' },
                      { label: '500', value: '500' },
                      { label: '600', value: '600' },
                    ]}
                    configKey="labelWeight"
                  />
                  <PillRow
                    label="Active Weight"
                    value={String(store.activeLabelWeight)}
                    onChange={(v) => update({ activeLabelWeight: Number(v) })}
                    data={[
                      { label: '500', value: '500' },
                      { label: '600', value: '600' },
                      { label: '700', value: '700' },
                    ]}
                    configKey="activeLabelWeight"
                  />
                  <SliderRow label="Group Spacing" value={store.groupLabelSpacing} min={0} max={0.15} step={0.01} suffix="em" onChange={(v) => update({ groupLabelSpacing: v })} configKey="groupLabelSpacing" />
                </Accordion.Panel>
              </Accordion.Item>

              {/* ---- Shape & Layout ---- */}
              <Accordion.Item value="shape">
                <Accordion.Control><SectionLabel name="shape" store={store} /></Accordion.Control>
                <Accordion.Panel>
                  <SliderRow label="Border Radius" value={store.itemRadius} min={0} max={10} onChange={(v) => update({ itemRadius: v })} configKey="itemRadius" />
                  <SliderRow label="Inset Margin" value={store.itemInsetMargin} min={0} max={12} onChange={(v) => update({ itemInsetMargin: v })} configKey="itemInsetMargin" />
                  <SwitchRow label="Group Dividers" checked={store.groupDividers} onChange={(v) => update({ groupDividers: v })} configKey="groupDividers" />
                  {store.groupDividers && (
                    <PillRow
                      label="Divider Style"
                      value={store.dividerStyle}
                      onChange={(v) => update({ dividerStyle: v as NavDebugConfig['dividerStyle'] })}
                      data={[
                        { label: 'Solid', value: 'solid' },
                        { label: 'Dashed', value: 'dashed' },
                        { label: 'Gradient', value: 'gradient' },
                      ]}
                      configKey="dividerStyle"
                    />
                  )}
                  <SwitchRow label="Pin Links to Bottom" checked={store.bottomPinnedLinks} onChange={(v) => update({ bottomPinnedLinks: v })} configKey="bottomPinnedLinks" />
                </Accordion.Panel>
              </Accordion.Item>

              {/* ---- Icon Treatment ---- */}
              <Accordion.Item value="icons">
                <Accordion.Control><SectionLabel name="icons" store={store} /></Accordion.Control>
                <Accordion.Panel>
                  <PillRow
                    label="Container"
                    value={store.iconContainer}
                    onChange={(v) => update({ iconContainer: v as NavDebugConfig['iconContainer'] })}
                    data={[
                      { label: 'None', value: 'none' },
                      { label: 'Circle', value: 'circle' },
                      { label: 'Square', value: 'rounded-square' },
                    ]}
                    configKey="iconContainer"
                  />
                  {store.iconContainer !== 'none' && (
                    <>
                      <SliderRow label="Container Size" value={store.iconContainerSize} min={24} max={36} onChange={(v) => update({ iconContainerSize: v })} configKey="iconContainerSize" />
                      <SliderRow label="Container Opacity" value={store.iconContainerOpacity} min={5} max={30} suffix="%" onChange={(v) => update({ iconContainerOpacity: v })} configKey="iconContainerOpacity" />
                    </>
                  )}
                </Accordion.Panel>
              </Accordion.Item>

              {/* ---- Sidebar Panel ---- */}
              <Accordion.Item value="panel">
                <Accordion.Control><SectionLabel name="panel" store={store} /></Accordion.Control>
                <Accordion.Panel>
                  <SliderRow label="BG Opacity" value={store.panelBgOpacity} min={30} max={100} suffix="%" onChange={(v) => update({ panelBgOpacity: v })} configKey="panelBgOpacity" />
                  <SwitchRow label="Right Border" checked={store.panelBorder} onChange={(v) => update({ panelBorder: v })} configKey="panelBorder" />
                  <PillRow
                    label="Shadow"
                    value={store.panelShadow}
                    onChange={(v) => update({ panelShadow: v as NavDebugConfig['panelShadow'] })}
                    data={[
                      { label: 'None', value: 'none' },
                      { label: 'Subtle', value: 'subtle' },
                      { label: 'Med', value: 'medium' },
                      { label: 'Strong', value: 'strong' },
                    ]}
                    configKey="panelShadow"
                  />
                  <SliderRow label="Backdrop Blur" value={store.panelBlur} min={0} max={20} onChange={(v) => update({ panelBlur: v })} configKey="panelBlur" />
                </Accordion.Panel>
              </Accordion.Item>

              {/* ---- Colors ---- */}
              <Accordion.Item value="colors">
                <Accordion.Control><SectionLabel name="colors" store={store} /></Accordion.Control>
                <Accordion.Panel>
                  <div className={classes.controlRow}>
                    <div className={classes.controlHeader}>
                      <span className={classes.controlLabel}>
                        Accent Hue
                        {store.accentHue !== NAV_DEBUG_DEFAULTS.accentHue && <span className={classes.changedDot} />}
                      </span>
                      <span className={classes.controlValue}>{store.accentHue}&deg;</span>
                    </div>
                    <div className={classes.hueSlider}>
                      <Slider size="xs" min={0} max={360} value={store.accentHue} onChange={(v) => update({ accentHue: v })} />
                    </div>
                  </div>
                  <SliderRow label="Saturation" value={store.accentSaturation} min={10} max={80} suffix="%" onChange={(v) => update({ accentSaturation: v })} configKey="accentSaturation" />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className={classes.footer}>
          <Button size="xs" variant="subtle" color="gray" leftSection={<IconRefresh size={13} />} onClick={handleReset} style={{ flex: 1 }}>
            Reset
          </Button>
          <Button size="xs" variant="subtle" color="gray" leftSection={<IconCopy size={13} />} onClick={handleCopyCSS} style={{ flex: 1 }}>
            Copy CSS
          </Button>
        </div>
      </div>
    </>
  )
}
