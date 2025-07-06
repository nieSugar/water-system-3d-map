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


  // GUI 调试相关属性
  private gui: GUI | null = null
  private dashedLineParams = {
    color: 0xffffff,
    linewidth: 4,
    scale: 2.5,
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
    group1: 0xffa099, // 红色
    group2: 0xffe89e, // 黄色
    group3: 0x4db5ff  // 蓝色
  }

  // 每个分组共用一份材质
  private groupMaterials: Record<string, THREE.MeshLambertMaterial> = {}

  // 纹理全局控制参数
  private textureParams = {
    // 纹理与区域色混合比（0=纯色，1=纯纹理）
    mix: 0.65,
    // 贴图染色开关（0=纯贴图，1=贴图乘组色）
    tint: 1.0
  }

  // ------------------ Z 轴侧面颜色控制 ------------------ //
  private zColorParams = {
    // 侧面颜色
    sideColor: 0x0ac2ff as number,
    glow: 0.39 // 0-1 对应提升 1-4 倍亮度
  }

  // ------------------ 底部半透明层控制 ------------------ //
  private bottomLayerParams = {
    // 第二层（区域底面）透明度
    secondOpacity: 0.4,
    // 第三层（最底层外轮廓）透明度
    thirdOpacity: 0.4,
    // 第二层额外向下偏移量
    offset: 82,
    // 第二层侧面颜色
    secondColor: 0x0ac2ff as number,
    // 第三层侧面颜色
    thirdColor: 0x0ac2ff as number
  }

  // 第二层网格集合（polygon bottom）
  private allSecondLayerMeshes: THREE.Mesh[] = []
  // 第三层网格集合（outer wall bottom）
  private allThirdLayerMeshes: THREE.Mesh[] = []

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
    // 启用顶点颜色，方便给挤出体刷渐变色
    material.vertexColors = true
    material.map = this.texture

    // 取组默认颜色，没有则白色
    const colorHex = this.groupColors[group] ?? 0xffffff
    material.color.setHex(colorHex)

    // 默认 100% 不透明，避免透视时看到下方轮廓
    material.opacity = 0.95;
    material.transparent = false

    // 自定义 shader，同之前逻辑
    material.onBeforeCompile = (shader) => {
      // 自定义混合权重 uniform以及贴图染色开关，并在 material.userData 上保留引用，方便后续修改
      shader.uniforms.uMix = { value: this.textureParams.mix };
      shader.uniforms.uTint = { value: this.textureParams.tint };
      (material as any).userData = (material as any).userData || {};
      (material as any).userData.uMix = shader.uniforms.uMix;
      (material as any).userData.uTint = shader.uniforms.uTint;

      // 使用组颜色调制纹理，让调整颜色仍然生效；
      // uMix = 0 纯组色，uMix = 1 纹理 * 组色
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );
        vec3 baseColor = diffuseColor.rgb;
        // 当 uTint 为 1 使用乘色贴图，0 使用纯贴图
        vec3 texColor = mix(sampledDiffuseColor.rgb, sampledDiffuseColor.rgb * baseColor, uTint);
        vec3 finalColor = mix(baseColor, texColor, uMix);
        diffuseColor.rgb = finalColor;
