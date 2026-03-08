import { Flex, Switch, Text } from '@mantine/core'
import {
  Drawer,
  Popover,
  Select,
} from 'antd'
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
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { handleConditionalChange } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import ColorizeNumbers from 'lib/ui/ColorizeNumbers'
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

function ConditionalSetOption(props: ConditionalSetOptionsProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })

  const itemName = ['setConditionals', props.set, 1] as (string | number)[]
  const value = useOptimizerFormStore((s) => {
    const setData = (s.setConditionals as Record<string, [undefined, boolean | number]>)[props.set]
    return setData?.[1]
  })

  const content = (
    <Flex direction="column" gap={10}>
      <Flex direction="column">
        <HeaderText>
          <p>{t('DescriptionHeader') /* Set description */}</p>
        </HeaderText>
        <p>{ColorizeNumbers(props.description)}</p>
      </Flex>

      <Flex direction="column">
        <HeaderText>
          <p>{t('EffectHeader') /* Enabled effect */}</p>
        </HeaderText>
        <p>{props.conditional}</p>
      </Flex>
    </Flex>
  )

  const isDisabled = isRelicProps(props) ? !props.p4Checked === false : !props.p2Checked === false
  const disabled = isRelicProps(props) ? !props.p4Checked : !props.p2Checked

  let inputType
  if (props.selectOptions) {
    inputType = (
      <Select
        optionLabelProp='display'
        listHeight={500}
        size='small'
        style={{ width: setConditionalsWidth }}
        dropdownStyle={{ width: 'fit-content' }}
        options={props.selectOptions}
        value={value as number}
        onChange={(val) => handleConditionalChange(itemName, val)}
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
    <Popover
      content={content}
      title={t('SetName', { id: setToId[props.set] })}
      mouseEnterDelay={0.5}
      overlayStyle={{
        width: 600,
      }}
    >
      <Flex gap={defaultGap} align='center' justify='flex-start'>
        <Flex style={{ width: setConditionalsIconWidth }}>
          <img
            src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)}
            style={{ width: 36, height: 36 }}
          />
        </Flex>
        <Text
          style={{
            width: setConditionalsNameWidth,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {t('SetName', { id: setToId[props.set] })}
        </Text>
        <Flex style={{ width: setConditionalsWidth }} justify='flex-end'>
          {inputType}
        </Flex>
      </Flex>
    </Popover>
  )
}

function isRelicProps(props: ConditionalSetOptionsProps): props is RelicConditionalSetOptionProps {
  return isRelicSet(props.set)
}

function isRelicSet(set: Sets): set is SetsRelics {
  return (SetsRelicsNames as Array<Sets>).includes(set)
}

export function FormSetConditionals({ id }: { id: OpenCloseIDs }) {
  const { close, isOpen } = useOpenClose(id)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const { t: tSelectOptions } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals.SelectOptions' })

  const { relicOptions, ornamentOptions } = useMemo(() => {
    const relicOptions: Array<JSX.Element> = []
    const ornamentOptions: Array<JSX.Element> = []
    ;(Object.entries(ConditionalSetMetadata) as Array<[Sets, SetMetadata]>).forEach(([set, meta]) => {
      if (isRelicSet(set)) {
        relicOptions.push(
          <ConditionalSetOption
            key={set}
            set={set}
            p4Checked={!meta.modifiable}
            description={t('RelicDescription', { id: setToId[set] })}
            conditional={t(setToConditionalKey(set))}
            selectOptions={meta.selectionOptions?.(tSelectOptions)}
          />,
        )
      } else {
        ornamentOptions.push(
          <ConditionalSetOption
            key={set}
            set={set}
            p2Checked={!meta.modifiable}
            description={t('PlanarDescription', { id: setToId[set] })}
            conditional={t(setToConditionalKey(set))}
            selectOptions={meta.selectionOptions?.(tSelectOptions)}
          />,
        )
      }
    })
    return { relicOptions, ornamentOptions }
  }, [tSelectOptions, t])

  return (
    <Drawer
      title={t('Title')} // 'Conditional set effects'
      placement='right'
      onClose={close}
      open={isOpen}
      width={750}
      forceRender
    >
      <Flex justify='center'>
        <Flex direction="column" gap={defaultGap}>
          <Flex gap={defaultGap} align='center' justify='flex-start'>
            <Text style={{ width: setConditionalsIconWidth }}></Text>
            <Text style={{ width: setConditionalsNameWidth }}></Text>
          </Flex>
          {relicOptions}
        </Flex>
        <VerticalDivider />
        <Flex direction="column" gap={defaultGap} style={{ marginLeft: 5 }}>
          <Flex gap={defaultGap} align='center' justify='flex-start'>
            <Text style={{ width: setConditionalsIconWidth }}></Text>
            <Text style={{ width: setConditionalsNameWidth }}></Text>
          </Flex>
          {ornamentOptions}
        </Flex>
      </Flex>
    </Drawer>
  )
}
