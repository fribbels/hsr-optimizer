import {
  AnimationState,
  AnimationStateData,
  AssetManager,
  AtlasAttachmentLoader,
  ManagedWebGLRenderingContext,
  SceneRenderer,
  Skeleton,
  SkeletonBinary,
  Vector2,
} from '@esotericsoftware/spine-webgl'
import { toBaseCharacterId } from './manifest'

export interface SpineInstance {
  setAnimation(name: string, loop?: boolean): void
  getAnimations(): string[]
  dispose(): void
}

export async function createSpineInstance(
  canvas: HTMLCanvasElement,
  skeletonName: string,
  options: {
    cdnBase: string
    characterId: string
    animation?: string
  },
): Promise<SpineInstance> {
  const glContext = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true })
    || canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true })
  if (!glContext) throw new Error('WebGL not available')
  const gl = glContext

  const context = new ManagedWebGLRenderingContext(gl)
  const baseUrl = `${options.cdnBase}/${toBaseCharacterId(options.characterId)}/`
  const assetManager = new AssetManager(context, baseUrl)

  const skelFile = skeletonName + '.skel'
  const atlasFile = skeletonName + '.atlas'

  assetManager.loadBinary(skelFile)
  assetManager.loadTextureAtlas(atlasFile)

  // Poll until all assets are loaded
  await new Promise<void>((resolve, reject) => {
    function check() {
      if (assetManager.isLoadingComplete()) {
        assetManager.hasErrors()
          ? reject(new Error(JSON.stringify(assetManager.getErrors())))
          : resolve()
      } else {
        requestAnimationFrame(check)
      }
    }
    check()
  })

  const atlas = assetManager.require(atlasFile)
  const atlasLoader = new AtlasAttachmentLoader(atlas)
  const binary = new SkeletonBinary(atlasLoader)

  // Auto-fit: measure bounds at scale 1, then re-parse at fitted scale
  binary.scale = 1
  const rawSkelData = binary.readSkeletonData(assetManager.require(skelFile))
  const rawSkeleton = new Skeleton(rawSkelData)
  rawSkeleton.setToSetupPose()
  rawSkeleton.updateWorldTransform()

  const boundsOffset = new Vector2()
  const boundsSize = new Vector2()
  rawSkeleton.getBounds(boundsOffset, boundsSize, [])

  const nativeCx = boundsOffset.x + boundsSize.x / 2
  const nativeCy = boundsOffset.y + boundsSize.y / 2
  const canvasSize = canvas.width
  const fitScale = canvasSize / Math.max(boundsSize.x, boundsSize.y)

  // Re-parse at fitted scale — spine applies scale during parsing
  binary.scale = fitScale
  const skelData = binary.readSkeletonData(assetManager.require(skelFile))
  const skeleton = new Skeleton(skelData)
  skeleton.setToSetupPose()

  const camX = Math.round(nativeCx * fitScale)
  const camY = Math.round(nativeCy * fitScale)

  const stateData = new AnimationStateData(skelData)
  stateData.defaultMix = 0.2
  const animState = new AnimationState(stateData)

  // Set initial animation
  const defaultAnim = skelData.animations.find((a) => a.name.toLowerCase().includes('idle'))
    || skelData.animations[0]
  if (defaultAnim) {
    animState.setAnimation(0, options.animation ?? defaultAnim.name, true)
  }

  const renderer = new SceneRenderer(canvas, context)
  skeleton.updateWorldTransform()

  // Render loop — GL state and camera must be set every frame because
  // SceneRenderer.begin()/end() modifies GL state internally
  let rafId: number | null = null
  let lastTime = performance.now()

  function loop(now: number) {
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    animState.update(delta)
    animState.apply(skeleton)
    skeleton.updateWorldTransform()

    gl.viewport(0, 0, canvasSize, canvasSize)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    renderer.camera.position.x = camX
    renderer.camera.position.y = camY
    renderer.camera.zoom = 1
    renderer.camera.setViewport(canvasSize, canvasSize)
    renderer.camera.update()

    renderer.begin()
    renderer.drawSkeleton(skeleton, false)
    renderer.end()

    rafId = requestAnimationFrame(loop)
  }

  rafId = requestAnimationFrame(loop)

  return {
    setAnimation(name: string, loop = true) {
      animState.setAnimation(0, name, loop)
    },
    getAnimations() {
      return skelData.animations.map((a) => a.name)
    },
    dispose() {
      if (rafId != null) cancelAnimationFrame(rafId)
      renderer.dispose()
      assetManager.dispose()
    },
  }
}
