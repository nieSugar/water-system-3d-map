<template>
    <!-- 问题板块 -->
    <div class="question common">
        <!-- 背景与标题区域 -->
        <div class="question-bg common-bg text-left">
            <div class="question-title common-title padding-left-xll">问题板块</div>
            <img src="../../src/assets/img/question.png" alt="问题板块图标">
        </div>

        <!-- 问题板块区域 -->
        <div class="common-subtitle question-subtitle">
            <!-- 问题板块数据内容 -->
            <div class="seats-bg margin-tb-xs padding-bottom">
                <el-row class="row-bg" justify="space-between">
                    <el-col :span="8" @click="showModal" v-for="item in seatData" :key="item.type"
                        class="flex space-between align-center padding-top-xs"
                        :class="item.type === 'busy' ? 'padding-top-xs' : ''">
                        <div class="flex align-center ">

                            <img :src="item.icon" :alt="item.alt">
                            <div class="text-left margin-left-xs">
                                <div class="Roboto seats-title">{{ item.count }}<span
                                        class="font-size-sm color-54 ren margin-left-xs">件</span></div>
                                <div class="color-blue font-size-df">{{ item.title }}</div>
                            </div>

                        </div>
                    </el-col>

                </el-row>

            </div>
        </div>
        <!-- 弹窗 -->
        <div v-if="isModal" class="dialog">
            <div class="dialog-bg">
                <div class="d-t  flex space-between align-center">

                    <img class="d-t-b" src="../assets/img/dialog-q.png" alt="">
                    <div class="dialog-title common-title">本年-问题板块营业</div>
                    <div class="d-t-c pointer" @click="closeD" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
                        @mousedown="handleMouseDown" @mouseup="handleMouseUp">
                        <img :src="currentImage" class="w-full h-full object-contain">
                        <!-- 预加载所有状态图片 -->
                        <img v-if="false" :src="normalImage" alt="预加载">
                        <img v-if="false" :src="hoverImage" alt="预加载">
                        <img v-if="false" :src="clickImage" alt="预加载">
                    </div>
                </div>
                <!-- 内容 -->
                <div class="dialog-content">
                    <el-row class="row-bg margin-top" :gutter="20">
                        <el-col :span="4" :offset="1" @click="showDModal" v-for="item in dialogData" :key="item.type"
                            class="flex space-between q-d-b align-center padding-top-xs margin-bottom-sm  col-five"
                            :class="item.type === 'busy' ? 'padding-top-xs' : ''">

                            <div class="text-left q-d-t margin-left-xs">
                                <div class="color-blue font-size-df">{{ item.title }}</div>
                                <div class="Roboto seats-title">
                                    <span>{{ item.count }}</span>
                                    <span class="font-size-sm color-54 ren margin-left-xs">件</span>
                                </div>

                            </div>
                        </el-col>

                    </el-row>

                </div>
            </div>
        </div>
      
        <div v-if="isModalD" class="dialog">
            <div class="dialog-bg">
                <div class="d-t  flex space-between align-center">

                    <img class="d-t-b" src="../assets/img/dialog-q.png" alt="">
                    <div class="dialog-title common-title">本年-问题板块营业</div>
                    <div class="d-t-c pointer" @click="closeD" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
                        @mousedown="handleMouseDown" @mouseup="handleMouseUp">
                        <img :src="currentImage" class="w-full h-full object-contain">
                        <!-- 预加载所有状态图片 -->
                        <img v-if="false" :src="normalImage" alt="预加载">
                        <img v-if="false" :src="hoverImage" alt="预加载">
                        <img v-if="false" :src="clickImage" alt="预加载">
                    </div>
                </div>
                <!-- 内容 -->
                <div class="dialog-content">
         
                </div>
            </div>
        </div>
    </div>
</template>

<script >
// import Modal from './Modal.vue';
import { ref, computed } from 'vue';

