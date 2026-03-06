# Abilities Enum Migration: `createEnum` → `AbilityKind[]`

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace per-character `createEnum('BASIC', 'SKILL', ...)` abilities with typed `AbilityKind[]` arrays, eliminating redundant enum wrappers and gaining compile-time safety from the `AbilityKind` enum.

**Architecture:** Each character currently defines abilities via `createEnum(...)` which creates an identity map `{ BASIC: 'BASIC', SKILL: 'SKILL' }`. This is redundant — `AbilityKind.BASIC` is already `'BASIC'`. We replace the per-character enum with a plain `AbilityKind[]` array and use `AbilityKind.*` directly as keys in `actionDefinition`. Type signatures in `conditionals.ts` are tightened from `string` to `AbilityKind`.

**Tech Stack:** TypeScript, AbilityKind enum from `turnAbilityConfig.ts`

---

## Before/After Reference

**Before:**
```ts
import { AbilityEidolon, Conditionals, ContentDefinition, createEnum } from 'lib/conditionals/conditionalUtils'

export const ArlanAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

// in controller:
actionDeclaration: () => Object.values(ArlanAbilities),
actionDefinition: (action, context) => ({
  [ArlanAbilities.BASIC]: { hits: [...] },
  [ArlanAbilities.SKILL]: { hits: [...] },
  [ArlanAbilities.ULT]: { hits: [...] },
  [ArlanAbilities.BREAK]: { hits: [...] },
}),
```

**After:**
```ts
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'

export const ArlanAbilities: AbilityKind[] = [AbilityKind.BASIC, AbilityKind.SKILL, AbilityKind.ULT, AbilityKind.BREAK]

// in controller:
actionDeclaration: () => [...ArlanAbilities],
actionDefinition: (action, context) => ({
  [AbilityKind.BASIC]: { hits: [...] },
  [AbilityKind.SKILL]: { hits: [...] },
  [AbilityKind.ULT]: { hits: [...] },
  [AbilityKind.BREAK]: { hits: [...] },
}),
```

---

## Task 1: Update type signatures in `conditionals.ts`

**Files:**
- Modify: `src/types/conditionals.ts`

**Step 1: Add AbilityKind import and update types**

Add import at top:
```ts
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
```

Change these signatures (lines 28-32 and 89-93):

```ts
// ConditionalsController (base interface):
actionDeclaration?: () => AbilityKind[]
actionDefinition?: (action: OptimizerAction, context: OptimizerContext) => Partial<Record<AbilityKind, AbilityDefinition>>

// CharacterConditionalsController (required overrides):
actionDeclaration: () => AbilityKind[]
actionDefinition: (action: OptimizerAction, context: OptimizerContext) => Partial<Record<AbilityKind, AbilityDefinition>>
```

**Step 2: Update `actionDeclarations` in optimizer types**

File: `src/types/optimizer.ts:117`

Change:
```ts
actionDeclarations: string[],
```
to:
```ts
actionDeclarations: AbilityKind[],
```

Add the import for `AbilityKind` if not already present.

**Step 3: Run typecheck**

Run: `npm run typecheck:fast`

Expected: Type errors in character files (they still pass `string` instead of `AbilityKind`). This is expected — we fix them in subsequent tasks.

**Step 4: Commit**

```bash
git add src/types/conditionals.ts src/types/optimizer.ts
git commit -m "refactor: tighten ability type signatures to AbilityKind"
```

---

## Task 2: Migrate series 1000 characters (13 files)

**Files to modify:**
- `src/lib/conditionals/character/1000/Archer.ts`
- `src/lib/conditionals/character/1000/Arlan.ts`
- `src/lib/conditionals/character/1000/Asta.ts`
- `src/lib/conditionals/character/1000/DanHeng.ts`
- `src/lib/conditionals/character/1000/Herta.ts`
- `src/lib/conditionals/character/1000/Himeko.ts`
- `src/lib/conditionals/character/1000/Kafka.ts`
- `src/lib/conditionals/character/1000/KafkaB1.ts`
- `src/lib/conditionals/character/1000/March7th.ts`
- `src/lib/conditionals/character/1000/Saber.ts`
- `src/lib/conditionals/character/1000/SilverWolf.ts`
- `src/lib/conditionals/character/1000/SilverWolfB1.ts`
- `src/lib/conditionals/character/1000/Welt.ts`

**Per-file transformation (apply to ALL files in this task):**

