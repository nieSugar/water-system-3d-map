<template>
  <div ref="containerRef" class="rounded-lg shadow-lg" style="width: 100%;height: 100%;">

  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import { ref, type Ref, onMounted } from 'vue';
import { useThree, THREEMAP, EventCaster } from './util';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
// @ts-ignore
import sy from '../assets/sy.jpg'
import * as THREE from 'three'
// @ts-ignore
import maodian from '../assets/锚点 拷贝 15.png'

const containerRef = ref<HTMLDivElement>() as Ref<HTMLDivElement>
const { scene, renderer, camera } = useThree(containerRef, { controls: true, light: true,css2d:true })
// 100 400 350
camera.position.set(-100, 400, 350);
const eventCaster = new EventCaster(camera, renderer.domElement)
onMounted(() => {
  fetch('/shengyang.json')
    .then(res => res.json())
    .then(shenyang => {
      const map = new THREEMAP(shenyang,
        [{ 'name': '于洪区', 'color': 0x5dade2 },
          { 'name': '沈抚新城', 'color': 0x5dade2 },
          { 'name': '大东区', 'color': 0x5dade2 },
          { 'name': '和平区', 'color': 0x5dade2 },
          { 'name': '苏家屯区', 'color': 0x5dade2 },
          { 'name': '浑南区', 'color': 0x5dade2 },
          { 'name': '沈河', 'color': 0x5dade2 },
          { 'name': '康平县', 'color': 0xbd7463 },
          { 'name': '法库县', 'color': 0xbd7463 },
          { 'name': '新民市', 'color': 0x5dade2 },
          { 'name': '辽中区', 'color': 0x5dade2 },
          { 'name': '皇姑区', 'color': 0x5dade2 },
          { 'name': '铁西区', 'color': 0x5dade2 },
        ], {
        scale: 13000, center: [-123.406664, -41.788074], texture: {
          value: new THREE.TextureLoader().load(sy), max: [123.814145, 43.042711], min: [122.422105, 41.199854]
        }
      })
      
      const texture = new THREE.TextureLoader().load(maodian)
      const material = new THREE.SpriteMaterial({ map: texture, })
      const sprite = new THREE.Sprite(material)
      sprite.scale.set(10, 10, 10)
      const psp = sprite.clone()
      psp.position.set(-33,7,9)
      scene.add(psp)
      map.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          eventCaster.addListener(child, 'click', (result) => {
            console.log(result);
            sprite.position.copy(result.point)
            sprite.position.y += 10
            scene.add(sprite)
          })
        }
      })
      scene.add(map)
    })
    const div = document.createElement('div')
      div.innerText = '22222'
      div.style.backgroundImage = ''
      const panel = new CSS2DObject(div)
      panel.position.set(-33,20,9)
      scene.add(panel)
})
</script>

<!-- 更新颜色方案\nconst colorMap: Record<string, number> = {\n  '康平县': 0xff0000,\n  '法库县': 0xff0000,\n  '新民市': 0xf7d358,\n  '辽中区': 0xf7d358,\n  '于洪区': 0x5dade2,\n  '沈北新区': 0x5dade2,\n  '大东区': 0x5dade2,\n  '和平区': 0x5dade2,\n  '沈河区': 0x5dade2,\n  '皇姑区': 0x5dade2,\n  '铁西区': 0x5dade2,\n  '浑南区': 0x5dade2,\n  '苏家屯区': 0x5dade2\n};\n\n// 设置透明度\nlet opacity = 0.85;\nif (['康平县', '法库县'].includes(name)) {\n  opacity = 0.6; // 透明红色\n} else if (['新民市', '辽中区'].includes(name)) {\n  opacity = 0.8; // 渐变黄色\n}\n\nconst material = new THREE.MeshPhongMaterial({ \n  color: colorMap[name] || 0x1e90ff,\n  side: THREE.DoubleSide, \n  transparent: true, \n  opacity\n});\n\n// 为康平县和法库县之间添加白色分割虚线\nif (['康平县', '法库县'].includes(name)) {\n  const borderMaterial = new THREE.LineDashedMaterial({ \n    color: 0xffffff, \n    dashSize: 10, \n    gapSize: 6, \n    linewidth: 1\n  });\n  const borderLine = new THREE.Line(borderGeometry, borderMaterial);\n  borderLine.computeLineDistances();\n  group.add(borderLine);\n} -->
