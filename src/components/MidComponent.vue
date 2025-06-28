<!--
  3D地图组件 - 沈阳市水务系统可视化
  功能：展示沈阳市各区县的3D地图，支持点击交互和标记点显示
  技术栈：Three.js + D3.js + Vue3
-->
<template>
  <!-- 3D地图容器，作为Three.js渲染的挂载点 -->
  <div ref="containerRef" class="rounded-lg shadow-lg" style="width: 100%;height: 100%;">

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

// 创建DOM容器引用，用于挂载Three.js渲染器
const containerRef = ref<HTMLDivElement>() as Ref<HTMLDivElement>

// 初始化Three.js场景，启用轨道控制器、光照和CSS2D渲染
const { scene, renderer, camera } = useThree(containerRef, {
  controls: true,  // 启用鼠标控制（缩放、旋转、平移）
  light: true,     // 启用环境光照
  css2d: true      // 启用CSS2D渲染器，支持HTML标签叠加
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

// 设置场景背景色，类似图片中的深蓝色背景
scene.background = new THREE.Color(0x0a1a2e);

// 创建事件投射器，用于处理3D对象的鼠标交互
const eventCaster = new EventCaster(camera, renderer.domElement)
// 组件挂载后初始化3D地图
onMounted(() => {
  // 异步加载沈阳市GeoJSON地理数据
  fetch('/shengyang.json')
    .then(res => res.json())
    .then(shenyang => {
      // 创建3D地图对象，传入地理数据和区域配色方案
      // 使用更鲜艳的颜色和渐变效果
      const map = new THREEMAP(shenyang,
        [
          // 主城区 - 使用蓝色系 (0x5dade2)
          { 'name': '于洪区', 'color': 0x5dade2 },
          { 'name': '沈抚新城', 'color': 0x5dade2 },
          { 'name': '大东区', 'color': 0x5dade2 },
          { 'name': '和平区', 'color': 0x5dade2 },
          { 'name': '苏家屯区', 'color': 0x5dade2 },
          { 'name': '浑南区', 'color': 0x5dade2 },
          { 'name': '沈河', 'color': 0x5dade2 },
          { 'name': '新民市', 'color': 0x5dade2 },
          { 'name': '辽中区', 'color': 0x5dade2 },
          { 'name': '皇姑区', 'color': 0x5dade2 },
          { 'name': '铁西区', 'color': 0x5dade2 },
          // 远郊县区 - 使用棕色系 (0xbd7463)
          { 'name': '康平县', 'color': 0xbd7463 },
          { 'name': '法库县', 'color': 0xbd7463 },
        ], {
        // 地图配置参数
        scale: 13000,                           // 地图缩放比例
        center: [-123.406664, -41.788074],      // 地图中心点坐标（沈阳市中心）
        texture: {
          value: new THREE.TextureLoader().load(sy),  // 加载地图纹理贴图
          max: [123.814145, 43.042711],               // 纹理映射最大坐标
          min: [122.422105, 41.199854]                // 纹理映射最小坐标
        }
      })

      // 创建标记点精灵材质和对象
      const texture = new THREE.TextureLoader().load(maodian)
      const material = new THREE.SpriteMaterial({ map: texture, })
      const sprite = new THREE.Sprite(material)
      sprite.scale.set(10, 10, 10)  // 设置标记点大小

      // 创建预设标记点并添加到场景
      const psp = sprite.clone()
      psp.position.set(-33, 7, 9)  // 设置预设标记点位置
      scene.add(psp)

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

      // 初始化GUI调试面板
      map.initGUI()

      // 添加区域标签，类似图片中的效果
      // addRegionLabels(scene)
    })
})

// 添加区域标签函数
function addRegionLabels(scene: any) {
  // 定义需要显示标签的区域及其大致位置
  const regionLabels = [
    { name: '康平县', position: [-50, 35, 50], color: '#ffffff' },
    { name: '法库县', position: [20, 35, 30], color: '#ffffff' },
    { name: '新民市', position: [-80, 35, -20], color: '#ffffff' },
    { name: '辽中区', position: [-30, 35, -40], color: '#ffffff' },
    { name: '沈阳市区', position: [0, 35, 0], color: '#ffffff' }
  ]

  regionLabels.forEach(region => {
    const labelDiv = document.createElement('div')
    labelDiv.innerText = region.name
    labelDiv.style.color = region.color
    labelDiv.style.fontSize = '14px'
    labelDiv.style.fontWeight = 'bold'
    labelDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)'
    labelDiv.style.pointerEvents = 'none'
    labelDiv.style.userSelect = 'none'
    labelDiv.style.fontFamily = 'Arial, sans-serif'

    const label = new CSS2DObject(labelDiv)
    label.position.set(region.position[0], region.position[1], region.position[2])
    scene.add(label)
  })
}
</script>

<!-- 更新颜色方案\nconst colorMap: Record<string, number> = {\n  '康平县': 0xff0000,\n  '法库县': 0xff0000,\n  '新民市': 0xf7d358,\n  '辽中区': 0xf7d358,\n  '于洪区': 0x5dade2,\n  '沈北新区': 0x5dade2,\n  '大东区': 0x5dade2,\n  '和平区': 0x5dade2,\n  '沈河区': 0x5dade2,\n  '皇姑区': 0x5dade2,\n  '铁西区': 0x5dade2,\n  '浑南区': 0x5dade2,\n  '苏家屯区': 0x5dade2\n};\n\n// 设置透明度\nlet opacity = 0.85;\nif (['康平县', '法库县'].includes(name)) {\n  opacity = 0.6; // 透明红色\n} else if (['新民市', '辽中区'].includes(name)) {\n  opacity = 0.8; // 渐变黄色\n}\n\nconst material = new THREE.MeshPhongMaterial({ \n  color: colorMap[name] || 0x1e90ff,\n  side: THREE.DoubleSide, \n  transparent: true, \n  opacity\n});\n\n// 为康平县和法库县之间添加白色分割虚线\nif (['康平县', '法库县'].includes(name)) {\n  const borderMaterial = new THREE.LineDashedMaterial({ \n    color: 0xffffff, \n    dashSize: 10, \n    gapSize: 6, \n    linewidth: 1\n  });\n  const borderLine = new THREE.Line(borderGeometry, borderMaterial);\n  borderLine.computeLineDistances();\n  group.add(borderLine);\n} -->
