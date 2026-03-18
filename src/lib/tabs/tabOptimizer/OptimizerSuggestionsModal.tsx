import { Button, Flex, Modal } from '@mantine/core'
import type { TFunction } from 'i18next'
import {
  OpenCloseIDs,
  setOpen,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Message } from 'lib/interactions/message'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  detectZeroPermutationCauses,
  detectZeroResultCauses,
  type RootCauseFix,
  type ZeroPermRootCause,
  ZeroPermRootCauseFixes,
  ZeroResultRootCause,
  ZeroResultRootCauseFixes,
} from 'lib/tabs/tabOptimizer/suggestionsEngine'
import { HorizontalDivider } from 'lib/ui/Dividers'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import type { Form } from 'types/form'

// Module-level state shared between activate functions (called from non-React code)
// and modal components. This is intentional: the activate functions are invoked
// from optimizer workers/logic, not from React, so React state is not viable.
let rootCauses: (ZeroPermRootCause | ZeroResultRootCause)[] = []

/**
 * Detects root causes for zero permutations and opens the suggestions modal.
 */
export function activateZeroPermutationsSuggestionsModal(request: Form) {
  rootCauses = detectZeroPermutationCauses(request)
  setOpen(OpenCloseIDs.ZERO_PERMS_MODAL)
}

/**
 * Detects root causes for zero results and opens the suggestions modal.
 */
export function activateZeroResultSuggestionsModal(request: Form) {
  rootCauses = detectZeroResultCauses(request)
  setOpen(OpenCloseIDs.ZERO_RESULTS_MODAL)
}

function convertRootCauseToDisplay(rootCause: ZeroPermRootCause | ZeroResultRootCause, t: TFunction<'modals', undefined>): ReactElement {
  const fixes: RootCauseFix = ZeroPermRootCauseFixes[rootCause as ZeroPermRootCause] || ZeroResultRootCauseFixes[rootCause as ZeroResultRootCause]
  return (
    <Flex justify='space-between' align='center' h={45} key={rootCause} gap={10}>
      <div style={{ width: 550 }}>
        {t(fixes.descriptionKey)}
      </div>
      <Button
        onClick={() => {
          fixes.applyFix()
          Message.success(t(fixes.successMessageKey), 2)
        }}
        style={{ width: 350 }}
      >
        {t(fixes.buttonTextKey)}
      </Button>
    </Flex>
  )
}

export function ZeroPermutationsSuggestionsModal() {
  const { close: closeZeroPermsModal, isOpen: isOpenZeroPermsModal } = useOpenClose(OpenCloseIDs.ZERO_PERMS_MODAL)
  const { t } = useTranslation('modals')

  return (
    <Modal
      title={t('0Perms.Title') /* Search generated 0 permutations */}
      opened={isOpenZeroPermsModal}
      size={950}
      centered
      onClose={closeZeroPermsModal}
    >
      {isOpenZeroPermsModal && <ZeroPermutationsSuggestionsContent />}
    </Modal>
  )
}

function ZeroPermutationsSuggestionsContent() {
  const { t } = useTranslation('modals')
  const rootCauseDisplay = rootCauses.map((rootCause) => convertRootCauseToDisplay(rootCause, t))

  return (
    <Flex direction="column" gap={15} style={{ marginBottom: 15 }}>
      <div>
        {
          t(
            '0Perms.Description',
          ) /* This means your filters are misconfigured or too restrictive, and no possibilities match the filters. Permutations are shown on the sidebar. */
        }
      </div>
      <HorizontalDivider />
      {rootCauseDisplay}
    </Flex>
  )
}

export function ZeroResultSuggestionModal() {
  const { close: closeZeroResultsModal, isOpen: isOpenZeroResultsModal } = useOpenClose(OpenCloseIDs.ZERO_RESULTS_MODAL)
  const { t } = useTranslation('modals')

  return (
    <Modal
      title={t('0Results.Title') /* Search generated 0 results */}
      opened={isOpenZeroResultsModal}
      size={950}
      centered
      onClose={closeZeroResultsModal}
    >
      {isOpenZeroResultsModal && <ZeroResultSuggestionContent close={closeZeroResultsModal} />}
    </Modal>
  )
}

function ZeroResultSuggestionContent({ close: closeZeroResultsModal }: { close: () => void }) {
  const { t } = useTranslation('modals')
  const rootCauseDisplay = rootCauses.map((rootCause) => convertRootCauseToDisplay(rootCause, t))

  return (
    <Flex direction="column" gap={15} style={{ marginBottom: 15 }}>
      <Flex justify='space-between' align='center' h={45}>
        <div>
          {t('0Results.ResetAll.Description') /* This means your stat and/or rating filters are too restrictive. */}
        </div>
        <Button
          onClick={() => {
            for (const rootCause of rootCauses as ZeroResultRootCause[]) {
              if (rootCause === ZeroResultRootCause.STAT_VIEW) continue
              ZeroResultRootCauseFixes[rootCause].applyFix()
            }
            const setStatDisplay = useOptimizerRequestStore.getState().setStatDisplay
            setStatDisplay('combat')
            Message.success(t('0Results.ResetAll.SuccessMessage')) /* Cleared all filters */
            closeZeroResultsModal()
          }}
          style={{ width: 350 }}
        >
          {t('0Results.ResetAll.ButtonText') /* Reset all filters */}
        </Button>
      </Flex>
      <HorizontalDivider />
      {rootCauseDisplay}
    </Flex>
  )
}
