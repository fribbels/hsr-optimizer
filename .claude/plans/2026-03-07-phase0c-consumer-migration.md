# Phase 0c: Consumer Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all optimizer form consumers from antd Form reads/writes to Zustand store, so no code outside `OptimizerForm.tsx` touches `window.optimizerForm` directly.

**Architecture:** Three sub-phases: (C1) migrate all reads to Zustand selectors/getState, (C2) migrate all writes to store actions + antd dual-write, (C3) replace `onOptimizerFormValuesChange` with extracted functions. The antd `<AntDForm>` wrapper stays for UI rendering (removed in Phase 0d).

**Tech Stack:** TypeScript, Zustand, React, Vitest

**Key References:**
- Phase 0a store: `src/lib/stores/optimizerForm/useOptimizerFormStore.ts`
- Phase 0a conversions: `src/lib/stores/optimizerForm/optimizerFormConversions.ts`
- Phase 0a types: `src/lib/stores/optimizerForm/optimizerFormTypes.ts`
- Phase 0b sync: `src/lib/stores/optimizerForm/optimizerFormSync.ts`
- Old transform: `src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormTransform.ts`

---

## Conventions

- **Imports:** Use path aliases — `'lib/stores/optimizerForm/...'`
- **Tests:** Colocated `*.test.ts`, use `describe`/`it`/`expect` from `vitest`
- **Run tests:** `npm run vitest:fast`
- **Run typecheck:** `npm run typecheck:fast`
- **Activate Serena project** `hsr-optimizer` before using any Serena tools
- **Dual-write pattern:** When replacing a `setFieldValue`, call BOTH the store action AND `window.optimizerForm.setFieldValue(...)`. The form write keeps the `<AntDForm>` UI working. Phase 0d removes the form writes.

---

## Sub-phase C1: Migrate Reads

### Task 1: Add Combat Buff Conversion to displayToInternal

**Why:** `OptimizerTabController.getForm()` currently uses `displayToForm()` which converts percentage combat buffs (50 → 0.5). Our `displayToInternal()` passes them through. We need parity before pivoting `getForm()`.

**Files:**
- Modify: `src/lib/stores/optimizerForm/optimizerFormConversions.ts`
- Modify: `src/lib/stores/optimizerForm/optimizerFormConversions.test.ts`

#### Step 1: Add failing test

Add to `optimizerFormConversions.test.ts`, in the `displayToInternal` describe block:

```typescript
it('converts percentage combat buffs to internal format', () => {
  const state = createTestState({
    combatBuffs: { ATK: 100, ATK_P: 50, DEF_P: 25 },
  })

  const form = displayToInternal(state)

  // Flat buffs stay as-is
  expect(form.combatBuffs['ATK']).toBe(100)
  // Percentage buffs divided by 100
  expect(form.combatBuffs['ATK_P']).toBeCloseTo(0.5)
  expect(form.combatBuffs['DEF_P']).toBeCloseTo(0.25)
})

it('handles empty combat buffs', () => {
  const state = createTestState({ combatBuffs: {} })
  const form = displayToInternal(state)
  expect(form.combatBuffs).toEqual({})
})
```

**Note for executing agent:** Read the test file first to understand `createTestState` and the existing test structure. If `createTestState` doesn't accept `combatBuffs`, add it. Also check `CombatBuffs` from `lib/constants/constants` to see the exact keys and which have `percent: true`.

#### Step 2: Run test to verify it fails

Run: `npm run vitest:fast -- --reporter=verbose optimizerFormConversions`
Expected: FAIL — combat buff values not converted

#### Step 3: Add combat buff conversion to displayToInternal

In `optimizerFormConversions.ts`, import `CombatBuffs` and add conversion in `displayToInternal`:

```typescript
import { CombatBuffs, Constants } from 'lib/constants/constants'
```

In the `displayToInternal` function body, replace the combat buffs line:

```typescript
// Before:
combatBuffs: state.combatBuffs,

// After:
combatBuffs: convertCombatBuffsToInternal(state.combatBuffs),
```

Add the helper function:

```typescript
function convertCombatBuffsToInternal(buffs: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {}
  for (const buff of Object.values(CombatBuffs)) {
    const value = buffs[buff.key]
    if (value != null) {
      result[buff.key] = buff.percent ? value / 100 : value
    }
  }
  return result
}
```

#### Step 4: Run tests

Run: `npm run vitest:fast -- --reporter=verbose optimizerFormConversions`
Expected: PASS (if this test file has pre-existing failures due to circular deps, verify the NEW tests pass by checking the output)

