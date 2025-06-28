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
    } = {}
  ) => {
    const {
      color = 0xffffff,      // 默认绿色
      linewidth = 2,         // 默认线宽
      scale = 1,             // 默认缩放
      dashSize = 5,        // 默认虚线段长度
      gapSize = 8,           // 默认虚线间隙长度
    } = options

    const edgesGeometry = new THREE.EdgesGeometry(geometry)
    const dashedLineMaterial = new THREE.LineDashedMaterial({
      color,
      linewidth,
      scale,
      dashSize,
      gapSize,
    })
    const outLine = new THREE.LineSegments(edgesGeometry, dashedLineMaterial)
    outLine.computeLineDistances() // 计算线段距离，虚线材质需要
    outLine.name = name + '-outline'

    return outLine
  }

  /**
   * 创建单个多边形的3D模型
   * @param geojson - GeoJSON 多边形特征对象
   */
  createPolygon = (geojson: any) => {
    const name = geojson.properties.name || geojson.properties.NAME
    const { geometry } = this.createArea(geojson.geometry.coordinates)
    geometry.name = name + '-geometry'

    // 创建虚线轮廓
    const outLine = this.createDashedOutline(geometry, name)

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
    if (Object.keys(this.series).indexOf(name) !== -1) {
      material.color.setHex(this.series[name])
    } else {
      material.color.setHex(Math.floor(0xffffff))
    }

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
    const material = new THREE.MeshBasicMaterial()
    if (Object.keys(this.series).indexOf(name) !== -1) {
      material.color.setHex(this.series[name])
    } else {
      material.color.setHex(Math.floor(0xffffff))
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
        const { geometry } = this.createArea(coordinates)
        geometry.name = name + (i + 1) + '-geometry'

        // 创建虚线轮廓
        const outLine = this.createDashedOutline(geometry, name + (i + 1))

        const mesh = new THREE.Mesh(geometry, material)
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
}
