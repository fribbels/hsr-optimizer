import { SettingOutlined } from '@ant-design/icons'
import { Flex, InputNumber, Popover, Typography } from 'antd'
import { Parts, Sets } from 'lib/constants/constants'
import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Relic } from 'types/relic'

export function RelicLocator(props: { selectedRelic?: Relic }) {
  const { selectedRelic } = props
  const { t } = useTranslation('relicsTab', { keyPrefix: 'Toolbar.RelicLocator' })
  const inventoryWidth = window.store((s) => s.inventoryWidth)
  const setInventoryWidth = window.store((s) => s.setInventoryWidth)

  const rowLimit = window.store((s) => s.rowLimit)
  const setRowLimit = window.store((s) => s.setRowLimit)

  const [relicPositionIndex, setRelicPositionIndex] = useState(0)
  const [locatorFilters, setLocatorFilters] = useState<{ set?: Sets; part?: Parts }>({ set: undefined, part: undefined })

  useEffect(() => {
    if (!selectedRelic) return
    const indexLimit = Math.max(1, rowLimit) * Math.max(1, inventoryWidth)
    // @ts-ignore
    const newerRelics = DB.getRelics().filter((x) => x.ageIndex <= selectedRelic.ageIndex)

    // Part-only filter
    const partFilteredIndex = newerRelics.filter((x) => selectedRelic.part == x.part).length - 1
    if (partFilteredIndex < indexLimit) {
      setRelicPositionIndex(partFilteredIndex)
      setLocatorFilters({ set: undefined, part: selectedRelic.part })
      return
    }

    const filteredIndex = newerRelics.filter((x) => selectedRelic.part == x.part && selectedRelic.set == x.set).length - 1
    setRelicPositionIndex(filteredIndex)
    setLocatorFilters({ set: selectedRelic.set, part: selectedRelic.part })
  }, [selectedRelic, inventoryWidth, rowLimit])

  return (
    <Popover
      trigger='click'
      onOpenChange={(open) => {
        if (!open) {
          SaveState.delayedSave()
        }
      }}
      content={(
        <Flex gap={8} style={{ width: 260 }}>
          <Flex vertical>
            <Flex justify='space-between' align='center'>
              <HeaderText>{t('Width')/* Inventory width */}</HeaderText>
            </Flex>
            <InputNumber
              value={window.store((s) => s.inventoryWidth)}
              style={{ width: 'auto' }}
              min={1}
              onChange={(e) => {
                if (!e) return
                setInventoryWidth(e)
              }}
            />
          </Flex>

          <Flex vertical>
            <Flex justify='space-between' align='center' gap={10}>
              <HeaderText>{t('Filter')/* Auto filter rows */}</HeaderText>
              <TooltipImage type={Hint.locatorParams()}/>
            </Flex>
            <InputNumber
              value={window.store((s) => s.rowLimit)}
              style={{ width: 'auto' }}
              min={1}
              onChange={(e) => {
                if (!e) return
                setRowLimit(e)
              }}
            />
          </Flex>
        </Flex>
      )}
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
        {
          selectedRelic && (
            <Flex align='center' justify='space-between' style={{ width: '100%' }}>
              <Flex gap={5} style={{ minWidth: 10 }} justify='flex-start'>
                {locatorFilters.part && <img src={Assets.getPart(locatorFilters.part)} style={{ height: 25 }}/>}
                {locatorFilters.set && <img src={Assets.getSetImage(locatorFilters.set, undefined, true)} style={{ height: 26 }}/>}
                {!locatorFilters.part && !locatorFilters.set && <div style={{ width: 10 }}></div>}
              </Flex>
              <Typography>
                {/* Location - Row {{rowIndex}} / Col {{columnIndex}} */}
                {!selectedRelic
                  ? ''
                  : t('Location', {
                    columnIndex: relicPositionIndex % inventoryWidth + 1,
                    rowIndex: Math.ceil((relicPositionIndex + 1) / inventoryWidth),
                  })}
              </Typography>
              <SettingOutlined/>
            </Flex>

          )
        }
        {
          !selectedRelic && (
            <Flex style={{ width: '100%', paddingBottom: 2 }} justify='space-between'>
              <div style={{ width: 10 }}></div>
              {/* Select a relic to locate */}
              <div>{t('NoneSelected')}</div>
              <SettingOutlined/>
            </Flex>
          )
        }
      </Flex>
    </Popover>
  )
}
