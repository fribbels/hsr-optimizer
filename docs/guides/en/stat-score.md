# Stat Score

## Substat weight methodology

Substat weights are graded on a 0.0 to 1.0 scale in increments of 0.25, based on how valuable each stat is to the
character. Weights are evaluated based on the following general ruleset:

- Speed weight:
  - SPD is given a value of 1.0 for most character. This is due to the importance of speed tuning in team
    compositions, and the optimizer should be used to set a minimum speed breakpoint for the build.
  - SPD inherently is difficult to assign a value to since all SPD substats up to the desired breakpoint are max value
    while all SPD substats after the breakpoint have near zero value. The SPD value can also be customized to the
    desired value.

- CRIT Rate / CRIT Damage weight:
  - Crit DPS in general are given the weights 0.75 ATK | 1.0 SPD | 1.0 CR | 1.0 CD, unless they have any other special
    scaling.
  - ATK is weighted slightly lower than CR and CD rolls because in general crit substats will provide a higher boost
    to damage.

- HP / DEF / RES weight:
  - Supports defensive stats (HP / DEF) are set to 0.25 unless they scale with one of those stats.
  - Offensive supports are set to a RES weight of 0.25, while defensive sustains are set to a RES weight of 0.50.

These weights are the defaults, but each player may have different preferences.
The weights can be customized to fit different playstyles.
DPS characters should rely on the optimizer and Combat Score to evaluate their performance in combat,
since substats scores don't take into account external factors like team buffs or passive effects.

## Stat score calculations

Relic scores are displayed as a percent of the best achievable substat potential for that relic slot:
`RelicPotentialPct = weightedPotential / idealPotential * 100`.
The `idealPotential` is calculated from the theoretical best relic for the same slot and main stat context. If a weighted
substat is occupied by the main stat, the relic is compared against the best remaining achievable substats.

The weighted potential contribution is calculated by `WeightedPotential = weight * value * potentialScale`.
The weight of each stat is defined above, on a scale of 0 to 1.
The potential scale converts each substat value into grade-5 high-roll potential units. Crit DMG's high roll is `6.48`,
so `potentialScale = 6.48 / grade5HighRollValue`:

```
CD BE = 6.48 / 6.48 == 1.0
DEF% = 6.48 / 5.4 == 1.2
HP% ATK% EHR RES = 6.48 / 4.32 == 1.5
CR = 6.48 / 3.24 == 2
SPD = 6.48 / 2.6 == 2.49
```

Flat ATK / HP / DEF have their weight reduced to 40% of their equivalent percent stat's weight.

The potential scale uses the flat stat's own high-roll value.
In combination with the adjusted weights, this allows for flat stats to be scored when compared against
their % counterparts.

A letter grade is assigned from the relic's current potential percent in 5% steps:

```
F = 0%
F+ = 5%
D = 10%
D+ = 15%
C = 20%
C+ = 25%
B = 30%
B+ = 35%
A = 40%
A+ = 45%
S = 50%
S+ = 55%
SS = 60%
SS+ = 65%
SSS = 70%
SSS+ = 75%
WTF = 80%
WTF+ = 85%
```

Character scores are calculated as the average of the six equipped relic potential percentages.
Correct main stats are counted separately for the build summary, and relics with incorrect selectable main stats do not
receive a letter grade.

The optimizer's minimum weighted-roll filter is separate from potential percent scoring. It converts each substat value
to grade-5 min-roll units with `WeightedMinRolls = weight * value / grade5LowRollValue`, so a threshold of `1.0` means
one low roll of a weight-1 desired stat.

# Estimated TBP

The `Relic rarity upgrade comparisons` section shows a breakdown of substat roll quality as well as the statistical
rarity of the relic.

The intent of this display is to visualize the relative quality of the build's relics and estimate how much investment (
in Trailblaze Power) would be required to find an upgrade. Higher rarity relics do NOT always translate directly to
higher damage or DPS score, this
should just be used as a heuristic for farming prioritization while the optimizer should be used to determine the best
overall build for maximizing damage.

![image](https://github.com/user-attachments/assets/cf17632d-9c14-4244-9b67-05e026481428)

- Weighted Rolls

The sum of roll qualities x roll weights of all substats on the relic. Flat stats are weighted as 40% of their main stat
value. Each roll has a quality of 0.8, 0.9, or 1.0. For example, with default Topaz weights, the sphere in the
screenshot above has:

```
Weighted Rolls =
(0.9 + 0.8) * (0.75 * 0.40 ATK weight) +
(0.9 + 0.8 + 0.8) * (0.75 ATK% weight) +
(1.0 + 0.9) * (1.0 Crit DMG weight)
= 4.285
```

## Definitions

- Days / Estimated TBP

The number of days on average required to farm an upgrade to the number of weighted rolls on this relic. For the same
example above, this would mean that an expected average of 10,440 Trailblaze Power,
or roughly 44 days are required to farm a Fire DMG% main Duran sphere with higher than 4.285 weighted rolls.

- Perfection

This measures how close to the relic is to the maximum number of weighted rolls. For the example above, a 100%
perfection sphere for Topaz (0.75 ATK%, 1.0 SPD, 1.0 CR, 1.0 CD) would require 4 starting rolls, with ATK%, SPD, CR, CD,
then five additional rolls into
a 1.0 weight stat, all with max roll quality.

- Reroll Potential

The average change in perfection if the relic substats were to be rerolled. For example, the Topaz rope above has all
rolls into Crit Rate, which on average would highly likely be a downgrade if rerolled since the other 3 stats are not
desired. So the perfection
rating would drop by 25.7% on average.

## Calculations

The Estimated TBP feature a collaboration with IceDynamix, with the statistical theory
outlined [here](https://github.com/IceDynamix/est-tbp/blob/main/Estimated%20TBP.pdf).

Assumptions:

- 240 Trailblaze Power per day
- 2.1 relic drops per run
- 20% four line drops, 80% three line drops
- 25% correct part for relic sets, 50% correct part for ornament sets
- Equal chance for 0.8 / 0.9 / 1.0 roll quality
- [Main stat probabilities](https://github.com/fribbels/hsr-optimizer/blob/8185aaaeffe0c81355a19d0d26c858f5b251ec1a/src/lib/relics/estTbp/estTbp.ts#L85-L149)
- [Sub stat probabilities](https://github.com/fribbels/hsr-optimizer/blob/8185aaaeffe0c81355a19d0d26c858f5b251ec1a/src/lib/relics/estTbp/estTbp.ts#L172-L193)