#### Step 5: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 6: Commit

```bash
git add src/lib/stores/optimizerForm/optimizerFormConversions.ts src/lib/stores/optimizerForm/optimizerFormConversions.test.ts
git commit -m "feat(store): add combat buff conversion to displayToInternal (Phase 0c)"
```

---

### Task 2: Pivot getForm() to Read from Zustand Store

**Why:** `OptimizerTabController.getForm()` has 21 callers. Changing its implementation migrates all of them at once.

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerTabController.ts`

#### Step 1: Read the file

Read `optimizerTabController.ts` to understand all imports and the `getForm` implementation (line ~112-115).

#### Step 2: Change getForm implementation

Replace the `getForm` method:

```typescript
// Before:
getForm: () => {
  const form = window.optimizerForm.getFieldsValue()
  return OptimizerTabController.displayToForm(form)
},

// After:
getForm: () => {
  return displayToInternal(useOptimizerFormStore.getState())
},
```

Add the import at the top:

```typescript
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
```

**Important:** This is a lazy import concern — `optimizerTabController.ts` already imports `db.ts` which has a lazy import of `optimizerFormSync`. Importing `useOptimizerFormStore` directly should be fine since the circular dependency goes through `db.ts`, not through `optimizerTabController.ts`. But verify by running typecheck + tests.

**Also important:** The old `displayToForm()` is still used by `formToDisplay()` callers and by `displayToForm()` callers elsewhere. Do NOT remove it yet. Only change `getForm()`.

#### Step 3: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 4: Run tests

Run: `npm run vitest:fast`
Expected: Same pass/fail count as before (no regressions)

#### Step 5: Commit

```bash
git add src/lib/tabs/tabOptimizer/optimizerTabController.ts
git commit -m "feat(store): pivot getForm() to read from Zustand store (Phase 0c)"
```

---

### Task 3: Replace Form.useWatch with Zustand Selectors

**Why:** ~20 `Form.useWatch` calls on `window.optimizerForm` across 8 files need to read from the Zustand store instead.

**Files to modify:**
1. `src/lib/tabs/tabOptimizer/optimizerForm/OptimizerForm.tsx` (5 usages)
2. `src/lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard.tsx` (4 usages)
3. `src/lib/tabs/tabOptimizer/optimizerForm/components/ComboFilter.tsx` (6 usages)
4. `src/lib/tabs/tabOptimizer/optimizerForm/components/AdvancedOptionsPanel.tsx` (1 usage)
5. `src/lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay.tsx` (1 usage)
6. `src/lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelectorDisplay.tsx` (1 usage)
7. `src/lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector.tsx` (4 usages)
8. `src/lib/tabs/tabOptimizer/analysis/ExpandedDataPanel.tsx` (2 usages)

**Do NOT modify:**
- `src/lib/overlays/modals/RelicModal.tsx` — uses its own `relicForm`, not `window.optimizerForm`
- `src/lib/tabs/tabBenchmarks/BenchmarksTab.tsx` — uses its own `form`, not `window.optimizerForm`

#### Step 1: Replace in OptimizerForm.tsx

The file has wrapper components that use `Form.useWatch`:

```typescript
// CharacterConditionalDisplayWrapper (lines ~271-272)
// Before:
const charId = AntDForm.useWatch(['characterId'], window.optimizerForm)
const eidolon = AntDForm.useWatch(['characterEidolon'], window.optimizerForm)

// After:
const charId = useOptimizerFormStore((s) => s.characterId)
const eidolon = useOptimizerFormStore((s) => s.characterEidolon)

// LightConeConditionalDisplayWrapper (lines ~284-286)
// Before:
const lcId = AntDForm.useWatch('lightCone', window.optimizerForm)
const superimposition = AntDForm.useWatch('lightConeSuperimposition', window.optimizerForm)
const charId = AntDForm.useWatch('characterId', window.optimizerForm)

// After:
const lcId = useOptimizerFormStore((s) => s.lightCone)
const superimposition = useOptimizerFormStore((s) => s.lightConeSuperimposition)
const charId = useOptimizerFormStore((s) => s.characterId)
```

Add import: `import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'`

#### Step 2: Replace in TeammateCard.tsx

