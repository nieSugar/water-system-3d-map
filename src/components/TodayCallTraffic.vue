<!-- 今日话务组件 -->

<template>
  <div class="caret-transparent">
    <div class="flex flex-row items-center ml-[1.67vh] mt-[1.5vh]">
      <img :src="getImageUrl('组3047')" class="w-[1.04vw] h-[1.04vw]" />
      <div class="ml-[0.2vw]">
        <p class="text-white text-[0.8vw]">今日话务</p>
      </div>
    </div>
    <!-- 分割线 -->
    <div class="w-[24vm] h-[1px] bg-[#5792FF] ml-[1.67vh] mt-[0.5vh]"></div>
    <!-- 业务数据卡片区 -->
    <div class="ml-[0.83vh] mt-[1.5vh]">
      <div v-for="(card, index) in cardData" :key="index"
        :class="['relative cursor-pointer', { 'mt-[1vh]': index > 0 }]" @click="handleCardClick(index)">
        <img :src="getImageUrl(selectedIndex === index ? '选中背景' : '组3040')" class="w-[24.792vw] h-[4.1vh]" />
        <img :src="getImageUrl(card.icon)" class="absolute top-0 w-[2.7vw] h-[4.1vh]" />
        <p :class="[
          'text-[0.7vw] absolute top-[0.9vh] left-[3vw]',
          selectedIndex === index ? 'text-[#E3AE3B]' : 'text-[#BFDCFF]'
        ]">{{ card.title }}</p>
        <p class="text-[#89DAFF] text-[1.2vw] absolute top-[0.2vh] left-[10vw]" @click="handleNumberClick(index)">{{
          card.titleNumber }}</p>
        <p :class="[
          'text-[0.8vw] absolute top-[0.6vh] left-[14vw]',
          selectedIndex === index ? 'text-[#E3AE3B]' : 'text-[#BFDCFF]'
        ]">{{ card.numberName }}</p>
        <p :class="[
          'text-[0.8vw] absolute top-[0.6vh] left-[17vw]',
        ]">{{ card.number }}</p>
      </div>
    </div>
    <CallVolumeModal v-model="showCallVolumeModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from '../utils/request';
import CallVolumeModal from "./modal/CallVolumeModal.vue";
const emit = defineEmits(['show-modal']);

const selectedIndex = ref(0);
const showCallVolumeModal = ref(false);

const cardData = ref([
  { icon: '来电数', title: '来点数/话务量', numberName: `环  比：`, titleNumber: '0', number: '0' },
  { icon: '接听量', title: '接听量', numberName: '接通率：', titleNumber: '0', number: '0' },
  { icon: '队列中', title: '队列中', numberName: '放弃率：', titleNumber: '0', number: '0' },
  { icon: '维护量', title: '外呼量', titleNumber: '0' },
  { icon: '话务满意量', title: '话务满意量', numberName: '满意度：', titleNumber: '0', number: '0' },
  { icon: '平均通话', title: '平均通话时长', titleNumber: '0' },
]);

onMounted(async () => {
  try {
    const response = await axios.get('/shenyang-report/screen/today-call');
    const data = response.data;
    console.log(data, 'data');
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

const getImageUrl = (name) => {
  return new URL(`../assets/${name}.png`, import.meta.url).href;
};

const handleCardClick = (index) => {
  selectedIndex.value = index;
}

const handleNumberClick = (index) => {
  selectedIndex.value = index;
  if (index === 0) {
    showCallVolumeModal.value = true;
  }
  if (index === 4) {
    emit('show-modal');
  }
};
</script>