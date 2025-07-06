<template>
  <div class="main" style="height: 100%;">
    <div class="main-title common-title">沈阳水务集团客服中心数字大屏</div>
    <div class="main-three">
      <Mid @region-click="handleRegionClick" :region-data="regionData"></Mid>
    </div>
    <div class="main-icon" @click="showModal">
      <img src="../assets/img/charts-icon.png" alt="">
      <div class="charts-h-i">
        <img src="../assets/img/charts-h-icon.png" alt="">
        <div class="color-blue">888888</div>
      </div>
    </div>
    <!-- 弹窗 -->
    <div v-if="isModal" class="dialog">
      <div class="dialog-bg">
        <div class="d-t  flex space-between align-center">
          <div class="d-t-b"></div>
          <!-- <img class="" src="../assets/img/question.png" alt=""> -->
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
            <el-col :span="4" v-for="item in dialogData" :key="item.type"
              class="flex space-between q-d-b align-center pointer padding-top-xs margin-bottom-sm  "
              style="position: relative;">

              <div class="text-left q-d-t margin-left-xs">
                <div class="color-blue font-size-df">{{ item.title }}</div>
                <div class="Roboto seats-title">
                  <span>{{ item.count }}</span>
                  <span class="font-size-sm color-54 ren margin-left-xs">件</span>
                </div>

              </div>
            </el-col>

          </el-row>



          <div class="complaint-table-container">
            <el-table :data="currentTableData" stripe highlight-current-row height="340px" style="width: 100%">
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
                  <el-text :type="getStatusType(scope.row.visitResult)">{{ scope.row.visitResult
                  }}</el-text>
                </template>
              </el-table-column>

              <el-table-column prop="visitMethod" label="回访方式" width="120">
              </el-table-column>
            </el-table>

            <!-- 分页控制 -->

            <el-pagination class="margin-top-sm" @size-change="handleSizeChange" @current-change="handleCurrentChange"
              :current-page="currentPage" :page-size="pageSize" layout="total,->,  pager,sizes, jumper,>-"
              :total="total">



            </el-pagination>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Mid from './MidComponent.vue'
import { get, post } from '../utils/request'; // 假设这是您的HTTP请求工具

