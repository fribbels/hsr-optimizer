import {
  Drawer,
  Flex,
  Form,
  Select,
  Typography,
} from 'antd'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { SaveState } from 'lib/state/saveState'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  ReactNode,
  useEffect,
} from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { UserSettings } from 'types/store'

const { Text } = Typography

const defaultGap = 5

const SelectOptionWordWrap = styled.span`
    white-space: wrap !important;
    word-break: break-word !important;`

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
  RelicPotentialLoadBehavior: {
    name: 'RelicPotentialLoadBehavior',
    ScoreAtStartup: 'Score at startup',
    ManuallyClickReapplyScores: 'Manually click reapply scores',
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
} as const satisfies Record<keyof UserSettings, Record<string, string>>

export const DefaultSettingOptions: Record<keyof UserSettings, string> = {
  [SettingOptions.RelicEquippingBehavior.name]: SettingOptions.RelicEquippingBehavior.Replace,
  [SettingOptions.PermutationsSidebarBehavior.name]: SettingOptions.PermutationsSidebarBehavior.ShowXL,
  [SettingOptions.RelicPotentialLoadBehavior.name]: SettingOptions.RelicPotentialLoadBehavior.ScoreAtStartup,
  [SettingOptions.ExpandedInfoPanelPosition.name]: SettingOptions.ExpandedInfoPanelPosition.Below,
  [SettingOptions.ShowLocatorInRelicsModal.name]: SettingOptions.ShowLocatorInRelicsModal.No,
}

export const SettingsDrawer = () => {
  const [settingsForm] = Form.useForm()
  const { close: closeSettingsDrawer, isOpen: isOpenSettingsDrawer } = useOpenClose(OpenCloseIDs.SETTINGS_DRAWER)

  const settings = window.store((s) => s.settings)
  const setSettings = window.store((s) => s.setSettings)

  const { t } = useTranslation('settings')

  const optionsRelicEquippingBehavior = [
    {
      value: SettingOptions.RelicEquippingBehavior.Replace,
      label: <span>{t('RelicEquippingBehavior.Replace') /* Default: Replace relics without swapping */}</span>,
    },
    {
      value: SettingOptions.RelicEquippingBehavior.Swap,
      label: <span>{t('RelicEquippingBehavior.Swap') /* Swap relics with previous owner */}</span>,
    },
  ]

  const optionsPermutationsSidebarBehavior = [
    {
      value: SettingOptions.PermutationsSidebarBehavior.ShowXL,
      label: <span>{t('PermutationsSidebarBehavior.ShowXL') /* Default: Minimize if most of the sidebar is hidden */}</span>,
    },
    {
      value: SettingOptions.PermutationsSidebarBehavior.ShowXXL,
      label: <span>{t('PermutationsSidebarBehavior.ShowXXL') /* Minimize if any of the sidebar is hidden */}</span>,
    },
    {
      value: SettingOptions.PermutationsSidebarBehavior.NoShow,
      label: <span>{t('PermutationsSidebarBehavior.NoShow') /* Always keep the sidebar on the right */}</span>,
    },
  ]

  const optionsRelicPotentialLoadBehavior = [
    {
      value: SettingOptions.RelicPotentialLoadBehavior.ScoreAtStartup,
      label: <span>{t('RelicPotentialLoadBehavior.ScoreAtStartup') /* Default: Automatically score relics on page load */}</span>,
    },
    {
      value: SettingOptions.RelicPotentialLoadBehavior.ManuallyClickReapplyScores,
      label: (
        <span>{t('RelicPotentialLoadBehavior.ManuallyClickReapplyScores') /* Only score relics when \"Reapply scores\" is clicked (faster page load) */}</span>
      ),
    },
  ]

  const optionsExpandedInfoPanelPosition = [
    {
      value: SettingOptions.ExpandedInfoPanelPosition.Above,
      label: <span>{t('ExpandedInfoPanelPosition.Above') /* Show expanded info above relics preview */}</span>,
    },
    {
      value: SettingOptions.ExpandedInfoPanelPosition.Below,
      label: <span>{t('ExpandedInfoPanelPosition.Below') /* Default: Show expanded info below relics preview */}</span>,
    },
  ]

  const optionsShowLocatorInRelicsModal = [
    {
      value: SettingOptions.ShowLocatorInRelicsModal.No,
      label: <span>{t('ShowLocatorInRelicsModal.No') /* Default: Do not show the relic locator in the relic editor */}</span>,
    },
    {
      value: SettingOptions.ShowLocatorInRelicsModal.Yes,
      label: <span>{t('ShowLocatorInRelicsModal.Yes') /* Show the relic locator in the relic editor */}</span>,
    },
  ]

  const optionsMap: Record<keyof UserSettings, { value: string, label: ReactNode }[]> = {
    RelicEquippingBehavior: optionsRelicEquippingBehavior,
    PermutationsSidebarBehavior: optionsPermutationsSidebarBehavior,
    RelicPotentialLoadBehavior: optionsRelicPotentialLoadBehavior,
    ExpandedInfoPanelPosition: optionsExpandedInfoPanelPosition,
    ShowLocatorInRelicsModal: optionsShowLocatorInRelicsModal,
  }

  useEffect(() => {
    const initialSettings: UserSettings = TsUtils.clone(DefaultSettingOptions)
    const newSettings: UserSettings = Utils.mergeDefinedValues(initialSettings, settings)
    setSettings(newSettings)

    settingsForm.setFieldsValue(newSettings)
  }, [])

  const onValuesChange = (_changedValues: Partial<UserSettings>, allValues: UserSettings) => {
    setSettings(allValues)
    SaveState.delayedSave()
  }

  return (
    <Form
      form={settingsForm}
      onValuesChange={onValuesChange}
    >
      <Drawer
        title={t('Title')} /* 'Settings' */
        placement='right'
        onClose={closeSettingsDrawer}
        open={isOpenSettingsDrawer}
        width={900}
        forceRender
      >
        <Flex vertical gap={defaultGap}>
          {(Object.keys(SettingOptions) as (keyof typeof SettingOptions)[])
            .map((option) => (
              <Flex justify='space-between' align='center' key={option}>
                <Text>{t(`${option}.Label`)}</Text>
                <Form.Item name={SettingOptions[option].name}>
                  <Select
                    style={{ width: 500 }}
                    options={optionsMap[option]}
                    optionRender={(option) => <SelectOptionWordWrap>{option.label}</SelectOptionWordWrap>}
                  />
                </Form.Item>
              </Flex>
            ))}
        </Flex>
      </Drawer>
    </Form>
  )
}
