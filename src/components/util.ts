/**
 * Three.js 工具库
 * 提供3D场景初始化、地图渲染、事件处理等核心功能
 *
 * 主要功能：
 * 1. useThree - Vue3 + Three.js 集成 Hook
 * 2. THREEMAP - GeoJSON 转 3D 地图类
 * 3. EventCaster - 3D 对象事件管理器
 */

import { CSS2DRenderer, CSS2DObject, CSS3DRenderer, OrbitControls, STLLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { onMounted, ref, onBeforeUnmount, type Ref } from 'vue';
import * as d3 from 'd3';

/**
 * Three.js 与 Vue3 集成的 Composition API Hook
 *
 * @param threeDOM - Vue ref 引用的 DOM 元素，作为 Three.js 渲染容器
 * @param params - 可选配置参数
 * @param params.controls - 是否启用轨道控制器（鼠标交互）
 * @param params.light - 是否添加环境光照
 * @param params.css2d - 是否启用 CSS2D 渲染器（HTML 标签叠加）
 * @param params.css3d - 是否启用 CSS3D 渲染器（3D HTML 元素）
 * @returns 返回 Three.js 核心对象：renderer, scene, camera, controler, setAnimation
 */
export const useThree = (threeDOM: Ref<HTMLElement>, params?: { controls?: boolean, light?: boolean, css2d?: boolean, css3d?: boolean }) => {

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
  let controler: OrbitControls | null = null, css2drenderer: CSS2DRenderer | null = null, css3drenderer: CSS3DRenderer | null = null;

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

  // 添加动画函数到队列
  const setAnimation = (func: (delta: number) => void) => {
    animations.push(func)
  }

  let frame: number  // 动画帧ID，用于取消动画

  // 渲染循环函数
  const render = () => {
    const t = clock.getDelta()        // 获取时间增量
    animation(t)                      // 执行动画更新
    controler && controler.update()   // 更新轨道控制器

    // 渲染各个层级
    renderer.render(scene, camera)                        // 渲染主3D场景
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
  })

  return { renderer, scene, camera, controler, setAnimation };
}


/**
 * THREEMAP 类 - GeoJSON 转 3D 地图渲染器
 *
 * 功能：
 * 1. 将 GeoJSON 地理数据转换为 Three.js 3D 模型
 * 2. 支持多边形和复合多边形的 3D 挤出效果
 * 3. 支持纹理贴图和区域着色
 * 4. 使用 D3.js 进行地理投影转换
 */
export class THREEMAP extends THREE.Group {
  private projection: d3.GeoProjection  // D3.js 地理投影对象

  // 世界地图的默认尺寸（弧度制）
  private size: THREE.Vector3 = new THREE.Vector3(6.283185119628906, 3.030679244995117, 0)

  // 世界地图的左下角坐标（默认值）
  private minX = -3.265099365234375
  private minY = -1.5291082763671875

  private texture: THREE.Texture | null  // 地图纹理贴图
  private series: { [keyof: string]: number } = {}  // 区域名称到颜色的映射

  /**
   * 构造函数
   * @param mapData - GeoJSON 格式的地图数据
   * @param series - 可选的区域配色方案数组
   * @param options - 可选的地图配置参数
   * @param options.scale - 地图缩放比例
   * @param options.center - 地图中心点坐标 [经度, 纬度]
   * @param options.texture - 纹理配置对象
   * @param options.texture.value - Three.js 纹理对象
   * @param options.texture.min - 纹理映射最小坐标 [经度, 纬度]
   * @param options.texture.max - 纹理映射最大坐标 [经度, 纬度]
   */
  constructor(mapData: any, series?: { name: string, color: number }[], options?: { scale?: number, center?: [number, number], texture?: { value: THREE.Texture, min?: [number, number], max?: [number, number] } }) {
    super()

    // 构建区域名称到颜色的映射表
    series?.forEach(s => {
      this.series[s.name] = s.color
    })

    // 创建 D3.js 等距圆柱投影
    // 等距圆柱投影：保持经纬度网格为矩形，适合简单的地图显示
    this.projection = d3.geoEquirectangular().scale(options?.scale || 100).translate(options?.center || [0, 0]);

    // 根据纹理配置计算地图边界
    if (options?.texture?.min) {
      // 如果提供了纹理最小坐标，使用投影转换
      [this.minX, this.minY] = this.projection(options.texture.min) as [number, number]
      this.minY = -this.minY  // Three.js 的 Y 轴与地理坐标系相反
    } else {
      // 否则使用默认值并应用缩放
      this.minX *= options?.scale || 100
      this.minY *= options?.scale || 100
    }

    // 计算地图尺寸
    if (options?.texture?.max) {
      let [x, y] = this.projection(options.texture.max) as [number, number]
      this.size.x = x - this.minX      // 计算宽度
      this.size.y = -y - this.minY     // 计算高度（注意Y轴反向）
    } else {
      // 使用默认尺寸并应用缩放
      this.size.multiplyScalar(options?.scale || 100)
    }

    // 保存纹理引用
    this.texture = options?.texture?.value || null
    if (mapData.type == 'FeatureCollection') {
      mapData.features.forEach((feature: any) => {
        // if (feature.properties.name == '康平县') {
        //   console.log(Math.max(...feature.geometry.coordinates[0][0].map(i => i[1])));
        // }
        if (feature.geometry.type == 'Polygon') {
          this.createPolygon(feature)
        } else if (feature.geometry.type == 'MultiPolygon') {
          this.createMultiPolygon(feature)
        } else {
          // console.log(feature.geometry.type);
        }
      })
    } else if (mapData.type == 'Feature') {

    } else {
      // console.log(mapData.type);
    }
    this.rotateX(-Math.PI / 2)
    const box = new THREE.Box3().setFromObject(this)
    const center = box.getCenter(new THREE.Vector3())
    this.position.copy(center.negate())
  }

