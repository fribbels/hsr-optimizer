# Score Customization

## Traces

Select which traces are enabled / disabled.
All the traces are enabled by it may be useful to disable certain ones can be disabled to change stat thresholds.
e.g. Poet of Mourning Collapse SPD thresholds.

Stats modified by disabled traces will show an asterisk * on the showcase card.

## SPD precision

Select 1 decimal or 3 decimal precision.
1 is default, but SPD tuning characters may require the 3 precision view occasionally.

## SPD weight

Select the SPD weight value for relic scoring. Most characters are 1.0 weight by default, but if they are on a
team with action advance, it may be useful to switch to 0% weight to get a more accurate rating for relics.

This does not change the combat score, it only changes the relic and character scores.

## SPD benchmark

The SPD benchmark selector will force the benchmark simulations to target a specific SPD value. Only values which
are less than or equal to the character's current SPD can be chosen. This in general will allow the benchmarks
to reallocate any excess SPD stats into other damage stats.

This should be used when comparing characters against a certain SPD, for example a 0 SPD Acheron with Sparkle should
be measured against the Base SPD benchmark since the SPD stat does not make sense for Acheron on that team.

Scores with a modified SPD benchmark will show their SPD target on the DPS score display.

Note: Poet of Mourning Collapse has special handling here. When the character is wearing this set,
their SPD cannot be reduced by the SPD benchmark setting, but the benchmark builds will follow the setting.

## Buff priority

Select between designating the character the primary target of single target buffs or not.
When a character is on Buff Priority: Low, they will no longer be targeted with single target buffs from the team,
and will be labeled as a Sub DPS. This should give a more accurate rating for dual-carry team compositions where
another character gets the primary buffs.

The Combat Stats and DPS score ratings will adjust based on the selected buff priority. The label "(Sub DPS)" will
be added to the Combat Stats title.

At the time of writing, Sub DPS mode is enabled by default for:

* Tribbie
* Aventurine
* Fugue
* Serval
* Topaz
* Moze
* March 7th (Hunt)
