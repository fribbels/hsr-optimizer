import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  CopyButton,
  Flex,
  NumberInput,
  SegmentedControl,
  Text,
} from '@mantine/core'
import {
  IconCheck,
  IconClipboard,
  IconCopy,
  IconSparkles,
  IconTree,
} from '@tabler/icons-react'
import i18next from 'i18next'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  type DebugVisualConfig,
  getShowcasePreset,
  NATURAL_PRESET,
  PORTRAIT_BLUR,
  PORTRAIT_BRIGHTNESS,
  PORTRAIT_SATURATE,
  SHINE_PRESET,
  ShowcasePreset,
} from 'lib/characterPreview/debugVisualConfigStore'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import {
  cardTotalW,
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
import type { Character, CharacterId } from 'types/character'
import type { Relic } from 'types/relic'
import { type LightConeId } from 'types/lightCone'
import type { ImageCenter, ShowcaseDisplayDimensionsOverride } from 'types/metadata'

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

// =========================================== Mock Relic Factory ===========================================

function createMockRelic(part: Parts, index: number): Relic {
  const relicSets = [Sets.MusketeerOfWildWheat, Sets.HunterOfGlacialForest, Sets.KnightOfPurityPalace, Sets.PasserbyOfWanderingCloud]
  const ornamentSets = [Sets.SpaceSealingStation, Sets.FleetOfTheAgeless]
  const isOrnament = part === Parts.PlanarSphere || part === Parts.LinkRope

  const mainStats: Record<Parts, string> = {
    [Parts.Head]: Stats.HP,
    [Parts.Hands]: Stats.ATK,
    [Parts.Body]: Stats.CR,
    [Parts.Feet]: Stats.SPD,
    [Parts.PlanarSphere]: Stats.Physical_DMG,
    [Parts.LinkRope]: Stats.ATK_P,
  }

  const substats = [
    { stat: Stats.ATK_P, value: 0.0864, rolls: { high: 2, mid: 1, low: 0 }, addedRolls: 2 },
    { stat: Stats.CR, value: 0.0648, rolls: { high: 1, mid: 1, low: 0 }, addedRolls: 1 },
    { stat: Stats.CD, value: 0.1296, rolls: { high: 1, mid: 1, low: 0 }, addedRolls: 1 },
    { stat: Stats.SPD, value: 5, rolls: { high: 1, mid: 1, low: 0 }, addedRolls: 1 },
  ]

  return {
    id: `mock-relic-${part}-${index}`,
    set: isOrnament ? ornamentSets[index % 2] : relicSets[index % 4],
    part: part,
    enhance: 15,
    grade: 5,
    main: { stat: mainStats[part], value: 1 },
    substats: substats,
    previewSubstats: substats,
    equippedBy: undefined,
    weightScore: 0,
    augmentedStats: {},
    initialRolls: 4,
  } as Relic
}

// =========================================== Mock Character Factory ===========================================

function createMockCharacter(characterId: CharacterId, lightConeId: LightConeId | null): Character {
  const partsArray = [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet, Parts.PlanarSphere, Parts.LinkRope]
  const mockRelics = partsArray.map((part, i) => createMockRelic(part, i))
  const equippedRelics: Record<string, Relic> = {}
  for (const relic of mockRelics) {
    equippedRelics[relic.part] = relic
  }

  const meta = getGameMetadata().characters[characterId]
  const lightCones = Object.keys(getGameMetadata().lightCones) as LightConeId[]
  const matchingLc = lightConeId ?? lightCones.find((lc) => getGameMetadata().lightCones[lc]?.path === meta?.path) ?? lightCones[0]

  return {
    id: characterId,
    key: `mock-${characterId}`,
    form: {
      characterId,
      characterLevel: 80,
      characterEidolon: 0,
      lightCone: matchingLc,
      lightConeLevel: 80,
      lightConeSuperimposition: 1,
    },
    equipped: equippedRelics,
  } as unknown as Character
}

// =========================================== Full Card Preview Editor ===========================================

function buildLightConeOptions(): SearchableComboboxOption[] {
  const t = i18next.getFixedT(null, 'gameData', 'Lightcones')
  const lcs = Object.values(getGameMetadata().lightCones)
  return lcs
    .sort((a, b) => t(`${a.id}.Name`).localeCompare(t(`${b.id}.Name`)))
    .map((lc) => ({
      value: lc.id,
      label: t(`${lc.id}.Name`),
      icon: Assets.getLightConeIconById(lc.id),
    }))
}

function CharacterPreviewEditor() {
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const containerRef = useRef<HTMLDivElement>(null)

  // Character and light cone selection
  const [selectedCharId, setSelectedCharId] = useState<CharacterId | null>(null)
  const [selectedLcId, setSelectedLcId] = useState<LightConeId | null>(null)

  // Position state
  const [imageCenter, setImageCenter] = useState<ImageCenter>({ ...DEFAULT_CENTER })
  const [backgroundOffset, setBackgroundOffset] = useState<{ x: number, y: number, z: number }>({ x: 0, y: 0, z: 0 })

  // Visual settings
  const [preset, setPreset] = useState<ShowcasePreset>(ShowcasePreset.SHINE)
  const [dpsScoreMode, setDpsScoreMode] = useState(false)

  const characterOptions = useMemo(buildCharacterOptions, [])
  const lightConeOptions = useMemo(buildLightConeOptions, [])

  // Load character metadata when selection changes
  useEffect(() => {
    if (!selectedCharId) return
    const meta = getGameMetadata().characters[selectedCharId]
    if (meta) {
      setImageCenter({ ...meta.imageCenter })
      setBackgroundOffset(meta.backgroundCenterOffset ? { ...meta.backgroundCenterOffset } : { x: 0, y: 0, z: 0 })
    }
    // Auto-select matching light cone
    const lightCones = Object.keys(getGameMetadata().lightCones) as LightConeId[]
    const matchingLc = lightCones.find((lc) => getGameMetadata().lightCones[lc]?.path === meta?.path)
    if (matchingLc) setSelectedLcId(matchingLc)
  }, [selectedCharId])

  const effectiveVisualConfig: DebugVisualConfig = useMemo(() => {
    return getShowcasePreset(preset)
  }, [preset])

  // Mock character with selected light cone
  const mockCharacter = useMemo(() => {
    if (!selectedCharId) return null
    return createMockCharacter(selectedCharId, selectedLcId)
  }, [selectedCharId, selectedLcId])

  // Editor overrides for live preview
  const editorOverrides: ShowcaseDisplayDimensionsOverride = useMemo(() => ({
    charCenter: imageCenter,
    backgroundCenterOffset: backgroundOffset,
    forceSimScoreLayout: dpsScoreMode,
  }), [imageCenter, backgroundOffset, dpsScoreMode])

  // Track which zone is being dragged
  const draggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const dragZoneRef = useRef<'portrait' | 'background'>('portrait')

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Determine drag zone based on mouse position
    // Portrait is on the left side (parentW pixels)
    const relativeX = e.clientX - rect.left
    dragZoneRef.current = relativeX < parentW ? 'portrait' : 'background'

    draggingRef.current = true
    lastPosRef.current = { x: e.clientX, y: e.clientY }

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - lastPosRef.current.x
      const dy = e.clientY - lastPosRef.current.y
      lastPosRef.current = { x: e.clientX, y: e.clientY }

      if (dragZoneRef.current === 'portrait') {
        const dragInnerW = dpsScoreMode ? simScoreInnerW : innerW
        setImageCenter((prev) => ({
          ...prev,
          x: prev.x - dx * 2 * 1024 / (prev.z * dragInnerW),
          y: prev.y - dy * 2 * 1024 / (prev.z * dragInnerW),
        }))
      } else {
        setBackgroundOffset((prev) => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
        }))
      }
    }

    const handleMouseUp = () => {
      draggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [dpsScoreMode])

  // Zoom interaction (scroll) - portrait zoom vs background zoom based on cursor
  useEffect(() => {
    const el = containerRef.current
    if (!el || !selectedCharId) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const rect = el.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const isPortraitArea = relativeX < parentW
      const step = e.ctrlKey ? 0.01 : 0.001

      if (isPortraitArea) {
        setImageCenter((prev) => ({
          ...prev,
          z: Math.max(0.5, Math.min(3, prev.z - e.deltaY * step)),
        }))
      } else {
        setBackgroundOffset((prev) => ({
          ...prev,
          z: Math.max(-3, Math.min(5, prev.z - e.deltaY * step)),
        }))
      }
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [selectedCharId])

  // Config strings with proper character name
  const characterName = selectedCharId ? t(`${selectedCharId}.LongName`) : 'Unknown'
  const imageCenterString = `imageCenter: { x: ${Math.round(imageCenter.x)}, y: ${Math.round(imageCenter.y)}, z: ${Number(imageCenter.z.toFixed(2))} }, // ${characterName}`
  const backgroundOffsetString = `backgroundCenterOffset: { x: ${Math.round(backgroundOffset.x)}, y: ${Math.round(backgroundOffset.y)}, z: ${Number(backgroundOffset.z.toFixed(2))} }, // ${characterName}`

  const handleResetImageCenter = () => {
    if (!selectedCharId) return
    const meta = getGameMetadata().characters[selectedCharId]
    setImageCenter(meta ? { ...meta.imageCenter } : { ...DEFAULT_CENTER })
  }

  const handleResetBackgroundOffset = () => {
    if (!selectedCharId) return
    const meta = getGameMetadata().characters[selectedCharId]
    setBackgroundOffset(meta?.backgroundCenterOffset ? { ...meta.backgroundCenterOffset } : { x: 0, y: 0, z: 0 })
  }

  return (
    <Flex direction='column' gap={10}>
      <b>Full Card Preview</b>

      {/* Character and Light Cone selectors */}
      <Flex gap={16} align='center'>
        <SearchableCombobox
          options={characterOptions}
          value={selectedCharId}
          onChange={(v) => setSelectedCharId(v as CharacterId | null)}
          placeholder='Select character'
          style={{ width: 250 }}
        />
        <SearchableCombobox
          options={lightConeOptions}
          value={selectedLcId}
          onChange={(v) => setSelectedLcId(v as LightConeId | null)}
          placeholder='Select light cone'
          style={{ width: 250 }}
        />
      </Flex>

      {/* Visual controls */}
      <Flex gap={16} align='center'>
        <SegmentedControl
          size='xs'
          value={preset}
          onChange={(v) => setPreset(v as ShowcasePreset)}
          data={[
            { label: <IconSparkles size={16} />, value: ShowcasePreset.SHINE },
            { label: <IconTree size={16} />, value: ShowcasePreset.NATURAL },
          ]}
        />
        <SegmentedControl
          size='xs'
          value={dpsScoreMode ? 'dps' : 'full'}
          onChange={(v) => setDpsScoreMode(v === 'dps')}
          data={[
            { label: 'Full', value: 'full' },
            { label: 'DPS Score', value: 'dps' },
          ]}
        />
      </Flex>

      {/* Card preview */}
      {!selectedCharId || !mockCharacter ? (
        <div
          style={{
            width: cardTotalW,
            height: parentH,
            border: '1px solid #555',
            borderRadius: 6,
            background: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
          }}
        >
          Select a character to preview
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            cursor: 'grab',
            borderRadius: 8,
            width: cardTotalW,
          }}
          onMouseDown={handleMouseDown}
        >
          <div style={{ pointerEvents: 'none' }}>
            <CharacterPreview
              id='metadata-preview'
              character={mockCharacter}
              source={ShowcaseSource.BUILDS_MODAL}
              savedBuildOverride={null}
              forceDebug={true}
              debugVisualConfig={effectiveVisualConfig}
              editorOverrides={editorOverrides}
            />
          </div>
        </div>
      )}

      {/* Image center controls */}
      <Flex direction='column' gap={8}>
        <Text size='sm' fw={600}>Image Center (Portrait) — drag on portrait to adjust</Text>
        <Flex gap={8} align='flex-end'>
          <NumberInput label='x' value={Math.round(imageCenter.x)} onChange={(v) => setImageCenter((c) => ({ ...c, x: Number(v) || 0 }))} style={{ width: 90 }} size='xs' />
          <NumberInput label='y' value={Math.round(imageCenter.y)} onChange={(v) => setImageCenter((c) => ({ ...c, y: Number(v) || 0 }))} style={{ width: 90 }} size='xs' />
          <NumberInput label='z' value={Number(imageCenter.z.toFixed(2))} onChange={(v) => setImageCenter((c) => ({ ...c, z: Number(v) || 1 }))} step={0.01} decimalScale={2} style={{ width: 90 }} size='xs' />
          <Button size='xs' variant='subtle' onClick={handleResetImageCenter}>Reset</Button>
        </Flex>
        <Flex gap={8} align='center'>
          <code style={{ fontSize: 12, background: '#222', padding: '4px 8px', borderRadius: 4 }}>{imageCenterString}</code>
          <CopyButton value={imageCenterString}>
            {({ copied, copy }) => (
              <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy} variant='subtle' size='sm'>
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              </ActionIcon>
            )}
          </CopyButton>
        </Flex>
      </Flex>

      {/* Background offset controls */}
      <Flex direction='column' gap={8}>
        <Text size='sm' fw={600}>Background Center Offset — drag outside portrait to adjust, scroll to zoom</Text>
        <Flex gap={8} align='flex-end'>
          <NumberInput label='x' value={Math.round(backgroundOffset.x)} onChange={(v) => setBackgroundOffset((c) => ({ ...c, x: Number(v) || 0 }))} style={{ width: 90 }} size='xs' />
          <NumberInput label='y' value={Math.round(backgroundOffset.y)} onChange={(v) => setBackgroundOffset((c) => ({ ...c, y: Number(v) || 0 }))} style={{ width: 90 }} size='xs' />
          <NumberInput label='z' value={Number(backgroundOffset.z.toFixed(2))} onChange={(v) => setBackgroundOffset((c) => ({ ...c, z: Number(v) || 0 }))} step={0.01} decimalScale={2} style={{ width: 90 }} size='xs' />
          <Button size='xs' variant='subtle' onClick={handleResetBackgroundOffset}>Reset</Button>
        </Flex>
        <Flex gap={8} align='center'>
          <code style={{ fontSize: 12, background: '#222', padding: '4px 8px', borderRadius: 4 }}>{backgroundOffsetString}</code>
          <CopyButton value={backgroundOffsetString}>
            {({ copied, copy }) => (
              <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy} variant='subtle' size='sm'>
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              </ActionIcon>
            )}
          </CopyButton>
        </Flex>
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

      {/* Full Card Preview Editor */}
      <CharacterPreviewEditor />
    </Flex>
  )
}