import normalImg from '../assets/img/close-btn.png'
import hoverImg from '../assets/img/close-hover.png'
import clickImg from '../assets/img/close-click.png'
export default {
  name: 'Main',
  components: {
    Mid
  },
  setup() {
    const isModal = ref(false)

    const showModal = () => {
      isModal.value = true
      //   this.$refs.modal.openModal(); // 调用 Modal 组件的 openModal 方法
    }

    const regionData = ref({
      '康平县': { name: '康平县', complaints: '37485', percentage: '40.32' },
      '法库县': { name: '法库县', complaints: '28756', percentage: '32.15' },
      '新民市': { name: '新民市', complaints: '45123', percentage: '48.67' },
      '辽中区': { name: '辽中区', complaints: '31245', percentage: '35.89' },
      '于洪区': { name: '于洪区', complaints: '52341', percentage: '55.23' },
      '沈北新区': { name: '沈北新区', complaints: '29876', percentage: '33.45' },
      '大东区': { name: '大东区', complaints: '41567', percentage: '44.78' },
      '和平区': { name: '和平区', complaints: '38945', percentage: '42.11' },
      '苏家屯区': { name: '苏家屯区', complaints: '35678', percentage: '38.92' },
      '浑南区': { name: '浑南区', complaints: '47892', percentage: '51.34' },
      '沈河区': { name: '沈河区', complaints: '33456', percentage: '36.78' },
      '皇姑区': { name: '皇姑区', complaints: '39234', percentage: '43.21' },
      '铁西区': { name: '铁西区', complaints: '44567', percentage: '47.89' }
    })

    // 更新区域数据的方法
    const updateRegionData = (regionName, newData) => {
      regionData.value[regionName] = { ...regionData.value[regionName], ...newData }
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
    // 生成50条模拟数据
    // 生成50条模拟数据
    const generateTableData = () => {
      const data = [];
      const statusList = ['处理中', '处理完成', '处理中(已发单)', '已上报', '已回访', '已分派', '完工审核', '已结案', '暂存', '已核实', '已派遣'];
      const problemTypes = ['受诉类'];
      // const problemTypes = ['供水问题', '排水问题', '漏水问题', '营业问题', '工程问题', '服务问题'];
      const problemCategories = ['营业', '供水', '漏水', '排水', '工程', '服务'];
      // const problemCategories = ['水压不足', '下水道堵塞', '水管破裂', '缴费异常', '施工影响', '服务态度'];
      const sources = ['96681服务热线', '省12345', '人民网', '市12345', "'找茬'窗口",];
      const reasons = ['管道维修', '杂物堆积', '管道老化', '系统升级', '施工不当', '设备故障'];
      const handlingUnits = ['供水公司', '市政管理局', '营业所', '建设局', '服务中心', '维修队'];
      const visitMethods = ['电话回访', '现场回访', '线上回访', '邮件回访'];
      const visitResults = ['满意', '理解', '不满意'];
      const locations = [
        { city: '北京', district: '朝阳区' },
        { city: '上海', district: '浦东新区' },
        { city: '广州', district: '天河区' },
        { city: '深圳', district: '南山区' },
        { city: '杭州', district: '西湖区' },
        { city: '南京', district: '鼓楼区' },
        { city: '武汉', district: '武昌区' },
        { city: '成都', district: '锦江区' },
        { city: '重庆', district: '渝中区' },
        { city: '西安', district: '雁塔区' }
      ];
      const streets = ['建国路', '张江高科技园区', '珠江新城', '科技园', '文三路', '中山路', '淮海路', '光谷大道', '天府大道', '解放大道'];
      const contactPersons = ['张先生', '李女士', '王先生', '陈女士', '赵先生', '刘女士', '黄先生', '周女士', '吴先生', '郑女士'];

      for (let i = 1; i <= 50; i++) {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const street = streets[Math.floor(Math.random() * streets.length)];

        data.push({
          id: i,
          status: statusList[Math.floor(Math.random() * statusList.length)],
          complaintId: `COMP2023${String(i).padStart(3, '0')}`,
          address: `${location.city}市${location.district}${street}${Math.floor(Math.random() * 100) + 1}号`,
          problemType: problemTypes[Math.floor(Math.random() * problemTypes.length)],
          problemCategory: problemCategories[Math.floor(Math.random() * problemCategories.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          handlingUnit: `${location.district}${handlingUnits[Math.floor(Math.random() * handlingUnits.length)]}`,
          phoneNumber: `13${Math.floor(Math.random() * 900000000 + 100000000)}`,
          contactPhone: `13${Math.floor(Math.random() * 900000000 + 100000000)}`,
          visitResult: visitResults[Math.floor(Math.random() * visitResults.length)],
          visitMethod: visitMethods[Math.floor(Math.random() * visitMethods.length)],
          contactPerson: contactPersons[Math.floor(Math.random() * contactPersons.length)]
        });
      }

      return data;
    };

    // 初始化表格数据
    const tableData = ref(generateTableData());


    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(tableData.value.length);

    // 计算当前页的数据
    const currentTableData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return tableData.value.slice(start, end);
    });

    // 状态标签样式映射
    const getStatusType = (status) => {
      const statusMap = {
        '满意': 'success',
        '理解': 'primary',
        '不满意': 'danger',
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

    // 分页事件处理
    const handleSizeChange = (newSize) => {
      pageSize.value = newSize;
      currentPage.value = 1; // 重置到第一页
    };

    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage;
    };

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

    const handleRegionClick = (regionName) => {
      // 处理区域点击事件
      isModal.value = true;
      console.log(regionName);
    };

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

    }
    // 修复：添加 return 语句，使变量和方法可以在模板中使用
    return {
      showModal,
      isModal,
      seatData,
      regionData,
      updateRegionData,
      // 弹框
      dialogData,
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
      handleMouseEnter,
      handleRegionClick,
      handleMouseLeave,
      handleMouseDown,
      handleMouseUp,
      closeD,

    };
  }
} 
</script>
<style scoped>
.main-title {
  position: relative;
  width: 1440px;
  font-size: 44px;
  height: 52px;
}

.main-three {
  height: calc(100% - 52px);
}
</style>