  createPolygon = (geojson: any) => {
    const name = geojson.properties.name || geojson.properties.NAME
    const { geometry } = this.createArea(geojson.geometry.coordinates)
    geometry.name = name + '-geometry'
    // const outLine = new THREE.Line(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 1 }))
    const material = new THREE.MeshLambertMaterial()
    material.map = this.texture
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
      	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
      	diffuseColor =(diffuseColor*.3)+ sampledDiffuseColor*.7;
        #endif
        if(myBorder.y!=0.){
              diffuseColor=vec4(1.,1.,1.,1.);
        }`).replace('uniform vec3 diffuse;', `uniform vec3 diffuse;
        varying vec3 myBorder;`)
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
             vec2 uv = position.xy-vec2(${this.minX},${this.minY});
             vec2 size = vec2(${this.size.x},${this.size.y});
             myBorder= normal;
             vMapUv = vec2(uv.x/size.x,uv.y/size.y);`).replace('#include <common>', `#include <common>
             varying vec3 myBorder;`)
    }
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = name
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (Object.keys(this.series).includes(name)) {
      material.color.setHex(this.series[name])
    } else {
      material.color.setHex(Math.floor(0xffffff * Math.random()))
    }
    // this.add(outLine)
    this.add(mesh)
  }

  createMultiPolygon = (geojson: any) => {
    const name = geojson.properties.name || geojson.properties.NAME
    const group = new THREE.Group()
    group.name = name
    const material = new THREE.MeshBasicMaterial()
    if (Object.keys(this.series).includes(name)) {
      material.color.setHex(this.series[name])
    } else {
      material.color.setHex(Math.floor(0xffffff * Math.random()))
    }
    material.map = this.texture
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
      	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
      	diffuseColor =(diffuseColor*.3)+ sampledDiffuseColor*.7;
        #endif
        if(myBorder.y!=0.){
              diffuseColor=vec4(0.047,0.749,0.988,1.);
        }`).replace('uniform vec3 diffuse;', `uniform vec3 diffuse;
        varying vec3 myBorder;`)
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
             vec2 uv = position.xy-vec2(${this.minX},${this.minY});
             vec2 size = vec2(${this.size.x},${this.size.y});
             myBorder= normal;
             vMapUv = vec2(uv.x/size.x,uv.y/size.y);`).replace('#include <common>', `#include <common>
            varying vec3 myBorder;`)

    }
    for (let i = 0; i < geojson.geometry.coordinates.length; i++) {
      geojson.geometry.coordinates.forEach((coordinates: [number, number][][]) => {
        const { geometry, shape } = this.createArea(coordinates)
        geometry.name = name + (i + 1) + '-geometry'
        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const outLine = new THREE.Line(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffffff }))
        // outLine.position.z = 5.1
        // group.add(outLine)
        group.add(mesh)
      })
    }
    this.add(group)
  }

  createArea = (coordinates: [number, number][][]) => {
    const shape = new THREE.Shape()
    for (let i = 0; i < coordinates[0].length; i++) {
      const [x, y] = this.projection(coordinates[0][i]) as [number, number]
      if (i == 0) {
        shape.moveTo(x, -y)
      } else {
        shape.lineTo(x, -y)
      }
    }
    if (coordinates.length > 1) {
      let hole = new THREE.Path()
      for (let i = 0; i < coordinates[1].length; i++) {
        const [x, y] = this.projection([coordinates[1][i][1], coordinates[1][i][0]]) as [number, number]
        if (i == 0) {
          hole.moveTo(x, -y)
        } else {
          hole.lineTo(x, -y)
        }
      }
      shape.holes.push(hole)
    }
    // 厚度设置为10
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 30 })
    return { geometry, shape }
  }

  addEventListener(type: unknown, listener: unknown): void {

  }
}

