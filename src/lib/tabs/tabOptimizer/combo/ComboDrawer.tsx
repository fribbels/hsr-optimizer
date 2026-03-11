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
  ComboState,
  initializeComboState,
  locateActivations,
  updateActivation,
  updateFormState,
  updatePartitionActivation,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { getForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import Selecto from 'react-selecto'

export { ContentRows } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
export { elementToDataKey } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'

const drawerContentStyle = { width: 1560, height: '100%' } as const

export function ComboDrawer() {
  const { close: closeComboDrawer, isOpen: isOpenComboDrawer } = useOpenClose(OpenCloseIDs.COMBO_DRAWER)

  const [comboState, setComboState] = useState<ComboState>({} as ComboState)
  const comboStateRef = useRef<ComboState>({} as ComboState)
  comboStateRef.current = comboState

  const selectActivationState = useRef(true)
  const lastSelectedKeyState = useRef<string | undefined>(undefined)

  useScrollLock(isOpenComboDrawer)

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
      className='comboDrawer'
    >
      <div style={drawerContentStyle}>
        <StateDisplay comboState={comboState} onComboStateChange={setComboState} />
        <Selecto
          className='selecto-selection'
          // The container to add a selection element
          // container={'.comboDrawer'}
          // The area to drag selection element (default: container)
          // dragContainer={window}
          // Targets to select. You can register a queryselector or an Element.
          selectableTargets={['.selectable']}
          // Whether to select by click (default: true)
          selectByClick={true}
          // Whether to select from the target inside (default: true)
          selectFromInside={true}
          // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
          continueSelect={true}
          // Determines which key to continue selecting the next target via keydown and keyup.
          // toggleContinueSelect='shift'
          // The container for keydown and keyup events
          keyContainer={window}
          // The rate at which the target overlaps the drag area to be selected. (default: 100)
          hitRate={0}
          onDrag={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const selectedKey: string = e.inputEvent.target.getAttribute('data-key') ?? '{}'
            if (selectedKey != lastSelectedKeyState.current) {
              const partitionResult = updatePartitionActivation(selectedKey, comboState)
              if (partitionResult) setComboState(partitionResult)
              lastSelectedKeyState.current = selectedKey
            }
          }}
          onDragStart={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const startKey: string = e.inputEvent.target.getAttribute('data-key') ?? '{}'
            const located = locateActivations(startKey, comboState)

            selectActivationState.current = !(located && located.value)
            lastSelectedKeyState.current = undefined
          }}
          onSelect={(e) => {
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

            setComboState(newState)
          }}
        />
      </div>
    </Drawer>
  )
}
