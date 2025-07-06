<template>
    <div class="padding-bottom-xs">
      <div class="flex align-center space-between padding-bottom-xs">
        <div class="flex align-center">
          <img v-if="item.img" :src="item.img" alt="">
          <div v-else style="width: 20px; height: 24px;"></div>
          <div class="color-blue font-size-lg padding-left-sm">{{ item.name }}</div>
        </div>
        <div class="p-ro Roboto">{{ item.value }}%</div>
      </div>
      <div class="progress-container relative">
        <div class="progress-bg overflow-hidden">
          <div class="progress" :style="{ width: progressWidth }"></div>
        </div>
        <!-- 指示器使用绝对定位并提升层级 -->
        <div class="progress-indicator absolute" ></div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  
  export default {
      name: 'ScoreItem',
      props: {
          item: {
              type: Object,
              required: true
          }
      },
      setup(props) {
          const progressWidth = ref('0%');
          
          // 计算指示器位置
          const calcIndicatorPosition = () => {
              return `calc(-12px + (${100 - props.item.value}% * 0.18))`;
          };
          
          // 动画控制
          const animateProgress = () => {
              const duration = 1000; // 动画持续时间(毫秒)
              const start = 0;
              const end = props.item.value;
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
          watch(() => props.item.value, () => {
              animateProgress();
          });
          
          return {
              progressWidth,
              calcIndicatorPosition
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
    /* top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #A5E8FF;
    opacity: 0.2; */
    position: relative;
    z-index: 3; /* 确保指示器在最上层 */
  }
  
  /* .progress-indicator::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: #9DDDFE;
    border-radius: 50%;
  } */
  .progress-indicator::after,
.progress-indicator::before {
    z-index: 1;
    /* 确保显示在进度条上方 */
}

.progress-indicator::after {
    content: "";
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-65%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #A5E8FF;
    opacity: 0.2;
}

.progress-indicator::before {
    content: "";
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-79%);
    width: 8px;
    height: 8px;
    background: #9DDDFE;
    border-radius: 50%;
}
  </style>    