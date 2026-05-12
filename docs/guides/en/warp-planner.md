# Warp Planner

## Settings

### Jades / Passes

Enter your current jade and pass counts. 160 jades = 1 warp. Passes convert 1:1.

### Banner

- New: Planning for a banner where you have no existing copies.
- Rerun: Planning for a character you already have copies of. Lets you set your current Eidolon / Superimposition levels as a starting point.

### Strategy

Choose which goal to target first. After the primary goal, the assumed order is E0 -> S1 -> E6 -> S5.

```
E0 first:  E0 -> S1 -> E6 -> S5
E1 first:  E1 -> S1 -> E6 -> S5
E2 first:  E2 -> S1 -> E6 -> S5
E3 first:  E3 -> S1 -> E6 -> S5
E4 first:  E4 -> S1 -> E6 -> S5
E5 first:  E5 -> S1 -> E6 -> S5
E6 first:  E6 -> S1 -> S5
S1 first:  S1 -> E6 -> S5
```

### Starlight

Starlight earned from 5★ pulls can be spent on passes (20 starlight = 1 pass). Select your expected refund rate to factor this into the total warp count.

### Additional resources

Add estimated warp income from upcoming patch phases. Options cover F2P, Express Pass, and Battle Pass variants, split by patch version and half-patch.

- F2P: Regular login income and events
- Express: Monthly express pass + events
- BP & Express: Battle pass + Monthly express pass + events

Source: Nivskisl on Telegram

### Character / Light Cone

- Pity counter: The number of pulls since your last 5★ on that banner
- Current: Your existing eidolon or superimposition level (rerun only)
- Guaranteed: Whether the next successful warp is guaranteed to be rate-up

## Results

### Success chance

The probability of reaching that milestone given your available warps.

### Average

The expected number of warps needed to reach that milestone.

## Calculations

Results are computed using exact probability math, not simulations. Pull probabilities are derived directly from the pity formula and summed across all milestones to produce fully accurate results.

- Base character pull rate: 0.6%
- Base light cone pull rate: 0.8%
- Character rate-up chance: 50% + (1/8 * 50%) = 56.25%
- Light Cone rate-up chance: 75% + (1/8 * 25%) = 78.125%

[More info on the rate-up system](https://www.reddit.com/r/HonkaiStarRail/comments/1cib3kb/the_pity_system_of_honkai_star_rail_is_actually/)

## FAQ

- Q: Why are my numbers different from other warp calculators?
- A: Most tools run Monte Carlo simulations and use 50/50 and 75/25 rate-up odds. This calculator uses exact probability math and the correct rates of 56.25% and 78.125%. [More info](https://www.reddit.com/r/HonkaiStarRail/comments/1cib3kb/the_pity_system_of_honkai_star_rail_is_actually/)
