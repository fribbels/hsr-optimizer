/**
 * Trial harness axis for the screenshot and clear actions.
 *
 * This axis is collapsed: the user picked "Everything in the dock", so ACTIONS_OPTIONS lists only that
 * style and the harness bar hides the row. The other styles and their specs are kept because the shell
 * still renders every placement; re-adding an option line brings one back. Where the actions sit inside
 * the saved-teams column is the dock axis's business, not this file's.
 *
 * The saved-teams column's own axis lives beside the column itself, in trials/savedTeams/columnAxis.ts.
 *
 * This file has no imports on purpose. The trial store reads it while initialising, and a cycle through
 * a component would leave these constants in their temporal dead zone.
 */

export interface TrialOption<Value extends string> {
  value: Value
  label: string
}

// ---------------------------------------------------------------------------
// Actions axis: where and how Clear / Download / Copy appear
// ---------------------------------------------------------------------------

export enum ActionsStyle {
  HEADER_LEFT = 'headerLeft',
  HEADER_RIGHT = 'headerRight',
  HEADER_ICON_CLEAR = 'headerIconClear',
  HEADER_SPLIT = 'headerSplit',
  HEADER_ICONS = 'headerIcons',
  HEADER_GROUPED = 'headerGrouped',
  HEADER_SUBTLE = 'headerSubtle',
  DOCK_CLEAR = 'dockClear',
  DOCK_ALL = 'dockAll',
  TITLE_BAR = 'titleBar',
  TOOLBAR_TOP = 'toolbarTop',
  TOOLBAR_BOTTOM = 'toolbarBottom',
  SCRIM = 'scrim',
}

export enum ActionsPlacement {
  /** The 40px row above the columns */
  HEADER = 'header',
  /** Portalled into the Characters tab's title row, beside the panel switch */
  TITLE_BAR = 'titleBar',
  /** A strip inside the grid column, above the cards */
  TOOLBAR_TOP = 'toolbarTop',
  /** A strip inside the grid column, below the cards */
  TOOLBAR_BOTTOM = 'toolbarBottom',
  /** Floating over the bottom-right of the grid */
  SCRIM = 'scrim',
  /** Nothing in the shell; the saved-teams dock renders everything under Save */
  DOCK = 'dock',
}

export enum ActionsForm {
  /** Three labelled buttons, as today */
  BUTTONS = 'buttons',
  /** Clear as an icon button, a divider, then the two screenshot buttons */
  ICON_CLEAR = 'iconClear',
  /** Clear as an icon button, then one Screenshot button whose menu offers Copy and Download */
  SPLIT = 'split',
  /** Three icon buttons with tooltips */
  ICONS = 'icons',
  /** Three buttons in one attached group, all default variant */
  GROUPED = 'grouped',
  /** Three subtle buttons */
  SUBTLE = 'subtle',
  /** Small labelled buttons for the scrim */
  COMPACT = 'compact',
}

export enum ActionsAlign {
  LEFT = 'left',
  RIGHT = 'right',
}

export interface ActionsSpec {
  placement: ActionsPlacement
  form: ActionsForm
  align: ActionsAlign
  /** Clear leaves the shell and sits beside Save in the saved-teams dock */
  clearInDock: boolean
}

const ACTIONS_DEFAULTS: ActionsSpec = {
  placement: ActionsPlacement.HEADER,
  form: ActionsForm.BUTTONS,
  align: ActionsAlign.RIGHT,
  clearInDock: false,
}

export const ACTIONS_STYLE_SPECS: Record<ActionsStyle, ActionsSpec> = {
  [ActionsStyle.HEADER_LEFT]: { ...ACTIONS_DEFAULTS, align: ActionsAlign.LEFT },
  [ActionsStyle.HEADER_RIGHT]: ACTIONS_DEFAULTS,
  [ActionsStyle.HEADER_ICON_CLEAR]: { ...ACTIONS_DEFAULTS, form: ActionsForm.ICON_CLEAR },
  [ActionsStyle.HEADER_SPLIT]: { ...ACTIONS_DEFAULTS, form: ActionsForm.SPLIT },
  [ActionsStyle.HEADER_ICONS]: { ...ACTIONS_DEFAULTS, form: ActionsForm.ICONS },
  [ActionsStyle.HEADER_GROUPED]: { ...ACTIONS_DEFAULTS, form: ActionsForm.GROUPED },
  [ActionsStyle.HEADER_SUBTLE]: { ...ACTIONS_DEFAULTS, form: ActionsForm.SUBTLE },
  [ActionsStyle.DOCK_CLEAR]: { ...ACTIONS_DEFAULTS, clearInDock: true },
  [ActionsStyle.DOCK_ALL]: { ...ACTIONS_DEFAULTS, placement: ActionsPlacement.DOCK, clearInDock: true },
  [ActionsStyle.TITLE_BAR]: { ...ACTIONS_DEFAULTS, placement: ActionsPlacement.TITLE_BAR, form: ActionsForm.ICON_CLEAR },
  [ActionsStyle.TOOLBAR_TOP]: { ...ACTIONS_DEFAULTS, placement: ActionsPlacement.TOOLBAR_TOP, form: ActionsForm.ICON_CLEAR },
  [ActionsStyle.TOOLBAR_BOTTOM]: {
    ...ACTIONS_DEFAULTS,
    placement: ActionsPlacement.TOOLBAR_BOTTOM,
    form: ActionsForm.ICON_CLEAR,
  },
  [ActionsStyle.SCRIM]: { ...ACTIONS_DEFAULTS, placement: ActionsPlacement.SCRIM, form: ActionsForm.COMPACT },
}

export const ACTIONS_OPTIONS: TrialOption<ActionsStyle>[] = [
  { value: ActionsStyle.DOCK_ALL, label: 'Everything in the dock' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Narrows an arbitrary stored string to a registered option, falling back when it no longer exists. */
export function resolveVariant<Value extends string>(
  options: TrialOption<Value>[],
  stored: string | null,
  fallback: Value,
): Value {
  return options.find((option) => option.value === stored)?.value ?? fallback
}
