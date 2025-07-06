<template>
  <div ref="containerRef" style="width: 100%;height: 100%; background: transparent;"></div>
</template>
<style scoped></style>
<script setup lang="ts">
import { ref, type Ref, onMounted, reactive, watch } from 'vue';
import { get } from '../utils/request';
import { useThree, THREEMAP } from './three-utils';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import sy from '../assets/img/sy.jpg'
import * as THREE from 'three'
import maodian from '../assets/img/threeAnchor.png'
import bj from '../assets/img/threeTitleBg.png'
import modalBg from '../assets/img/threeDialog.png'
const containerRef = ref<HTMLDivElement>() as Ref<HTMLDivElement>

let modalImageSize = { width: 320, height: 180 }


const emits = defineEmits(['regionClick'])

interface RegionData {
  name: string
  complaints: string
  percentage: string
}

const props = defineProps<{
  regionData?: Record<string, RegionData>
}>()

const regionDataMap = reactive<Record<string, RegionData>>({
  ...(props.regionData)
})

watch(() => props.regionData, (newData) => {
  if (newData) {
    Object.keys(regionDataMap).forEach(key => {
      delete regionDataMap[key]
    })
    Object.assign(regionDataMap, newData)
    refreshAllPopupContent()
  }
}, { deep: true })