```typescript
// Before (lines ~205-209):
const teammateCharacterId: CharacterId = AntDForm.useWatch([teammateProperty, 'characterId'], window.optimizerForm)
const teammateEidolon: number = AntDForm.useWatch([teammateProperty, 'characterEidolon'], window.optimizerForm)
const teammateLightConeId: LightConeId = AntDForm.useWatch([teammateProperty, 'lightCone'], window.optimizerForm)
const teammateSuperimposition: SuperImpositionLevel = AntDForm.useWatch([teammateProperty, 'lightConeSuperimposition'], window.optimizerForm)

// After:
const teammateCharacterId = useOptimizerFormStore((s) => s.teammates[props.index as 0 | 1 | 2].characterId) as CharacterId
const teammateEidolon = useOptimizerFormStore((s) => s.teammates[props.index as 0 | 1 | 2].characterEidolon)
const teammateLightConeId = useOptimizerFormStore((s) => s.teammates[props.index as 0 | 1 | 2].lightCone) as LightConeId
const teammateSuperimposition = useOptimizerFormStore((s) => s.teammates[props.index as 0 | 1 | 2].lightConeSuperimposition) as SuperImpositionLevel
```

Add import: `import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'`

**Note:** `props.index` is a `number`. Cast to `0 | 1 | 2` for the tuple index. The `teammateProperty` variable (e.g. `'teammate0'`) is no longer needed for reads but is still needed for antd Form writes in `updateTeammate`. Keep it.

#### Step 3: Replace in ComboFilter.tsx

Read the file first. It has two components with `Form.useWatch`:

```typescript
// In both ComboFilter and TurnAbilityFilter components:
// Before:
const comboType = Form.useWatch('comboType', form)
const characterId = Form.useWatch('characterId', form)
const characterEidolon = Form.useWatch('characterEidolon', form)

// After:
const comboType = useOptimizerFormStore((s) => s.comboType)
const characterId = useOptimizerFormStore((s) => s.characterId)
const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
```

**Important:** Check if the `form` variable is `window.optimizerForm` or a local form instance. Only replace if it's `window.optimizerForm`. The components receive `formInstance` as a prop — read the file to confirm it's `window.optimizerForm`.

#### Step 4: Replace in remaining components

**AdvancedOptionsPanel.tsx:**
```typescript
// Before:
const formCombatBuffs = Form.useWatch((values: OptimizerForm) => values.combatBuffs, window.optimizerForm)

// After:
const formCombatBuffs = useOptimizerFormStore((s) => s.combatBuffs)
```

**StatSimulationDisplay.tsx:**
```typescript
// Before:
const statSimFormValues = AntDForm.useWatch((values: Form) => values.statSim, window.optimizerForm)

// After:
const statSimFormValues = useOptimizerFormStore((s) => s.statSim)
```

**CharacterSelectorDisplay.tsx:**
```typescript
// Before:
const characterEidolon = Form.useWatch('characterEidolon', form)

// After:
const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
```
**Note:** Read the file first — `form` might be a prop. Only replace if it references `window.optimizerForm`.

**TurnAbilitySelector.tsx:**
```typescript
// Before (in both components):
const characterId = Form.useWatch('characterId', form)
const characterEidolon = Form.useWatch('characterEidolon', form)

// After:
const characterId = useOptimizerFormStore((s) => s.characterId)
const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
```
**Note:** Same as above — verify `form` is `window.optimizerForm`.

**ExpandedDataPanel.tsx:**
```typescript
// Before:
const characterId = AntDForm.useWatch(['characterId'], window.optimizerForm)
const lightConeId = AntDForm.useWatch(['lightCone'], window.optimizerForm)

// After:
const characterId = useOptimizerFormStore((s) => s.characterId)
const lightConeId = useOptimizerFormStore((s) => s.lightCone)
```

#### Step 5: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 6: Commit

```bash
git add -A
git commit -m "feat(store): replace Form.useWatch with Zustand selectors (Phase 0c)"
```

---

### Task 4: Replace Remaining getFieldValue Calls

**Files:**
1. `src/lib/tabs/tabOptimizer/conditionals/FormSlider.tsx` — `getFieldValue`
2. `src/lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay.tsx` — `getFieldValue`
3. `src/lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard.tsx` — `getFieldsValue`
4. `src/lib/simulations/statSimulationController.tsx` — `getFieldsValue`

**Do NOT modify:**
- `db.ts` and `comboDrawerController.tsx` — their `getFieldsValue()` calls are inside `syncFormToStore()` (Phase 0b), keep as-is.
- `optimizerTabController.ts` — already migrated in Task 2.

#### Step 1: Replace in FormSlider.tsx

Read the file first. Around line 61:

```typescript
// Before:
const fieldValue = window.optimizerForm.getFieldValue(itemName)

// After:
const state = useOptimizerFormStore.getState()
// itemName is a path like 'characterConditionals' or ['teammate0', 'characterConditionals']
// Need to resolve the path from the store
```

