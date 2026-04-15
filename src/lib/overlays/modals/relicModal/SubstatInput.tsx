import {
  Button,
  Flex,
  TextInput,
  Tooltip,
} from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import {
  IconChevronRight,
  IconLock,
} from '@tabler/icons-react'
import {
  Constants,
  Stats,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { SearchableCombobox } from 'lib/ui/SearchableCombobox'
import {
  localeNumber,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import { isFlat } from 'lib/utils/statUtils'
import {
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  RelicForm,
  RelicUpgradeValues,
} from './relicModalTypes'

const BUTTON_STYLE = { width: '100%', padding: 0 }
const CONTENTS_STYLE = { display: 'contents' }
const ICON_TOGGLE_STYLE = { cursor: 'pointer', display: 'flex', alignItems: 'center' }
const TEXT_INPUT_STYLE = { width: 80 }
const COMBOBOX_STYLE = { width: 210 }
const TOOLTIP_EVENTS = { hover: false, focus: true, touch: false }

function UpgradeButton({ value, label, onClick }: {
  value: number | undefined | null,
  label: string,
  onClick: () => void,
}) {
  if (value === null) return null
  return (
    <Flex w='100%'>
      <Button
        variant='default'
        style={BUTTON_STYLE}
        onClick={onClick}
        disabled={value === undefined}
        tabIndex={-1}
      >
        {label}
      </Button>
    </Flex>
  )
}

export function SubstatInput({ index, upgrades, relicForm, plusThree }: {
  index: 0 | 1 | 2 | 3,
  upgrades: RelicUpgradeValues[],
  relicForm: UseFormReturnType<RelicForm>,
  plusThree: () => void,
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
    return Constants.SubStats.map((stat) => ({
      label: tStats(stat),
      value: stat,
      icon: Assets.getStatIcon(stat, true),
    }))
  }, [tStats])

  function handlePreviewToggle() {
    if (isPreview) {
      relicForm.setFieldValue(isPreviewField, false as RelicForm[typeof isPreviewField])
      relicForm.setFieldValue(statValueField, String(isPreview))
    } else {
      const value = relicForm.getValues()[statValueField]
      if (value === '0' || !value) return
      relicForm.setFieldValue(isPreviewField, Number(value) as RelicForm[typeof isPreviewField])
      relicForm.setFieldValue(statValueField, '0')
    }
  }

  const stat = relicForm.getValues()[statTypeField] as RelicForm[typeof statTypeField]

  return (
    <div style={CONTENTS_STYLE}>
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
          style={COMBOBOX_STYLE}
          dropdownMaxHeight={750}
          clearable
        />

        <Tooltip
          label={stat === Stats.SPD ? t('SpdInputWarning') : ''}
          position='top'
          events={TOOLTIP_EVENTS}
        >
          <TextInput
            disabled={Boolean(isPreview)}
            ref={inputRef}
            onFocus={handleFocus}
            style={TEXT_INPUT_STYLE}
            value={relicForm.getValues()[statValueField] ?? ''}
            onChange={(e) => {
              relicForm.setFieldValue(statValueField, e.currentTarget.value)
            }}
            tabIndex={0}
          />
        </Tooltip>
      </Flex>

      <Flex align='center' justify='center' h='100%'>
        <div style={ICON_TOGGLE_STYLE}>
          {isPreview
            ? <IconLock size={18} onClick={handlePreviewToggle} />
            : <IconChevronRight size={18} onClick={handlePreviewToggle} />}
        </div>
      </Flex>

      <Flex gap={5}>
        {(['low', 'mid', 'high'] as const).map((quality) => {
          const value = upgrades?.[index]?.[quality]
          return (
            <UpgradeButton
              key={quality}
              value={value}
              label={value != null ? formatStat(value) : ''}
              onClick={() => upgradeClicked(quality)}
            />
          )
        })}
      </Flex>
    </div>
  )
}
