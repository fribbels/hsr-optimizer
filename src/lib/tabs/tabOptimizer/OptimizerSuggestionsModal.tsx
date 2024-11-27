import { Button, Flex, Modal, Typography } from 'antd'
import { TFunction } from 'i18next'
import { Parts } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { Optimizer } from 'lib/optimization/optimizer'
import DB, { AppPages } from 'lib/state/db'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { Utils } from 'lib/utils/utils'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'types/form'
import { Relic } from 'types/relic'

const { Text } = Typography

enum ZeroPermRootCause {
  IMPORT = 'IMPORT',
  BODY_MAIN = 'BODY_MAIN',
  FEET_MAIN = 'FEET_MAIN',
  PLANAR_SPHERE_MAIN = 'PLANAR_SPHERE_MAIN',
  LINK_ROPE_MAIN = 'LINK_ROPE_MAIN',
  RELIC_SETS = 'RELIC_SETS',
  ORNAMENT_SETS = 'ORNAMENT_SETS',
  KEEP_CURRENT = 'KEEP_CURRENT',
  PRIORITY = 'PRIORITY',
  EXCLUDE_ENABLED = 'EXCLUDE_ENABLED',
  EQUIPPED_DISABLED = 'EQUIPPED_DISABLED',
  MINIMUM_ROLLS = 'MINIMUM_ROLLS',
}

