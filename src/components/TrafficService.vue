<template>
  <!-- 话务服务 -->
  <div class="traffic common">
    <!-- 背景与标题区域 -->
    <div class="traffic-bg common-bg text-left">
      <div class="traffic-title common-title padding-left-xll">话务服务</div>
      <img src="../../src/assets/img/hw-service.png" alt="话务服务图标">
    </div>

    <!-- 实时坐席区域 -->
    <div class="common-subtitle traffic-subtitle">
      <div class="flex nowarp margin-tb-sm">
        <img src="../../src/assets/img/icon.png" alt="图标">
        <div class="margin-left-xs">实时坐席</div>
      </div>
      <div class="liness"></div>

      <!-- 坐席数据内容 -->
      <div class="seats-bg margin-tb-xs">
        <div class="common-layout">
          <el-container>
            <!-- 左侧数据 -->
            <el-aside width="200px">
              <div  @click="showModal" 
                class="flex space-between align-center pointer"> 
                <img src="../../src/assets/img/seats.png" >
                <div class="text-right">
                  <div class="Roboto seats-title">{{ seatData.agentOnCallCount }}<span
                      class="font-size-sm color-54 ren margin-left-xs">人</span></div>
                  <div class="color-blue font-size-df">通话坐席数</div>
                </div>
              </div>
              <div  @click="showModal" 
                class="flex space-between align-center pointer padding-top-xs" >
                <img src="../../src/assets/img/busy.png" >
                <div class="text-right">
                  <div class="Roboto seats-title">{{ seatData.agentBusyCount }}<span
                      class="font-size-sm color-54 ren margin-left-xs">人</span></div>
                  <div class="color-blue font-size-df">示忙坐席数</div>
                </div>
              </div>
            </el-aside>

            <!-- 中间数据 -->
            <el-main>
              <div class="margin-top-xs">
                <div class="color-blue font-size">坐席人数</div>
                <div class="Roboto font-size-xl">{{ seatData.agentCount }}</div>
                <!-- 按钮 需要判断 -->
                <div class="font-size-sm color-white">
                  <div :class="['common-btn', 'check-more', hoverClass, clickClass]" @mouseenter="handleHover"
                    @mouseleave="handleMouseLeave" @click="handleClick">
                    查看更多
                  </div>
                </div>
              </div>
            </el-main>

            <!-- 右侧数据 -->
            <el-aside width="200px">
              <div @click="showModal" 
                class="flex space-between align-center pointer" >
                <div class="text-left">
                  <div class="Roboto seats-title">{{ seatData.agentIdleCount }}<span
                      class="font-size-sm color-54 ren margin-left-xs">人</span></div>
                  <div class="color-blue font-size-df">示闲坐席数</div>
                </div>
                <img src="../../src/assets/img/leisure.png" >
              </div>
              <div @click="showModal" 
                class="flex space-between align-center pointer padding-top-xs">
                <div class="text-left">
                  <div class="Roboto seats-title">{{ seatData.agentOfflineCount }}<span
                      class="font-size-sm color-54 ren margin-left-xs">人</span></div>
                  <div class="color-blue font-size-df">离线坐席数</div>
                </div>
                <img src="../../src/assets/img/offline.png" >
              </div>
            </el-aside>
          </el-container>
        </div>
      </div>
    </div>

    <!-- 今日话务区域 -->
    <div class="common-subtitle">
      <div class="flex nowarp margin-bottom-xs ">
        <img src="../../src/assets/img/icon.png" alt="图标">
        <div class="margin-left-xs">今日话务</div>
      </div>
      <div class="liness"></div>

      <!-- 内容 -->
      <div class="margin-top-xs">
        <div v-for="(item, index) in trafficData" @click="showTModal(item.title)" :key="index"
          class="num-calls pointer font-size-df margin-top-xs">
          <el-row>
            <el-col :span="12">
              <div class="flex align-center grid-content ep-bg-purple">
                <img class="num-img" :src="item.icon" :alt="item.title">
                <div class="flex align-center space-between padding-lr-sm num-subtitle">
                  <div class="color-blue">{{ item.title }}</div>
                  <div class="Roboto seats-title">{{ item.value }}<span
                      class="font-size-sm color-54 ren margin-left-xs">{{ item.unit }}</span></div>
                </div>
              </div>
            </el-col>

            <div class="line" :class="index === 3 || index === 5 ? 'bg-tr' : ''"></div>

            <el-col :span="12" v-if="item.subtitle">
              <div class="flex align-center num-right grid-content ep-bg-purple padding-left-lg">
                <div class="color-blue">{{ item.subtitle }}：</div>
                <div class="seats-title" :class="item.subValue <= 0 ?'color-red':'color-green'">{{ item.subValue }}<span
                    class="font-size-sm color-54 ren margin-left-xs">{{ item.subUnit }}</span></div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 坐席人数弹窗 -->
    <div v-if="isModal" class="dialog d-t">
      <div class="dialog-bg">
        <div class="d-t  flex space-between align-center">

          <img class="d-t-b" src="../assets/img/hw-service.png" alt="">
          <div class="dialog-title common-title">坐席人数</div>
          <div class="d-t-c pointer" @click="closeD" @mouseenter="handleMouseEnter" @mouseleave="handleTMouseLeave"
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
            <el-table :data="currentHwData" stripe highlight-current-row fit style="width: 100%;">
              <el-table-column type="index" label="序号" width="150"></el-table-column>
              <el-table-column prop="agentId" label="坐席工号" width="200"></el-table-column>
              <el-table-column prop="agentName" label="姓名" width="152"></el-table-column>
              <el-table-column prop="extensionNumber" label="分机号" width="160"></el-table-column>
              <el-table-column prop="duration" label="持续时间" width="160"></el-table-column>
              <el-table-column prop="status" label="当前状态" width="150">
                <template #default="scope">
                  <el-text :type="getStatusType(scope.row.status, 'hw')">{{ scope.row.status }}</el-text>
                </template>
              </el-table-column>

            </el-table>

            <!-- 分页控制 -->
            <el-pagination class="margin-top" @size-change="handleHwSizeChange" @current-change="handleHwCurrentChange"
              :current-page="hwCurrentPage" :page-size="hwPageSize" layout="total, ->, pager, sizes, jumper, ->"
              :total="hwTotal"></el-pagination>
          </div>

        </div>
      </div>
    </div>
    <!-- 今日话务弹窗 -->
    <div v-if="isModalT" class="dialog">
      <div class="dialog-bg">
        <div class="d-t  flex space-between align-center">

          <img class="d-t-b" src="../assets/img/hw-service.png" alt="">
          <div class="dialog-title common-title">今日-{{ dTitle }}</div>
          <div class="d-t-c pointer" @click="closeD" @mouseenter="handleMouseEnter" @mouseleave="handleTMouseLeave"
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

          <div v-if="dTitle !== '话务满意量'" class="complaint-table-container">
            <el-table :data="currentTableData" stripe highlight-current-row height="450px" style="width: 100%">
              <el-table-column type="index" label="序号" width="60"></el-table-column>
              <el-table-column prop="callerNumber" label="主叫号码" width="130"></el-table-column>
              <el-table-column prop="receiverNumber" label="被叫号码" width="130"></el-table-column>
              <el-table-column prop="customerService" label="接待客服" width="120"></el-table-column>
              <el-table-column prop="extensionNumber" label="分机号码" width="120"></el-table-column>
              <el-table-column prop="queueDuration" label="排队时长" width="150"></el-table-column>
              <el-table-column prop="ringDuration" label="振铃时长" width="150"></el-table-column>
              <el-table-column prop="callDuration" label="通话时长" width="120"></el-table-column>
              <el-table-column prop="callTime" label="通话时间" width="120"></el-table-column>
              <el-table-column prop="hangUpTime" label="挂断时间" width="150"></el-table-column>
              <el-table-column prop="isRecording" label="是否录音" width="150">
                <template #default="scope">
                  <el-text :type="getStatusType(scope.row.isRecording)">{{ scope.row.isRecording
                  }}</el-text>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页控制 -->
            <el-pagination class="margin-top" @size-change="handleSizeChange" @current-change="handleCurrentChange"
              :current-page="currentPage" :page-size="pageSize" layout="total, ->, pager, sizes, jumper, ->"
              :total="total"></el-pagination>
          </div>
          <!-- 话务满意量 -->
          <div v-else class="complaint-table-container">
            <el-table :data="satisfactionTableData" stripe highlight-current-row fit style="width: 100%;"
              @resize="handleTableResize">
              <el-table-column type="index" label="序号" width="60"></el-table-column>
              <el-table-column prop="callType" label="呼叫类型" min-width="120"></el-table-column>
              <el-table-column prop="phoneNumber" label="电话号码" min-width="140"></el-table-column>
              <el-table-column prop="agentName" label="接待客服" min-width="100"></el-table-column>
              <el-table-column prop="extensionNumber" label="分机号码" min-width="100"></el-table-column>
              <el-table-column prop="callStartTime" label="呼叫时间" min-width="140"></el-table-column>
              <el-table-column prop="callEndTime" label="挂断时间" min-width="140"></el-table-column>
              <el-table-column prop="satisfactionLevel" label="满意度" min-width="100">
                <template #default="scope">
                  <div class="satisfaction-level">
                    <el-text :type="getStatusType(scope.row.satisfactionLevel, 'satisfaction')">
                      {{ scope.row.satisfactionLevel }}
                    </el-text>

                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="satisfactionScore" label="满意度打分" min-width="100">
                <template #default="scope">
                  <div class="star-rating">
                    <img v-for="i in 5" :key="i"
                      :src="i <= scope.row.satisfactionScore ? '../../src/assets/img/scoring-click.png' : '../../src/assets/img/scoring-icon.png'"
                      alt="评分星星" class="star-icon">
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页控制 -->

            <el-pagination class="margin-top" @size-change="handlePageSizeChange"
              @current-change="handleCurrentPageChange" :current-page="pagination.currentPage"
              :page-size="pagination.pageSize" layout="total, ->, pager, sizes, jumper, ->"
              :total="pagination.totalRecords"></el-pagination>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { get, post } from '../utils/request'; // 假设这是您的HTTP请求工具

