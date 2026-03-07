# Phase 0d: Remove antd Form — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the antd `<AntDForm>` wrapper and `window.optimizerForm` global. The Zustand store becomes the sole data layer for optimizer form state.

**Architecture:** Three sub-phases: (D1) add missing store actions and a `loadForm` action that replaces `formToDisplay()`, (D2) convert all 55 `Form.Item` bindings to controlled components reading/writing the Zustand store, (D3) delete `<AntDForm>`, `window.optimizerForm`, dual-writes, `onValuesChange`, `formToDisplay`/`displayToForm`, and `syncFormToStore`.

**Tech Stack:** TypeScript, Zustand, React, antd (components only, not Form), Vitest

**Key References:**
- Phase 0a store: `src/lib/stores/optimizerForm/useOptimizerFormStore.ts`
- Phase 0a types: `src/lib/stores/optimizerForm/optimizerFormTypes.ts`
- Phase 0a defaults: `src/lib/stores/optimizerForm/optimizerFormDefaults.ts`
- Phase 0a conversions: `src/lib/stores/optimizerForm/optimizerFormConversions.ts`
- Phase 0c actions: `src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions.ts`
- Old transform: `src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormTransform.ts`
- Conditional helpers: `src/lib/tabs/tabOptimizer/conditionals/FormSwitch.tsx` (`resolveConditionalValue`)

---

## Conventions

- **Imports:** Use path aliases — `'lib/stores/optimizerForm/...'`
- **Run typecheck:** `npm run typecheck:fast`
- **Run tests:** `npm run vitest:fast`
- **Activate Serena project** `hsr-optimizer` before using any Serena tools
- **Controlled component pattern:** `value={useOptimizerFormStore(s => s.field)}` + `onChange={...storeAction}`
- **No wrapper abstractions:** Direct store selectors on each component (throwaway before Mantine Phase 2)

---

## Sub-phase D1: Store Preparation

### Task 1: Add setConditionalValue store action

**Why:** The conditional components (FormSlider, FormSwitch, FormSelect) use dynamic paths like `['characterConditionals', 'key']` or `['teammate0', 'lightConeConditionals', 'key']`. We need a single action that resolves these paths and updates the store.

**Files:**
- Modify: `src/lib/stores/optimizerForm/useOptimizerFormStore.ts`

#### Step 1: Read the store file to understand current actions

Read `useOptimizerFormStore.ts` to see existing actions and the store type.

#### Step 2: Add the action type

In the store type, add:

```typescript
setConditionalValue: (itemName: (string | number)[], value: unknown) => void
```

#### Step 3: Add the action implementation

```typescript
setConditionalValue: (itemName, value) => set((state) => {
  const teammateKeyToIndex: Record<string, 0 | 1 | 2> = { teammate0: 0, teammate1: 1, teammate2: 2 }
  const [first, ...rest] = itemName
  const tmIndex = teammateKeyToIndex[first as string]

  if (tmIndex != null) {
    // Teammate path: ['teammate0', 'characterConditionals', 'key']
    const [condType, key] = rest as [string, string]
    const teammates = [...state.teammates] as [TeammateState, TeammateState, TeammateState]
    const tm = { ...teammates[tmIndex] }
    tm[condType as 'characterConditionals' | 'lightConeConditionals'] = {
      ...tm[condType as 'characterConditionals' | 'lightConeConditionals'],
      [key]: value,
    }
    teammates[tmIndex] = tm
    return { teammates }
  }

  if (first === 'setConditionals') {
    // Set conditional: ['setConditionals', 'SetName', 1]
    const [setName, idx] = rest as [string, number]
    const setConditionals = { ...state.setConditionals }
    const tuple = [...setConditionals[setName]] as [undefined, boolean | number]
    tuple[idx] = value as boolean | number
    setConditionals[setName] = tuple
    return { setConditionals }
  }

  // Main character: ['characterConditionals', 'key'] or ['lightConeConditionals', 'key']
  const [condType, key] = itemName as [string, string]
  return {
    [condType]: {
      ...(state[condType as 'characterConditionals' | 'lightConeConditionals'] as Record<string, unknown>),
      [key]: value,
    },
  }
}),
```

#### Step 4: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 5: Commit

