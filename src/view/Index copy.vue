<!-- src/components/index.vue -->
<template>
  <div id="index" class="">
    <div class="bg">
      <img src="../../src/assets/img/bg.png" alt="">

    </div>
    <div class="common-layout padding-lr-lg">
      <el-container>
        <!-- <el-header>Header</el-header> -->
        <!-- <el-container> -->
        <el-aside class="padding-tb-sm" width="800px">
          <div>
            <!-- 时间 -->
            <div class="flex align-center ">
              <div class="times Roboto">{{ formattedTime }}</div>
              <div class="line margin-left-sm"></div>

              <div class="font-size-sm color-blue   margin-lr-sm">
                <div>{{ formattedDate }}</div>
                <div>{{ weekDay }}</div>
              </div>

            </div>
            <!-- 话务服务 -->
            <TrafficService />
            <!-- 停水公告 -->
            <Announcement />

          </div>

        </el-aside>
        <!-- 中间 -->
        <el-main class="main-title">
          <Main />
          <div class="main-icon" @click="">
            <img src="./assets/img/charts-icon.png" alt="">
            <div class="charts-h-i">
              <img src="./assets/img/charts-h-icon.png" alt="">
              <div class="color-blue">888888</div>
            </div>
          </div>
        </el-main>
        <el-aside class="padding-top" width="800px">
          <!-- 全屏 -->
          <div class="flex-end font-size-sl color-blue flex align-center"><img class="margin-right-xs"
              src="./assets/img/full.png" alt="">全屏</div>
          <!-- 工单服务 -->
          <OrderService />
          <!-- 问题板块 -->
          <Question />
          <!-- 服务评分排名 -->
          <Score />
        </el-aside>
      </el-container>
      <!-- </el-container> -->
    </div>
    <!-- 弹框 -->
     <!-- 弹窗 -->
     <div v-if="isModal" class="dialog">
            <div class="dialog-bg">
                <div class="d-t  flex space-between align-center">

                    <img class="d-t-b" src="../assets/img/question.png" alt="">
                    <div class="dialog-title common-title">本年-客诉总量 康平</div>
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
                    <el-row class="row-bg margin-top" :gutter="20">
                        <el-col :span="4" :offset="1" @click="showTModal" v-for="item in dialogData" :key="item.type"
                            class="flex space-between q-d-b align-center pointer padding-top-xs margin-bottom-sm  col-five"
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

               
                    <div class="d-n flex align-center space-between">
                        <div class="common-title q-d-name">康平</div>
                        <div class="font-size-sm po color-white">
                            <div class="common-btn  check-more" @click="handleClick">
                                返回
                            </div>
                        </div>
                    </div>
                    <div class="complaint-table-container">
                        <el-table :data="currentTableData" stripe highlight-current-row height="450px" style="width: 100%">
                            <el-table-column type="index" label="序号" width="60">
                            </el-table-column>

                            <el-table-column prop="status" label="状态" width="150">
                                <template #default="scope">
                                    <el-text :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-text>
                                </template>
                            </el-table-column>

                            <el-table-column prop="complaintId" label="客诉单号" width="150">
                            </el-table-column>

                            <el-table-column prop="address" label="发生地址" width="150">
                            </el-table-column>

                            <el-table-column prop="problemCategory" label="问题板块" width="120">
                            </el-table-column>

                            <el-table-column prop="problemType" label="反映类型" width="120">
                            </el-table-column>

                            <el-table-column prop="source" label="反映来源" width="120">
                            </el-table-column>

                            <el-table-column prop="reason" label="问题原因" width="150">
                            </el-table-column>

                            <el-table-column prop="handlingUnit" label="处理单位" width="150">
                            </el-table-column>

                            <el-table-column prop="phoneNumber" label="来电号码" width="130">
                            </el-table-column>

                            <el-table-column prop="contactPhone" label="联系电话" width="130">
                            </el-table-column>

                            <el-table-column prop="visitResult" label="回访结果" width="120">
                                <template #default="scope">
                                    <el-text :type="getStatusType(scope.row.visitResult)">{{ scope.row.visitResult }}</el-text>
                                </template>
                            </el-table-column>

                            <el-table-column prop="visitMethod" label="回访方式" width="120">
                            </el-table-column>
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
import TrafficService from './components/TrafficService.vue';
import Announcement from './components/Announcement.vue';
import Main from './components/MainContent.vue';
import OrderService from './components/OrderService.vue';
import Question from './components/Question.vue';
import Score from './components/Score.vue';

export default {
  name: 'Index',
  components: {
    TrafficService,
    Announcement,
    Main,
    OrderService,
    Question,
    Score
  },
  data() {
    return {
      currentDate: new Date(),
    };
  },
  computed: {
    formattedDate() {
      const year = this.currentDate.getFullYear();
      const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.currentDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    formattedTime() {
      const hours = String(this.currentDate.getHours()).padStart(2, '0');
      const minutes = String(this.currentDate.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    weekDay() {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      return `星期${days[this.currentDate.getDay()]}`;
    },
  },

};
</script>

<style scoped>
#index {
  font-size: 24px;
  color: white;
  text-align: center;

}

.bg {
  width: 100vh;
  height: 100%;
  position: relative;
}

.common-layout {
  position: absolute;
  top: 0;
}

.times {
  font-size: 42px;
}

.main-title {
  margin: 0 !important;
  padding: 0 !important;
  position: relative;
}</style>
