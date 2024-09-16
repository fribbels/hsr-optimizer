# WebGPU optimizer design

## Overview

The goal is to improve the optimization algorithm performance with GPU acceleration using WebGPU.

The first phase of implementation is complete - we now have parity between the CPU and GPU feature set.

## Performance

Initial beta testing shows performance in the billions of permutations per second, with higher end machines
observing speed around 2.2 billion permutations/second on a NVIDIA GeForce RTX 4080 SUPER, and average / low end
machines maxing out at around 1.0 billion permutations/second.

![](https://i.imgur.com/YoWrhwv.png)

Further performance optimizations are planned to maximize GPU utilization & improve algorithmic efficiency.

## Future state

`TODO`

## Types

Wgsl has no 64 bit support. Type casting generally has to be done manually.
General rule of thumb: most optimization values should be calculated and stored as f32s,
indices as i32s, conditionals and results as f32s. Prefer structs for related values where possible.

The values that can exceed 32 bit limits will need special handling, they are:

* Global permutation id
    * This is calculated by: `global_invocation_index + permutation_offset`
    * i.e. `workgroup_index * workgroup_size + local_invocation_index + permutation_offset`
    * This is the permutation number which tells us which relics to use
    * We have to implement 64 bit math with 32 bit ints to use this value
* ?

## Input

The kernel will take the following inputs (group/bindings/scope TBD):

```wgsl
@group(0) @binding(0) var<storage, read_write> params : Params;
@group(0) @binding(1) var<storage, read_write> relics : array<Relic>;
@group(0) @binding(2) var<storage, read_write> results : array<f32>
@group(1) @binding(0) var<storage, read_write> ornamentSetSolutionsMatrix : array<i32>;
@group(1) @binding(0) var<storage, read_write> relicSetSolutionsMatrix : array<i32>;
```

* params - Contains the optimizer form: user options, teammate configs, filters, global index offset, etc
* relics - Input relic stats & set, condensed into a struct of f32s
* results - Output array. Every permutation generates a single f32 result, negative for failed filters
* ornamentSetSolutionsMatrix - Relic set combination lookup table - More details down the page
* relicSetSolutionsMatrix - Ornament set combination lookup table - More details down the page

## Output

The GPU component just acts as a very fast filter.
Each permutation will generate a single value output, stored in a f32 array.

The difference here is the JS optimizer outputs all the values from the worker,
then reassembles it into a stats row. In this new design we output a single f32,
then recalculate the entire stats object in JS, but only for the values that pass the
GPU filter.

## Relic set filtering

In the prototype state we are passing in a boolean mask for each
relic set permutation. Where true is valid and false is invalid. This is
also used by the JS optimizer for simplicity.
For 20 sets this is 20^4 = 160,000 length.
This allows for O(1) lookup but the tradeoff is we have to pass
this large array into the GPU. Eventually this will probably exceed
the benefit of O(1) lookup when there are 40 or so relic sets, and then we will need
to look for a better alternative.

Ornament sets are only 16^2 = 256 so not their impact is not significant.

In wgsl the sets are calculated as i32 counts,
where each value is 0 (no set), 1 (2p), or 2(4p)

```wgsl
  c.sets.PasserbyOfWanderingCloud            = i32((1 >> (setH ^ 0)) + (1 >> (setG ^ 0)) + (1 >> (setB ^ 0)) + (1 >> (setF ^ 0)));
  c.sets.MusketeerOfWildWheat                = i32((1 >> (setH ^ 1)) + (1 >> (setG ^ 1)) + (1 >> (setB ^ 1)) + (1 >> (setF ^ 1)));
  c.sets.KnightOfPurityPalace                = i32((1 >> (setH ^ 2)) + (1 >> (setG ^ 2)) + (1 >> (setB ^ 2)) + (1 >> (setF ^ 2)));
```

## Conditionals

Stat summation can proceed as normal:

```wgsl
  c.HP  = (baseHP) * (1 + setEffects + c.HP_P + params.traceHP_P + params.lcHP_P) + c.HP + params.traceHP;
```

Conditional stats will use a select function for binary options:

```wgsl
  x.SKILL_BOOST += p2(c.sets.RutilantArena) * select(0.0f, 0.20f, x.CR >= 0.70);
```

Multiple option conditionals will use array lookups:

`Documentation TODO`

## Dynamic conditionals

`Documentation TODO`

## Algorithm stages

`Documentation TODO`

## Postcompute filter

`Documentation TODO`

## GPU limitations

`Documentation TODO`

## WGSL injection

`Documentation TODO`

## Stat dependencies

`Documentation TODO`

## Data structs

`Documentation TODO`

## Unit tests

Since we need a browser environment to run WebGPU, tests are run in headless Chromium on Playwright.
These work by injecting the test scripts into the browser console, creating/running the kernel there,
and inspecting the results.

Run with `npm run test:webgpu`