```bash
git add src/lib/stores/optimizerForm/useOptimizerFormStore.ts
git commit -m "feat(store): add setConditionalValue action (Phase 0d)"
```

---

### Task 2: Add loadForm store action

**Why:** `formToDisplay()` is ~250 lines of defaulting logic that runs when loading a saved character build. We need a store action that takes an internal-format `Form` (from DB), applies defaults from `createDefaultFormState()`, and sets the store state. This replaces both `formToDisplay()` and `setFieldsValue()`.

**Files:**
- Modify: `src/lib/stores/optimizerForm/useOptimizerFormStore.ts`
- Modify: `src/lib/stores/optimizerForm/optimizerFormConversions.ts`

#### Step 1: Add internalToState conversion function

In `optimizerFormConversions.ts`, add a function that converts an internal-format `Form` (as stored in DB) to a full `OptimizerFormState`. This is essentially what `formToDisplay()` did, but outputs store state instead of form values.

Read `formToDisplay()` in `optimizerFormTransform.ts` (lines 107-358) to understand all the defaulting it does. The key operations are:
1. Convert stat filters: 0 → undefined, MAX_INT → undefined, percentage × 100
2. Convert rating filters: same pattern
3. Convert teammates: clone and sanitize
4. Fill missing enemy options from defaults
5. Fill missing character/LC conditionals from resolver defaults
6. Fill missing weights from scoring metadata
7. Apply presets for new characters
8. Fill missing combo settings
9. Clean up set conditionals
10. Set rank from DB

Create `internalFormToState(form: Form): Partial<OptimizerFormState>` that uses the existing `internalToDisplay()` for stat/rating/teammate conversion, then handles the remaining fields.

```typescript
export function internalFormToState(form: Form): Partial<OptimizerFormState> {
  const { statFilters, ratingFilters, teammates } = internalToDisplay(form)

  return {
    characterId: form.characterId,
    characterEidolon: form.characterEidolon,
    characterLevel: form.characterLevel ?? 80,
    lightCone: form.lightCone,
    lightConeLevel: form.lightConeLevel ?? 80,
    lightConeSuperimposition: form.lightConeSuperimposition ?? 1,

    // Enemy config
    enemyCount: form.enemyCount,
    enemyLevel: form.enemyLevel,
    enemyResistance: form.enemyResistance,
    enemyEffectResistance: form.enemyEffectResistance,
    enemyMaxToughness: form.enemyMaxToughness,
    enemyElementalWeak: form.enemyElementalWeak,
    enemyWeaknessBroken: form.enemyWeaknessBroken,

    // Conditionals
    characterConditionals: form.characterConditionals ?? {},
    lightConeConditionals: form.lightConeConditionals ?? {},
    setConditionals: form.setConditionals,

    // Relic filters
    enhance: form.enhance,
    grade: form.grade,
    rank: form.rank,
    exclude: form.exclude ?? [],
    includeEquippedRelics: form.includeEquippedRelics ?? true,
    keepCurrentRelics: form.keepCurrentRelics ?? false,
    mainBody: form.mainBody ?? [],
    mainFeet: form.mainFeet ?? [],
    mainHands: form.mainHands ?? [],
    mainHead: form.mainHead ?? [],
    mainLinkRope: form.mainLinkRope ?? [],
    mainPlanarSphere: form.mainPlanarSphere ?? [],
    mainStatUpscaleLevel: form.mainStatUpscaleLevel ?? 15,
    rankFilter: form.rankFilter,
    relicSets: form.relicSets,
    ornamentSets: form.ornamentSets,
    statDisplay: form.statDisplay,
    memoDisplay: form.memoDisplay,

    // Weights
    weights: form.weights,

    // Combat buffs (internal → display: multiply percent buffs by 100)
    combatBuffs: convertCombatBuffsToDisplay(form.combatBuffs),

    // Combo
    comboStateJson: form.comboStateJson ?? '{}',
    comboTurnAbilities: form.comboTurnAbilities,
    comboPreprocessor: form.comboPreprocessor ?? true,
    comboType: form.comboType,
    comboDot: form.comboDot,

    // Scoring / display
    resultSort: form.resultSort,
    resultsLimit: form.resultsLimit ?? 1024,

    // Team sets
    teamRelicSet: form.teamRelicSet,
    teamOrnamentSet: form.teamOrnamentSet,

    // Options
    deprioritizeBuffs: form.deprioritizeBuffs ?? false,

    // Stat sim
    statSim: form.statSim,

    // Filters
    statFilters,
    ratingFilters,
    teammates,
  }
}
```

