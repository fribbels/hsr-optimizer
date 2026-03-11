import { useForm } from '@mantine/form'
import { Drawer, Flex, Select, Text } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { SaveState } from 'lib/state/saveState'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  useEffect,
} from 'react'
import { useTranslation } from 'react-i18next'
import { UserSettings } from 'types/store'
import { useGlobalStore } from 'lib/stores/appStore'

const defaultGap = 5

const SelectOptionWordWrap = (props: React.ComponentPropsWithoutRef<'span'>) => (
  <span style={{ whiteSpace: 'wrap', wordBreak: 'break-word' }} {...props} />
)

export const SettingOptions = {
  RelicEquippingBehavior: {
    name: 'RelicEquippingBehavior',
    Swap: 'Swap',
    Replace: 'Replace',
  },
  PermutationsSidebarBehavior: {
    name: 'PermutationsSidebarBehavior',
    NoShow: 'Do Not Show',
    ShowXL: 'Show XL',
    ShowXXL: 'Show XXL',
  },
  ExpandedInfoPanelPosition: {
    name: 'ExpandedInfoPanelPosition',
    Above: 'Above',
    Below: 'Below',
  },
  ShowLocatorInRelicsModal: {
    name: 'ShowLocatorInRelicsModal',
    Yes: 'Yes',
    No: 'No',
  },
  ShowComboDmgWarning: {
    name: 'ShowComboDmgWarning',
    Show: 'Show',
    Hide: 'Hide',
  },
} as const satisfies Record<keyof UserSettings, Record<string, string>>

export const DefaultSettingOptions: Record<keyof UserSettings, string> = {
  [SettingOptions.RelicEquippingBehavior.name]: SettingOptions.RelicEquippingBehavior.Replace,
  [SettingOptions.PermutationsSidebarBehavior.name]: SettingOptions.PermutationsSidebarBehavior.ShowXL,
  [SettingOptions.ExpandedInfoPanelPosition.name]: SettingOptions.ExpandedInfoPanelPosition.Below,
  [SettingOptions.ShowLocatorInRelicsModal.name]: SettingOptions.ShowLocatorInRelicsModal.No,
  [SettingOptions.ShowComboDmgWarning.name]: SettingOptions.ShowComboDmgWarning.Show,
}

export const SettingsDrawer = () => {
  const setSettingsRef = useGlobalStore((s) => s.setSettings)
  const settingsForm = useForm<UserSettings>({
    onValuesChange: (values) => {
      setSettingsRef(values)
      SaveState.delayedSave()
    },
  })
  const { close: closeSettingsDrawer, isOpen: isOpenSettingsDrawer } = useOpenClose(OpenCloseIDs.SETTINGS_DRAWER)

  const settings = useGlobalStore((s) => s.settings)

  const { t } = useTranslation('settings')

  const optionsRelicEquippingBehavior = [
    {
      value: SettingOptions.RelicEquippingBehavior.Replace,
      label: t('RelicEquippingBehavior.Replace') /* Default: Replace relics without swapping */,
    },
    {
      value: SettingOptions.RelicEquippingBehavior.Swap,
      label: t('RelicEquippingBehavior.Swap') /* Swap relics with previous owner */,
    },
  ]

  const optionsPermutationsSidebarBehavior = [
    {
      value: SettingOptions.PermutationsSidebarBehavior.ShowXL,
      label: t('PermutationsSidebarBehavior.ShowXL') /* Default: Minimize if most of the sidebar is hidden */,
    },
    {
      value: SettingOptions.PermutationsSidebarBehavior.ShowXXL,
      label: t('PermutationsSidebarBehavior.ShowXXL') /* Minimize if any of the sidebar is hidden */,
    },
    {
      value: SettingOptions.PermutationsSidebarBehavior.NoShow,
      label: t('PermutationsSidebarBehavior.NoShow') /* Always keep the sidebar on the right */,
    },
  ]

  const optionsExpandedInfoPanelPosition = [
    {
      value: SettingOptions.ExpandedInfoPanelPosition.Above,
      label: t('ExpandedInfoPanelPosition.Above') /* Show expanded info above relics preview */,
    },
    {
      value: SettingOptions.ExpandedInfoPanelPosition.Below,
      label: t('ExpandedInfoPanelPosition.Below') /* Default: Show expanded info below relics preview */,
    },
  ]

  const optionsShowLocatorInRelicsModal = [
    {
      value: SettingOptions.ShowLocatorInRelicsModal.No,
      label: t('ShowLocatorInRelicsModal.No') /* Default: Do not show the relic locator in the relic editor */,
    },
    {
      value: SettingOptions.ShowLocatorInRelicsModal.Yes,
      label: t('ShowLocatorInRelicsModal.Yes') /* Show the relic locator in the relic editor */,
    },
  ]

  const optionsShowComboDmgWarning = [
    {
      value: SettingOptions.ShowComboDmgWarning.Show,
      label: t('ShowComboDmgWarning.Show') /* Default: Show warning */,
    },
    {
      value: SettingOptions.ShowComboDmgWarning.Hide,
      label: t('ShowComboDmgWarning.Hide') /* Hide warning */,
    },
  ]

  const optionsMap: Record<keyof UserSettings, { value: string, label: string }[]> = {
    RelicEquippingBehavior: optionsRelicEquippingBehavior,
    PermutationsSidebarBehavior: optionsPermutationsSidebarBehavior,
    ExpandedInfoPanelPosition: optionsExpandedInfoPanelPosition,
    ShowLocatorInRelicsModal: optionsShowLocatorInRelicsModal,
    ShowComboDmgWarning: optionsShowComboDmgWarning,
  }

  useEffect(() => {
    const initialSettings: UserSettings = TsUtils.clone(DefaultSettingOptions)
    const newSettings: UserSettings = Utils.mergeDefinedValues(initialSettings, settings)
    setSettingsRef(newSettings)

    settingsForm.setValues(newSettings)
  }, [isOpenSettingsDrawer])

  return (
    <Drawer
      title={t('Title')} /* 'Settings' */
      position='right'
      onClose={closeSettingsDrawer}
      opened={isOpenSettingsDrawer}
      size={900}
    >
      <Flex direction="column" gap={defaultGap}>
        {(Object.keys(SettingOptions) as (keyof typeof SettingOptions)[])
          .map((option) => (
            <Flex justify='space-between' align='center' key={option}>
              <Text>{t(`${option}.Label`)}</Text>
              <Select
                style={{ width: 500 }}
                data={optionsMap[option]}
                renderOption={({ option }) => <SelectOptionWordWrap>{option.label}</SelectOptionWordWrap>}
                {...settingsForm.getInputProps(SettingOptions[option].name)}
              />
            </Flex>
          ))}
      </Flex>
    </Drawer>
  )
}
