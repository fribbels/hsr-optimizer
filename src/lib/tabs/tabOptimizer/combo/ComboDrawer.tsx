import { Drawer } from '@mantine/core'
import { ConditionalDataType } from 'lib/constants/constants'
import { OpenCloseIDs, useOpenClose } from 'lib/hooks/useOpenClose'
import { useScrollLock } from 'lib/layout/scrollController'
import { ComboHeader } from 'lib/tabs/tabOptimizer/combo/ComboHeader'
import { StateDisplay } from 'lib/tabs/tabOptimizer/combo/StateDisplay'
import { elementToDataKey } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import type { ComboDataKey, ComboNumberConditional } from 'lib/optimization/combo/comboTypes'
import { useComboDrawerStore, locateConditional } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { flushComboDrawerToForm } from 'lib/tabs/tabOptimizer/combo/comboDrawerService'
import { getForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import Selecto from 'react-selecto'

const drawerContentStyle = { width: 1560, height: '100%' } as const

const ENTER_DURATION = 500
const EXIT_DURATION = 250

export function ComboDrawer() {
  const { close: closeComboDrawer, isOpen: isOpenComboDrawer } = useOpenClose(OpenCloseIDs.COMBO_DRAWER)
  const [contentMounted, setContentMounted] = useState(false)

  useLayoutEffect(() => {
    if (isOpenComboDrawer) {
      useComboDrawerStore.getState().initialize(getForm())
      setContentMounted(true)
    } else {
      // Flush form data immediately (save state), but delay store reset
      // and content unmount so the exit transition can play with real content.
      flushComboDrawerToForm()
      const timer = setTimeout(() => {
        useComboDrawerStore.getState().reset()
        setContentMounted(false)
      }, EXIT_DURATION)
      return () => clearTimeout(timer)
    }
  }, [isOpenComboDrawer])

  return (
    <Drawer
      title={<ComboHeader />}
      position='right'
      onClose={() => closeComboDrawer()}
      opened={isOpenComboDrawer}
      size={1625}
      transitionProps={{ duration: ENTER_DURATION, exitDuration: EXIT_DURATION, transition: 'slide-left' }}
      overlayProps={{ transitionProps: { duration: ENTER_DURATION, exitDuration: EXIT_DURATION } }}
      styles={{
        header: { position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--layer-2)' },
        body: { paddingTop: 0 },
      }}
    >
      {contentMounted && <ComboDrawerContent />}
    </Drawer>
  )
}

function ComboDrawerContent() {
  useScrollLock(true)
  const initialized = useComboDrawerStore((s) => s.initialized)

  const selectoRef: RefObject<Selecto | null> = useRef<Selecto>(null)
  const selectActivationState = useRef(true)
  const lastSelectedKeyState = useRef<string | undefined>(undefined)
  const startCellType = useRef<ConditionalDataType | null>(null)

  const handleDragStart = useCallback((e: Parameters<React.ComponentProps<typeof Selecto>['onDragStart'] & {}>[0]) => {
    // Clear Selecto's internal selection so every click/drag starts fresh.
    // Without this, clicking the same cell twice produces no delta → no onSelect event.
    selectoRef.current?.setSelectedTargets([])
    // Always reset — prevents stale key from suppressing first handleDrag
    lastSelectedKeyState.current = undefined

    const startKey: string = ((e.inputEvent as MouseEvent).target as HTMLElement | null)?.getAttribute('data-key') ?? '{}'
    const dataKey: ComboDataKey = JSON.parse(startKey)
    if (!dataKey.id) return

    const state = useComboDrawerStore.getState()
    const cond = locateConditional(state, dataKey.source, dataKey.id)
    startCellType.current = cond?.type ?? null

    if (cond?.type === ConditionalDataType.BOOLEAN) {
      selectActivationState.current = !cond.activations[dataKey.index]
    } else if (cond?.type === ConditionalDataType.NUMBER || cond?.type === ConditionalDataType.SELECT) {
      const numberCond = cond as ComboNumberConditional
      const isActive = numberCond.partitions[dataKey.partitionIndex]?.activations[dataKey.index]
      selectActivationState.current = !isActive
    } else {
      selectActivationState.current = true
    }
  }, [])

  const handleDrag = useCallback((e: Parameters<React.ComponentProps<typeof Selecto>['onDrag'] & {}>[0]) => {
    const selectedKey: string = ((e.inputEvent as MouseEvent).target as HTMLElement | null)?.getAttribute('data-key') ?? '{}'
    if (selectedKey === lastSelectedKeyState.current) return

    const dataKey: ComboDataKey = JSON.parse(selectedKey)
    if (!dataKey.id || dataKey.index === 0) {
      lastSelectedKeyState.current = selectedKey
      return
    }

    // Skip cross-type cells
    const state = useComboDrawerStore.getState()
    const cond = locateConditional(state, dataKey.source, dataKey.id)
    if (cond && cond.type !== startCellType.current) {
      lastSelectedKeyState.current = selectedKey
      return
    }

    if (cond?.type === ConditionalDataType.NUMBER || cond?.type === ConditionalDataType.SELECT) {
      state.setPartitionActivation(dataKey.source, dataKey.id, dataKey.partitionIndex, dataKey.index)
    }

    lastSelectedKeyState.current = selectedKey
  }, [])

  const handleSelect = useCallback((e: Parameters<React.ComponentProps<typeof Selecto>['onSelect'] & {}>[0]) => {
    const activate = selectActivationState.current
    const updates: Array<{ sourceKey: string; id: string; index: number; value: boolean }> = []

    e.added.forEach((el) => {
      const keyStr = elementToDataKey(el)
      const key: ComboDataKey = JSON.parse(keyStr)
      if (!key.id || key.index === 0) return

      const state = useComboDrawerStore.getState()
      const cond = locateConditional(state, key.source, key.id)
      if (cond && cond.type !== startCellType.current) return

      if (cond?.type === ConditionalDataType.BOOLEAN) {
        updates.push({ sourceKey: key.source, id: key.id, index: key.index, value: activate })
      }
    })

    // e.removed uses opposite activation direction for drag reversal
    e.removed.forEach((el) => {
      const keyStr = elementToDataKey(el)
      const key: ComboDataKey = JSON.parse(keyStr)
      if (!key.id || key.index === 0) return

      const state = useComboDrawerStore.getState()
      const cond = locateConditional(state, key.source, key.id)
      if (cond && cond.type !== startCellType.current) return

      if (cond?.type === ConditionalDataType.BOOLEAN) {
        updates.push({ sourceKey: key.source, id: key.id, index: key.index, value: !activate })
      }
    })

    // Partition deduplication: only fire if not already handled by handleDrag
    const lastKey: string = ((e.inputEvent as MouseEvent).target as HTMLElement | null)?.getAttribute('data-key') ?? '{}'
    let partitionUpdate = null
    if (lastKey !== lastSelectedKeyState.current) {
      const lastDataKey: ComboDataKey = JSON.parse(lastKey)
      if (lastDataKey.id && lastDataKey.index !== 0) {
        const state = useComboDrawerStore.getState()
        const cond = locateConditional(state, lastDataKey.source, lastDataKey.id)
        if (cond?.type === ConditionalDataType.NUMBER || cond?.type === ConditionalDataType.SELECT) {
          partitionUpdate = {
            sourceKey: lastDataKey.source,
            id: lastDataKey.id,
            partitionIndex: lastDataKey.partitionIndex,
            index: lastDataKey.index,
          }
        }
      }
    }

    if (updates.length > 0 || partitionUpdate) {
      useComboDrawerStore.getState().batchSetActivations(updates, partitionUpdate)
    }
  }, [])

  if (!initialized) {
    return <div style={{ ...drawerContentStyle, minHeight: 400 }} />
  }

  return (
    <div style={drawerContentStyle}>
      <StateDisplay />
      <Selecto
        ref={selectoRef}
        className='selecto-selection'
        selectableTargets={['.selectable']}
        selectByClick={true}
        selectFromInside={true}
        continueSelect={false}
        keyContainer={window}
        hitRate={0}
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onSelect={handleSelect}
      />
    </div>
  )
}
