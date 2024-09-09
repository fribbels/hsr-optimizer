export function injectUtils(wgsl: string) {
  for (const stat of ['ATK', 'DEF', 'HP', 'SPD', 'CR', 'CD', 'EHR', 'BE', 'OHB', 'ERR']) {
    if (stat == 'ATK' || stat == 'DEF' || stat == 'HP' || stat == 'SPD') {
      wgsl += `
fn buffDynamic${stat}_P(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value * base${stat};
  evaluateDependencies${stat}(p_x, p_state);
}
      `

      wgsl += `
fn buffNonDynamic${stat}_P(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value * base${stat};
}
      `
    }

    wgsl += `
fn buffDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value;
  evaluateDependencies${stat}(p_x, p_state);
}
    `

    wgsl += `
fn buffNonDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value;
}
    `

    wgsl += `
fn buffNonRatioDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value;
  evaluateNonRatioDependencies${stat}(p_x, p_state);
}
    `
  }

  return wgsl
}
