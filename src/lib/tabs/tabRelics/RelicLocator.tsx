import {
  NumberInput,
  Popover,
} from '@mantine/core'
import { IconSettings } from '@tabler/icons-react'
import {
  type Parts,
  type Sets,
} from 'lib/constants/constants'
import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import { SaveState } from 'lib/state/saveState'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { getRelics } from 'lib/stores/relic/relicStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import {
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Nullable } from 'types/common'
import type { Relic } from 'types/relic'
import { useShallow } from 'zustand/react/shallow'

type LocatorFilters = { set: Sets | null, part: Parts | null }

type RelicLocatorStateActions = {
  setInventoryWidth: (width: Nullable<number>) => void,
  setRowLimit: (limit: Nullable<number>) => void,
}

const defaultStateValues = { inventoryWidth: 9, rowLimit: 10 }

type RelicLocatorStateValues = typeof defaultStateValues

type RelicLocatorState = RelicLocatorStateValues & RelicLocatorStateActions

// use a store to allow access when loading/creating a savefile
export const useRelicLocatorStore = createTabAwareStore<RelicLocatorState>((set) => ({
  ...defaultStateValues,

  setInventoryWidth: (width) => set({ inventoryWidth: width ?? defaultStateValues.inventoryWidth }),
  setRowLimit: (limit) => set({ rowLimit: limit ?? defaultStateValues.rowLimit }),
}))

export function RelicLocator(props: { relic: Relic | null, compact?: boolean, style?: React.CSSProperties }) {
  const { relic, compact = false, style: styleProp } = props

  const { setInventoryWidth, setRowLimit, inventoryWidth, rowLimit } = useRelicLocatorStore(
    useShallow((s) => ({
      setInventoryWidth: s.setInventoryWidth,
      setRowLimit: s.setRowLimit,
      inventoryWidth: s.inventoryWidth,
      rowLimit: s.rowLimit,
    })),
  )

  const { t } = useTranslation('relicsTab', { keyPrefix: 'Toolbar.RelicLocator' })

  const [relicPositionIndex, setRelicPositionIndex] = useState(0)
  const [locatorFilters, setLocatorFilters] = useState<LocatorFilters>({ set: null, part: relic?.part ?? null })

  useEffect(() => {
    if (!relic) return
    const indexLimit = Math.max(1, rowLimit) * Math.max(1, inventoryWidth)
    const newerRelics = getRelics().filter((x) => x.ageIndex! > relic.ageIndex!)

    // Part-only filter
    const partFilteredIndex = newerRelics.filter((x) => relic.part === x.part).length
    if (partFilteredIndex < indexLimit) {
      setRelicPositionIndex(partFilteredIndex)
      setLocatorFilters({ set: null, part: relic.part })
      return
    }

    const filteredIndex = newerRelics.filter((x) => relic.part === x.part && relic.set === x.set).length
    setRelicPositionIndex(filteredIndex)
    setLocatorFilters({ set: relic.set, part: relic.part })
  }, [relic, inventoryWidth, rowLimit])

  return (
    <Popover
      onChange={(open) => {
        if (!open) {
          SaveState.delayedSave()
        }
      }}
    >
      <Popover.Target>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            paddingLeft: compact ? 6 : 8,
            paddingRight: compact ? 6 : 10,
            width: compact ? 140 : 285,
            marginTop: compact ? 0 : 1,
            borderRadius: 6,
            height: compact ? 26 : 30,
            background: 'var(--mantine-color-default)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
            outline: '1px solid var(--border-default)',
            ...styleProp,
          }}
        >
          {relic
            ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <LocatorFilterImage filters={locatorFilters} compact={compact} />
                <div style={compact ? { fontSize: 13 } : undefined}>
                  {t('Location', {
                    rowIndex: Math.ceil((relicPositionIndex + 1) / inventoryWidth),
                    columnIndex: relicPositionIndex % inventoryWidth + 1,
                  })}
                </div>
                <IconSettings size={compact ? 20 : 24} />
              </div>
            )
            : (
              <div style={{ display: 'flex', width: '100%', paddingBottom: compact ? 0 : 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: compact ? 4 : 10 }}></div>
                <div style={compact ? { fontSize: 13 } : undefined}>{t('NoneSelected')}</div>
                <div style={{ width: compact ? 14 : 24 }} />
              </div>
            )}
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{ display: 'flex', gap: 8, minWidth: 260 }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <HeaderText>{t('Width') /* Inventory width */}</HeaderText>
              <TooltipImage type={Hint.locatorParams()} />
            </div>
            <NumberInput
              defaultValue={inventoryWidth}
              style={{ width: 'auto' }}
              min={1}
              onChange={(val) => setInventoryWidth(typeof val === 'number' ? val : null)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <HeaderText>{t('Filter') /* Auto filter rows */}</HeaderText>
              <TooltipImage type={Hint.relicLocation()} />
            </div>
            <NumberInput
              defaultValue={rowLimit}
              style={{ width: 'auto' }}
              min={1}
              onChange={(val) => setRowLimit(typeof val === 'number' ? val : null)}
            />
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  )
}

function LocatorFilterImage(props: { filters: LocatorFilters, compact?: boolean }) {
  const { part, set } = props.filters
  const compact = props.compact ?? false
  return (
    <div style={{ display: 'flex', gap: compact ? 3 : 5, minWidth: 10 }}>
      <img src={Assets.getPart(part!)} style={{ height: compact ? 22 : 25 }} />
      {set && <img src={Assets.getSetImage(set, undefined, true)} style={{ height: compact ? 24 : 26 }} />}
    </div>
  )
}
