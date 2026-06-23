import type { UseFormReturnType } from '@mantine/form'
import { scannerChannel, useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import type { WarpRequest } from 'lib/tabs/tabWarp/warpCalculatorTypes'

// Mirrors live scanner events (funds, materials, gacha pulls) into the warp planner form.
export function useWarpScannerSync(form: UseFormReturnType<WarpRequest>) {
  scannerChannel.use((event) => {
    const ingestWarpResources = useScannerState.getState().ingestWarpResources
    if (!ingestWarpResources) return

    switch (event.event) {
      case "UpdateGachaFunds":
        form.setFieldValue("jades", event.data.stellar_jade + event.data.oneric_shards)
        break

      case "UpdateMaterials":
        const state = useScannerState.getState()
        const specialPasses = state.materials["102"] ?? { count: 0 }
        const undyingStarlight = state.materials["252"] ?? { count: 0 }

        form.setFieldValue("passes", specialPasses.count + Math.floor(undyingStarlight.count / 20))
        break

      case "GachaResult":
        const gachaResult = event.data
        const pityUpdate = gachaResult.pity_5

        if (gachaResult.banner_type === "Character") {
          if (pityUpdate.kind === "ResetPity") {
            form.setFieldValue("pityCharacter", pityUpdate.amount)
            form.setFieldValue("guaranteedCharacter", pityUpdate.set_guarantee)
          } else if (pityUpdate.kind === "AddPity") {
            const currentPity = form.getValues().pityCharacter
            form.setFieldValue("pityCharacter", currentPity + gachaResult.pity_5.amount)
          }
        } else if (gachaResult.banner_type === "LightCone") {
          if (pityUpdate.kind === "ResetPity") {
            form.setFieldValue("pityLightCone", pityUpdate.amount)
            form.setFieldValue("guaranteedLightCone", pityUpdate.set_guarantee)
          } else if (pityUpdate.kind === "AddPity") {
            const currentPity = form.getValues().pityLightCone
            form.setFieldValue("pityLightCone", currentPity + gachaResult.pity_5.amount)
          }
        }
    }
  }, [form])
}
