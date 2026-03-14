import { Drawer, Flex, Popover, Select, Switch, Text } from '@mantine/core'
import {
  Constants,
  Sets,
} from 'lib/constants/constants'
import {
  SetsOrnaments,
  SetsRelics,
  SetsRelicsNames,
  setToConditionalKey,
  setToId,
} from 'lib/sets/setConfigRegistry'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import {
  ConditionalSetMetadata,
  SelectOptionContent,
  SetMetadata,
} from 'lib/optimization/rotation/setConditionalContent'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const setConditionalsIconWidth = 40
const setConditionalsNameWidth = 200
const setConditionalsWidth = 80
const defaultGap = 5

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
    <Flex direction="column" gap={10}>
      <Flex direction="column">
        <HeaderText>
          <p>{t('DescriptionHeader') /* Set description */}</p>
        </HeaderText>
        <p>{ColorizeNumbers(description)}</p>
      </Flex>

      <Flex direction="column">
        <HeaderText>
          <p>{t('EffectHeader') /* Enabled effect */}</p>
        </HeaderText>
        <p>{conditional}</p>
      </Flex>
    </Flex>
  )

  const disabled = 'p4Checked' in rest ? !rest.p4Checked : !('p2Checked' in rest && rest.p2Checked)

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
        comboboxProps={{ keepMounted: false, styles: { dropdown: { width: 'fit-content' } } }}
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
    <Popover width={600} position='bottom' withArrow>
      <Popover.Target>
        <Flex gap={defaultGap} align='center' style={{ cursor: 'pointer' }}>
          <Flex style={{ width: setConditionalsIconWidth }}>
            <img
              src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)}
              style={{ width: 36, height: 36 }}
            />
          </Flex>
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
      <Popover.Dropdown>
        <Text fw={600} mb={4}>{t('SetName', { id: setToId[set] })}</Text>
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

  return (
    <Drawer
      title={t('Title')} // 'Conditional set effects'
      position='right'
      onClose={close}
      opened={isOpen}
      size={750}
    >
      {isOpen && <FormSetConditionalsContent />}
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
    <Flex justify='center'>
      <Flex direction="column" gap={defaultGap}>
        <Flex gap={defaultGap} align='center'>
          <div style={{ width: setConditionalsIconWidth }} />
          <div style={{ width: setConditionalsNameWidth }} />
        </Flex>
        {relicOptions}
      </Flex>
      <VerticalDivider />
      <Flex direction="column" gap={defaultGap} style={{ marginLeft: 5 }}>
        <Flex gap={defaultGap} align='center'>
          <div style={{ width: setConditionalsIconWidth }} />
          <div style={{ width: setConditionalsNameWidth }} />
        </Flex>
        {ornamentOptions}
      </Flex>
    </Flex>
  )
}
