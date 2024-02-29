struct Matrix {
  numbers: array<f32>,
}

struct MatrixU {
  numbers: array<u32>,
}

@group(0) @binding(0) var<storage, read_write> headRelicsMatrix : Matrix;
@group(0) @binding(1) var<storage, read_write> handsRelicsMatrix : Matrix;
@group(0) @binding(2) var<storage, read_write> bodyRelicsMatrix : Matrix;
@group(0) @binding(3) var<storage, read_write> feetRelicsMatrix : Matrix;
@group(0) @binding(4) var<storage, read_write> planarSphereRelicsMatrix : Matrix;
@group(0) @binding(5) var<storage, read_write> linkRopeRelicsMatrix : Matrix;
//@group(0) @binding(6) var<storage, read_write> relicSetSolutionsMatrix : Matrix;;
//@group(0) @binding(7) var<storage, read_write> ornamentSetSolutionsMatrix : Matrix;
@group(0) @binding(6) var<storage, read_write> paramsMatrix : MatrixU;
@group(0) @binding(7) var<storage, read_write> resultsMatrix : MatrixU;

@compute @workgroup_size(16, 16)
fn main(
  @builtin(workgroup_id) workgroup_id : vec3<u32>,
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
  @builtin(local_invocation_index) local_invocation_index: u32,
  @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  // Guard against out-of-bounds work group sizes
//  if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
//    return;
//  }

//  resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);
//
//  let resultCell = vec2(global_id.x, global_id.y);
//  var result = 0.0;
//  for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
//    let a = i + resultCell.x * u32(firstMatrix.size.y);
//    let b = resultCell.y + i * u32(secondMatrix.size.y);
//    result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
//  }
//
//  let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);

  let workgroup_index =
    workgroup_id.x +
    workgroup_id.y * num_workgroups.x +
    workgroup_id.z * num_workgroups.x * num_workgroups.y;

  let global_invocation_index =
    workgroup_index * 256 +
    local_invocation_index;

  resultsMatrix.numbers[global_invocation_index] = global_invocation_index;
}
