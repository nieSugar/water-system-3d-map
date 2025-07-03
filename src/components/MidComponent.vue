<!--
  3D地图组件 - 沈阳市水务系统可视化
  功能：展示沈阳市各区县的3D地图，支持点击交互和标记点显示
  技术栈：Three.js + D3.js + Vue3
-->
<template>
  <!-- 3D地图容器，作为Three.js渲染的挂载点 -->
  <div ref="containerRef" class="rounded-lg shadow-lg" style="width: 100%;height: 100%; background: transparent;">

  </div>


</template>

<style scoped></style>

<script setup lang="ts">
import { ref, type Ref, onMounted } from 'vue';
// 导入自定义的Three.js工具类
import { useThree, THREEMAP, EventCaster } from './three-utils';
// 导入CSS2D渲染器，用于在3D场景中显示HTML元素
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
// 导入沈阳市地图纹理图片
// @ts-ignore
import sy from '../assets/sy.jpg'
import * as THREE from 'three'
// 导入标记点图标
// @ts-ignore
import maodian from '../assets/锚点 拷贝 15.png'
// 导入背景图片
// @ts-ignore
import bj from '../assets/bj@2x.png'
// 导入弹框专用背景图片
// @ts-ignore
import modalBg from '../assets/弹框bj.png'
// 创建DOM容器引用，用于挂载Three.js渲染器
const containerRef = ref<HTMLDivElement>() as Ref<HTMLDivElement>

// 当前显示的3D弹框对象
let current3DPopup: CSS2DObject | null = null

// 弹框背景图片尺寸
let modalImageSize = { width: 320, height: 180 }

// 根据区域名称获取对应的数据
const getRegionData = (regionName: string) => {
  // 模拟不同区域的数据
  const regionDataMap: Record<string, any> = {
    '康平县': { name: '康平县', complaints: '37485', percentage: '40.32' },
    '法库县': { name: '法库县', complaints: '28756', percentage: '32.15' },
    '新民市': { name: '新民市', complaints: '45123', percentage: '48.67' },
    '辽中区': { name: '辽中区', complaints: '31245', percentage: '35.89' },
    '于洪区': { name: '于洪区', complaints: '52341', percentage: '55.23' },
    '沈北新区': { name: '沈北新区', complaints: '29876', percentage: '33.45' },
    '大东区': { name: '大东区', complaints: '41567', percentage: '44.78' },
    '和平区': { name: '和平区', complaints: '38945', percentage: '42.11' },
    '苏家屯区': { name: '苏家屯区', complaints: '35678', percentage: '38.92' },
    '浑南区': { name: '浑南区', complaints: '47892', percentage: '51.34' },
    '沈河区': { name: '沈河区', complaints: '33456', percentage: '36.78' },
    '皇姑区': { name: '皇姑区', complaints: '39234', percentage: '43.21' },
    '铁西区': { name: '铁西区', complaints: '44567', percentage: '47.89' }
  }

  return regionDataMap[regionName] || { name: regionName, complaints: '0', percentage: '0' }
}

// 存储当前弹窗的原始位置
let currentPopupBasePosition: number[] | null = null

// 更新弹窗位置的函数
const updatePopupPosition = () => {
  if (current3DPopup && currentPopupBasePosition && map) {
    const popupParams = map.getPopupPositionParams()
    // 弹窗显示在锚点图标上方，基础偏移为锚点图标高度 + 一些间距
    const baseYOffset = 30 // 锚点图标高度(20px) + 标签高度(24px) + 间距
    const finalPosition = [
      currentPopupBasePosition[0] + popupParams.offsetX,
      currentPopupBasePosition[1] + baseYOffset + popupParams.offsetY,
      currentPopupBasePosition[2] + popupParams.offsetZ
    ]
    current3DPopup.position.set(finalPosition[0], finalPosition[1], finalPosition[2])
  }
}