#endif
        // 丢弃挤出侧面（normal.y != 0 表示侧面）
        if(abs(myBorder.y) > 1e-4){
              discard;
        }`).replace('uniform vec3 diffuse;', `uniform vec3 diffuse;
        uniform float uMix;
        uniform float uTint;
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
   * @param options - 可选的地图配置参数
   * @param options.scale - 地图缩放比例
   * @param options.center - 地图中心点坐标 [经度, 纬度]
   * @param options.texture - 纹理配置对象
   * @param options.texture.value - Three.js 纹理对象
   * @param options.texture.min - 纹理映射最小坐标 [经度, 纬度]
   * @param options.texture.max - 纹理映射最大坐标 [经度, 纬度]
   */
  constructor(mapData: any, options?: {
      scale?: number, center?: [number, number],
      texture?: { value: THREE.Texture, min?: [number, number], max?: [number, number] }
    }) {
    super()

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
    // 如果提供了纹理，且尚未自定义混合比（保持 0），则默认启用纯纹理显示
    if (this.texture && this.textureParams.mix === 0) {
      this.textureParams.mix = 1
    }
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

    // 创建最外层竖直墙体
    this.createOuterWalls(30)

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

    // ---------------- 仅保留顶面水平边 ---------------- //
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
        const pos = clonedGeometry.attributes.position.array as Float32Array
        for (let j = 0; j < pos.length; j += 3) {
          pos[j] += (Math.random() - 0.5) * offset // x偏移
          pos[j + 1] += (Math.random() - 0.5) * offset // y偏移
          pos[j + 2] += (Math.random() - 0.5) * offset // z偏移
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

    // --- 给几何体刷上沿 Z 方向的渐变颜色 --- //
    this.applyZGradient(geometry, material.color, (geometry as any).parameters?.depth ?? 30)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = name
    mesh.castShadow = true
    mesh.receiveShadow = true

    // 添加顶部网格和虚线轮廓
    this.add(mesh)
    this.add(outLine)

    // ------------------ 底部半透明层 ------------------ //
    const depth = (geometry as any).parameters?.depth ?? 30
    const bottomGeo = geometry.clone()
    // 向下平移同等深度并略微再移 0.1，防止 z-fighting
    bottomGeo.translate(0, 0, -depth - 0.1)
    // 复用顶部颜色渐变
    this.applyZGradient(bottomGeo, material.color, depth)

    const bottomMat = material.clone()
    bottomMat.opacity = this.bottomLayerParams.secondOpacity
    bottomMat.transparent = true
    // 与顶面渐变独立的统一颜色
    bottomMat.vertexColors = false
    bottomMat.color.setHex(this.bottomLayerParams.secondColor)

    const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat)
    bottomMesh.name = name + '-bottom'
    bottomMesh.castShadow = false
    bottomMesh.receiveShadow = true
    // 初始额外偏移
    bottomMesh.position.z = -this.bottomLayerParams.offset

    this.add(bottomMesh)
    this.allSecondLayerMeshes.push(bottomMesh)
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

        // 给几何体刷上渐变色
        this.applyZGradient(geometry, material.color, (geometry as any).parameters?.depth ?? 30)

        const mesh = new THREE.Mesh(geometry, material)
        mesh.name = name
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // 添加顶部网格和虚线轮廓到组
        group.add(mesh)
        group.add(outLine)

        // ------------------ 底部半透明层 ------------------ //
        const depth = (geometry as any).parameters?.depth ?? 30
        const bottomGeo = geometry.clone()
        bottomGeo.translate(0, 0, -depth - 0.1)
        this.applyZGradient(bottomGeo, material.color, depth)

        const bottomMat = material.clone()
        bottomMat.opacity = this.bottomLayerParams.secondOpacity
        bottomMat.transparent = true
        bottomMat.vertexColors = false
        bottomMat.color.setHex(this.bottomLayerParams.secondColor)

        const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat)
        bottomMesh.name = name + (i + 1) + '-bottom'
        bottomMesh.castShadow = false
        bottomMesh.receiveShadow = true
        bottomMesh.position.z = -this.bottomLayerParams.offset
        group.add(bottomMesh)
        this.allSecondLayerMeshes.push(bottomMesh)
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
   * 根据顶面唯一边生成外墙
   * @param depth 挤出深度，需与 createArea 使用一致
   */
  private createOuterWalls(depth: number) {
    // 收集所有顶面边出现次数
    const edgeCount: Record<string, { v1: THREE.Vector3, v2: THREE.Vector3, count: number }> = {}

    const keyOf = (a: THREE.Vector3, b: THREE.Vector3) => {
      // 无向边 key
      const k1 = `${a.x.toFixed(5)},${a.y.toFixed(5)},${a.z.toFixed(5)}`
      const k2 = `${b.x.toFixed(5)},${b.y.toFixed(5)},${b.z.toFixed(5)}`
      return k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`
    }

    this.allOutlines.forEach(ls => {
      const posArr = ls.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < posArr.length; i += 6) {
        const v1 = new THREE.Vector3(posArr[i], posArr[i + 1], posArr[i + 2])
        const v2 = new THREE.Vector3(posArr[i + 3], posArr[i + 4], posArr[i + 5])
        const key = keyOf(v1, v2)
        if (!edgeCount[key]) {
          edgeCount[key] = { v1, v2, count: 1 }
        } else {
          edgeCount[key].count++
        }
      }
    })

    const vertices: number[] = []
    const colors: number[] = []

    const sideColor = new THREE.Color(this.zColorParams.sideColor).multiplyScalar(1 + this.zColorParams.glow * 3)

    Object.values(edgeCount).forEach(({ v1, v2, count }) => {
      if (count !== 1) return // 只要独立一次出现的边 -> 外边

      const v1b = v1.clone(); v1b.z = v1.z - depth
      const v2b = v2.clone(); v2b.z = v2.z - depth

      // 三角 1 (v1, v2, v2b)
      vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v2b.x, v2b.y, v2b.z)
      // 三角 2 (v1, v2b, v1b)
      vertices.push(v1.x, v1.y, v1.z, v2b.x, v2b.y, v2b.z, v1b.x, v1b.y, v1b.z)

      // 颜色渐变：顶部颜色为已有 topColor，侧面为 sideColor
      for (let i = 0; i < 3; i++) {
        colors.push(sideColor.r, sideColor.g, sideColor.b) // first triangle all side color
      }
      for (let i = 0; i < 3; i++) {
        colors.push(sideColor.r, sideColor.g, sideColor.b)
      }
    })

    if (vertices.length === 0) return

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
    geo.computeVertexNormals()

    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: false, opacity: 0.95 })

    const wallMesh = new THREE.Mesh(geo, mat)
    wallMesh.name = 'outer-wall'
    wallMesh.castShadow = true
    wallMesh.receiveShadow = true

    this.add(wallMesh)

    // ------------------- 最底层仅轮廓 ------------------- //
    const bottomGeo = geo.clone()
    // 再向下平移 depth，位于第二层下方
    bottomGeo.translate(0, 0, -depth - 0.1)

    const bottomMat = mat.clone()
    bottomMat.opacity = this.bottomLayerParams.thirdOpacity
    bottomMat.transparent = true
    // 使用独立颜色并禁用顶点色
    bottomMat.vertexColors = false
    bottomMat.color.setHex(this.bottomLayerParams.thirdColor)

    const bottomWall = new THREE.Mesh(bottomGeo, bottomMat)
    bottomWall.name = 'outer-wall-bottom'
    bottomWall.castShadow = false
    bottomWall.receiveShadow = true

    this.add(bottomWall)

    // 存储到第三层集合，便于统一控制
    this.allThirdLayerMeshes.push(bottomWall)
  }


  /**
   * 初始化GUI调试界面
   */
  initGUI(regionLabels?: any[]) {
    if (this.gui) {
      this.gui.destroy()
    }

    this.gui = new GUI({ title: '3D地图控制面板' })

    // 虚线控制面板 - 默认不展开
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

    // 虚线面板默认不展开
    dashedFolder.close()

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

      // 子文件夹默认不展开
      grpFolder.close()
    })

    // 组样式面板默认不展开
    styleFolder.close()

    // 全局纹理混合控制 - 默认不展开
    const globalFolder = this.gui.addFolder('全局')

    // 纹理混合比例
    const mixController = globalFolder.add(this.textureParams, 'mix', 0, 1, 0.01).name('纹理混合')
    mixController.onChange((val: number) => {
      this.textureParams.mix = val
      // 遍历组材质，实时更新 uniform
      Object.values(this.groupMaterials).forEach(mat => {
        const u = (mat as any).userData?.uMix
        if (u) u.value = val
      })
    })

    // 贴图染色
    globalFolder.add(this.textureParams, 'tint', { '纯贴图': 0, '染色贴图': 1 }).name('贴图染色').onChange((val: any) => {
      const tintVal = typeof val === 'string' ? parseFloat(val) : Number(val)
      this.textureParams.tint = tintVal
      Object.values(this.groupMaterials).forEach(mat => {
        const u = (mat as any).userData?.uTint
        if (u) u.value = tintVal
      })
    })

    // 全局面板默认不展开
    globalFolder.close()

    // #region 底部半透明层控制

    // -------------------- Z 轴颜色  -------------------- //
    const gradientFolder = this.gui.addFolder('Z 轴颜色')
    const bottomColorParam = { value: `#${this.zColorParams.sideColor.toString(16).padStart(6, '0')}` }
    gradientFolder.addColor(bottomColorParam, 'value').name('侧面颜色').onChange((val: any) => {
      const hex = typeof val === 'string' ? parseInt(val.replace('#', '0x'), 16) : val
      this.zColorParams.sideColor = hex
      this.updateZGradientColors()
    })

    gradientFolder.add(this.zColorParams, 'glow', 0, 1, 0.01).name('亮度提升').onChange(() => {
      this.updateZGradientColors()
    })

    // 第三层颜色
    const secondColorParam = { value: `#${this.bottomLayerParams.secondColor.toString(16).padStart(6, '0')}` }
    gradientFolder.addColor(secondColorParam, 'value').name('第三层颜色').onChange((val: any) => {
      const hex = typeof val === 'string' ? parseInt(val.replace('#', '0x'), 16) : val
      this.bottomLayerParams.secondColor = hex
      this.updateAllSecondLayerColors()
    })

    // 第二层颜色
    const thirdColorParam = { value: `#${this.bottomLayerParams.thirdColor.toString(16).padStart(6, '0')}` }
    gradientFolder.addColor(thirdColorParam, 'value').name('第二层颜色').onChange((val: any) => {
      const hex = typeof val === 'string' ? parseInt(val.replace('#', '0x'), 16) : val
      this.bottomLayerParams.thirdColor = hex
      this.updateAllThirdLayerColors()
    })

    // 第三层透明度
    gradientFolder.add(this.bottomLayerParams, 'secondOpacity', 0, 1, 0.01).name('第三层透明度').onChange(() => {
      this.updateAllSecondLayerLayers()
    })

    // 第二层透明度
    gradientFolder.add(this.bottomLayerParams, 'thirdOpacity', 0, 1, 0.01).name('第二层透明度').onChange(() => {
      this.updateAllThirdLayerLayers()
    })

    // 底层额外 Z 偏移
    gradientFolder.add(this.bottomLayerParams, 'offset', 0, 100, 1).name('第三层Z偏移').onChange(() => {
      this.updateAllSecondLayerPositions()
    })

    // Z轴颜色面板默认不展开
    gradientFolder.close()
    
    // #endregion

    // 组样式面板默认不展开

    // -------------------- 区域标签位置控制 -------------------- //
    if (regionLabels && regionLabels.length > 0) {
      const labelsFolder = this.gui.addFolder('区域标签位置')

      regionLabels.forEach((label) => {
        const labelFolder = labelsFolder.addFolder(label.userData.regionName)

        // X轴位置控制
        const xController = labelFolder.add(label.position, 'x', -500, 500, 1).name('X位置').onChange(() => {
          // 位置更新会自动反映到3D场景中
        })

        // Y轴位置控制
        const yController = labelFolder.add(label.position, 'y', 0, 500, 1).name('Y位置').onChange(() => {
          // 位置更新会自动反映到3D场景中
        })

        // Z轴位置控制
        const zController = labelFolder.add(label.position, 'z', -500, 500, 1).name('Z位置').onChange(() => {
          // 位置更新会自动反映到3D场景中
        })

        // 重置按钮
        labelFolder.add({
          reset: () => {
            const original = label.userData.originalPosition
            label.position.set(original[0], original[1], original[2])
            // 更新GUI控制器显示值
            xController.updateDisplay()
            yController.updateDisplay()
            zController.updateDisplay()
          }
        }, 'reset').name('重置位置')

        // 每个标签的子面板默认不展开
        labelFolder.close()
      })

      // 区域标签位置面板默认不展开
      labelsFolder.close()
    }
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
   * 当底部颜色发生变化时，重新刷一遍所有区域的 Z 轴渐变颜色
   */
  private updateZGradientColors() {
    this.traverse(obj => {
      if (obj instanceof THREE.Mesh && obj.geometry) {
        const geo = obj.geometry as THREE.BufferGeometry
        // 尝试从 Extrude 参数拿 depth，否则估算
        let depth = (geo as any).parameters?.depth
        if (depth === undefined) {
          // 估算 z 方向范围
          geo.computeBoundingBox()
          const bb = geo.boundingBox
          depth = bb ? bb.max.z - bb.min.z : 30
        }
        const mat = obj.material as THREE.MeshLambertMaterial
        this.applyZGradient(geo, mat.color, depth)
      }
    })
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

  // --- 给几何体刷上沿 Z 方向的渐变颜色 --- //
  private applyZGradient(geometry: THREE.BufferGeometry, topColor: THREE.Color, depth: number) {
    const positions = geometry.attributes.position.array as Float32Array

    let colors: Float32Array
    if (geometry.getAttribute('color')) {
      colors = geometry.getAttribute('color').array as Float32Array
    } else {
      colors = new Float32Array(positions.length)
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }

    // 让侧面颜色更亮，Bloom 阈值高于 0.8，需要接近白色
    const sideCol = new THREE.Color(this.zColorParams.sideColor).multiplyScalar(1 + this.zColorParams.glow * 3)
    const normals = geometry.attributes.normal.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      const nz = normals[i + 2]
      const isSide = Math.abs(nz) < 0.7 // vertical faces z 分量≈0

      const target = isSide ? sideCol : topColor

      colors[i] = target.r
      colors[i + 1] = target.g
      colors[i + 2] = target.b
    }

    geometry.attributes.color.needsUpdate = true
  }

  /**
   * 更新所有第二层透明度
   */
  private updateAllSecondLayerLayers() {
    this.allSecondLayerMeshes.forEach(mesh => {
      const mat = mesh.material as THREE.Material
      if ('opacity' in mat) {
        (mat as any).opacity = this.bottomLayerParams.secondOpacity
        mat.transparent = this.bottomLayerParams.secondOpacity < 1
        mat.needsUpdate = true
      }
    })
  }

  private updateAllSecondLayerColors() {
    this.allSecondLayerMeshes.forEach(mesh => {
      const mat = mesh.material as THREE.MeshLambertMaterial
      mat.vertexColors = false
      mat.color.setHex(this.bottomLayerParams.secondColor)
      mat.needsUpdate = true
    })
  }

  private updateAllSecondLayerPositions() {
    this.allSecondLayerMeshes.forEach(mesh => {
      mesh.position.z = -this.bottomLayerParams.offset
    })
  }

  /**
   * 更新所有第三层透明度
   */
  private updateAllThirdLayerLayers() {
    this.allThirdLayerMeshes.forEach(mesh => {
      const mat = mesh.material as THREE.Material
      if ('opacity' in mat) {
        (mat as any).opacity = this.bottomLayerParams.thirdOpacity
        mat.transparent = this.bottomLayerParams.thirdOpacity < 1
        mat.needsUpdate = true
      }
    })
  }

  /**
   * 更新所有第三层颜色
   */
  private updateAllThirdLayerColors() {
    this.allThirdLayerMeshes.forEach(mesh => {
      const mat = mesh.material as THREE.MeshLambertMaterial
      mat.vertexColors = false
      mat.color.setHex(this.bottomLayerParams.thirdColor)
      mat.needsUpdate = true
    })
  }
}

