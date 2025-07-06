<template>
    <!-- 停水公告 -->
    <div class="announcement common">
        <div class="announcement-bg common-bg text-left">
            <div class="announcement-title common-title padding-left-xll">停水公告</div>
            <img src="../../src/assets/img/announcement-service.png" alt="公告服务图标">
        </div>
        <!-- 停水公告列表 -->
        <div class="overflow-hidden" ref="scrollContainer">
            <div v-if="displayData.length" class="scroll-wrapper" ref="scrollWrapper">
                <div v-for="(item, index) in displayData" :key="item.id || index" class="margin-top-sm font-size-df flex align-center"
                    :class="['an-con', hoverClass(index), { 'active': activeIndex === index }]"
                    @mouseenter="handleHover(index)" @mouseleave="handleMouseLeave(index)">
                    <div :class="hoverTitle(index)" class="an-title">{{ item.stopTypeName }}</div>
                    <div class="an-right flex space-between align-center">
                        <div class="text-left">
                            <div :class="colorClass(index)" class="an-subTitle font-size-lg">{{ item.stopReason }}</div>
                            <div class="color-6c">{{ item.stopAddress }}</div>
                            <div class="color-6c">{{ item.stopStartTime }}至 {{ item.stopEndTime }}</div>
                        </div>
                        <div class="font-size-sm" :class="hoverTitle(index)">
                            <div :class="['common-btn', 'check-more', hoverBtnClass(index), clickBtnClass(index)]"
                                @mouseenter="handleBtnHover(index)" @mouseleave="handleMouseBtnLeave(index)"
                                @click="handleBtnClick(index)">
                                查看详情
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 详情弹窗 -->
        <div v-if="isDetailVisible" class="dialog">
            <div class="dialog-bg">
                <div class="d-t  flex space-between align-center">
                    <img class="d-t-b" src="../assets/img/announcement-service.png" alt="">
                    <div class="dialog-title common-title">紧急停水</div>
                    <div class="d-t-c pointer" @click="closeD" @mouseenter="handleMouseEnter"
                        @mouseleave="handleMouseLeave1" @mousedown="handleMouseDown" @mouseup="handleMouseUp">
                        <img :src="currentImage" class="">
                        <!-- 预加载所有状态图片 -->
                        <img v-if="false" :src="normalImage" alt="预加载">
                        <img v-if="false" :src="hoverImage" alt="预加载">
                        <img v-if="false" :src="clickImage" alt="预加载">
                    </div>
                </div>
                <!-- 内容 -->
                <div class="dialog-content">
                    <el-row class="row-bg margin-top" :gutter="20">
                        <el-col :span="12" class=" pointer ">
                            <div class="flex   align-center text-left font-size-df ">
                                <div class="color-blue  flex space-between align-center  ">
                                    <div class="common-dian margin-right-sm"></div> 停水类型:
                                </div>
                                <div class="margin-lr-sm">
                                    {{ displayData[activeIndex].stopTypeName }}
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="12" class=" pointer ">
                            <div class="flex   align-center text-left font-size-df ">
                                <div class="color-blue  flex space-between align-center  ">
                                    <div class="common-dian margin-right-sm"></div> 发布单位:
                                </div>
                                <div class="margin-lr-sm">
                                    {{ displayData[activeIndex].publishUnit }}
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="12" class=" pointer ">
                            <div class="flex   align-center text-left font-size-df ">
                                <div class="color-blue  flex space-between align-center  ">
                                    <div class="common-dian margin-right-sm"></div> 停水地址:
                                </div>
                                <div class="margin-lr-sm">
                                    {{ displayData[activeIndex].stopAddress }}
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="12" class=" pointer ">
                            <div class="flex   align-center text-left font-size-df ">
                                <div class="color-blue  flex space-between align-center  ">
                                    <div class="common-dian margin-right-sm"></div> 阀门信息:
                                </div>
                                <div class="margin-lr-sm">
                                    {{ displayData[activeIndex].valveInfo }}
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="12" class=" pointer ">
                            <div class="flex   align-center text-left font-size-df ">
                                <div class="color-blue  flex space-between align-center  ">
                                    <div class="common-dian margin-right-sm"></div> 停水开始时间:
                                </div>
                                <div class="margin-lr-sm">
                                    {{ displayData[activeIndex].stopStartTime }}
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="12" class=" pointer ">
                            <div class="flex   align-center text-left font-size-df ">
                                <div class="color-blue  flex space-between align-center ">
                                    <div class="common-dian margin-right-sm"></div> 停水结束时间:
                                </div>
                                <div class="margin-lr-sm">
                                    {{ displayData[activeIndex].stopEndTime }}
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="24" class=" pointer ">
                            <div class="flex   align-center text-left font-size-df ">
                                <div class="color-blue  flex space-between align-center  ">
                                    <div class="common-dian margin-right-sm"></div>
                                    <div class="d-c-title">停水范围:</div>
                                </div>
                                <div class="margin-lr-sm">
                                    {{ displayData[activeIndex].stopRange }}
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="24" class=" pointer ">
                            <div class="flex   align-center text-left font-size-df ">
                                <div class="color-blue  flex space-between align-center  ">
                                    <div class="common-dian margin-right-sm"></div>
                                    <div class="d-c-title">
                                        原&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因：
                                    </div>
                                </div>
                                <div class="margin-lr-sm">
                                    {{displayData[activeIndex].stopReason}}
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { get, post } from '../utils/request'; // 假设这是您的HTTP请求工具