**Note for executing agent:** You'll also need a `convertCombatBuffsToDisplay()` helper (inverse of `convertCombatBuffsToInternal`). Add it near the existing combat buff helper. Also, `internalFormToState` should be exported.

#### Step 2: Add loadForm action to store

```typescript
// In store type:
loadForm: (form: Form) => void

// In store implementation:
loadForm: (form) => {
  const defaults = createDefaultFormState()
  const converted = internalFormToState(form)
  // Merge: converted values override defaults, but only where defined
  const merged = { ...defaults }
  for (const [key, value] of Object.entries(converted)) {
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value
    }
  }
  set(merged)
},
```

#### Step 3: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 4: Commit

```bash
git add src/lib/stores/optimizerForm/useOptimizerFormStore.ts src/lib/stores/optimizerForm/optimizerFormConversions.ts
git commit -m "feat(store): add loadForm action and internalFormToState conversion (Phase 0d)"
```

---

### Task 3: Add side effects to store actions

**Why:** The `onValuesChange` callback has side effects for character switching, rank changes, and conditional updates. These need to move into the store actions or be called explicitly.

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions.ts`

#### Step 1: Read onValuesChange to catalog side effects

Read `OptimizerForm.tsx` lines 67-161 to understand each side effect.

#### Step 2: Add side-effect-aware wrapper functions

In `optimizerFormActions.ts`, add functions that combine store updates with side effects:

```typescript
import { updateConditionalChange } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { updateTeammate } from 'lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard'

/**
 * Called when a conditional value changes in the UI.
 * Updates the store and patches combo state.
 */
export function handleConditionalChange(
  itemName: (string | number)[],
  value: unknown,
) {
  const store = useOptimizerFormStore.getState()
  store.setConditionalValue(itemName, value)

  // Build a changedValues-like object for updateConditionalChange
  const [first, ...rest] = itemName
  const teammateKeys = ['teammate0', 'teammate1', 'teammate2']
  if (teammateKeys.includes(first as string)) {
    const [condType, key] = rest
    updateConditionalChange({ [first]: { [condType]: { [key]: value } } } as Partial<Form>)
  } else {
    const [condType, key] = itemName
    updateConditionalChange({ [condType]: { [key]: value } } as Partial<Form>)
  }
}
```

**Note for executing agent:** Read the actual `updateConditionalChange` function signature and the `onValuesChange` logic carefully to ensure the changedValues format matches. The key thing is that `updateConditionalChange` patches combo state JSON when conditionals change. For set conditionals the path is `['setConditionals', setName, 1]` — check how `updateConditionalChange` handles that.

#### Step 3: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 4: Commit

```bash
git add src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions.ts
git commit -m "feat(store): add handleConditionalChange for side effects (Phase 0d)"
```

---

## Sub-phase D2: Convert Form.Item Bindings

### Task 4: Convert CharacterSelectorDisplay.tsx

**Why:** 6 `Form.Item` bindings need to become controlled components.

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelectorDisplay.tsx`

#### Step 1: Read the file

Read the full file to understand all 6 `Form.Item` usages and their wrapped components.

#### Step 2: Replace each Form.Item

For each `Form.Item`, remove it and add `value` + `onChange` props to the wrapped component:

```typescript
// characterId — CharacterSelect
<CharacterSelect
  value={useOptimizerFormStore((s) => s.characterId)}
  onChange={(id) => {
    useOptimizerFormStore.getState().setRelicFilterField('characterId' as any, id)
    // Side effect: character switch
    if (id) {
      window.store.getState().setOptimizerTabFocusCharacter(id)
      OptimizerTabController.updateCharacter(id)
      SaveState.delayedSave()
    }
  }}
/>
```

**Note for executing agent:** Read the file thoroughly. The `characterId` Form.Item onChange triggers character switching logic from `onValuesChange`. The `characterEidolon` and `lightConeSuperimposition` are plain selects. `lightCone` uses LightConeSelect. `resultsLimit` and `resultSort` are plain selects. Check what store actions exist for each — many can use simple `set()` patterns. Check if `CharacterSelect` and `LightConeSelect` accept `value` and `onChange` props already.