import normalImg from '../assets/img/close-btn.png'
import hoverImg from '../assets/img/close-hover.png'
import clickImg from '../assets/img/close-click.png'
export default {
    name: 'Question',
    components: {
        // Modal
    },

    setup() {
        const isModal = ref(false)
        const isModalD = ref(false)
        const showModal = () => {
            isModal.value = true
            //   this.$refs.modal.openModal(); // 调用 Modal 组件的 openModal 方法
        }
        const showDModal = () => {
            isModalD.value = true
            //   this.$refs.modal.openModal(); // 调用 Modal 组件的 openModal 方法
        }
        // 方法


        // 问题板块数据配置
        const seatData = [
            {
                type: 'talking',
                count: '1000',
                title: '营业',
                icon: '../../src/assets/img/q1.png',
                alt: '营业图标'
            },
            {
                type: 'busy',
                count: '1000',
                title: '供水',
                icon: '../../src/assets/img/q2.png',
                alt: '供水图标'
            },

            {
                type: 'idle',
                count: '1000',
                title: '漏水',
                icon: '../../src/assets/img/q3.png',
                alt: '漏水图标'
            },
            {
                type: 'offline',
                count: '1000',
                title: '排水',
                icon: '../../src/assets/img/q4.png',
                alt: '排水图标'
            },
            {
                type: 'idle',
                count: '10',
                title: '工程',
                icon: '../../src/assets/img/q5.png',
                alt: '工程图标'
            },
            {
                type: 'offline',
                count: '10',
                title: '服务',
                icon: '../../src/assets/img/q6.png',
                alt: '服务图标'
            }
        ]

        // 弹框
        // 使用导入的图片路径
        const normalImage = ref(normalImg)
        const hoverImage = ref(hoverImg)
        const clickImage = ref(clickImg)
        const currentImage = ref(normalImg)
        // 问题板块数据配置
        const dialogData = [
            {
                type: 'talking',
                count: '1000',
                title: '营业',
            },
            {
                type: 'busy',
                count: '1000',
                title: '供水',
            },

            {
                type: 'idle',
                count: '1000',
                title: '漏水',
            },
            {
                type: 'offline',
                count: '1000',
                title: '排水',
            },
            {
                type: 'idle',
                count: '10',
                title: '工程',
            },
            {
                type: 'offline',
                count: '10',
                title: '服务',
            }
        ]
        // 定义事件处理方法
        const handleMouseEnter = () => {
            currentImage.value = hoverImage.value
        }

        const handleMouseLeave = () => {
            currentImage.value = normalImage.value
        }

        const handleMouseDown = () => {
            currentImage.value = clickImage.value
        }

        const handleMouseUp = (event) => {
            const isMouseOver = event.relatedTarget?.closest('.d-t-c') !== null
            currentImage.value = isMouseOver ? hoverImage.value : normalImage.value
        }
        const closeD = () => {
            isModal.value = false
            isModalD.value = false

        }
        // 修复：添加 return 语句，使变量和方法可以在模板中使用
        return {
            showDModal,
            showModal,
            isModal,
            isModalD,
            seatData,
            // 弹框
            dialogData,
            currentImage,
            normalImage,
            hoverImage,
            clickImage,
            handleMouseEnter,
            handleMouseLeave,
            handleMouseDown,
            handleMouseUp,
            closeD
        };
    }
}    
</script>
  
<style scoped>
/* 话务 */
.question {}

.question-bg {
    background-image: url('../../src/assets/img/huawu.png');
    background-size: 100% 41px;
    margin-top: 20px;
    height: 41px;
}

.question-title {
    height: 21px;
    padding-bottom: 10px;
}

.question-bg img {
    width: 152px;
    height: 52px;
}

/* 问题板块 */
.question-subtitle {}

.row-bg>div {
    cursor: pointer;
}

.seats-bg {
    padding: 10px 54px;
    /* seats-title-bg */
    height: 168px;
    background-repeat: no-repeat;
}

.seats-bg>div {
    height: 168px;
}

.seats-bg img {
    height: 84px;
    width: 88px;
}

.seats-title {
    font-family: D-DIN;
    font-weight: bold;
    font-size: 28px;
}

.ren {
    font-family: PingFang SC;
    font-weight: 400;
    line-height: 22px;
}

</style>
  
    