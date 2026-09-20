import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import {
  ACTIONS_OPTIONS,
  ActionsStyle,
  resolveVariant,
  type TrialOption,
} from 'lib/tabs/tabTeamShowcase/layouts/trialStyles'
import {
  COLUMN_WIDTH_OPTIONS,
  ColumnWidth,
} from 'lib/tabs/tabTeamShowcase/trials/savedTeams/columnAxis'

/**
 * Trial selection shared by the showcase shell: where the actions go, and the saved-teams column's
 * footprint. It lives in a store rather than in props because the harness bar sits at the bottom of the
 * Teams panel while the title-bar slot belongs to its parent.
 *
 * Every axis module it reads is import-free, so nothing here can be caught in a temporal dead zone
 * while the store initialises.
 *
 * `titleBarSlot` is the element the Characters tab exposes beside its panel switch, for the actions
 * placement that portals the screenshot buttons up into the title row. Null while the roster is showing.
 */
export interface TrialSelection {
  actions: ActionsStyle
  width: ColumnWidth
}

interface TrialStore extends TrialSelection {
  titleBarSlot: HTMLElement | null
  setTrial: <Key extends keyof TrialSelection>(key: Key, value: TrialSelection[Key]) => void
  setTitleBarSlot: (element: HTMLElement | null) => void
}

const STORAGE_KEYS: Record<keyof TrialSelection, string> = {
  actions: 'teamShowcaseTrialActions',
  width: 'teamShowcaseTrialWidth',
}

function readStored<Value extends string>(
  key: keyof TrialSelection,
  options: TrialOption<Value>[],
  fallback: Value,
): Value {
  try {
    return resolveVariant(options, localStorage.getItem(STORAGE_KEYS[key]), fallback)
  } catch {
    return fallback
  }
}

function writeStored(key: keyof TrialSelection, value: string) {
  try {
    localStorage.setItem(STORAGE_KEYS[key], value)
  } catch {
    // Storage is a convenience only
  }
}

function selectionPatch<Key extends keyof TrialSelection>(key: Key, value: TrialSelection[Key]): Partial<TrialSelection> {
  const patch: Partial<TrialSelection> = {}
  patch[key] = value
  return patch
}

export const useTrialStore = createTabAwareStore<TrialStore>((set) => ({
  actions: readStored('actions', ACTIONS_OPTIONS, ActionsStyle.DOCK_ALL),
  width: readStored('width', COLUMN_WIDTH_OPTIONS, ColumnWidth.WIDE_TIGHT),
  titleBarSlot: null,

  setTrial: (key, value) => {
    writeStored(key, value)
    set(selectionPatch(key, value))
  },
  setTitleBarSlot: (element) => set((state) => (state.titleBarSlot === element ? state : { titleBarSlot: element })),
}))
