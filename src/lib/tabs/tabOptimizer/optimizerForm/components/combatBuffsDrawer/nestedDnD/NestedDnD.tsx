import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'
import { dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { addTransitionType, startTransition, useEffect, useRef, useState, ViewTransition } from 'react'
import { OptimizerRequestState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { CombatBuff, CombatBuffGroup, CombatBuffType } from 'types/form'
import { Space, Stack } from '@mantine/core'
import { BuffGroup } from './BuffGroup'
import { Buff } from './Buff'
import { uuid } from 'lib/utils/miscUtils'
import { optimizerTabDefaultGap } from '../../../grid/optimizerGridColumns'
import { useShallow } from 'zustand/react/shallow'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'

function findBuff(id: string, buffs: Readonly<OptimizerRequestState['combatBuffs']>): { idx: number, parentIdx?: number } {
  for (let idx = 0; idx < buffs.length; idx++) {
    const buff = buffs[idx]
    if (buff.id === id) return { idx }
    if (buff.type === CombatBuffType.Group) {
      for (let i = 0; i < buff.buffs.length; i++) {
        if (buff.buffs[i].id === id) return { idx: i, parentIdx: idx }
      }
    }
  }
  return null as never
}

function moveBuff(source: string, position: 'before' | 'after' | 'into', target: string, buffs: Readonly<OptimizerRequestState['combatBuffs']>): OptimizerRequestState['combatBuffs'] {
  if (position === 'into') {
    const { idx: sourceIdx, parentIdx: sourceParentIdx } = findBuff(source, buffs)
    const ret = [...buffs]
    // the combine operation is only made available when dropping non-groups, so we know removed can not be a CombatBuffGroup
    let removed: CombatBuff
    if (sourceParentIdx !== undefined) {
      const group = ret[sourceParentIdx] as CombatBuffGroup
      removed = group.buffs[sourceIdx]
      ret[sourceParentIdx] = { ...group, buffs: group.buffs.toSpliced(sourceIdx, 1) }
    } else {
      [removed] = ret.splice(sourceIdx, 1) as CombatBuff[]
    }
    const { idx: targetIdx } = findBuff(target, ret)
    const targetBuff = ret[targetIdx]
    if (targetBuff.type === CombatBuffType.Group) {
      ret[targetIdx] = { ...targetBuff, buffs: [...targetBuff.buffs, removed] }
    } else {
      const group: CombatBuffGroup = {
        id: uuid(),
        type: CombatBuffType.Group,
        disabled: false,
        name: '',
        buffs: [targetBuff, removed]
      }
      ret[targetIdx] = group
    }
    return ret
  } else {
    const offset = position === 'after' ? 1 : 0
    const { idx: sourceIdx, parentIdx: sourceParentIdx } = findBuff(source, buffs)
    const ret = [...buffs]
    let removed: CombatBuff | CombatBuffGroup
    if (sourceParentIdx !== undefined) {
      const group = ret[sourceParentIdx] as CombatBuffGroup
      removed = group.buffs[sourceIdx]
      ret[sourceParentIdx] = { ...group, buffs: group.buffs.toSpliced(sourceIdx, 1) }
    } else {
      [removed] = ret.splice(sourceIdx, 1)
    }
    const { idx: targetIdx, parentIdx: targetParentIdx } = findBuff(target, ret)
    if (targetParentIdx !== undefined) {
      const group = { ...ret[targetParentIdx] as CombatBuffGroup }
      group.buffs = group.buffs.toSpliced(targetIdx + offset, 0, removed as CombatBuff)
      ret[targetParentIdx] = group
    } else {
      ret.splice(targetIdx + offset, 0, removed)
    }
    return ret
  }
}

export function NestedDnD({ }: NestedDnD.Props) {

  const [buffs, setBuffs] = useState<Array<CombatBuff | CombatBuffGroup>>(useOptimizerRequestStore.getState().combatBuffs)

  useEffect(() => {
    const cleanup = useOptimizerRequestStore.subscribe((state, prev) => {
      if (prev.combatBuffs !== state.combatBuffs) {
        // when a drag ends, we do useOptimizerRequestStore.setState({combatBuffs: buffs})
        // gate here serves to avoid unnecessarily updating the drawer store afterwards
        if (state.combatBuffs !== buffs) {
          setBuffs(state.combatBuffs)
        }
      }
    })
    return cleanup
  })

  const move = (source: string, position: 'before' | 'after' | 'into', target: string) => moveBuff(source, position, target, buffs)

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    return combine(
      monitorForElements({
        onDrop({ source, location }) {
          const target = location.current.dropTargets[0]
          if (target) {
            const sourceId = source.data.id as string
            const targetId = target.data.id as string
            if (sourceId !== targetId) {
              const instruction = extractInstruction(target.data)
              if (!instruction || instruction.blocked) return
              let buffs: Array<CombatBuff | CombatBuffGroup>
              switch (instruction.operation) {
                case 'reorder-before': {
                  buffs = move(sourceId, 'before', targetId)
                  break
                }
                case 'reorder-after': {
                  buffs = move(sourceId, 'after', targetId)
                  break
                }
                case 'combine': {
                  buffs = move(sourceId, 'into', targetId)
                  break
                }
              }
              startTransition(() => {
                if (buffs.find(b => b.id === sourceId)
                  && buffs.find((b) => b.id === targetId)) {
                  addTransitionType('group-reorder')
                }
                setBuffs(buffs)
                useOptimizerRequestStore.setState({ combatBuffs: buffs })
              })
            }
          }
        },
      }),
      dropTargetForElements({
        element
      })
    )
  })

  const {
    removeCombatBuff,
    renameCombatBuff,
    toggleCombatBuff,
  } = useOptimizerRequestStore(useShallow((s) => ({
    buffs: s.combatBuffs,
    renameCombatBuff: s.nameCombatBuff,
    removeCombatBuff: s.removeCombatBuff,
    toggleCombatBuff: s.toggleCombatBuff,
  })))

  return (
    <Stack gap={optimizerTabDefaultGap} ref={ref}>
      {buffs.map((buff) => {
        if (buff.type === CombatBuffType.Group) {
          return (
            <ViewTransition
              key={buff.id}
              name={`buff-${buff.id}`}
              // need to disable the view transition when draggin in/out of groups otherwise it spazzes out
              update={{ default: 'none', 'group-reorder': 'group-reorder' }}
            >
              <BuffGroup
                buff={buff}
                removeBuff={removeCombatBuff}
                renameBuff={renameCombatBuff}
                toggleSelection={toggleCombatBuff}
              />
            </ViewTransition>
          )
        } else {
          return (
            <ViewTransition key={buff.id} name={`buff-${buff.id}`}>
              <Buff
                buff={buff}
                removeBuff={removeCombatBuff}
                toggleSelection={toggleCombatBuff}
              />
            </ViewTransition>
          )
        }
      }
      )}
      <Space h='xl' />
    </Stack>
  )
}

export namespace NestedDnD {
  export interface Props {
  }
}
