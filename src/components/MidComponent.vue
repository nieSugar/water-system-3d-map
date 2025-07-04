<!--
  3D地图组件 - 沈阳市水务系统可视化
  功能：展示沈阳市各区县的3D地图，支持点击交互和标记点显示
  技术栈：Three.js + D3.js + Vue3
-->
<template>
  <!-- 3D地图容器，作为Three.js渲染的挂载点 -->
  <div ref="containerRef" class="rounded-lg shadow-lg" style="width: 100%;height: 100%; background: transparent;"></div>

</template>

<style scoped></style>

<script setup lang="ts">
import { ref, type Ref, onMounted, reactive } from 'vue';
import { get } from '../utils/request';
// 导入自定义的Three.js工具类
import { useThree, THREEMAP } from './three-utils';
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
import modalBg from '../assets/dialog.png'
// 创建DOM容器引用，用于挂载Three.js渲染器
const containerRef = ref<HTMLDivElement>() as Ref<HTMLDivElement>

// 弹框背景图片尺寸
let modalImageSize = { width: 320, height: 180 }

// 区域数据类型
interface RegionData {
  name: string
  complaints: string
  percentage: string
}

// 默认数据（接口未返回前展示这些值）
const defaultRegionData: Record<string, RegionData> = {
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

// 响应式 Map，接口更新后这里的值会改变
const regionDataMap = reactive<Record<string, RegionData>>({ ...defaultRegionData })

// 千分位格式化
const formatNumber = (num: string) => num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

// 根据区域名称获取对应的数据
const getRegionData = (regionName: string): RegionData => {
  return regionDataMap[regionName] || { name: regionName, complaints: '0', percentage: '0' }
}

// 拉取接口数据并更新 regionDataMap
const fetchRegionData = async () => {
  try {
    const res = await get<RegionData[]>('/water/region-data')
    if (Array.isArray(res)) {
      res.forEach(item => {
        regionDataMap[item.name] = { ...item }
      })
      refreshAllPopupContent()
    }
  } catch (err) {
    console.error('获取区域数据失败: ', err)
  }
}

// 容器 DOM 随 CSS2DObject 移动，无需额外位置更新
const updatePopupPosition = () => { }

// 创建弹窗
const createPopupElement = (regionName: string): HTMLDivElement => {
  const regionData = getRegionData(regionName)

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
  popupContainer.style.display = 'none'
  popupContainer.style.flexDirection = 'column'
  popupContainer.style.cursor = 'pointer'

  // 弹框添加点击事件
  popupContainer.addEventListener('click', (e) => {
    e.stopPropagation()
    console.log(`Popup clicked: ${regionName}`)
  })

  // 创建标题区域
  const titleArea = document.createElement('div')
  titleArea.style.marginBottom = '16px'
  titleArea.style.height = '30px'

  const title = document.createElement('div')
  title.textContent = regionData.name
  title.style.fontSize = '19px'
  title.style.fontWeight = 'bold'
  title.style.color = '#ffffff'
  title.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)'
  title.style.textAlign = 'left'
  title.style.marginLeft = '36px'
  title.style.paddingTop = '7px'

  titleArea.appendChild(title)

  // 创建数据区域
  const dataArea = document.createElement('div')
  dataArea.style.display = 'flex'
  dataArea.style.flexDirection = 'column'
  dataArea.style.alignItems = 'flex-start'
  dataArea.style.gap = '8px'
  dataArea.style.marginBottom = '16px'

  const complaintsRow = document.createElement('div')
  complaintsRow.style.display = 'grid'
  complaintsRow.style.gridTemplateColumns = '74px auto 12px'
  complaintsRow.style.columnGap = '6px'
  complaintsRow.style.alignItems = 'baseline'

  const complaintsLabel = document.createElement('span')
  complaintsLabel.textContent = '客诉总量:'
  complaintsLabel.style.cssText = 'color: #93c5fd; font-size: 14px; font-weight: 500; text-align:right;'

  const complaintsValue = document.createElement('span')
  complaintsValue.textContent = formatNumber(regionData.complaints)
  complaintsValue.style.cssText = 'color: #ffffff; font-size: 20px; font-weight: bold; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);'

  const complaintsUnit = document.createElement('span')
  complaintsUnit.textContent = '个'
  complaintsUnit.style.cssText = 'color: #93c5fd; font-size: 12px;'

  complaintsRow.appendChild(complaintsLabel)
  complaintsRow.appendChild(complaintsValue)
  complaintsRow.appendChild(complaintsUnit)

  const percentageRow = document.createElement('div')
  percentageRow.style.display = 'grid'
  percentageRow.style.gridTemplateColumns = '74px auto 12px'
  percentageRow.style.columnGap = '6px'
  percentageRow.style.alignItems = 'baseline'

  const percentageLabel = document.createElement('span')
  percentageLabel.textContent = '占比:'
  percentageLabel.style.cssText = 'color: #93c5fd; font-size: 14px; font-weight: 500; text-align:right;'

  const percentageValue = document.createElement('span')
  percentageValue.textContent = regionData.percentage
  percentageValue.style.cssText = 'color: #ffffff; font-size: 20px; font-weight: bold; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);'

  const percentageUnit = document.createElement('span')
  percentageUnit.textContent = '%'
  percentageUnit.style.cssText = 'color: #93c5fd; font-size: 12px;'

  percentageRow.appendChild(percentageLabel)
  percentageRow.appendChild(percentageValue)
  percentageRow.appendChild(percentageUnit)

  // 保存可变元素，后续更新时直接修改 textContent 即可
  ;(popupContainer as any)._complaintsSpan = complaintsValue
  ;(popupContainer as any)._percentageSpan = percentageValue

  // 将数据行挂到 dataArea
  dataArea.appendChild(complaintsRow)
  dataArea.appendChild(percentageRow)

  // 创建底部按钮区域
  const bottomSection = document.createElement('div')
  bottomSection.style.display = 'flex'
  bottomSection.style.justifyContent = 'center'

  // 组装弹框
  popupContainer.appendChild(titleArea)
  popupContainer.appendChild(dataArea)
  popupContainer.appendChild(bottomSection)

  return popupContainer
}

