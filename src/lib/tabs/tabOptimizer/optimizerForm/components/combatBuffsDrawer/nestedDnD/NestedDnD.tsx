import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useCombatBuffStore } from '../useCombatBuffsStore'

export function NestedDnD({}: NestedDnD.Props) {
  const { buffs, setBuffs } = useCombatBuffStore(useShallow((s) => ({
    buffs: s.buffs,
    setBuffs: s.setBuffs,
  })))

  useEffect(() => {
    return monitorForElements({
      onDrag({ source, location }) {
        const target = location.current.dropTargets[0]
        if (!target) return

        const sourceId = source.data.id as string
        const targetId = target.data.id as string

        if (sourceId === targetId) return

        const instruction = extractInstruction(target.data)
        if (!instruction || instruction.blocked) return
      },
      onDrop({ source, location }) {
        useOptimizerRequestStore.setState({ combatBuffs: buffs })
      },
    })
  })
}

export namespace NestedDnD {
  export interface Props {
  }
}
