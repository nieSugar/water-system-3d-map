<template>
    <!-- 工单服务 -->
    <div class="order common">
        <!-- 背景与标题区域 -->
        <div class="order-bg common-bg text-left">
            <div class="order-title common-title padding-left-xll">工单服务</div>
            <img src="../../src/assets/img/order-service.png" alt="工单服务图标">
        </div>

        <!-- 工单信息 -->
        <div class="order-sub-bg ">
            <div class="order-sub-title font-size-xs ">年度</div>
            <div class="clear-both"></div>
            <el-row class="row-bg  padding-tb-sm" justify="space-between">
                <el-col :span="6">
                    <div class="grid-content ep-bg-purple align-center ">
                        <div class="flex justify-center align-center ">
                            <div class="sub-bg ">
                                <div class="Roboto">{{ completionRate }}</div>
                            </div>
                            <span class="font-size-sm color-54 ren">%</span>
                        </div>

                        <div class="color-blue font-size-df">
                            办结率
                        </div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="grid-content ep-bg-purple align-center ">
                        <div class="flex justify-center align-center ">
                            <div class="sub-bg ">
                                <div class="Roboto">{{ validCallRate }}</div>
                            </div>
                            <span class="font-size-sm color-54 ren">%</span>
                        </div>

                        <div class="color-blue font-size-df">
                            有效回访率
                        </div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="grid-content ep-bg-purple align-center ">
                        <div class="flex justify-center align-center ">
                            <div class="sub-bg ">
                                <div class="Roboto">{{ satisfactionRate }}</div>
                            </div>
                            <span class="font-size-sm color-54 ren">%</span>
                        </div>

                        <div class="color-blue font-size-df">
                            满意度
                        </div>
                    </div>
                </el-col>

            </el-row>
        </div>
        <!-- 受诉量区域 -->
        <div class="common-subtitle order-subtitle">
            <div class="flex space-between align-end margin-tb-xxs">
                <div class="flex nowarp"> <img src="../../src/assets/img/icon.png" alt="图标">
                    <div class="margin-left-xs">受诉量</div>
                </div>
                <div class="complaint-tab flex align-center font-size-sm">
                    <div v-for="(tab, index) in tabs" :key="tab.id"
                        :class="{ 'active color-E3AE3B': activeTab === index, 'default color-6c': activeTab !== index }"
                        @click="setActiveTab(index)">
                        {{ tab.label }}
                    </div>
                </div>
            </div>
            <div class="liness"></div>

            <!-- 受诉量数据内容 -->
            <div class="order-complaint-bg margin-top-xs">
                <div class="common-layout">
                    <el-row class="row-bg " style="margin: 0;" :gutter="20">
                        <el-col :span="getSpan(index)" @click="showTModal(item.title)"
                            v-for="(item, index) in complaintData" :key="item.type"
                            class="flex space-between   align-center pointer ">
                            <div v-if="activeTab === 0">
                                <div class="c-img" v-if="index == 0 || index == 3">
                                    <img class="c-img" v-if="index == 0" src="../assets/img/c-b.png" alt="">
                                    <img class="c-img" v-if="index == 3" src="../assets/img/c-consulting.png" alt="">
                                </div>
                                <div class="text-left c-b ">
                                    <div class="flex align-center color-blue ">
                                        <div class="color-blue font-size-df flex align-center ">
                                            <div v-if="index !== 0 && index !== 3" class="c-tag"></div> {{
                                                item.title }}
                                        </div>
                                        <div class="margin-left-sm font-size-sm">查看></div>
                                    </div>
                                    <div class="Roboto seats-title ">
                                        <span>{{ item.count }}</span>
                                        <span v-if="index < 5" class="font-size-sm color-54 ren margin-left-xs">件</span>
                                        <span v-else class="font-size-sm color-54 ren margin-left-xs">%</span>
                                    </div>
                                </div>
                            </div>
                            <div v-if="activeTab !== 0 && index <= 3">
                                <div class="c-img" v-if="index == 0 || index == 3">
                                    <img class="c-img" v-if="index == 0" src="../assets/img/c-b.png" alt="">
                                    <img class="c-img" v-if="index == 3" src="../assets/img/c-consulting.png" alt="">
                                </div>
                                <div class="text-left c-b c-bs ">
                                    <div class="flex align-center space-between">
                                        <div>
                                            <div class="flex align-center color-blue ">
                                                <div class="color-blue font-size-df flex align-center ">
                                                    <div v-if="index !== 0 && index !== 3" class="c-tag"></div> {{
                                                        item.title }}
                                                </div>
                                                <div class="margin-left-sm font-size-sm">查看></div>
                                            </div>
                                            <div class="Roboto seats-title ">
                                                <span>{{ item.count }}</span>
                                                <span class="font-size-sm color-54 ren margin-left-xs">件</span>
                                            </div>
                                        </div>
                                        <div class="flex align-center" v-if="index == 0 || index == 3">
                                            <div class="line"></div>
                                            <div class="flex align-center num-right  padding-left-lg">
                                                <div class="color-blue">环比：</div>
                                                <div :class="item.subValueClass + ' seats-title'" style="padding: 0;">{{
                                                    item.subValue }}<span
                                                        class="font-size-sm color-54 ren margin-left-xs">%</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </div>

        <!-- 渠道分析区域 -->
        <div class="common-subtitle">
            <div class="flex nowarp  ">
                <img src="../../src/assets/img/icon.png" alt="图标">
                <div class="margin-left-xs">渠道分析</div>
            </div>
            <div class="liness"></div>

            <!-- 内容 -->
            <div class="margin-top-xs">
                <el-row class="row-bg align-center " style="height:                180px;" :gutter="20">
                    <el-col :span="16" class="flex align-center" style="position: relative;">
                        <!-- ECharts 容器，设置宽高 -->
                        <ECharts3DPie :chartData="chartData" :colors="colors" />
                        <!-- <ECharts3DPie @onLabelLineClick="handleLabelLineClick" :chartData="chartData" :colors="colors" /> -->
                        <div class="common-zhexian pointer">
                            <div class="color-blue">{{ chartName }} <span>查看></span></div>
                            <div class="advantage_line2"></div>
                            <div class="chartvalue">{{ chartValue }}</div>
                           </div>
                    </el-col>
                    <el-col :span="8">
                       
                        <div class="margin-right-lg font-size-sm">
                            <div v-for="(item, index) in chartData" @click="showName(index)" :key="index" class="flex align-center space-between pointer"
                                :class="index > 0 ? 'margin-top-xs' : ''">
                                <div class="flex align-center">
                                    <div class="common-dian" :class="`bg-${getBgColorClass(index)}`"></div>
                                    <div class="color-blue margin-left-xs">{{ item.name }}</div>
                                </div>
                                <div>
                                    <span>{{ item.value }}</span>
                                    <span class="color-54 margin-left-xs">件</span>
                                </div>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>
        <!-- 表单 -->
        <div v-if="isModalT" class="dialog">
            <div class="dialog-bg">
                <div class="d-t  flex space-between align-center">
                    <img class="d-t-b" src="../assets/img/order-service.png" alt="">
                    <div class="dialog-title common-title">本年-工单服务{{ dtitle }}</div>
                    <div class="d-t-c pointer" @click="closeD" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
                        @mousedown="handleMouseDown" @mouseup="handleMouseUp">
                        <img :src="currentImage" class="">
                        <!-- 预加载所有状态图片 -->
                        <img v-if="false" :src="normalImage" alt="预加载">
                        <img v-if="false" :src="hoverImage" alt="预加载">
                        <img v-if="false" :src="clickImage" alt="预加载">
                    </div>
                </div>
                <!-- 内容 -->
                <div class="dialog-content">
                    <div class="complaint-table-container">
                        <el-table :data="currentTableData" stripe highlight-current-row height="450px" style="width: 100%">
                            <el-table-column type="index" label="序号" width="60"></el-table-column>
                            <el-table-column prop="flags" label="标识" width="100">
                                <template #default="scope">
                                    <div class="flex justify-center">
                                        <el-text :class="scope.row.flags.length > 1 ? 'margin-right-xs' : ''"
                                            v-for="flag in scope.row.flags" :key="flag" :type="getFlagType(flag)">{{
                                                flag }}</el-text>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="status" label="状态" width="100">
                                <template #default="scope">
                                    <el-text :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-text>
                                </template>
                            </el-table-column>
                            <el-table-column prop="complaintId" label="客诉单号" width="150"></el-table-column>
                            <el-table-column prop="address" label="发生地址" width="150"></el-table-column>
                            <el-table-column prop="problemCategory" label="问题板块" width="120"></el-table-column>
                            <el-table-column prop="problemType" label="反映类型" width="120"></el-table-column>
                            <el-table-column prop="source" label="反映来源" width="120"></el-table-column>
                            <el-table-column prop="reason" label="问题原因" width="200"></el-table-column>
                            <el-table-column prop="description" label="问题描述" width="200"></el-table-column>
                            <el-table-column prop="reportTime" label="接报时间" width="120"></el-table-column>
                        </el-table>
                        <!-- 分页控制 -->
                        <el-pagination class="margin-top" @size-change="handleSizeChange"
                            @current-change="handleCurrentChange" :current-page="currentPage" :page-size="pageSize"
                            layout="total,->,  pager,sizes, jumper,>-" :total="total">
                        </el-pagination>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import ECharts3DPie from './ECharts3DPie.vue';
