import { SavedTeamsSidebar } from 'lib/tabs/tabTeamShowcase/savedTeams/SavedTeamsSidebar'
import { SlotCellOverlay } from 'lib/tabs/tabTeamShowcase/SlotCellOverlay'
import { SlotPicker } from 'lib/tabs/tabTeamShowcase/SlotPicker'
import { TeamCardGrid } from 'lib/tabs/tabTeamShowcase/TeamCardGrid'
import styles from 'lib/tabs/tabTeamShowcase/TeamShowcaseLayout.module.css'
import type { TeamShowcaseState } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import { useSlotInteractions } from 'lib/tabs/tabTeamShowcase/useSlotInteractions'

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
    activeScreenshotAction,
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
  const interactions = useSlotInteractions()

  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        <SavedTeamsSidebar
          hasTeam={hasTeam}
          activeScreenshotAction={activeScreenshotAction}
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
            interactionsEnabled={activeScreenshotAction == null}
            onSlotReorder={reorderSlots}
            onSlotDrop={interactions.revealSlot}
            renderSlotOverlay={(index, character) => (
              <SlotCellOverlay
                index={index}
                filled={character != null}
                interactions={interactions}
                scoring={slotScoring[index] ?? null}
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