const ZeroPermRootCauseFixes: {
  [key in ZeroPermRootCause]: {
    descriptionKey: string
    buttonTextKey: string
    applyFix: () => void
    successMessageKey: string
  }
} = {
  [ZeroPermRootCause.IMPORT]: {
    descriptionKey: '0Perms.RootCauses.IMPORT.Description', // Import relics from your account on the Importer tab
    buttonTextKey: '0Perms.RootCauses.IMPORT.ButtonText', // Navigate to Importer tab
    applyFix: () => {
      window.store.getState().setActiveKey(AppPages.IMPORT)
      window.store.getState().setZeroPermutationsModalOpen(false)
    },
    successMessageKey: '0Perms.RootCauses.IMPORT.SuccessMessage',
    // Message.success('Choose an import method and import your relics and characters', 2)
  },
  [ZeroPermRootCause.BODY_MAIN]: mainStatFixes(Parts.Body),
  [ZeroPermRootCause.FEET_MAIN]: mainStatFixes(Parts.Feet),
  [ZeroPermRootCause.PLANAR_SPHERE_MAIN]: mainStatFixes(Parts.PlanarSphere),
  [ZeroPermRootCause.LINK_ROPE_MAIN]: mainStatFixes(Parts.LinkRope),
  [ZeroPermRootCause.RELIC_SETS]: {
    descriptionKey: '0Perms.RootCauses.RELIC_SETS.Description', // The selected relic set filters might be too restrictive
    buttonTextKey: '0Perms.RootCauses.RELIC_SETS.ButtonText', // Clear Relic set filters
    applyFix: () => {
      window.optimizerForm.setFieldValue('relicSets', [])
      // Message.success('Cleared relic set filters', 2)
    },
    successMessageKey: '0Perms.RootCauses.RELIC_SETS.SuccessMessage',
  },
  [ZeroPermRootCause.ORNAMENT_SETS]: {
    descriptionKey: '0Perms.RootCauses.ORNAMENT_SETS.Description', // 'The selected ornament set filters might be too restrictive',
    buttonTextKey: '0Perms.RootCauses.ORNAMENT_SETS.ButtonText', // 'Clear Ornament set filters',
    applyFix: () => {
      window.optimizerForm.setFieldValue('ornamentSets', [])
      // Message.success('Cleared ornament set filters', 2)
    },
    successMessageKey: '0Perms.RootCauses.ORNAMENT_SETS.SuccessMessage',
  },
  [ZeroPermRootCause.KEEP_CURRENT]: {
    descriptionKey: '0Perms.RootCauses.KEEP_CURRENT.Description', // 'The "Keep current relics" option is enabled, which forces any currently equipped relics on the character to be unchanged in the search',
    buttonTextKey: '0Perms.RootCauses.KEEP_CURRENT.ButtonText', // 'Disable "Keep current relics"',
    applyFix: () => {
      window.optimizerForm.setFieldValue('keepCurrentRelics', false)
      // Message.success('Disabled "Keep current relics"', 2)
    },
    successMessageKey: '0Perms.RootCauses.KEEP_CURRENT.SuccessMessage',
  },
  [ZeroPermRootCause.PRIORITY]: {
    descriptionKey: '0Perms.RootCauses.PRIORITY.Description', // 'The character is ranked below other characters on the priority list. When the "Character priority filter" is enabled, characters may only take lower priority characters\' relics',
    buttonTextKey: '0Perms.RootCauses.PRIORITY.ButtonText', // 'Move character to priority #1',
    applyFix: () => {
      DB.insertCharacter(window.store.getState().optimizerTabFocusCharacter!, 0)
      DB.refreshCharacters()
      // Message.success('Moved character to priority #1', 2)
    },
    successMessageKey: '0Perms.RootCauses.PRIORITY.SuccessMessage',
  },
  [ZeroPermRootCause.EXCLUDE_ENABLED]: {
    descriptionKey: '0Perms.RootCauses.EXCLUDE_ENABLED.Description', // 'The "Exclude" filter has some selected characters, which means this character cannot take relics from the selected characters',
    buttonTextKey: '0Perms.RootCauses.EXCLUDE_ENABLED.ButtonText', // 'Clear excluded characters',
    applyFix: () => {
      window.optimizerForm.setFieldValue('exclude', [])
      // Message.success('Cleared excluded characters', 2)
    },
    successMessageKey: '0Perms.RootCauses.EXCLUDE_ENABLED.SuccessMessage',
  },
  [ZeroPermRootCause.EQUIPPED_DISABLED]: {
    descriptionKey: '0Perms.RootCauses.EQUIPPED_DISABLED.Description', // 'The "Include equipped relics" filter is disabled, which means this character cannot take any relics belonging to other characters',
    buttonTextKey: '0Perms.RootCauses.EQUIPPED_DISABLED.ButtonText', // 'Enable "Include equipped relics"',
    applyFix: () => {
      window.optimizerForm.setFieldValue('includeEquippedRelics', true)
      // Message.success('Enabled "Include equipped relics"', 2)
    },
    successMessageKey: '0Perms.RootCauses.EQUIPPED_DISABLED.SuccessMessage',
  },
  [ZeroPermRootCause.MINIMUM_ROLLS]: {
    descriptionKey: '0Perms.RootCauses.MINIMUM_ROLLS.Description', // 'The substat weight filter has a minimum roll threshold that might be too high',
    buttonTextKey: '0Perms.RootCauses.MINIMUM_ROLLS.ButtonText', // 'Set minimum rolls to 0',
    applyFix: () => {
      window.optimizerForm.setFieldValue(['weights', 'headHands'], 0)
      window.optimizerForm.setFieldValue(['weights', 'bodyFeet'], 0)
      window.optimizerForm.setFieldValue(['weights', 'sphereRope'], 0)
      // Message.success('Set minimum rolls to 0', 2)
    },
    successMessageKey: '0Perms.RootCauses.MINIMUM_ROLLS.SuccessMessage',
  },
}

function mainStatFixes(part: Parts) {
  return {
    descriptionKey: `0Perms.RootCauses.${part}_MAIN.Description`, // `The main stat for the ${PartsToReadable[part]} filter might be too restrictive`,
    buttonTextKey: `0Perms.RootCauses.${part}_MAIN.ButtonText`, // `Clear ${PartsToReadable[part]} main stat filters`,
    applyFix: () => {
      window.optimizerForm.setFieldValue(`main${part}`, [])
    },
    successMessageKey: `0Perms.RootCauses.${part}_MAIN.SuccessMessage`,
    // Message.success(`Cleared ${PartsToReadable[part]} main stat filters`, 2)
  }
}

let rootCauses: (ZeroPermRootCause | ZeroResultRootCause)[] = []