import { get, post } from '../utils/request';

import normalImg from '../assets/img/close-btn.png';
import hoverImg from '../assets/img/close-hover.png';
import clickImg from '../assets/img/close-click.png';

export default defineComponent({
    name: 'OrderService',
    components: {
        ECharts3DPie
    },
    setup() {
        // 响应式数据
        const isModalT = ref(false);
        const dtitle = ref('');
        const tabs = ref([
            { id: 1, label: '历年', english: 'Calendar Years' },
            { id: 2, label: '日', english: 'Day' },
            { id: 3, label: '周', english: 'Week' },
            { id: 4, label: '月', english: 'Month' },
            { id: 5, label: '年', english: 'Year' }
        ]);
        const activeTab = ref(0);
        const complaintData = [
            {
                type: 'talking',
                count: '294205',
                title: '受诉量',
                subValue: '20',
                subValueClass: 'color-green',
            },
            {
                type: 'busy',
                count: '294205',
                title: '办结件',
            },
            {
                type: 'idle',
                count: '294205',
                title: '办结率',
            },
            {
                type: 'offline',
                count: '294205',
                title: '咨询量',
                subValue: '-20',
                subValueClass: 'color-red'
            },
            {
                type: 'idle',
                count: '294205',
                title: '满意件',
            },
            {
                type: 'offline',
                count: '100',
                title: '满意率',
            }
        ];
        const normalImage = ref(normalImg);
        const hoverImage = ref(hoverImg);
        const clickImage = ref(clickImg);
        const currentImage = ref(normalImg);
        const tableData = ref([]);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(0);
        const completionRate = ref('');
        const validCallRate = ref('');
        const satisfactionRate = ref('');
        const chartData = ref([
            { name: '96681服务热线', value: 29 },
            { name: '省12345', value: 29 },
            { name: '人民网', value: 82 },
            { name: '市12345', value: 33 },
            { name: "'找茬'窗口", value: 23 },
        ]);
        const colors = ['#059392', '#2E69B3', '#6EC1ED', '#F7D063', '#EE752A'];

        // 颜色映射表
        const colorMap = {
            '#059392': 'green',
            '#2E69B3': 'blue1',
            '#6EC1ED': 'blue',
            '#F7D063': 'yellow',
            '#EE752A': 'orange'
        };

        // 计算属性
        const currentTableData = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value;
            const end = start + pageSize.value;
            return tableData.value.slice(start, end);
        });

        // 方法
        const showTModal = (title) => {
            isModalT.value = true;
            dtitle.value = title;
        };

        const setActiveTab = (index) => {
            activeTab.value = index;
            getSuedTransact();
        };
        const handleLabelLineClick = (params) => {
            console.log('标签线被点击，参数：', params);
        }
        const getSpan = (index) => {
            if (activeTab.value !== 0 && index <= 3) {
                if (index === 0) return 12;
                if (index === 1 || index === 2) return 6;
                if (index === 3) return 24;
            }
            return 8;
        };

        const generateTableData = () => {
            const flags = ['延', '超', '催', '重'];
            const statusList = ['处理中', '处理完成', '处理中(已发单)', '已上报', '已回访', '已分派', '完工审核', '已结案', '暂存', '已核实', '已派遣'];
            const problemCategories = ['系统故障', '服务质量', '咨询投诉', '建议反馈', '功能异常'];
            const problemTypes = ['语音质量', '连接问题', '操作失误', '服务态度', '功能缺失', '计费错误'];
            const sources = ['电话', '在线客服', '邮件', '社交媒体', '现场反馈'];

            return Array.from({ length: 50 }, (_, i) => {
                const complaintId = `CS${new Date().getFullYear().toString().slice(2)}${(i + 1000).toString()}`;
                const randomFlags = [];
                const flagCount = Math.floor(Math.random() * 3) + 1;
                const shuffledFlags = [...flags].sort(() => 0.5 - Math.random());
                for (let j = 0; j < flagCount; j++) {
                    randomFlags.push(shuffledFlags[j]);
                }
                const status = statusList[Math.floor(Math.random() * statusList.length)];
                const category = problemCategories[Math.floor(Math.random() * problemCategories.length)];
                const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
                const source = sources[Math.floor(Math.random() * sources.length)];

                return {
                    flags: randomFlags,
                    status: status,
                    complaintId: complaintId,
                    address: `城市${Math.floor(Math.random() * 100) + 1}区街道${Math.floor(Math.random() * 100) + 1}号`,
                    problemCategory: category,
                    problemType: type,
                    source: source,
                    reason: `这是问题${i + 1}的原因描述，可能涉及系统故障、操作不当或其他因素。`,
                    description: `用户反馈${category}中的${type}问题，具体表现为服务无法正常使用，影响业务开展。`,
                    reportTime: `2025-07-${Math.floor(Math.random() * 30 + 1).toString().padStart(2, '0')} ${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
                };
            });
        };

        const handleSizeChange = (newSize) => {
            pageSize.value = newSize;
            currentPage.value = 1;
        };

        const handleCurrentChange = (newPage) => {
            currentPage.value = newPage;
        };

        const getFlagType = (flag) => {
            const flagMap = {
                '延': 'primary1',
                '超': 'danger',
                '催': 'warning',
                '重': 'primary'
            };
            return flagMap[flag] || 'default';
        };

        const getStatusType = (status) => {
            const statusMap = {
                '处理中': 'primary',
                '处理完成': 'success',
                '处理中(已发单)': 'primary',
                '已上报': 'primary',
                '已回访': 'primary',
                '已分派': 'primary',
                '完工审核': 'success',
                '已结案': 'info',
                '暂存': 'info',
                '已核实': 'success',
                '已派遣': 'primary'
            };
            return statusMap[status] || 'default';
        };

        const getWaterlStatisticsData = async () => {
            try {
                const response = await get('/shenyang-report/screen/annualStatistics');
                completionRate.value = response.data.completionRate;
                validCallRate.value = response.data.validCallRate;
                satisfactionRate.value = response.data.satisfactionRate;
            } catch (error) {
                console.error('获取工单服务失败', error);
            }
        };

        const getSuedTransact = async () => {
            try {
                const data = {
                    dateStr: tabs.value[activeTab.value].english
                }
                const response = await post('/shenyang-report/screen/suedTransact', data);
                // seatData.value = response.data;
            } catch (error) {
                console.error('获取受诉量失败', error);
            }
        };

        const mapDataToChart = (data) => {
            chartData.value = [
                { name: '96681服务热线', value: data.hotLine96681Count },
                { name: '省12345', value: data.prov12345MainCount },
                { name: '人民网', value: data.peopleOnlineCount },
                { name: '市12345', value: data.city12345MainCount },
                { name: "'找茬'窗口", value: data.complaintCount },
            ].sort((a, b) => b.value - a.value);
        }
        const getReportData = async () => {
            try {
                const response = await get('/shenyang-report/screen/reportSectionCount');
                mapDataToChart(response.data);

            } catch (error) {
                console.error('获取渠道分析失败', error);
            }
        };
        const chartName = ref('')
        const chartValue = ref('')
        const showName =(index)=>{
            chartName.value = chartData.value[index].name
            chartValue.value = chartData.value[index].value
        }

        const getBgColorClass = (index) => {
            const color = colors[index % colors.length];
            return colorMap[color] || 'default';
        };

        const handleMouseEnter = () => {
            currentImage.value = hoverImage.value;
        };

        const handleMouseLeave = () => {
            currentImage.value = normalImage.value;
        };

        const handleMouseDown = () => {
            currentImage.value = clickImage.value;
        };

        const handleMouseUp = (event) => {
            const isMouseOver = event.relatedTarget?.closest('.d-t-c') !== null;
            currentImage.value = isMouseOver ? hoverImage.value : normalImage.value;
        };

        const closeD = () => {
            isModalT.value = false;
        };

        // 生命周期钩子
        onMounted(() => {
            chartName.value = chartData.value[0].name
            chartValue.value = chartData.value[0].value
            tableData.value = generateTableData();
            total.value = tableData.value.length;
            getWaterlStatisticsData();
            getReportData();
            // getSuedTransact();

        });

        // 返回数据和方法
        return {
            isModalT,
            dtitle,
            tabs,
            activeTab,
            complaintData,
            normalImage,
            hoverImage,
            clickImage,
            currentImage,
            tableData,
            currentPage,
            pageSize,
            total,
            currentTableData,
            completionRate,
            validCallRate,
            satisfactionRate,
            chartValue,
            chartName,
            showName,
            chartData,
            colors,
            showTModal,
            setActiveTab,
            getSpan,
            handleSizeChange,
            handleCurrentChange,
            getFlagType,
            getStatusType,
            getBgColorClass,
            handleMouseEnter,
            handleMouseLeave,
            handleMouseDown,
            handleMouseUp,
            closeD,
            handleLabelLineClick
        };
    }
});
</script>

<style scoped>
/* 工单 */
.order {}

.order-bg {
    background-image: url('../../src/assets/img/huawu.png');
    background-size: 100% 41px;
    margin-top: 77px;
    height: 41px;
}

.order-title {
    height: 21px;
    padding-bottom: 10px;
}

.order-bg img {
    width: 150px;
    height: 52px;
}

/* 工单信息 */

.order-sub-bg {
    padding: 10px 54px 0;
    /* order-bg-title-bg */
    background-image: url('../../src/assets/img/order-bg.png');
    background-size: 100% 127px;
    /* height: 127px; */
    background-repeat: no-repeat;
    position: relative;
}

.order-sub-title {
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

.c-tag {
    background: #549FF9;
    border-radius: 1px;
    width: 2px;
    height: 12px;
    margin-right: 7px;
}

.order-complaint-bg {}

.order-complaint-bg .c-b {
    background-image: url('../../src/assets/img/complainttitle-bg.png');
    background-repeat: no-repeat;
    background-position: bottom;
    padding: 2px 30px;
}

.row-bg .c-bs {
    background-size: contain;
}

.row-bg .c-bs .line {
    width: 1px;
    height: 20px;
    margin-top: 20px;

}

.row-bg .el-col-12 .c-bs {
    background-image: url('../../src/assets/img/complainttitle-bg2.png');
}

.num-right {
    margin-top: 20px;
}

.row-bg .el-col-12 .c-bs>div>div,
.row-bg .el-col-24 .c-bs>div>div {
    flex: 0 0 50%;
}

.row-bg .el-col-6 .c-bs {
    background-image: url('../../src/assets/img/complainttitle-bg3.png');

}

.row-bg .el-col-24 .c-bs {
    background-image: url('../../src/assets/img/complainttitle-bg4.png');

}

.order-complaint-bg .seats-title {
    font-family: D-DIN;
    font-weight: bolder;
    font-size: 24px;
    padding-top: 10px;
}

.order-complaint-bg>div {
    /* height: 168px; */
}

.c-img {
    width: 74px;
    height: 74px;
    float: left;
}

.order-bg-title {
    font-family: D-DIN;
    font-weight: bold;
    font-size: 32px;
}

.ren {
    font-family: PingFang SC;
    font-weight: 400;
    line-height: 22px;
}

.common-dian {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}
</style>    