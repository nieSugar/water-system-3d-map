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
    <!-- 头部区域 -->
    <div class="w-[100vw] h-[10vh]">
      <!-- 左上角时间、日期、星期 -->
      <div
        class="flex flex-row justify-center items-center absolute top-[0.1vh] left-[1.67vw]"
      >
        <div class="text-left flex flex-row">
          <p
            class="font-[YouSheBiaoTiHei] font-normal text-[2vw] text-white leading-normal"
          >
            {{ currentTime }}
          </p>
          <div class="flex justify-center items-center">
            <div class="w-[1px] h-[2vh] bg-[#0DBCFC] mx-[0.4vw]"></div>
          </div>
          <div class="flex flex-col mt-[1vh]">
            <p
              class="font-[YouSheBiaoTiHei] font-normal text-[0.8vw] text-white leading-normal"
            >
              {{ currentWeekday }}
            </p>
            <p
              class="font-[YouSheBiaoTiHei] font-normal text-[0.8vw] text-white leading-normal"
            >
              {{ currentDate }}
            </p>
          </div>
        </div>
      </div>
      <!-- 标题 -->
      <div
        class="flex flex-row justify-center items-center absolute left-[50%] translate-x-[-50%]"
      >
        <p
          class="w-[30vw] text-center font-[YouSheBiaoTiHei] font-normal text-[3.5vh] text-white leading-normal"
        >
          沈阳水务集团客服中心数字大屏
        </p>
      </div>
      <!-- 右上角全屏按钮 -->
      <div
        class="flex flex-row justify-center items-center absolute top-[2vh] right-[1.5vw] hover:cursor-pointer"
      >
        <img src="./assets/全屏.png" alt="" class="w-[1.354vw] h-[1.354vw]" />
        <p
          class="ml-[0.3vw] text-center font-[YouSheBiaoTiHei] font-normal text-[0.8vw] text-white leading-normal"
        >
          全屏
        </p>
      </div>
    </div>
    <!-- 主体区域 -->
    <div class="flex flex-row justify-between items-center">
      <LeftComponent/>
      <div class="w-[45vw] h-[90vh]">
        <MidComponent />
      </div>
       <RightComponent/>
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