// 创建3D弹框
const create3DPopup = (regionData: any, position: number[]) => {
  // 如果已有弹框，先移除
  if (current3DPopup) {
    scene.remove(current3DPopup)
    current3DPopup = null
  }

  // 保存原始位置
  currentPopupBasePosition = [...position]

  // 获取弹窗位置参数
  const popupParams = map.getPopupPositionParams()
  // 弹窗显示在锚点图标上方，基础偏移为锚点图标高度 + 一些间距
  const baseYOffset = 30 // 锚点图标高度(20px) + 标签高度(24px) + 间距
  const finalPosition = [
    position[0] + popupParams.offsetX,
    position[1] + baseYOffset + popupParams.offsetY,
    position[2] + popupParams.offsetZ
  ]

  // 创建弹框容器
  const popupContainer = document.createElement('div')
  popupContainer.style.position = 'relative'
  popupContainer.style.width = `${modalImageSize.width}px`
  popupContainer.style.height = `${modalImageSize.height}px`
  popupContainer.style.backgroundImage = `url(${modalBg})`
  popupContainer.style.backgroundSize = 'contain'
  popupContainer.style.backgroundRepeat = 'no-repeat'
  popupContainer.style.backgroundPosition = 'center'
  popupContainer.style.filter = 'drop-shadow(0 0 15px rgba(0, 150, 255, 0.6))'
  popupContainer.style.padding = '16px 20px'
  popupContainer.style.color = 'white'
  popupContainer.style.fontFamily = 'Arial, sans-serif'
  popupContainer.style.pointerEvents = 'auto'
  popupContainer.style.display = 'flex'
  popupContainer.style.flexDirection = 'column'

  // 创建关闭按钮
  const closeBtn = document.createElement('button')
  closeBtn.innerHTML = '×'
  closeBtn.style.position = 'absolute'
  closeBtn.style.top = '8px'
  closeBtn.style.right = '12px'
  closeBtn.style.background = 'none'
  closeBtn.style.border = 'none'
  closeBtn.style.color = '#ffffff'
  closeBtn.style.fontSize = '20px'
  closeBtn.style.cursor = 'pointer'
  closeBtn.style.fontWeight = 'bold'
  closeBtn.style.zIndex = '10'
  closeBtn.style.transition = 'color 0.2s ease'
  closeBtn.addEventListener('click', () => {
    if (current3DPopup) {
      scene.remove(current3DPopup)
      current3DPopup = null
    }
  })
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.color = '#60a5fa'
  })
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.color = '#ffffff'
  })

  // 创建标题区域
  const titleArea = document.createElement('div')
  titleArea.style.display = 'flex'
  titleArea.style.alignItems = 'center'
  titleArea.style.marginBottom = '16px'

  const icon = document.createElement('div')
  icon.innerHTML = '📍'
  icon.style.width = '24px'
  icon.style.height = '24px'
  icon.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  icon.style.borderRadius = '50%'
  icon.style.display = 'flex'
  icon.style.alignItems = 'center'
  icon.style.justifyContent = 'center'
  icon.style.marginRight = '8px'
  icon.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)'
  icon.style.fontSize = '12px'

  const title = document.createElement('div')
  title.textContent = regionData.name
  title.style.fontSize = '16px'
  title.style.fontWeight = 'bold'
  title.style.color = '#ffffff'
  title.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)'

  titleArea.appendChild(icon)
  titleArea.appendChild(title)

  // 创建数据区域
  const dataArea = document.createElement('div')
  dataArea.style.flex = '1'
  dataArea.style.display = 'flex'
  dataArea.style.flexDirection = 'column'
  dataArea.style.gap = '8px'
  dataArea.style.marginBottom = '16px'

  // 格式化数字显示
  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const complaintsRow = document.createElement('div')
  complaintsRow.style.display = 'flex'
  complaintsRow.style.alignItems = 'center'
  complaintsRow.style.justifyContent = 'space-between'
  complaintsRow.innerHTML = `
    <span style="color: #93c5fd; font-size: 14px; font-weight: 500;">客诉总量:</span>
    <span style="color: #ffffff; font-size: 18px; font-weight: bold; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); margin-right: 4px;">${formatNumber(regionData.complaints)}</span>
    <span style="color: #93c5fd; font-size: 12px;">个</span>
  `

  const percentageRow = document.createElement('div')
  percentageRow.style.display = 'flex'
  percentageRow.style.alignItems = 'center'
  percentageRow.style.justifyContent = 'space-between'
  percentageRow.innerHTML = `
    <span style="color: #93c5fd; font-size: 14px; font-weight: 500;">占比:</span>
    <span style="color: #ffffff; font-size: 18px; font-weight: bold; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); margin-right: 4px;">${regionData.percentage}</span>
    <span style="color: #93c5fd; font-size: 12px;">%</span>
  `

  dataArea.appendChild(complaintsRow)
  dataArea.appendChild(percentageRow)

  // 创建底部按钮区域
  const bottomSection = document.createElement('div')
  bottomSection.style.display = 'flex'
  bottomSection.style.justifyContent = 'center'

  // 组装弹框
  popupContainer.appendChild(closeBtn)
  popupContainer.appendChild(titleArea)
  popupContainer.appendChild(dataArea)
  popupContainer.appendChild(bottomSection)

  // 创建CSS2D对象
  const popup3D = new CSS2DObject(popupContainer)
  popup3D.position.set(finalPosition[0], finalPosition[1], finalPosition[2]) // 使用计算后的位置

  scene.add(popup3D)
  current3DPopup = popup3D

  return popup3D
}

