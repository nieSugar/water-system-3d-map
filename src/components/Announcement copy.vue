<template>
  <div class="announcement common">
      <div class="announcement-bg common-bg text-left">
          <div class="announcement-title common-title padding-left-xll">停水公告</div>
          <img src="../../src/assets/img/announcement-service.png" alt="公告服务图标">
      </div>
      <!-- 停水公告列表 -->
      <div class="overflow-hidden" ref="scrollContainer">
          <div v-if="displayData.length" class="scroll-wrapper" ref="scrollWrapper">
              <div 
                  v-for="(item, index) in displayData" 
                  :key="index" 
                  class="margin-top-sm font-size-df flex align-center"
                  :class="['an-con', hoverClass(index), { 'active': activeIndex === index }]" 
                  @mouseenter="handleHover(index)"
                  @mouseleave="handleMouseLeave(index)"
              >
                  <div :class="hoverTitle(index)" class="an-title">紧急停水</div>
                  <div class="an-right flex space-between align-center">
                      <div class="text-left">
                          <div :class="colorClass(index)" class="an-subTitle font-size-lg">{{ item.title }}</div>
                          <div class="color-6c">{{ item.location }}</div>
                          <div class="color-6c">{{ item.time }}</div>
                      </div>
                      <div class="font-size-sm" :class="hoverTitle(index)">
                          <div 
                              :class="['common-btn', 'check-more', hoverBtnClass(index), clickBtnClass(index)]"
                              @mouseenter="handleBtnHover(index)" 
                              @mouseleave="handleMouseBtnLeave(index)"
                              @click="handleBtnClick(index)"
                          >
                              查看详情
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      <!-- 详情弹窗 -->
      <div v-if="isDetailVisible" class="detail-modal">
          <div class="modal-content">
              <div class="modal-header">
                  <h3>{{ displayData[activeIndex].title }}</h3>
                  <button @click="handleDetailClose" class="close-btn">×</button>
              </div>
              <div class="modal-body">
                  <p><strong>地点:</strong> {{ displayData[activeIndex].location }}</p>
                  <p><strong>时间:</strong> {{ displayData[activeIndex].time }}</p>
                  <p><strong>详情:</strong> 此处显示停水的详细说明信息...</p>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';

export default {
  name: 'Announcement',

  setup() {
      const scrollContainer = ref(null);
      const scrollWrapper = ref(null);
      const activeIndex = ref(null);
      const isDetailVisible = ref(false);
      const displayData = ref([
          { title: '地沟跑水，我所关闸维修', location: '建华街北侧，大学西街南', time: '24-03-11 16:43:06至18:43:06' },
          { title: '紧急停水，维修中', location: '中央大街，南山路交汇处', time: '24-03-11 10:43:06至12:43:06' },
          { title: '管道破裂，紧急修复', location: '南湖街西段，新华路北', time: '24-03-10 14:00:00至16:00:00' },
          { title: '地沟跑水，我所关闸维修2222', location: '建华街北侧，大学西街南', time: '25-03-11 16:43:06至18:43:06' },
      ]);
      const currentIndex = ref(0);
      const timer = ref(null);
      const hoverState = reactive([]);
      const btnHoverState = reactive([]);
      const btnClickedState = reactive([]);
      const isScrolling = ref(true);
      const scrollHeight = ref(0);
      const itemHeight = ref(0);
      const containerHeight = ref(0);

      // 初始化状态
      displayData.value.forEach((_, index) => {
          hoverState[index] = false;
          btnHoverState[index] = false;
          btnClickedState[index] = false;
      });

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
          btnClickedState[index] = true;
          btnHoverState[index] = false;
      };

      const handleDetailClose = () => {
          isDetailVisible.value = false;
          activeIndex.value = null;
          // 重置所有按钮状态
          btnClickedState.forEach((_, i) => {
              btnClickedState[i] = false;
          });
          resumeScrolling();
      };

      // 滚动相关方法
      const startScrolling = () => {
          if (displayData.value.length <= 3) return; // 数据不足3条时不滚动
          
          timer.value = setInterval(() => {
              if (isScrolling.value && !isDetailVisible.value && scrollWrapper.value && scrollContainer.value) {
                  // 更新当前索引
                  currentIndex.value = (currentIndex.value + 1) % (displayData.value.length - 2);
                  
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
              itemHeight.value = scrollWrapper.value.children[0].offsetHeight + 10; // 加上margin-top
              containerHeight.value = itemHeight.value * 3; // 只显示3条消息的高度
              scrollContainer.value.style.height = `${containerHeight.value}px`;
          }
      };

      // 生命周期钩子
      onMounted(() => {
          // 只显示前3条数据并倒序排列
          // 改为显示全部数据但只显示3条高度
          // displayData.value = displayData.value.slice(0, 3).reverse();
          
          nextTick(() => {
              calculateDimensions();
              startScrolling();
          });
      });

      onUnmounted(() => {
          stopScrolling();
      });

      return {
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
          handleDetailClose,
          startScrolling,
          stopScrolling,
          resumeScrolling
      };
  }
};
</script>

<style scoped>
/* 停水公告 */
.announcement-bg {
  background-image: url('../../src/assets/img/huawu.png');
  background-size: 100% 41px;
  margin-top: 25px;
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

/* 详情弹窗样式 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body p {
  margin: 10px 0;
}
</style>    