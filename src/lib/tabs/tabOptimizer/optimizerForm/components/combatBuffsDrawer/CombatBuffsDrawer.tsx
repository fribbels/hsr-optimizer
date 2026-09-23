import { CollisionPriority } from '@dnd-kit/abstract'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { PointerActivationConstraints } from '@dnd-kit/dom'
import { move } from '@dnd-kit/helpers'
import {
  DragDropProvider,
  PointerSensor,
  useDroppable,
} from '@dnd-kit/react'
import {
  isSortable,
  isSortableOperation,
} from '@dnd-kit/react/sortable'
import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Stack,
} from '@mantine/core'
import {
  IconClipboard,
  IconFolderPlus,
  IconTrash,
} from '@tabler/icons-react'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { BuffBuilder } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffBuilder'
import { BuffGroupPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffGroupPanel'
import { BuffPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffPanel'
import { loadBuffFromClipboard } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'
import { uuid } from 'lib/utils/miscUtils'
import {
  memo,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  type CombatBuff,
  type CombatBuffGroup,
  CombatBuffType,
} from 'types/form'
import { useShallow } from 'zustand/react/shallow'

export function CombatBuffsDrawer() {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  return (
    <Drawer
      title={t('Title')} // 'Extra combat buffs'
      position='right'
      onClose={closeBuffsDrawer}
      opened={isOpenBuffsDrawer}
      size={400}
    >
      <CombatBuffsDrawerContent />
    </Drawer>
  )
}

const sensor = PointerSensor.configure({
  activationConstraints: [
    new PointerActivationConstraints.Distance({ value: 5 }),
  ],
})

const CombatBuffsDrawerContent = memo(function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })
  const { t: tBuffPanel } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)

  const { ref } = useDroppable({ id: 'root', collisionPriority: CollisionPriority.Lowest })

  const {
    clearCombatBuffs,
    addCombatBuff,
    removeCombatBuff,
    renameCombatBuff,
    toggleCombatBuff,
    combatBuffs,
    setCombatBuffs,
    updateCombatBuffs,
  } = useOptimizerRequestStore(useShallow((s) => ({
    clearCombatBuffs: s.clearCombatBuffs,
    addCombatBuff: s.addCombatBuff,
    renameCombatBuff: s.nameCombatBuff,
    removeCombatBuff: s.removeCombatBuff,
    toggleCombatBuff: s.toggleCombatBuff,
    combatBuffs: s.combatBuffs,
    setCombatBuffs: s.setCombatBuffs,
    updateCombatBuffs: s.updateCombatBuffs,
  })))

  const sourceParentRef = useRef<Element | null>(null)
  const snapshot = useRef(structuredClone(combatBuffs))

  return (
    <Stack gap={defaultGap}>
      <Group>
        <Button
          flex={1}
          onClick={clearCombatBuffs}
          variant='default'
          leftSection={<IconTrash />}
        >
          {t('Clear')}
        </Button>
        <ActionIcon
          onClick={() => {
            addCombatBuff({
              id: uuid(),
              type: CombatBuffType.Group,
              buffs: [],
              name: '',
              disabled: false,
            })
          }}
        >
          <IconFolderPlus />
        </ActionIcon>
        <ActionIcon onClick={loadBuffFromClipboard}>
          <IconClipboard />
        </ActionIcon>
      </Group>
      <Stack gap={defaultGap}>
        <BuffBuilder addBuff={addCombatBuff} />
        <DragDropProvider
          sensors={(d) => [...d, sensor]}
          modifiers={(d) => [...d, RestrictToVerticalAxis]}
          onDragStart={(event) => {
            snapshot.current = structuredClone(combatBuffs)
            sourceParentRef.current = event.operation.source?.element?.parentElement ?? null
          }}
          onDragEnd={(e) => {
            /**
             * NOTE: Workaround for issues with "OptimisticSortingPlugin" mutating
             * the raw DOM, and causing React errors on re-render. We reset the
             * source to its pre-drag parent before updating the state, and use
             * "flushSync" to hide the sneaky DOM change.
             */
            const sourceElement = e.operation.source?.element
            const prevParent = sourceParentRef.current
            sourceParentRef.current = null
            if (
              sourceElement
              && prevParent
              && sourceElement.parentElement !== prevParent
            ) {
              prevParent.appendChild(sourceElement)
            }
            if (e.canceled) {
              setCombatBuffs(snapshot.current)
              return
            }
            flushSync(() => {
              setHoveredGroup(null)
              const { source } = e.operation
              if (!isSortable(source)) return
              const { initialGroup, initialIndex, group, index } = source
              if (initialGroup === group && initialIndex === index) return
              if (initialGroup === group) {
                if (group === 'root') {
                  setCombatBuffs(move(combatBuffs, e))
                } else {
                  const buffGroup = combatBuffs.find((b): b is CombatBuffGroup => {
                    return b.id === group && b.type === CombatBuffType.Group
                  })
                  if (!buffGroup) return
                  const newOrder = move(buffGroup.buffs, e)
                  const newGroup = { ...buffGroup, buffs: newOrder }
                  updateCombatBuffs(newGroup)
                }
              } else {
                const fromGroup = combatBuffs.find((b): b is CombatBuffGroup => {
                  return b.id === initialGroup && b.type === CombatBuffType.Group
                })
                const toGroup = combatBuffs.find((b): b is CombatBuffGroup => {
                  return b.id === group && b.type === CombatBuffType.Group
                })
                if (fromGroup && toGroup) {
                  const fromBuffs = [...fromGroup.buffs]
                  const toBuffs = [...toGroup.buffs]

                  const [removed] = fromBuffs.splice(initialIndex, 1)
                  toBuffs.splice(index, 0, removed)

                  const newFrom = { ...fromGroup, buffs: fromBuffs }
                  const newTo = { ...toGroup, buffs: toBuffs }

                  updateCombatBuffs(newFrom, newTo)
                } else if (fromGroup && (group === 'root')) {
                  const fromBuffs = [...fromGroup.buffs]
                  const toBuffs = [...combatBuffs]

                  const [removed] = fromBuffs.splice(initialIndex, 1)
                  toBuffs.splice(index, 0, removed)

                  const newFrom = { ...fromGroup, buffs: fromBuffs }
                  setCombatBuffs(toBuffs.map((b) => b.id === newFrom.id ? newFrom : b))
                } else if (toGroup && (initialGroup === 'root')) {
                  const fromBuffs = [...combatBuffs]
                  const toBuffs = [...toGroup.buffs]

                  const [removed] = fromBuffs.splice(initialIndex, 1)
                  toBuffs.splice(index, 0, removed as CombatBuff)

                  const newTo = { ...toGroup, buffs: toBuffs }
                  setCombatBuffs(fromBuffs.map((b) => b.id === newTo.id ? newTo : b))
                }
              }
            })
          }}
        >
          <Stack gap={defaultGap} ref={ref}>
            {combatBuffs
              .map((buff, idx) => {
                switch (buff.type) {
                  case CombatBuffType.Group:
                    return (
                      <BuffGroupPanel
                        key={buff.id}
                        group={buff}
                        removeBuff={removeCombatBuff}
                        renameBuff={renameCombatBuff}
                        t={tBuffPanel}
                        checked={!buff.disabled}
                        toggleSelection={toggleCombatBuff}
                        index={idx}
                        hovered={buff.id === hoveredGroup}
                      />
                    )
                  case CombatBuffType.StatBuff:
                  case CombatBuffType.ActionModifier:
                    return (
                      <BuffPanel
                        key={buff.id}
                        buff={buff}
                        removeBuff={removeCombatBuff}
                        renameBuff={renameCombatBuff}
                        t={tBuffPanel}
                        checked={!buff.disabled}
                        toggleSelection={toggleCombatBuff}
                        index={idx}
                        group='root'
                      />
                    )
                }
              })}
          </Stack>
        </DragDropProvider>
      </Stack>
    </Stack>
  )
})
