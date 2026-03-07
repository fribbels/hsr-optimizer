# Phase 0d Design: Remove antd Form

## Goal

Remove `<AntDForm>`, `window.optimizerForm`, `window.onOptimizerFormValuesChange`, `formToDisplay()`, `displayToForm()`, and all Phase 0c dual-writes. The Zustand store becomes the sole source of truth for optimizer form state.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| `formToDisplay()` defaulting logic | Eliminate — use `createDefaultFormState()` + merge | Store already has typed defaults |
| Form.Item conversion | Direct store selectors on each component | Explicit, no throwaway abstraction before Mantine |
| Side effect triggers | Move into individual store actions | Collapses indirection vs big switch statement |
| `window.optimizerForm` removal | Delete entirely from window type + all code | Git history is the breadcrumb |
| `loadCharacterBuildInOptimizer` | Rewrite to build state object + single store update | Can't leave 30 setFieldValue calls pointing at deleted form |

## Architecture

### What gets deleted

- `<AntDForm>` wrapper in `OptimizerForm.tsx`
- `window.optimizerForm` global and all references (41 occurrences, 14 files)
- `window.onOptimizerFormValuesChange` global (assignment in OptimizerForm.tsx)
- `formToDisplay()` and `displayToForm()` in `optimizerFormTransform.ts` (21 occurrences, 8 files)
- `syncFormToStore()` in `optimizerFormSync.ts` (no form to sync from)
- All Phase 0c dual-writes (`window.optimizerForm.setFieldValue` — 28 occurrences, 11 files)
- `onValuesChange` callback in OptimizerForm.tsx

### What stays

- `displayToInternal()` — converts display-format store state to internal Form for optimizer submission
- `internalToDisplay()` — converts internal Form to display format when loading saved builds
- `recalculatePermutations()` in `optimizerFormActions.ts`
- The Zustand store (Phase 0a)
- antd UI components (Select, InputNumber, Switch, etc.) — removed in Phase 2

## Conversion Pattern

### Standard Form.Item → Controlled Component

```tsx
// Before:
<Form.Item name="enhance">
  <Select options={enhanceOptions} />
</Form.Item>

// After:
<Select
  value={useOptimizerFormStore((s) => s.enhance)}
  onChange={(value) => useOptimizerFormStore.getState().setRelicFilterField('enhance', value)}
  options={enhanceOptions}
/>
```

### Conditional Form.Item (dynamic paths)

`FormSlider`, `FormSwitch`, `FormSelect` use `Form.Item name={itemName}` where `itemName` is like `['characterConditionals', 'key']` or `['teammate0', 'lightConeConditionals', 'key']`.

Add a `setConditionalValue(itemName, value)` store action that resolves the path internally. Read via existing `resolveConditionalValue` helper (Phase 0c).

```tsx
// Before:
<Form.Item name={itemName}>
  <Switch />
</Form.Item>

// After:
<Switch
  value={resolveConditionalValue(useOptimizerFormStore.getState(), itemName)}
  onChange={(value) => useOptimizerFormStore.getState().setConditionalValue(itemName, value)}
/>
```

### Teammate fields

```tsx
// Before:
<AntDForm.Item name={[teammateProperty, 'characterId']}>
  <CharacterSelect />
</AntDForm.Item>

// After:
<CharacterSelect
  value={useOptimizerFormStore((s) => s.teammates[index].characterId)}
  onChange={(value) => useOptimizerFormStore.getState().setTeammateField(index, 'characterId', value)}
/>
```

## Side Effects Migration

The `onValuesChange` callback currently handles:

1. **`syncFormToStore`** — eliminated (no form to sync)
2. **`updateTeammate`** — move into `setTeammateField` action or keep as explicit call in onChange
3. **`updateConditionalChange`** — move into `setConditionalValue` action
4. **Character switching** (`characterId` change) — move into `setCharacterId` action which calls `OptimizerTabController.updateCharacter`
5. **Rank reordering** — move into `setRank` action which calls `DB.insertCharacter`
6. **Add new character** — move into relevant actions or keep in onChange
7. **Permutation recalculation** — already handled by `recalculatePermutations()` (Phase 0c)

## Loading Saved Builds

### Character form load (`updateCharacter`)

Currently: `formToDisplay(form)` → `setFieldsValue(displayFormValues)` → `onValuesChange` fires

After: `internalToDisplay(form)` → merge with `createDefaultFormState()` → set store state directly → call `recalculatePermutations()`

### `loadCharacterBuildInOptimizer` (db.ts)

Currently: ~30 individual `form.setFieldValue` calls

After: Build a complete state patch object, call a single `loadBuild(patch)` store action

## Scope

### Files to modify (~25 files)

**Store changes:**
- `useOptimizerFormStore.ts` — add `setConditionalValue`, `loadForm`, `loadBuild` actions; add side effects to existing actions
- `optimizerFormSync.ts` — delete (or gut to just exports if anything depends on it)

**Form.Item conversions (13 files):**
- `CharacterSelectorDisplay.tsx` (6 items)
- `OptimizerOptionsDisplay.tsx` (9 items)
- `EnemyConfigurationsDrawer.tsx` (7 items)
- `RelicMainSetFilters.tsx` (6 items)
- `StatSimulationDisplay.tsx` (7 items)
- `ComboFilter.tsx` (4 items)
- `FormStatRollSlider.tsx` (3 items)
- `TeammateCard.tsx` (6 items)
- `CombatBuffsDrawer.tsx` (1 item)
- `FormSetConditionals.tsx` (4 items)
- `FormSlider.tsx` (2 items)
- `FormSwitch.tsx` (1 item)
- `FormSelect.tsx` (1 item)
- `FilterRow.tsx` (2 items)
- `TurnAbilitySelector.tsx` (1 item)

**Dual-write removal (11 files):**
- Remove all `window.optimizerForm.setFieldValue/setFieldsValue` lines added in Phase 0c

**Side effect migration:**
- `OptimizerForm.tsx` — delete onValuesChange, delete AntDForm wrapper
- `optimizerTabController.ts` — rewrite `updateCharacter` to load into store directly
- `db.ts` — rewrite `loadCharacterBuildInOptimizer`

**Cleanup:**
- `optimizerFormTransform.ts` — delete `formToDisplay`, `displayToForm`; keep `emptyFilters` and `statFiltersFromForm` if still used
- `window.ts` — remove `optimizerForm` and `onOptimizerFormValuesChange` from Window type

## Success Criteria

- `npm run typecheck:fast` passes
- `npm run vitest:fast` — no regressions
- Zero references to `window.optimizerForm` in codebase
- Zero `Form.Item` in optimizer form files
- Zero `formToDisplay` / `displayToForm` calls
- Optimizer runs correctly end-to-end (manual test)
