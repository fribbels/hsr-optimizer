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
import {
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'

export function SubstatInput({ index, upgrades, relicForm, resetUpgradeValues, plusThree }: {
  index: 0 | 1 | 2 | 3
  upgrades: RelicUpgradeValues[]
  relicForm: UseFormReturnType<RelicForm>
  resetUpgradeValues: () => void
  plusThree: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const statTypeField = `substatType${index}` as `substatType${typeof index}`
  const statValueField = `substatValue${index}` as `substatValue${typeof index}`
  const isPreviewField = `substat${index}IsPreview` as `substat${typeof index}IsPreview`
  const { t } = useTranslation('modals', { keyPrefix: 'Relic' })
  const { t: tStats } = useTranslation('common', { keyPrefix: 'Stats' })

  const isPreview = relicForm.getValues()[isPreviewField]

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select() // Select the entire text when focused
    }
  }

  function upgradeClicked(quality: 'low' | 'mid' | 'high') {
    relicForm.setFieldValue(statValueField, upgrades[index][quality] as any)
    relicForm.setFieldValue(isPreviewField, false as any)
    resetUpgradeValues()
    plusThree()
  }

  const formatStat = (value?: string | number) => {
    const stat = relicForm.getValues()[`substatType${index}`]
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
        relicForm.setFieldValue(isPreviewField, false as any)
        relicForm.setFieldValue(statValueField, isPreview as any)
        resetUpgradeValues()
      } else {
        const value = relicForm.getValues()[statValueField]
        if (value === '0' || !value) return
        relicForm.setFieldValue(isPreviewField, value as any)
        relicForm.setFieldValue(statValueField, '0' as any)
        resetUpgradeValues()
      }
    }
    return (
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        {isPreview ? <IconLock size={18} onClick={onClick} /> : <IconChevronRight size={18} onClick={onClick} />}
      </div>
    )
  }

  function UpgradeButton(subProps: {
    quality: 'low' | 'mid' | 'high',
  }) {
    const value = upgrades?.[index]?.[subProps.quality]

    if (value === null) return null

    const displayValue = formatStat(value)

    return (
      <Flex w='100%'>
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

  const stat = relicForm.getValues()[statTypeField] as RelicForm[typeof statTypeField]

  return (
    <div style={{ display: 'contents' }}>
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
          {...relicForm.getInputProps(statTypeField)}
          onChange={(val) => {
            relicForm.setFieldValue(statTypeField, val as any)
            if (val) {
              relicForm.setFieldValue(statValueField, '0' as any)
            } else {
              relicForm.setFieldValue(statValueField, undefined as any)
            }
            resetUpgradeValues()
          }}
          tabIndex={0}
        />

        <Tooltip
          label={stat === Stats.SPD ? t('SpdInputWarning') : ''}
          position='top'
          events={{ hover: false, focus: true, touch: false }}
        >
          <TextInput
            disabled={Boolean(isPreview)}
            ref={inputRef}
            onFocus={handleFocus}
            style={{ width: 80 }}
            {...relicForm.getInputProps(statValueField)}
            onChange={(e) => {
              relicForm.setFieldValue(statValueField, e.currentTarget.value)
              resetUpgradeValues()
            }}
            tabIndex={0}
          />
        </Tooltip>
      </Flex>

      <Flex align='center' justify='center' h='100%'>
        <PreviewToggle />
      </Flex>

      <Flex gap={5}>
        <UpgradeButton quality='low' />
        <UpgradeButton quality='mid' />
        <UpgradeButton quality='high' />
      </Flex>
    </div>
  )
}
