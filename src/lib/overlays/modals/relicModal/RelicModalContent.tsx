import {
  Alert,
  Button,
  Flex,
  NumberInput,
  SegmentedControl,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  Constants,
  Parts,
  UnreleasedSets,
} from 'lib/constants/constants'
import { useScrollLock } from 'lib/layout/scrollController'
import { SettingOptions } from 'lib/constants/settingsConstants'
import { Assets } from 'lib/rendering/assets'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import {
  SetsOrnaments,
  SetsRelics,
  setToId,
} from 'lib/sets/setConfigRegistry'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RelicLocator } from 'lib/tabs/tabRelics/RelicLocator'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  SearchableCombobox,
  type SearchableComboboxOption,
} from 'lib/ui/SearchableCombobox'
import {
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import modalClasses from './RelicModal.module.css'
import {
  calculateUpgradeValues,
  computeInitialFormValues,
  computeMainStatDisplayValue,
  computeMainStatOptions,
  computePartChangeUpdates,
  ENHANCE_OPTIONS,
  GRADE_OPTIONS,
  validateRelic,
} from './relicModalController'
import { relicsAreDifferent } from './relicModalHelpers'
import { useRelicModalStore } from './relicModalStore'
import type { RelicForm } from './relicModalTypes'
import { SubstatInput } from './SubstatInput'

function partSegmentData(value: string, src: string) {
  return {
    value,
    label: (
      <Flex align='center' justify='center'>
        <img
          data-testid={`relic-part-${value}`}
          style={{ width: 20 }}
          src={src}
        />
      </Flex>
    ),
  }
}

export function RelicModalContent() {
  const config = useRelicModalStore((s) => s.config)!
  const closeOverlay = useRelicModalStore((s) => s.closeOverlay)

  const { t } = useTranslation(['modals', 'common', 'gameData'])
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })

  const characters = useCharacterStore((s) => s.characters)
  const showLocator = useGlobalStore((s) => s.settings.ShowLocatorInRelicsModal)
  const isLiveImport = useScannerState((s) => s.ingest)

  useScrollLock(true)

  const { selectedRelic, onOk } = config

  // ── FORM: initialized with correct values from first render ──
  const relicForm = useForm<RelicForm>({
    initialValues: computeInitialFormValues(config),
  })

  // Reset form when navigating to a different relic (prev/next arrows).
  // Skips the initial mount since initialValues already handles that.
  const initialRelicId = useRef(config.selectedRelic?.id)
  useEffect(() => {
    if (config.selectedRelic?.id !== initialRelicId.current) {
      initialRelicId.current = config.selectedRelic?.id
      relicForm.setValues(computeInitialFormValues(config))
    }
  }, [config.selectedRelic?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── DERIVED STATE: computed inline during render ──
  const formValues = relicForm.getValues()
  const mainStatOptions = computeMainStatOptions(formValues.part)
  const mainStatDisplayValue = computeMainStatDisplayValue(formValues.mainStatType, formValues.grade, formValues.enhance)
  const upgradeValues = calculateUpgradeValues(formValues)

  // Stable option lists — only recompute when translations change, not per-relic
  const relicOptions: SearchableComboboxOption[] = useMemo(() => {
    return Object.entries(SetsRelics)
      .filter((x) => !UnreleasedSets[x[1]])
      .map((entry) => ({
        label: t(`gameData:RelicSets.${setToId[entry[1]]}.Name`),
        value: entry[1],
        icon: Assets.getSetImage(entry[1]),
      }))
  }, [t])

  const planarOptions: SearchableComboboxOption[] = useMemo(() => {
    return Object.entries(SetsOrnaments)
      .filter((x) => !UnreleasedSets[x[1]])
      .map((entry) => ({
        label: t(`gameData:RelicSets.${setToId[entry[1]]}.Name`),
        value: entry[1],
        icon: Assets.getSetImage(entry[1]),
      }))
  }, [t])

  function getSetOptions(part?: Parts) {
    if (!part) return relicOptions.concat(planarOptions)
    if (part === Parts.LinkRope || part === Parts.PlanarSphere) return planarOptions
    return relicOptions
  }

  const setOptions = getSetOptions(formValues.part)

  const characterOptions = useMemo(() => {
    return generateCharacterList({ currentCharacters: characters, longNameLabel: true }, tCharacters)
  }, [characters, tCharacters])

  // ── EVENT HANDLERS ──

  const onPartChange = (newPart: string) => {
    const part = newPart as Parts
    const updates = computePartChangeUpdates(part, formValues.set, relicOptions, planarOptions)
    relicForm.setFieldValue('part', part)
    if (updates.mainStatType != null) {
      relicForm.setFieldValue('mainStatType', updates.mainStatType)
    }
    if (updates.set != null) {
      relicForm.setFieldValue('set', updates.set)
    }
  }

  const handleOk = () => {
    const values = relicForm.getValues()
    const recomputed = computeMainStatDisplayValue(values.mainStatType, values.grade, values.enhance)
    const relic = validateRelic({ ...values, mainStatValue: recomputed ?? values.mainStatValue })
    if (!relic) return
    if (relicsAreDifferent(selectedRelic, relic)) {
      relic.verified = false
    }
    onOk(relic)
    closeOverlay()
  }

  const handleCancel = () => closeOverlay()

  const plusThree = () => {
    const currentEnhance = relicForm.getValues().enhance as number
    relicForm.setFieldValue('enhance', Math.floor(Math.min(currentEnhance + 3, 15) / 3) * 3)
  }

  // ── JSX ──

  return (
    <Flex direction='column' gap={5}>
      {isLiveImport && <Alert color='yellow'>{t('Relic.LiveImportWarning') /* Live import mode is enabled, your changes might be overwritten. */}</Alert>}
      <div className={modalClasses.relicGrid}>
        <Flex direction='column' gap={5}>
          <HeaderText>{t('Relic.Part') /* Part */}</HeaderText>

          <SegmentedControl
            size='md'
            value={formValues.part}
            onChange={onPartChange}
            data={[
              partSegmentData(Constants.Parts.Head, Assets.getPart(Constants.Parts.Head)),
              partSegmentData(Constants.Parts.Hands, Assets.getPart(Constants.Parts.Hands)),
              partSegmentData(Constants.Parts.Body, Assets.getPart(Constants.Parts.Body)),
              partSegmentData(Constants.Parts.Feet, Assets.getPart(Constants.Parts.Feet)),
              partSegmentData(Constants.Parts.PlanarSphere, Assets.getPart(Constants.Parts.PlanarSphere)),
              partSegmentData(Constants.Parts.LinkRope, Assets.getPart(Constants.Parts.LinkRope)),
            ]}
          />

          <HeaderText>{t('Relic.Set') /* Set */}</HeaderText>
          <SearchableCombobox
            clearable
            dropdownMaxHeight={350}
            placeholder={t('Relic.Set') /* Set */}
            options={setOptions}
            value={formValues.set}
            onChange={(val) => relicForm.setFieldValue('set', val as RelicForm['set'])}
          />

          <HeaderText>{t('Relic.Enhance') /* Enhance / Grade */}</HeaderText>

          <Flex gap={10}>
            <SearchableCombobox
              style={{ width: 115 }}
              options={ENHANCE_OPTIONS}
              value={formValues.enhance?.toString()}
              onChange={(val) => {
                relicForm.setFieldValue('enhance', val != null ? Number(val) : undefined)
              }}
            />

            <Button style={{ width: 50 }} onClick={plusThree}>
              +3
            </Button>

            <SearchableCombobox
              style={{ width: 115 }}
              options={GRADE_OPTIONS}
              value={formValues.grade?.toString()}
              onChange={(val) => {
                relicForm.setFieldValue('grade', val != null ? Number(val) : undefined)
              }}
            />
          </Flex>

          <HeaderText>{t('Relic.Mainstat') /* Main stat */}</HeaderText>

          <Flex gap={10}>
            <SearchableCombobox
              style={{ width: 210 }}
              options={mainStatOptions}
              disabled={mainStatOptions.length <= 1}
              value={formValues.mainStatType}
              onChange={(val) => relicForm.setFieldValue('mainStatType', val as RelicForm['mainStatType'])}
            />

            <NumberInput hideControls disabled style={{ width: 80 }} value={mainStatDisplayValue ?? formValues.mainStatValue} />
          </Flex>
        </Flex>

        <div />

        <Flex direction='column' gap={5}>
          <HeaderText>{t('Relic.Wearer') /* Equipped by */}</HeaderText>
          <SearchableCombobox
            options={characterOptions.map((opt) => ({
              value: opt.value,
              label: opt.title ?? opt.value,
              icon: opt.value === 'None' ? Assets.getBlank() : Assets.getCharacterAvatarById(opt.value),
            }))}
            value={formValues.equippedBy}
            onChange={(val) => relicForm.setFieldValue('equippedBy', val as RelicForm['equippedBy'])}
          />

          <div className={modalClasses.previewContainer}>
            <img
              style={{ width: '100%' }}
              src={Assets.getCharacterPreviewById(formValues.equippedBy === 'None' ? '' : formValues.equippedBy)}
            />
          </div>
        </Flex>
      </div>

      <div className={modalClasses.relicGrid} style={{ rowGap: 5 }}>
        <HeaderText>{t('Relic.Substat') /* Substats */}</HeaderText>
        <div />
        <HeaderText>{t('Relic.Upgrades') /* Substat upgrades */}</HeaderText>

        <SubstatInput
          index={0}
          upgrades={upgradeValues}
          relicForm={relicForm}
          plusThree={plusThree}
        />

        <SubstatInput
          index={1}
          upgrades={upgradeValues}
          relicForm={relicForm}
          plusThree={plusThree}
        />

        <SubstatInput
          index={2}
          upgrades={upgradeValues}
          relicForm={relicForm}
          plusThree={plusThree}
        />

        <SubstatInput
          index={3}
          upgrades={upgradeValues}
          relicForm={relicForm}
          plusThree={plusThree}
        />
      </div>
      <Flex justify={showLocator === SettingOptions.ShowLocatorInRelicsModal.Yes ? 'space-between' : 'flex-end'} style={{ marginTop: 16 }}>
        <Flex className={modalClasses.locatorFlex}>
          {selectedRelic && showLocator === SettingOptions.ShowLocatorInRelicsModal.Yes && <RelicLocator relic={selectedRelic} />}
        </Flex>

        <Flex gap={10} style={{ width: 180 }}>
          <Button onClick={handleCancel} style={{ flex: 1 }}>
            {t('common:Cancel')}
          </Button>
          <Button onClick={handleOk} style={{ flex: 1 }}>
            {t('common:Submit')}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}
