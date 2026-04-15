import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  CopyButton,
  Flex,
  NumberInput,
} from '@mantine/core'
import {
  IconCheck,
  IconClipboard,
  IconCopy,
} from '@tabler/icons-react'
import i18next from 'i18next'
import {
  innerW,
  newLcHeight,
  newLcMargin,
  parentH,
  parentW,
  simScoreInnerW,
} from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { computeLcTransform } from 'lib/rendering/lcImageTransform'
import { SpinePortrait } from 'lib/spine/SpinePortrait'
import { getGameMetadata } from 'lib/state/gameMetadata'
import {
  SearchableCombobox,
  type SearchableComboboxOption,
} from 'lib/ui/SearchableCombobox'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { ImageCenter } from 'types/metadata'

// =========================================== Constants ===========================================

const DEFAULT_CENTER: ImageCenter = { x: 1024, y: 1024, z: 1 }
const DPS_CONTAINER_H = parentH - newLcHeight - newLcMargin // 720

// =========================================== Shared Hook ===========================================

function useDragInteraction(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onDrag: (dx: number, dy: number) => void,
  onZoom: (deltaY: number, ctrlKey: boolean) => void,
) {
  const draggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag
  const onZoomRef = useRef(onZoom)
  onZoomRef.current = onZoom

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    draggingRef.current = true
    lastPosRef.current = { x: e.clientX, y: e.clientY }

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - lastPosRef.current.x
      const dy = e.clientY - lastPosRef.current.y
      lastPosRef.current = { x: e.clientX, y: e.clientY }
      onDragRef.current(dx, dy)
    }

    const handleMouseUp = () => {
      draggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onZoomRef.current(e.deltaY, e.ctrlKey)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [containerRef])

  return { handleMouseDown }
}

// =========================================== Shared Utils ===========================================

function buildCharacterOptions(): SearchableComboboxOption[] {
  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  const chars = Object.values(getGameMetadata().characters)
  return chars
    .sort((a, b) => t(`${a.id}.LongName`).localeCompare(t(`${b.id}.LongName`)))
    .map((c) => ({
      value: c.id,
      label: t(`${c.id}.LongName`),
      icon: Assets.getCharacterAvatarById(c.id),
    }))
}

function computePortraitStyle(center: ImageCenter, tempInnerW: number, containerH: number) {
  return {
    position: 'absolute' as const,
    left: -center.x * center.z / 2 * tempInnerW / 1024 + parentW / 2,
    top: -center.y * center.z / 2 * tempInnerW / 1024 + containerH / 2,
    width: tempInnerW * center.z,
  }
}

function Crosshairs({ width, height, visible }: { width: number, height: number, visible: boolean }) {
  if (!visible) return null
  const lineStyle = {
    position: 'absolute' as const,
    background: 'rgba(255, 255, 255, 0.4)',
    pointerEvents: 'none' as const,
  }
  return (
    <>
      <div style={{ ...lineStyle, left: width / 2, top: 0, width: 1, height }} />
      <div style={{ ...lineStyle, left: 0, top: height / 2, width, height: 1 }} />
    </>
  )
}

function formatCharConfigString(center: ImageCenter) {
  return `imageCenter: { x: ${Math.round(center.x)}, y: ${Math.round(center.y)}, z: ${Number(center.z.toFixed(2))} }`
}

// =========================================== Shared Controls ===========================================