// Generates the root causes of the issue before opening the modal
export function activateZeroPermutationsSuggestionsModal(request: Form) {
  rootCauses = []

  const [relics, preFilteredRelicsByPart] = Optimizer.getFilteredRelics(request) as [
    {
      Body: Relic[]
      Feet: Relic[]
      PlanarSphere: Relic[]
      LinkRope: Relic[]
      Head: Relic[]
      Hands: Relic[]
    },
    {
      Body: Relic[]
      Feet: Relic[]
      PlanarSphere: Relic[]
      LinkRope: Relic[]
      Head: Relic[]
      Hands: Relic[]
    },
  ]
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

  // I don't know what's wrong, default to import issue
  if (rootCauses.length == 0) {
    rootCauses.push(ZeroPermRootCause.IMPORT)
  }

  window.store.getState().setZeroPermutationsModalOpen(true)
}

function convertRootCauseToDisplay(rootCause: ZeroPermRootCause | ZeroResultRootCause, t: TFunction<'modals', undefined>): ReactElement {
  const fixes = (ZeroPermRootCauseFixes[rootCause as ZeroPermRootCause] || ZeroResultRootCauseFixes[rootCause as ZeroResultRootCause]) as {
    descriptionKey: string
    buttonTextKey: string
    applyFix: () => void
    successMessageKey: string
  }
  return (
    <Flex justify='space-between' align='center' style={{ height: 45 }} key={Utils.randomId()}>
      <Text style={{ width: 550 }}>
        {t(fixes.descriptionKey as never)}
      </Text>
      <Button
        onClick={() => {
          fixes.applyFix()
          window.onOptimizerFormValuesChange({} as Form, OptimizerTabController.getForm())
          Message.success(t(fixes.successMessageKey as never), 2)
        }}
        style={{ width: 250 }}
        type='primary'
      >
        {t(fixes.buttonTextKey as never)}
      </Button>
    </Flex>
  )
}

export function ZeroPermutationsSuggestionsModal() {
  const { t } = useTranslation('modals')
  const zeroPermutationModalOpen = window.store((s) => s.zeroPermutationModalOpen)
  const setZeroPermutationsModalOpen = window.store((s) => s.setZeroPermutationsModalOpen)

  // console.log('Suggestions root causes', rootCauses)

  const rootCauseDisplay: ReactElement[] = []
  for (const rootCause of rootCauses) {
    rootCauseDisplay.push(convertRootCauseToDisplay(rootCause, t))
  }

  return (
    <Modal
      title={t('0Perms.Title')/* Search generated 0 permutations */}
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
          {t('0Perms.Description')/* This means your filters are misconfigured or too restrictive, and no possibilities match the filters. Permutations are shown on the sidebar. */}
        </Text>
        <HorizontalDivider/>
        {rootCauseDisplay}
      </Flex>
    </Modal>
  )
}

enum ZeroResultRootCause {
  MIN_HP = 'MIN_HP',
  MAX_HP = 'MAX_HP',
  MIN_ATK = 'MIN_ATK',
  MAX_ATK = 'MAX_ATK',
  MIN_DEF = 'MIN_DEF',
  MAX_DEF = 'MAX_DEF',
  MIN_SPD = 'MIN_SPD',
  MAX_SPD = 'MAX_SPD',
  MIN_CR = 'MIN_CR',
  MAX_CR = 'MAX_CR',
  MIN_CD = 'MIN_CD',
  MAX_CD = 'MAX_CD',
  MIN_EHR = 'MIN_EHR',
  MAX_EHR = 'MAX_EHR',
  MIN_RES = 'MIN_RES',
  MAX_RES = 'MAX_RES',
  MIN_BE = 'MIN_BE',
  MAX_BE = 'MAX_BE',
  MIN_ERR = 'MIN_ERR',
  MAX_ERR = 'MAX_ERR',
  MIN_EHP = 'MIN_EHP',
  MAX_EHP = 'MAX_EHP',
  MIN_BASIC = 'MIN_BASIC',
  MAX_BASIC = 'MAX_BASIC',
  MIN_SKILL = 'MIN_SKILL',
  MAX_SKILL = 'MAX_SKILL',
  MIN_ULT = 'MIN_ULT',
  MAX_ULT = 'MAX_ULT',
  MIN_FUA = 'MIN_FUA',
  MAX_FUA = 'MAX_FUA',
  MIN_DOT = 'MIN_DOT',
  MAX_DOT = 'MAX_DOT',
  MIN_BREAK = 'MIN_BREAK',
  MAX_BREAK = 'MAX_BREAK',
  MIN_HEAL = 'MIN_HEAL',
  MAX_HEAL = 'MAX_HEAL',
  MIN_SHIELD = 'MIN_SHIELD',
  MAX_SHIELD = 'MAX_SHIELD',
  MIN_COMBO = 'MIN_COMBO',
  MAX_COMBO = 'MAX_COMBO',
  STAT_VIEW = 'STAT_VIEW',
}