// 初始化Three.js场景，启用轨道控制器、光照和CSS2D渲染
const { scene, renderer, camera } = useThree(containerRef, {
  controls: true,  // 启用鼠标控制（缩放、旋转、平移）
  light: true,     // 启用环境光照
  css2d: true,     // 启用CSS2D渲染器，支持HTML标签叠加
  bloom: false     // 关闭 Bloom 泛光，保留透明背景
})

// 设置相机位置，俯视角度观察地图
// 参数：x=-100（左右位置）, y=400（高度）, z=350（前后距离）
camera.position.set(-100, 400, 350);

// 添加额外的光照效果，增强3D立体感
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 200, 100);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 添加环境光，确保所有区域都有基础照明
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

// 取消场景背景色，保持透明，避免绘制深色背景板
scene.background = null;

// 创建事件投射器，用于处理3D对象的鼠标交互
const eventCaster = new EventCaster(camera, renderer.domElement)

// ThreeMap 实例将被赋值到该变量，供其他辅助函数访问
let map: any

// 获取弹框背景图片的实际尺寸
const loadModalImageSize = () => {
  const img = new Image()
  img.onload = () => {
    modalImageSize = {
      width: img.naturalWidth,
      height: img.naturalHeight
    }
    console.log('弹框图片尺寸:', modalImageSize)
  }
  img.src = modalBg
}

// 组件挂载后初始化3D地图
onMounted(() => {
  // 加载弹框背景图片尺寸
  loadModalImageSize()

  // 异步加载沈阳市GeoJSON地理数据
  fetch('/shengyang.json')
    .then(res => res.json())
    .then(shenyang => {
      map = new THREEMAP(shenyang, {
        // 地图配置参数
        scale: 13000,                           // 地图缩放比例
        center: [-123.406664, -41.788074],      // 地图中心点坐标（沈阳市中心）
        texture: {
          value: new THREE.TextureLoader().load(sy),  // 加载地图纹理贴图
          max: [123.814145, 43.042711],               // 纹理映射最大坐标
          min: [122.422105, 41.199854]                // 纹理映射最小坐标
        }
      })

      // 为地图的每个区域添加点击事件监听
      // map.traverse((child) => {
      //   if (child instanceof THREE.Mesh) {
      //     eventCaster.addListener(child, 'click', (result) => {
      //       console.log('点击区域:', result);
      //       // 在点击位置创建新的标记点
      //       sprite.position.copy(result.point)  // 复制点击位置坐标
      //       sprite.position.y += 10             // 标记点稍微抬高，避免与地面重叠
      //       scene.add(sprite)                   // 将标记点添加到场景
      //     })
      //   }
      // })

      // 将完整的3D地图添加到场景中
      scene.add(map)

      // 为特定区域组合添加统一实线外边界，且保留内部虚线边界
      addClusterOutline(shenyang, ['康平县', '法库县'])
      addClusterOutline(shenyang, ['新民市', '辽中区'])

      // 添加区域标签，类似图片中的效果
      addRegionLabels(scene)

      // 初始化GUI调试面板，传入区域标签对象
      map.initGUI(null, regionLabelObjects)

      // 设置弹窗位置更新回调函数
      map.setPopupPositionUpdateCallback(updatePopupPosition)
    })
})

