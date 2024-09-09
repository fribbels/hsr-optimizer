import changelogTab from '../../public/locales/en/changelogTab.json'
import charactersTab from '../../public/locales/en/charactersTab.json'
import common from '../../public/locales/en/common.json'
import gameData from '../../public/locales/en/gameData.json'
import getStartedTab from '../../public/locales/en/getStartedTab.json'
import importSaveTab from '../../public/locales/en/importSaveTab.json'
import relicScorerTab from '../../public/locales/en/relicScorerTab.json'
import relicsTab from '../../public/locales/en/relicsTab.json'
import sidebar from '../../public/locales/en/sidebar.json'
import modals from '../../public/locales/en/modals.json'
import hint from '../../public/locales/en/hint.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      changelogTab: typeof changelogTab
      charactersTab: typeof charactersTab
      common: typeof common
      gameData: typeof gameData
      getStartedTab: typeof getStartedTab
      importSaveTab: typeof importSaveTab
      relicScorerTab: typeof relicScorerTab
      relicsTab: typeof relicsTab
      sidebar: typeof sidebar
      modals: typeof modals
      hint: typeof hint
    }
  }
}