const ZeroResultRootCauseFixes: {
  [key in ZeroResultRootCause]: {
    descriptionKey: string
    buttonTextKey: string
    applyFix: () => void
    successMessageKey: string
  }
} = {
  [ZeroResultRootCause.MAX_HP]: filterFixes(ZeroResultRootCause.MAX_HP),
  [ZeroResultRootCause.MIN_HP]: filterFixes(ZeroResultRootCause.MIN_HP),
  [ZeroResultRootCause.MAX_ATK]: filterFixes(ZeroResultRootCause.MAX_ATK),
  [ZeroResultRootCause.MIN_ATK]: filterFixes(ZeroResultRootCause.MIN_ATK),
  [ZeroResultRootCause.MAX_DEF]: filterFixes(ZeroResultRootCause.MAX_DEF),
  [ZeroResultRootCause.MIN_DEF]: filterFixes(ZeroResultRootCause.MIN_DEF),
  [ZeroResultRootCause.MAX_SPD]: filterFixes(ZeroResultRootCause.MAX_SPD),
  [ZeroResultRootCause.MIN_SPD]: filterFixes(ZeroResultRootCause.MIN_SPD),
  [ZeroResultRootCause.MAX_CR]: filterFixes(ZeroResultRootCause.MAX_CR),
  [ZeroResultRootCause.MIN_CR]: filterFixes(ZeroResultRootCause.MIN_CR),
  [ZeroResultRootCause.MAX_CD]: filterFixes(ZeroResultRootCause.MAX_CD),
  [ZeroResultRootCause.MIN_CD]: filterFixes(ZeroResultRootCause.MIN_CD),
  [ZeroResultRootCause.MAX_EHR]: filterFixes(ZeroResultRootCause.MAX_EHR),
  [ZeroResultRootCause.MIN_EHR]: filterFixes(ZeroResultRootCause.MIN_EHR),
  [ZeroResultRootCause.MAX_RES]: filterFixes(ZeroResultRootCause.MAX_RES),
  [ZeroResultRootCause.MIN_RES]: filterFixes(ZeroResultRootCause.MIN_RES),
  [ZeroResultRootCause.MAX_BE]: filterFixes(ZeroResultRootCause.MAX_BE),
  [ZeroResultRootCause.MIN_BE]: filterFixes(ZeroResultRootCause.MIN_BE),
  [ZeroResultRootCause.MAX_ERR]: filterFixes(ZeroResultRootCause.MAX_ERR),
  [ZeroResultRootCause.MIN_ERR]: filterFixes(ZeroResultRootCause.MIN_ERR),
  [ZeroResultRootCause.MAX_EHP]: filterFixes(ZeroResultRootCause.MAX_EHP),
  [ZeroResultRootCause.MIN_EHP]: filterFixes(ZeroResultRootCause.MIN_EHP),
  [ZeroResultRootCause.MAX_BASIC]: filterFixes(ZeroResultRootCause.MAX_BASIC),
  [ZeroResultRootCause.MIN_BASIC]: filterFixes(ZeroResultRootCause.MIN_BASIC),
  [ZeroResultRootCause.MAX_SKILL]: filterFixes(ZeroResultRootCause.MAX_SKILL),
  [ZeroResultRootCause.MIN_SKILL]: filterFixes(ZeroResultRootCause.MIN_SKILL),
  [ZeroResultRootCause.MAX_ULT]: filterFixes(ZeroResultRootCause.MAX_ULT),
  [ZeroResultRootCause.MIN_ULT]: filterFixes(ZeroResultRootCause.MIN_ULT),
  [ZeroResultRootCause.MAX_FUA]: filterFixes(ZeroResultRootCause.MAX_FUA),
  [ZeroResultRootCause.MIN_FUA]: filterFixes(ZeroResultRootCause.MIN_FUA),
  [ZeroResultRootCause.MAX_DOT]: filterFixes(ZeroResultRootCause.MAX_DOT),
  [ZeroResultRootCause.MIN_DOT]: filterFixes(ZeroResultRootCause.MIN_DOT),
  [ZeroResultRootCause.MAX_BREAK]: filterFixes(ZeroResultRootCause.MAX_BREAK),
  [ZeroResultRootCause.MIN_BREAK]: filterFixes(ZeroResultRootCause.MIN_BREAK),
  [ZeroResultRootCause.MAX_HEAL]: filterFixes(ZeroResultRootCause.MAX_HEAL),
  [ZeroResultRootCause.MIN_HEAL]: filterFixes(ZeroResultRootCause.MIN_HEAL),
  [ZeroResultRootCause.MAX_SHIELD]: filterFixes(ZeroResultRootCause.MAX_SHIELD),
  [ZeroResultRootCause.MIN_SHIELD]: filterFixes(ZeroResultRootCause.MIN_SHIELD),
  [ZeroResultRootCause.MAX_COMBO]: filterFixes(ZeroResultRootCause.MAX_COMBO),
  [ZeroResultRootCause.MIN_COMBO]: filterFixes(ZeroResultRootCause.MIN_COMBO),
  [ZeroResultRootCause.STAT_VIEW]: {
    descriptionKey: `0Results.RootCauses.StatView.Description`, // 'Your stat filters are configured for basic stats, which does not include buffs. '
    // + 'The Combat stats view will show buffed stats from abilities / teammates / relics / etc.',
    buttonTextKey: `0Results.RootCauses.StatView.ButtonText`, // 'Switch to Combat stats view',
    applyFix: () => {
      const setStatDisplay = window.store.getState().setStatDisplay
      setStatDisplay('combat')
      // Message.success(`Switched to Combat stats view`)
    },
    successMessageKey: '0Results.RootCauses.StatView.SuccessMessage',
  },
}

