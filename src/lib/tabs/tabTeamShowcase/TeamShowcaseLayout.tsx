import { SavedTeamsSidebar } from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsSidebar'
import { SlotCellOverlay } from 'lib/tabs/tabTeamShowcase/SlotCellOverlay'
import { SlotPicker } from 'lib/tabs/tabTeamShowcase/SlotPicker'
import { TeamCardGrid } from 'lib/tabs/tabTeamShowcase/TeamCardGrid'
import {
  DISPLAY_SCALE,
  GRID_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import styles from 'lib/tabs/tabTeamShowcase/TeamShowcaseLayout.module.css'
import type { TeamShowcaseState } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import { COLUMN_WIDTH_SPECS } from 'lib/tabs/tabTeamShowcase/trials/columnWidthTrial'
import { useColumnWidthTrialStore } from 'lib/tabs/tabTeamShowcase/trials/columnWidthTrialStore'
import { useSlotInteractions } from 'lib/tabs/tabTeamShowcase/useSlotInteractions'

const MAT_BAND = 8
const MAT_BORDER = 1
const MAT_INSET = MAT_BAND + MAT_BORDER
const MATTED_GRID_WIDTH = GRID_SIZE.width * DISPLAY_SCALE + MAT_INSET * 2
const SIDEBAR_HEIGHT = GRID_SIZE.height * DISPLAY_SCALE + MAT_INSET * 2

export function TeamShowcaseLayout({ state }: { state: TeamShowcaseState }) {
  const {
    characters,
    slots,
    optionFilter,
    slotScoring,
    setSlotScoringType,
    setSlot,
    reorderSlots,
    hasTeam,
    screenshotLoading,
    savedTeams,
    activeSavedTeamId,
    saveCurrentTeam,
    clearTeam,
    screenshot,
    loadSavedTeam,
    deleteSavedTeam,
    renameSavedTeam,
    moveSavedTeam,
  } = state
  const columnWidth = useColumnWidthTrialStore((s) => s.width)
  const interactions = useSlotInteractions()
  const footprint = COLUMN_WIDTH_SPECS[columnWidth]

  return (
    <div style={{ width: footprint.width + footprint.gap + MATTED_GRID_WIDTH }}>
      <div className={styles.columns} style={{ gap: footprint.gap }}>
        <SavedTeamsSidebar
          width={footprint.width}
          height={SIDEBAR_HEIGHT}
          hasTeam={hasTeam}
          screenshotLoading={screenshotLoading}
          savedTeams={savedTeams}
          activeSavedTeamId={activeSavedTeamId}
          saveCurrentTeam={saveCurrentTeam}
          clearTeam={clearTeam}
          screenshot={screenshot}
          loadSavedTeam={loadSavedTeam}
          deleteSavedTeam={deleteSavedTeam}
          renameSavedTeam={renameSavedTeam}
          moveSavedTeam={moveSavedTeam}
        />

        <div className={styles.gridMat}>
          <TeamCardGrid
            characters={characters}
            onSlotReorder={reorderSlots}
            onSlotDrop={interactions.revealSlot}
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
        </div>
      </div>

      <SlotPicker
        slots={slots}
        optionFilter={optionFilter}
        interactions={interactions}
        onSelect={setSlot}
      />
    </div>
  )
}
