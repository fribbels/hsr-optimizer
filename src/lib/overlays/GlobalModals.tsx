import { OpenCloseIDs } from 'lib/hooks/useOpenClose'
import { GettingStartedDrawer } from 'lib/overlays/drawers/GettingStartedDrawer'
import { SettingsDrawer } from 'lib/overlays/drawers/SettingsDrawer'
import { StatTracesDrawer } from 'lib/overlays/drawers/StatTracesDrawer'
import { BuildsModal } from 'lib/overlays/modals/BuildsModal'
import { ChangelogModal } from 'lib/overlays/modals/ChangelogModal'
import { CharacterModal } from 'lib/overlays/modals/CharacterModal'
import { RelicModal } from 'lib/overlays/modals/relicModal/RelicModal'
import { SaveBuildModal } from 'lib/overlays/modals/SaveBuildModal'
import { ScoringModal } from 'lib/overlays/modals/ScoringModal'
import { SwitchRelicsModal } from 'lib/overlays/modals/SwitchRelicsModal'
import { ComboDrawer } from 'lib/tabs/tabOptimizer/combo/ComboDrawer'
import { CombatBuffsDrawer } from 'lib/tabs/tabOptimizer/optimizerForm/components/CombatBuffsDrawer'
import { EnemyConfigurationsDrawer } from 'lib/tabs/tabOptimizer/optimizerForm/components/EnemyConfigurationsDrawer'
import { FormSetConditionals } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormSetConditionals'
import { RelicSetFilterModal } from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicSetFilterModal/RelicSetFilterModal'
import {
  ZeroPermutationsSuggestionsModal,
  ZeroResultSuggestionModal,
} from 'lib/tabs/tabOptimizer/OptimizerSuggestionsModal'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'

const defaultErrorRender = ({ error }: FallbackProps) => <div>Something went wrong: {error instanceof Error ? error.message : String(error)}</div>

export function GlobalModals() {
  return (
    <>
      {/* Drawers */}
      <SettingsDrawer />
      <GettingStartedDrawer />
      <StatTracesDrawer />
      <ComboDrawer />
      <CombatBuffsDrawer />
      <EnemyConfigurationsDrawer />
      <FormSetConditionals id={OpenCloseIDs.OPTIMIZER_SETS_DRAWER} />
      <FormSetConditionals id={OpenCloseIDs.BENCHMARKS_SETS_DRAWER} />
      {/* Modals */}
      <RelicSetFilterModal />
      <ErrorBoundary fallbackRender={defaultErrorRender}>
        <ScoringModal />
      </ErrorBoundary>
      <SwitchRelicsModal />
      <ZeroPermutationsSuggestionsModal />
      <ZeroResultSuggestionModal />
      <RelicModal />
      <BuildsModal />
      <ChangelogModal />
      <SaveBuildModal />
      <CharacterModal />
    </>
  )
}
