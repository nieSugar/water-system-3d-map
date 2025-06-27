<template>
  <div class="text-center px-[1.5vw] relative">
    <div class="w-[3.1vw] h-[5.8vh] relative flex justify-center items-center bg-no-repeat bg-center bg-cover pl-[1.5vw]"
      :style="{ backgroundImage: `url(${styleOne})` }">
      <div ref="squaresContainer" class="absolute w-[100%] h-full pointer-events-none"
        style="transform: rotateX(41deg) rotateY(180deg);"></div>
      <!-- <div class="absolute w-full top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span
          class="text-4xl text-white font-bold tracking-wider align-middle [text-shadow:0_0_12px_#00bfff,0_0_2px_#fff]">{{
            percent.toFixed(2) }}</span>
        <span
          class="text-lg text-[#00bfff] align-super ml-[1vm] font-bold relative [text-shadow:0_0_8px_#00bfff]">%</span>
      </div> -->
    </div>
    <!-- <img src="../assets/22.png" alt="" class="w-[3.1vm] h-[5.8vh] absolute top-[10px] left-[5px]" /> -->
    <div class="text-2xl text-white tracking-wider font-bold">办结率</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import styleOne from '../assets/样式一.png';

const percent = ref(84.58); // 这个是进度调的百分比
const totalSquares = 12 // 这个是梯形的数量
const radius = 30; // 这个是圆形的半径
const center = 80; // 这个是圆形的中心点
const squareWidth = 15; // 这个是梯形的宽度
const squareHeight = 10; // 这个是梯形的高度

const startColor = [0, 255, 255];
const endColor = [0, 191, 255];

const squaresContainer = ref(null);

function getGradientColor(start, end, p) {
  const r = Math.round(start[0] + (end[0] - start[0]) * p);
  const g = Math.round(start[1] + (end[1] - start[1]) * p);
  const b = Math.round(start[2] + (end[2] - start[2]) * p);
  return `rgb(${r},${g},${b})`;
}

onMounted(() => {
  if (!squaresContainer.value) return;
  squaresContainer.value.innerHTML = '';

  const showSquares = percent.value * totalSquares / 100;
  const fullSquares = Math.floor(showSquares);
  const partialPercent = showSquares - fullSquares;

  for (let i = 0; i < totalSquares; i++) {
    const square = document.createElement('div');
    square.className = 'absolute rounded-[2px] transition-opacity duration-300 ease-in-out';
    square.style.width = `${squareWidth}px`;
    square.style.height = `${squareHeight}px`;
    square.style.clipPath = 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)';

    const angle = (i / totalSquares) * 2 * Math.PI - Math.PI / 2;
    const x = center + radius * Math.cos(angle) - squareWidth / 2;
    const y = center + radius * Math.sin(angle) - squareHeight / 2;
    square.style.left = `${x}px`;
    square.style.top = `${y}px`;
    square.style.transform = `rotate(${(angle + Math.PI / 2) * 180 / Math.PI}deg)`;

    if (i < fullSquares) {
      const colorPercent = i / totalSquares;
      square.style.background = getGradientColor(startColor, endColor, colorPercent);
      square.style.opacity = '1';
      square.style.boxShadow = '0 0 8px #00bfff, 0 0 2px #fff';
    } else if (i === fullSquares && partialPercent > 0) {
      const colorPercent = i / totalSquares;
      square.style.background = `linear-gradient(to right, ${getGradientColor(startColor, endColor, colorPercent)} ${partialPercent * 100}%, rgba(10,58,90,0.18) ${partialPercent * 100}%)`;
      square.style.opacity = '1';
      square.style.boxShadow = '0 0 8px #00bfff, 0 0 2px #fff';
    } else {
      square.style.background = '#0a3a5a';
      square.style.opacity = '0.18';
      square.style.boxShadow = 'none';
    }
    squaresContainer.value.appendChild(square);
  }
});
</script>