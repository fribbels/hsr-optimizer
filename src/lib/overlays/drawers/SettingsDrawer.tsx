import { useForm } from '@mantine/form'
import { Drawer, Flex, Select } from '@mantine/core'
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

const SelectOptionWordWrap = (props: React.ComponentPropsWithoutRef<'span'>) => (
  <span style={{ whiteSpace: 'wrap', wordBreak: 'break-word' }} {...props} />
)

export const SettingOptions = {
  RelicEquippingBehavior: {
    name: 'RelicEquippingBehavior',
    Replace: 'Replace',
    Swap: 'Swap',
  },
  PermutationsSidebarBehavior: {
    name: 'PermutationsSidebarBehavior',
    ShowXL: 'Show XL',
    ShowXXL: 'Show XXL',
    NoShow: 'Do Not Show',
  },
  ExpandedInfoPanelPosition: {
    name: 'ExpandedInfoPanelPosition',
    Above: 'Above',
    Below: 'Below',
  },
  ShowLocatorInRelicsModal: {
    name: 'ShowLocatorInRelicsModal',
    No: 'No',
    Yes: 'Yes',
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

  const optionsMap = {} as Record<keyof UserSettings, { value: string; label: string }[]>
  for (const key of Object.keys(SettingOptions) as (keyof typeof SettingOptions)[]) {
    const group = SettingOptions[key]
    optionsMap[key] = Object.entries(group)
      .filter(([k]) => k !== 'name')
      .map(([optionKey, value]) => ({ value, label: t(`${key}.${optionKey}`) }))
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
      <Flex direction="column" gap={5}>
        {(Object.keys(SettingOptions) as (keyof typeof SettingOptions)[])
          .map((option) => (
            <Flex justify='space-between' align='center' key={option}>
              <div>{t(`${option}.Label`)}</div>
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