// 初始化Three.js场景，启用轨道控制器、光照和CSS2D渲染
const { scene, camera } = useThree(containerRef, {
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

  // 首次拉取区域数据
  fetchRegionData()

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
    containerDiv.style.userSelect = 'none'

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

    // 创建弹窗并作为 containerDiv 的子元素
    const popupEl = createPopupElement(region.name)
    popupEl.style.display = 'none'
    popupEl.style.position = 'absolute'
    popupEl.style.left = '106px'
    popupEl.style.bottom = 'calc(100% - 5px)' // 位于锚点和标签之上
    popupEl.style.transform = 'translateX(-50%)'
    containerDiv.appendChild(popupEl)

    // 组装元素
    labelContainer.appendChild(labelText)
    containerDiv.appendChild(iconImg)
    containerDiv.appendChild(labelContainer)

    const label = new CSS2DObject(containerDiv)
    label.position.set(region.position[0], region.position[1], region.position[2])
    label.userData = {
      regionName: region.name,
      originalPosition: [...region.position],
      popupEl
    }
    scene.add(label)
    regionLabelObjects.push(label)
  })

  // 标签创建完毕后启动轮询
  startPopupRotation()
}

let rotationInterval: any = null

function startPopupRotation() {
  if (rotationInterval) clearInterval(rotationInterval)
  if (regionLabelObjects.length === 0) return

  const sorted = [...regionLabelObjects].sort((a, b) => {
    const dataA = getRegionData(a.userData.regionName)
    const dataB = getRegionData(b.userData.regionName)
    return parseInt(dataB.complaints) - parseInt(dataA.complaints)
  })

  let idx = 0

  const showPopup = (index: number) => {
    sorted.forEach(l => (l.userData.popupEl.style.display = 'none'))
    const current = sorted[index]
    if (current) current.userData.popupEl.style.display = 'block'
  }

  showPopup(idx)

  rotationInterval = setInterval(() => {
    idx = (idx + 1) % sorted.length
    showPopup(idx)
  }, 30000)
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

// 更新所有弹窗的实时数据
const refreshAllPopupContent = () => {
  regionLabelObjects.forEach(label => {
    const regionName: string = label.userData.regionName
    const data = getRegionData(regionName)
    const popup = label.userData.popupEl as HTMLDivElement
    if (!popup) return

    const complaintsSpan = (popup as any)._complaintsSpan as HTMLSpanElement | undefined
    const percentageSpan = (popup as any)._percentageSpan as HTMLSpanElement | undefined

    if (complaintsSpan) complaintsSpan.textContent = formatNumber(data.complaints)
    if (percentageSpan) percentageSpan.textContent = data.percentage
  })
}
</script>
