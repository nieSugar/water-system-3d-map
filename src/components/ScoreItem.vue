<template>
    <div class="padding-bottom-xs">
      <div class="flex align-center space-between ">
        <div class="flex align-center">
          <img v-if="index == 0" src="../../src/assets/img/1.png" alt="项目图标">
          <img v-if="index == 1" src="../../src/assets/img/2.png" alt="项目图标">
          <img v-if="index == 2" src="../../src/assets/img/3.png" alt="项目图标">
          <div v-else class="w-[20px] h-[24px]"></div>
          <div class="color-blue font-size-lg padding-left-sm">{{ item.name }}</div>
        </div>
        <div class="p-ro Roboto">{{ item.score }}%</div>
      </div>
      <div class="progress-container relative">
        <div class="progress-bg overflow-hidden">
          <div class="progress" :style="{ width: progressWidth }"></div>
        </div>
        <!-- 指示器使用绝对定位并绑定right值 -->
        <div class="progress-indicator absolute top-1/2 -translate-y-1/2" 
             :style="{ right: indicatorPosition }"></div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
import { get, post } from '../utils/request'; // 假设这是您的HTTP请求工具
  
  export default {
      name: 'ScoreItem',
      props: {
          item: {
              type: Object,
              required: true
          },
          index: {
              type: Number,
              required: true
          }
      },
      setup(props) {
          const progressWidth = ref('0%');
          
          // 计算指示器位置 - 与进度条右边缘对齐
          const indicatorPosition = computed(() => {
              // 将进度百分比转换为数值计算
              const progressValue = parseFloat(progressWidth.value);
              // 计算指示器位置 (容器宽度100% - 进度宽度 - 指示器半径8px)
              return `calc(100% - ${progressValue}% - 8px)`;
          });
          
          // 动画控制
          const animateProgress = () => {
              const duration = 1000; // 动画持续时间(毫秒)
              const start = 0;
              const end = props.item.score;
              const startTime = performance.now();
              
              const animate = (timestamp) => {
                  const elapsed = timestamp - startTime;
                  if (elapsed < duration) {
                      const progressRatio = elapsed / duration;
                      progressWidth.value = `${start + (end - start) * progressRatio}%`;
                      requestAnimationFrame(animate);
                  } else {
                      progressWidth.value = `${end}%`;
                  }
              };
              
              requestAnimationFrame(animate);
          };
          
          // 组件挂载时触发动画
          onMounted(() => {
              animateProgress();
          });
          
          // 监听props变化，更新进度
          watch(() => props.item.score, () => {
              animateProgress();
          });
          
          return {
              progressWidth,
              indicatorPosition
          };
      }
  }
  </script>
  
  <style scoped>
  .progress-container {
    position: relative;
    height: 6px;
    margin-right: 12px;
  }
  
  .progress-bg {
    height: 100%;
    background: linear-gradient(to right, #0B244E, #0B244E);
    -webkit-clip-path: polygon(0 82%, 100% 0, 100% 100%, 0% 100%);
    clip-path: polygon(0 82%, 100% 0, 100% 100%, 0% 100%);
    position: relative;
    overflow: hidden;
  }
  
  .progress {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(to right, #0B244E, #0084FF);
    -webkit-clip-path: polygon(0 82%, 100% 0, 100% 100%, 0% 100%);
    clip-path: polygon(0 82%, 100% 0, 100% 100%, 0% 100%);
    transition: width 0.3s ease;
    z-index: 1;
  }
  
  .progress-indicator {
    position: relative;
    z-index: 3; /* 确保指示器在最上层 */
  }
  
  
  .progress-indicator::after,
.progress-indicator::before {
    z-index: 1;
    /* 确保显示在进度条上方 */
}

.progress-indicator::after {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-68%);
    width: 16px;
    /* 对应图中 16px 尺寸 */
    height: 16px;
    border-radius: 50%;
    background: #A5E8FF;
    opacity: 0.2;
}
.progress-indicator[data-v-3e9e2b5c]::before {
    content: "";
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-83%);
    width: 8px;
    height: 8px;
    background: #9DDDFE;
    border-radius: 50%;
}
  </style>    