#### Step 3: Remove Form import if no longer needed

Check if `Form` from antd is still used. If not, remove the import.

#### Step 4: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 5: Commit

```bash
git add src/lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelectorDisplay.tsx
git commit -m "feat(store): convert CharacterSelectorDisplay Form.Items to controlled (Phase 0d)"
```

---

### Task 5: Convert OptimizerOptionsDisplay.tsx

**Why:** 9 `Form.Item` bindings for relic filter options (enhance, grade, rank, exclude, switches, etc.).

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerForm/components/OptimizerOptionsDisplay.tsx`

#### Step 1: Read and replace

Each `Form.Item` maps to a store field. The switches use `valuePropName='checked'` — convert to `checked={store.field}` instead of `value`.

Key mappings:
- `includeEquippedRelics` → Switch, `checked`, `setRelicFilterField('includeEquippedRelics', val)`
- `rankFilter` → Switch, `checked`, `setRelicFilterField('rankFilter', val)`
- `keepCurrentRelics` → Switch, `checked`, `setRelicFilterField('keepCurrentRelics', val)`
- `rank` → Select, `value`, `setRelicFilterField('rank', val)`
- `exclude` → Select (multi), `value`, `setRelicFilterField('exclude', val)`
- `enhance` → Select, `value`, `setRelicFilterField('enhance', val)`
- `grade` → Select, `value`, `setRelicFilterField('grade', val)`
- `mainStatUpscaleLevel` → Select, `value`, `setRelicFilterField('mainStatUpscaleLevel', val)`
- `deprioritizeBuffs` → Radio.Group, `value`, `setDeprioritizeBuffs(val)`

**Note for executing agent:** After converting, each onChange should also call `recalculatePermutations()` for filter fields that affect permutation counts (enhance, grade, rank, exclude, includeEquippedRelics, keepCurrentRelics, mainStatUpscaleLevel, rankFilter). The switches and selects that affect relic filtering need this. Read the `onValuesChange` early-return logic to see which fields skip permutation recalc.

#### Step 2: Run typecheck

Run: `npm run typecheck:fast`
Expected: PASS

#### Step 3: Commit

```bash
git add src/lib/tabs/tabOptimizer/optimizerForm/components/OptimizerOptionsDisplay.tsx
git commit -m "feat(store): convert OptimizerOptionsDisplay Form.Items to controlled (Phase 0d)"
```

---

### Task 6: Convert EnemyConfigurationsDrawer.tsx

**Why:** 7 `Form.Item` bindings for enemy configuration.

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerForm/components/EnemyConfigurationsDrawer.tsx`

#### Step 1: Read and replace

Read the file. Note: the `enemyFormItemName` helper may add nesting. Check if enemy fields are top-level or nested. Map each to the corresponding store field.

Key enemy fields: `enemyLevel`, `enemyResistance`, `enemyEffectResistance`, `enemyMaxToughness`, `enemyCount`, `enemyElementalWeak` (Switch), `enemyWeaknessBroken` (Switch).

**Note for executing agent:** Check what store action sets enemy fields. There should be individual setters or a generic one. If not, you may need to add `setEnemyField` to the store.

#### Step 2: Run typecheck + commit

---

### Task 7: Convert conditional components (FormSlider, FormSwitch, FormSelect)

**Why:** These 3 components use dynamic `Form.Item name={itemName}` paths for all character/LC/set conditionals and teammate conditionals. This is the most complex conversion.

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/conditionals/FormSlider.tsx`
- Modify: `src/lib/tabs/tabOptimizer/conditionals/FormSwitch.tsx`
- Modify: `src/lib/tabs/tabOptimizer/conditionals/FormSelect.tsx`

#### Step 1: Read all three files

Understand how `Form.Item name={itemName}` works in each. The `itemName` is computed by `getItemName(props)`.

#### Step 2: Convert FormSwitch

Replace `Form.Item name={itemName} valuePropName='checked'` with:
```tsx
<Switch
  checked={resolveConditionalValue(useOptimizerFormStore.getState(), itemName as (string | number)[]) as boolean}
  onChange={(checked) => handleConditionalChange(itemName as (string | number)[], checked)}
