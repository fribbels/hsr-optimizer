import { Drawer, Flex, Popover, Select, Switch, Text } from '@mantine/core'
import { Constants } from 'lib/constants/constants'
import {
  ornamentIndexToSetConfig,
  relicIndexToSetConfig,
  type SetsOrnaments,
  type SetsRelics,
  setToConditionalKey,
  setToId,
} from 'lib/sets/setConfigRegistry'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import type { SelectOptionContent } from 'types/setConfig'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SetConditionals } from 'lib/optimization/combo/comboTypes'

/**
 * Enum for identifying which store to use for set conditionals.
 */
export enum SetConditionalsStoreType {
  Optimizer = 'optimizer',
  Benchmark = 'benchmark',
}

const setConditionalsIconWidth = 32
const setConditionalsNameWidth = 255
const setConditionalsWidth = 100
const defaultGap = 5
const columnGap = 6

function getSetConditionalValue(
  setConditionals: SetConditionals,
  set: string,
  storeType: SetConditionalsStoreType,
  forStore: SetConditionalsStoreType,
): boolean | number | undefined {
  if (storeType !== forStore) return undefined
  return (setConditionals as Record<string, [unknown, boolean | number]>)[set]?.[1]
}

interface BaseConditionalSetOptionProps {
  description: string
  conditional: string
  selectOptions?: Array<SelectOptionContent>
  storeType: SetConditionalsStoreType
}
interface RelicConditionalSetOptionProps extends BaseConditionalSetOptionProps {
  set: SetsRelics
  p4Checked?: boolean
}
interface OrnamentConditionalSetOptionProps extends BaseConditionalSetOptionProps {
  set: SetsOrnaments
  p2Checked?: boolean
}
type ConditionalSetOptionsProps = OrnamentConditionalSetOptionProps | RelicConditionalSetOptionProps

function ConditionalSetOption({ set, description, conditional, selectOptions, storeType, ...rest }: ConditionalSetOptionsProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })

  const fromOptimizer = useOptimizerRequestStore((s) =>
    getSetConditionalValue(s.setConditionals, set, storeType, SetConditionalsStoreType.Optimizer)
  )
  const fromBenchmark = useBenchmarksTabStore((s) =>
    getSetConditionalValue(s.setConditionals, set, storeType, SetConditionalsStoreType.Benchmark)
  )

  const value = storeType === SetConditionalsStoreType.Optimizer ? fromOptimizer : fromBenchmark

  const handleChange = (newValue: boolean | number | null) => {
    if (newValue == null) return

    if (storeType === SetConditionalsStoreType.Optimizer) {
      handleConditionalChange(['setConditionals', set, 1], newValue) // Also patches comboStateJson
    } else {
      useBenchmarksTabStore.getState().setSetConditional(set, newValue)
    }
  }

  const content = (
    <Flex direction="column" gap={12}>
      <Flex direction="column" gap={4}>
        <HeaderText>{t('DescriptionHeader') /* Set description */}</HeaderText>
        <Text size="xs">{ColorizeNumbers(description)}</Text>
      </Flex>

      <Flex direction="column" gap={4}>
        <HeaderText>{t('EffectHeader') /* Enabled effect */}</HeaderText>
        <Text size="xs">{conditional}</Text>
      </Flex>
    </Flex>
  )

  const disabled = 'p4Checked' in rest ? rest.p4Checked : 'p2Checked' in rest && rest.p2Checked

  let inputType
  if (selectOptions) {
    const stringSelectOptions = selectOptions.map((opt) => ({
      label: opt.display || opt.label,
      value: String(opt.value),
    }))
    inputType = (
      <Select
        maxDropdownHeight={500}
        style={{ width: setConditionalsWidth }}
        comboboxProps={{ keepMounted: false, width: 160 }}
        data={stringSelectOptions}
        value={value != null ? String(value) : null}
        onChange={(val) => handleChange(val != null ? Number(val) : null)}
      />
    )
  } else {
    inputType = (
      <Switch
        disabled={disabled}
        checked={value as boolean}
        onChange={(event) => handleChange(event.currentTarget.checked)}
      />
    )
  }

  return (
    <Popover width={400} position='left' withArrow>
      <Popover.Target>
        <Flex gap={defaultGap} align='center' style={{ cursor: 'pointer' }}>
          <div style={{ width: setConditionalsIconWidth, marginRight: 5 }}>
            <img
              src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)}
              style={{ width: setConditionalsIconWidth, height: setConditionalsIconWidth, display: 'block' }}
            />
          </div>
          <div
            style={{
              width: setConditionalsNameWidth,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {t('SetName', { id: setToId[set] })}
          </div>
          <Flex style={{ width: setConditionalsWidth }} justify='flex-end'>
            {inputType}
          </Flex>
        </Flex>
      </Popover.Target>
      <Popover.Dropdown style={{ fontSize: 13 }}>
        <Text fw={600} mb={4} size="sm">{t('SetName', { id: setToId[set] })}</Text>
        {content}
      </Popover.Dropdown>
    </Popover>
  )
}

export function FormSetConditionals({ id }: { id: OpenCloseIDs }) {
  const { close, isOpen } = useOpenClose(id)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const [hasOpened, setHasOpened] = useState(false)
  if (isOpen && !hasOpened) setHasOpened(true)

  const storeType = id === OpenCloseIDs.BENCHMARKS_SETS_DRAWER
    ? SetConditionalsStoreType.Benchmark
    : SetConditionalsStoreType.Optimizer

  return (
    <Drawer
      title={t('Title')} // 'Conditional set effects'
      position='right'
      onClose={close}
      opened={isOpen}
      size={900}
      keepMounted
    >
      {hasOpened && <FormSetConditionalsContent storeType={storeType} />}
    </Drawer>
  )
}

function FormSetConditionalsContent({ storeType }: { storeType: SetConditionalsStoreType }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const { t: tSelectOptions } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals.SelectOptions' })

  const { relicOptions, ornamentOptions } = useMemo(() => {
    const relicOptions = relicIndexToSetConfig.map((config) => {
      const set = config.id as SetsRelics
      return (
        <ConditionalSetOption
          key={set}
          set={set}
          storeType={storeType}
          p4Checked={!config.display.modifiable}
          description={t('RelicDescription', { id: setToId[set] })}
          conditional={t(setToConditionalKey(set))}
          selectOptions={config.display.selectionOptions?.(tSelectOptions)}
        />
      )
    })

    const ornamentOptions = ornamentIndexToSetConfig.map((config) => {
      const set = config.id as SetsOrnaments
      return (
        <ConditionalSetOption
          key={set}
          set={set}
          storeType={storeType}
          p2Checked={!config.display.modifiable}
          description={t('PlanarDescription', { id: setToId[set] })}
          conditional={t(setToConditionalKey(set))}
          selectOptions={config.display.selectionOptions?.(tSelectOptions)}
        />
      )
    })

    return { relicOptions, ornamentOptions }
  }, [tSelectOptions, t, storeType])

  return (
    <Flex justify='space-around'>
      <Flex direction="column" gap={columnGap}>
        <Flex gap={defaultGap} align='center'>
          <div style={{ width: setConditionalsIconWidth }} />
          <div style={{ width: setConditionalsNameWidth }} />
        </Flex>
        {relicOptions}
      </Flex>
      <VerticalDivider />
      <Flex direction="column" gap={columnGap}>
        <Flex gap={defaultGap} align='center'>
          <div style={{ width: setConditionalsIconWidth }} />
          <div style={{ width: setConditionalsNameWidth }} />
        </Flex>
        {ornamentOptions}
      </Flex>
    </Flex>
  )
}
