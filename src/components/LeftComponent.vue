<script setup>
import { ref,onMounted } from "vue";
// @ts-ignore
import CallTrafficModal from "./modal/CallTrafficModal.vue";
// @ts-ignore
import huangling from "../assets/黄陵.png";
// @ts-ignore
import title from "../assets/title.png";

import juxingkaobei from "../assets/矩形26拷贝.png";

import TodayCallTraffic from "./TodayCallTraffic.vue";

import WaterOutageNotice from "./WaterOutageNotice.vue";

import axios from '../utils/request';

const centerDialogVisible = ref(false);

onMounted(async () => {
  try {
    const response = await axios.get('/shenyang-report/screen/realtime-agent');
    const data = response.data;
    console.log(data,'data');
    cardData.value[0].titleNumber = data.callInCount;
    cardData.value[0].number = data.callInCountDayToDay;
    cardData.value[1].titleNumber = data.callInAnswerCount;
    cardData.value[1].number = data.callInAnswerRate;
    cardData.value[2].titleNumber = data.inqueueCount;
    cardData.value[2].number = data.giveUpRate;
    cardData.value[3].titleNumber = data.callOutCount;
    cardData.value[4].titleNumber = data.callInSatisfactionCount;
    cardData.value[4].number = data.callInSatisfactionRate;
    cardData.value[5].titleNumber = data.callInTalkdurationAvg;
  } catch (error) {
    console.error(error);
  }
});

// TODO 查看更多
const lookMore = () => {
  console.log("查看更多");
};
</script>

<template>
  <!-- 左侧信息区 -->
  <div class="flex flex-col w-[25vw] h-[90vh]">
    <div class="w-[25vw] h-[3.3vh] flex flex-row ml-[0.65vw]" :style="{
      backgroundImage: `url(${title})`,
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
    }">
      <div class="w-[3.5vw] h-[1.7vh] ml-[4vw] flex items-center justify-center mt-[0.5vh]">
        <p class="text-[1vw] leading-none max-w-full text-white whitespace-nowrap">
          话务服务
        </p>
      </div>
      <div class="flex-1 flex justify-end">
        <div class="w-[7.865vw] h-[4vh] mt-[-0.8vh]" :style="{
          backgroundImage: `url(${huangling})`,
          backgroundPosition: 'center center',
          backgroundSize: '100% 100%',
        }"></div>
      </div>
    </div>
    <!-- 实时坐席 -->
    <div class="flex flex-row ml-[1.67vh] mt-[1.5vh]">
      <img src="../assets/组3047.png" class="w-[1.04vw] h-[1.04vw]" />
      <div class="ml-[0.2vw]">
        <p class="text-white text-[0.8vw]">实时坐席</p>
      </div>
    </div>
    <!-- 分割线 -->
    <div class="w-[24vm] h-[1px] bg-[#5792FF] ml-[1.67vh] mt-[0.5vh]"></div>
    <!-- 背景图片1 -->
    <div class="flex flex-row ml-[1.67vh] w-[24vm] mt-[1.5vh] relative">
      <img src="../assets/bj(1).png" class="w-full h-[13.5vh]" />
      <img src="../assets/坐席.png" class="w-[2.5vw] h-[6.3vh] absolute top-[0.5vh] left-[1vw]" />
      <div class="absolute top-[1vh] left-[6vh] w-[4vw] flex flex-col justify-center items-center">
        <div class="flex flex-row">
          <p class="text-[#99DFFF] text-[1.2vw]">122</p>
          <div class="flex flex-col justify-end">
            <p class="text-[#549FF9] text-[0.3vw]">人</p>
          </div>
        </div>
        <p class="text-[#BFDCFF] text-[0.5vw]">通话坐席数</p>
      </div>
      <img src="../assets/示忙.png" class="w-[2.5vw] h-[6.3vh] absolute top-[7vh] left-[1vw]" />
      <div class="absolute top-[8vh] left-[6vh] w-[4vw] flex flex-col justify-center items-center">
        <div class="flex flex-row">
          <p class="text-[#99DFFF] text-[1.2vw]">122</p>
          <div class="flex flex-col justify-end">
            <p class="text-[#549FF9] text-[0.3vw]">人</p>
          </div>
        </div>
        <p class="text-[#BFDCFF] text-[0.5vw]">通话坐席数</p>
      </div>

      <img src="../assets/离线.png" class="w-[2.5vw] h-[6.3vh] absolute top-[7vh] left-[21vw]" />
      <div class="absolute top-[8vh] left-[17vw] w-[4vw] flex flex-col justify-center items-center">
        <div class="flex flex-row">
          <p class="text-[#99DFFF] text-[1.2vw]">122</p>
          <div class="flex flex-col justify-end">
            <p class="text-[#549FF9] text-[0.3vw]">人</p>
          </div>
        </div>
        <p class="text-[#BFDCFF] text-[0.5vw]">通话坐席数</p>
      </div>

      <img src="../assets/示闲.png" class="w-[2.5vw] h-[6.3vh] absolute top-[0.5vh] left-[21vw]" />
      <div class="absolute top-[1vh] left-[17vw] w-[4vw] flex flex-col justify-center items-center">
        <div class="flex flex-row">
          <p class="text-[#99DFFF] text-[1.2vw]">122</p>
          <div class="flex flex-col justify-end">
            <p class="text-[#549FF9] text-[0.3vw]">人</p>
          </div>
        </div>
        <p class="text-[#BFDCFF] text-[0.5vw]">通话坐席数</p>
      </div>

      <div class="absolute top-[2vh] left-[10vw] w-[4vw] flex flex-col justify-center items-center">
        <div class="flex flex-col">
          <p class="text-[#BFDCFF] text-[0.8vw]">坐席人数</p>
          <p class="text-[#9AD1EE] text-[2vw]">180</p>
        </div>
        <div class="w-[3.5vw] h-[2.2vh] text-white text-[0.5vw] hover:cursor-pointer" :style="{
          backgroundImage: `url(${juxingkaobei})`,
          backgroundPosition: 'center center',
          backgroundSize: '100% 100%',
        }" :click="lookMore">
          查看更多
        </div>
      </div>
    </div>
    <!-- 今日话务 -->
    <TodayCallTraffic @show-modal="centerDialogVisible = true" />
    <!-- 停水公告 -->
    <WaterOutageNotice />
  </div>
  <CallTrafficModal v-model="centerDialogVisible" />
</template>
