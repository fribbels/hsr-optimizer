import { Button, Stack } from '@mantine/core'
import { IconBolt, IconPlus } from '@tabler/icons-react'
import type { RightPanelContext, UltTiming } from 'lib/tabs/tabAvVisualizer/types'
import { useTranslation } from 'react-i18next'

type AddBranchPanelProps = {
  context: Extract<RightPanelContext, { kind: 'add-branch' }>
  onContextChange: (ctx: RightPanelContext) => void
}

export function AddBranchPanel({ context, onContextChange }: AddBranchPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')

  function handleAddIntervention() {
    onContextChange({
      kind: 'intervention',
      request: {
        mode: 'add',
        afterCharId: context.afterCharId,
        afterActionIndex: context.afterActionIndex,
        beforeCharId: context.beforeCharId,
        beforeActionIndex: context.beforeActionIndex,
        afterItemId: context.afterItemId,
      },
    })
  }

  function handleAddUlt() {
    const { afterCharId, afterActionIndex, beforeCharId, beforeActionIndex, triggerAv, ultTimingReference, afterUltId } = context
    let timing: UltTiming
    if (ultTimingReference) {
      timing = ultTimingReference
    } else if (afterCharId !== undefined) {
      timing = { type: 'after_action', charId: afterCharId, actionIndex: afterActionIndex ?? 0 }
    } else if (beforeCharId !== undefined) {
      timing = { type: 'during_action', charId: beforeCharId, actionIndex: beforeActionIndex ?? 0 }
    } else {
      timing = { type: 'at_av', av: triggerAv }
    }
    onContextChange({
      kind: 'ult-caster', timing,
      insertAfterId: afterUltId, insertBeforeUltId: context.insertBeforeUltId,
      afterItemId: context.afterItemId,
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 16 }}>
      <Stack gap='sm'>
        <Button
          variant='default'
          leftSection={<IconPlus size={14} />}
          onClick={handleAddIntervention}
        >
          {tAv('AddBranch.AddIntervention')}
        </Button>

        <Button
          variant='default'
          leftSection={<IconBolt size={14} />}
          onClick={handleAddUlt}
        >
          {tAv('AddBranch.AddUlt')}
        </Button>
      </Stack>
    </div>
  )
}