const getRegionData = (regionName: string): RegionData => {
  return regionDataMap[regionName] || { name: regionName, complaints: '0', percentage: '0' }
}
const updatePopupPosition = () => { }
const createPopupElement = (regionName: string): HTMLDivElement => {
  const regionData = getRegionData(regionName)
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
  popupContainer.addEventListener('click', (e) => {
    e.stopPropagation()
    emits('regionClick', regionName)
  })
  const titleArea = document.createElement('div')
  const title = document.createElement('div')
  title.textContent = regionData.name
  title.style.fontSize = '26px'
  title.style.fontWeight = 'bold'
  title.style.color = '#ffffff'
  title.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)'
  title.style.textAlign = 'left'
  title.style.marginLeft = '50px'
  title.style.paddingTop = '10px'
  title.style.transform = 'skewX(-10deg)'
  titleArea.appendChild(title)
  const dataArea = document.createElement('div')
  dataArea.style.display = 'flex'
  dataArea.style.flexDirection = 'column'
  dataArea.style.alignItems = 'flex-start'
  dataArea.style.gap = '15px'
  dataArea.style.margin = '20px'
  const complaintsRow = document.createElement('div')
  complaintsRow.style.display = 'grid'
  complaintsRow.style.gridTemplateColumns = '84px auto 16px'
  complaintsRow.style.columnGap = '6px'
  complaintsRow.style.alignItems = 'baseline'
  const complaintsLabel = document.createElement('span')
  complaintsLabel.textContent = '客诉总量 :'
  complaintsLabel.style.cssText = 'color: #93c5fd; font-size: 17px; font-weight: 500; text-align:right;'
  const complaintsValue = document.createElement('span')
  complaintsValue.textContent = regionData.complaints
  complaintsValue.style.cssText = 'color: rgb(232 255 255); font-size: 24px; font-weight: bold; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);'
  const complaintsUnit = document.createElement('span')
  complaintsUnit.textContent = '个'
  complaintsUnit.style.cssText = 'color: #93c5fd; font-size: 17px;'
  complaintsRow.appendChild(complaintsLabel)
  complaintsRow.appendChild(complaintsValue)
  complaintsRow.appendChild(complaintsUnit)
  const percentageRow = document.createElement('div')
  percentageRow.style.display = 'grid'
  percentageRow.style.gridTemplateColumns = '84px auto 16px'
  percentageRow.style.columnGap = '6px'
  percentageRow.style.alignItems = 'baseline'
  const percentageLabel = document.createElement('span')
  percentageLabel.textContent = '占比 :'
  percentageLabel.style.cssText = 'color: #93c5fd; font-size: 17px; font-weight: 500; text-align:right;'
  const percentageValue = document.createElement('span')
  percentageValue.textContent = regionData.percentage
  percentageValue.style.cssText = 'color: rgb(232 255 255); font-size: 24px; font-weight: bold; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);'
  const percentageUnit = document.createElement('span')
  percentageUnit.textContent = '%'
  percentageUnit.style.cssText = 'color: #93c5fd; font-size: 17px;'
  percentageRow.appendChild(percentageLabel)
  percentageRow.appendChild(percentageValue)
  percentageRow.appendChild(percentageUnit)
    ; (popupContainer as any)._complaintsSpan = complaintsValue
    ; (popupContainer as any)._percentageSpan = percentageValue
  dataArea.appendChild(complaintsRow)
  dataArea.appendChild(percentageRow)
  const bottomSection = document.createElement('div')
  bottomSection.style.display = 'flex'
  bottomSection.style.justifyContent = 'center'
  popupContainer.appendChild(titleArea)
  popupContainer.appendChild(dataArea)
  popupContainer.appendChild(bottomSection)
  return popupContainer
}
const { scene, camera } = useThree(containerRef, {
  controls: true,
  light: true,
  css2d: true,
  bloom: false
})
camera.position.set(-100, 400, 350);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 200, 100);
directionalLight.castShadow = true;
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);
scene.background = null;
let map: any
const loadModalImageSize = (scene: THREE.Scene) => {
  const img = new Image()
  img.onload = () => {
    modalImageSize = {
      width: img.naturalWidth,
      height: img.naturalHeight
    }
    addRegionLabels(scene)
  }
  img.src = modalBg
}
onMounted(async () => {
  fetch('/shengyang.json')
    .then(res => res.json())
    .then(shenyang => {
      map = new THREEMAP(shenyang, {
        scale: 13000,
        center: [-123.406664, -41.788074],
        texture: {
          value: new THREE.TextureLoader().load(sy),
          max: [123.814145, 43.042711],
          min: [122.422105, 41.199854]
        }
      })
      scene.add(map)
      addClusterOutline(shenyang, ['康平县', '法库县'])
      addClusterOutline(shenyang, ['新民市', '辽中区'])
      loadModalImageSize(scene)
      map.initGUI(regionLabelObjects)
      map.setPopupPositionUpdateCallback(updatePopupPosition)
    })
})
let regionLabelObjects: CSS2DObject[] = []
function addRegionLabels(scene: THREE.Scene) {
  const color = '#efffff'
  const regionLabels = [
    { name: '康平县', position: [55, 35, -195], color },
    { name: '法库县', position: [32, 35, -110], color },
    { name: '新民市', position: [-50, 35, -10], color },
    { name: '辽中区', position: [-80, 35, 90], color },
    { name: '于洪区', position: [50, 35, 15], color },
    { name: '沈北新区', position: [100, 35, -20], color },
    { name: '大东区', position: [109, 35, 25], color },
    { name: '和平区', position: [72, 35, 62], color },
    { name: '苏家屯区', position: [65, 35, 90], color },
    { name: '浑南区', position: [130, 35, 60], color },
    { name: '沈河区', position: [98, 35, 52], color },
    { name: '皇姑区', position: [88, 35, 32], color },
    { name: '铁西区', position: [20, 35, 70], color }
  ]
  regionLabels.forEach(region => {
    const containerDiv = document.createElement('div')
    containerDiv.style.position = 'relative'
    containerDiv.style.display = 'flex'
    containerDiv.style.flexDirection = 'column'
    containerDiv.style.alignItems = 'center'
    containerDiv.style.userSelect = 'none'
    const iconImg = document.createElement('img')
    iconImg.src = maodian
    iconImg.style.width = '20px'
    iconImg.style.height = '20px'
    iconImg.style.marginBottom = '2px'
    iconImg.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
    iconImg.style.display = 'block'
    iconImg.style.margin = '0 auto 2px auto'
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
    const labelText = document.createElement('div')
    labelText.innerText = region.name
    labelText.style.color = region.color
    labelText.style.fontSize = '12px'
    labelText.style.fontWeight = '350'
    labelText.style.fontFamily = 'Arial, sans-serif'
    labelText.style.whiteSpace = 'nowrap'
    labelText.style.padding = '0 8px'
    labelText.style.marginBottom = '4px'
    const popupEl = createPopupElement(region.name)
    popupEl.style.display = 'none'
    popupEl.style.position = 'absolute'
    popupEl.style.left = '120px'
    popupEl.style.bottom = 'calc(100% - 5px)'
    popupEl.style.transform = 'translateX(-50%)'
    containerDiv.appendChild(popupEl)
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
function addClusterOutline(shenyangData: any, names: string[]) {
  const projection = (map as any).projection as (lnglat: [number, number]) => [number, number]
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, depthTest: false })
  const clusterGroup = new THREE.Group()
  clusterGroup.name = names.join('-') + '-solid-outline'
  const TOP_HEIGHT = 30.5
  const edgeCount: Map<string, { p1: [number, number], p2: [number, number], count: number }> = new Map()
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
const refreshAllPopupContent = () => {
  regionLabelObjects.forEach(label => {
    const regionName: string = label.userData.regionName
    const data = getRegionData(regionName)
    const popup = label.userData.popupEl as HTMLDivElement
    if (!popup) return
    const complaintsSpan = (popup as any)._complaintsSpan as HTMLSpanElement | undefined
    const percentageSpan = (popup as any)._percentageSpan as HTMLSpanElement | undefined
    if (complaintsSpan) complaintsSpan.textContent = data.complaints
    if (percentageSpan) percentageSpan.textContent = data.percentage
  })
}
</script>
