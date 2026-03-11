import {
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { Alert, Button, Flex, Modal, NumberInput, SegmentedControl, Select, useMantineTheme } from '@mantine/core'
import {
  Constants,
  MainStats,
  Parts,
  Stats,
  UnreleasedSets,
} from 'lib/constants/constants'
import {
  SetsOrnaments,
  SetsRelics,
  setToId,
} from 'lib/sets/setConfigRegistry'
import { Message } from 'lib/interactions/message'
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import {
  calculateUpgradeValues,
  RelicForm,
  RelicUpgradeValues,
  validateRelic,
} from 'lib/overlays/modals/relicModalController'
import {
  defaultMainStatPerPart,
  defaultSubstatValues,
  MainStatOption,
  relicsAreDifferent,
  renderMainStat,
} from 'lib/overlays/modals/relicModalHelpers'
import { SubstatInput } from 'lib/overlays/modals/SubstatInput'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import { useScrollLock } from 'lib/rendering/scrollController'
import { useCharacterStore } from 'lib/stores/characterStore'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RelicLocator } from 'lib/tabs/tabRelics/RelicLocator'
import { HeaderText } from 'lib/ui/HeaderText'
import { isFlat } from 'lib/utils/statUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'
import { useGlobalStore } from 'lib/stores/appStore'

// FIXME MED

function partSegmentData(value: string, src: string) {
  return {
    value,
    label: (
      <img
        style={{ width: 30 }}
        src={src}
      />
    ),
  }
}

type RelicModalProps = {
  open: boolean,
  setOpen: (open: boolean) => void,
  onOk: (relic: Relic) => void,
  selectedRelic: Relic | null,
  selectedPart?: Parts | null,
  defaultWearer?: CharacterId,
  next?: () => void,
  prev?: () => void,
}

