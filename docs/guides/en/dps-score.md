# DPS Score

## What is DPS Score?

DPS Score is a damage calculation based metric for accurately scoring how optimal the character's relics are for
maximizing damage in combat.

This score is calculated by using the optimizer to simulate the character's combat stats and rates the build based on
how much the relics contribute to damage, for a more accurate evaluation than scores based solely on stat weights.

The scoring calculation takes into consideration:

* Character eidolons / light cone / superimpositions
* Teammate eidolons / light cone / superimpositions
* Combat passives and buffs from abilities and light cones
* Team composition and teammate buffs
* Character ability rotations
* Stat breakpoints
* Stat overcapping
* Relic set effects
* Super break
* ...etc

## How is it calculated?

At its heart, this score is calculated using a Basic / Skill / Ult / FuA / DoT / Break ability damage rotation
predefined per character. These simulations use the optimizer's default conditional settings for the character /
teammates / light cones / relic sets, and the damage sum is then used to compare between builds.

### Simulation benchmarks

The scoring algorithm generates three builds to measure the damage of the original character against.

* Baseline (0%) - No substats, no main stats
* Benchmark (100%) - A strong build, generated following certain rules with a realistic distribution of 48x min rolls
* Perfection (200%) - The perfect build, generated with an ideal distribution of 54x max rolled substats

The original character's build is scored based on how its Combo DMG compares to the benchmark percentages.The benchmark
and perfection builds will always match the original character's SPD.

### 100% benchmark ruleset

The 100% benchmark character is designed to be a strong and realistic build that is difficult to reach, but attainable
with some character investment into relic farming. The following ruleset defines how the build is generated and why it
differs from the perfect build.

* The default damage simulation uses a common team composition and the character's BiS relic + ornament set
* The 100% benchmark uses the same eidolon and superimposition as the original character, at level 80 and maxed traces
* The 100% benchmark has 4 main stats and 48 total substats: 8 from each gear slot
* Each substat is equivalent to a 5 star relic's low roll value, except for SPD which uses mid rolls
* First, 2 substats are allocated to each substat type, except for SPD
* Substats are then allocated to SPD to match the original character's in-combat SPD
* The remaining substats are then distributed to the other stats options to maximize the build's damage output
* The resulting build must be a substat distribution that is possible to make with the in-game sub and main stat
  restrictions (for example, relics with a main stat cannot also have the same substat, and no duplicate substat slots
  per piece, etc)
* An artificial diminishing returns penalty is applied to substats with greater than `12 - (2 * main stats)` rolls, to
  simulate the difficulty of obtaining multiple rolls in a single stat

This process is repeated through all the possible main stat permutations and substat distributions until the highest
damage simulation is found. That build's damage is then used as the standard for a 100% DPS Score.

### 200% benchmark ruleset

The 200% perfection character follows a similar generation process with a few differences.

* 54x max roll substats
* No diminishing returns penalty
* All substats are ideally distributed, but the build must still be possible to make

### Score normalization

All simulation scores are normalized by deducting a baseline damage simulation. The baseline uses the same eidolon and
light cone, but no main stats and no substats. This adjusts for the base amount of damage that a character's kit deals,
so that the DPS Score can then measure the resulting damage contribution of each additional substat.

### Relic / ornament sets

Each character has a defined BiS set, and a few other equivalent sets that can be considered similar in performance. If
the original character's sets matches any of the acceptable sets, the character will be scored against a benchmark
generated matching that set, otherwise the original character will be scored against the BiS.

### Stat breakpoint penalty

Certain characters will have breakpoints that are forced. For example, 120% combat EHR on Black Swan to maximize her
passive EHR to DMG conversion, and to land Arcana stacks. Failing to reach the breakpoint will penalize the DPS Score
for the missing percentage. This penalty applies to both the original character and the benchmark simulations but not
the baseline.

### Formula

The resulting formula is:

* If DMG < 100% benchmark
    * `DMG Score = (character dmg - 0% baseline dmg) / (100% benchmark dmg - 0% baseline dmg)`