function filterFixes(filter: string) {
  const split = filter.split('_')
  const formAddress = split[0].toLowerCase() + split[1][0] + split[1].slice(1).toLowerCase()
  return {
    descriptionKey: `0Results.RootCauses.${filter}.Description`, // `The minimum/maximum {{field name}} may be too high/low`,
    buttonTextKey: `0Results.RootCauses.${filter}.ButtonText`, // `Reset min/max {{field name}} filter`,
    applyFix: () => {
      window.optimizerForm.setFieldValue(formAddress, undefined)
    },
    successMessageKey: `0Results.RootCauses.${filter}.SuccessMessage`,
    // Message.success(`Reset min/max {{field name}} filter`, 2)
  }
}

export function activateZeroResultSuggestionsModal(request: Form) {
  rootCauses = []
  // always suggest switching between combat/basic views
  if (window.store.getState().statDisplay == 'base') rootCauses.push(ZeroResultRootCause.STAT_VIEW)
  if (request.minHp) rootCauses.push(ZeroResultRootCause.MIN_HP)
  if (request.maxHp < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_HP)
  if (request.minAtk) rootCauses.push(ZeroResultRootCause.MIN_ATK)
  if (request.maxAtk < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_ATK)
  if (request.minDef) rootCauses.push(ZeroResultRootCause.MIN_DEF)
  if (request.maxDef < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_DEF)
  if (request.minSpd) rootCauses.push(ZeroResultRootCause.MIN_SPD)
  if (request.maxSpd < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_SPD)
  if (request.minCr) rootCauses.push(ZeroResultRootCause.MIN_CR)
  if (request.maxCr < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_CR)
  if (request.minCd) rootCauses.push(ZeroResultRootCause.MIN_CD)
  if (request.maxCd < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_CD)
  if (request.minEhr) rootCauses.push(ZeroResultRootCause.MIN_EHR)
  if (request.maxEhr < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_EHR)
  if (request.minRes) rootCauses.push(ZeroResultRootCause.MIN_RES)
  if (request.maxRes < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_RES)
  if (request.minBe) rootCauses.push(ZeroResultRootCause.MIN_BE)
  if (request.maxBe < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_BE)
  if (request.minErr) rootCauses.push(ZeroResultRootCause.MIN_ERR)
  if (request.maxErr < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_ERR)
  if (request.minEhp) rootCauses.push(ZeroResultRootCause.MIN_EHP)
  if (request.maxEhp < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_EHP)
  if (request.minBasic) rootCauses.push(ZeroResultRootCause.MIN_BASIC)
  if (request.maxBasic < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_BASIC)
  if (request.minSkill) rootCauses.push(ZeroResultRootCause.MIN_SKILL)
  if (request.maxSkill < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_SKILL)
  if (request.minUlt) rootCauses.push(ZeroResultRootCause.MIN_ULT)
  if (request.maxUlt < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_ULT)
  if (request.minFua) rootCauses.push(ZeroResultRootCause.MIN_FUA)
  if (request.maxFua < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_FUA)
  if (request.minDot) rootCauses.push(ZeroResultRootCause.MIN_DOT)
  if (request.maxDot < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_DOT)
  if (request.minBreak) rootCauses.push(ZeroResultRootCause.MIN_BREAK)
  if (request.maxBreak < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_BREAK)
  if (request.minHeal) rootCauses.push(ZeroResultRootCause.MIN_HEAL)
  if (request.maxHeal < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_HEAL)
  if (request.minShield) rootCauses.push(ZeroResultRootCause.MIN_SHIELD)
  if (request.maxShield < 2147483647) rootCauses.push(ZeroResultRootCause.MAX_SHIELD)

  window.store.getState().setZeroResultModalOpen(true)
}

