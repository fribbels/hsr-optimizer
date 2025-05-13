# DPS Score

## TLDR

*DPS score compares a build's damage in a single ability rotation against simulated benchmark builds with ideal substat
distributions, mirroring the same team / eidolons / superimpositions / speed. The percentage reflects how close the
relics are to perfection, where 100% is a strong endgame build, and 200% is the best possible build with absolute
perfect relics.*

*The score and Combo DMG are measured relative only to the chosen team setup and should not be used to compare across
different configurations.*

See the [#FAQs](https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/dps-score.md#faqs) section for common
questions.

<img width="1091" alt="image" src="https://github.com/user-attachments/assets/f1a888f6-2277-4d77-a3f3-5682c0f27dbb" />

## What is DPS Score?

DPS Score is a damage based metric for scoring how optimal the character's relics are for maximizing damage in the given
team configuration.

This score is calculated by simulating the character’s combat stats through the optimizer and comparing the build’s
damage performance to generated benchmark builds.
By measuring actual damage output rather than just counting substats, this score gives a more accurate evaluation of
build quality than other scores based solely on stat weights.

The scoring calculation takes into consideration:

* Character eidolons / light cone / superimpositions
* Teammate eidolons / light cone / superimpositions
* Combat passives and buffs from abilities / light cones
* Character ability rotations
* Stat breakpoints
* Stat overcapping
* Relic set effects
* Super break, memosprites, all other damage types
* ...etc

Note: The score calculation does *not* take into consideration:

* Action advances and turn manipulation
* Energy regeneration
* Stacking frequency

## How is it calculated?

Damage is calculated using a predefined ability rotation for each character, based on the optimizer’s default
conditional settings for teammates, light cones, and relic sets.
The resulting total damage, labeled "Combo DMG" is then used to compare builds.

<img width="1117" alt="image" src="https://github.com/user-attachments/assets/07fdccc5-bd9a-4950-9f7f-03cef39ed3c9" />

### Simulation benchmarks

The scoring algorithm generates three benchmark builds to compare Combo DMG against:

* Baseline (0%) - No substats, no optional main stats, using benchmark sets
* Benchmark (100%) - A strong build, generated following certain rules with a realistic distribution of 48x min rolls
* Perfection (200%) - The perfect build, generated with an ideal distribution of 54x max rolled substats

The 100% benchmark and 200% benchmark will match the original character's SPD.

### 100% benchmark ruleset

The 100% benchmark character is designed as a strong yet realistic build that is difficult to reach, but can be achieved
with reasonable investment in relic farming. The following ruleset defines how the build is generated and how it differs
from the perfect build.

* The default damage simulation uses a common team composition and the character's BiS relic + ornament set
* The 100% benchmark uses the same eidolons and superimpositions as the original character, at level 80 and maxed traces
* The 100% benchmark has 6 main stats and 48 total substats: 8 from each gear slot
* Each substat is equivalent to a 5 star relic's low roll value, except for SPD which uses mid rolls
* First, 2 substats are allocated to every substat type, except for SPD
* Substats are then allocated to SPD to match the original character's in-combat SPD
* The remaining substats are then distributed to the other substat options to maximize the build's damage output
* The resulting build must be a substat distribution that is possible to make with the in-game sub and main stat
  restrictions (for example, relics with a main stat cannot also have the same substat, and no duplicate substat slots
  per piece, etc)
* An artificial diminishing returns penalty is applied to substats with greater than `12 - (2 * main stats)` rolls, to
  simulate the difficulty of obtaining multiple rolls in a single stat

This process is repeated through all the possible main stat permutations and substat distributions until the highest
damage simulation is found. Finally that build's Combo DMG is then used as the standard for a 100% DPS Score.

### 200% benchmark ruleset

The 200% perfection character follows a similar generation process with a few differences.

* 54x max roll substats
* No diminishing returns penalties
* All substats are ideally distributed, but the build must still be possible to make

<img width="950" alt="image" src="https://github.com/user-attachments/assets/466a4033-0909-4224-a11f-a27ab261cac1" />

### Score normalization

DPS score percentages are normalized by deducting a baseline damage simulation. The baseline benchmark (0%) uses the
same relic sets and team setup,
but no body / feet / sphere / rope main stats, and no substats. This adjusts for the base amount of damage that a
character's kit deals,
so that the DPS Score can then measure the resulting damage contribution of each additional substat.

### Relic / ornament sets

Each character has a predefined BiS set, and potentially other sets that can be considered similar in performance. If
the original character's sets matches any of the equivalent sets, the benchmarks will then also match that set,
otherwise the original character will be scored against the BiS.

### Stat breakpoint penalty

Certain characters will have breakpoints that are forced. For example, 120% combat EHR on Black Swan to maximize her
passive EHR to DMG conversion, and to land Arcana stacks. Failing to reach the breakpoint will penalize the DPS Score
for the missing percentage. This penalty applies to all simulations.

### Formula

The resulting formula is:

* If DMG < 100% benchmark
    * `DMG Score = (character dmg - 0% baseline dmg) / (100% benchmark dmg - 0% baseline dmg)`
* If DMG ≥ 100% benchmark
    * `DMG Score = 1 + (character dmg - 100% benchmark dmg) / (200% perfect dmg - 100% benchmark dmg)`

## Tier thresholds

Grading is based on the benchmark as 100% and perfection as 200%.

```
* 150% - AEON  [Verified relics only]
* 140% - WTF+  ↑ 10%
* 130% - WTF   ↑ 9%
* 121% - SSS+  ↑ 8%
* 113% - SSS   ↑ 7%
* 106% - SS+   ↑ 6%
* 100% - SS    [100% Benchmark]
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

Only real relics imported by the Reliquary Archiver or the Showcase tab are considered verified.

## Upgrades

![image](https://github.com/user-attachments/assets/b148617b-4ce4-4a84-99c0-a1092460e75d)

This section shows the potential damage and score improvements from upgrading relics.

* Substat upgrade comparisons
  * Comparisons for adding 1 additional max roll of each substat
* Main stat upgrade comparisons
  * The sets upgrade will show a comparison against the character's predefined BIS set, if the current set is not in the matched sets list.
  * The main stats upgrade will show the increase or decrease in damage from directly swapping current main stat to another. This does not include any substat changes, so if the main stat is already a substat, the assumption would be that the rest of the build would get reshuffled to fit the substat. This does not include comparisons against SPD boots or ERR ropes, since those stats cannot be compared under this framework.

## FAQs

### Why does a build score lower compared to another build, even though it has higher Combo DMG?

There are few possible reasons:

* Team / Eidolon / Superimposition / Light cone difference - Combo DMG should not be compared across different
  configurations. Different setups will provide different combat buffs, which change the optimal distribution of
  substats. Combo DMG measures a single ability rotation and does not account for action advances, energy regen, etc
  across different teams.
* Speed difference - The benchmark sims have to equalize speed, so if the higher damage build has lower speed, then it
  will be compared to
  benchmark builds at that same lower speed, and therefore may score lower. In general this means that the sim will
  reallocate every reduced speed roll into a damage stat instead. Use the Custom SPD Benchmark feature to equalize SPD
  breakpoints.
* Relic set differences - Some relic sets are considered equivalent, when they can be optimal in certain scenarios, and
  the benchmarks will match those sets. For example, Eagle of Twilight Line is often less Combo DMG, but the 4p passive
  is often optimal in zero cycle scenarios.

### Why did the score go down after upgrading an eidolon or superimposition?

Different buffs from eidolons / superimpositions will change the value of each stat, and can change the optimal
distribution of substats in the benchmarks.

For an extreme example, suppose upgrading some character from E0 to E1 gave them +100% Crit Rate. Suddenly that would
devalue all Crit Rate rolls on every relic because the character is already overcapped. If the relics don't change, the
character's score would then decrease, because the simulated benchmarks will reallocate their substats to Crit DMG and
ATK % rather than keep useless Crit Rate.

Note that lower score doesn't mean the build does less damage at E1 compared to E0, it means that the *relics are less
optimal*.

### Why does the simulation match speed?

Speed is controlled separately from the other stats because damage isn't comparable between different speed thresholds.
For example, higher speed can actually result in lower damage with Bronya as a teammate if the speed tuning is thrown
off. To make damage comparisons fair, we equalize the speed variable by forcing the sim's substats to match the original
character's combat speed.

### Why are the scores different for different teams?

Team buffs and synergy will change the ideal benchmark simulation's score. For example, a benchmark sim with Fu Xuan on
the team will invest more substats into Crit DMG instead of Crit Rate, since her passive Crit Rate will increase the
value of Crit DMG rolls.
Teams should be customized to fit the actual teammates used for the character ingame for an accurate score.

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
the 100% simulation rules add diminishing returns to account for that.

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