import normalImg from '../assets/img/close-btn.png'
import hoverImg from '../assets/img/close-hover.png'
import clickImg from '../assets/img/close-click.png'

// 话务服务组件 - Vue3 JS格式
export default {
  name: 'TrafficService',

  // 组件配置
  setup() {
    // 状态管理
    const isHovered = ref(false);
    const isClicked = ref(false);
    const isModal = ref(false);
    const isModalT = ref(false);
    const dTitle = ref('');

    // 弹窗图片状态
    const normalImage = ref(normalImg);
    const hoverImage = ref(hoverImg);
    const clickImage = ref(clickImg);
    const currentImage = ref(normalImg);

    // 计算属性
    const hoverClass = computed(() => isHovered.value ? 'hoverBtn' : '');
    const clickClass = computed(() => isClicked.value ? 'clickBtn' : '');

    // 弹窗事件处理
    const handleMouseEnter = () => {
      currentImage.value = hoverImage.value;
    };

    const handleTMouseLeave = () => {
      currentImage.value = normalImage.value;
    };

    const handleMouseDown = () => {
      currentImage.value = clickImage.value;
    };

    const handleMouseUp = (event) => {
      const isMouseOver = event.relatedTarget?.closest('.d-t-c') !== null;
      currentImage.value = isMouseOver ? hoverImage.value : normalImage.value;
    };

    // 按钮事件处理
    const handleHover = () => {
      isHovered.value = true;
    };

    const handleMouseLeave = () => {
      isHovered.value = false;
    };

    const handleClick = () => {
      isClicked.value = !isClicked.value;
      showModal();
    };

    // 显示弹窗
    const showModal = (data) => {
      isModal.value = true;
    };

    // 显示今日话务弹窗
    const showTModal = (data) => {
      isModalT.value = true;
      dTitle.value = data;
    };

    // 关闭弹窗
    const closeD = () => {
      isModal.value = false;
      isModalT.value = false;
    };

    // 实时坐席数据
    const seatData = ref({
      agentOnCallCount: 0,
      agentBusyCount: 0,
      agentIdleCount: 0,
      agentOfflineCount: 0,
      agentCount: 0
    });

    // 辅助函数：生成晚于给定时间的随机时间
    const generateTimeAfter = (time) => {
      const [hours, minutes, seconds] = time.split(':').map(Number);
      let newHours = hours;
      let newMinutes = minutes + Math.floor(Math.random() * 10);
      let newSeconds = seconds + Math.floor(Math.random() * 30);

      if (newSeconds >= 60) {
        newMinutes += 1;
        newSeconds -= 60;
      }

      if (newMinutes >= 60) {
        newHours += 1;
        newMinutes -= 60;
      }

      return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
    };

    // 生成表格数据
    const generateQuestionTableData = () => {
      const data = [];
      const statusList = ['是', '否'];
      const customerServiceNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];
      const extensionNumbers = ['8001', '8002', '8003', '8004', '8005', '8006', '8007', '8008', '8009', '8010'];

      // 生成50条模拟数据
      for (let i = 1; i <= 50; i++) {
        // 随机生成电话号码
        const generatePhoneNumber = () => {
          return `1${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000 + 10000000)}`;
        };

        // 随机生成时间
        const generateTime = () => {
          const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
          const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
          const seconds = Math.floor(Math.random() * 60).toString().padStart(2, '0');
          return `${hours}:${minutes}:${seconds}`;
        };

        // 随机生成日期 (2025年7月)
        const generateDate = () => {
          const day = Math.floor(Math.random() * 30 + 1).toString().padStart(2, '0');
          return `2025-07-${day}`;
        };

        // 随机生成时长
        const generateDuration = () => {
          return `${Math.floor(Math.random() * 10)}分${Math.floor(Math.random() * 60)}秒`;
        };

        // 确保挂断时间晚于通话时间
        const callDate = generateDate();
        const callTime = generateTime();
        const hangUpTime = generateTimeAfter(callTime);

        data.push({
          id: i,
          callerNumber: generatePhoneNumber(), // 主叫号码
          receiverNumber: generatePhoneNumber(), // 被叫号码
          customerService: customerServiceNames[Math.floor(Math.random() * customerServiceNames.length)], // 接待客服
          extensionNumber: extensionNumbers[Math.floor(Math.random() * extensionNumbers.length)], // 分机号码
          queueDuration: generateDuration(), // 排队时长
          ringDuration: generateDuration(), // 振铃时长
          callDuration: generateDuration(), // 通话时长
          callTime: `${callDate} ${callTime}`, // 通话时间
          hangUpTime: `${callDate} ${hangUpTime}`, // 挂断时间
          isRecording: statusList[Math.floor(Math.random() * statusList.length)], // 是否录音
        });
      }

      return data;
    };

    // 数据和分页状态
    const tableData = ref(generateQuestionTableData());
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(tableData.value.length);

    // 计算当前页的数据
    const currentTableData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return tableData.value.slice(start, end);
    });

    // 状态类型映射 - 增加满意度相关的状态类型
    const getStatusType = (status, type = 'recording') => {
      if (type === 'recording') {
        return status === '是' ? 'success' : 'warning';
      } else if (type === 'hw') {
        const statusMap = {
          '在线': 'success',
          '示忙': 'warning',
          '示闲': 'primary',
          '离线': 'info',
          '通话中': 'success'
        };
        return statusMap[status] || 'default';
      }
      else if (type === 'satisfaction') {
        // 根据满意度级别返回不同的状态类型
        const satisfactionMap = {
          '非常满意': 'success',
          '满意': 'primary',
          '一般': 'info',
          '不满意': 'warning',
          '非常不满意': 'danger'
        };
        return satisfactionMap[status] || 'default';
      }
      return 'default';
    };

    // 分页事件处理
    const handleSizeChange = (newSize) => {
      console.log('page size changed to:', newSize);
      pageSize.value = newSize;
      currentPage.value = 1; // 重置到第一页
    };

    const handleCurrentChange = (newPage) => {
      console.log('current page changed to:', newPage);
      currentPage.value = newPage;
    };

    // 话务数据配置
    const trafficData = ref([
      {
        title: '来电数/话务量',
        unit: '个',
        icon: '../../src/assets/img/calls-icon.png',
        subtitle: '环比',
        subUnit: '%',
              },
      {
        title: '接听量',
        unit: '个',
        icon: '../../src/assets/img/answer-num-icon.png',
        subtitle: '接通率',
        subUnit: '%',
              },
      {
        title: '队列中',
        unit: '个',
        icon: '../../src/assets/img/line-icon.png',
        subtitle: '放弃率',
        subUnit: '%',
              },
      {
        title: '外呼量',
        unit: '个',
        icon: '../../src/assets/img/call-icon.png',
        subtitle: null
      },
      {
        title: '话务满意量',
        unit: '个',
        icon: '../../src/assets/img/satisfied-icon.png',
        subtitle: '满意度',
        subUnit: '%',
              },
      {
        title: '平均通话时长',
        unit: 'MIN',
        icon: '../../src/assets/img/average-icon.png',
        subtitle: null
      }
    ]);

    // 话务满意量数据处理
    // 原始数据（全部数据）
    const allTableData = ref([]);

    // 使用reactive对象封装分页相关数据
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      totalRecords: 20
    });

    // 计算属性：根据当前页码和每页数量筛选数据
    const satisfactionTableData = computed(() => {
      const start = (pagination.currentPage - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      return allTableData.value.slice(start, end);
    });

    // 生成虚拟数据（修改为生成更多数据以测试分页）
    const generateMockData = (count) => {
      const callTypes = ['投诉', '咨询', '建议', '售后', '售前'];
      const agents = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
      const satisfactionLevels = ['非常满意', '满意', '一般', '不满意', '非常不满意'];

      // 满意度级别对应的评分
      const satisfactionScores = {
        '非常满意': 5,
        '满意': 4,
        '一般': 3,
        '不满意': 2,
        '非常不满意': 1
      };

      return Array.from({ length: count }, (_, i) => {
        const startTime = new Date();
        startTime.setHours(9 + Math.floor(Math.random() * 8));
        startTime.setMinutes(Math.floor(Math.random() * 60));

        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + Math.floor(Math.random() * 30));

        // 随机选择满意度级别，并获取对应的评分
        const satisfactionLevel = satisfactionLevels[Math.floor(Math.random() * satisfactionLevels.length)];
        const satisfactionScore = satisfactionScores[satisfactionLevel];

        return {
          id: i + 1,
          callType: callTypes[Math.floor(Math.random() * callTypes.length)],
          phoneNumber: `13${Math.floor(Math.random() * 900000000 + 100000000)}`,
          agentName: agents[Math.floor(Math.random() * agents.length)],
          extensionNumber: `80${Math.floor(Math.random() * 900 + 100)}`,
          callStartTime: startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          callEndTime: endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          satisfactionLevel: satisfactionLevel,
          satisfactionScore: satisfactionScore
        };
      });
    };

    // 分页事件处理
    const handlePageSizeChange = (newSize) => {
      pagination.pageSize = newSize;
      pagination.currentPage = 1; // 重置页码
    };

    const handleCurrentPageChange = (newPage) => {
      pagination.currentPage = newPage;
    };

    // 表格自适应处理
    const tableContainerRef = ref(null);
    const containerWidth = ref(0);

    const handleWindowResize = () => {
      updateContainerWidth();
    };

    const updateContainerWidth = () => {
      if (tableContainerRef.value) {
        containerWidth.value = tableContainerRef.value.clientWidth;
      }
    };

    const handleTableResize = () => {
      updateContainerWidth();
    };
   
    // 实时坐席数据
    const hwCurrentPage = ref(1);
    const hwPageSize = ref(10);
    const hwTotal = ref(0);

    // 生成50条模拟数据
    const generateHwData = () => {
      const statusList = ['在线', '示忙', '示闲', '离线', '通话中'];
      const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];

      return Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        agentId: `AGT${1000 + i + 1}`,
        agentName: names[Math.floor(Math.random() * names.length)],
        extensionNumber: `80${Math.floor(Math.random() * 900 + 100)}`,
        duration: `${Math.floor(Math.random() * 60)}分${Math.floor(Math.random() * 60)}秒`,
        status: statusList[Math.floor(Math.random() * statusList.length)]
      }));
    };

    const hwData = ref(generateHwData());
    hwTotal.value = hwData.value.length;

    // 计算当前页数据
    const currentHwData = computed(() => {
      const start = (hwCurrentPage.value - 1) * hwPageSize.value;
      const end = start + hwPageSize.value;
      return hwData.value.slice(start, end);
    });

    // 分页事件处理（添加hw前缀）
    const handleHwSizeChange = (newSize) => {
      hwPageSize.value = newSize;
      hwCurrentPage.value = 1; // 重置到第一页
    };

    const handleHwCurrentChange = (newPage) => {
      hwCurrentPage.value = newPage;
    };


    // 获取今日话务数据
    const getTodayData = async () => {
      try {
        const response = await get('/shenyang-report/screen/today-call');
        trafficData.value[0].value = response.data.callInCount;
        trafficData.value[0].subValue = response.data.callInCountDayToDay;
        trafficData.value[1].value = response.data.callInAnswerCount;
        trafficData.value[1].subValue = response.data.callInAnswerRate;
        trafficData.value[2].value = response.data.inqueueCount;
        trafficData.value[2].subValue = response.data.giveUpRate;
        trafficData.value[3].value = response.data.callOutCount;
        trafficData.value[4].value = response.data.callInSatisfactionCount;
        trafficData.value[4].subValue = response.data.callInSatisfactionRate;
        trafficData.value[5].value = response.data.callInTalkdurationAvg;
       } catch (error) {
        console.error('获取今日话务数据失败', error);
      }
    };

    // 获取坐席数据
    const getAgentData = async () => {
      try {
        const response = await get('/shenyang-report/screen/realtime-agent');
        seatData.value = response.data;
      } catch (error) {
        console.error('获取坐席数据失败', error);
      }
    };

    // 生命周期钩子 - 组件挂载后执行
    onMounted(() => {
      getTodayData();
      getAgentData();
      
      // 获取今日话务满意量数据
      const mockData = generateMockData(50); // 生成50条数据测试分页
      allTableData.value = mockData;
      pagination.totalRecords = mockData.length;
      
      // 使用nextTick确保DOM已完全渲染
      nextTick(() => {
        updateContainerWidth();
        window.addEventListener('resize', handleWindowResize);
      });
    });

    // 生命周期钩子 - 组件卸载前清理
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleWindowResize);
    });

    // 返回所有需要在模板中使用的变量和方法
    return {
      isHovered,
      getTodayData,
      getAgentData,
      showModal,
      showTModal,
      isModal,
      isModalT,
      isClicked,
      hoverClass,
      clickClass,
      handleHover,
      handleMouseLeave,
      handleClick,
      seatData,
      trafficData,
      dTitle,
      currentImage,
      normalImage,
      hoverImage,
      clickImage,
      tableData,
      currentPage,
      pageSize,
      total,
      currentTableData,
      getStatusType,
      handleSizeChange,
      handleCurrentChange,
      handleTMouseLeave,
      handleMouseEnter,
      handleMouseDown,
      handleMouseUp,
      closeD,
      // 话务满意量相关
      satisfactionTableData,
      pagination,
      handlePageSizeChange,
      handleCurrentPageChange,
      // 表格自适应相关
      tableContainerRef,
      containerWidth,
      handleTableResize,
      // 坐席人数相关
      currentHwData,
      hwCurrentPage,
      hwPageSize,
      hwTotal,
      handleHwSizeChange,
      handleHwCurrentChange
    };
  }
};
</script>

