# Benchmark Scoring

## TLDR

_Benchmark scoring compares a build's performance in a single ability rotation against simulated benchmark builds with
ideal substat distributions, mirroring the same team / eidolons / superimpositions / speed. The percentage reflects how
close the relics are to perfection, where 100% is a strong endgame build, and 200% is the best possible build with
absolute perfect relics._

_Four scoring modes are available depending on the character:_

- **DPS Benchmark** - measures total damage output (Combo DMG)
- **Heal Benchmark** - measures total healing output (Combo Heal)
- **Shield Benchmark** - measures total shield value (Combo Shield)
- **Support Benchmark** - measures buff value provided to teammates

Scores are measured relative only to the chosen team setup and should not be used to compare across different
configurations.

See the [#FAQs](https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/benchmarks.md#faqs) section for
common questions.

<img width="1091" alt="image" src="https://github.com/user-attachments/assets/f1a888f6-2277-4d77-a3f3-5682c0f27dbb" />

## What is Benchmark Scoring?

Benchmark scoring is a simulation-based metric for evaluating how optimal a character's relics are for their role.

The score is calculated by simulating the character's combat stats through the optimizer and comparing the build's
performance to generated benchmark builds.
By measuring actual simulated output rather than just counting substats, this score gives a more accurate evaluation of
build quality than other scores based solely on stat weights.

The scoring calculation takes into consideration:

- Character eidolons / light cone / superimpositions
- Teammate eidolons / light cone / superimpositions
- Combat passives and buffs from abilities / light cones
- Character ability rotations
- Stat breakpoints
- Stat overcapping
- Relic set effects
- All damage types (super break, memosprites, etc.) and all output types (heals, shields, buffs)
- ...etc

Note: The score calculation does _not_ take into consideration:

- Action advances and turn manipulation
- Energy regeneration
- Stacking frequency

## How is it calculated?

Performance is calculated using a predefined ability rotation for each character, based on the optimizer's default
conditional settings for teammates, light cones, and relic sets.
The resulting total value, labeled "Combo DMG", "Buff", "Combo Heal", or "Combo Shield" depending on the scoring
mode, is then used to compare builds.

<img width="1117" alt="image" src="https://github.com/user-attachments/assets/07fdccc5-bd9a-4950-9f7f-03cef39ed3c9" />

### Simulation benchmarks

The scoring algorithm generates three benchmark builds to compare against:

- Baseline (0%) - No substats, best main stats with SPD boots, using benchmark sets
- Benchmark (100%) - A strong build, generated following certain rules with a realistic distribution of 48x min rolls
- Perfection (200%) - The perfect build, generated with an ideal distribution of 54x max rolled substats

The 100% benchmark and 200% benchmark will match the original character's SPD.

### 100% benchmark ruleset

The 100% benchmark character is designed as a strong yet realistic build that is difficult to reach, but can be achieved
with reasonable investment in relic farming. The following ruleset defines how the build is generated and how it differs
from the perfect build.

- The default simulation uses a common team composition and the character's BiS relic + ornament set
- The 100% benchmark uses the same eidolons and superimpositions as the original character, at level 80 and maxed traces
- The 100% benchmark has 6 main stats and 48 total substats: 8 from each gear slot
- Each substat is equivalent to a 5 star relic's low roll value, except for SPD which uses mid rolls
- First, 2 substats are allocated to every substat type, except for SPD
- Substats are then allocated to SPD to match the original character's in-combat SPD
- The remaining substats are then distributed to the other substat options to maximize the build's output
- The resulting build must be a substat distribution that is possible to make with the in-game sub and main stat
  restrictions (for example, relics with a main stat cannot also have the same substat, and no duplicate substat slots
  per piece, etc)
- An artificial diminishing returns penalty is applied to substats that exceed a threshold, to simulate the difficulty
  of obtaining multiple rolls in a single stat (see [Diminishing returns](#diminishing-returns))
- For support / heal / shield modes, substats may also be allocated to RES to match the original character's Effect RES
  investment (see [RES equalization](#res-equalization))

This process is repeated through all the possible main stat permutations and substat distributions until the highest
scoring simulation is found. That build's score is then used as the standard for a 100% Benchmark Score.

#### Diminishing returns

When rolls in a single stat exceed a threshold, excess rolls are penalized. Rolls at or below the threshold are
unpenalized.

- **DPS stats:** `threshold = 12 - (2 * matching main stats)`, `effective = threshold + excess^0.75`
- **DPS SPD:** `threshold = 12 - (2 * matching main stats)`, `effective = threshold + excess^0.90`
- **Support / Heal / Shield stats:** `threshold = 6 - (1 * matching main stats)`, `effective = threshold + excess^0.75`
- **Support / Heal / Shield SPD:** `threshold = 6 - (1 * matching main stats)`, `effective = threshold + excess^0.90`

Where `excess = rolls - threshold`.

SPD uses a gentler exponent (0.90 vs 0.75) resulting in less aggressive diminishing returns, since SPD rolls are harder
to obtain.

Support modes use a lower threshold (halved base and penalty) which effectively lowers the 100% benchmark, making it
easier to achieve. This was chosen because:

- It helps both single-substat supports (e.g., Sunday stacking CRIT DMG) and multi-substat supports (e.g., Robin
  splitting ATK% + ATK)
- It doesn't distort the benchmark optimizer's substat allocation patterns
- DPS scoring is completely unaffected - the DPS diminishing returns formula remains unchanged

### 200% benchmark ruleset

The 200% perfection character follows a similar generation process with a few differences.

- 54x max roll substats
- No diminishing returns penalties
- All substats are ideally distributed, but the build must still be possible to make

<img width="950" alt="image" src="https://github.com/user-attachments/assets/466a4033-0909-4224-a11f-a27ab261cac1" />

### Score normalization

Score percentages are normalized by deducting a baseline simulation. The baseline benchmark (0%) uses the same relic sets
and team setup, with the best main stats (SPD boots forced) but no substats. This adjusts for the base amount of output
that a character's kit and main stats provide, so that the score can then measure the contribution of each additional
substat.

### Relic / ornament sets

Each character has a predefined BiS set, and potentially other sets that can be considered similar in performance. If
the original character's sets matches any of the equivalent sets, the benchmarks will then also match that set,
otherwise the original character will be scored against the BiS.

### Stat breakpoint penalty

Certain characters will have breakpoints that are forced. For example, 120% combat EHR on Black Swan to maximize her
passive EHR to DMG conversion, and to land Arcana stacks. Failing to reach the breakpoint will penalize the score for
the missing percentage. This penalty applies to all simulations.

Missing a SPD breakpoint (e.g. Cyrene's 180 SPD) will penalize by -25%.

### RES equalization

For support / heal / shield scoring, if a character has invested significantly in Effect RES (at least 30% above
baseline), the benchmark simulations will also allocate RES rolls to match. This deducts from the
benchmark's substat budget, so that characters building RES are scored fairly against benchmarks with equivalent
RES investment.

Additionally, when a character equips Broken Keel and has at least 30% Effect RES, the benchmark will allocate RES rolls
to reach the 30% activation threshold when evaluating Broken Keel set combinations. If a character equips Broken Keel but
does not have enough RES to activate it, a -25% penalty is applied to the score for failing to activate the set bonus.

RES equalization does not apply to DPS benchmarks.

### Flat substat handling

DPS scoring caps flat ATK / HP / DEF substats at 10 rolls in the benchmark simulation. Support / heal / shield modes
do not apply this cap, because flat stats can be the primary scaling stat for certain characters (e.g., flat ATK for
Robin's buff, flat DEF for Gepard's shield).

### Formula

The resulting formula is (where "value" refers to the mode-specific output - Combo DMG, Buff, Combo Heal, or Combo
Shield):

- If value < 100% benchmark
  - `Score = (character value - 0% baseline) / (100% benchmark - 0% baseline)`
- If value >= 100% benchmark
  - `Score = 1 + (character value - 100% benchmark) / (200% perfection - 100% benchmark)`

## Tier thresholds

Grading is based on the benchmark as 100% and perfection as 200%. The same grade scale applies to all scoring modes.

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

This section shows the potential damage and score improvements from upgrading relics. Upgrade comparisons are currently
available for DPS scoring only.

- Substat upgrade comparisons
  - Comparisons for adding 1 additional max roll of each substat
- Main stat upgrade comparisons
  - The sets upgrade will show a comparison against the character's predefined BIS set, if the current set is not in the matched sets list.
  - The main stats upgrade will show the increase or decrease in damage from directly swapping current main stat to another. This does not include any substat changes, so if the main stat is already a substat, the assumption would be that the rest of the build would get reshuffled to fit the substat. This does not include comparisons against SPD boots or ERR ropes, since those stats cannot be compared under this framework.

## FAQs

### Why does a build score lower compared to another build, even though it has a higher output value?

There are few possible reasons:

- Team / Eidolon / Superimposition / Light cone difference - Scores should not be compared across different
  configurations. Different setups will provide different combat buffs, which change the optimal distribution of
  substats. The score measures a single ability rotation and does not account for action advances, energy regen, etc
  across different teams.
- Speed difference - The benchmark sims have to equalize speed, so if the higher performing build has lower speed, then
  it will be compared to benchmark builds at that same lower speed, and therefore may score lower. In general this means
  that the sim will reallocate every reduced speed roll into another stat instead. Use the Custom SPD Benchmark feature
  to equalize SPD breakpoints.
- Relic set differences - Some relic sets are considered equivalent, when they can be optimal in certain scenarios, and
  the benchmarks will match those sets. For example, Eagle of Twilight Line is often less Combo DMG, but the 4p passive
  is often optimal in zero cycle scenarios.

### Why did the score go down after upgrading an eidolon or superimposition?

Different buffs from eidolons / superimpositions will change the value of each stat, and can change the optimal
distribution of substats in the benchmarks.

For an extreme example, suppose upgrading some character from E0 to E1 gave them +100% Crit Rate. Suddenly that would
devalue all Crit Rate rolls on every relic because the character is already overcapped. If the relics don't change, the
character's score would then decrease, because the simulated benchmarks will reallocate their substats to Crit DMG and
ATK % rather than keep useless Crit Rate.

Note that lower score doesn't mean the build does less damage at E1 compared to E0, it means that the _relics are less
optimal_.

### Why does the simulation match speed?

Speed is controlled separately from the other stats because performance isn't comparable between different speed
thresholds. For example, higher speed can actually result in lower damage with Bronya as a teammate if the speed tuning
is thrown off. To make comparisons fair, we equalize the speed variable by forcing the sim's substats to match the
original character's combat speed.

### Why are the scores different for different teams?

Team buffs and synergy will change the ideal benchmark simulation's score. For example, a benchmark sim with Fu Xuan on
the team will invest more substats into Crit DMG instead of Crit Rate, since her passive Crit Rate will increase the
value of Crit DMG rolls.
Teams should be customized to fit the actual teammates used for the character ingame for an accurate score.

### What's the reasoning behind the benchmark simulation rules?

The simulation rules were designed to create a realistic benchmark build for 100% score, which should be difficult to
achieve yet possible with character investment. After trialing many methodologies for generating simulation stats,
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

For DPS scoring, the `Damage Upgrades` section will give a quick overview of the sets and stats that could be improved.
Substat upgrades will show the damage increase for a single max roll. For a more detailed explanation, the full
simulation is detailed below the character card, including the benchmark character's stat distribution, basic stats, combat stats, and main
stats. Comparing the original character's stats to the benchmark character's stats is helpful to show the difference in
builds and see where to improve.

An often underestimated component of the build is completed BiS set effects. Set effects can play a large part in
optimizing a character's potential output and rainbow or broken sets will often score worse than full sets.

### Why are support scores sometimes higher or lower than expected?

Support / heal / shield modes use a lower diminishing returns threshold (`6 - (1 * main stats)` vs `12 - (2 * main
stats)` for DPS), which lowers the 100% benchmark. This makes scores slightly easier to achieve, reflecting the smaller
number of substats that support characters typically optimize for.

Additionally, support modes apply [RES equalization](#res-equalization) - if your character has high Effect RES, the
benchmark must also invest in RES rolls, which can change the scoring range.