**Implementation note:** `itemName` in FormSlider is an antd FieldNamePath. It could be a string like `'characterConditionals'` or an array. Read the file carefully to understand what values `itemName` takes and map to the correct store field. This may require a helper function.

**If itemName is always a top-level key:** `useOptimizerFormStore.getState()[itemName as keyof OptimizerFormState]`

**If itemName is a nested path (teammate conditionals):** Need to resolve the path. Read the callers of FormSlider to understand what `itemName` values are passed.

#### Step 2: Replace in LightConeConditionalDisplay.tsx

Around lines 31-33:

```typescript
// Before:
? window.optimizerForm.getFieldValue('characterId')
: window.optimizerForm.getFieldValue(`teammate${teammateIndex as 0 | 1 | 2}`)?.characterId

// After (for main character):
? useOptimizerFormStore.getState().characterId
// After (for teammate):
: useOptimizerFormStore.getState().teammates[teammateIndex as 0 | 1 | 2].characterId
```

#### Step 3: Replace in TeammateCard.tsx countTeammates

Around line 169:

```typescript
// Before:
function countTeammates() {
  const fieldsValue = window.optimizerForm.getFieldsValue()
  return [fieldsValue.teammate0, fieldsValue.teammate1, fieldsValue.teammate2].filter((teammate) => teammate?.characterId).length
}

// After:
function countTeammates() {
  const state = useOptimizerFormStore.getState()
  return state.teammates.filter((teammate) => teammate?.characterId).length
}
```

#### Step 4: Replace in statSimulationController.tsx

Around line 51:

```typescript
// Before:
const form: Form = window.optimizerForm.getFieldsValue()

// After:
const form: Form = displayToInternal(useOptimizerFormStore.getState())
```

Add imports for `displayToInternal` and `useOptimizerFormStore`.

**Note:** This returns INTERNAL format (Form type), which is what the old `getFieldsValue()` + downstream processing expected. Actually, wait — `getFieldsValue()` returns DISPLAY format (what antd holds). Read the calling code to see if it expects display or internal format. If it expects display format, use `useOptimizerFormStore.getState()` and adapt. If it just needs the characterId/lightCone, access those directly.

#### Step 5: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 6: Commit

```bash
git add -A
git commit -m "feat(store): replace getFieldValue/getFieldsValue with store reads (Phase 0c)"
```

---

## Sub-phase C2: Migrate Writes

### Task 5: Replace setFieldValue in OptimizerForm.tsx

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerForm/OptimizerForm.tsx`

#### Step 1: Read the file and find setFieldValue

There's one `setFieldValue` in `LightConeConditionalDisplayWrapper` (line ~303):

```typescript
// Before:
window.optimizerForm.setFieldValue('lightConeConditionals', defaults)

// After (dual-write):
useOptimizerFormStore.getState().setLightConeConditionals(defaults)
window.optimizerForm.setFieldValue('lightConeConditionals', defaults)
```

#### Step 2: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 3: Commit

```bash
git add src/lib/tabs/tabOptimizer/optimizerForm/OptimizerForm.tsx
git commit -m "feat(store): dual-write setFieldValue in OptimizerForm.tsx (Phase 0c)"
```

---

### Task 6: Replace setFieldValue in OptimizerSuggestionsModal

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/OptimizerSuggestionsModal.tsx`

#### Step 1: Read the file

Find all `setFieldValue` calls (~8 usages around lines 62-130, plus line 402).

#### Step 2: Apply dual-write pattern

For each `setFieldValue`, add the corresponding store action BEFORE the form write:

```typescript
// Line ~62: relicSets
useOptimizerFormStore.getState().setRelicSets([])
window.optimizerForm.setFieldValue('relicSets', [])

// Line ~71: ornamentSets
useOptimizerFormStore.getState().setOrnamentSets([])
window.optimizerForm.setFieldValue('ornamentSets', [])

// Line ~80: keepCurrentRelics
useOptimizerFormStore.getState().setRelicFilterField('keepCurrentRelics', false)
window.optimizerForm.setFieldValue('keepCurrentRelics', false)

// Line ~98: exclude
useOptimizerFormStore.getState().setRelicFilterField('exclude', [])
window.optimizerForm.setFieldValue('exclude', [])

// Line ~107: includeEquippedRelics
useOptimizerFormStore.getState().setRelicFilterField('includeEquippedRelics', true)
window.optimizerForm.setFieldValue('includeEquippedRelics', true)

// Lines ~116-118: weights
useOptimizerFormStore.getState().setWeight('headHands', 0)
useOptimizerFormStore.getState().setWeight('bodyFeet', 0)
useOptimizerFormStore.getState().setWeight('sphereRope', 0)
window.optimizerForm.setFieldValue(['weights', 'headHands'], 0)
window.optimizerForm.setFieldValue(['weights', 'bodyFeet'], 0)
window.optimizerForm.setFieldValue(['weights', 'sphereRope'], 0)

// Line ~130: mainStats
useOptimizerFormStore.getState().setMainStats(`main${part}` as MainStatPart, [])
window.optimizerForm.setFieldValue(`main${part}`, [])

// Line ~402: dynamic field
// This sets arbitrary form fields to undefined. Read the context to determine which store action to use.
// May need a generic approach or case-by-case handling.
```

