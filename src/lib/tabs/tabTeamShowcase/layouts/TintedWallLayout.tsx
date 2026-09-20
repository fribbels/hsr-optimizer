import type { TeamShowcaseLayoutProps } from 'lib/tabs/tabTeamShowcase/layouts/layoutTypes'
import { ShowcaseActions } from 'lib/tabs/tabTeamShowcase/layouts/ShowcaseActions'
import styles from 'lib/tabs/tabTeamShowcase/layouts/TintedWallLayout.module.css'
import { useTrialStore } from 'lib/tabs/tabTeamShowcase/layouts/trialStore'
import {
  ACTIONS_STYLE_SPECS,
  ActionsPlacement,
} from 'lib/tabs/tabTeamShowcase/layouts/trialStyles'
import { SlotCellOverlay } from 'lib/tabs/tabTeamShowcase/SlotCellOverlay'
import { SlotPickers } from 'lib/tabs/tabTeamShowcase/SlotPickers'
import { TeamCardGrid } from 'lib/tabs/tabTeamShowcase/TeamCardGrid'
import {
  DISPLAY_SCALE,
  GRID_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import { COLUMN_WIDTH_SPECS } from 'lib/tabs/tabTeamShowcase/trials/savedTeams/columnAxis'
import { SavedTeamsColumn } from 'lib/tabs/tabTeamShowcase/trials/savedTeams/SavedTeamsColumn'
import { useSlotInteractions } from 'lib/tabs/tabTeamShowcase/useSlotInteractions'
import { createPortal } from 'react-dom'
import { useShallow } from 'zustand/react/shallow'

const GRID_SCALE = DISPLAY_SCALE
/** The mat's band of inset background, and the edge drawn round it. Must match the CSS. */
const MAT_BAND = 8
const MAT_BORDER = 1
/** Everything the mat adds around the grid on one side */
const MAT_INSET = MAT_BAND + MAT_BORDER
/** The matted grid: 2210 x 0.6 + 2 x 9 = 1344px of the 1593px tab, leaving 249 for the column and its gap */
const MATTED_GRID_WIDTH = GRID_SIZE.width * GRID_SCALE + MAT_INSET * 2
/** The saved-teams column ends exactly at the mat's top and bottom edges: 1770 x 0.6 + 2 x 9 = 1080px */
const COLUMN_HEIGHT = GRID_SIZE.height * GRID_SCALE + MAT_INSET * 2

enum ToolbarPosition {
  NONE = 'none',
  TOP = 'top',
  BOTTOM = 'bottom',
}

const TOOLBAR_POSITION: Partial<Record<ActionsPlacement, ToolbarPosition>> = {
  [ActionsPlacement.TOOLBAR_TOP]: ToolbarPosition.TOP,
  [ActionsPlacement.TOOLBAR_BOTTOM]: ToolbarPosition.BOTTOM,
}

/**
 * The shell: screenshot actions, the saved-teams column on the left and the card grid beside it. The
 * card grid is fixed, because it is what the screenshot captures; it sits in a mat with the band outside
 * the capture. The saved-teams column is given a footprint from the width axis and left to lay out its
 * own insides. The actions axis decides where the actions go; it is currently pinned to the dock, which
 * means the column renders them and the shell renders none.
 */
export function TintedWallLayout({ state }: TeamShowcaseLayoutProps) {
  const {
    characters,
    slotScoring,
    setSlotScoringType,
    setSlot,
    reorderSlots,
    screenshotLoading,
  } = state
  const {
    actionsStyle,
    columnWidth,
    titleBarSlot,
  } = useTrialStore(useShallow((s) => ({
    actionsStyle: s.actions,
    columnWidth: s.width,
    titleBarSlot: s.titleBarSlot,
  })))

  const interactions = useSlotInteractions()
  /**
   * Revealing on drop hands the controls to the card that came to rest under the pointer. Without it they
   * stay with the slot the card left, and a cursor already sitting inside the destination never fires the
   * enter that would bring them back.
   */
  const { revealSlot } = interactions

  const footprint = COLUMN_WIDTH_SPECS[columnWidth]
  const actionsSpec = ACTIONS_STYLE_SPECS[actionsStyle]
  const toolbarPosition = TOOLBAR_POSITION[actionsSpec.placement] ?? ToolbarPosition.NONE

  const actions = actionsSpec.placement !== ActionsPlacement.DOCK && (
    <ShowcaseActions
      state={state}
      form={actionsSpec.form}
      includeClear={!actionsSpec.clearInDock}
      dense={toolbarPosition !== ToolbarPosition.NONE}
    />
  )

  return (
    <div className={styles.root} style={{ width: footprint.width + footprint.gap + MATTED_GRID_WIDTH }}>
      {actionsSpec.placement === ActionsPlacement.HEADER && (
        <header className={styles.header} data-align={actionsSpec.align}>
          {actions}
        </header>
      )}

      {actionsSpec.placement === ActionsPlacement.TITLE_BAR && titleBarSlot && createPortal(
        <div className={styles.titleBarActions}>{actions}</div>,
        titleBarSlot,
      )}

      <div className={styles.columns} data-toolbar={toolbarPosition} style={{ gap: footprint.gap }}>
        <SavedTeamsColumn state={state} width={footprint.width} height={COLUMN_HEIGHT} />

        <div className={styles.gridMat}>
          {toolbarPosition === ToolbarPosition.TOP && (
            <div className={styles.toolbar} data-position={toolbarPosition}>{actions}</div>
          )}

          <TeamCardGrid
            characters={characters}
            scale={GRID_SCALE}
            onSlotReorder={reorderSlots}
            onSlotDrop={revealSlot}
            renderSlotOverlay={(index, character) => (
              <SlotCellOverlay
                index={index}
                filled={character != null}
                interactions={interactions}
                scoring={slotScoring[index] ?? null}
                capturing={screenshotLoading}
                onScoringChange={(scoringType) => setSlotScoringType(index, scoringType)}
                onRemove={() => setSlot(index, null)}
              />
            )}
          />

          {toolbarPosition === ToolbarPosition.BOTTOM && (
            <div className={styles.toolbar} data-position={toolbarPosition}>{actions}</div>
          )}

          {actionsSpec.placement === ActionsPlacement.SCRIM && (
            <div className={styles.scrimActions}>{actions}</div>
          )}
        </div>
      </div>

      <SlotPickers state={state} interactions={interactions} />
    </div>
  )
}
