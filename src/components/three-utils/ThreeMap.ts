/**
 * THREEMAP 类 - GeoJSON 转 3D 地图渲染器
 * 
 * 功能：
 * 1. 将 GeoJSON 地理数据转换为 Three.js 3D 模型
 * 2. 支持多边形和复合多边形的 3D 挤出效果
 * 3. 支持纹理贴图和区域着色
 * 4. 使用 D3.js 进行地理投影转换
 */

import * as THREE from 'three';
import * as d3 from 'd3';
import { GUI } from 'lil-gui';

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

  // GUI 调试相关属性
  private gui: GUI | null = null
  private dashedLineParams = {
    color: 0xffffff,
    linewidth: 4,
    scale: 5,
    dashSize: 3,
    gapSize: 20,
    opacity: 1,
    enabled: true
  }
  private solidLineParams = {
    color: 0xffffff,
    linewidth: 2,
    opacity: 1.0,
    enabled: true
  }
  private allOutlines: THREE.LineSegments[] = []  // 存储所有虚线轮廓对象
  private allSolidOutlines: THREE.Group[] = []  // 存储所有实线轮廓对象

  // 为每个行政区缓存一个专属 material，保证同一区域的多个 mesh 复用同一个材质
  private regionMaterials: Record<string, THREE.MeshLambertMaterial> = {}

  // ------------------- 分组定义 ------------------- //
  private regionToGroup: Record<string, string> = {
    '康平县': 'group1',
    '法库县': 'group1',
    '新民市': 'group2',
    '辽中区': 'group2',
    '于洪区': 'group3',
    '沈北新区': 'group3',
    '大东区': 'group3',
    '和平区': 'group3',
    '苏家屯区': 'group3',
    '浑南区': 'group3',
    '沈河区': 'group3',
    '皇姑区': 'group3',
    '铁西区': 'group3'
  }

  // 分组对应默认颜色
  private groupColors: Record<string, number> = {
    group1: 0xf77878, // 红色
    group2: 0xebc547, // 黄色
    group3: 0x3899df  // 蓝色
  }

  // 每个分组共用一份材质
  private groupMaterials: Record<string, THREE.MeshLambertMaterial> = {}

  // 纹理与区域色混合比（0=纯色，1=纯纹理）
  private textureMixRatio = 0

  /**
   * 获取（或创建）指定行政区的材质
   */
  private getRegionMaterial(name: string): THREE.MeshLambertMaterial {
    if (this.regionMaterials[name]) return this.regionMaterials[name]

    // 先找到对应组
    const group = this.regionToGroup[name] || name // 若未定义分组，则独立为自己

    // 如果该组已有共用材质直接复用
    if (this.groupMaterials[group]) {
      this.regionMaterials[name] = this.groupMaterials[group]
      return this.groupMaterials[group]
    }

    // 创建组材质
    const material = new THREE.MeshLambertMaterial()
    material.map = this.texture

    // 取组默认颜色，没有则白色
    const colorHex = this.groupColors[group] ?? 0xffffff
    material.color.setHex(colorHex)

    // 默认 100% 不透明，避免透视时看到下方轮廓
    material.opacity = 1
    material.transparent = false

    // 自定义 shader，同之前逻辑
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uMix = { value: this.textureMixRatio }

      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );
        diffuseColor = mix(diffuseColor, sampledDiffuseColor, uMix);
