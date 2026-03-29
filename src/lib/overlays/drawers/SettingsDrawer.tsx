import { useForm } from '@mantine/form'
import { Drawer, Flex, Select } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { SaveState } from 'lib/state/saveState'
import { clone, mergeDefinedValues } from 'lib/utils/objectUtils'
import {
  useEffect,
} from 'react'
import { useTranslation } from 'react-i18next'
import { type UserSettings } from 'types/store'
import { useGlobalStore } from 'lib/stores/app/appStore'

const SelectOptionWordWrap = (props: React.ComponentPropsWithoutRef<'span'>) => (
  <span style={{ whiteSpace: 'wrap', wordBreak: 'break-word' }} {...props} />
)

export const SettingOptions = {
  RelicEquippingBehavior: {
    Replace: 'Replace',
    Swap: 'Swap',
  },
  PermutationsSidebarBehavior: {
    ShowXL: 'Show XL',
    ShowXXL: 'Show XXL',
    NoShow: 'Do Not Show',
  },
  ExpandedInfoPanelPosition: {
    Above: 'Above',
    Below: 'Below',
  },
  ShowLocatorInRelicsModal: {
    No: 'No',
    Yes: 'Yes',
  },
  ShowComboDmgWarning: {
    Show: 'Show',
    Hide: 'Hide',
  },
} as const satisfies Record<keyof UserSettings, Record<string, string>>

export const DefaultSettingOptions: Record<keyof UserSettings, string> = {
  RelicEquippingBehavior: SettingOptions.RelicEquippingBehavior.Replace,
  PermutationsSidebarBehavior: SettingOptions.PermutationsSidebarBehavior.ShowXL,
  ExpandedInfoPanelPosition: SettingOptions.ExpandedInfoPanelPosition.Below,
  ShowLocatorInRelicsModal: SettingOptions.ShowLocatorInRelicsModal.No,
  ShowComboDmgWarning: SettingOptions.ShowComboDmgWarning.Show,
}

export function SettingsDrawer() {
  const { close: closeSettingsDrawer, isOpen: isOpenSettingsDrawer } = useOpenClose(OpenCloseIDs.SETTINGS_DRAWER)
  const { t } = useTranslation('settings')

  return (
    <Drawer
      title={t('Title')} /* 'Settings' */
      position='right'
      onClose={closeSettingsDrawer}
      opened={isOpenSettingsDrawer}
      size={900}
    >
      {isOpenSettingsDrawer && <SettingsDrawerContent />}
    </Drawer>
  )
}

function SettingsDrawerContent() {
  const setSettingsRef = useGlobalStore((s) => s.setSettings)
  const settings = useGlobalStore((s) => s.settings)
  const { t } = useTranslation('settings')

  const settingsForm = useForm<UserSettings>({
    onValuesChange: (values) => {
      setSettingsRef(values)
      SaveState.delayedSave()
    },
  })

  const optionsMap: Partial<Record<keyof UserSettings, { value: string; label: string }[]>> = {}
  for (const key of Object.keys(SettingOptions) as (keyof typeof SettingOptions)[]) {
    const group = SettingOptions[key]
    optionsMap[key] = Object.entries(group)
      .map(([optionKey, value]) => ({ value, label: t(`${key}.${optionKey}` as any) as string }))
  }

  useEffect(() => {
    const initialSettings: UserSettings = clone(DefaultSettingOptions)
    const newSettings: UserSettings = mergeDefinedValues(initialSettings, settings)
    setSettingsRef(newSettings)
    settingsForm.setValues(newSettings)
  }, [])

  return (
    <Flex direction="column" gap={10}>
      {(Object.keys(SettingOptions) as (keyof typeof SettingOptions)[])
        .map((option) => (
          <Flex justify='space-between' align='center' key={option}>
            <div>{t(`${option}.Label`)}</div>
            <Select
              style={{ width: 500 }}
              data={optionsMap[option]}
              renderOption={({ option }) => <SelectOptionWordWrap>{option.label}</SelectOptionWordWrap>}
              {...settingsForm.getInputProps(option)}
            />
          </Flex>
        ))}
    </Flex>
  )
}
