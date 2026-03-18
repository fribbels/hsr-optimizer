import { Drawer } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { preprocessTurnAbilityNames } from 'lib/optimization/rotation/turnPreprocessor'
import { useScrollLock } from 'lib/rendering/scrollController'
import { ComboDrawerTitle } from 'lib/tabs/tabOptimizer/combo/ComboHeader'
import { StateDisplay } from 'lib/tabs/tabOptimizer/combo/StateDisplay'
import { elementToDataKey } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import {
  initializeComboState,
  locateActivations,
  updateActivation,
  updateFormState,
  updatePartitionActivation,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import type { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { getForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import Selecto from 'react-selecto'

const drawerContentStyle = { width: 1560, height: '100%' } as const

export function ComboDrawer() {
  const { close: closeComboDrawer, isOpen: isOpenComboDrawer } = useOpenClose(OpenCloseIDs.COMBO_DRAWER)

  const [comboState, setComboState] = useState<ComboState>({} as ComboState)
  const comboStateRef = useRef<ComboState>({} as ComboState)
  comboStateRef.current = comboState

  const selectActivationState = useRef(true)
  const lastSelectedKeyState = useRef<string | undefined>(undefined)

  // Lifecycle effect stays in outer: needs to fire on close after inner unmounts
  useEffect(() => {
    if (isOpenComboDrawer) {
      const form = getForm()
      if (!form?.characterId || !form.characterConditionals) return

      const newComboState = initializeComboState(form, true)
      newComboState.comboTurnAbilities = preprocessTurnAbilityNames(newComboState.comboTurnAbilities)
      setComboState(newComboState)
    } else {
      const current = comboStateRef.current
      if (!current || !current.comboTurnAbilities) return
      current.comboTurnAbilities = preprocessTurnAbilityNames(current.comboTurnAbilities)
      updateFormState(current)
    }
  }, [isOpenComboDrawer])

  return (
    <Drawer
      title={<ComboDrawerTitle />}
      position='right'
      onClose={() => closeComboDrawer()}
      opened={isOpenComboDrawer}
      size={1625}
      styles={{ body: { paddingTop: 0 } }}
    >
      {isOpenComboDrawer && (
        <ComboDrawerContent
          comboState={comboState}
          onComboStateChange={setComboState}
          comboStateRef={comboStateRef}
          selectActivationState={selectActivationState}
          lastSelectedKeyState={lastSelectedKeyState}
        />
      )}
    </Drawer>
  )
}

interface ComboDrawerContentProps {
  comboState: ComboState
  onComboStateChange: (state: ComboState) => void
  comboStateRef: React.MutableRefObject<ComboState>
  selectActivationState: React.MutableRefObject<boolean>
  lastSelectedKeyState: React.MutableRefObject<string | undefined>
}

function ComboDrawerContent({
  comboState,
  onComboStateChange,
  selectActivationState,
  lastSelectedKeyState,
}: ComboDrawerContentProps) {
  useScrollLock(true)

  const handleDrag = useCallback((e: Parameters<React.ComponentProps<typeof Selecto>['onDrag'] & {}>[0]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const selectedKey: string = e.inputEvent.target.getAttribute('data-key') ?? '{}'
    if (selectedKey != lastSelectedKeyState.current) {
      const partitionResult = updatePartitionActivation(selectedKey, comboState)
      if (partitionResult) onComboStateChange(partitionResult)
      lastSelectedKeyState.current = selectedKey
    }
  }, [comboState, onComboStateChange, lastSelectedKeyState])

  const handleDragStart = useCallback((e: Parameters<React.ComponentProps<typeof Selecto>['onDragStart'] & {}>[0]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const startKey: string = e.inputEvent.target.getAttribute('data-key') ?? '{}'
    const located = locateActivations(startKey, comboState)

    selectActivationState.current = !(located && located.value)
    lastSelectedKeyState.current = undefined
  }, [comboState, selectActivationState, lastSelectedKeyState])

  const handleSelect = useCallback((e: Parameters<React.ComponentProps<typeof Selecto>['onSelect'] & {}>[0]) => {
    let newState = {
      ...comboState,
    }

    e.added.forEach((el) => {
      updateActivation(elementToDataKey(el), selectActivationState.current, newState)
    })
    e.removed.forEach((el) => {
      updateActivation(elementToDataKey(el), selectActivationState.current, newState)
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const selectedKey: string = e.inputEvent.srcElement.getAttribute('data-key') ?? '{}'
    if (selectedKey != lastSelectedKeyState.current) {
      const partitionResult = updatePartitionActivation(selectedKey, newState)
      if (partitionResult) newState = partitionResult
      lastSelectedKeyState.current = selectedKey
    }

    onComboStateChange(newState)
  }, [comboState, onComboStateChange, selectActivationState, lastSelectedKeyState])

  return (
    <div style={drawerContentStyle}>
      <StateDisplay comboState={comboState} onComboStateChange={onComboStateChange} />
      <Selecto
        className='selecto-selection'
        selectableTargets={['.selectable']}
        selectByClick={true}
        selectFromInside={true}
        continueSelect={true}
        keyContainer={window}
        hitRate={0}
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onSelect={handleSelect}
      />
    </div>
  )
}