export default function RelicModal({ selectedRelic, selectedPart, onOk, setOpen, open, defaultWearer, next, prev }: RelicModalProps) {
  const { t } = useTranslation(['modals', 'common', 'gameData'])
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const theme = useMantineTheme()
  const relicForm = useForm<RelicForm>({
    initialValues: {} as RelicForm,
  })
  const [mainStatOptions, setMainStatOptions] = useState<MainStatOption[]>([])
  const characters = useCharacterStore((s) => s.characters)
  const showLocator = useGlobalStore((s) => s.settings.ShowLocatorInRelicsModal)

  const isLiveImport = useScannerState((s) => s.ingest)

  useScrollLock(open)

  const characterOptions = useMemo(() => {
    return generateCharacterList({ currentCharacters: characters, longNameLabel: true }, tCharacters)
  }, [characters, tCharacters])

  const relicOptions = useMemo(() => {
    const setOptions: {
      label: string,
      value: string,
    }[] = []
    for (const entry of Object.entries(SetsRelics).filter((x) => !UnreleasedSets[x[1]])) {
      setOptions.push({
        label: t(`gameData:RelicSets.${setToId[entry[1]]}.Name`),
        value: entry[1],
      })
    }
    return setOptions
  }, [t])

  const planarOptions = useMemo(() => {
    const setOptions: {
      label: string,
      value: string,
    }[] = []
    for (const entry of Object.entries(SetsOrnaments).filter((x) => !UnreleasedSets[x[1]])) {
      setOptions.push({
        label: t(`gameData:RelicSets.${setToId[entry[1]]}.Name`),
        value: entry[1],
      })
    }
    return setOptions
  }, [t])

  const part = relicForm.getValues().part

  function getSetOptions(part?: Parts) {
    if (!part) return relicOptions.concat(planarOptions)
    if (part === Parts.LinkRope || part === Parts.PlanarSphere) return planarOptions
    return relicOptions
  }

  const setOptions = getSetOptions(part)

  const equippedBy = relicForm.getValues().equippedBy
  const [upgradeValues, setUpgradeValues] = useState<RelicUpgradeValues[]>([])

  useEffect(() => {
    let defaultValues: RelicForm

    if (selectedRelic) {
      defaultValues = {
        equippedBy: selectedRelic.equippedBy ?? defaultWearer ?? 'None',
        grade: selectedRelic.grade,
        enhance: selectedRelic.enhance,
        set: selectedRelic.set,
        part: selectedRelic.part,
        mainStatType: renderMainStat(selectedRelic)?.stat,
        mainStatValue: renderMainStat(selectedRelic)?.value,
        ...defaultSubstatValues(selectedRelic),
      }
    } else {
      const defaultPart = selectedPart ?? Constants.Parts.Head
      const defaultMain = defaultMainStatPerPart[defaultPart]
      let defaultValue = TsUtils.precisionRound(Constants.MainStatsValues[defaultMain][5].base + Constants.MainStatsValues[defaultMain][5].increment * 15)
      defaultValue = isFlat(defaultMain) ? Math.floor(defaultValue) : defaultValue
      defaultValues = {
        equippedBy: defaultWearer ?? 'None',
        grade: 5,
        enhance: 15,
        part: defaultPart,
        mainStatType: Constants.Stats.HP,
        mainStatValue: defaultValue,
      } as RelicForm
    }

    onValuesChange(defaultValues)

    relicForm.setValues(defaultValues)
  }, [selectedRelic, open])

  useEffect(() => {
    let mainStatOptions: MainStatOption[] = []
    const part = selectedRelic?.part ?? selectedPart
    if (part) {
      mainStatOptions = Object.entries(Constants.PartsMainStats[part]).map((entry) => ({
        label: t(`common:Stats.${entry[1]}`),
        value: entry[1],
      }))
    }

    setMainStatOptions(mainStatOptions)
    relicForm.setFieldValue('mainStatType', selectedRelic?.main?.stat)
  }, [selectedRelic?.part, selectedRelic?.main?.stat, selectedPart, t])

  useEffect(() => {
    if (mainStatOptions.length > 0) {
      const mainStatValues = mainStatOptions.map((item) => item.value)
      // @ts-ignore
      if (mainStatValues.includes(selectedRelic?.main?.stat)) {
        relicForm.setFieldValue('mainStatType', selectedRelic?.main?.stat as MainStats)
      } else {
        relicForm.setFieldValue('mainStatType', mainStatOptions[0].value as MainStats)
      }
    }

    // We hook into the main stat change to update substats, not ideal, but it works
    resetUpgradeValues()
  }, [mainStatOptions, selectedRelic?.main?.stat])

  const onFinish = (formValues: RelicForm) => {
    const relic = validateRelic(formValues)
    if (!relic) return
    if (relicsAreDifferent(selectedRelic, relic)) {
      relic.verified = false
    }

    onOk(relic)
    setOpen(false)
  }
  const onFinishFailed = () => {
    Message.error(t('Relic.Messages.SubmitFail') /* Submit failed! */)
    setOpen(false)
  }
  const onValuesChange = (formValues: RelicForm) => {
    let mainStatOptions: MainStatOption[] = []
    if (formValues.part) {
      const part = formValues.part
      mainStatOptions = Object.entries(Constants.PartsMainStats[part]).map((entry) => ({
        label: t(`common:Stats.${entry[1]}`),
        value: entry[1],
      }))
      setMainStatOptions(mainStatOptions)
      relicForm.setFieldValue('mainStatType', mainStatOptions[0]?.value as MainStats)

      const defaultSet = getSetOptions(part)[0].value
      if (part === Parts.PlanarSphere || part === Parts.LinkRope) {
        // @ts-ignore
        if (!Object.values(SetsOrnaments).includes(formValues.set)) {
          relicForm.setFieldValue('set', defaultSet as RelicForm['set'])
        }
        // @ts-ignore
      } else if (!Object.values(SetsRelics).includes(formValues.set)) {
        relicForm.setFieldValue('set', defaultSet as RelicForm['set'])
      }
    }

    const mainStatType = mainStatOptions[0]?.value || relicForm.getValues().mainStatType
    const enhance: number | undefined = relicForm.getValues().enhance
    const grade: number | undefined = relicForm.getValues().grade

    if (mainStatType != undefined && enhance != undefined && grade != undefined) {
      const specialStats = [
        Stats.OHB,
        Stats.Physical_DMG,
        Stats.Physical_DMG,
        Stats.Fire_DMG,
        Stats.Ice_DMG,
        Stats.Lightning_DMG,
        Stats.Wind_DMG,
        Stats.Quantum_DMG,
        Stats.Imaginary_DMG,
      ]
      const floorStats = [Stats.HP, Stats.ATK]

      let mainStatValue = TsUtils.calculateRelicMainStatValue(mainStatType, grade, enhance)

      // @ts-ignore TS doesn't like mismatched types when using .includes
      if (specialStats.includes(mainStatType)) { // Outgoing Healing Boost and elemental damage bonuses has a weird rounding with one decimal place
        mainStatValue = Utils.truncate10ths(mainStatValue)
        // @ts-ignore TS doesn't like mismatched types when using .includes
      } else if (floorStats.includes(mainStatType)) {
        mainStatValue = Math.floor(mainStatValue)
      } else {
        mainStatValue = Utils.truncate10ths(mainStatValue)
      }
      relicForm.setFieldValue('mainStatValue', mainStatValue)
    }
  }

  // Watch for part changes to trigger onValuesChange
  useEffect(() => {
    if (part) {
      onValuesChange(relicForm.getValues())
    }
  }, [part])

  function resetUpgradeValues() {
    const statUpgrades = calculateUpgradeValues(relicForm.getValues())
    setUpgradeValues(statUpgrades)
  }

  const handleCancel = () => {
    setOpen(false)
  }
  const handleOk = () => {
    const values = relicForm.getValues()
    onFinish(values)
  }

  const plusThree = () => {
    // Upgrade to nearest 3
    const currentEnhance = relicForm.getValues().enhance as number
    relicForm.setFieldValue('enhance', Math.floor(Math.min(currentEnhance + 3, 15) / 3) * 3)
  }

  const enhanceOptions: {
    value: string,
    label: string,
  }[] = useMemo(() => {
    const ret: {
      value: string,
      label: string,
    }[] = []
    for (let i = 15; i >= 0; i--) {
      ret.push({ value: String(i), label: '+' + i })
    }
    return ret
  }, [])

  return (
    <div>
      <Modal
        size={560}
        centered
        withCloseButton={!isLiveImport}
        opened={open}
        onClose={() => setOpen(false)}
      >
        <Flex direction="column" gap={5}>
          {isLiveImport && (
            <Alert color='yellow'>{t('Relic.LiveImportWarning') /* Live import mode is enabled, your changes might be overwritten. */}</Alert>
          )}
          {prev && (
            <IconChevronLeft
              onClick={prev}
              style={{
                position: 'absolute',
                top: 240,
                right: 560,
                fontSize: '40px',
                cursor: 'pointer',
              }}
            />
          )}
          {next && (
            <IconChevronRight
              onClick={next}
              style={{
                position: 'absolute',
                top: 240,
                left: 560,
                fontSize: '40px',
                cursor: 'pointer',
              }}
            />
          )}
          <Flex gap={10}>
            <Flex direction="column" gap={5}>
              <HeaderText>{t('Relic.Part') /* Part */}</HeaderText>

              <SegmentedControl
                data={[
                  partSegmentData(Constants.Parts.Head, Assets.getPart(Constants.Parts.Head)),
                  partSegmentData(Constants.Parts.Hands, Assets.getPart(Constants.Parts.Hands)),
                  partSegmentData(Constants.Parts.Body, Assets.getPart(Constants.Parts.Body)),
                  partSegmentData(Constants.Parts.Feet, Assets.getPart(Constants.Parts.Feet)),
                  partSegmentData(Constants.Parts.PlanarSphere, Assets.getPart(Constants.Parts.PlanarSphere)),
                  partSegmentData(Constants.Parts.LinkRope, Assets.getPart(Constants.Parts.LinkRope)),
                ]}
                {...relicForm.getInputProps('part')}
              />

              <HeaderText>{t('Relic.Set') /* Set */}</HeaderText>
              <Select
                searchable
                clearable
                style={{
                  width: 300,
                }}
                maxDropdownHeight={350}
                placeholder={t('Relic.Set') /* Set */}
                data={setOptions}
                renderOption={({ option }) => (
                  <Flex align='center' gap={10}>
                    <img className={iconClasses.icon22} src={Assets.getSetImage(option.value)} />
                    {option.label}
                  </Flex>
                )}
                {...relicForm.getInputProps('set')}
              />

              <HeaderText>{t('Relic.Enhance') /* Enhance / Grade */}</HeaderText>

              <Flex gap={10}>
                <Select
                  searchable
                  style={{ width: 115 }}
                  data={enhanceOptions}
                  {...relicForm.getInputProps('enhance')}
                  value={relicForm.getValues().enhance?.toString()}
                  onChange={(val) => {
                    relicForm.setFieldValue('enhance', val != null ? Number(val) : undefined)
                  }}
                />

                <Button style={{ width: 50 }} onClick={plusThree}>
                  +3
                </Button>

                <Select
                  searchable
                  style={{ width: 115 }}
                  data={[
                    { value: '2', label: '2 ★' },
                    { value: '3', label: '3 ★' },
                    { value: '4', label: '4 ★' },
                    { value: '5', label: '5 ★' },
                  ]}
                  value={relicForm.getValues().grade?.toString()}
                  onChange={(val) => {
                    relicForm.setFieldValue('grade', val != null ? Number(val) : undefined)
                    resetUpgradeValues()
                  }}
                />
              </Flex>

              <HeaderText>{t('Relic.Mainstat') /* Main stat */}</HeaderText>

              <Flex gap={10}>
                <Select
                  searchable
                  style={{
                    width: 210,
                  }}
                  data={mainStatOptions}
                  renderOption={({ option }) => (
                    <Flex align='center' gap={10}>
                      <img src={Assets.getStatIcon(option.value, true)} className={iconClasses.icon22} />
                      {option.label}
                    </Flex>
                  )}
                  disabled={mainStatOptions.length <= 1}
                  {...relicForm.getInputProps('mainStatType')}
                />

                <NumberInput hideControls disabled style={{ width: 80 }} value={relicForm.getValues().mainStatValue} />
              </Flex>
            </Flex>

            <div style={{ display: 'block', minWidth: 12 }} />

            <Flex direction="column" gap={5} style={{}}>
              <HeaderText>{t('Relic.Wearer') /* Equipped by */}</HeaderText>
              <Select
                searchable
                style={{ height: 35 }}
                data={characterOptions.map((opt) => ({ value: opt.value, label: opt.title ?? opt.value }))}
                renderOption={({ option }) => {
                  const match = characterOptions.find((o) => o.value === option.value)
                  return match?.label ?? option.label
                }}
                {...relicForm.getInputProps('equippedBy')}
              />

              <div
                style={{
                  height: 180,
                  overflow: 'hidden',
                  marginTop: 7,
                  borderRadius: 10,
                  boxShadow: `0px 0px 0px 1px ${theme.colors.dark[4]} inset`,
                }}
              >
                <img
                  style={{ width: '100%' }}
                  src={Assets.getCharacterPreviewById(equippedBy == 'None' ? '' : equippedBy)}
                />
              </div>
            </Flex>
          </Flex>

          <Flex gap={20}>
            <Flex direction="column" gap={5} style={{ width: '100%' }}>
              <Flex justify='space-between'>
                <HeaderText>{t('Relic.Substat') /* Substats */}</HeaderText>
                <Flex style={{ width: 180 }}>
                  <HeaderText>{t('Relic.Upgrades') /* Substat upgrades */}</HeaderText>
                </Flex>
              </Flex>

              <SubstatInput
                index={0}
                upgrades={upgradeValues}
                relicForm={relicForm}
                resetUpgradeValues={resetUpgradeValues}
                plusThree={plusThree}
              />

              <SubstatInput
                index={1}
                upgrades={upgradeValues}
                relicForm={relicForm}
                resetUpgradeValues={resetUpgradeValues}
                plusThree={plusThree}
              />

              <SubstatInput
                index={2}
                upgrades={upgradeValues}
                relicForm={relicForm}
                resetUpgradeValues={resetUpgradeValues}
                plusThree={plusThree}
              />

              <SubstatInput
                index={3}
                upgrades={upgradeValues}
                relicForm={relicForm}
                resetUpgradeValues={resetUpgradeValues}
                plusThree={plusThree}
              />
            </Flex>
          </Flex>
        </Flex>
        <Flex key='footer' justify={showLocator === SettingOptions.ShowLocatorInRelicsModal.Yes ? 'space-between' : 'flex-end'} style={{ marginTop: 16 }}>
          <Flex style={{ width: 298, paddingLeft: 1 }}>
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
      </Modal>
    </div>
  )
}
