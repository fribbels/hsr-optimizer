import { generateWgslConstants } from "lib/gpu/wgsl/wgslConstants";
import { generateWgslTypes } from "lib/gpu/wgsl/wgslTypes";
import { generateWgslUtils } from "lib/gpu/wgsl/wgslUtils";

export function generateWgsl() {
  return `
${generateWgslConstants()}
${generateWgslTypes()}
${generateWgslUtils()}  
  `
}