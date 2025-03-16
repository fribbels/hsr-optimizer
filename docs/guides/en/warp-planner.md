# Warp Planner

## Settings

### Strategy

Choose a strategy to define which primary goal to target first.
After the first target, the assumed goal order is E0 -> S1 -> E6 -> S5.

```
E0 first // E0 -> S1 -> E6 -> S5
E1 first // E1 -> S1 -> E6 -> S5
E2 first // E2 -> S1 -> E6 -> S5
E3 first // E3 -> S1 -> E6 -> S5
E4 first // E4 -> S1 -> E6 -> S5
E5 first // E5 -> S1 -> E6 -> S5
E6 first // E6 -> S1 -> S5
S1 first // S1 -> E6 -> S5
```

### Additional resources

Select the warp income options to add to the calculation.
These estimates are updated per beta version and will add to your Passes / Jades setting.

* F2P: Only events
* Express: Monthly express pass + events
* BP & Express: Battle pass + Monthly express pass + events

Source: Nivskisl on Telegram

### Character / Light Cone settings

* Pity counter: The number of pulls since your last pity on this banner
* Guaranteed: Whether the next successful warp is guaranteed rate-up character

## Results

### Success chance

The probability of obtaining (at least) the corresponding goal, if all the warp resources are used.

### Average #

On average, the number of warps that are needed to reach the corresponding goal.

### Calculations

* Base character pull rate: 0.6%
* Base light cone pull rate: 0.8%
* Character success rate: 50% + (1/8 * 50%) = 56.25%
* Light Cone success rate: 75% + (1/8 * 75%) = 78.125%

## FAQ

* Q: Why are these numbers different from other warp calculators?
* A: This calculator is more accurate, and takes into account the real character/light cone drop rate, which are 56.25%
  and 78.125% rather than 50/50 and 75/25
  respectively. [More Info](https://www.reddit.com/r/HonkaiStarRail/comments/1cib3kb/the_pity_system_of_honkai_star_rail_is_actually/)
