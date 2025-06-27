import { CSS2DRenderer, CSS2DObject, CSS3DRenderer, OrbitControls, STLLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { onMounted, ref, onBeforeUnmount, type Ref } from 'vue';
import * as d3 from 'd3';
export const useThree = (threeDOM: Ref<HTMLElement>, params?: { controls?: boolean, light?: boolean, css2d?: boolean, css3d?: boolean }) => {

  const renderer = new THREE.WebGLRenderer({
    alpha: true,// 透明背景
    antialias: true,// 抗锯齿
  });
  renderer.domElement.style.borderRadius = '30px'
  // renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const clock = new THREE.Clock()
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 50)
  let controler: OrbitControls | null = null, css2drenderer: CSS2DRenderer | null = null, css3drenderer: CSS3DRenderer | null = null;
  if (params?.css2d) {
    css2drenderer = new CSS2DRenderer()
    css2drenderer.domElement.className = 'css2d'
  }
  if (params?.css3d) {
    css3drenderer = new CSS3DRenderer()
    css3drenderer.domElement.className = 'css3d'
  }
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
    renderer.render(scene, camera)
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
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    css2drenderer && css2drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    css2drenderer && (css2drenderer.domElement.style.position = 'absolute')
    css2drenderer && (css2drenderer.domElement.style.top = '0')
    css2drenderer && (css2drenderer.domElement.style.left = '0')
    css2drenderer && (css2drenderer.domElement.style.pointerEvents = 'none')
    css3drenderer && css3drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    css3drenderer && (css3drenderer.domElement.style.position = 'absolute')
    css3drenderer && (css3drenderer.domElement.style.top = '0')
    css3drenderer && (css3drenderer.domElement.style.left = '0')
    css3drenderer && (css3drenderer.domElement.style.pointerEvents = 'none')
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight
    camera.updateProjectionMatrix()
    window.addEventListener('resize', () => {
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      css2drenderer && css2drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      css3drenderer && css3drenderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight
      camera.updateProjectionMatrix()
    })
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


export class THREEMAP extends THREE.Group {
  private projection: d3.GeoProjection
  private size: THREE.Vector3 = new THREE.Vector3(6.283185119628906, 3.030679244995117, 0)//世界地图的一倍宽高
  //世界地图的左下角坐标
  private minX = -3.265099365234375
  private minY = -1.5291082763671875
  private texture: THREE.Texture|null
  private series: { [keyof: string]: number } = {}
  constructor(mapData: any, series?: { name: string, color: number }[], options?: { scale?: number, center?: [number, number], texture?: { value: THREE.Texture, min?: [number, number], max?: [number, number] } }) {
    super()
    series?.forEach(s => {
      this.series[s.name] = s.color
    })


    this.projection = d3.geoEquirectangular().scale(options?.scale || 100).translate(options?.center || [0, 0]);
    if (options?.texture?.min) {
      [this.minX, this.minY] = this.projection(options.texture.min) as [number, number]
      this.minY = -this.minY
    } else {
      this.minX *= options?.scale || 100
      this.minY *= options?.scale || 100
    }
    if (options?.texture?.max) {
      let [x, y] = this.projection(options.texture.max) as [number, number]
      this.size.x = x - this.minX
      this.size.y = -y - this.minY
      // console.log(this.size.x, this.size.y);
    } else {
      this.size.multiplyScalar(options?.scale || 100)
    }
    this.texture = options?.texture?.value||null
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

export class EventCaster {
  //事件管理，用于对scene内部的物体进行外部的dom事件监听，一般是管理点击事件或悬浮事件
  private clickListeners: { obj: THREE.Object3D, callback: (result: THREE.Intersection) => void }[] = []
  private hoverListeners: { obj: THREE.Object3D, callback: (result: THREE.Intersection) => void }[] = []
  private rayCaster: THREE.Raycaster = new THREE.Raycaster()
  private mouse: THREE.Vector2 = new THREE.Vector2()
  public camera: THREE.Camera
  public canvas: HTMLCanvasElement
  public defaultCilckCallback: () => void = () => { }
  public defaultHoverCallback: () => void = () => { }
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