// 存储标签对象，用于GUI控制
let regionLabelObjects: CSS2DObject[] = []

// 添加区域标签函数
function addRegionLabels(scene: THREE.Scene) {
  const color = '#efffff'
  const regionLabels = [
    { name: '康平县', position: [40, 35, -155], color },
    { name: '法库县', position: [20, 35, -80], color },
    { name: '新民市', position: [-50, 35, -10], color },
    { name: '辽中区', position: [-70, 35, 110], color },
    { name: '于洪区', position: [40, 35, 30], color },
    { name: '沈北新区', position: [90, 35, -10], color },
    { name: '大东区', position: [100, 35, 45], color },
    { name: '和平区', position: [65, 35, 85], color },
    { name: '苏家屯区', position: [50, 35, 110], color },
    { name: '浑南区', position: [115, 35, 85], color },
    { name: '沈河区', position: [90, 35, 76], color },
    { name: '皇姑区', position: [80, 35, 50], color },
    { name: '铁西区', position: [30, 35, 77], color }
  ]

  regionLabels.forEach(region => {
    // 创建容器div
    const containerDiv = document.createElement('div')
    containerDiv.style.position = 'relative'
    containerDiv.style.display = 'flex'
    containerDiv.style.flexDirection = 'column'
    containerDiv.style.alignItems = 'center'
    containerDiv.style.pointerEvents = 'auto' // 启用鼠标事件
    containerDiv.style.userSelect = 'none'
    containerDiv.style.cursor = 'pointer' // 显示手型光标

    // 创建锚点图标
    const iconImg = document.createElement('img')
    iconImg.src = maodian
    iconImg.style.width = '20px'
    iconImg.style.height = '20px'
    iconImg.style.marginBottom = '2px'
    iconImg.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
    iconImg.style.display = 'block'
    iconImg.style.margin = '0 auto 2px auto'

    // 创建标签背景容器
    const labelContainer = document.createElement('div')
    labelContainer.style.position = 'relative'
    labelContainer.style.display = 'flex'
    labelContainer.style.alignItems = 'center'
    labelContainer.style.justifyContent = 'center'
    labelContainer.style.minWidth = '60px'
    labelContainer.style.height = '24px'
    labelContainer.style.backgroundImage = `url(${bj})`
    labelContainer.style.backgroundSize = '100% 100%'
    labelContainer.style.backgroundRepeat = 'no-repeat'
    labelContainer.style.backgroundPosition = 'center'

    // 创建文字标签
    const labelText = document.createElement('div')
    labelText.innerText = region.name
    labelText.style.color = region.color
    labelText.style.fontSize = '10px'
    labelText.style.fontWeight = '300'
    labelText.style.fontFamily = 'Arial, sans-serif'
    labelText.style.whiteSpace = 'nowrap'
    labelText.style.padding = '0 8px'

    // 添加点击事件
    containerDiv.addEventListener('click', (event) => {
      event.stopPropagation() // 阻止事件冒泡

      // 根据区域名称设置不同的数据
      const regionData = getRegionData(region.name)

      // 创建3D弹框，显示在当前区域位置
      create3DPopup(regionData, region.position)

      console.log('点击了标签:', region.name)
    })

    // 添加悬停效果
    containerDiv.addEventListener('mouseenter', () => {
      containerDiv.style.transform = 'scale(1.1)'
      containerDiv.style.transition = 'transform 0.2s ease'
    })

    containerDiv.addEventListener('mouseleave', () => {
      containerDiv.style.transform = 'scale(1)'
    })

    // 组装元素
    labelContainer.appendChild(labelText)
    containerDiv.appendChild(iconImg)
    containerDiv.appendChild(labelContainer)

    const label = new CSS2DObject(containerDiv)
    label.position.set(region.position[0], region.position[1], region.position[2])
    label.userData = { regionName: region.name, originalPosition: [...region.position] }
    scene.add(label)
    regionLabelObjects.push(label)
  })
}