export function ZeroResultSuggestionModal() {
  const zeroResultModalOpen = window.store((s) => s.zeroResultModalOpen)
  const setZeroResultModalOpen = window.store((s) => s.setZeroResultModalOpen)

  const { t } = useTranslation('modals')

  // console.log('Suggestions root causes', rootCauses)
  /*
   const rootCauseDisplay: ReactElement[] = []
   for (const rootCause of rootCauses) {
   rootCauseDisplay.push(convertRootCauseToDisplay(rootCause))
   }
   */
  const rootCauseDisplay: ReactElement[] = []
  for (const rootCause of rootCauses) {
    rootCauseDisplay.push(convertRootCauseToDisplay(rootCause, t))
  }

  return (
    <Modal
      title={t('0Results.Title')/* Search generated 0 results */}
      open={zeroResultModalOpen}
      width={900}
      destroyOnClose
      centered
      onOk={() => setZeroResultModalOpen(false)}
      onCancel={() => setZeroResultModalOpen(false)}
      footer={null}
    >
      <Flex vertical gap={15} style={{ marginBottom: 15 }}>
        <Flex justify='space-between' align='center' style={{ height: 45 }}>
          <Text>
            {t('0Results.ResetAll.Description')/* This means your stat and/or rating filters are too restrictive. */}
          </Text>
          <Button
            onClick={() => {
              for (const rootCause of rootCauses as ZeroResultRootCause[]) {
                if (rootCause == ZeroResultRootCause.STAT_VIEW) continue
                ZeroResultRootCauseFixes[rootCause].applyFix()
              }
              const setStatDisplay = window.store.getState().setStatDisplay
              setStatDisplay('combat')
              Message.success(t('0Results.ResetAll.SuccessMessage'))/* Cleared all filters */
              setZeroResultModalOpen(false)
            }}
            style={{ width: 250 }}
            type='primary'
          >
            {t('0Results.ResetAll.ButtonText')/* Reset all filters */}
          </Button>
        </Flex>
        <HorizontalDivider/>
        {rootCauseDisplay}
      </Flex>
    </Modal>
  )
}
