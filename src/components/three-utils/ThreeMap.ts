import * as THREE from 'three';
import * as d3 from 'd3';
import { GUI } from 'lil-gui';
export class THREEMAP extends THREE.Group {
  private projection: d3.GeoProjection  
  private size: THREE.Vector3 = new THREE.Vector3(6.283185119628906, 3.030679244995117, 0)
  private minX = -3.265099365234375
  private minY = -1.5291082763671875
  private texture: THREE.Texture | null  
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
  private allOutlines: THREE.LineSegments[] = []  
  private allSolidOutlines: THREE.Group[] = []  
  private regionMaterials: Record<string, THREE.MeshLambertMaterial> = {}
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
  private groupColors: Record<string, number> = {
    group1: 0xffc1bd, 
    group2: 0xffe89e, 
    group3: 0x4db5ff  
  }
  private groupMaterials: Record<string, THREE.MeshLambertMaterial> = {}
  private textureParams = {
    mix: 0.65,
    tint: 1.0
  }
  private zColorParams = {
    sideColor: 0x0ac2ff as number,
    glow: 0.39 
  }
  private bottomLayerParams = {
    secondOpacity: 0.4,
    thirdOpacity: 0.4,
    offset: 82,
    secondColor: 0x0ac2ff as number,
    thirdColor: 0x0ac2ff as number
  }
  private allSecondLayerMeshes: THREE.Mesh[] = []
  private allThirdLayerMeshes: THREE.Mesh[] = []
  private getRegionMaterial(name: string): THREE.MeshLambertMaterial {
    if (this.regionMaterials[name]) return this.regionMaterials[name]
    const group = this.regionToGroup[name] || name 
    if (this.groupMaterials[group]) {
      this.regionMaterials[name] = this.groupMaterials[group]
      return this.groupMaterials[group]
    }
    const material = new THREE.MeshLambertMaterial()
    material.vertexColors = true
    material.map = this.texture
    const colorHex = this.groupColors[group] ?? 0xffffff
    material.color.setHex(colorHex)
    material.opacity = 0.95;
    material.transparent = false
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uMix = { value: this.textureParams.mix };
      shader.uniforms.uTint = { value: this.textureParams.tint };
      (material as any).userData = (material as any).userData || {};
      (material as any).userData.uMix = shader.uniforms.uMix;
      (material as any).userData.uTint = shader.uniforms.uTint;
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );
        vec3 baseColor = diffuseColor.rgb;
        vec3 texColor = mix(sampledDiffuseColor.rgb, sampledDiffuseColor.rgb * baseColor, uTint);
        vec3 finalColor = mix(baseColor, texColor, uMix);
        diffuseColor.rgb = finalColor;
#endif
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
    this.groupMaterials[group] = material
    this.regionMaterials[name] = material
    return material
  }
  constructor(mapData: any, options?: {
      scale?: number, center?: [number, number],
      texture?: { value: THREE.Texture, min?: [number, number], max?: [number, number] }
    }) {
    super()
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
    } else {
      this.size.multiplyScalar(options?.scale || 100)
    }
    this.texture = options?.texture?.value || null
    if (this.texture && this.textureParams.mix === 0) {
      this.textureParams.mix = 1
    }
    if (mapData.type == 'FeatureCollection') {
      mapData.features.forEach((feature: any) => {
        if (feature.geometry.type == 'Polygon') {
          this.createPolygon(feature)
        } else if (feature.geometry.type == 'MultiPolygon') {
          this.createMultiPolygon(feature)
        } else {
        }
      })
    } else if (mapData.type == 'Feature') {
    } else {
    }
    this.createOuterWalls(30)
    this.rotateX(-Math.PI / 2)
    const box = new THREE.Box3().setFromObject(this)
    const center = box.getCenter(new THREE.Vector3())
    this.position.copy(center.negate())
  }
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
    geometry.computeBoundingBox()
    const maxZ = geometry.boundingBox!.max.z
    const tol = 1e-6
    const filtered: number[] = []
    for (let i = 0; i < positions.length; i += 6) {
      const z1 = positions[i + 2]
      const z2 = positions[i + 5]
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
      transparent: opacity < 1.0, 
    })
    const outLine = new THREE.LineSegments(edgesGeometry, dashedLineMaterial)
    outLine.computeLineDistances() 
    outLine.name = name + '-outline'
    outLine.visible = this.dashedLineParams.enabled
    this.allOutlines.push(outLine)
    return outLine
  }
  createSolidOutline = (
    geometry: THREE.BufferGeometry,
    name: string,
    options: {
      color?: number
      linewidth?: number
      opacity?: number
    } = {}
  ) => {
    const {
      color = this.solidLineParams.color,
      linewidth = this.solidLineParams.linewidth,
      opacity = this.solidLineParams.opacity,
    } = options
    const outlineGroup = new THREE.Group()
    outlineGroup.name = name + '-solid-outline'
    outlineGroup.visible = this.solidLineParams.enabled
    const fullEdgesGeometry = new THREE.EdgesGeometry(geometry)
    const positions = fullEdgesGeometry.attributes.position.array as Float32Array
    geometry.computeBoundingBox()
    const maxZ = geometry.boundingBox!.max.z
    const tol = 1e-6
    const filtered: number[] = []
    for (let i = 0; i < positions.length; i += 6) {
      const z1 = positions[i + 2]
      const z2 = positions[i + 5]
      if (Math.abs(z1 - z2) < tol && Math.abs(z1 - maxZ) < tol) {
        filtered.push(
          positions[i], positions[i + 1], positions[i + 2],
          positions[i + 3], positions[i + 4], positions[i + 5]
        )
      }
    }
    const edgesGeometry = new THREE.BufferGeometry()
    edgesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(filtered, 3))
    const solidLineMaterial = new THREE.LineBasicMaterial({
      color: color,
      opacity: opacity,
      transparent: opacity < 1.0,
    })
    const lineCount = Math.max(1, Math.floor(linewidth))
    const offset = linewidth * 0.001 
    for (let i = 0; i < lineCount; i++) {
      const clonedGeometry = edgesGeometry.clone()
      const clonedMaterial = solidLineMaterial.clone()
      if (i > 0) {
        const pos = clonedGeometry.attributes.position.array as Float32Array
        for (let j = 0; j < pos.length; j += 3) {
          pos[j] += (Math.random() - 0.5) * offset 
          pos[j + 1] += (Math.random() - 0.5) * offset 
          pos[j + 2] += (Math.random() - 0.5) * offset 
        }
        clonedGeometry.attributes.position.needsUpdate = true
      }
      const line = new THREE.LineSegments(clonedGeometry, clonedMaterial)
      outlineGroup.add(line)
    }
    this.allSolidOutlines.push(outlineGroup)
    return outlineGroup
  }
  createPolygon = (geojson: any) => {
    const name = geojson.properties.name || geojson.properties.NAME
    const { geometry } = this.createArea(geojson.geometry.coordinates)
    geometry.name = name + '-geometry'
    const outLine: THREE.LineSegments = this.createDashedOutline(geometry, name)
    const material = this.getRegionMaterial(name)
    this.applyZGradient(geometry, material.color, (geometry as any).parameters?.depth ?? 30)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = name
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.add(mesh)
    this.add(outLine)
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
    bottomMesh.name = name + '-bottom'
    bottomMesh.castShadow = false
    bottomMesh.receiveShadow = true
    bottomMesh.position.z = -this.bottomLayerParams.offset
    this.add(bottomMesh)
    this.allSecondLayerMeshes.push(bottomMesh)
  }
  createMultiPolygon = (geojson: any) => {
    const name = geojson.properties.name || geojson.properties.NAME
    const group = new THREE.Group()
    group.name = name
    const material = this.getRegionMaterial(name)
    for (let i = 0; i < geojson.geometry.coordinates.length; i++) {
      geojson.geometry.coordinates.forEach((coordinates: [number, number][][]) => {
        const { geometry } = this.createArea(coordinates)
        geometry.name = name + (i + 1) + '-geometry'
        const outLine: THREE.LineSegments = this.createDashedOutline(geometry, name + (i + 1))
        this.applyZGradient(geometry, material.color, (geometry as any).parameters?.depth ?? 30)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.name = name
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh)
        group.add(outLine)
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
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 30 })
    return { geometry, shape }
  }
  private createOuterWalls(depth: number) {
    const edgeCount: Record<string, { v1: THREE.Vector3, v2: THREE.Vector3, count: number }> = {}
    const keyOf = (a: THREE.Vector3, b: THREE.Vector3) => {
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
      if (count !== 1) return 
      const v1b = v1.clone(); v1b.z = v1.z - depth
      const v2b = v2.clone(); v2b.z = v2.z - depth
      vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v2b.x, v2b.y, v2b.z)
      vertices.push(v1.x, v1.y, v1.z, v2b.x, v2b.y, v2b.z, v1b.x, v1b.y, v1b.z)
      for (let i = 0; i < 3; i++) {
        colors.push(sideColor.r, sideColor.g, sideColor.b) 
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
    const bottomGeo = geo.clone()
    bottomGeo.translate(0, 0, -depth - 0.1)
    const bottomMat = mat.clone()
    bottomMat.opacity = this.bottomLayerParams.thirdOpacity
    bottomMat.transparent = true
    bottomMat.vertexColors = false
    bottomMat.color.setHex(this.bottomLayerParams.thirdColor)
    const bottomWall = new THREE.Mesh(bottomGeo, bottomMat)
    bottomWall.name = 'outer-wall-bottom'
    bottomWall.castShadow = false
    bottomWall.receiveShadow = true
    this.add(bottomWall)
    this.allThirdLayerMeshes.push(bottomWall)
  }
  initGUI(regionLabels?: any[]) {
    if (this.gui) {
      this.gui.destroy()
    }
    this.gui = new GUI({ title: '3D地图控制面板' })
    const dashedFolder = this.gui.addFolder('虚线控制')
    dashedFolder.add(this.dashedLineParams, 'enabled').name('启用虚线').onChange(() => {
      this.updateAllOutlines()
    })
    dashedFolder.addColor(this.dashedLineParams, 'color').name('颜色').onChange(() => {
      this.updateAllOutlines()
    })
    dashedFolder.add(this.dashedLineParams, 'linewidth', 0.1, 10, 0.1).name('线宽').onChange(() => {
      this.updateAllOutlines()
    })
    dashedFolder.add(this.dashedLineParams, 'scale', 0.1, 10, 0.1).name('缩放').onChange(() => {
      this.updateAllOutlines()
    })
    dashedFolder.add(this.dashedLineParams, 'dashSize', 0.1, 20, 0.1).name('虚线段长度').onChange(() => {
      this.updateAllOutlines()
    })
    dashedFolder.add(this.dashedLineParams, 'gapSize', 0.1, 20, 0.1).name('虚线间隙').onChange(() => {
      this.updateAllOutlines()
    })
    dashedFolder.add(this.dashedLineParams, 'opacity', 0, 1, 0.01).name('透明度').onChange(() => {
      this.updateAllOutlines()
    })
    dashedFolder.close()
    const styleFolder = this.gui.addFolder('组样式')
    Object.keys(this.groupMaterials).forEach(groupName => {
      const mat = this.groupMaterials[groupName]
      const grpFolder = styleFolder.addFolder(groupName)
      const colorParam = { value: `#${mat.color.getHexString()}` }
      grpFolder.addColor(colorParam, 'value').name('颜色').onChange((val: any) => {
        const hex = typeof val === 'string' ? parseInt(val.replace('#', '0x'), 16) : val
        mat.color.setHex(hex)
        mat.needsUpdate = true
      })
      const opacityParam = { value: mat.opacity }
      grpFolder.add(opacityParam, 'value', 0, 1, 0.01).name('透明度').onChange((val: number) => {
        mat.opacity = val
        mat.transparent = val < 1
        mat.needsUpdate = true
      })
      grpFolder.close()
    })
    styleFolder.close()
    const globalFolder = this.gui.addFolder('全局')
    const mixController = globalFolder.add(this.textureParams, 'mix', 0, 1, 0.01).name('纹理混合')
    mixController.onChange((val: number) => {
      this.textureParams.mix = val
      Object.values(this.groupMaterials).forEach(mat => {
        const u = (mat as any).userData?.uMix
        if (u) u.value = val
      })
    })
    globalFolder.add(this.textureParams, 'tint', { '纯贴图': 0, '染色贴图': 1 }).name('贴图染色').onChange((val: any) => {
      const tintVal = typeof val === 'string' ? parseFloat(val) : Number(val)
      this.textureParams.tint = tintVal
      Object.values(this.groupMaterials).forEach(mat => {
        const u = (mat as any).userData?.uTint
        if (u) u.value = tintVal
      })
    })
    globalFolder.close()
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
    const secondColorParam = { value: `#${this.bottomLayerParams.secondColor.toString(16).padStart(6, '0')}` }
    gradientFolder.addColor(secondColorParam, 'value').name('第三层颜色').onChange((val: any) => {
      const hex = typeof val === 'string' ? parseInt(val.replace('#', '0x'), 16) : val
      this.bottomLayerParams.secondColor = hex
      this.updateAllSecondLayerColors()
    })
    const thirdColorParam = { value: `#${this.bottomLayerParams.thirdColor.toString(16).padStart(6, '0')}` }
    gradientFolder.addColor(thirdColorParam, 'value').name('第二层颜色').onChange((val: any) => {
      const hex = typeof val === 'string' ? parseInt(val.replace('#', '0x'), 16) : val
      this.bottomLayerParams.thirdColor = hex
      this.updateAllThirdLayerColors()
    })
    gradientFolder.add(this.bottomLayerParams, 'secondOpacity', 0, 1, 0.01).name('第三层透明度').onChange(() => {
      this.updateAllSecondLayerLayers()
    })
    gradientFolder.add(this.bottomLayerParams, 'thirdOpacity', 0, 1, 0.01).name('第二层透明度').onChange(() => {
      this.updateAllThirdLayerLayers()
    })
    gradientFolder.add(this.bottomLayerParams, 'offset', 0, 100, 1).name('第三层Z偏移').onChange(() => {
      this.updateAllSecondLayerPositions()
    })
    gradientFolder.close()
    if (regionLabels && regionLabels.length > 0) {
      const labelsFolder = this.gui.addFolder('区域标签位置')
      regionLabels.forEach((label) => {
        const labelFolder = labelsFolder.addFolder(label.userData.regionName)
        const xController = labelFolder.add(label.position, 'x', -500, 500, 1).name('X位置').onChange(() => {
        })
        const yController = labelFolder.add(label.position, 'y', 0, 500, 1).name('Y位置').onChange(() => {
        })
        const zController = labelFolder.add(label.position, 'z', -500, 500, 1).name('Z位置').onChange(() => {
        })
        labelFolder.add({
          reset: () => {
            const original = label.userData.originalPosition
            label.position.set(original[0], original[1], original[2])
            xController.updateDisplay()
            yController.updateDisplay()
            zController.updateDisplay()
          }
        }, 'reset').name('重置位置')
        labelFolder.close()
      })
      labelsFolder.close()
    }
  }
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
  private updateZGradientColors() {
    this.traverse(obj => {
      if (obj instanceof THREE.Mesh && obj.geometry) {
        const geo = obj.geometry as THREE.BufferGeometry
        let depth = (geo as any).parameters?.depth
        if (depth === undefined) {
          geo.computeBoundingBox()
          const bb = geo.boundingBox
          depth = bb ? bb.max.z - bb.min.z : 30
        }
        const mat = obj.material as THREE.MeshLambertMaterial
        this.applyZGradient(geo, mat.color, depth)
      }
    })
  }
  destroyGUI() {
    if (this.gui) {
      this.gui.destroy()
      this.gui = null
    }
  }
  private applyZGradient(geometry: THREE.BufferGeometry, topColor: THREE.Color, depth: number) {
    const positions = geometry.attributes.position.array as Float32Array
    let colors: Float32Array
    if (geometry.getAttribute('color')) {
      colors = geometry.getAttribute('color').array as Float32Array
    } else {
      colors = new Float32Array(positions.length)
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }
    const sideCol = new THREE.Color(this.zColorParams.sideColor).multiplyScalar(1 + this.zColorParams.glow * 3)
    const normals = geometry.attributes.normal.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      const nz = normals[i + 2]
      const isSide = Math.abs(nz) < 0.7 
      const target = isSide ? sideCol : topColor
      colors[i] = target.r
      colors[i + 1] = target.g
      colors[i + 2] = target.b
    }
    geometry.attributes.color.needsUpdate = true
  }
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
  private updateAllThirdLayerColors() {
    this.allThirdLayerMeshes.forEach(mesh => {
      const mat = mesh.material as THREE.MeshLambertMaterial
      mat.vertexColors = false
      mat.color.setHex(this.bottomLayerParams.thirdColor)
      mat.needsUpdate = true
    })
  }
}
