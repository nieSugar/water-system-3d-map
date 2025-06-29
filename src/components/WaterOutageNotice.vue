<!-- 停水公告组件 -->
<script setup>
import { ref } from "vue";
// @ts-ignore
import title from "../assets/title.png";
// @ts-ignore
import zhongjie from "../assets/中街.png";

const selectedIndex = ref(0);

const notices = [
    {
        id: 1,
        text: "停水公告1",
        reason: "管网维修",
        address: "沈阳市和平区南京街道",
        time: "2024-03-20 08:00 至 2024-03-21 18:00",
    },
    {
        id: 2,
        text: "停水公告2",
        reason: "设备检修",
        address: "沈阳市和平区中街道",
        time: "2024-03-22 09:00 至 2024-03-22 17:00",
    },
    {
        id: 3,
        text: "停水公告3",
        reason: "管道爆裂紧急维修",
        address: "沈阳市和平区太原街道",
        time: "2024-03-23 10:00 至 2024-03-24 12:00",
    },
];

const getImageUrl = (path) => {
    return new URL(path, import.meta.url).href;
};

const handleCardClick = (index) => {
    selectedIndex.value = index;
};
</script>

<template>
    <div class="w-[24.8vw] h-[3.3vh] flex flex-row ml-[0.65vw] mt-[1.5vh]" :style="{
        backgroundImage: `url(${title})`,
        backgroundPosition: 'center center',
        backgroundSize: '100% 100%',
    }">
        <p class="text-white text-[1vw] ml-[4vw]">停水公告</p>
        <div class="flex-1 flex justify-end">
            <div class="w-[7.865vw] h-[4vh] mt-[-0.8vh]" :style="{
                backgroundImage: `url(${zhongjie})`,
                backgroundPosition: 'center center',
                backgroundSize: '100% 100%',
            }"></div>
        </div>
    </div>
    <!-- 卡片列表 -->
    <div v-for="(notice, index) in notices" :key="notice.id" class="flex flex-row ml-[0.83vh] mt-[1.5vh] cursor-pointer"
        @click="handleCardClick(index)">
        <div class="relative">
            <img :src="getImageUrl(
                selectedIndex === index
                    ? '../assets/选中bj.png'
                    : '../assets/常规.png'
            )
                " class="w-[24.792vw] h-[6.5vh]" />
            <div class="absolute top-0 left-[3.5vw] w-full h-full flex flex-row items-center justify-between">
                <div class="flex flex-col text-left">
                    <p :class="[
                        selectedIndex === index ? 'text-[#E3AE3B]' : 'text-[#6C9CE3]',
                        'text-[0.8vw] truncate max-w-[10vw]'
                    ]">{{ notice.reason }}</p>
                    <p class="text-[#6C9CE3] truncate max-w-[10vw] text-[0.5vw]">{{ notice.address }}</p>
                    <p class="text-[#6C9CE3] truncate max-w-[18vw] text-[0.5vw]">{{ notice.time }}</p>
                </div>
            </div>
            <div class="absolute top-[2.5vh] right-[3vw] text-[#6C9CE3] text-[0.5vw]">查看详情</div>
        </div>
    </div>
</template>