/**
 * EventCaster 类 - 3D 对象事件管理器
 *
 * 功能：
 * 1. 为 3D 场景中的对象添加鼠标交互事件
 * 2. 支持点击和悬停事件
 * 3. 使用射线投射检测鼠标与 3D 对象的交互
 * 4. 提供统一的事件管理接口
 */
export class EventCaster {
  // 点击事件监听器列表
  private clickListeners: { obj: THREE.Object3D, callback: (result: THREE.Intersection) => void }[] = []

  // 悬停事件监听器列表
  private hoverListeners: { obj: THREE.Object3D, callback: (result: THREE.Intersection) => void }[] = []

  // 射线投射器，用于检测鼠标与3D对象的交互
  private rayCaster: THREE.Raycaster = new THREE.Raycaster()

  // 鼠标位置向量（标准化设备坐标）
  private mouse: THREE.Vector2 = new THREE.Vector2()

  public camera: THREE.Camera        // 相机引用
  public canvas: HTMLCanvasElement   // 画布引用

  // 默认回调函数
  public defaultCilckCallback: () => void = () => { }   // 默认点击回调
  public defaultHoverCallback: () => void = () => { }   // 默认悬停回调

  /**
   * 构造函数
   * @param camera - Three.js 相机对象
   * @param canvas - HTML Canvas 元素
   */
  constructor(camera: THREE.Camera, canvas: HTMLCanvasElement) {
    this.camera = camera
    this.canvas = canvas
    this.canvas.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.offsetX / this.canvas.offsetWidth) * 2 - 1
      this.mouse.y = -(event.offsetY / this.canvas.offsetHeight) * 2 + 1

      this.rayCaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.rayCaster.intersectObjects(this.hoverListeners.map(l => l.obj))
      if (intersects.length > 0) {
        const result = intersects[0]
        this.hoverListeners.find(l => l.obj.id === result.object.id)?.callback(result)
      } else {
        this.defaultHoverCallback()
      }
    })

    this.canvas.addEventListener('click', () => {
      this.rayCaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.rayCaster.intersectObjects(this.clickListeners.map(l => l.obj))
      if (intersects.length > 0) {
        const result = intersects[0]
        this.clickListeners.find(l => l.obj.id === result.object.id)?.callback(result)
      } else {
        this.defaultCilckCallback()
      }
    })
  }

  addListener(obj: THREE.Object3D | THREE.Object3D[], event: keyof HTMLElementEventMap, callback: (result: THREE.Intersection) => void) {
    if (Array.isArray(obj)) {
      obj.forEach(o => {
        if (event === 'click') {
          this.clickListeners.push({ obj: o, callback: callback })
        }
        else if (event === 'mousemove') {
          this.hoverListeners.push({ obj: o, callback: callback })
        }
      })
    } else {
      if (event === 'click') {
        this.clickListeners.push({ obj, callback: callback })
      }
      else if (event === 'mousemove') {
        this.hoverListeners.push({ obj, callback: callback })
      }
    }

  }

  dispose() {
    this.canvas.removeEventListener('mousemove', (event) => {
      this.mouse.x = (event.offsetX / this.canvas.offsetWidth) * 2 - 1
      this.mouse.y = -(event.offsetY / this.canvas.offsetHeight) * 2 + 1

      this.rayCaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.rayCaster.intersectObjects(this.hoverListeners.map(l => l.obj))
      if (intersects.length > 0) {
        const result = intersects[0]
        this.hoverListeners.find(l => l.obj.id === result.object.id)?.callback(result)
      } else {
        this.defaultHoverCallback()
      }
    })

    this.canvas.removeEventListener('click', () => {
      this.rayCaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.rayCaster.intersectObjects(this.clickListeners.map(l => l.obj))
      if (intersects.length > 0) {
        const result = intersects[0]
        this.clickListeners.find(l => l.obj.id === result.object.id)?.callback(result)
      } else {
        this.defaultCilckCallback()
      }
    })
  }
}
