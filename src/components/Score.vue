<template>
    <!-- 服务评分排名服务 -->
    <div class="score common">
        <!-- 背景与标题区域 -->
        <div class="score-bg flex space-between common-bg text-left">
            <div class="score-title common-title padding-left-xll">服务评分排名</div>
            <div class="complaint-tab flex align-center font-size-sm">
                <div v-for="(tab, index) in tabs" :key="tab.id"
                    :class="{ 'active color-E3AE3B': activeTab === index, 'default color-6c': activeTab !== index }"
                    @click="setActiveTab(index)">
                    {{ tab.label }}
                </div>
            </div>
        </div>

        <!-- 服务评分排名信息 -->
        <div class="score-sub-bg">
            <ScoreItem v-for="(item, index) in scoreData" :index="index" :key="index" :item="item" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import ScoreItem from './ScoreItem.vue';
import { get, post } from '../utils/request'; // 假设这是您的HTTP请求工具

export default {
    name: 'Score',
    components: {
        ScoreItem
    },
    setup() {
        const tabs = ref([
            { id: 1, label: '分公司' },
            { id: 2, label: '电话受理员' },
        ]);

        // 当前激活的选项卡索引
        const activeTab = ref(0);

        // 设置激活的选项卡
        const setActiveTab = (index) => {
            activeTab.value = index;
        };
        // 评分数据
        const scoreData = ref([]);
        const getRanking = async () => {
            try {
                const data = {
                    appraisalCycle: ''
                }
                const response = await get('/shenyang-report/screen/service-ranking', data);
                scoreData.value = response.data.ranking.sort((a, b) => b.score - a.score);;
            } catch (error) {
                console.error('获取评分失败', error);
            }
        };
        // 动画控制
        const animateProgress = (progressEl, value) => {
            let current = 0;
            const duration = 1000; // 动画持续时间(毫秒)
            const start = performance.now();

            const animate = (timestamp) => {
                const elapsed = timestamp - start;
                if (elapsed < duration) {
                    const progressRatio = elapsed / duration;
                    current = Math.min(Math.max(progressRatio * value, 0), value);
                    progressEl.style.width = `${current}%`;
                    requestAnimationFrame(animate);
                } else {
                    progressEl.style.width = `${value}%`;
                }
            };

            requestAnimationFrame(animate);
        };

        // 组件挂载时初始化动画
        onMounted(() => {
            const progressElements = document.querySelectorAll('.progress');
            progressElements.forEach((el, index) => {
                if (scoreData.value[index].value > 0) {
                    animateProgress(el, scoreData.value[index].value);
                }
            });
        });
        onMounted(() => {
            getRanking()
        })
        // 监听数据变化
        watch(
            () => scoreData.value,
            (newData) => {
                const progressElements = document.querySelectorAll('.progress');
                newData.forEach((item, index) => {
                    if (progressElements[index]) {
                        animateProgress(progressElements[index], item.value);
                    }
                });
            },
            { deep: true }
        );

        return {
            tabs,
            setActiveTab,
            activeTab,
            scoreData,
            getRanking
        };
    }
}
</script>

<style scoped>
.score {}

.score-bg {
    background-image: url('../../src/assets/img/huawu.png');
    background-size: 100% 41px;
    margin-top: 20px;
    height: 41px;
}

.score-title {
    height: 21px;
    padding-bottom: 10px;
}

.score-bg img {
    width: 150px;
    height: 52px;
}

/* 服务评分排名信息 */

.score-sub-bg {
    padding: 10px 54px 0;
    font-family: PingFang SC;
}

.score-sub-bg img {
    width: 20px;
    height: 24px;
}

.score-sub-title {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 5px);
    background: linear-gradient(0deg, #DDF9FF 90%, #7BFAFF 0%);
    font-weight: 400;
    color: transparent;
    -webkit-background-clip: text;
    font-family: PingFang SC;
}

.sub-bg {
    background-image: url('../../src/assets/img/sub-click-bg.png');
    background-size: 100% 64px;
    height: 64px;
    width: 97px;
    background-position: center center;
    background-repeat: no-repeat;
}

.sub-bg .Roboto {
    font-family: D-DIN;
    font-weight: bold;
    font-size: 28px;
}

/* 受诉量 */
.complaint-tab>div {
    padding: 3px 10px;
    border-radius: 4px;
    background: #0C234D;
    margin-right: 10px;
    cursor: pointer;
}

.complaint-tab :hover {
    background-color: #3D4F71;
}

.complaint-tab .active {
    border: 1px solid #2D5FEC;
}

.complaint-tab .default {
    border: 1px solid #2C3E59;
}


.score-complaint-bg>div {
    height: 168px;
}

.score-complaint-bg img {
    height: 79px;
    width: 72px;
}

.score-bg-title {
    font-family: D-DIN;
    font-weight: bold;
    font-size: 32px;
}

.ren {
    font-family: PingFang SC;
    font-weight: 400;
    line-height: 22px;
}
</style>    