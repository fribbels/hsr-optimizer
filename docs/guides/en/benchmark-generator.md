# Benchmark Generator

## Overview

The benchmark generator visualizes the damage differences between main stats and relic set options, for a specifc team and speed setup.

![image](https://github.com/user-attachments/assets/e39b5690-c09b-4f9d-ad0c-5b542f2fab5b)

## Character / Light cone / Teammates

Benchmarks can only be compared within a specific character / light cone / team setup. The damage calculations are only for a single ability rotation, and 
team setups will change the rotation which invalidates any damage comparisons.

## 100% / 200% Benchmarks

These benchmark builds are generated following the DPS score ruleset:
* https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/dps-score.md#how-is-it-calculated

In summary: 
* 100% benchmark
  * A strong, realistic build designed to be able to clear all endgames with proper teams
  * 48 substats spread, low rolled, with a diminishing returns penalty on stacking a single stat
* 200% benchmark
  * The absolute best possible build, with perfect stats
  * 54 substats, max rolled, perfect distribution distributed, no diminishing returns penalty

These benchmarks provide two different views of build quality, as what's optimal for the perfect build may not always reflect what is realistically
possible for an average build.

## Settings

![image](https://github.com/user-attachments/assets/cc56eb28-1dae-48cb-b085-8cf0caf53012)


* Benchmark basic SPD
  * The out of combat SPD that all benchmarks will match
* Energy regen rope
  * When enabled, benchmarks will be forced to use ERR rope
* Sub DPS
  * When enabled, the character will not be the primary target for single target buffs
* Benchmark sets
  * Select the sets for benchmark comparisons. Selections will accumulate until cleared

## Build analysis

![image](https://github.com/user-attachments/assets/a67efd0c-479a-4077-8cbe-4df996a7b362)

Selecting a row will show an analysis of the build's substats and Combo DMG rotation. See the DPS Score / Optimizer documatation for how Combo DMG is calculated.

## FAQ

### Why does the 200% benchmark suggestions differ from the 100%?

The 200% benchmark can generate perfect builds with ideal substat distribution, which means it will find the absolute best build regardless of how unlikely the
relics are in reality. For example, for high speed builds, it may choose to skip SPD boots, and instead use ATK boots along with 30 SPD substats to reach the goal. Whereas
the 100% build would get penalized for stacking a single stat, to reflect the difficulty of rolling into a single stat repeatedly, and instead find that SPD boots are optimal 
for the 100% ruleset.

## Why are Crit Rate and Crit DMG bodies giving different damage results, if they have the same value?

The difference comes down to substat distribution:

In the 200% build, they will often produce the same damage, unless one of the CR / CD choices leads to a suboptimal distribution of crit stats. For example,
on a Jingliu + Fu Xuan team, she will have 67% CR by default after buffs. This means a 32.4% CR chest would put her at 99.4% CR, which means all her other relics
can't have CR substats without being wasted by overcap, so there would be unused substat slots that could have been CR, resulting in lower damage. 

The 100% build will also be affected by diminishing returns, where choosing a CR chest may force the build to fully stack CD substats, which is penalized for being 
extremely difficult to build in practice. 