/>
```

**Note:** FormSwitch has a `removeForm` prop — when true, no Form.Item is used. Handle that branch too.

#### Step 3: Convert FormSlider

The slider has TWO Form.Items — one for InputNumber, one for Slider. Both need the same value/onChange. Replace with controlled props.

The `removeForm` prop also applies here.

#### Step 4: Convert FormSelect

Same pattern as FormSwitch but with Select instead of Switch.

#### Step 5: Important — these components need reactivity

Since these components render inside React, they need to re-render when the conditional value changes. Using `useOptimizerFormStore.getState()` (non-reactive) won't work for the value prop. Use the reactive selector:

```tsx
// Need a reactive value for rendering:
const value = useOptimizerFormStore((s) => resolveConditionalValue(s, itemName))
```

But `resolveConditionalValue` takes `OptimizerFormState` — check the type compatibility. May need to pass the full state or create a selector hook.

#### Step 6: Run typecheck + commit

```bash
git add src/lib/tabs/tabOptimizer/conditionals/FormSlider.tsx src/lib/tabs/tabOptimizer/conditionals/FormSwitch.tsx src/lib/tabs/tabOptimizer/conditionals/FormSelect.tsx
git commit -m "feat(store): convert conditional Form.Items to controlled (Phase 0d)"
```

---

### Task 8: Convert remaining Form.Item files

**Why:** 8 more files with Form.Item bindings need conversion.

**Files:**
- `src/lib/tabs/tabOptimizer/optimizerForm/components/RelicMainSetFilters.tsx` (6 items)
- `src/lib/tabs/tabOptimizer/optimizerForm/components/ComboFilter.tsx` (4 items + hidden inputs)
- `src/lib/tabs/tabOptimizer/optimizerForm/components/FormStatRollSlider.tsx` (3 items for weights)
- `src/lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard.tsx` (6 items)
- `src/lib/tabs/tabOptimizer/optimizerForm/components/CombatBuffsDrawer.tsx` (1 item)
- `src/lib/tabs/tabOptimizer/optimizerForm/components/FormSetConditionals.tsx` (4 items)
- `src/lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay.tsx` (7 items)
- `src/lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector.tsx` (1 item)
- `src/lib/tabs/tabOptimizer/optimizerForm/layout/FilterRow.tsx` (2 items for min/max stat filters)

#### Step 1: Convert each file following the same controlled component pattern

For each file, read it, replace `Form.Item` with direct `value`/`onChange` props, and ensure the correct store action is used.

**Key notes:**
- **RelicMainSetFilters**: `mainBody`, `mainFeet`, `mainPlanarSphere`, `mainLinkRope` → `setMainStats`; `relicSets` → `setRelicSets`; `ornamentSets` → `setOrnamentSets`. All need `recalculatePermutations()` on change.
- **ComboFilter**: `comboType` → `setComboType`; `comboStateJson` is a hidden input storing JSON — just remove the Form.Item, the store already holds this field. `comboPreprocessor` → `setComboPreprocessor`; `comboDot` → `setComboDot`.
- **FormStatRollSlider**: `weights.{stat}` → `setWeight(stat, value)`. These call `recalculatePermutations()` on `onChangeComplete`.
- **TeammateCard**: `teammate{N}.characterId` etc. → `setTeammateField(index, field, value)`. The `characterId` change triggers `updateTeammate`.
- **CombatBuffsDrawer**: `combatBuffs.{key}` → `setCombatBuff(key, value)`.
- **FormSetConditionals**: `setConditionals.{set}.1` — these use Switch or Select. Use `setConditionalValue`.
- **StatSimulationDisplay**: Complex nested `statSim.*` paths. Use `setStatSim` with spread updates.
- **TurnAbilitySelector**: Has custom `getValueFromEvent`/`getValueProps` — preserve the transform logic inline.
- **FilterRow**: `min{Name}`, `max{Name}` → `setStatFilter` or `setRatingFilter`. These need `recalculatePermutations()` on change.

#### Step 2: Run typecheck after each file or batch

Run: `npm run typecheck:fast`

#### Step 3: Commit in batches

```bash
git add -A
git commit -m "feat(store): convert remaining Form.Items to controlled components (Phase 0d)"
```

---

## Sub-phase D3: Remove antd Form

### Task 9: Rewrite updateCharacter to use store directly

**Why:** `updateCharacter` currently calls `formToDisplay(form)` → `setFieldsValue(displayFormValues)`. It needs to load into the store directly.

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerTabController.ts`

