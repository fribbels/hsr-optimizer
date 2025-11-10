import { SettingOutlined } from '@ant-design/icons'
import {
  Flex,
  InputNumber,
  Popover,
  Typography,
} from 'antd'
import {
  Parts,
  Sets,
} from 'lib/constants/constants'
import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import {
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Nullable } from 'types/common'
import { Relic } from 'types/relic'
import { create } from 'zustand'

type LocatorFilters = { set: Sets | null, part: Parts | null }

type RelicLocatorStateActions = {
  setInventoryWidth: (width: Nullable<number>) => void,
  setRowLimit: (limit: Nullable<number>) => void,
}

const defaultStateValues = { inventoryWidth: 9, rowLimit: 10 }

type RelicLocatorStateValues = typeof defaultStateValues

type RelicLocatorState = RelicLocatorStateValues & RelicLocatorStateActions

// use a store to allow access when loading/creating a savefile
export const useRelicLocatorStore = create<RelicLocatorState>()((set) => ({
  ...defaultStateValues,

  setInventoryWidth: (width) => set({ inventoryWidth: width ?? defaultStateValues.inventoryWidth }),
  setRowLimit: (limit) => set({ rowLimit: limit ?? defaultStateValues.rowLimit }),
}))

export function RelicLocator(props: { relic: Relic | null }) {
  const { relic } = props

  const { setInventoryWidth, setRowLimit, inventoryWidth, rowLimit } = useRelicLocatorStore()

  const { t } = useTranslation('relicsTab', { keyPrefix: 'Toolbar.RelicLocator' })

  const [relicPositionIndex, setRelicPositionIndex] = useState(0)
  const [locatorFilters, setLocatorFilters] = useState<LocatorFilters>({ set: null, part: relic?.part ?? null })

  useEffect(() => {
    if (!relic) return
    const indexLimit = Math.max(1, rowLimit) * Math.max(1, inventoryWidth)
    const newerRelics = DB.getRelics().filter((x) => x.ageIndex! > relic.ageIndex!)

    // Part-only filter
    const partFilteredIndex = newerRelics.filter((x) => relic.part == x.part).length
    if (partFilteredIndex < indexLimit) {
      setRelicPositionIndex(partFilteredIndex)
      setLocatorFilters({ set: null, part: relic.part })
      return
    }

    const filteredIndex = newerRelics.filter((x) => relic.part == x.part && relic.set == x.set).length
    setRelicPositionIndex(filteredIndex)
    setLocatorFilters({ set: relic.set, part: relic.part })
  }, [relic, inventoryWidth, rowLimit])

  return (
    <Popover
      trigger='click'
      onOpenChange={(open) => {
        if (!open) {
          SaveState.delayedSave()
        }
      }}
      content={
        <Flex gap={8} style={{ minWidth: 260 }}>
          <Flex vertical>
            <Flex justify='space-between' align='center'>
              <HeaderText>{t('Width') /* Inventory width */}</HeaderText>
            </Flex>
            <InputNumber
              defaultValue={inventoryWidth}
              style={{ width: 'auto' }}
              min={1}
              onChange={setInventoryWidth}
            />
          </Flex>

          <Flex vertical>
            <Flex justify='space-between' align='center' gap={10}>
              <HeaderText>{t('Filter') /* Auto filter rows */}</HeaderText>
              <TooltipImage type={Hint.locatorParams()} />
            </Flex>
            <InputNumber
              defaultValue={rowLimit}
              style={{ width: 'auto' }}
              min={1}
              onChange={setRowLimit}
            />
          </Flex>
        </Flex>
      }
    >
      <Flex
        justify='space-between'
        align='center'
        style={{
          cursor: 'pointer',
          paddingLeft: 8,
          paddingRight: 10,
          width: 285,
          marginTop: 1,
          borderRadius: 5,
          height: 30,
          background: 'rgba(36, 51, 86)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
          outline: '1px solid rgba(63, 90, 150)',
        }}
      >
        {relic
          ? (
            <Flex align='center' justify='space-between' style={{ width: '100%' }}>
              <LocatorFilterImage filters={locatorFilters} />
              <Typography>
                {/* Location - Row {{rowIndex}} / Col {{columnIndex}} */}
                {t('Location', {
                  columnIndex: relicPositionIndex % inventoryWidth + 1,
                  rowIndex: Math.ceil((relicPositionIndex + 1) / inventoryWidth),
                })}
              </Typography>
              <SettingOutlined />
            </Flex>
          )
          : (
            <Flex style={{ width: '100%', paddingBottom: 2 }} justify='space-between'>
              <div style={{ width: 10 }}></div>
              {/* Select a relic to locate */}
              <div>{t('NoneSelected')}</div>
              <SettingOutlined />
            </Flex>
          )}
      </Flex>
    </Popover>
  )
}

function LocatorFilterImage(props: { filters: LocatorFilters }) {
  const { part, set } = props.filters
  return (
    <Flex gap={5} style={{ minWidth: 10 }} justify='flex-start'>
      <img src={Assets.getPart(part!)} style={{ height: 25 }} />
      {set && <img src={Assets.getSetImage(set, undefined, true)} style={{ height: 26 }} />}
    </Flex>
  )
}