1. **Remove `createEnum` from import** — delete it from the `conditionalUtils` import. If it was the only import, remove the line.
2. **Add `AbilityKind` import** — add `import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'`. If the file already imports from `turnAbilityConfig`, add `AbilityKind` to that import.
3. **Replace abilities declaration** — e.g. `export const ArlanAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')` → `export const ArlanAbilities: AbilityKind[] = [AbilityKind.BASIC, AbilityKind.SKILL, AbilityKind.ULT, AbilityKind.BREAK]`
4. **Replace `actionDeclaration`** — `() => Object.values(XxxAbilities)` → `() => [...XxxAbilities]`
5. **Replace `actionDefinition` keys** — `[XxxAbilities.BASIC]` → `[AbilityKind.BASIC]` for every ability key in the returned object.

**Step: Run typecheck**

Run: `npm run typecheck:fast`

**Step: Commit**

```bash
git add src/lib/conditionals/character/1000/
git commit -m "refactor: migrate series 1000 abilities to AbilityKind[]"
```

---

## Task 3: Migrate series 1100 characters (11 files)

**Files to modify:**
- `src/lib/conditionals/character/1100/Bronya.ts`
- `src/lib/conditionals/character/1100/Clara.ts`
- `src/lib/conditionals/character/1100/Gepard.ts`
- `src/lib/conditionals/character/1100/Hook.ts`
- `src/lib/conditionals/character/1100/Luka.ts`
- `src/lib/conditionals/character/1100/Lynx.ts`
- `src/lib/conditionals/character/1100/Natasha.ts`
- `src/lib/conditionals/character/1100/Pela.ts`
- `src/lib/conditionals/character/1100/Sampo.ts`
- `src/lib/conditionals/character/1100/Seele.ts`
- `src/lib/conditionals/character/1100/Serval.ts`
- `src/lib/conditionals/character/1100/Topaz.ts`

**Transformation:** Same per-file steps as Task 2.

**Step: Run typecheck**

Run: `npm run typecheck:fast`

**Step: Commit**

```bash
git add src/lib/conditionals/character/1100/
git commit -m "refactor: migrate series 1100 abilities to AbilityKind[]"
```

---

## Task 4: Migrate series 1200 characters (21 files)

**Files to modify:**
- `src/lib/conditionals/character/1200/Bailu.ts`
- `src/lib/conditionals/character/1200/Blade.ts`
- `src/lib/conditionals/character/1200/BladeB1.ts`
- `src/lib/conditionals/character/1200/Feixiao.ts`
- `src/lib/conditionals/character/1200/FuXuan.ts`
- `src/lib/conditionals/character/1200/Fugue.ts`
- `src/lib/conditionals/character/1200/Guinaifen.ts`
- `src/lib/conditionals/character/1200/Hanya.ts`
- `src/lib/conditionals/character/1200/Huohuo.ts`
- `src/lib/conditionals/character/1200/ImbibitorLunae.ts`
- `src/lib/conditionals/character/1200/Jiaoqiu.ts`
- `src/lib/conditionals/character/1200/JingYuan.ts`
- `src/lib/conditionals/character/1200/Jingliu.ts`
- `src/lib/conditionals/character/1200/JingliuB1.ts`
- `src/lib/conditionals/character/1200/Lingsha.ts`
- `src/lib/conditionals/character/1200/Luocha.ts`
- `src/lib/conditionals/character/1200/March7thImaginary.ts`
- `src/lib/conditionals/character/1200/Moze.ts`
- `src/lib/conditionals/character/1200/Qingque.ts`
- `src/lib/conditionals/character/1200/Sushang.ts`
- `src/lib/conditionals/character/1200/Tingyun.ts`
- `src/lib/conditionals/character/1200/Xueyi.ts`
- `src/lib/conditionals/character/1200/Yanqing.ts`
- `src/lib/conditionals/character/1200/Yukong.ts`
- `src/lib/conditionals/character/1200/Yunli.ts`

**Transformation:** Same per-file steps as Task 2.

**Step: Run typecheck**

Run: `npm run typecheck:fast`

**Step: Commit**

```bash
git add src/lib/conditionals/character/1200/
git commit -m "refactor: migrate series 1200 abilities to AbilityKind[]"
```

---

## Task 5: Migrate series 1300 characters (16 files)

