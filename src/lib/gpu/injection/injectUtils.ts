export function injectUtils(wgsl: string) {
  let inject = ''
  for (const stat of ['ATK', 'DEF', 'HP', 'SPD', 'CR', 'CD', 'EHR', 'BE', 'OHB', 'ERR']) {
    if (stat == 'ATK' || stat == 'DEF' || stat == 'HP' || stat == 'SPD') {
      inject += `
fn buffDynamic${stat}_P(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value * base${stat};
  evaluateDependencies${stat}(p_x, p_m, p_state);
}
      `

      inject += `
fn buffNonDynamic${stat}_P(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value * base${stat};
}
      `
      inject += `
fn buffMemoNonDynamic${stat}_P(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_m).${stat} += value * base${stat};
}
      `
    }

    inject += `
fn buffDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value;
  evaluateDependencies${stat}(p_x, p_m, p_state);
}
    `

    inject += `
fn buffMemoDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_m).${stat} += value;
  evaluateDependencies${stat}(p_x, p_m, p_state);
}
    `

    inject += `
fn buffNonDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value;
}
    `

    inject += `
fn buffMemoNonDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_m).${stat} += value;
}
    `

    inject += `
fn buffNonRatioDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_x).${stat} += value;
  evaluateNonRatioDependencies${stat}(p_x, p_m, p_state);
}
    `

    inject += `
fn buffMemoNonRatioDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_m: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>
) {
  if (value < 0.0001) {
    return;
  }
  (*p_m).${stat} += value;
  evaluateNonRatioDependencies${stat}(p_x, p_m, p_state);
}
    `
  }

  return wgsl + inject
}
