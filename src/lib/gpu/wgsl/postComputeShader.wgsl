@group(0) @binding(0) var<storage, read_write> results : array<f32>;

@compute @workgroup_size(256)
fn main(
  @builtin(workgroup_id) workgroup_id : vec3<u32>,
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
  @builtin(local_invocation_index) local_invocation_index: u32,
  @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  var hasResult = 0;
  let offset = local_invocation_index * 256 * 512; // 255 * 256 * 512 = 33423360

  for (var i: u32 = 511; i < 256 * 512; i += 512) { // 511
    let index = offset + i; // 33423360 + // 511
    if (results[index] != -512) {
      hasResult = 1;
      break;
    }
  }

  if (hasResult == 0) {
    results[offset] = -1024;
  }

  workgroupBarrier();
  storageBarrier();

  if (local_invocation_index != 0) {
    return;
  }

  var hasTotalResult = 0;
  for (var i: u32 = 0; i < 256 * 256 * 512; i += 256 * 512) {
    if (results[i] != -1024) {
      hasTotalResult = 1;
      break;
    }
  }

  if (hasTotalResult == 0) {
    results[0] = -2048;
  }
}