**Files to modify:**
- `src/lib/conditionals/character/1300/Acheron.ts`
- `src/lib/conditionals/character/1300/Argenti.ts`
- `src/lib/conditionals/character/1300/Aventurine.ts`
- `src/lib/conditionals/character/1300/BlackSwan.ts`
- `src/lib/conditionals/character/1300/BlackSwanB1.ts`
- `src/lib/conditionals/character/1300/Boothill.ts`
- `src/lib/conditionals/character/1300/DrRatio.ts`
- `src/lib/conditionals/character/1300/Firefly.ts`
- `src/lib/conditionals/character/1300/Gallagher.ts`
- `src/lib/conditionals/character/1300/Jade.ts`
- `src/lib/conditionals/character/1300/Misha.ts`
- `src/lib/conditionals/character/1300/Rappa.ts`
- `src/lib/conditionals/character/1300/Robin.ts`
- `src/lib/conditionals/character/1300/RuanMei.ts`
- `src/lib/conditionals/character/1300/Sparkle.ts`
- `src/lib/conditionals/character/1300/SparkleB1.ts`
- `src/lib/conditionals/character/1300/Sunday.ts`
- `src/lib/conditionals/character/1300/TheDahlia.ts`

**Transformation:** Same per-file steps as Task 2.

**Step: Run typecheck**

Run: `npm run typecheck:fast`

**Step: Commit**

```bash
git add src/lib/conditionals/character/1300/
git commit -m "refactor: migrate series 1300 abilities to AbilityKind[]"
```

---

## Task 6: Migrate series 1400 characters (14 files)

**Files to modify:**
- `src/lib/conditionals/character/1400/Aglaea.ts`
- `src/lib/conditionals/character/1400/Anaxa.ts`
- `src/lib/conditionals/character/1400/Castorice.ts`
- `src/lib/conditionals/character/1400/Cerydra.ts`
- `src/lib/conditionals/character/1400/Cipher.ts`
- `src/lib/conditionals/character/1400/Cyrene.ts`
- `src/lib/conditionals/character/1400/Evernight.ts`
- `src/lib/conditionals/character/1400/Hyacine.ts`
- `src/lib/conditionals/character/1400/Hysilens.ts`
- `src/lib/conditionals/character/1400/Mydei.ts`
- `src/lib/conditionals/character/1400/PermansorTerrae.ts`
- `src/lib/conditionals/character/1400/Phainon.ts`
- `src/lib/conditionals/character/1400/TheHerta.ts`
- `src/lib/conditionals/character/1400/Tribbie.ts`

**Transformation:** Same per-file steps as Task 2.

**Edge case — Evernight.ts:381:** Also change `x.actionKind(EvernightAbilities.MEMO_SKILL)` → `x.actionKind(AbilityKind.MEMO_SKILL)`.

**Step: Run typecheck**

Run: `npm run typecheck:fast`

**Step: Commit**

```bash
git add src/lib/conditionals/character/1400/
git commit -m "refactor: migrate series 1400 abilities to AbilityKind[]"
```

---

## Task 7: Migrate series 1500 + 8000 characters (7 files)

**Files to modify:**
- `src/lib/conditionals/character/1500/Ashveil.ts`
- `src/lib/conditionals/character/1500/Sparxie.ts`
- `src/lib/conditionals/character/1500/Yaoguang.ts`
- `src/lib/conditionals/character/8000/TrailblazerDestruction.ts`
- `src/lib/conditionals/character/8000/TrailblazerHarmony.ts`
- `src/lib/conditionals/character/8000/TrailblazerPreservation.ts`
- `src/lib/conditionals/character/8000/TrailblazerRemembrance.ts`

**Transformation:** Same per-file steps as Task 2.

**Step: Run typecheck**

Run: `npm run typecheck:fast`

**Step: Commit**

```bash
git add src/lib/conditionals/character/1500/ src/lib/conditionals/character/8000/
git commit -m "refactor: migrate series 1500+8000 abilities to AbilityKind[]"
```

---

## Task 8: Remove `createEnum` from `conditionalUtils.ts` (if unused)

**Files:**
- Modify: `src/lib/conditionals/conditionalUtils.ts`

**Step 1: Verify no remaining usages**

Search for any remaining `createEnum` imports. Entity enums still use `createEnum`, so it must stay if entities still use it.

Run: `grep -r "createEnum" src/`

If `createEnum` is still imported by entity declarations, **keep it**. Only remove if zero imports remain.

**Step 2: Run full checks**

Run: `npm run typecheck:fast`
Run: `npm run vitest:fast`

**Step 3: Commit**

```bash
git commit -am "refactor: cleanup after abilities enum migration"
```

---

## Task 9: Final verification

**Step 1: Run typecheck**

Run: `npm run typecheck:fast`
Expected: No errors.

**Step 2: Run tests**

Run: `npm run vitest:fast`
Expected: All tests pass.

**Step 3: Verify no remaining old pattern**

Run: `grep -r "Abilities = createEnum" src/`
Expected: No matches.

Run: `grep -r "Abilities\.\w\+" src/lib/conditionals/character/`
Expected: No matches (all replaced with `AbilityKind.*`).
