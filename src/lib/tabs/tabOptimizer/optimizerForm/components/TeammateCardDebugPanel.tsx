import { Accordion, Button, Flex, Group, Slider, Switch, Text } from '@mantine/core'
import { useShallow } from 'zustand/react/shallow'
import { create } from 'zustand'

/* ------------------------------------------------------------------ */
/*  Debug store                                                        */
/* ------------------------------------------------------------------ */

interface TeammateCardDebugState {
  cardHeight: number
  cardBorderRadius: number
  rightColWidth: number
  rightColGap: number
  avatarSize: number
  lcIconSize: number
  zonePx: number
  showInsetShadow: boolean
}

interface TeammateCardDebugActions {
  set: (partial: Partial<TeammateCardDebugState>) => void
  reset: () => void
}

export type TeammateCardDebugStore = TeammateCardDebugState & TeammateCardDebugActions

const DEFAULTS: TeammateCardDebugState = {
  cardHeight: 490,
  cardBorderRadius: 5,
  rightColWidth: 135,
  rightColGap: 3,
  avatarSize: 96,
  lcIconSize: 96,
  zonePx: 8,
  showInsetShadow: false,
}

export const useTeammateCardDebugStore = create<TeammateCardDebugStore>((set) => ({
  ...DEFAULTS,
  set: (partial) => set(partial),
  reset: () => set(DEFAULTS),
}))

export function useTeammateCardDebugValues() {
  return useTeammateCardDebugStore(useShallow((s) => ({
    cardHeight: s.cardHeight,
    cardBorderRadius: s.cardBorderRadius,
    rightColWidth: s.rightColWidth,
    rightColGap: s.rightColGap,
    avatarSize: s.avatarSize,
    lcIconSize: s.lcIconSize,
    zonePx: s.zonePx,
    showInsetShadow: s.showInsetShadow,
  })))
}

/* ------------------------------------------------------------------ */
/*  Debug slider                                                       */
/* ------------------------------------------------------------------ */

function DebugSlider({ label, storeKey, min, max, step }: {
  label: string
  storeKey: keyof TeammateCardDebugState
  min: number
  max: number
  step?: number
}) {
  const value = useTeammateCardDebugStore((s) => s[storeKey]) as number

  return (
    <Group gap={8} wrap="nowrap">
      <Text size="xs" w={110} style={{ flexShrink: 0 }}>{label}</Text>
      <Slider
        size="xs"
        style={{ flex: 1 }}
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(v) => useTeammateCardDebugStore.getState().set({ [storeKey]: v })}
        label={null}
      />
      <Text size="xs" w={45} ta="right" ff="monospace" style={{ flexShrink: 0 }}>{value}px</Text>
    </Group>
  )
}

function DebugSwitch({ label, storeKey }: {
  label: string
  storeKey: keyof TeammateCardDebugState
}) {
  const value = useTeammateCardDebugStore((s) => s[storeKey]) as boolean

  return (
    <Group gap={8} wrap="nowrap">
      <Text size="xs" w={110} style={{ flexShrink: 0 }}>{label}</Text>
      <Switch
        size="sm"
        checked={value}
        onChange={(e) => useTeammateCardDebugStore.getState().set({ [storeKey]: e.currentTarget.checked })}
      />
    </Group>
  )
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */

export function TeammateCardDebugPanel() {
  return (
    <Accordion variant="default" styles={{ content: { paddingBlock: 0, paddingBottom: 10 } }}>
      <Accordion.Item value="debug">
        <Accordion.Control style={{ fontSize: 14 }}>TeammateCard Debug</Accordion.Control>
        <Accordion.Panel>
          <Flex direction="column" gap={6} px={4}>
            <DebugSlider label="Card height" storeKey="cardHeight" min={350} max={700} />
            <DebugSlider label="Card radius" storeKey="cardBorderRadius" min={0} max={20} />
            <DebugSlider label="Right col width" storeKey="rightColWidth" min={80} max={180} />
            <DebugSlider label="Right col gap" storeKey="rightColGap" min={0} max={8} />
            <DebugSlider label="Avatar size" storeKey="avatarSize" min={48} max={128} />
            <DebugSlider label="LC icon size" storeKey="lcIconSize" min={32} max={96} />
            <DebugSlider label="Zone px" storeKey="zonePx" min={4} max={20} />
            <DebugSwitch label="Inset shadow" storeKey="showInsetShadow" />
            <Button
              size="xs"
              variant="subtle"
              onClick={() => useTeammateCardDebugStore.getState().reset()}
              mt={4}
            >
              Reset to defaults
            </Button>
          </Flex>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}
