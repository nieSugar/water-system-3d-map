/**
 * Three.js 与 Vue3 集成的 Composition API Hook
 * 提供3D场景初始化、渲染器配置、动画管理等核心功能
 */

import { CSS2DRenderer, CSS3DRenderer, OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';
import { onMounted, onBeforeUnmount, type Ref } from 'vue';

/**
 * Three.js 与 Vue3 集成的 Composition API Hook
 *
 * @param threeDOM - Vue ref 引用的 DOM 元素，作为 Three.js 渲染容器
 * @param params - 可选配置参数
 * @param params.controls - 是否启用轨道控制器（鼠标交互）
 * @param params.light - 是否添加环境光照
 * @param params.css2d - 是否启用 CSS2D 渲染器（HTML 标签叠加）
 * @param params.css3d - 是否启用 CSS3D 渲染器（3D HTML 元素）
 * @param params.bloom - 是否启用 Bloom 效果
 * @returns 返回 Three.js 核心对象：renderer, scene, camera, controler, setAnimation
 */
export const useThree = (threeDOM: Ref<HTMLElement>, params?: { controls?: boolean, light?: boolean, css2d?: boolean, css3d?: boolean, bloom?: boolean }) => {

  // 创建 WebGL 渲染器
  const renderer = new THREE.WebGLRenderer({
    alpha: true,      // 启用透明背景，便于与页面其他元素融合
    antialias: true,  // 启用抗锯齿，提升渲染质量
  });
  renderer.domElement.style.borderRadius = '30px'  // 设置圆角样式
  // renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  // 创建时钟对象，用于动画时间管理
  const clock = new THREE.Clock()

  // 创建3D场景
  const scene = new THREE.Scene();

  // 创建透视相机
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 50)  // 设置相机初始位置

  // 声明可选的控制器和渲染器
  let controler: OrbitControls | null = null,
    css2drenderer: CSS2DRenderer | null = null,
    css3drenderer: CSS3DRenderer | null = null;

  // 根据参数配置启用 CSS2D 渲染器
  if (params?.css2d) {
    css2drenderer = new CSS2DRenderer()
    css2drenderer.domElement.className = 'css2d'
  }

  // 根据参数配置启用 CSS3D 渲染器
  if (params?.css3d) {
    css3drenderer = new CSS3DRenderer()
    css3drenderer.domElement.className = 'css3d'
  }

  // 后处理：Bloom
  let composer: EffectComposer | null = null
  let bloomPass: UnrealBloomPass | null = null

  // 根据参数配置启用轨道控制器
  if (params?.controls) {
    controler = new OrbitControls(camera, renderer.domElement)
    controler.target.set(0, 0, 0)    // 设置控制器目标点
    controler.enableDamping = true   // 启用阻尼效果，使交互更平滑
  }

  // 根据参数配置添加环境光
  if (params?.light) {
    const light = new THREE.AmbientLight(0xffffff, 1.5)  // 白色环境光，强度1.5
    scene.add(light)
  }
  // 动画系统管理
  const animations: ((delta: number) => void)[] = []  // 动画函数队列

  // 主动画循环函数，执行所有注册的动画
  let animation: (delta: number) => void = (t) => {
    animations.forEach(a => a(t))  // 依次执行每个动画函数
  }

  /**
   * 添加动画函数到队列
   * @param func - 动画函数，接收时间增量参数
   */
  const setAnimation = (func: (delta: number) => void) => {
    animations.push(func)
  }

  let frame: number  // 动画帧ID，用于取消动画

  /**
   * 渲染循环函数
   * 执行动画更新、控制器更新和多层渲染
   */
  const render = () => {
    const t = clock.getDelta()        // 获取时间增量
    animation(t)                      // 执行动画更新
    controler && controler.update()   // 更新轨道控制器

    // 渲染各个层级
    if (composer) {
      composer.render()
    } else {
      renderer.render(scene, camera)
    }
    css2drenderer && css2drenderer.render(scene, camera)  // 渲染CSS2D标签层
    css3drenderer && css3drenderer.render(scene, camera)  // 渲染CSS3D元素层

    frame = requestAnimationFrame(render)  // 请求下一帧动画
  }

  // Vue 组件挂载时的初始化逻辑
  onMounted(() => {
    const canvas = threeDOM.value

    // 确保容器具有相对定位，便于子元素绝对定位
    if (!canvas.style.position) {
      canvas.style.position = 'relative'
    }

    if (!canvas) return new Error('canvas is not defined')

    // 将渲染器的 DOM 元素添加到容器中
    canvas.appendChild(renderer.domElement)
    if (css2drenderer) canvas.appendChild(css2drenderer.domElement)
    if (css3drenderer) canvas.appendChild(css3drenderer.domElement)

    // 设置渲染器尺寸为容器尺寸
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)

    // Bloom Composer
    if (params?.bloom) {
      composer = new EffectComposer(renderer)
      composer.setSize(canvas.offsetWidth, canvas.offsetHeight)

      const renderPass = new RenderPass(scene, camera)
      bloomPass = new UnrealBloomPass(new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight), 1.0, 0.4, 0.85)
      composer.addPass(renderPass)
      composer.addPass(bloomPass)
    }

    // 配置 CSS2D 渲染器
    css2drenderer && css2drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    css2drenderer && (css2drenderer.domElement.style.position = 'absolute')  // 绝对定位
    css2drenderer && (css2drenderer.domElement.style.top = '0')              // 顶部对齐
    css2drenderer && (css2drenderer.domElement.style.left = '0')             // 左侧对齐
    css2drenderer && (css2drenderer.domElement.style.pointerEvents = 'none') // 禁用鼠标事件，避免干扰3D交互

    // 配置 CSS3D 渲染器
    css3drenderer && css3drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    css3drenderer && (css3drenderer.domElement.style.position = 'absolute')  // 绝对定位
    css3drenderer && (css3drenderer.domElement.style.top = '0')              // 顶部对齐
    css3drenderer && (css3drenderer.domElement.style.left = '0')             // 左侧对齐
    css3drenderer && (css3drenderer.domElement.style.pointerEvents = 'none') // 禁用鼠标事件

    // 设置相机宽高比并更新投影矩阵
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight
    camera.updateProjectionMatrix()

    // 监听窗口大小变化，实现响应式布局
    window.addEventListener('resize', () => {
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      css2drenderer && css2drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      css3drenderer && css3drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight
      camera.updateProjectionMatrix()
    })

    // 更新控制器并开始渲染循环
    controler && controler.update()
    render()
  })

  /**
   * Vue 组件卸载前的清理逻辑
   * 停止动画、移除DOM元素、释放资源
   */
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
          // 回收所有可能存在的材质贴图
          child.material.map && child.material.map.dispose()
          child.material.aoMap && child.material.aoMap.dispose()
          child.material.specularMap && child.material.specularMap.dispose()
          child.material.envMap && child.material.envMap.dispose()
          child.material.alphaMap && child.material.alphaMap.dispose()
          child.material.lightMap && child.material.lightMap.dispose()
        }
        child.material.dispose()
        // scene.remove(child)
      }
    })
    window.removeEventListener('resize', () => {
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      css2drenderer && css2drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      css3drenderer && css3drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight
      camera.updateProjectionMatrix()
    })
    renderer.dispose()
    // EffectComposer 没有官方 dispose，直接置空即可
    composer = null
  })

  return { renderer, scene, camera, controler, setAnimation, bloomPass };
}
