# Stat Score

## Substat weight methodology

Substat weights are graded on a 0.0 to 1.0 scale in increments of 0.25, based on how valuable each stat is to the character. Weights are evaluated based on the following general ruleset:

* Speed weight:
    * SPD is given a value of 1.0 for every character. This is due to the importance of speed tuning in team compositions, and the optimizer should be used to maximize each character's stats at a certain speed breakpoint.


* CRIT Rate / CRIT Damage weight:
    * Crit DPS in general are given the weights 0.75 ATK | 1.0 SPD | 1.0 CR | 1.0 CD, unless they have any other special scaling.
    * ATK is weighted slightly than CR and CD rolls because in general crit substats will provide a higher boost to damage.


* HP / DEF weight:
    * Defensive supports are given 2.0 weight to distribute between HP and DEF.
    * For each additional (0.75 | 1.0) stat weight that they scale with, deduct 0.5 down to a minimum of 1.0.
    * If 2.0 still remains and one of the stats is worth more than the other (Huohuo and HP% for example), assign a 1.0 / 0.75 split.
    * Offensive supports follow the same ruleset, except they start with 1.5 weight to distribute between HP and DEF.

* RES weight:
    * Support characters are granted 0.5 RES weight by default, with an additional 0.25 weight if they have synergy with RES or have critical team-saving abilities.

These weights are the defaults, but each player may have different preferences.
Feel free to adjust the weights to fit a certain playstyle.
DPS characters should rely on the optimizer and Combat Score to evaluate their performance in combat,
since substats scores don't take into account external factors like team buffs or passive effects.

## Stat score calculations

Relic scores are calculated by `Score = substatScore / idealScore * 0.582`.
This allows for characters with fewer desired stats to achieve scores comparable to characters with many desired stats.

The idealScore is the substatScore for a theoretical perfect relic.
By adjusting the score to the maximum possible relic, this means that when a weighted substat is occupied by the main stat,
the score value of the remaining substat weights increases.

The substatScore is calculated by `SubstatScore = weight * normalization * value`.
The weight of each stat is defined above, on a scale of 0 to 1.
The normalization of each stat is calculated based on the ratio of their main stat values to Crit DMG with max value `64.8`:

```
CD BE = 64.8 / 64.8 == 1.0
DEF% = 64.8 / 54.0 == 1.2
HP% ATK% EHR RES = 64.8 / 43.2 == 1.5
CR = 64.8 / 32.4 == 2
SPD = 64.8 / 25.032 == 2.59
OHB = 64.8 / 34.561 == 1.87
ERR = 64.8 / 19.439 == 3.33
ELEMENTAL DMG = 64.8 / 38.88 == 1.67
```

Flat ATK/HP/DEF have a separate calculation:
Their weights are automatically calculated based on the weights given to their respective % counterparts
`% stat weight * flat stat low roll / (baseStats[stat] * 2 * % stat low roll)`.
The weight calculation for flat atk for Seele for example would be: `0.75 * 19 / (baseStats.ATK * 2 * 0.03888) = 0.75 * 19 / (640.33 * 2 * 0.03888) = 0.28619`.

The normalization is calculated based on the normalization for the respective % counterparts:
`64.8 / % main stat value * % stat high roll value / flat stat high roll value`.
In combination with the adjusted weights, this allows for flat stats to be accurately scored when compared against their % counterparts.

A letter grade is assigned based on the number of normalized min rolls of each substat.
The score for each min roll is equivalent to `5.1`
The general scale for grade by rolls is:

```
F = 1
D = 2
C = 3
B = 4
A = 5
S = 6
SS = 7
SSS = 8
WTF = 9
```

With a + rating assigned for an additional half roll.

Character scores are calculated by `Score = sum(relic scores) + sum(main stat scores)`.
Only the feet/body/sphere/rope relics have main stat scores.
The main stat score for a 5 star maxed relic is 64.8 if the main stat is optimal, otherwise scaled down by the stat weight.
Non 5 star relic scores are also scaled down by their maximum enhance.
Characters are expected to have 3 full sets, so 3 rolls worth of score is deducted for each missing set.

Relics with main stats (body/feet/sphere/rope) are granted extra rolls to compensate for the difficulty of obtaining optimal main stats with desired substats.
These numbers were calculated by a simulation of relic rolls accounting for main stat drop rate and expected substat value.
These rolls are first multiplied by the min roll value of `5.1` and then, if the main stat is not optimal, scaled down by the stat weight to obtain the bonus score value.

```
Body — HP %: 1.3
Body — ATK %: 1.3
Body — DEF %: 1.3
Body — CR: 1.7
Body — CD: 1.7
Body — OHB: 1.7
Body — EHR: 1.7
Feet — HP %: 1.0
Feet — ATK %: 1.0
Feet — DEF %: 1.0
Feet — SPD: 1.6
Sphere — HP %: 1.6
Sphere — ATK %: 1.6
Sphere — DEF %: 1.6
Sphere — Elemental DMG %: 1.8
Rope — HP %: 1.1
Rope — ATK %: 1.1
Rope — DEF %: 1.1
Rope — BE: 1.4
Rope — ERR: 2.0
```
