// Barrel re-export — all implementations live in dedicated files.
// This file exists so external callers don't need to update their imports.

export type {
  ComboConditionals,
  ComboConditionalCategory,
  ComboBooleanConditional,
  ComboNumberConditional,
  ComboSubNumberConditional,
  ComboSelectConditional,
  ComboSubSelectConditional,
  ComboCharacterMetadata,
  ComboCharacter,
  ComboTeammate,
  ComboState,
  SetConditionals,
  ComboDataKey,
  NestedObject,
} from './comboDrawerTypes'

export { COMBO_STATE_JSON_VERSION } from './comboDrawerTypes'

export {
  initializeComboState,
  generateConditionalResolverMetadata,
} from './comboDrawerInitializers'

export {
  locateComboCategory,
  locateActivationsDataKey,
  locateActivations,
  updateActivation,
  updatePartitionActivation,
  updateAddPartition,
  updateDeletePartition,
  updateSelectedSets,
  updateBooleanDefaultSelection,
  updateNumberDefaultSelection,
  updateAbilityRotation,
  updateFormState,
  updateConditionalChange,
} from './comboDrawerUpdaters'