Add import: `import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'`

**Note for executing agent:** Read the file thoroughly. The line ~402 `setFieldValue` sets a dynamic `formAddress` field. Check what `formAddress` values are possible and map to store actions. It may be stat filters or rating filters being cleared.

#### Step 3: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 4: Commit

```bash
git add src/lib/tabs/tabOptimizer/OptimizerSuggestionsModal.tsx
git commit -m "feat(store): dual-write setFieldValue in OptimizerSuggestionsModal (Phase 0c)"
```

---

### Task 7: Replace setFieldValue in TeammateCard

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard.tsx`

#### Step 1: Read the updateTeammate function

The `updateTeammate` function (lines ~388-442) has 5 `setFieldValue` calls in different branches. Each sets teammate-related fields.

#### Step 2: Apply dual-write pattern

For each branch in `updateTeammate`:

```typescript
// Branch: updatedTeammate.lightCone (line ~404)
// Before:
window.optimizerForm.setFieldValue([property, 'lightConeConditionals'], mergedConditionals)
// After:
useOptimizerFormStore.getState().setTeammateField(props.index as 0|1|2, 'lightConeConditionals', mergedConditionals)
window.optimizerForm.setFieldValue([property, 'lightConeConditionals'], mergedConditionals)

// Branch: updatedTeammate.characterId (line ~435)
// Before:
window.optimizerForm.setFieldValue(property, teammateValues)
// After (set all teammate fields at once):
// This is complex — teammateValues is a full Teammate object. Need to sync the whole teammate.
// Use syncFormToStore after the form write:
window.optimizerForm.setFieldValue(property, teammateValues)
syncFormToStore(window.optimizerForm.getFieldsValue())

// Branch: characterId === null (line ~437) — clear teammate
// Before:
window.optimizerForm.setFieldValue(property, getDefaultTeammateForm())
// After:
useOptimizerFormStore.getState().clearTeammate(props.index as 0|1|2)
window.optimizerForm.setFieldValue(property, getDefaultTeammateForm())

// Branch: lightCone === null (lines ~439-440) — clear LC
// Before:
window.optimizerForm.setFieldValue([property, 'lightConeConditionals'], {})
window.optimizerForm.setFieldValue([property, 'lightConeSuperimposition'], 1)
// After:
useOptimizerFormStore.getState().clearTeammateLightCone(props.index as 0|1|2)
window.optimizerForm.setFieldValue([property, 'lightConeConditionals'], {})
window.optimizerForm.setFieldValue([property, 'lightConeSuperimposition'], 1)
```

**Note:** The `updatedTeammate.characterId` branch sets a complex Teammate object with many fields. Rather than mapping each field individually, use `syncFormToStore` after the form write to keep the store in sync. This is simpler and correct.

**Note:** The `updateTeammate` function receives `props.index` but it's defined at module level, not inside the component. Read the file carefully — it may use `changedValues` to determine the index. The teammate index needs to be extracted from the `property` string (e.g., `'teammate0'` → `0`).

#### Step 3: Run typecheck + tests

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 4: Commit

```bash
git add src/lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard.tsx
git commit -m "feat(store): dual-write setFieldValue in TeammateCard (Phase 0c)"
```

---

### Task 8: Replace setFieldValue in optimizerTabController

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerTabController.ts`

#### Step 1: Read the relevant functions

Three `setFieldValue`/`setFieldsValue` calls:

1. `resetFilters` (line ~403): `window.optimizerForm.setFieldsValue(...)` — resets filter fields
2. `setCharacter` (line ~410): `window.optimizerForm.setFieldValue('characterId', id)`
3. `updateCharacter` (line ~426): `window.optimizerForm.setFieldsValue(displayFormValues)`

