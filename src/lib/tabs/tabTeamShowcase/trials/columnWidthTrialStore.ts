import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import {
  COLUMN_WIDTH_OPTIONS,
  ColumnWidth,
} from 'lib/tabs/tabTeamShowcase/trials/columnWidthTrial'

interface ColumnWidthTrialStore {
  width: ColumnWidth
  setWidth: (width: ColumnWidth) => void
}

const STORAGE_KEY = 'teamShowcaseTrialWidth'

function readStoredWidth(): ColumnWidth {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return COLUMN_WIDTH_OPTIONS.find((option) => option.value === stored)?.value ?? ColumnWidth.WIDEST
  } catch {
    return ColumnWidth.WIDEST
  }
}

function writeStoredWidth(width: ColumnWidth) {
  try {
    localStorage.setItem(STORAGE_KEY, width)
  } catch {
    // Storage is a convenience only.
  }
}

export const useColumnWidthTrialStore = createTabAwareStore<ColumnWidthTrialStore>((set) => ({
  width: readStoredWidth(),
  setWidth: (width) => {
    writeStoredWidth(width)
    set({ width })
  },
}))
