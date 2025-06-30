<!-- 紧急停水弹窗 -->
<template>
    <CustomModal @close="$emit('close')" v-model="showModal" :background-image="bghw">
        <div class="flex flex-col h-full">
            <div class="h-[6vh] flex justify-center items-center relative">
                <img :src="zhongjie" alt="教堂"
                    class="absolute left-[-1vw] top-0 w-[8vw] h-[2.5vw] ml-[1vw] mt-[1vh] z-10" />
                <div class="text-center text-[1vw] text-white">紧急停水通知</div>
            </div>
            <div class="flex flex-col justify-between px-[2vw] py-[1vh] text-[#6C9CE] text-[0.9vw] w-full">
                <div class="flex flex-row justify-between mt-[5vh] w-full">
                    <div class="flex flex-col gap-[2vh] w-1/2">
                        <div class="text-[#8ABEFF]">● 停水类型：<span class="text-white">紧急停水</span></div>
                        <div class="text-[#8ABEFF]">● 停水地址：<span class="text-white">金川</span></div>
                        <div class="text-[#8ABEFF]">● 停水开始时间：<span class="text-white">2025-06-06 08:00:00</span></div>
                        <div class="text-[#8ABEFF]">● 停水范围：<span class="text-white">供电局维修变压器停电</span></div>
                        <div class="text-[#8ABEFF]">● 原　　因：<span class="text-white">供电局维修变压器停电</span></div>
                    </div>
                    <div class="flex flex-col gap-[2vh] w-1/2">
                        <div class="text-[#8ABEFF]">● 发布单位：<span class="text-white">营商办客服中心</span></div>
                        <div class="text-[#8ABEFF]">● 阀门信息：<span class="text-white">-</span></div>
                        <div class="text-[#8ABEFF]">● 停水结束时间：<span class="text-white">2025-06-06 18:00:00</span></div>
                    </div>
                </div>
            </div>
        </div>
    </CustomModal>
</template>

<script setup>
import CustomModal from './CustomModal.vue'
import { computed } from 'vue'
import bghw from "../../assets/hwbj.png";
import zhongjie from '../../assets/中街.png';

const props = defineProps({
    modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'close'])

const showModal = computed({
    get: () => props.modelValue,
    set: (val) => {
        emit('update:modelValue', val)
        console.log('showModal', val)
    }
})
</script>
