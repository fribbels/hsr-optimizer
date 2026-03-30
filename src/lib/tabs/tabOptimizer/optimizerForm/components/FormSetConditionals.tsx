import { Drawer, Flex, Popover, Select, Switch, Text } from '@mantine/core'
import {
  Constants,
  type Sets,
} from 'lib/constants/constants'
import {
  type SetsOrnaments,
  type SetsRelics,
  SetsRelicsNames,
  setToConditionalKey,
  setToId,
} from 'lib/sets/setConfigRegistry'
import {
  type OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import {
  ConditionalSetMetadata,
  type SetMetadata,
} from 'lib/optimization/rotation/setConditionalContent'
import type { SelectOptionContent } from 'types/setConfig'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const setConditionalsIconWidth = 32
const setConditionalsNameWidth = 255
const setConditionalsWidth = 100
const defaultGap = 5
const columnGap = 6

interface BaseConditionalSetOptionProps {
  description: string
  conditional: string
  selectOptions?: Array<SelectOptionContent>
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

function ConditionalSetOption({ set, description, conditional, selectOptions, ...rest }: ConditionalSetOptionsProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })

  const itemName = ['setConditionals', set, 1] as (string | number)[]
  const value = useOptimizerRequestStore((s) => {
    const setData = (s.setConditionals as Record<string, [undefined, boolean | number]>)[set]
    return setData?.[1]
  })

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
        onChange={(val) => handleConditionalChange(itemName, val != null ? Number(val) : val)}
      />
    )
  } else {
    inputType = (
      <Switch
        disabled={disabled}
        checked={value as boolean}
        onChange={(event) => handleConditionalChange(itemName, event.currentTarget.checked)}
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

function isRelicSet(set: Sets): set is SetsRelics {
  return (SetsRelicsNames as Array<Sets>).includes(set)
}

export function FormSetConditionals({ id }: { id: OpenCloseIDs }) {
  const { close, isOpen } = useOpenClose(id)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const [hasOpened, setHasOpened] = useState(false)
  if (isOpen && !hasOpened) setHasOpened(true)

  return (
    <Drawer
      title={t('Title')} // 'Conditional set effects'
      position='right'
      onClose={close}
      opened={isOpen}
      size={900}
      keepMounted
    >
      {hasOpened && <FormSetConditionalsContent />}
    </Drawer>
  )
}

function FormSetConditionalsContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const { t: tSelectOptions } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals.SelectOptions' })

  const { relicOptions, ornamentOptions } = useMemo(() => {
    const entries = Object.entries(ConditionalSetMetadata) as Array<[Sets, SetMetadata]>

    const relicOptions = entries
      .filter(([set]) => isRelicSet(set))
      .map(([set, meta]) => (
        <ConditionalSetOption
          key={set}
          set={set as SetsRelics}
          p4Checked={!meta.modifiable}
          description={t('RelicDescription', { id: setToId[set] })}
          conditional={t(setToConditionalKey(set))}
          selectOptions={meta.selectionOptions?.(tSelectOptions)}
        />
      ))

    const ornamentOptions = entries
      .filter(([set]) => !isRelicSet(set))
      .map(([set, meta]) => (
        <ConditionalSetOption
          key={set}
          set={set as SetsOrnaments}
          p2Checked={!meta.modifiable}
          description={t('PlanarDescription', { id: setToId[set] })}
          conditional={t(setToConditionalKey(set))}
          selectOptions={meta.selectionOptions?.(tSelectOptions)}
        />
      ))

    return { relicOptions, ornamentOptions }
  }, [tSelectOptions, t])

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