// 为由多个行政区组成的整体添加实线外边界
function addClusterOutline(shenyangData: any, names: string[]) {
  // 获取三维地图实例上的 D3 投影函数
  // THREEMAP 中 projection 为私有属性，这里通过 any 绕过类型限制
  // eslint-disable-next-line
  const projection = (map as any).projection as (lnglat: [number, number]) => [number, number]

  // 统一的实线材质（白色，线宽稍粗）
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, depthTest: false })

  const clusterGroup = new THREE.Group()
  clusterGroup.name = names.join('-') + '-solid-outline'

  const TOP_HEIGHT = 30.5 // 挤出厚度 30，再抬高 0.5 避免 Z-Fighting

  // Map 用于统计每条边出现的次数，key 为 "x1,y1|x2,y2"（小->大 方向统一）
  const edgeCount: Map<string, { p1: [number, number], p2: [number, number], count: number }> = new Map()

  // 收集所有边
  names.forEach((n) => {
    const feature = shenyangData.features.find((f: any) => f.properties.name === n)
    if (!feature) return

    const polys: [number, number][][][] = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates

    polys.forEach((poly) => {
      const exterior = poly[0]
      for (let i = 0; i < exterior.length; i++) {
        const a = exterior[i]
        const b = exterior[(i + 1) % exterior.length]

        const key = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])
          ? `${a[0]},${a[1]}|${b[0]},${b[1]}`
          : `${b[0]},${b[1]}|${a[0]},${a[1]}`

        if (!edgeCount.has(key)) {
          edgeCount.set(key, { p1: a as [number, number], p2: b as [number, number], count: 1 })
        } else {
          const obj = edgeCount.get(key)!
          obj.count += 1
        }
      }
    })
  })

  // 仅保留出现一次的边（外轮廓）
  const outerPositions: number[] = []
  edgeCount.forEach(({ p1, p2, count }) => {
    if (count === 1) {
      const [x1, y1] = projection(p1) as [number, number]
      const [x2, y2] = projection(p2) as [number, number]
      outerPositions.push(x1, -y1, TOP_HEIGHT)
      outerPositions.push(x2, -y2, TOP_HEIGHT)
    }
  })

  if (outerPositions.length > 0) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(outerPositions, 3))
    const lineSeg = new THREE.LineSegments(geometry, material)
    clusterGroup.add(lineSeg)
  }

  map.add(clusterGroup)
}
</script>

<!-- 更新颜色方案\nconst colorMap: Record<string, number> = {\n  '康平县': 0xff0000,\n  '法库县': 0xff0000,\n  '新民市': 0xf7d358,\n  '辽中区': 0xf7d358,\n  '于洪区': 0x5dade2,\n  '沈北新区': 0x5dade2,\n  '大东区': 0x5dade2,\n  '和平区': 0x5dade2,\n  '沈河区': 0x5dade2,\n  '皇姑区': 0x5dade2,\n  '铁西区': 0x5dade2,\n  '浑南区': 0x5dade2,\n  '苏家屯区': 0x5dade2\n};\n\n// 设置透明度\nlet opacity = 0.85;\nif (['康平县', '法库县'].includes(name)) {\n  opacity = 0.6; // 透明红色\n} else if (['新民市', '辽中区'].includes(name)) {\n  opacity = 0.8; // 渐变黄色\n}\n\nconst material = new THREE.MeshPhongMaterial({ \n  color: colorMap[name] || 0x1e90ff,\n  side: THREE.DoubleSide, \n  transparent: true, \n  opacity\n});\n\n// 为康平县和法库县之间添加白色分割虚线\nif (['康平县', '法库县'].includes(name)) {\n  const borderMaterial = new THREE.LineDashedMaterial({ \n    color: 0xffffff, \n    dashSize: 10, \n    gapSize: 6, \n    linewidth: 1\n  });\n  const borderLine = new THREE.Line(borderGeometry, borderMaterial);\n  borderLine.computeLineDistances();\n  group.add(borderLine);\n} -->