#### Step 2: Apply dual-write pattern

```typescript
// resetFilters (line ~403):
// Before:
window.optimizerForm.setFieldsValue(OptimizerTabController.formToDisplay(newForm as Form))
// After (use store's resetFilters action):
useOptimizerFormStore.getState().resetFilters()
window.optimizerForm.setFieldsValue(OptimizerTabController.formToDisplay(newForm as Form))

// setCharacter (line ~410):
// Before:
window.optimizerForm.setFieldValue('characterId', id)
// After:
// Don't add store write here — updateCharacter handles the full character load.
// characterId alone isn't meaningful without the rest of the form.
window.optimizerForm.setFieldValue('characterId', id)

// updateCharacter (line ~426):
// Before:
window.optimizerForm.setFieldsValue(displayFormValues)
// After:
// The setTimeout at line ~444 calls onOptimizerFormValuesChange which triggers syncFormToStore.
// So the store gets updated via Phase 0b sync. No change needed here.
window.optimizerForm.setFieldsValue(displayFormValues)
```

**Note:** `updateCharacter` is the character switch flow. It sets antd form values, then 50ms later calls `onOptimizerFormValuesChange` which fires `syncFormToStore`. The store is kept in sync by Phase 0b. No additional dual-write needed.

#### Step 3: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 4: Commit

```bash
git add src/lib/tabs/tabOptimizer/optimizerTabController.ts
git commit -m "feat(store): dual-write setFieldValue in optimizerTabController (Phase 0c)"
```

---

### Task 9: Replace setFieldValue in Remaining Files

**Files:**
1. `src/lib/tabs/tabOptimizer/conditionals/FormSlider.tsx` — 2 calls
2. `src/lib/tabs/tabOptimizer/combo/comboDrawerController.tsx` — 2 calls (already has sync)
3. `src/lib/simulations/statSimulationController.tsx` — 1 call
4. `src/lib/tabs/tabOptimizer/optimizerForm/components/SimulatedBuildsGrid.tsx` — 1 call
5. `src/lib/conditionals/evaluation/applyPresets.ts` — 1 call (setFieldsValue)
6. `src/lib/state/db.ts` — 1 call (setFieldValue rank)

#### Step 1: Read each file and apply dual-write

**FormSlider.tsx** (lines ~64, 68):
```typescript
// These set conditional values. Read the file to see what itemName contains.
// Before:
window.optimizerForm.setFieldValue(itemName, props.max)
// After:
// Need to determine which store action based on itemName.
// If itemName is like ['characterConditionals', key]:
//   useOptimizerFormStore.getState().setCharacterConditionals({...current, [key]: value})
// This is complex — read the file to understand itemName patterns.
// Simplest approach: keep form write + rely on onValuesChange sync.
window.optimizerForm.setFieldValue(itemName, props.max)
```

**comboDrawerController.tsx** (lines ~828-829):
Already has `syncFormToStore` call after writes (Phase 0b). No additional changes needed.

**statSimulationController.tsx** (line ~282):
```typescript
// Before:
window.optimizerForm.setFieldValue(['statSim', 'simulations'], simulations)
// After:
useOptimizerFormStore.getState().setStatSim({
  ...useOptimizerFormStore.getState().statSim!,
  simulations,
})
window.optimizerForm.setFieldValue(['statSim', 'simulations'], simulations)
```

**SimulatedBuildsGrid.tsx** (line ~108):
```typescript
// Before:
window.optimizerForm.setFieldValue(['statSim', statSim.simType], cloneRequest)
// After:
const currentStatSim = useOptimizerFormStore.getState().statSim
if (currentStatSim) {
  useOptimizerFormStore.getState().setStatSim({
    ...currentStatSim,
    [statSim.simType]: cloneRequest,
  })
}
window.optimizerForm.setFieldValue(['statSim', statSim.simType], cloneRequest)
```

**applyPresets.ts** (line ~63):
```typescript
// Before:
window.optimizerForm.setFieldsValue(form)
// After:
// This sets the entire form. syncFormToStore is called via onValuesChange (line 64 calls it).
// No additional store write needed.
window.optimizerForm.setFieldsValue(form)
```

**db.ts** (line ~1355):
```typescript
// Before:
window.optimizerForm.setFieldValue('rank', optimizerCharacterRank)
// After:
useOptimizerFormStore.getState().setRelicFilterField('rank', optimizerCharacterRank)
window.optimizerForm.setFieldValue('rank', optimizerCharacterRank)
```

