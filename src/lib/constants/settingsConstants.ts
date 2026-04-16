import { type UserSettings } from 'types/store'

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
    Hide: 'HideV2',
  },
} as const satisfies Record<keyof UserSettings, Record<string, string>>

export const DefaultSettingOptions: Record<keyof UserSettings, string> = {
  RelicEquippingBehavior: SettingOptions.RelicEquippingBehavior.Replace,
  PermutationsSidebarBehavior: SettingOptions.PermutationsSidebarBehavior.ShowXL,
  ExpandedInfoPanelPosition: SettingOptions.ExpandedInfoPanelPosition.Below,
  ShowLocatorInRelicsModal: SettingOptions.ShowLocatorInRelicsModal.No,
  ShowComboDmgWarning: SettingOptions.ShowComboDmgWarning.Show,
}
