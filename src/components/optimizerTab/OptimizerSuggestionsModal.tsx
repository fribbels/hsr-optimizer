import { Button, Flex, Modal, Typography } from 'antd'
import { ReactElement } from 'react'
import { Optimizer } from 'lib/optimizer/optimizer.js'
import { HorizontalDivider } from 'components/Dividers.tsx'
import { Parts, PartsToReadable } from 'lib/constants.ts'
import DB, { AppPages } from 'lib/db.js'
import { Message } from 'lib/message.js'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import { Utils } from 'lib/utils.js'

const { Text } = Typography

enum ZeroPermRootCause {
  IMPORT = 'IMPORT', //
  BODY_MAIN = 'BODY_MAIN', //
  FEET_MAIN = 'FEET_MAIN', //
  PLANAR_SPHERE_MAIN = 'PLANAR_SPHERE_MAIN', //
  LINK_ROPE_MAIN = 'LINK_ROPE_MAIN', //
  RELIC_SETS = 'RELIC_SETS', //
  ORNAMENT_SETS = 'ORNAMENT_SETS', //
  KEEP_CURRENT = 'KEEP_CURRENT',
  PRIORITY = 'PRIORITY',
  EXCLUDE_ENABLED = 'EXCLUDE_ENABLED',
  EQUIPPED_DISABLED = 'EQUIPPED_DISABLED',
  MINIMUM_ROLLS = 'MINIMUM_ROLLS',
}

const RootCauseFixes: {
  [key in ZeroPermRootCause]: {
    description: string
    buttonText: string
    applyFix: () => void
  }
} = {
  [ZeroPermRootCause.IMPORT]: {
    description: 'Import relics from your account on the Importer tab',
    buttonText: 'Navigate to Importer tab',
    applyFix: () => {
      window.store.getState().setActiveKey(AppPages.IMPORT)
      window.store.getState().setZeroPermutationsModalOpen(false)
    },
  },
  [ZeroPermRootCause.BODY_MAIN]: mainStatFixes(Parts.Body),
  [ZeroPermRootCause.FEET_MAIN]: mainStatFixes(Parts.Feet),
  [ZeroPermRootCause.PLANAR_SPHERE_MAIN]: mainStatFixes(Parts.PlanarSphere),
  [ZeroPermRootCause.LINK_ROPE_MAIN]: mainStatFixes(Parts.LinkRope),
  [ZeroPermRootCause.RELIC_SETS]: {
    description: 'The selected relic set filters might be too restrictive',
    buttonText: 'Clear Relic set filters',
    applyFix: () => {
      window.optimizerForm.setFieldValue('relicSets', [])
      Message.success('Cleared relic set filters', 2)
    },
  },
  [ZeroPermRootCause.ORNAMENT_SETS]: {
    description: 'The selected ornament set filters might be too restrictive',
    buttonText: 'Clear Ornament set filters',
    applyFix: () => {
      window.optimizerForm.setFieldValue('ornamentSets', [])
      Message.success('Cleared ornament set filters', 2)
    },
  },
  [ZeroPermRootCause.KEEP_CURRENT]: {
    description: 'The "Keep current relics" option is enabled, which forces any currently equipped relics on the character to be unchanged in the search',
    buttonText: 'Disable "Keep current relics"',
    applyFix: () => {
      window.optimizerForm.setFieldValue('keepCurrentRelics', false)
      Message.success('Disabled "Keep current relics"', 2)
    },
  },
  [ZeroPermRootCause.PRIORITY]: {
    description: 'The character is ranked below other characters on the priority list. When the "Character priority filter" is enabled, characters may only take lower priority characters\' relics',
    buttonText: 'Move character to priority #1',
    applyFix: () => {
      DB.insertCharacter(window.store.getState().optimizerTabFocusCharacter, 0)
      DB.refreshCharacters()
      Message.success('Moved character to priority #1', 2)
    },
  },
  [ZeroPermRootCause.EXCLUDE_ENABLED]: {
    description: 'The "Exclude" filter has some selected characters, which means this character cannot take relics from the selected characters',
    buttonText: 'Clear excluded characters',
    applyFix: () => {
      window.optimizerForm.setFieldValue('exclude', [])
      Message.success('Cleared excluded characters', 2)
    },
  },
  [ZeroPermRootCause.EQUIPPED_DISABLED]: {
    description: 'The "Include equipped relics" filter is disabled, which means this character cannot take any relics beloning to other characters',
    buttonText: 'Enable "Include equipped relics"',
    applyFix: () => {
      window.optimizerForm.setFieldValue('includeEquippedRelics', true)
      Message.success('Enabled "Include equipped relics"', 2)
    },
  },
  [ZeroPermRootCause.MINIMUM_ROLLS]: {
    description: 'The substat weight filter has a minimum roll threshold that might be too high',
    buttonText: 'Set minimum rolls to 0',
    applyFix: () => {
      window.optimizerForm.setFieldValue(['weights', 'headHands'], 0)
      window.optimizerForm.setFieldValue(['weights', 'bodyFeet'], 0)
      window.optimizerForm.setFieldValue(['weights', 'sphereRope'], 0)
      Message.success('Set minimum rolls to 0', 2)
    },
  },
}