#### Step 1: Read updateCharacter (lines ~415-448)

Understand the full flow: get form from DB, convert to display, set on antd form, then after 50ms do context generation and sync.

#### Step 2: Rewrite to use store

```typescript
updateCharacter: (characterId: CharacterId) => {
  if (!characterId) return

  const character = DB.getCharacterById(characterId)
  const form = character ? character.form : getDefaultForm({ id: characterId })

  // Load form into store (replaces formToDisplay + setFieldsValue)
  useOptimizerFormStore.getState().loadForm(form)

  // Delayed side effects (same as before)
  setTimeout(() => {
    window.store.getState().setOptimizerTabFocusCharacter(characterId)
    window.store.getState().setStatDisplay(form.statDisplay ?? DEFAULT_STAT_DISPLAY)
    window.store.getState().setStatSimulations(form.statSim?.simulations ?? [])
    window.store.getState().setOptimizerSelectedRowData(null)
    window.optimizerGrid.current?.api?.deselectAll()

    const request = displayToInternal(useOptimizerFormStore.getState())
    generateContext(request)
    calculateCurrentlyEquippedRow(request)

    recalculatePermutations()
  }, 50)
},
```

#### Step 3: Remove formToDisplay/displayToForm usage from other functions

- `resetFilters`: already uses store's `resetFilters()` (Phase 0c). Remove the `formToDisplay` call on the `setFieldsValue` line — the store is already updated.
- `getForm`: already migrated (Phase 0c).

#### Step 4: Run typecheck + commit

---

### Task 10: Rewrite loadCharacterBuildInOptimizer

**Why:** The function in `db.ts` has ~30 `form.setFieldValue` calls that need to build a state object and use `loadForm` instead.

**Files:**
- Modify: `src/lib/state/db.ts`

#### Step 1: Read the full function

Read `loadCharacterBuildInOptimizer` (around lines 1450-1596) to understand all the fields it sets.

#### Step 2: Rewrite to build a Form object and use loadForm

Instead of 30 individual `setFieldValue` calls, build a partial `Form` object with all the values, then call `useOptimizerFormStore.getState().loadForm(builtForm)`.

**Note for executing agent:** This function uses `OptimizerTabController.setCharacter(characterId)` which calls `updateCharacter`. The `loadForm` in `updateCharacter` will set the base character form. Then the build-specific overrides (teammates, conditionals, combo settings) need to be applied on top. Consider whether to: (a) call `updateCharacter` first, then patch the store with overrides, or (b) build the complete form and call `loadForm` once. Option (b) is cleaner.

#### Step 3: Run typecheck + commit

---

### Task 11: Migrate remaining formToDisplay/displayToForm callers

**Why:** Several files still call these functions. Each needs to be migrated.

**Files:**
- `src/lib/characterPreview/characterPreviewController.tsx` (line 197) — uses `displayToForm(formToDisplay(character.form))` which is a round-trip. Replace with `displayToInternal(internalFormToState(character.form))` or simplify.
- `src/lib/conditionals/evaluation/applyPresets.ts` (lines 47-48) — uses `formToDisplay(getForm())` to get display form for preset application. Replace with reading store state directly.
- `src/lib/gpu/tests/webgpuTestGenerator.ts` (lines 243, 257) — uses `displayToForm` for test generation. Replace with `displayToInternal`.
- `src/lib/state/db.ts` (line 834) — uses `formToDisplay(getForm())` for saving optimizer metadata. Replace with store state.
- `src/lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard.tsx` (lines 396, 408) — uses `formToDisplay(getForm())` to get display values. Replace with store state.

#### Step 1: Migrate each caller

For each file, read the context and replace `formToDisplay`/`displayToForm` with the appropriate store read or conversion function.

#### Step 2: Run typecheck + commit

---

### Task 12: Delete AntDForm wrapper and onValuesChange

**Why:** With all Form.Items converted and all callers migrated, the antd Form wrapper serves no purpose.

**Files:**
- Modify: `src/lib/tabs/tabOptimizer/optimizerForm/OptimizerForm.tsx`

