@group(0) @binding(0) var<storage, read_write> results : array<f32>;
@compute @workgroup_size(256)
fn main(
  @builtin(workgroup_id) workgroup_id : vec3<u32>,
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
  @builtin(local_invocation_index) local_invocation_index: u32,
  @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
  var flag = 0;
  let offset = local_invocation_index * 256 * 512;

  for (var i: u32 = 511; i < 256 * 512; i += 512) {
    let index = offset + i;
    if (results[index] != -512) {
      flag = 1;
      break;
    }
  }

  if (flag == 0) {
    results[offset] = -1024;
  }

  workgroupBarrier();
  storageBarrier();

  if (local_invocation_index != 0) {
    return;
  }

  var skip: u32 = 256;
  for (var i: u32 = 0; i < 256; i += 1) {
    let index = i * 512 * 256;
    if (results[index] != -1024) {
      skip = i;
      break;
    }
  }

  if (skip > 0) {
    results[0] = -2048 - f32(skip);
  }
}
