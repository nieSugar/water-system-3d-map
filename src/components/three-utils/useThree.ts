import { CSS2DRenderer, CSS3DRenderer, OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';
import { onMounted, onBeforeUnmount, type Ref } from 'vue';
export const useThree = (threeDOM: Ref<HTMLElement>, params?: { controls?: boolean, light?: boolean, css2d?: boolean, css3d?: boolean, bloom?: boolean }) => {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,      
    antialias: true,  
  });
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.background = 'transparent';
  renderer.domElement.style.borderRadius = '30px'  
  const clock = new THREE.Clock()
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 50)  
  let controler: OrbitControls | null = null,
    css2drenderer: CSS2DRenderer | null = null,
    css3drenderer: CSS3DRenderer | null = null;
  if (params?.css2d) {
    css2drenderer = new CSS2DRenderer()
    css2drenderer.domElement.className = 'css2d'
  }
  if (params?.css3d) {
    css3drenderer = new CSS3DRenderer()
    css3drenderer.domElement.className = 'css3d'
  }
  let composer: EffectComposer | null = null
  let bloomPass: UnrealBloomPass | null = null
  if (params?.controls) {
    controler = new OrbitControls(camera, renderer.domElement)
    controler.target.set(0, 0, 0)    
    controler.enableDamping = true   
  }
  if (params?.light) {
    const light = new THREE.AmbientLight(0xffffff, 1.5)  
    scene.add(light)
  }
  const animations: ((delta: number) => void)[] = []  
  let animation: (delta: number) => void = (t) => {
    animations.forEach(a => a(t))  
  }
  const setAnimation = (func: (delta: number) => void) => {
    animations.push(func)
  }
  let frame: number  
  const render = () => {
    const t = clock.getDelta()        
    animation(t)                      
    controler && controler.update()   
    if (composer) {
      composer.render()
    } else {
      renderer.render(scene, camera)
    }
    css2drenderer && css2drenderer.render(scene, camera)  
    css3drenderer && css3drenderer.render(scene, camera)  
    frame = requestAnimationFrame(render)  
  }
  onMounted(() => {
    const canvas = threeDOM.value
    if (!canvas.style.position) {
      canvas.style.position = 'relative'
    }
    if (!canvas) return new Error('canvas is not defined')
    canvas.appendChild(renderer.domElement)
    if (css2drenderer) canvas.appendChild(css2drenderer.domElement)
    if (css3drenderer) canvas.appendChild(css3drenderer.domElement)

    // 设置canvas样式确保占满容器
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'

    const updateSize = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      console.log('Canvas container size:', width, height)

      renderer.setSize(width, height)
      if (params?.bloom && composer) {
        composer.setSize(width, height)
      }
      css2drenderer && css2drenderer.setSize(width, height)
      css3drenderer && css3drenderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    // 初始设置大小
    updateSize()

    css2drenderer && (css2drenderer.domElement.style.position = 'absolute')
    css2drenderer && (css2drenderer.domElement.style.top = '0')
    css2drenderer && (css2drenderer.domElement.style.left = '0')
    css2drenderer && (css2drenderer.domElement.style.pointerEvents = 'none')
    css3drenderer && (css3drenderer.domElement.style.position = 'absolute')
    css3drenderer && (css3drenderer.domElement.style.top = '0')
    css3drenderer && (css3drenderer.domElement.style.left = '0')
    css3drenderer && (css3drenderer.domElement.style.pointerEvents = 'none')

    if (params?.bloom) {
      composer = new EffectComposer(renderer)
      composer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      const renderPass = new RenderPass(scene, camera)
      bloomPass = new UnrealBloomPass(new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight), 1.0, 0.4, 0.85)
      composer.addPass(renderPass)
      composer.addPass(bloomPass)
    }

    // 监听窗口大小变化
    resizeHandler = () => updateSize()
    window.addEventListener('resize', resizeHandler)

    // 使用ResizeObserver监听容器大小变化
    resizeObserver = new ResizeObserver(() => {
      updateSize()
    })
    resizeObserver.observe(canvas)

    controler && controler.update()
    render()
  })
  let resizeObserver: ResizeObserver | null = null
  let resizeHandler: (() => void) | null = null

  onBeforeUnmount(() => {
    const canvas = threeDOM.value as HTMLElement
    clock.stop()
    cancelAnimationFrame(frame)
    renderer.domElement.remove()
    css2drenderer && css2drenderer.domElement.remove()
    css3drenderer && css3drenderer.domElement.remove()
    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof (THREE.MeshBasicMaterial || THREE.MeshLambertMaterial || THREE.MeshPhongMaterial || THREE.MeshLambertMaterial || THREE.MeshToonMaterial || THREE.MeshPhysicalMaterial)) {
          child.material.map && child.material.map.dispose()
          child.material.aoMap && child.material.aoMap.dispose()
          child.material.specularMap && child.material.specularMap.dispose()
          child.material.envMap && child.material.envMap.dispose()
          child.material.alphaMap && child.material.alphaMap.dispose()
          child.material.lightMap && child.material.lightMap.dispose()
        }
        child.material.dispose()
      }
    })
    // 清理事件监听器
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    renderer.dispose()
    composer = null
  })
  return { renderer, scene, camera, controler, setAnimation, bloomPass };
}
