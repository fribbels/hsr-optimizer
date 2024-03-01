struct Matrix {
  numbers: array<f32>,
}

struct MatrixU {
  numbers: array<u32>,
}
struct MatrixI {
  numbers: array<i32>,
}

@group(0) @binding(0) var<storage, read_write> paramsMatrix : MatrixI;
@group(0) @binding(1) var<storage, read_write> relicsMatrix : Matrix;
@group(0) @binding(2) var<storage, read_write> resultsMatrix : MatrixI;

@group(1) @binding(0) var<storage, read_write> relicSetSolutionsMatrix : MatrixI;
@group(1) @binding(1) var<storage, read_write> ornamentSetSolutionsMatrix : MatrixI;
@compute @workgroup_size(16, 16)
fn main(
  @builtin(workgroup_id) workgroup_id : vec3<u32>,
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
  @builtin(local_invocation_index) local_invocation_index: u32,
  @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  let workgroup_index =
    workgroup_id.x +
    workgroup_id.y * num_workgroups.x +
    workgroup_id.z * num_workgroups.x * num_workgroups.y;

  let index = // global_invocation_index
    i32(workgroup_index * 256 +
    local_invocation_index);

  let lSize = paramsMatrix.numbers[0];
  let pSize = paramsMatrix.numbers[1];
  let fSize = paramsMatrix.numbers[2];
  let bSize = paramsMatrix.numbers[3];
  let gSize = paramsMatrix.numbers[4];
  let hSize = paramsMatrix.numbers[5];
  let xl = paramsMatrix.numbers[6];
  let xp = paramsMatrix.numbers[7];
  let xf = paramsMatrix.numbers[8];
  let xb = paramsMatrix.numbers[9];
  let xg = paramsMatrix.numbers[10];
  let xh = paramsMatrix.numbers[11];
  let relicSetCount = paramsMatrix.numbers[12];
  let ornamentSetCount = paramsMatrix.numbers[13];

  let l = (index % lSize);
  let p = (((index - l) / lSize) % pSize);
  let f = (((index - p * lSize - l) / (lSize * pSize)) % fSize);
  let b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
  let g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
  let h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

  let zl = (l+xl) % lSize;
  let yl = (l+xl-zl) / lSize;

  let zp = (p+xp+yl) % pSize;
  let yp = (p+xp+yl-zp) / pSize;

  let zf = (f+xf+yp) % fSize;
  let yf = (f+xf+yp-zf) % fSize;

  let zb = (b+xb+yf) % bSize;
  let yb = (b+xb+yf-zb) % bSize;

  let zg = (g+xg+yb) % gSize;
  let yg = (g+xg+yb-zg) % gSize;

  let zh = (h+xh+yg) % hSize;

  let head = i32(relicsMatrix.numbers[zh * 26]);
  let hands = i32(relicsMatrix.numbers[(zg + hSize) * 26]);
  let body = i32(relicsMatrix.numbers[(zb + hSize + gSize) * 26]);
  let feet = i32(relicsMatrix.numbers[(zf + hSize + gSize + bSize) * 26]);
  let planarSphere = i32(relicsMatrix.numbers[(zp + hSize + gSize + bSize + fSize) * 26]);
  let linkRope = i32(relicsMatrix.numbers[(zl + hSize + gSize + bSize + fSize + pSize) * 26]);

  let relicSetIndex = head + body * relicSetCount + hands * relicSetCount * relicSetCount + feet * relicSetCount * relicSetCount * relicSetCount;
  let ornamentSetIndex = planarSphere + linkRope * ornamentSetCount;
//  let relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount;
//  let ornamentSetIndex = setP + setL * ornamentSetCount;

  if (relicSetSolutionsMatrix.numbers[relicSetIndex] != 1 || ornamentSetSolutionsMatrix.numbers[ornamentSetIndex] != 1) {
    // Fail
    resultsMatrix.numbers[index] = 0;
  } else {
    // Pass
    resultsMatrix.numbers[index] = 1;
  }
}
