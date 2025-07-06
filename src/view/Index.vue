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

        </el-main>
        <el-aside class="padding-top" style="overflow: hidden;" width="800px">
          <!-- 全屏 -->
          <div class="flex-end font-size-sl color-blue pointer flex align-center"><img class="margin-right-xs"
              src="../assets/img/full.png" alt="">全屏</div>
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

  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue';
import TrafficService from '../components/TrafficService.vue';
import Announcement from '../components/Announcement.vue';
import Main from '../components/MainContent.vue';
import OrderService from '../components/OrderService.vue';
import Question from '../components/Question.vue';
import Score from '../components/Score.vue';



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
  setup() {
    const loginForm = ref({
      jobNo: 'zhf012',
      systemCode: 'HOTLINE'
    })

    const handleLogin = async () => {
      try {
        const { data } = await getToken(loginForm.value)
        console.log('data', data)
        localStorage.setItem('token', data.token)
        ElMessage.success('登录成功')
      } catch (error) {
        console.error('登录失败', error)
      }
    }
    // 日期时间计算
    const currentDate = ref(new Date());

    const formattedDate = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = String(currentDate.value.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    const formattedTime = computed(() => {
      const hours = String(currentDate.value.getHours()).padStart(2, '0');
      const minutes = String(currentDate.value.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    const weekDay = computed(() => {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      return `星期${days[currentDate.value.getDay()]}`;
    });



    onMounted (() => {
      // handleLogin()
    })

    // 返回所有数据和方法
    return {
      formattedDate,
      formattedTime,
      weekDay,
    };
  }
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
  height: 1248px; /* 设置明确的高度 */
}
</style>