* If DMG ≥ 100% benchmark
    * `DMG Score = 1 + (character dmg - 100% benchmark dmg) / (200% perfect dmg - 100% benchmark dmg)`

## What are the grade thresholds?

Grading is based on the benchmark as 100% and perfection as 200%.

```
* 150% - AEON  [Verified relics only]
* 135% - WTF+  ↑ 9%
* 126% - WTF   ↑ 8%
* 118% - SSS+  ↑ 7%
* 111% - SSS   ↑ 6%
* 105% - SS+   ↑ 5%
* 100% - SS    [Benchmark]
* 95% - S+
* 90% - S
* 85% - A+
* 80% - A
* 75% - B+
* 70% - B
* 65% - C+
* 60% - C
* 55% - D+
* 50% - D
* 45% - F+
* 40% - F
```

## FAQs

### Why does the sim match speed?

Speed is controlled separately from the other stats because damage isn't comparable between different speed thresholds.
For example, higher speed can actually result in lower damage with Bronya as a teammate if the speed tuning is thrown
off. To make damage comparisons fair, we equalize the speed variable by forcing the sim's substats to match the original
character's combat speed.

### Why does a build score lower even though it has higher Sim Damage?

The benchmark sims have to equalize speed, so if the higher damage build has lower speed, then it will be compared to
benchmark builds at that same lower speed, and therefore may score lower. In general this means that the sim will
reallocate every reduced speed roll into a damage stat instead.

### What's the reasoning behind the benchmark simulation rules?

The simulation rules were designed to create a realistic benchmark build for 100% DPS Score, which should be difficult
to achieve yet possible with character investment. After trialing many methodologies for generating simulation stats,
this set of rules produced the most consistent and reasonable 100% benchmarks across all characters and builds.

The spread of 2 substats across all stat options provides some baseline consistency, and simulates how substats are
imperfectly distributed in actual player builds. The spread rolls also help to balance out characters that are more stat
hungry and require multiple stats to be effective, vs characters that only need two or three stats.

Applying diminishing returns to high stacking substats is a way to make the benchmark fair for characters that primarily
scale off of a single stat, for example Boothill and break effect. The ideal distribution will want every relic roll to
go into break effect, but stacking 5x rolls of a single stat on a relic is extremely rare / unrealistic in practice, so
the simulation rules add diminishing returns to account for that.

### Why are the scores different for different teams?

Team buffs and synergy will change the ideal benchmark simulation's score. For example, a benchmark sim with Fu Xuan on
the team may invest more substats into Crit DMG instead of Crit Rate since her passive Crit Rate will change the optimal
distribution of crit rolls. Teams should be customized to fit the actual teammates used for the character ingame for an
accurate score.

### Why are certain stat breakpoints forced?

The only forced breakpoints currently are Effect Hit Rate minimums for DoT characters. Take Black Swan for example, the
purpose of forcing the sim to use her 120% breakpoint is so it can't just ignore EHR to chase more maximum DoT damage.
EHR is more than just DMG conversion as it also lets her land Arcana debuffs to reach her 7th Arcana stack for DEF pen.
The penalty is calculated as a 1% deduction per missing roll from the breakpoint.

`dmg scale = min(1, (breakpoint - combat stat) / (min stat value))`

### How were the default simulation teams / sets chosen?

The defaults come from a combination of usage statistics and community guidance. Best in slot sets and teammates will
change with new game updates, so the default parameters may also change. Please visit the Discord server for suggestions
and feedback on the scoring design.

### Why is a character scoring low?

The `Damage Upgrades` section will give a quick overview of the sets and stats that could be improved. Substat upgrades
will show the damage increase for a single max roll. For a more detailed explanation, the full simulation is detailed
below the character card, including the benchmark character's stat distribution, basic stats, combat stats, and main
stats. Comparing the original character's stats to the benchmark character's stats is helpful to show the difference in
builds and see where to improve.

An often underestimated component of the build is completed BiS set effects. Set effects can play a large part in
optimizing a character's potential damage output and rainbow or broken sets will often score worse than full sets.