<style scoped>
/* 话务 */
.traffic {}

.traffic-bg {
  background-image: url('../../src/assets/img/huawu.png');
  background-size: 100% 41px;
  margin-top: 77px;
  height: 41px;
}

.traffic-title {
  height: 21px;
  padding-bottom: 10px;
}

.traffic-bg img {
  width: 152px;
  height: 52px;
}

/* 实时坐席 */
.traffic-subtitle {}

.seats-bg {
  padding: 0 54px;
  /* seats-title-bg */
  background-image: url('../../src/assets/img/seats-title-bg.png');
  background-size: 100% 168px;
  height: 168px;
  background-repeat: no-repeat;
}

.seats-bg>div {
  height: 168px;
}

.seats-bg img {
  height: 79px;
  width: 72px;
}

.seats-title {
  font-family: D-DIN;
  font-weight: bold;
  font-size: 32px;
}

.ren {
  font-family: PingFang SC;
  font-weight: 400;
  line-height: 22px;
}

/* 坐席人数 按钮 */
.check-more {
  background-image: url('../../src/assets/img/check-btn.png');
}

.hoverBtn {
  background-image: url('../../src/assets/img/hover-btn.png');

}

.clickBtn {
  background-image: url('../../src/assets/img/click-btn.png');

}

/* 话务 */
.common-subtitle .num-calls:not(:first-child) {
  background-image: url('../../src/assets/img/answer.png');
  background-size: 98%;
  /* width: 741px; */
}

.common-subtitle>.margin-tb-sm {
  margin-bottom: 5px;
}

.d-t .dialog-bg {
  background-image: url('/src/assets/img/d-t-b.png');
  max-height: 665px;
  width: 1012px;
  height: 665px;
  margin: 10px 0;

}

.num-calls,
.num-calls:hover {
  background-image: url('../../src/assets/img/calls.png');
  height: 56px;
  position: relative;
  background-size: 100%;
  cursor: pointer;
}

.num-calls>div {
  height: 56px;
}

.num-img {
  width: 70px;
  height: 56px;
}

.num-calls .line {
  height: 40px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.num-subtitle {
  width: 100%;
}

.num-right {
  line-height: 56px;
}

.num-calls .seats-title {
  font-size: 28px;
}

.complaint-table-container {
  margin: 20px;
}

.star-icon {
  width: 16px;
  height: 16px;
}

.satisfaction-level {
  display: inline-flex;
  align-items: center;
}

.satisfaction-level .el-text {
  margin-right: 8px;
}
</style>