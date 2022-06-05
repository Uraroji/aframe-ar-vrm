import 'aframe'
import { VRM } from '@pixiv/three-vrm'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { mixamoClipToVRMClip } from './VRMAnimationClip'

AFRAME.registerComponent('vrm-model', {
  
  vrm: null as VRM | null,
  mixer: null as any,
  walk: null as any,
  
  schema: { type: 'model' },

  init() {
    if (this.data) {
      (async () => {

        const three: any = AFRAME.THREE
        const gltfLoader = new three.GLTFLoader()

        try {
          const gltf = await gltfLoader.loadAsync(this.data)
          const model: VRM = await VRM.from(gltf)
          this.vrm = model
          this.el.setObject3D('vrm', model.scene)
          this.el.emit('vrm-loaded', {format: 'vrm', vrm: this.vrm})
        } catch(error) {
          this.el.emit('vrm-error', {format: 'vrm', src: this.data});
        }

        try {
          if (this.vrm) {
            const gltf = await gltfLoader.loadAsync('assets/dance.glb')
            const walkClip = mixamoClipToVRMClip(gltf.animations[0], this.vrm, false)
            walkClip.name = 'walk'
            this.mixer = new AFRAME.THREE.AnimationMixer(this.vrm.scene)
            this.walk = this.mixer.clipAction(walkClip).setEffectiveWeight(1.0)
            this.walk.play()
            this.vrm.scene.rotateX(-Math.PI/2)
            // this.vrm.scene.position.z += 1
            // this.vrm.scene.position.y += 1
          }
        } catch(error) {
          console.log(error)
        }
      })()
    }
  },

  tick(time, timeDelta) {
    
    if (this.mixer) {
      this.mixer.update(timeDelta)
    }
  },

})