**Note:** Use lazy import for `useOptimizerFormStore` in `db.ts` to avoid circular deps (same pattern as Phase 0b):
```typescript
void import('lib/stores/optimizerForm/useOptimizerFormStore').then(({ useOptimizerFormStore }) => {
  useOptimizerFormStore.getState().setRelicFilterField('rank', optimizerCharacterRank)
})
```

#### Step 2: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 3: Commit

```bash
git add -A
git commit -m "feat(store): dual-write setFieldValue in remaining files (Phase 0c)"
```

---

## Sub-phase C3: Replace onOptimizerFormValuesChange

### Task 10: Extract recalculatePermutations Function

**Why:** `window.onOptimizerFormValuesChange` is a global callback that does three things: (1) sync to store, (2) conditional change detection, (3) permutation recalculation. Most external callers only want #3. Extract it as a standalone function.

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerForm/OptimizerForm.tsx`
- Create: `src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions.ts`

#### Step 1: Read onValuesChange

Read `OptimizerForm.tsx` lines 66-161 to understand the full onValuesChange logic.

#### Step 2: Create optimizerFormActions.ts

Extract the permutation recalculation logic:

```typescript
// src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions.ts

import { Optimizer } from 'lib/optimization/optimizer'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'

/**
 * Recalculate permutation counts from current store state.
 * Call this after any form change that affects relic filtering.
 * Replaces external calls to `window.onOptimizerFormValuesChange({} as Form, form)`.
 */
export function recalculatePermutations(): void {
  const state = useOptimizerFormStore.getState()
  if (!state.characterId) return

  const request = displayToInternal(state)
  const [relics, preFilteredRelicsByPart] = Optimizer.getFilteredRelics(request)

  const permutationDetails = {
    Head: relics.Head.length,
    Hands: relics.Hands.length,
    Body: relics.Body.length,
    Feet: relics.Feet.length,
    PlanarSphere: relics.PlanarSphere.length,
    LinkRope: relics.LinkRope.length,
    HeadTotal: preFilteredRelicsByPart.Head.length,
    HandsTotal: preFilteredRelicsByPart.Hands.length,
    BodyTotal: preFilteredRelicsByPart.Body.length,
    FeetTotal: preFilteredRelicsByPart.Feet.length,
    PlanarSphereTotal: preFilteredRelicsByPart.PlanarSphere.length,
    LinkRopeTotal: preFilteredRelicsByPart.LinkRope.length,
  }
  window.store.getState().setPermutationDetails(permutationDetails)
  window.store.getState().setPermutations(
    relics.Head.length
      * relics.Hands.length
      * relics.Body.length
      * relics.Feet.length
      * relics.PlanarSphere.length
      * relics.LinkRope.length,
  )
}
```

**Note for executing agent:** Check if `Optimizer.getFilteredRelics` accepts a `Form` or needs specific fields. It takes a `Form` object which `displayToInternal` returns. Verify the types align.

#### Step 3: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 4: Commit

```bash
git add src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions.ts
git commit -m "feat(store): extract recalculatePermutations function (Phase 0c)"
```

---

### Task 11: Replace onOptimizerFormValuesChange Callers

**Files:**
1. `src/lib/tabs/tabOptimizer/optimizerTabController.ts` — 3 calls (updateFilters, updateCharacter, resetFilters calls updateFilters)
2. `src/lib/tabs/tabOptimizer/optimizerForm/components/FormStatRollSlider.tsx` — 3 calls
3. `src/lib/tabs/tabOptimizer/OptimizerSuggestionsModal.tsx` — 1 call
4. `src/lib/conditionals/evaluation/applyPresets.ts` — 1 call
5. `src/lib/state/db.ts` — 2 calls

**Do NOT modify:**
- `OptimizerForm.tsx` line 161: `window.onOptimizerFormValuesChange = onValuesChange` — keep this assignment for now. Phase 0d removes it.

#### Step 1: Replace in optimizerTabController.ts

```typescript
// updateFilters (line ~372-375):
// Before:
updateFilters: () => {
  if (window.optimizerForm && window.onOptimizerFormValuesChange) {
    const fieldValues = OptimizerTabController.getForm()
    window.onOptimizerFormValuesChange({} as Form, fieldValues)
  }
},

// After:
updateFilters: () => {
  recalculatePermutations()
},
```

```typescript
// updateCharacter setTimeout callback (line ~444):
// Before:
window.onOptimizerFormValuesChange({} as Form, displayFormValues)