#endif
        if(myBorder.y!=0.){
              diffuseColor = vec4(1.,1.,1.,1.);
        }`).replace('uniform vec3 diffuse;', `uniform vec3 diffuse;
        uniform float uMix;
        varying vec3 myBorder;`)

      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
             vec2 uv = position.xy-vec2(${this.minX},${this.minY});
             vec2 size = vec2(${this.size.x},${this.size.y});
             myBorder= normal;
             vMapUv = vec2(uv.x/size.x,uv.y/size.y);`).replace('#include <common>', `#include <common>
             varying vec3 myBorder;`)
    }

    // 缓存
    this.groupMaterials[group] = material
    this.regionMaterials[name] = material
    return material
  }

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
  constructor(mapData: any, series?: { name: string, color: number }[],
    options?: {
      scale?: number, center?: [number, number],
      texture?: { value: THREE.Texture, min?: [number, number], max?: [number, number] }
    }) {
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

  /**
   * 创建虚线轮廓
   * @param geometry - 几何体对象
   * @param name - 轮廓名称
   * @param options - 虚线样式选项
   * @param options.color - 虚线颜色 (默认: 0x4a90e2 柔和蓝色)
   * @param options.linewidth - 线宽 (默认: 1.5)
   * @param options.scale - 虚线缩放 (默认: 1)
   * @param options.dashSize - 虚线段长度 (默认: 3)
   * @param options.gapSize - 虚线间隙长度 (默认: 2)
   * @param options.opacity - 透明度，0-1之间 (默认: 0.6)
   * @returns 虚线轮廓对象
   */
  createDashedOutline = (
    geometry: THREE.BufferGeometry,
    name: string,
    options: {
      color?: number
      linewidth?: number
      scale?: number
      dashSize?: number
      gapSize?: number
      opacity?: number
    } = {}
  ) => {
    // 使用GUI参数作为默认值，如果options中没有指定的话
    const {
      color = this.dashedLineParams.color,
      linewidth = this.dashedLineParams.linewidth,
      scale = this.dashedLineParams.scale,
      dashSize = this.dashedLineParams.dashSize,
      gapSize = this.dashedLineParams.gapSize,
      opacity = this.dashedLineParams.opacity,
    } = options

    const fullEdgesGeometry = new THREE.EdgesGeometry(geometry)

    const positions = fullEdgesGeometry.attributes.position.array as Float32Array

    // 计算几何体的最高 Z 值（挤出深度），仅保留顶面的水平边
    geometry.computeBoundingBox()
    const maxZ = geometry.boundingBox!.max.z
    const tol = 1e-6

    const filtered: number[] = []

    for (let i = 0; i < positions.length; i += 6) {
      const z1 = positions[i + 2]
      const z2 = positions[i + 5]
      // 只保留水平边，并且位于挤出顶部
      if (Math.abs(z1 - z2) < tol && Math.abs(z1 - maxZ) < tol) {
        filtered.push(
          positions[i], positions[i + 1], positions[i + 2],
          positions[i + 3], positions[i + 4], positions[i + 5]
        )
      }
    }

    const edgesGeometry = new THREE.BufferGeometry()
    edgesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(filtered, 3))

    const dashedLineMaterial = new THREE.LineDashedMaterial({
      color,
      linewidth,
      scale,
      dashSize,
      gapSize,
      opacity,
      transparent: opacity < 1.0, // 当透明度小于1时启用透明
    })
    const outLine = new THREE.LineSegments(edgesGeometry, dashedLineMaterial)
    outLine.computeLineDistances() // 计算线段距离，虚线材质需要
    outLine.name = name + '-outline'
    outLine.visible = this.dashedLineParams.enabled

    // 将轮廓添加到数组中以便GUI控制
    this.allOutlines.push(outLine)

    return outLine
  }

  /**
   * 创建实线轮廓（通过多条线模拟线宽效果）
   * @param geometry - 几何体对象
   * @param name - 轮廓名称
   * @param options - 实线样式选项
   * @param options.color - 实线颜色 (默认: 使用GUI参数)
   * @param options.linewidth - 线宽 (默认: 使用GUI参数)
   * @param options.opacity - 透明度，0-1之间 (默认: 使用GUI参数)
   * @returns 实线轮廓组对象
   */
  createSolidOutline = (
    geometry: THREE.BufferGeometry,
    name: string,
    options: {
      color?: number
      linewidth?: number
      opacity?: number
    } = {}
  ) => {
    // 使用GUI参数作为默认值，如果options中没有指定的话
    const {
      color = this.solidLineParams.color,
      linewidth = this.solidLineParams.linewidth,
      opacity = this.solidLineParams.opacity,
    } = options

    // 创建一个组来包含多条线
    const outlineGroup = new THREE.Group()
    outlineGroup.name = name + '-solid-outline'
    outlineGroup.visible = this.solidLineParams.enabled

    // 获取边缘几何体
    const edgesGeometry = new THREE.EdgesGeometry(geometry)

    // 创建基础材质
    const solidLineMaterial = new THREE.LineBasicMaterial({
      color: color,
      opacity: opacity,
      transparent: opacity < 1.0,
    })

    // 根据线宽创建多条线来模拟粗线效果
    const lineCount = Math.max(1, Math.floor(linewidth))
    const offset = linewidth * 0.001 // 偏移量，用于创建多条线

    for (let i = 0; i < lineCount; i++) {
      const clonedGeometry = edgesGeometry.clone()
      const clonedMaterial = solidLineMaterial.clone()

      // 为每条线添加微小的偏移
      if (i > 0) {
        const positions = clonedGeometry.attributes.position.array
        for (let j = 0; j < positions.length; j += 3) {
          positions[j] += (Math.random() - 0.5) * offset     // x偏移
          positions[j + 1] += (Math.random() - 0.5) * offset // y偏移
          positions[j + 2] += (Math.random() - 0.5) * offset // z偏移
        }
        clonedGeometry.attributes.position.needsUpdate = true
      }

      const line = new THREE.LineSegments(clonedGeometry, clonedMaterial)
      outlineGroup.add(line)
    }

    // 将实线轮廓组添加到数组中以便GUI控制
    this.allSolidOutlines.push(outlineGroup)

    return outlineGroup
  }

  /**
   * 创建单个多边形的3D模型
   * @param geojson - GeoJSON 多边形特征对象
   */
  createPolygon = (geojson: any) => {
    const name = geojson.properties.name || geojson.properties.NAME
    const { geometry } = this.createArea(geojson.geometry.coordinates)
    geometry.name = name + '-geometry'

    // 默认为虚线轮廓，后续可在外部叠加实线实现整体边界效果
    const outLine: THREE.LineSegments = this.createDashedOutline(geometry, name)

    const material = this.getRegionMaterial(name)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = name
    mesh.castShadow = true
    mesh.receiveShadow = true

    // 添加网格和虚线轮廓到场景
    this.add(mesh)
    this.add(outLine)
  }

  /**
   * 创建复合多边形的3D模型
   * @param geojson - GeoJSON 复合多边形特征对象
   */
  createMultiPolygon = (geojson: any) => {
    const name = geojson.properties.name || geojson.properties.NAME
    const group = new THREE.Group()
    group.name = name

    const material = this.getRegionMaterial(name)
    for (let i = 0; i < geojson.geometry.coordinates.length; i++) {
      geojson.geometry.coordinates.forEach((coordinates: [number, number][][]) => {
        const { geometry } = this.createArea(coordinates)
        geometry.name = name + (i + 1) + '-geometry'

        // 根据区域名称决定使用实线还是虚线轮廓
        const outLine: THREE.LineSegments = this.createDashedOutline(geometry, name + (i + 1))

        const mesh = new THREE.Mesh(geometry, material)
        mesh.name = name
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // 添加网格和虚线轮廓到组
        group.add(mesh)
        group.add(outLine)
      })
    }
    this.add(group)
  }

  /**
   * 根据坐标数组创建3D挤出几何体
   * @param coordinates - 多边形坐标数组，第一个数组为外边界，后续数组为内部孔洞
   * @returns 返回包含几何体和形状的对象
   */
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

  /**
   * 初始化GUI调试界面
   */
  initGUI() {
    if (this.gui) {
      this.gui.destroy()
    }

    this.gui = new GUI({ title: '轮廓线调试' })

    // 虚线控制面板
    const dashedFolder = this.gui.addFolder('虚线控制')

    // 启用/禁用虚线
    dashedFolder.add(this.dashedLineParams, 'enabled').name('启用虚线').onChange(() => {
      this.updateAllOutlines()
    })

    // 虚线颜色控制
    dashedFolder.addColor(this.dashedLineParams, 'color').name('颜色').onChange(() => {
      this.updateAllOutlines()
    })

    // 虚线线宽控制
    dashedFolder.add(this.dashedLineParams, 'linewidth', 0.1, 10, 0.1).name('线宽').onChange(() => {
      this.updateAllOutlines()
    })

    // 虚线缩放控制
    dashedFolder.add(this.dashedLineParams, 'scale', 0.1, 10, 0.1).name('缩放').onChange(() => {
      this.updateAllOutlines()
    })

    // 虚线段长度控制
    dashedFolder.add(this.dashedLineParams, 'dashSize', 0.1, 20, 0.1).name('虚线段长度').onChange(() => {
      this.updateAllOutlines()
    })

    // 虚线间隙控制
    dashedFolder.add(this.dashedLineParams, 'gapSize', 0.1, 20, 0.1).name('虚线间隙').onChange(() => {
      this.updateAllOutlines()
    })

    // 虚线透明度控制
    dashedFolder.add(this.dashedLineParams, 'opacity', 0, 1, 0.01).name('透明度').onChange(() => {
      this.updateAllOutlines()
    })

    // 实线控制面板
    const solidFolder = this.gui.addFolder('实线控制')

    // 启用/禁用实线
    solidFolder.add(this.solidLineParams, 'enabled').name('启用实线').onChange(() => {
      this.updateAllSolidOutlines()
    })

    // 实线颜色控制
    solidFolder.addColor(this.solidLineParams, 'color').name('颜色').onChange(() => {
      this.updateAllSolidOutlines()
    })

    // 实线线宽控制
    solidFolder.add(this.solidLineParams, 'linewidth', 0.1, 10, 0.1).name('线宽').onChange(() => {
      this.updateAllSolidOutlines()
    })

    // 实线透明度控制
    solidFolder.add(this.solidLineParams, 'opacity', 0, 1, 0.01).name('透明度').onChange(() => {
      this.updateAllSolidOutlines()
    })

    // 默认展开虚线面板
    dashedFolder.open()
    // 默认展开实线面板
    solidFolder.open()

    // ----------------------------- 颜色控制面板 ----------------------------- //
    const styleFolder = this.gui.addFolder('组样式')

    Object.keys(this.groupMaterials).forEach(groupName => {
      const mat = this.groupMaterials[groupName]

      const grpFolder = styleFolder.addFolder(groupName)

      // 颜色控制
      const colorParam = { value: `#${mat.color.getHexString()}` }
      grpFolder.addColor(colorParam, 'value').name('颜色').onChange((val: any) => {
        const hex = typeof val === 'string' ? parseInt(val.replace('#', '0x'), 16) : val
        mat.color.setHex(hex)
        mat.needsUpdate = true
      })

      // 透明度控制
      const opacityParam = { value: mat.opacity }
      grpFolder.add(opacityParam, 'value', 0, 1, 0.01).name('透明度').onChange((val: number) => {
        mat.opacity = val
        mat.transparent = val < 1
        mat.needsUpdate = true
      })

      grpFolder.open()
    })

    // 全局纹理混合控制
    const globalFolder = this.gui.addFolder('全局')
    const mixParam = { value: this.textureMixRatio }
    globalFolder.add(mixParam, 'value', 0, 1, 0.01).name('纹理混合').onChange((val: number) => {
      this.textureMixRatio = val
      // 更新所有材质的 uniform
      Object.values(this.groupMaterials).forEach(mat => {
        const uniforms = (mat as any).userData?.uniforms ?? (mat as any).__shader?.uniforms ?? undefined
      })
      // safer: traverse materials and set uniform if present
      this.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          const mtl = obj.material as any
          if (mtl && mtl.uniforms && mtl.uniforms.uMix) {
            mtl.uniforms.uMix.value = val
          }
        }
      })
    })
    globalFolder.open()

    // 默认展开样式面板
    styleFolder.open()
  }

  /**
   * 更新所有虚线轮廓的样式
   */
  private updateAllOutlines() {
    this.allOutlines.forEach(outline => {
      if (this.dashedLineParams.enabled) {
        outline.visible = true
        const material = outline.material as THREE.LineDashedMaterial
        material.color.setHex(this.dashedLineParams.color)
        material.linewidth = this.dashedLineParams.linewidth
        material.scale = this.dashedLineParams.scale
        material.dashSize = this.dashedLineParams.dashSize
        material.gapSize = this.dashedLineParams.gapSize
        material.opacity = this.dashedLineParams.opacity
        material.transparent = this.dashedLineParams.opacity < 1.0
        material.needsUpdate = true
      } else {
        outline.visible = false
      }
    })
  }

  /**
   * 更新所有实线轮廓的样式
   */
  private updateAllSolidOutlines() {
    this.allSolidOutlines.forEach(outlineGroup => {
      if (this.solidLineParams.enabled) {
        outlineGroup.visible = true

        // 更新组内所有线条的材质
        outlineGroup.children.forEach((child: THREE.Object3D) => {
          if (child instanceof THREE.LineSegments) {
            const material = child.material as THREE.LineBasicMaterial
            material.color.setHex(this.solidLineParams.color)
            material.opacity = this.solidLineParams.opacity
            material.transparent = this.solidLineParams.opacity < 1.0
            material.needsUpdate = true
          }
        })

        // 如果线宽发生变化，需要重新创建线条
        this.recreateSolidOutlineIfNeeded(outlineGroup)
      } else {
        outlineGroup.visible = false
      }
    })
  }

  /**
   * 如果需要，重新创建实线轮廓（当线宽变化时）
   */
  private recreateSolidOutlineIfNeeded(outlineGroup: THREE.Group) {
    const currentLineCount = outlineGroup.children.length
    const targetLineCount = Math.max(1, Math.floor(this.solidLineParams.linewidth))

    if (currentLineCount !== targetLineCount) {
      // 线宽变化了，需要重新创建
      // 这里可以实现更复杂的逻辑，暂时保持简单
      // 实际应用中可能需要重新生成整个轮廓
    }
  }

  /**
   * 销毁GUI
   */
  destroyGUI() {
    if (this.gui) {
      this.gui.destroy()
      this.gui = null
    }
  }
}

