import {
  IconChevronRight,
  IconLock,
} from '@tabler/icons-react'
import type { UseFormReturnType } from '@mantine/form'
import { Button, Flex, TextInput, Tooltip } from '@mantine/core'
import {
  Constants,
  Stats,
} from 'lib/constants/constants'
import type {
  RelicForm,
  RelicUpgradeValues,
} from './relicModalTypes'
import { Assets } from 'lib/rendering/assets'
import {
  localeNumber,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import {
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { SearchableCombobox } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/SearchableCombobox'
import { isFlat } from 'lib/utils/statUtils'

export function SubstatInput({ index, upgrades, relicForm, plusThree }: {
  index: 0 | 1 | 2 | 3
  upgrades: RelicUpgradeValues[]
  relicForm: UseFormReturnType<RelicForm>
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
      inputRef.current.select()
    }
  }

  function upgradeClicked(quality: 'low' | 'mid' | 'high') {
    const upgradeValue = upgrades[index][quality]
    if (upgradeValue == null) return
    relicForm.setFieldValue(statValueField, String(upgradeValue))
    relicForm.setFieldValue(isPreviewField, false as RelicForm[typeof isPreviewField])
    plusThree()
  }

  const formatStat = (value?: string | number) => {
    const stat = relicForm.getValues()[`substatType${index}`]
    if (!value) return ''
    if (stat && isFlat(stat) && stat !== Stats.SPD) return localeNumber(Number(value))
    return localeNumber_0(Number(value))
  }

  const substatOptionsMemoized = useMemo(() => {
    return Object.entries(Constants.SubStats).map((entry) => ({
      label: tStats(entry[1]),
      value: entry[1],
      icon: Assets.getStatIcon(entry[1], true),
    }))
  }, [tStats])

  function PreviewToggle() {
    const onClick = () => {
      if (isPreview) {
        relicForm.setFieldValue(isPreviewField, false as RelicForm[typeof isPreviewField])
        relicForm.setFieldValue(statValueField, String(isPreview))
      } else {
        const value = relicForm.getValues()[statValueField]
        if (value === '0' || !value) return
        relicForm.setFieldValue(isPreviewField, value as unknown as RelicForm[typeof isPreviewField])
        relicForm.setFieldValue(statValueField, '0')
      }
    }
    return (
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        {isPreview ? <IconLock size={18} onClick={onClick} /> : <IconChevronRight size={18} onClick={onClick} />}
      </div>
    )
  }

  function UpgradeButton(subProps: {
    quality: 'low' | 'mid' | 'high'
  }) {
    const value = upgrades?.[index]?.[subProps.quality]

    if (value === null) return null

    const displayValue = formatStat(value)

    return (
      <Flex w="100%">
        <Button
          variant="default"
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
        <SearchableCombobox
          options={substatOptionsMemoized}
          value={stat ?? null}
          onChange={(val) => {
            relicForm.setFieldValue(statTypeField, val as RelicForm[typeof statTypeField])
            if (val) {
              relicForm.setFieldValue(statValueField, '0')
            } else {
              relicForm.setFieldValue(statValueField, undefined as RelicForm[typeof statValueField])
            }
          }}
          placeholder={t('SubstatPlaceholder')}
          style={{ width: 210 }}
          dropdownMaxHeight={750}
          clearable
        />

        <Tooltip
          label={stat === Stats.SPD ? t('SpdInputWarning') : ''}
          position="top"
          events={{ hover: false, focus: true, touch: false }}
        >
          <TextInput
            disabled={Boolean(isPreview)}
            ref={inputRef}
            onFocus={handleFocus}
            style={{ width: 80 }}
            value={relicForm.getValues()[statValueField] ?? ''}
            onChange={(e) => {
              relicForm.setFieldValue(statValueField, e.currentTarget.value)
            }}
            tabIndex={0}
          />
        </Tooltip>
      </Flex>

      <Flex align="center" justify="center" h="100%">
        <PreviewToggle />
      </Flex>

      <Flex gap={5}>
        <UpgradeButton quality="low" />
        <UpgradeButton quality="mid" />
        <UpgradeButton quality="high" />
      </Flex>
    </div>
  )
}