// After:
syncFormToStore(window.optimizerForm.getFieldsValue())
recalculatePermutations()
```

Add imports:
```typescript
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { syncFormToStore } from 'lib/stores/optimizerForm/optimizerFormSync'
```

**Note:** `updateCharacter` calls `onOptimizerFormValuesChange` to both sync the store AND recalculate permutations. With the new code, we explicitly do both: `syncFormToStore` ensures the store is updated, then `recalculatePermutations` reads from the store.

#### Step 2: Replace in FormStatRollSlider.tsx

```typescript
// All 3 calls follow the same pattern:
// Before:
window.onOptimizerFormValuesChange({} as OptimizerForm, OptimizerTabController.getForm(), true)

// After:
recalculatePermutations()
```

The `true` third argument was the `bypass` flag which skipped conditional detection — but `recalculatePermutations()` doesn't do conditional detection at all, so this is equivalent.

Add import: `import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'`

#### Step 3: Replace in OptimizerSuggestionsModal.tsx

```typescript
// Line ~248:
// Before:
window.onOptimizerFormValuesChange({} as Form, OptimizerTabController.getForm())

// After:
syncFormToStore(window.optimizerForm.getFieldsValue())
recalculatePermutations()
```

**Note:** The suggestions modal does multiple `setFieldValue` calls before this. Need to sync the store from the form (since the form was just modified), then recalculate.

#### Step 4: Replace in applyPresets.ts

```typescript
// Line ~64:
// Before:
window.onOptimizerFormValuesChange({} as Form, form)

// After:
syncFormToStore(window.optimizerForm.getFieldsValue())
recalculatePermutations()
```

#### Step 5: Replace in db.ts

```typescript
// Line ~335:
// Before:
window.onOptimizerFormValuesChange({} as Form, OptimizerTabController.getForm())

// After (lazy import to avoid circular deps):
void import('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions').then(({ recalculatePermutations }) => {
  recalculatePermutations()
})

// Line ~1231:
// Before:
window.onOptimizerFormValuesChange({} as Form, fieldValues)

// After:
void import('lib/stores/optimizerForm/optimizerFormSync').then(({ syncFormToStore }) => {
  syncFormToStore(window.optimizerForm.getFieldsValue())
})
void import('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions').then(({ recalculatePermutations }) => {
  recalculatePermutations()
})
```

**Note:** db.ts needs lazy imports for both `syncFormToStore` and `recalculatePermutations` to avoid circular dependency chains.

#### Step 6: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 7: Run tests

Run: `npm run vitest:fast`
Expected: Same pass/fail count as before

#### Step 8: Commit

```bash
git add -A
git commit -m "feat(store): replace onOptimizerFormValuesChange with recalculatePermutations (Phase 0c)"
```

---

## Verification Checklist

After all tasks:

- [ ] `npm run typecheck:fast` passes
- [ ] `npm run vitest:fast` — same pass count as before (no regressions from our changes)
- [ ] New files created:
  - `src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions.ts`
- [ ] No remaining `Form.useWatch` on `window.optimizerForm` (except RelicModal/Benchmarks which use their own forms)
- [ ] No remaining `window.optimizerForm.getFieldValue/getFieldsValue` outside `OptimizerForm.tsx`, `syncFormToStore`, and `updateCharacter`
- [ ] All `setFieldValue` calls have companion store writes (or rely on Phase 0b sync)
- [ ] All `onOptimizerFormValuesChange` calls replaced with `recalculatePermutations()`

## Manual Testing

After all tasks, run the app (`npm run dev`) and:
1. Open the Optimizer tab, select a character
2. Change filters (main stats, sets, enhance) — verify permutation counts update
3. Change conditionals — verify no errors
4. Open combo drawer, make changes, close — verify no errors
5. Load a saved build — verify form populates correctly
6. Click "Start" — verify optimizer runs
7. Apply suggestions — verify they apply correctly
8. Change teammates — verify conditional panels update
9. No console errors throughout

---

## Summary of Patterns Used

| Pattern | When Used | Example |
|---------|-----------|---------|
| `useOptimizerFormStore(s => s.field)` | React components reading reactive state | Replace `Form.useWatch` |
| `useOptimizerFormStore.getState().field` | Non-reactive reads in callbacks | Replace `getFieldValue` |
| `displayToInternal(useOptimizerFormStore.getState())` | When INTERNAL format needed | Replace `getForm()` |
| Store action + `setFieldValue` | Dual-write during transition | Replace `setFieldValue` |
| `recalculatePermutations()` | After form changes that affect relic count | Replace `onOptimizerFormValuesChange` |
| Lazy `import()` | In `db.ts` and `comboDrawerController.tsx` | Avoid circular deps |