import normalImg from '../assets/img/close-btn.png'
import hoverImg from '../assets/img/close-hover.png'
import clickImg from '../assets/img/close-click.png'

export default {
    name: 'Announcement',

    setup() {
        const scrollContainer = ref(null);
        const scrollWrapper = ref(null);
        const activeIndex = ref(null);
        const isDetailVisible = ref(false);
        const displayData = ref([]);
        const currentIndex = ref(0);
        const timer = ref(null);
        const hoverState = reactive([]);
        const btnHoverState = reactive([]);
        const btnClickedState = reactive([]);
        const isScrolling = ref(true);
        const scrollHeight = ref(0);
        const itemHeight = ref(0);
        const containerHeight = ref(0);
        const visibleItemCount = ref(3); // 同时显示的项目数

        // 初始化状态
        const initStates = () => {
            hoverState.length = 0;
            btnHoverState.length = 0;
            btnClickedState.length = 0;
            
            displayData.value.forEach((_, index) => {
                hoverState[index] = false;
                btnHoverState[index] = false;
                btnClickedState[index] = false;
            });
        };

        // 计算属性
        const hoverClass = computed(() => {
            return (index) => hoverState[index] ? 'hoverAn' : '';
        });

        const hoverBtnClass = computed(() => {
            return (index) => btnHoverState[index] ? 'hoverBtn color-white' : '';
        });

        const clickBtnClass = computed(() => {
            return (index) => btnClickedState[index] ? 'clickBtn color-white' : '';
        });

        const colorClass = computed(() => {
            return (index) => hoverState[index] ? 'color-E3AE3B' : 'color-D5';
        });

        const hoverTitle = computed(() => {
            return (index) => hoverState[index] ? 'color-white' : 'color-D5';
        });

        // 方法
        const handleHover = (index) => {
            hoverState[index] = true;
        };

        const handleMouseLeave = (index) => {
            hoverState[index] = false;
        };

        const handleBtnHover = (index) => {
            btnHoverState[index] = true;
            btnClickedState[index] = false;
        };

        const handleMouseBtnLeave = (index) => {
            btnHoverState[index] = false;
            btnClickedState[index] = false;
        };

        const handleBtnClick = (index) => {
            isDetailVisible.value = true;
            stopScrolling();
            activeIndex.value = index;

            // 重置所有按钮状态
            btnClickedState.forEach((_, i) => {
                btnClickedState[i] = false;
            });

            // 设置当前按钮为点击状态
            btnClickedState[index] = true;
            btnHoverState[index] = false;
        };

        // 滚动相关方法
        const startScrolling = () => {
            if (displayData.value.length <= visibleItemCount.value) {
                stopScrolling(); // 数据不足时停止滚动
                return;
            }

            timer.value = setInterval(() => {
                if (isScrolling.value && !isDetailVisible.value && scrollWrapper.value && scrollContainer.value) {
                    // 更新当前索引 - 确保循环滚动
                    currentIndex.value = (currentIndex.value + 1) % (displayData.value.length - visibleItemCount.value + 1);

                    // 平滑滚动到下一项
                    scrollWrapper.value.style.transition = 'transform 0.5s ease-in-out';
                    scrollWrapper.value.style.transform = `translateY(-${currentIndex.value * itemHeight.value}px)`;
                }
            }, 5000);
        };

        const stopScrolling = () => {
            isScrolling.value = false;
            clearInterval(timer.value);
        };

        const resumeScrolling = () => {
            isScrolling.value = true;
            startScrolling();
        };

        // 计算每项高度和总高度
        const calculateDimensions = () => {
            if (scrollWrapper.value && scrollWrapper.value.children.length > 0) {
                // 正确获取第一项的高度
                itemHeight.value = scrollWrapper.value.children[0].offsetHeight + 10; // 加上margin-top
                containerHeight.value = itemHeight.value * visibleItemCount.value; // 显示指定数量的高度
                
                if (scrollContainer.value) {
                    scrollContainer.value.style.height = `${containerHeight.value}px`;
                }
            }
        };

        // 弹框相关
        const normalImage = ref(normalImg)
        const hoverImage = ref(hoverImg)
        const clickImage = ref(clickImg)
        const currentImage = ref(normalImg)
        const handleMouseEnter = () => {
            currentImage.value = hoverImage.value
        }

        const handleMouseLeave1 = () => {
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
            isDetailVisible.value = false;
            activeIndex.value = null;
            // 重置所有按钮状态
            btnClickedState.forEach((_, i) => {
                btnClickedState[i] = false;
            });
            resumeScrolling();
        }

        // 获取停水公告
        const getWaterNoticeData = async () => {
            try {
                const response = await get('/shenyang-report/screen/stopWaterNotice');
                displayData.value = response.data;
                initStates(); // 数据获取后初始化状态
                nextTick(() => {
                    calculateDimensions();
                    startScrolling();
                });
            } catch (error) {
                console.error('获取停水公告失败', error);
            }
        };

        // 监听数据变化，重新计算尺寸
        watch(() => displayData.value, () => {
            initStates();
            nextTick(calculateDimensions);
        }, { deep: true });

        // 监听窗口大小变化，重新计算尺寸
        watch(() => {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }, calculateDimensions, { deep: true });

        // 生命周期钩子
        onMounted(() => {
            getWaterNoticeData();
            window.addEventListener('resize', calculateDimensions);
        });

        onUnmounted(() => {
            stopScrolling();
            window.removeEventListener('resize', calculateDimensions);
        });

        return {
            getWaterNoticeData,
            scrollContainer,
            scrollWrapper,
            activeIndex,
            isDetailVisible,
            displayData,
            currentIndex,
            hoverState,
            btnHoverState,
            btnClickedState,
            isScrolling,
            hoverClass,
            hoverBtnClass,
            clickBtnClass,
            colorClass,
            hoverTitle,
            handleHover,
            handleMouseLeave,
            handleBtnHover,
            handleMouseBtnLeave,
            handleBtnClick,
            startScrolling,
            stopScrolling,
            resumeScrolling,
            // 弹框
            currentImage,
            normalImage,
            hoverImage,
            clickImage,
            handleMouseEnter,
            handleMouseLeave1,
            handleMouseDown,
            handleMouseUp,
            closeD,
        };
    }
};
</script>

