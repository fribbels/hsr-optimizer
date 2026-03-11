import {
  IconChevronRight,
  IconLock,
} from '@tabler/icons-react'
import { UseFormReturnType } from '@mantine/form'
import { Button, Flex, Select, TextInput, Tooltip } from '@mantine/core'
import {
  Constants,
  Stats,
} from 'lib/constants/constants'
import {
  RelicForm,
  RelicUpgradeValues,
} from 'lib/overlays/modals/relicModalController'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import {
  localeNumber,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import { Utils } from 'lib/utils/utils'
import React, {
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'

export function SubstatInput(props: {
  index: 0 | 1 | 2 | 3,
  upgrades: RelicUpgradeValues[],
  relicForm: UseFormReturnType<RelicForm>,
  resetUpgradeValues: () => void,
  plusThree: () => void,
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [hovered, setHovered] = React.useState(false)
  const statTypeField = `substatType${props.index}` as `substatType${typeof props.index}`
  const statValueField = `substatValue${props.index}` as `substatValue${typeof props.index}`
  const isPreviewField = `substat${props.index}IsPreview` as `substat${typeof props.index}IsPreview`
  const { t } = useTranslation('modals', { keyPrefix: 'Relic' })
  const { t: tStats } = useTranslation('common', { keyPrefix: 'Stats' })

  const isPreview = props.relicForm.getValues()[isPreviewField]

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select() // Select the entire text when focused
    }
  }

  function upgradeClicked(quality: 'low' | 'mid' | 'high') {
    props.relicForm.setFieldValue(statValueField, props.upgrades[props.index][quality] as any)
    props.relicForm.setFieldValue(isPreviewField, false as any)
    props.resetUpgradeValues()
    props.plusThree()
  }

  const formatStat = (value?: string | number) => {
    const stat = props.relicForm.getValues()[`substatType${props.index}`]
    if (!value) return ''
    if (Utils.isFlat(stat) && stat !== Stats.SPD) return localeNumber(Number(value))
    return localeNumber_0(Number(value))
  }

  const substatOptionsMemoized = useMemo(() => {
    const output: {
      label: string,
      value: string,
    }[] = []
    for (const entry of Object.entries(Constants.SubStats)) {
      output.push({
        label: tStats(entry[1]),
        value: entry[1],
      })
    }
    return output
  }, [tStats])

  function PreviewToggle() {
    const onClick = () => {
      if (isPreview) {
        props.relicForm.setFieldValue(isPreviewField, false as any)
        props.relicForm.setFieldValue(statValueField, isPreview as any)
        props.resetUpgradeValues()
      } else {
        const value = props.relicForm.getValues()[statValueField]
        if (value == '0' || !value) return
        props.relicForm.setFieldValue(isPreviewField, value as any)
        props.relicForm.setFieldValue(statValueField, '0' as any)
        props.resetUpgradeValues()
      }
    }
    return (
      <div style={{ width: 12, marginTop: 7, cursor: 'pointer' }}>
        {isPreview ? <IconLock onClick={onClick} /> : <IconChevronRight onClick={onClick} />}
      </div>
    )
  }

  function UpgradeButton(subProps: {
    quality: 'low' | 'mid' | 'high',
  }) {
    const value = props.upgrades?.[props.index]?.[subProps.quality]

    if (value === null) return null

    const displayValue = formatStat(value)

    return (
      <Flex style={{ width: '100%' }}>
        <Button
          variant='default'
          style={{ width: '100%', padding: 0 }}
          onClick={() => upgradeClicked(subProps.quality)}
          disabled={value === undefined}
          tabIndex={-1}
        >
          {displayValue}
        </Button>
      </Flex>
    )
  }

  const stat = props.relicForm.getValues()[statTypeField] as RelicForm[typeof statTypeField]

  return (
    <Flex gap={10} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Flex gap={10}>
        <Select
          searchable
          clearable
          style={{
            width: 210,
          }}
          placeholder={t('SubstatPlaceholder')}
          data={substatOptionsMemoized}
          maxDropdownHeight={750}
          renderOption={({ option }) => (
            <Flex align='center' gap={10}>
              <img className={iconClasses.icon22} src={Assets.getStatIcon(option.value, true)} />
              {option.label}
            </Flex>
          )}
          {...props.relicForm.getInputProps(statTypeField)}
          onChange={(val) => {
            props.relicForm.setFieldValue(statTypeField, val as any)
            if (val) {
              props.relicForm.setFieldValue(statValueField, '0' as any)
            } else {
              props.relicForm.setFieldValue(statValueField, undefined as any)
            }
            props.resetUpgradeValues()
          }}
          tabIndex={0}
        />

        <Tooltip
          label={stat == Stats.SPD ? t('SpdInputWarning') : ''}
          position='top'
          events={{ hover: false, focus: true, touch: false }}
        >
          <TextInput
            disabled={Boolean(isPreview)}
            ref={inputRef}
            onFocus={handleFocus}
            style={{ width: 80 }}
            {...props.relicForm.getInputProps(statValueField)}
            onChange={(e) => {
              props.relicForm.setFieldValue(statValueField, e.currentTarget.value)
              props.resetUpgradeValues()
            }}
            tabIndex={0}
          />
        </Tooltip>
      </Flex>
      <PreviewToggle />
      <Flex gap={5} style={{ minWidth: 180 }}>
        <UpgradeButton quality='low' />
        <UpgradeButton quality='mid' />
        <UpgradeButton quality='high' />
      </Flex>
    </Flex>
  )
}
