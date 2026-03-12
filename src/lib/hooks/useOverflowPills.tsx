import { Pill } from '@mantine/core'
import { ComboboxRenderPillInput } from '@mantine/core'
import { useMemo } from 'react'

const overflowPillsListStyle = { flexWrap: 'nowrap' as const, overflow: 'hidden' as const }

export function useOverflowPills(values: string[], maxVisible: number) {
  const renderPill = useMemo(() => {
    if (values.length <= maxVisible) return undefined

    const visibleSet = new Set(values.slice(0, maxVisible))
    const overflowValue = values[maxVisible]
    const overflowCount = values.length - maxVisible

    return (props: ComboboxRenderPillInput<string>) => {
      if (visibleSet.has(props.value!)) {
        return (
          <Pill withRemoveButton onRemove={props.onRemove} disabled={props.disabled}>
            {props.option.label}
          </Pill>
        )
      }

      if (props.value === overflowValue) {
        return <Pill>+{overflowCount}</Pill>
      }

      return null
    }
  }, [values, maxVisible])

  return {
    renderPill,
    pillsListStyle: renderPill ? overflowPillsListStyle : undefined,
  }
}