function CharCenterControls({ center, setCenter, configString, onReset, onCopyCenter, onPasteCenter, clipboard }: {
  center: ImageCenter,
  setCenter: React.Dispatch<React.SetStateAction<ImageCenter>>,
  configString: string,
  onReset: () => void,
  onCopyCenter: () => void,
  onPasteCenter: () => void,
  clipboard: ImageCenter | null,
}) {
  return (
    <>
      <Flex gap={8}>
        <NumberInput label='x' value={Math.round(center.x)} onChange={(v) => setCenter((c) => ({ ...c, x: Number(v) || 0 }))} style={{ width: 100 }} />
        <NumberInput label='y' value={Math.round(center.y)} onChange={(v) => setCenter((c) => ({ ...c, y: Number(v) || 0 }))} style={{ width: 100 }} />
        <NumberInput
          label='z'
          value={Number(center.z.toFixed(2))}
          onChange={(v) => setCenter((c) => ({ ...c, z: Number(v) || 1 }))}
          step={0.01}
          decimalScale={2}
          style={{ width: 100 }}
        />
      </Flex>
      <Flex gap={8} align='center'>
        <CopyButton value={configString}>
          {({ copied, copy }) => (
            <Button
              size='xs'
              variant='subtle'
              leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              onClick={() => {
                copy()
                onCopyCenter()
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          )}
        </CopyButton>
        <Button size='xs' variant='subtle' onClick={onPasteCenter} disabled={!clipboard} leftSection={<IconClipboard size={14} />}>Paste</Button>
        <Button size='xs' variant='subtle' onClick={onReset}>Reset</Button>
      </Flex>
      <code style={{ fontSize: 13, background: '#222', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>{configString}</code>
    </>
  )
}

// =========================================== Character Drag/Zoom ===========================================

function useCharacterDragZoom(setCenter: React.Dispatch<React.SetStateAction<ImageCenter>>, tempInnerW: number) {
  const onDrag = useCallback((dx: number, dy: number) => {
    setCenter((prev) => ({
      ...prev,
      x: prev.x - dx * 2 * 1024 / (prev.z * tempInnerW),
      y: prev.y - dy * 2 * 1024 / (prev.z * tempInnerW),
    }))
  }, [setCenter, tempInnerW])

  const onZoom = useCallback((deltaY: number, ctrlKey: boolean) => {
    const step = ctrlKey ? 0.0001875 : 0.00001875
    setCenter((prev) => ({
      ...prev,
      z: Math.max(0.5, Math.min(2, prev.z - deltaY * step)),
    }))
  }, [setCenter])

  return { onDrag, onZoom }
}

// =========================================== Generic Character Editor ===========================================

function CharacterEditor({ label, selectedCharId, center, setCenter, clipboard, setClipboard, tempInnerW, containerH, mode, showCrosshairs }: {
  label: string,
  selectedCharId: CharacterId | null,
  center: ImageCenter,
  setCenter: React.Dispatch<React.SetStateAction<ImageCenter>>,
  clipboard: ImageCenter | null,
  setClipboard: (c: ImageCenter) => void,
  tempInnerW: number,
  containerH: number,
  mode: 'static' | 'spine',
  showCrosshairs: boolean,
}) {
  const [spineUnsupported, setSpineUnsupported] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSpineUnsupported(false)
  }, [selectedCharId])

  const { onDrag, onZoom } = useCharacterDragZoom(setCenter, tempInnerW)
  const { handleMouseDown } = useDragInteraction(containerRef, onDrag, onZoom)

  const portraitStyle = computePortraitStyle(center, tempInnerW, containerH)
  const configString = formatCharConfigString(center)

  const handleReset = () => {
    if (!selectedCharId) return
    const meta = getGameMetadata().characters[selectedCharId]
    setCenter(meta ? { ...meta.imageCenter } : { ...DEFAULT_CENTER })
    setSpineUnsupported(false)
  }

  return (
    <Flex direction='column' gap={10}>
      <b>{label}</b>
      <div
        ref={containerRef}
        style={{
          width: parentW,
          height: containerH,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #555',
          borderRadius: 6,
          cursor: 'grab',
          background: '#1a1a2e',
        }}
        onMouseDown={handleMouseDown}
      >
        {selectedCharId && mode === 'static' && (
          <img
            src={Assets.getCharacterPortraitById(selectedCharId)}
            style={portraitStyle}
            draggable={false}
          />
        )}
        {selectedCharId && mode === 'spine' && (
          spineUnsupported
            ? <div style={{ padding: 20, color: '#888' }}>No spine data for this character</div>
            : (
              <SpinePortrait
                characterId={selectedCharId}
                style={portraitStyle}
                onUnsupported={() => setSpineUnsupported(true)}
              />
            )
        )}
        <Crosshairs width={parentW} height={containerH} visible={showCrosshairs} />
      </div>
      <CharCenterControls
        center={center}
        setCenter={setCenter}
        configString={configString}
        onReset={handleReset}
        onCopyCenter={() => setClipboard({ ...center })}
        onPasteCenter={() => clipboard && setCenter({ ...clipboard })}
        clipboard={clipboard}
      />
    </Flex>
  )
}

// =========================================== Light Cone Editor ===========================================

function LightConeCenterEditor({ showCrosshairs }: { showCrosshairs: boolean }) {
  const { t } = useTranslation('gameData')
  const [selectedLcId, setSelectedLcId] = useState<LightConeId | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0, s: 1.15 })
  const containerRef = useRef<HTMLDivElement>(null)

  const lcOptions = useMemo(() => {
    const lcs = Object.values(getGameMetadata().lightCones)
    return lcs
      .map((lc) => ({
        value: lc.id,
        label: t(`Lightcones.${lc.id}.Name`),
        icon: Assets.getLightConeIconById(lc.id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [t])

  useEffect(() => {
    if (!selectedLcId) return
    const meta = getGameMetadata().lightCones[selectedLcId]
    if (meta?.imageOffset) {
      setOffset({ ...meta.imageOffset })
    } else {
      setOffset({ x: 0, y: 0, s: 1.15 })
    }
  }, [selectedLcId])

  const onDrag = useCallback((_dx: number, dy: number) => {
    setOffset((prev) => {
      // Compute sensitivity at y=0 vs y=1 to avoid clamping issues at edges
      const dyAt0 = computeLcTransform({ ...prev, y: 0 }, parentW, newLcHeight).dy
      const dyAt1 = computeLcTransform({ ...prev, y: 1 }, parentW, newLcHeight).dy
      const sensitivity = dyAt1 - dyAt0
      if (Math.abs(sensitivity) < 0.001) return prev
      return { ...prev, y: prev.y + dy / sensitivity }
    })
  }, [])

  const onZoom = useCallback((deltaY: number, ctrlKey: boolean) => {
    const step = ctrlKey ? 0.0001875 : 0.00001875
    setOffset((prev) => ({
      ...prev,
      s: Math.max(0.5, Math.min(2, prev.s - deltaY * step)),
    }))
  }, [])

  const { handleMouseDown } = useDragInteraction(containerRef, onDrag, onZoom)

  const { dy, scale } = computeLcTransform(offset, parentW, newLcHeight)
  const configString = `imageOffset: { x: 0, y: ${Math.round(offset.y)}, s: ${Number(offset.s.toFixed(2))} }`

  const handleReset = () => {
    if (!selectedLcId) return
    const meta = getGameMetadata().lightCones[selectedLcId]
    setOffset(meta?.imageOffset ? { ...meta.imageOffset } : { x: 0, y: 0, s: 1.15 })
  }

  return (
    <Flex direction='column' gap={10}>
      <b>Light Cone</b>
      <SearchableCombobox
        options={lcOptions}
        value={selectedLcId}
        onChange={(v) => setSelectedLcId(v as LightConeId | null)}
        placeholder='Select light cone'
        style={{ width: parentW }}
      />
      <div style={{ position: 'relative' }}>
        {selectedLcId && (
          <Flex
            direction='column'
            align='flex-end'
            style={{
              position: 'relative',
              height: 0,
              top: newLcHeight - 35,
              paddingRight: 5,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                height: 30,
                backgroundColor: 'rgb(0 0 0 / 70%)',
                padding: '3px 12px',
                borderRadius: 6,
                fontSize: 14,
                width: 'fit-content',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: parentW - 50,
                border: '1px solid rgba(255,255,255,0.15)',
                zIndex: 21,
              }}
            >
              {`S5 - ${t(`Lightcones.${selectedLcId}.Name`)}`}
            </div>
          </Flex>
        )}
        <div
          ref={containerRef}
          style={{
            width: parentW,
            height: newLcHeight,
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #555',
            borderRadius: 6,
            cursor: 'ns-resize',
            background: '#1a1a2e',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onMouseDown={handleMouseDown}
        >
          {selectedLcId && (
            <img
              src={Assets.getLightConePortraitById(selectedLcId)}
              style={{
                width: '100%',
                transform: `translateY(${dy}px) scale(${scale})`,
              }}
              draggable={false}
            />
          )}
          <Crosshairs width={parentW} height={newLcHeight} visible={showCrosshairs} />
        </div>
      </div>
      <Flex gap={8}>
        <NumberInput label='y' value={Math.round(offset.y)} onChange={(v) => setOffset((c) => ({ ...c, y: Number(v) || 0 }))} style={{ width: 100 }} />
        <NumberInput
          label='s'
          value={Number(offset.s.toFixed(2))}
          onChange={(v) => setOffset((c) => ({ ...c, s: Number(v) || 1 }))}
          step={0.01}
          decimalScale={2}
          style={{ width: 100 }}
        />
      </Flex>
      <Flex gap={8} align='center'>
        <code style={{ fontSize: 13, background: '#222', padding: '4px 8px', borderRadius: 4 }}>{configString}</code>
        <CopyButton value={configString}>
          {({ copied, copy }) => (
            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy} variant='subtle' title='Copy config string'>
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          )}
        </CopyButton>
        <Button size='xs' variant='subtle' onClick={handleReset}>Reset</Button>
      </Flex>
    </Flex>
  )
}

// =========================================== Exported Section ===========================================

export function ImageCenterEditorSection() {
  const [selectedCharId, setSelectedCharId] = useState<CharacterId | null>(null)
  const [portraitCenter, setPortraitCenter] = useState<ImageCenter>({ ...DEFAULT_CENTER })
  const [spineCenter, setSpineCenter] = useState<ImageCenter>({ ...DEFAULT_CENTER })
  const [clipboard, setClipboard] = useState<ImageCenter | null>(null)
  const [showCrosshairs, setShowCrosshairs] = useState(true)

  const characterOptions = useMemo(buildCharacterOptions, [])

  const disableSpine = selectedCharId ? getGameMetadata().characters[selectedCharId]?.disableSpine : false

  useEffect(() => {
    if (!selectedCharId) return
    const meta = getGameMetadata().characters[selectedCharId]
    if (meta) {
      setPortraitCenter({ ...meta.imageCenter })
      setSpineCenter({ ...meta.spineCenter })
    }
  }, [selectedCharId])

  return (
    <Flex direction='column' gap={20}>
      <Flex gap={16} align='center'>
        <SearchableCombobox
          options={characterOptions}
          value={selectedCharId}
          onChange={(v) => setSelectedCharId(v as CharacterId | null)}
          placeholder='Select character'
          style={{ width: parentW }}
        />
        <Checkbox
          label='Crosshairs'
          checked={showCrosshairs}
          onChange={(e) => setShowCrosshairs(e.currentTarget.checked)}
        />
        {selectedCharId && disableSpine && <Badge color='red' variant='filled'>Spine Disabled</Badge>}
      </Flex>

      <Flex gap={40} wrap='nowrap' align='center'>
        <CharacterEditor
          label='Full View - Static'
          selectedCharId={selectedCharId}
          center={portraitCenter}
          setCenter={setPortraitCenter}
          clipboard={clipboard}
          setClipboard={setClipboard}
          tempInnerW={innerW}
          containerH={parentH}
          mode='static'
          showCrosshairs={showCrosshairs}
        />
        <CharacterEditor
          label='DPS Score - Static'
          selectedCharId={selectedCharId}
          center={portraitCenter}
          setCenter={setPortraitCenter}
          clipboard={clipboard}
          setClipboard={setClipboard}
          tempInnerW={simScoreInnerW}
          containerH={DPS_CONTAINER_H}
          mode='static'
          showCrosshairs={showCrosshairs}
        />
        <CharacterEditor
          label='Full View - Spine'
          selectedCharId={selectedCharId}
          center={spineCenter}
          setCenter={setSpineCenter}
          clipboard={clipboard}
          setClipboard={setClipboard}
          tempInnerW={innerW}
          containerH={parentH}
          mode='spine'
          showCrosshairs={showCrosshairs}
        />
        <CharacterEditor
          label='DPS Score - Spine'
          selectedCharId={selectedCharId}
          center={spineCenter}
          setCenter={setSpineCenter}
          clipboard={clipboard}
          setClipboard={setClipboard}
          tempInnerW={simScoreInnerW}
          containerH={DPS_CONTAINER_H}
          mode='spine'
          showCrosshairs={showCrosshairs}
        />
        <LightConeCenterEditor showCrosshairs={showCrosshairs} />
      </Flex>
    </Flex>
  )
}
