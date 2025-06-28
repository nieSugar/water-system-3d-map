<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
// @ts-ignore
import LeftComponent from "./components/LeftComponent.vue";
// @ts-ignore
import RightComponent from "./components/RightComponent.vue";
// @ts-ignore
import textureImg from "./assets/纹理.png";
// @ts-ignore
import MidComponent from "./components/MidComponent.vue";



// 当前年月日
const currentDate = ref("");
// 当前时分
const currentTime = ref("");
// 当前星期
const currentWeekday = ref("");

let timer: number | null = null;

// 获取星期的中文表示
const getWeekdayText = (day: number): string => {
  const weekdays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return weekdays[day];
};

// 更新时间的函数
const updateDateTime = () => {
  const now = new Date();
  // 格式化年月日
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  currentDate.value = `${year}-${month}-${date}`;
  // 格式化时分
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  currentTime.value = `${hours}:${minutes}`;
  // 获取星期
  currentWeekday.value = getWeekdayText(now.getDay());
};

// 组件挂载时启动定时器
onMounted(() => {
  updateDateTime(); // 立即更新一次
  timer = setInterval(updateDateTime, 1000); // 每秒更新一次
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const format = (percentage: number) =>
  percentage === 100 ? "Full" : `${percentage}%`;
</script>

<template>
  <!-- 整体背景容器 -->
  <div
    class="w-[100vw] h-[100vh]"
    :style="{
      backgroundImage: `url(${textureImg})`,
      position: 'relative',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      backgroundSize: '100% 100%',
    }"
  >
    <!-- 主体区域 -->
    <div class="flex flex-row justify-between items-center">
      <!-- <LeftComponent/> -->
      <div class="w-[100vw] h-[100vh]">
        <MidComponent />
      </div>
       <!-- <RightComponent/> -->
    </div>
  </div>
</template>

<style scoped>
.demo-progress .el-progress--line {
  margin-bottom: 15px;
  height: 0.34vh;
  max-width: 600px;
}
</style>
