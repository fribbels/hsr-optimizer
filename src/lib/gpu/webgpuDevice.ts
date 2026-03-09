import { COMPUTE_ENGINE_CPU } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { webgpuNotSupportedNotification } from 'lib/interactions/notifications'
import { isFirefox } from 'lib/utils/TsUtils'

// Firefox and some GPUs require storage address space — uniform array<f32> violates the 16-byte stride
// requirement unless the 'uniform_buffer_standard_layout' feature is supported.
export function uniformCompatible(): boolean {
  return navigator.gpu?.wgslLanguageFeatures?.has('uniform_buffer_standard_layout')
}

export async function getWebgpuDevice(notify?: boolean) {
  try {
    const adapter: GPUAdapter | null = await navigator?.gpu?.requestAdapter()

    if (adapter == null) {
      throw new Error()
    }

    return await adapter.requestDevice({
      requiredLimits: {},
    })
  } catch (e) {
    if (notify) {
      console.error('Webgpu not supported', e)
      webgpuNotSupportedNotification()
    }
  }
}

export async function verifyWebgpuSupport(warn: boolean) {
  try {
    const device = await getWebgpuDevice(warn)
    if (!device) {
      window.store.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
    }

    return device
  } catch (e) {
    console.log(e)
    return null
  }
}