function mainStatFixes(part) {
  return {
    description: `The main stat for the ${PartsToReadable[part]} filter might be too restrictive`,
    buttonText: `Clear ${PartsToReadable[part]} main stat filters`,
    applyFix: () => {
      window.optimizerForm.setFieldValue(`main${part}`, [])
      Message.success(`Cleared ${PartsToReadable[part]} main stat filters`, 2)
    },
  }
}

let rootCauses: ZeroPermRootCause[] = []

// Generates the root causes of the issue before opening the modal
export function activateZeroPermutationsSuggestionsModal(request) {
  rootCauses = []

  const [relics, preFilteredRelicsByPart] = Optimizer.getFilteredRelics(request)
  const allRelics = DB.getRelics()

  // Debug util to show all causes
  // for (const x in ZeroPermRootCause) {
  //   rootCauses.push(ZeroPermRootCause[x as keyof typeof ZeroPermRootCause])
  // }

  // Zero relics overrides everything else
  if (allRelics.length == 0) {
    rootCauses.push(ZeroPermRootCause.IMPORT)
    window.store.getState().setZeroPermutationsModalOpen(true)
    return
  }

  // Main stats
  if (relics.Body.length == 0 && request.mainBody.length > 0 && preFilteredRelicsByPart.Body.length > 0) {
    rootCauses.push(ZeroPermRootCause.BODY_MAIN)
  }
  if (relics.Feet.length == 0 && request.mainFeet.length > 0 && preFilteredRelicsByPart.Feet.length > 0) {
    rootCauses.push(ZeroPermRootCause.FEET_MAIN)
  }
  if (relics.PlanarSphere.length == 0 && request.mainPlanarSphere.length > 0 && preFilteredRelicsByPart.PlanarSphere.length > 0) {
    rootCauses.push(ZeroPermRootCause.PLANAR_SPHERE_MAIN)
  }
  if (relics.LinkRope.length == 0 && request.mainLinkRope.length > 0 && preFilteredRelicsByPart.LinkRope.length > 0) {
    rootCauses.push(ZeroPermRootCause.LINK_ROPE_MAIN)
  }

  // Ornament sets
  if (relics.PlanarSphere.length == 0 || relics.LinkRope.length == 0) {
    if (request.ornamentSets.length > 0) {
      rootCauses.push(ZeroPermRootCause.ORNAMENT_SETS)
    }
  }

  // Relic sets
  if (relics.Head.length == 0 || relics.Hands.length == 0 || relics.Body.length == 0 || relics.Feet.length == 0) {
    if (request.relicSets.length > 0) {
      rootCauses.push(ZeroPermRootCause.RELIC_SETS)
    }
  }

  // Keep current
  if (request.keepCurrentRelics) {
    rootCauses.push(ZeroPermRootCause.KEEP_CURRENT)
  }

  // PRIORITY
  if (request.rank != 0) {
    rootCauses.push(ZeroPermRootCause.PRIORITY)
  }

  // EXCLUDE_ENABLED
  if (request.exclude.length > 0) {
    rootCauses.push(ZeroPermRootCause.EXCLUDE_ENABLED)
  }

  // EQUIPPED_DISABLED
  if (!request.includeEquippedRelics) {
    rootCauses.push(ZeroPermRootCause.EQUIPPED_DISABLED)
  }

  // MINIMUM_ROLLS
  if (request.weights.headHands > 0 || request.weights.bodyFeet > 0 || request.weights.sphereRope > 0) {
    rootCauses.push(ZeroPermRootCause.MINIMUM_ROLLS)
  }

  // I don't know whats wrong, default to import issue
  if (rootCauses.length == 0) {
    rootCauses.push(ZeroPermRootCause.IMPORT)
  }

  window.store.getState().setZeroPermutationsModalOpen(true)
}

function convertRootCauseToDisplay(rootCause: ZeroPermRootCause): ReactElement {
  const fixes = RootCauseFixes[rootCause]
  return (
    <Flex justify="space-between" align="center" style={{ height: 45 }} key={Utils.randomId()}>
      <Text style={{ width: 550 }}>
        {fixes.description}
      </Text>
      <Button
        onClick={() => {
          fixes.applyFix()
          window.onOptimizerFormValuesChange({}, OptimizerTabController.getForm())
        }}
        style={{ width: 250 }}
        type="primary"
      >
        {fixes.buttonText}
      </Button>
    </Flex>
  )
}

export function ZeroPermutationsSuggestionsModal() {
  const zeroPermutationModalOpen = window.store((s) => s.zeroPermutationModalOpen)
  const setZeroPermutationsModalOpen = window.store((s) => s.setZeroPermutationsModalOpen)

  console.log('Suggestions root causes', rootCauses)

  const rootCauseDisplay: ReactElement[] = []
  for (const rootCause of rootCauses) {
    rootCauseDisplay.push(convertRootCauseToDisplay(rootCause))
  }

  return (
    <Modal
      title="Search generated 0 permutations"
      open={zeroPermutationModalOpen}
      width={900}
      destroyOnClose
      centered
      onOk={() => setZeroPermutationsModalOpen(false)}
      onCancel={() => setZeroPermutationsModalOpen(false)}
      footer={null}
    >
      <Flex vertical gap={15} style={{ marginBottom: 15 }}>
        <Text>
          This means your filters are misconfigured or too restrictive, and no possibilities match the filters. Permutations are shown on the sidebar.
        </Text>
        <HorizontalDivider />
        {rootCauseDisplay}
      </Flex>
    </Modal>
  )
}
