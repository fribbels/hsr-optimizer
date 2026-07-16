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
  type SubStats,
} from 'lib/constants/constants'
import {
  computeSubstatRemovalUpdates,
  computeSubstatRowUpdates,
  getRelicFormSubstats,
} from 'lib/overlays/modals/relicModal/relicModalHelpers'
import type {
  RelicForm,
  RelicFormStat,
  RelicUpgradeValues,
  SubstatIndex,
} from 'lib/overlays/modals/relicModal/relicModalTypes'
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
  index: SubstatIndex,
  upgrades: RelicUpgradeValues[],
  relicForm: UseFormReturnType<RelicForm>,
  plusThree: () => void,
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation('modals', { keyPrefix: 'Relic' })
  const { t: tStats } = useTranslation('common', { keyPrefix: 'Stats' })

  const formValues = relicForm.getValues()
  const substat = getRelicFormSubstats(formValues)[index]
  const { isPreview, stat, value } = substat
  const { mainStatType } = formValues

  function updateSubstat(updates: Partial<RelicFormStat>) {
    relicForm.setValues(computeSubstatRowUpdates(relicForm.getValues(), index, updates))
  }

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  function upgradeClicked(quality: 'low' | 'mid' | 'high') {
    const upgradeValue = upgrades[index][quality]
    if (upgradeValue == null) return
    updateSubstat({ value: String(upgradeValue), isPreview: false })
    plusThree()
  }

  const formatStat = (displayValue?: string | number) => {
    if (!displayValue) return ''
    if (stat && isFlat(stat) && stat !== Stats.SPD) return localeNumber(Number(displayValue))
    return localeNumber_0(Number(displayValue))
  }

  const substatOptionsMemoized = useMemo(() => {
    return Constants.SubStats.map((substatOption) => ({
      label: tStats(substatOption),
      value: substatOption,
      icon: Assets.getStatIcon(substatOption, true),
      disabled: substatOption === mainStatType,
    }))
  }, [mainStatType, tStats])

  function handlePreviewToggle() {
    if (isPreview) {
      updateSubstat({ isPreview: false, value: String(isPreview) })
    } else {
      if (value === '0' || !value) return
      updateSubstat({ isPreview: Number(value), value: '0' })
    }
  }

  return (
    <div style={CONTENTS_STYLE}>
      <Flex gap={10}>
        <SearchableCombobox
          options={substatOptionsMemoized}
          value={stat ?? null}
          onChange={(val) => {
            if (val == null) {
              relicForm.setValues(computeSubstatRemovalUpdates(relicForm.getValues(), index))
              return
            }
            updateSubstat({ stat: val as SubStats, value: '0', isPreview: false })
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
          disabled={stat !== Stats.SPD}
          maw={400}
          multiline
        >
          <TextInput
            disabled={Boolean(isPreview)}
            ref={inputRef}
            onFocus={handleFocus}
            style={TEXT_INPUT_STYLE}
            value={value ?? ''}
            onChange={(e) => {
              updateSubstat({ value: e.currentTarget.value })
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