#### Step 1: Remove from OptimizerForm.tsx

1. Delete `const [optimizerForm] = AntDForm.useForm<Form>()`
2. Delete `window.optimizerForm = optimizerForm`
3. Delete the entire `onValuesChange` callback (lines 67-161)
4. Delete `window.onOptimizerFormValuesChange = onValuesChange`
5. Replace `<AntDForm form={optimizerForm} ...>` with a plain `<div>` or fragment
6. Remove the closing `</AntDForm>`
7. Remove unused imports (`Form as AntDForm`, `syncFormToStore`, etc.)

#### Step 2: Run typecheck + commit

---

### Task 13: Remove all dual-writes

**Why:** Phase 0c added `window.optimizerForm.setFieldValue` calls alongside store writes. With the form gone, these error.

**Files:** All files from Phase 0c that have dual-writes (~11 files)

#### Step 1: Search and remove

```bash
# Find all remaining window.optimizerForm references
grep -rn "window.optimizerForm" src/ --include="*.ts" --include="*.tsx"
```

Remove every `window.optimizerForm.setFieldValue(...)` and `window.optimizerForm.setFieldsValue(...)` line. Keep the store action that precedes each one.

Also remove `window.optimizerForm.getFieldsValue()` calls in `syncFormToStore` invocations — replace with direct store reads where needed.

#### Step 2: Run typecheck + commit

---

### Task 14: Delete dead code

**Why:** Clean up files and types that are no longer needed.

**Files:**
- Delete or gut: `src/lib/tabs/tabOptimizer/optimizerForm/optimizerFormTransform.ts` — delete `formToDisplay`, `displayToForm`, `getNumber`, `unsetMin`, `unsetMax`, `cloneTeammate`, `sanitizeConditionals`. Keep `emptyFilters` and `statFiltersFromForm` if still referenced.
- Delete: `src/lib/stores/optimizerForm/optimizerFormSync.ts` — no form to sync from
- Modify: `src/types/window.ts` — remove `optimizerForm` and `onOptimizerFormValuesChange` from Window type
- Clean up: Remove unused imports across all modified files

#### Step 1: Check what's still referenced

```bash
grep -rn "emptyFilters\|statFiltersFromForm" src/ --include="*.ts" --include="*.tsx"
grep -rn "syncFormToStore" src/ --include="*.ts" --include="*.tsx"
grep -rn "optimizerFormTransform" src/ --include="*.ts" --include="*.tsx"
```

#### Step 2: Delete/modify accordingly

#### Step 3: Run typecheck + tests

Run: `npm run typecheck:fast`
Run: `npm run vitest:fast`
Expected: PASS (no regressions)

#### Step 4: Commit

```bash
git add -A
git commit -m "feat(store): delete antd Form, dual-writes, formToDisplay, syncFormToStore (Phase 0d)"
```

---

## Verification Checklist

After all tasks:

- [ ] `npm run typecheck:fast` passes
- [ ] `npm run vitest:fast` — no regressions
- [ ] `grep -rn "window.optimizerForm" src/` — zero results
- [ ] `grep -rn "Form.Item" src/lib/tabs/tabOptimizer/` — zero results (in optimizer files)
- [ ] `grep -rn "formToDisplay\|displayToForm" src/` — zero results (except comments/docs)
- [ ] `grep -rn "syncFormToStore" src/` — zero results
- [ ] `grep -rn "onOptimizerFormValuesChange" src/` — zero results
- [ ] New store actions: `setConditionalValue`, `loadForm`
- [ ] New conversion: `internalFormToState`

## Manual Testing

After all tasks, run the app (`npm run dev`) and:
1. Open Optimizer tab, select a character — form populates correctly
2. Change character — all fields update
3. Change filters (main stats, sets, enhance) — permutation counts update
4. Toggle switches (include equipped, keep current) — permutations update
5. Change conditionals (sliders, switches, selects) — no errors
6. Change teammate — conditional panels update, teammate fields populate
7. Open combo drawer, make changes — no errors
8. Load a saved build — form populates correctly
9. Apply suggestions (0 perms modal) — filters reset, permutations update
10. Apply presets — form updates correctly
11. Click "Start" — optimizer runs
12. Save state persists across refresh
13. No console errors throughout