<style scoped>
/* 停水公告 */
.announcement-bg {
    background-image: url('../../src/assets/img/huawu.png');
    background-size: 100% 41px;
    margin-top: 40px;
    height: 41px;
}

.announcement-title {
    height: 21px;
    padding-bottom: 10px;
}

.announcement-bg img {
    width: 165px;
    height: 52px;
}

.overflow-hidden {
    overflow: hidden;
    position: relative;
}

.scroll-wrapper {
    transition: transform 0.5s ease-in-out;
}

.an-con {
    background-image: url('../../src/assets/img/an-bg.png');
    background-size: 100% 90px;
    height: 90px;
    position: relative;
    margin-top: 10px;
}

.hoverAn {
    background-image: url('../../src/assets/img/an-hover-bg.png');
}

.an-con:hover {
    cursor: pointer;
}

.an-title {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translate(10px, -50%);
    width: 40px;
}

.an-right {
    margin: 0 50px 0 100px;
    width: 100%;
}

.common-btn {
    width: 100px;
    height: 32px;
    line-height: 32px;
    text-align: center;
}

.check-more {
    background-image: url('../../src/assets/img/an-btn.png');
}

.hoverBtn {
    background-image: url('../../src/assets/img/an-hover-btn.png');
}

.clickBtn {
    background-image: url('../../src/assets/img/an-click-btn.png');
    color: white;
}

.dialog-bg {
    background-image: url('/src/assets/img/a-d-b.png');
    max-height: 463px;
    width: 828px;
    height: 463px;
    margin: 10px 0;
}

.d-t {
    margin-top: 20px;
}

.d-t-b {
    width: 172px;
    height: 64px;
}

.dialog-title {
    width: 180px;
}

.dialog-content {
    height: 330px;
}

.d-c-title{
    width: 80px;
}

.row-bg>div {
    margin-bottom: 30px;
}

/* 详情弹窗样式 */
</style>    